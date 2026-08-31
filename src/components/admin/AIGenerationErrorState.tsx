import React from 'react';
import { AlertCircle, RefreshCw, Terminal, ArrowLeft, ShieldAlert } from 'lucide-react';

interface AIGenerationErrorStateProps {
  error: string;
  topic?: string;
  onRetry: () => void;
  onOpenDebugLogs?: () => void;
  onCancel?: () => void;
  isRetrying?: boolean;
}

export const AIGenerationErrorState: React.FC<AIGenerationErrorStateProps> = ({
  error,
  topic,
  onRetry,
  onOpenDebugLogs,
  onCancel,
  isRetrying = false
}) => {
  const isAuthError =
    error.toLowerCase().includes('permission') ||
    error.toLowerCase().includes('unauthorized') ||
    error.toLowerCase().includes('auth') ||
    error.toLowerCase().includes('403') ||
    error.toLowerCase().includes('401');

  const isQuotaError =
    error.toLowerCase().includes('quota') ||
    error.toLowerCase().includes('429') ||
    error.toLowerCase().includes('resource_exhausted');

  return (
    <div className="bg-white border border-rose-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in max-w-2xl mx-auto">
      
      {/* Icon & Title */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
          {isAuthError ? <ShieldAlert size={24} /> : <AlertCircle size={24} />}
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 font-mono">
            {isAuthError ? 'Permission / Security Error' : isQuotaError ? 'AI Model Quota Cooldown' : 'Generation Request Failure'}
          </span>
          <h3 className="text-lg font-serif font-black text-ink mt-0.5">
            Unable to Generate AI Draft
          </h3>
          {topic && (
            <p className="text-xs text-ink3 mt-0.5">
              Topic: <span className="font-semibold text-ink">"{topic}"</span>
            </p>
          )}
        </div>
      </div>

      {/* Error Message Box */}
      <div className="p-4 bg-rose-50 border border-rose-200/80 rounded-2xl text-xs text-rose-950 space-y-2">
        <div className="font-bold flex items-center gap-1.5">
          <AlertCircle size={14} className="text-rose-600" />
          <span>Diagnostic Reason:</span>
        </div>
        <p className="font-mono text-[11px] leading-relaxed bg-white/70 p-2.5 rounded-xl border border-rose-200 text-rose-900 break-words">
          {error}
        </p>
        <p className="text-[11px] text-rose-800 leading-normal">
          {isAuthError
            ? 'Ensure you are signed in as an administrator (krish02shiva@gmail.com). Firestore rules and server auth check your admin token.'
            : isQuotaError
            ? 'The Gemini model temporarily reached its queries-per-minute threshold. The backoff retry mechanism will seamlessly switch models.'
            : 'A transient network hiccup or search tool timeout occurred. You can retry with exponential backoff.'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 bg-paper2 hover:bg-black/5 text-ink text-xs font-bold rounded-xl border border-black/10 transition-all"
          >
            ← Back to Generator
          </button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {onOpenDebugLogs && (
            <button
              type="button"
              onClick={onOpenDebugLogs}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-ink text-white hover:bg-gold hover:text-ink text-xs font-bold rounded-xl transition-all"
            >
              <Terminal size={14} />
              <span>Open Debug Console</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-gold hover:bg-gold-l text-ink text-xs font-bold rounded-xl transition-all shadow-sm hover:scale-[1.02] disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRetrying ? "animate-spin" : ""} />
            <span>{isRetrying ? "Retrying with Backoff..." : "Retry Generation"}</span>
          </button>
        </div>
      </div>

    </div>
  );
};
