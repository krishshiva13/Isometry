import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Trash2, 
  Copy, 
  Check, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Search, 
  Filter, 
  RefreshCw,
  Clock,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { adminLogService, AdminLogEntry } from '../../services/adminLogService';
import { cn } from '../../lib/utils';

export const AdminDebugConsole: React.FC = () => {
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = adminLogService.subscribe((updatedLogs) => {
      setLogs(updatedLogs);
    });
    return unsubscribe;
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filterLevel !== 'all' && log.level !== filterLevel) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const corpus = `${log.category} ${log.message} ${log.endpoint || ''} ${JSON.stringify(log.details || '')}`.toLowerCase();
      return corpus.includes(q);
    }
    return true;
  });

  const handleCopyLogs = () => {
    const text = JSON.stringify(logs, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClear = () => {
    if (window.confirm('Clear all admin error & request debug logs?')) {
      adminLogService.clearLogs();
    }
  };

  const errorCount = logs.filter((l) => l.level === 'error').length;
  const warnCount = logs.filter((l) => l.level === 'warn').length;

  return (
    <div className="bg-ink text-white rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex flex-col h-full min-h-[480px]">
      
      {/* Console Header */}
      <div className="p-4 bg-black/40 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gold/20 text-gold flex items-center justify-center font-mono font-bold">
            <Terminal size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-mono text-white">FactHub Admin Diagnostics & Error Console</h3>
              <span className="text-[10px] bg-white/10 text-white/70 px-2 py-0.5 rounded-full font-mono">
                {logs.length} entries
              </span>
            </div>
            <p className="text-[11px] text-white/50">
              Live telemetry, API error captures, rate-limit monitors, and Firestore permission trackers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-mono font-bold rounded-xl transition-all"
            title="Copy all logs to clipboard as JSON"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copied ? 'Copied JSON' : 'Export Logs'}</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-white/50 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
            title="Clear all logs"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3 bg-white/5 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/5">
          {[
            { id: 'all', label: `All (${logs.length})` },
            { id: 'error', label: `Errors (${errorCount})`, color: 'text-rose-400' },
            { id: 'warn', label: `Warnings (${warnCount})`, color: 'text-amber-400' },
            { id: 'info', label: 'Info' },
            { id: 'success', label: 'Success', color: 'text-emerald-400' }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilterLevel(item.id)}
              className={cn(
                "px-2.5 py-1 rounded-lg font-bold transition-all",
                filterLevel === item.id
                  ? "bg-white/20 text-white shadow-xs"
                  : "text-white/50 hover:text-white hover:bg-white/5",
                item.color && filterLevel !== item.id && item.color
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by endpoint, status code, error..."
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-gold font-mono"
          />
        </div>
      </div>

      {/* Log Feed List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs max-h-[550px]">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const timeStr = new Date(log.timestamp).toLocaleTimeString();

            return (
              <div
                key={log.id}
                className={cn(
                  "rounded-xl p-3 border transition-all",
                  log.level === 'error' && "bg-rose-950/40 border-rose-500/30 text-rose-200",
                  log.level === 'warn' && "bg-amber-950/40 border-amber-500/30 text-amber-200",
                  log.level === 'info' && "bg-black/30 border-white/5 text-white/90",
                  log.level === 'success' && "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
                )}
              >
                <div
                  className="flex items-start justify-between gap-2 cursor-pointer select-none"
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5">
                      {log.level === 'error' && <AlertCircle size={14} className="text-rose-400" />}
                      {log.level === 'warn' && <AlertTriangle size={14} className="text-amber-400" />}
                      {log.level === 'info' && <Info size={14} className="text-sky-400" />}
                      {log.level === 'success' && <CheckCircle2 size={14} className="text-emerald-400" />}
                    </span>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/10 uppercase tracking-wider">
                          {log.category}
                        </span>
                        {log.statusCode && (
                          <span
                            className={cn(
                              "text-[10px] font-bold px-1.5 py-0.2 rounded",
                              log.statusCode >= 400 ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"
                            )}
                          >
                            HTTP {log.statusCode}
                          </span>
                        )}
                        {log.retryAttempt && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded">
                            Attempt #{log.retryAttempt}
                          </span>
                        )}
                        <span className="text-[10px] text-white/40">{timeStr}</span>
                      </div>

                      <div className="mt-1 font-sans text-xs font-medium text-white/90 leading-snug">
                        {log.message}
                      </div>

                      {log.endpoint && (
                        <div className="text-[10px] text-white/50 font-mono mt-0.5 truncate">
                          Endpoint: {log.endpoint}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-white/40 hover:text-white text-xs mt-0.5">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                </div>

                {/* Expanded Details JSON Block */}
                {isExpanded && log.details && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="text-[10px] text-white/50 uppercase font-bold mb-1">Details & Payload:</div>
                    <pre className="p-3 bg-black/60 rounded-lg text-[11px] text-white/80 overflow-x-auto max-h-48">
                      {typeof log.details === 'string'
                        ? log.details
                        : JSON.stringify(log.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 text-white/40 space-y-2">
            <Terminal size={28} className="mx-auto text-white/20" />
            <div className="text-sm font-bold">No logs found</div>
            <p className="text-xs text-white/30 max-w-xs mx-auto">
              API requests, autonomous scan results, rate-limit retries, and errors will stream here in real time.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
