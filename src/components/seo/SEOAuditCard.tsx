import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  Target, 
  FileText, 
  Hash, 
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react';
import { SEOAuditReport } from '../../types';
import { cn } from '../../lib/utils';

interface SEOAuditCardProps {
  report: SEOAuditReport;
  onOpenResearcher?: () => void;
  className?: string;
}

export const SEOAuditCard: React.FC<SEOAuditCardProps> = ({
  report,
  onOpenResearcher,
  className
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'fail' | 'warning' | 'pass'>('all');
  const [expandedDetails, setExpandedDetails] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-700 bg-emerald-100 border-emerald-300';
    if (score >= 70) return 'text-blue-700 bg-blue-100 border-blue-300';
    if (score >= 50) return 'text-amber-700 bg-amber-100 border-amber-300';
    return 'text-rose-700 bg-rose-100 border-rose-300';
  };

  const getStrokeColor = (score: number) => {
    if (score >= 85) return '#059669'; // emerald-600
    if (score >= 70) return '#2563eb'; // blue-600
    if (score >= 50) return '#d97706'; // amber-600
    return '#e11d48'; // rose-600
  };

  const filteredChecks = report.checks.filter(c => {
    if (activeFilter === 'all') return true;
    return c.status === activeFilter;
  });

  const passCount = report.checks.filter(c => c.status === 'pass').length;
  const warningCount = report.checks.filter(c => c.status === 'warning').length;
  const failCount = report.checks.filter(c => c.status === 'fail').length;

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (report.overallScore / 100) * circumference;

  return (
    <div className={cn("bg-white dark:bg-[#1b1c22] border border-black/10 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6", className)}>
      {/* Header with Circular Score Gauge */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-black/5 dark:border-white/10 pb-6">
        <div className="flex items-center gap-5">
          {/* Gauge */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-black/5 dark:text-white/10"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={getStrokeColor(report.overallScore)}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black font-mono tracking-tight text-ink dark:text-white">
                {report.overallScore}
              </span>
              <span className="text-[9px] uppercase tracking-widest font-bold text-ink3 dark:text-white/50">
                / 100
              </span>
            </div>
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h3 className="font-serif font-black text-xl text-ink dark:text-white">
                Google Page 1 SEO Score
              </h3>
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", getScoreColor(report.overallScore))}>
                {report.rating}
              </span>
            </div>
            <p className="text-xs text-ink3 dark:text-white/60 leading-relaxed max-w-md">
              Evaluated against Google’s 12 core ranking signals: title front-loading, H2/H3 architecture, keyword density, E-E-A-T depth, and FAQ rich snippets.
            </p>
          </div>
        </div>

        {onOpenResearcher && (
          <button
            type="button"
            onClick={onOpenResearcher}
            className="flex items-center gap-2 px-4 py-2.5 bg-gold hover:bg-gold-l text-black font-bold text-xs rounded-xl shadow-xs transition-all shrink-0 hover:scale-102"
          >
            <Sparkles size={15} />
            <span>AI Keyword Researcher</span>
          </button>
        )}
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-paper2 dark:bg-black/30 border border-black/5 dark:border-white/5 text-center">
          <div className="text-xs font-mono font-bold text-ink dark:text-white">
            {report.wordCount} words
          </div>
          <div className="text-[10px] text-ink3 dark:text-white/50 uppercase tracking-wider font-semibold">
            Depth (~{report.readingTimeMinutes} min)
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-paper2 dark:bg-black/30 border border-black/5 dark:border-white/5 text-center">
          <div className="text-xs font-mono font-bold text-ink dark:text-white">
            {report.keywordDensity}%
          </div>
          <div className="text-[10px] text-ink3 dark:text-white/50 uppercase tracking-wider font-semibold">
            Keyword Density
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-paper2 dark:bg-black/30 border border-black/5 dark:border-white/5 text-center">
          <div className="text-xs font-mono font-bold text-ink dark:text-white">
            {report.headingsCount.h2} (H2) / {report.headingsCount.h3} (H3)
          </div>
          <div className="text-[10px] text-ink3 dark:text-white/50 uppercase tracking-wider font-semibold">
            Subheading Flow
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-paper2 dark:bg-black/30 border border-black/5 dark:border-white/5 text-center">
          <div className="text-xs font-mono font-bold text-emerald-700">
            {passCount} Pass / {failCount + warningCount} Needs Work
          </div>
          <div className="text-[10px] text-ink3 dark:text-white/50 uppercase tracking-wider font-semibold">
            Google Checklist
          </div>
        </div>
      </div>

      {/* Critical Fixes Alert Banner if any */}
      {report.criticalFixes.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 space-y-2">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
            <XCircle size={15} />
            <span>High-Impact Ranking Blockers ({report.criticalFixes.length})</span>
          </div>
          <ul className="space-y-1 pl-5 list-disc text-xs text-rose-900 dark:text-rose-200 leading-relaxed font-medium">
            {report.criticalFixes.map((fix, idx) => (
              <li key={idx}>{fix}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Checklist Filter Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-2 flex-wrap gap-2">
          <span className="text-xs font-bold text-ink dark:text-white uppercase tracking-wider">
            Ranking Factor Verification Details
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-bold transition-colors",
                activeFilter === 'all' ? "bg-ink text-white dark:bg-white dark:text-black" : "text-ink3 hover:text-ink"
              )}
            >
              All ({report.checks.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('fail')}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-bold transition-colors",
                activeFilter === 'fail' ? "bg-rose-600 text-white" : "text-rose-600 hover:bg-rose-50"
              )}
            >
              Fails ({failCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('warning')}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-bold transition-colors",
                activeFilter === 'warning' ? "bg-amber-600 text-white" : "text-amber-600 hover:bg-amber-50"
              )}
            >
              Warnings ({warningCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('pass')}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-bold transition-colors",
                activeFilter === 'pass' ? "bg-emerald-600 text-white" : "text-emerald-600 hover:bg-emerald-50"
              )}
            >
              Passed ({passCount})
            </button>
          </div>
        </div>

        {/* List of factors */}
        <div className="space-y-2.5">
          {filteredChecks.map((check) => (
            <div
              key={check.id}
              className="p-3.5 rounded-2xl bg-paper2 dark:bg-black/20 border border-black/5 dark:border-white/5 space-y-1.5 transition-all hover:border-black/15"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {check.status === 'pass' && <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />}
                  {check.status === 'warning' && <AlertTriangle size={16} className="text-amber-700 shrink-0" />}
                  {check.status === 'fail' && <XCircle size={16} className="text-rose-700 shrink-0" />}
                  <span className="text-xs font-bold text-ink dark:text-white">
                    {check.label}
                  </span>
                </div>
                <div className="text-[11px] font-mono font-bold text-ink3 dark:text-white/60 shrink-0">
                  {check.currentValue}
                </div>
              </div>

              <p className="text-xs text-ink2 dark:text-white/80 pl-6 leading-relaxed">
                {check.explanation}
              </p>

              <div className="pl-6 text-[11px] text-ink3 dark:text-white/50 font-mono flex items-center gap-1.5">
                <span className="font-semibold text-gold">Target:</span>
                <span>{check.recommendedValue}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
