import React, { useMemo } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Wand2, 
  X, 
  Info, 
  Search,
  Sparkles 
} from 'lucide-react';
import { validateKeywordQuery, KeywordValidationResult } from '../../services/seoService';
import { cn } from '../../lib/utils';

interface KeywordResearchInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
  showQuickSuggestions?: boolean;
  onSelectSuggestion?: (suggestion: string) => void;
  suggestions?: string[];
}

export const KeywordResearchInputField: React.FC<KeywordResearchInputFieldProps> = ({
  value,
  onChange,
  placeholder = 'e.g. Industrial Revolution, James Webb Telescope, Harappan Civilization',
  disabled = false,
  className,
  autoFocus = false,
  showQuickSuggestions = true,
  onSelectSuggestion,
  suggestions = ['Fall of Berlin Wall', 'Chandrayaan 3', 'Penicillin Discovery', 'Wright Brothers']
}) => {
  const validation: KeywordValidationResult = useMemo(() => {
    return validateKeywordQuery(value);
  }, [value]);

  const handleClear = () => {
    onChange('');
  };

  const handleApplyClean = () => {
    if (validation.cleanedQuery) {
      onChange(validation.cleanedQuery);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Input container */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cn(
            "w-full bg-paper2 dark:bg-[#121316] border rounded-xl pl-4 pr-24 py-2.5 text-xs sm:text-sm text-ink dark:text-white transition-all focus:outline-none",
            validation.status === 'empty' && "border-black/10 dark:border-white/10 focus:border-gold",
            validation.status === 'valid' && "border-emerald-500/60 dark:border-emerald-400/60 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30",
            validation.status === 'warning' && "border-amber-500/60 dark:border-amber-400/60 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30",
            validation.status === 'invalid' && "border-rose-500/70 dark:border-rose-400/70 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30"
          )}
        />

        {/* Right-aligned input badges (Clear + Status icon + char counter) */}
        <div className="absolute right-3 flex items-center gap-1.5 pointer-events-auto">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-ink3 hover:text-ink dark:text-white/40 dark:hover:text-white rounded-md transition-colors"
              title="Clear input"
            >
              <X size={14} />
            </button>
          )}

          {/* Validation Status Icon */}
          {validation.status === 'valid' && (
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          )}
          {validation.status === 'warning' && (
            <AlertTriangle size={16} className="text-amber-500 shrink-0" />
          )}
          {validation.status === 'invalid' && (
            <AlertCircle size={16} className="text-rose-500 shrink-0" />
          )}

          {/* Word / Char Counter */}
          {value.length > 0 && (
            <span className={cn(
              "text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold shrink-0 hidden sm:inline-block",
              validation.charCount > 80 
                ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300" 
                : "bg-black/5 dark:bg-white/10 text-ink3 dark:text-white/60"
            )}>
              {validation.wordCount}w • {validation.charCount}c
            </span>
          )}
        </div>
      </div>

      {/* Real-time Feedback Banner */}
      {validation.status !== 'empty' && (
        <div className={cn(
          "px-3 py-2 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 transition-all animate-in fade-in duration-150",
          validation.status === 'valid' && "bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 border border-emerald-500/20",
          validation.status === 'warning' && "bg-amber-500/10 text-amber-900 dark:text-amber-300 border border-amber-500/20",
          validation.status === 'invalid' && "bg-rose-500/10 text-rose-900 dark:text-rose-300 border border-rose-500/20"
        )}>
          <div className="flex items-center gap-2 flex-grow min-w-0">
            {validation.status === 'valid' && (
              <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            {validation.status === 'warning' && (
              <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
            )}
            {validation.status === 'invalid' && (
              <AlertCircle size={14} className="text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            
            <span className="truncate">{validation.message}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Keyword Type Badge */}
            {validation.keywordType && (
              <span className={cn(
                "text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0",
                validation.keywordType === 'Mid-Tail (Optimal)' && "bg-emerald-600/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30",
                validation.keywordType === 'Short-Tail' && "bg-blue-600/20 text-blue-800 dark:text-blue-300 border border-blue-500/30",
                validation.keywordType === 'Long-Tail' && "bg-purple-600/20 text-purple-800 dark:text-purple-300 border border-purple-500/30"
              )}>
                {validation.keywordType}
              </span>
            )}

            {/* Quick Auto-Clean Button */}
            {validation.canAutoClean && (
              <button
                type="button"
                onClick={handleApplyClean}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-ink text-white dark:bg-white dark:text-black rounded-lg text-[10px] font-bold hover:bg-gold dark:hover:bg-gold transition-colors shadow-2xs"
                title={`Clean query to: "${validation.cleanedQuery}"`}
              >
                <Wand2 size={11} />
                <span>Auto-Format: "{validation.cleanedQuery}"</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Ideas Chips */}
      {showQuickSuggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-ink3 dark:text-white/50 pt-0.5">
          <span className="font-semibold">Popular ideas:</span>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                onChange(s);
                if (onSelectSuggestion) onSelectSuggestion(s);
              }}
              className="px-2 py-0.5 bg-paper2 dark:bg-white/5 hover:bg-gold/20 text-ink dark:text-white rounded-md border border-black/5 dark:border-white/5 transition-colors cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
