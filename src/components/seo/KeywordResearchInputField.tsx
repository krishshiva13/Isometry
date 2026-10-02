import React, { useMemo, useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Wand2, 
  X, 
  Info, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  Zap,
  HelpCircle
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
  id?: string;
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
  suggestions = ['Fall of Berlin Wall', 'Chandrayaan 3', 'Penicillin Discovery', 'Wright Brothers'],
  id = 'seo-keyword-input'
}) => {
  const [showRulesDrawer, setShowRulesDrawer] = useState(false);
  const [showTips, setShowTips] = useState(false);

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
    <div className={cn("space-y-2.5", className)}>
      {/* Input container */}
      <div className="relative flex items-center">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-invalid={!validation.isValid && validation.status !== 'empty'}
          aria-describedby={`${id}-feedback`}
          className={cn(
            "w-full bg-paper2 dark:bg-[#121316] border rounded-xl pl-4 pr-28 py-2.5 text-xs sm:text-sm text-ink dark:text-white transition-all focus:outline-none shadow-xs",
            validation.status === 'empty' && "border-black/10 dark:border-white/10 focus:border-gold",
            validation.status === 'valid' && "border-emerald-500/70 dark:border-emerald-400/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
            validation.status === 'warning' && "border-amber-500/70 dark:border-amber-400/70 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20",
            validation.status === 'invalid' && "border-rose-500/80 dark:border-rose-400/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
          )}
        />

        {/* Right-aligned badges: Clear + Status Icon + Score Gauge / Word Counter */}
        <div className="absolute right-2.5 flex items-center gap-1.5 pointer-events-auto">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-ink3 hover:text-ink dark:text-white/40 dark:hover:text-white rounded-md transition-colors cursor-pointer"
              title="Clear input"
            >
              <X size={14} />
            </button>
          )}

          {/* Validation Status Indicator */}
          {validation.status === 'valid' && (
            <div className="flex items-center text-emerald-600 dark:text-emerald-400" title="Valid query format">
              <CheckCircle2 size={16} className="shrink-0" />
            </div>
          )}
          {validation.status === 'warning' && (
            <div className="flex items-center text-amber-500" title="Format suggestions available">
              <AlertTriangle size={16} className="shrink-0" />
            </div>
          )}
          {validation.status === 'invalid' && (
            <div className="flex items-center text-rose-500" title="Invalid format for search">
              <AlertCircle size={16} className="shrink-0" />
            </div>
          )}

          {/* Live Formatting Quality Score Badge */}
          {value.length > 0 && (
            <span 
              className={cn(
                "text-[10px] font-mono px-2 py-0.5 rounded-md font-bold tracking-tight shrink-0 hidden sm:inline-flex items-center gap-1",
                validation.score >= 80 
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-500/20" 
                  : validation.score >= 50
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-500/20"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-500/20"
              )}
              title={`Formatting Quality Score: ${validation.score}/100`}
            >
              <span>{validation.score}%</span>
            </span>
          )}

          {/* Word / Char Counter */}
          {value.length > 0 && (
            <span className={cn(
              "text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold shrink-0 hidden md:inline-block",
              validation.charCount > 80 
                ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300" 
                : "bg-black/5 dark:bg-white/10 text-ink3 dark:text-white/60"
            )}>
              {validation.wordCount}w
            </span>
          )}
        </div>
      </div>

      {/* Real-time Feedback Banner */}
      {validation.status !== 'empty' && (
        <div 
          id={`${id}-feedback`}
          role="status"
          aria-live="polite"
          className={cn(
            "p-3 rounded-xl text-xs space-y-2 transition-all animate-in fade-in duration-150 border",
            validation.status === 'valid' && "bg-emerald-50/80 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200 border-emerald-500/30",
            validation.status === 'warning' && "bg-amber-50/80 dark:bg-amber-950/20 text-amber-950 dark:text-amber-200 border-amber-500/30",
            validation.status === 'invalid' && "bg-rose-50/80 dark:bg-rose-950/20 text-rose-950 dark:text-rose-200 border-rose-500/30"
          )}
        >
          {/* Top Line: Status message & Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-grow min-w-0">
              {validation.status === 'valid' && (
                <Sparkles size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
              {validation.status === 'warning' && (
                <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              {validation.status === 'invalid' && (
                <AlertCircle size={15} className="text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              
              <span className="font-medium text-xs leading-relaxed">
                {validation.message}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Keyword Type Badge */}
              {validation.keywordType && (
                <span className={cn(
                  "text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 border",
                  validation.keywordType === 'Mid-Tail (Optimal)' && "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
                  validation.keywordType === 'Short-Tail' && "bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-500/30",
                  validation.keywordType === 'Long-Tail' && "bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-500/30"
                )}>
                  {validation.keywordType}
                </span>
              )}

              {/* Quick Auto-Clean / Auto-Format Button */}
              {validation.canAutoClean && (
                <button
                  type="button"
                  onClick={handleApplyClean}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-ink text-white dark:bg-white dark:text-black rounded-lg text-[11px] font-bold hover:bg-gold dark:hover:bg-gold hover:text-black transition-all shadow-xs cursor-pointer"
                  title={`Apply formatted query: "${validation.cleanedQuery}"`}
                >
                  <Wand2 size={12} className="text-gold dark:text-amber-600" />
                  <span>Auto-Format: "{validation.cleanedQuery}"</span>
                </button>
              )}

              {/* Toggle Live Rules Breakdown */}
              <button
                type="button"
                onClick={() => setShowRulesDrawer(!showRulesDrawer)}
                className="p-1 rounded-md text-ink3 hover:text-ink dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer"
                title={showRulesDrawer ? "Hide formatting checklist" : "Show formatting checklist"}
              >
                {showRulesDrawer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>

          {/* Additional Warnings list if multiple detected */}
          {validation.warnings.length > 1 && (
            <div className="pt-1.5 border-t border-black/5 dark:border-white/5 space-y-1">
              {validation.warnings.slice(1).map((w, i) => (
                <div key={i} className="text-[11px] flex items-center gap-1.5 opacity-80">
                  <span className="w-1 h-1 rounded-full bg-current shrink-0" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}

          {/* Interactive Rules Checklist (Collapsible or visible on warning/invalid) */}
          {showRulesDrawer && validation.rules && validation.rules.length > 0 && (
            <div className="pt-2 border-t border-black/5 dark:border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {validation.rules.map((rule) => (
                <div 
                  key={rule.id}
                  className={cn(
                    "flex items-center gap-2 p-1.5 rounded-lg text-[11px] border transition-all",
                    rule.passed 
                      ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20" 
                      : "bg-black/5 dark:bg-white/5 text-ink3 dark:text-white/60 border-black/5 dark:border-white/5"
                  )}
                >
                  {rule.passed ? (
                    <Check size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full border border-current shrink-0" />
                  )}
                  <span className="font-semibold truncate">{rule.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom Row: Quick Ideas Chips & Formatting Guidelines Link */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
        {showQuickSuggestions && suggestions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-ink3 dark:text-white/50">
            <span className="font-semibold">Quick ideas:</span>
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  onChange(s);
                  if (onSelectSuggestion) onSelectSuggestion(s);
                }}
                className="px-2 py-0.5 bg-paper2 dark:bg-white/5 hover:bg-gold/20 text-ink dark:text-white rounded-md border border-black/5 dark:border-white/5 transition-colors cursor-pointer text-[11px]"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowTips(!showTips)}
          className="text-[11px] font-semibold text-ink3 hover:text-ink dark:text-white/50 dark:hover:text-white flex items-center gap-1 transition-colors ml-auto cursor-pointer"
        >
          <HelpCircle size={12} />
          <span>{showTips ? 'Hide Formatting Tips' : 'Search Query Tips'}</span>
        </button>
      </div>

      {/* Formatting Tips Explainer Drawer */}
      {showTips && (
        <div className="p-3 bg-paper2 dark:bg-[#1a1b22] border border-black/10 dark:border-white/10 rounded-xl text-xs space-y-2 animate-in fade-in duration-200">
          <div className="font-bold text-ink dark:text-white flex items-center gap-1.5">
            <Sparkles size={13} className="text-gold" />
            <span>Google Search Formatting Best Practices</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-ink2 dark:text-white/70">
            <div className="space-y-1">
              <strong className="text-ink dark:text-white block">1. 2 to 5 words target:</strong>
              Mid-tail phrases have the highest search conversion rate and actionable Page 1 competition.
            </div>
            <div className="space-y-1">
              <strong className="text-ink dark:text-white block">2. Skip search syntax:</strong>
              Avoid punctuation, quotation marks, or search operators (<code className="bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">site:</code>, <code className="bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">intitle:</code>).
            </div>
            <div className="space-y-1">
              <strong className="text-ink dark:text-white block">3. Capitalize proper nouns:</strong>
              Entities like "Apollo 11", "James Webb", or "Berlin Wall" align with Google Knowledge Graph entities.
            </div>
            <div className="space-y-1">
              <strong className="text-ink dark:text-white block">4. Specify informational intent:</strong>
              Pair entities with intent modifiers like "discovery", "timeline", "inventions", or "facts".
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
