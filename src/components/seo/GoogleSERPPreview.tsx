import React, { useState } from 'react';
import { Smartphone, Monitor, Globe, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface GoogleSERPPreviewProps {
  title: string;
  metaDescription: string;
  urlPath?: string;
  category?: string;
  focusKeyword?: string;
  faqs?: Array<{ question: string; answer: string }>;
  publishedDate?: string;
}

export const GoogleSERPPreview: React.FC<GoogleSERPPreviewProps> = ({
  title,
  metaDescription,
  urlPath = 'the-fall-of-the-berlin-wall',
  category = 'history',
  focusKeyword = '',
  faqs = [],
  publishedDate = 'Sept 4, 2026'
}) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('mobile');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  const displayTitle = (title || 'Untitled Post — FActHub').trim();
  const displayDesc = (metaDescription || 'Explore key facts, historical context, and comprehensive breakdown on FActHub.').trim();
  const slug = urlPath.replace(/^\//, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const displayUrl = `https://facthub.in › ${category.toLowerCase()} › ${slug}`;

  // Highlight focus keyword if present
  const renderHighlightedSnippet = (text: string, kw: string) => {
    if (!kw || !kw.trim()) return text;
    const regex = new RegExp(`(${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <strong key={i} className="font-bold text-gray-900 dark:text-gray-100">
          {part}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className="bg-white dark:bg-[#1f2128] border border-black/10 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-black/5 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white flex items-center gap-1.5">
            <Globe size={14} className="text-blue-500" />
            Google Search Results (SERP) Live Simulator
          </span>
        </div>

        {/* Device View Switcher */}
        <div className="flex items-center bg-paper2 dark:bg-black/30 p-1 rounded-xl border border-black/5 dark:border-white/10">
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all",
              device === 'mobile'
                ? "bg-white dark:bg-white/15 text-ink dark:text-white shadow-2xs"
                : "text-ink3 hover:text-ink dark:text-white/60"
            )}
          >
            <Smartphone size={13} />
            <span>Mobile</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all",
              device === 'desktop'
                ? "bg-white dark:bg-white/15 text-ink dark:text-white shadow-2xs"
                : "text-ink3 hover:text-ink dark:text-white/60"
            )}
          >
            <Monitor size={13} />
            <span>Desktop</span>
          </button>
        </div>
      </div>

      {/* Google Container Simulator */}
      <div className={cn(
        "p-4 sm:p-5 rounded-2xl bg-[#fafafa] dark:bg-[#17181c] border border-black/5 dark:border-white/5 transition-all font-sans",
        device === 'mobile' ? 'max-w-[420px] mx-auto shadow-md border-black/10' : 'w-full'
      )}>
        {/* SERP Header line */}
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-xs font-serif font-black text-black">
            F
          </div>
          <div className="flex flex-col leading-tight overflow-hidden">
            <div className="flex items-center gap-1 text-[12px] font-medium text-[#202124] dark:text-[#bdc1c6]">
              <span className="font-semibold">FActHub</span>
              <span className="text-[10px] text-gray-400">•</span>
              <span className="truncate text-gray-500 dark:text-gray-400">{displayUrl}</span>
            </div>
          </div>
        </div>

        {/* Title Tag */}
        <h3 className={cn(
          "font-medium leading-snug cursor-pointer hover:underline text-[#1a0dab] dark:text-[#8ab4f8] transition-colors line-clamp-2",
          device === 'mobile' ? 'text-[17px] mb-1.5' : 'text-[20px] mb-1'
        )}>
          {displayTitle}
        </h3>

        {/* Snippet / Meta Description */}
        <div className="text-[13px] sm:text-[14px] text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed">
          {publishedDate && (
            <span className="text-gray-500 dark:text-gray-400 text-xs mr-1.5 font-medium">
              {publishedDate} —
            </span>
          )}
          <span>{renderHighlightedSnippet(displayDesc, focusKeyword)}</span>
        </div>

        {/* Star Rating snippet simulation */}
        <div className="flex items-center gap-1.5 mt-2 pt-1 text-xs text-[#4d5156] dark:text-[#bdc1c6]">
          <div className="flex text-amber-500">
            <Star size={12} fill="currentColor" />
            <Star size={12} fill="currentColor" />
            <Star size={12} fill="currentColor" />
            <Star size={12} fill="currentColor" />
            <Star size={12} fill="currentColor" />
          </div>
          <span className="font-semibold text-xs text-gray-700 dark:text-gray-300">4.9</span>
          <span className="text-gray-400 text-[11px]">(Verified Educational Hub)</span>
        </div>

        {/* Google FAQ Rich Snippet Accordion Preview */}
        {faqs && faqs.length > 0 && (
          <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/10 space-y-2">
            <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center justify-between">
              <span>Google Rich FAQ Dropdowns</span>
              <span className="text-emerald-700 font-mono text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                Page 1 Rich Snippet Active
              </span>
            </div>
            {faqs.slice(0, 3).map((faq, fIdx) => (
              <div key={fIdx} className="border border-black/5 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-[#20232a]">
                <button
                  type="button"
                  onClick={() => setExpandedFaqIndex(expandedFaqIndex === fIdx ? null : fIdx)}
                  className="w-full flex items-center justify-between p-2.5 text-left text-xs font-semibold text-blue-800 dark:text-blue-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors gap-2"
                >
                  <span className="line-clamp-1">{faq.question}</span>
                  {expandedFaqIndex === fIdx ? <ChevronUp size={14} className="shrink-0" /> : <ChevronDown size={14} className="shrink-0" />}
                </button>
                {expandedFaqIndex === fIdx && (
                  <div className="p-2.5 text-xs text-[#4d5156] dark:text-[#bdc1c6] bg-paper2 dark:bg-black/20 border-t border-black/5 dark:border-white/5 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-ink3 dark:text-white/60 pt-1">
        <div>
          Title length: <strong className={cn(title.length >= 40 && title.length <= 60 ? "text-emerald-700 font-bold" : "text-amber-700 font-bold")}>{title.length}/60 chars</strong>
        </div>
        <div>
          Snippet length: <strong className={cn(metaDescription.length >= 130 && metaDescription.length <= 160 ? "text-emerald-700 font-bold" : "text-amber-700 font-bold")}>{metaDescription.length}/160 chars</strong>
        </div>
      </div>
    </div>
  );
};
