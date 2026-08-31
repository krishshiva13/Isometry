import { adminLogService } from '../services/adminLogService';

export interface RetryProgress {
  attempt: number;
  maxRetries: number;
  delayMs: number;
  statusMessage: string;
  error?: string;
}

export interface BackoffOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  initialDelayMs?: number;
  onRetryProgress?: (progress: RetryProgress) => void;
  category?: string;
}

export type FetchWithBackoffOptions = RequestInit & BackoffOptions;

export async function fetchWithExponentialBackoff(
  url: string,
  optionsOrInit: FetchWithBackoffOptions = {},
  backoffConfig?: BackoffOptions
): Promise<Response> {
  const mergedOptions: FetchWithBackoffOptions = {
    ...optionsOrInit,
    ...(backoffConfig || {})
  };

  const {
    maxRetries = 3,
    baseDelayMs = mergedOptions.initialDelayMs || 1500,
    maxDelayMs = 8000,
    onRetryProgress,
    category = 'AI_API_REQUEST',
    ...fetchOptions
  } = mergedOptions;

  let lastError: any = null;
  let lastStatus: number | undefined = undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        adminLogService.logInfo(category, `Retrying request to ${url} (Attempt ${attempt + 1}/${maxRetries + 1})...`);
      }

      const response = await fetch(url, fetchOptions);
      lastStatus = response.status;

      // If successful, log and return response
      if (response.ok) {
        if (attempt > 0) {
          adminLogService.logSuccess(
            category,
            `Request to ${url} succeeded on retry attempt ${attempt + 1}/${maxRetries + 1}`,
            { status: response.status }
          );
        }
        return response;
      }

      // Check if status is retryable (429 Rate Limit/Quota, 503 Unavailable, 502 Bad Gateway, 504 Gateway Timeout)
      const isRetryable =
        response.status === 429 ||
        response.status === 503 ||
        response.status === 502 ||
        response.status === 504 ||
        response.status === 500;

      // Extract error text
      let errorBody = '';
      try {
        const cloned = response.clone();
        const json = await cloned.json();
        errorBody = json.error || json.message || JSON.stringify(json);
      } catch (e) {
        try {
          const cloned = response.clone();
          errorBody = await cloned.text();
        } catch (e2) {
          errorBody = `HTTP ${response.status} ${response.statusText}`;
        }
      }

      lastError = new Error(errorBody || `HTTP ${response.status}`);

      adminLogService.logWarn(
        category,
        `Request to ${url} returned status ${response.status} (Attempt ${attempt + 1}/${maxRetries + 1}): ${errorBody.substring(0, 150)}`,
        { statusCode: response.status, body: errorBody }
      );

      if (!isRetryable || attempt >= maxRetries) {
        adminLogService.logError(category, `Request to ${url} failed permanently (${response.status})`, errorBody, {
          endpoint: url,
          statusCode: response.status,
          retryAttempt: attempt + 1
        });
        return response; // Return response so caller can handle non-retryable status (e.g. 401, 403, 400)
      }

      // Calculate exponential backoff delay with jitter
      const exponential = baseDelayMs * Math.pow(2, attempt);
      const jitter = Math.random() * 500;
      const delayMs = Math.min(exponential + jitter, maxDelayMs);

      if (onRetryProgress) {
        onRetryProgress({
          attempt: attempt + 1,
          maxRetries,
          delayMs: Math.round(delayMs),
          statusMessage: `Temporary issue (${response.status === 429 ? 'Quota/Rate Limit' : 'Server Busy'}). Retrying in ${Math.round(delayMs / 1000)}s... (Attempt ${attempt + 1} of ${maxRetries})`,
          error: errorBody
        });
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    } catch (networkError: any) {
      lastError = networkError;
      adminLogService.logWarn(
        category,
        `Network exception calling ${url} (Attempt ${attempt + 1}/${maxRetries + 1}): ${networkError.message || networkError}`,
        { error: String(networkError) }
      );

      if (attempt >= maxRetries) {
        adminLogService.logError(
          category,
          `Network connection failed permanently for ${url} after ${maxRetries + 1} attempts`,
          networkError.message,
          { endpoint: url, retryAttempt: attempt + 1 }
        );
        throw networkError;
      }

      const delayMs = Math.min(baseDelayMs * Math.pow(2, attempt) + Math.random() * 400, maxDelayMs);
      if (onRetryProgress) {
        onRetryProgress({
          attempt: attempt + 1,
          maxRetries,
          delayMs: Math.round(delayMs),
          statusMessage: `Network connection hiccup. Retrying in ${Math.round(delayMs / 1000)}s... (Attempt ${attempt + 1} of ${maxRetries})`,
          error: networkError.message
        });
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError || new Error(`Failed request to ${url} after ${maxRetries + 1} attempts`);
}
