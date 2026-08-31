// Admin Debug & Error Logging Service for FactHub
export interface AdminLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  category: string;
  message: string;
  endpoint?: string;
  statusCode?: number;
  details?: any;
  retryAttempt?: number;
}

const STORAGE_KEY = 'facthub_admin_debug_logs';
const MAX_LOGS = 150;

class AdminLogService {
  private logs: AdminLogEntry[] = [];
  private listeners: Set<(logs: AdminLogEntry[]) => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.logs = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to parse cached admin logs', e);
      this.logs = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs.slice(0, MAX_LOGS)));
    } catch (e) {
      console.warn('Failed to save admin logs to storage', e);
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.logs]));
  }

  public subscribe(listener: (logs: AdminLogEntry[]) => void): () => void {
    this.listeners.add(listener);
    listener([...this.logs]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getLogs(): AdminLogEntry[] {
    return [...this.logs];
  }

  public addLog(entry: Omit<AdminLogEntry, 'id' | 'timestamp'>) {
    const newEntry: AdminLogEntry = {
      ...entry,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString()
    };

    this.logs.unshift(newEntry);
    if (this.logs.length > MAX_LOGS) {
      this.logs = this.logs.slice(0, MAX_LOGS);
    }

    this.saveToStorage();
    this.notify();
    return newEntry;
  }

  public log(
    level: 'info' | 'warn' | 'error' | 'success',
    category: string,
    message: string,
    details?: any,
    endpoint?: string,
    statusCode?: number
  ) {
    return this.addLog({
      level,
      category,
      message,
      details,
      endpoint,
      statusCode
    });
  }

  public logInfo(category: string, message: string, details?: any) {
    return this.addLog({ level: 'info', category, message, details });
  }

  public logSuccess(category: string, message: string, details?: any) {
    return this.addLog({ level: 'success', category, message, details });
  }

  public logWarn(category: string, message: string, details?: any) {
    return this.addLog({ level: 'warn', category, message, details });
  }

  public logError(
    category: string,
    message: string,
    errorDetails?: any,
    requestInfo?: { endpoint?: string; statusCode?: number; retryAttempt?: number }
  ) {
    return this.addLog({
      level: 'error',
      category,
      message,
      endpoint: requestInfo?.endpoint,
      statusCode: requestInfo?.statusCode,
      retryAttempt: requestInfo?.retryAttempt,
      details: errorDetails
    });
  }

  public clearLogs() {
    this.logs = [];
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    this.notify();
  }
}

export const adminLogService = new AdminLogService();
