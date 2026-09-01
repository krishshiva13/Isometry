import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Sparkles, ExternalLink, Bookmark } from 'lucide-react';
import { factService } from '../../services/factService';
import { Fact, Category } from '../../types';
import { INITIAL_FACTS } from '../../seed';
import { normalizeImageUrl } from '../../lib/imageUtils';

interface EmbeddedRelatedCardProps {
  factId?: string;
  url?: string;
  title?: string;
  excerpt?: string;
  category?: Category | string;
  imageUrl?: string;
  styleVariant?: 'card' | 'callout' | 'compact';
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  history: { bg: 'bg-amber-500/10', text: 'text-amber-800', border: 'border-amber-500/20', badge: 'bg-amber-100 text-amber-900' },
  science: { bg: 'bg-cyan-500/10', text: 'text-cyan-800', border: 'border-cyan-500/20', badge: 'bg-cyan-100 text-cyan-900' },
  inventions: { bg: 'bg-emerald-500/10', text: 'text-emerald-800', border: 'border-emerald-500/20', badge: 'bg-emerald-100 text-emerald-900' },
  discoveries: { bg: 'bg-indigo-500/10', text: 'text-indigo-800', border: 'border-indigo-500/20', badge: 'bg-indigo-100 text-indigo-900' },
  birthdays: { bg: 'bg-rose-500/10', text: 'text-rose-800', border: 'border-rose-500/20', badge: 'bg-rose-100 text-rose-900' },
};

export const EmbeddedRelatedCard: React.FC<EmbeddedRelatedCardProps> = ({
  factId,
  url,
  title: initialTitle,
  excerpt: initialExcerpt,
  category: initialCategory = 'history',
  imageUrl: initialImageUrl,
  styleVariant = 'card'
}) => {
  const [loadedFact, setLoadedFact] = useState<Fact | null>(null);

  // Normalize target target ID
  let targetId = factId || '';
  if (!targetId && url) {
    const match = url.match(/\/fact\/([^/?#]+)/);
    if (match && match[1]) {
      targetId = match[1];
    }
  }

  useEffect(() => {
    let isMounted = true;
    if (targetId && (!initialTitle || !initialExcerpt || !initialImageUrl)) {
      // Look up locally first
      const local = INITIAL_FACTS.find(f => f.id === targetId);
      if (local) {
        if (isMounted) setLoadedFact(local);
      } else {
        // Look up via factService
        factService.getFactById(targetId).then(data => {
          if (isMounted && data) {
            setLoadedFact(data);
          }
        }).catch(() => {
          // ignore lookup errors
        });
      }
    }
    return () => {
      isMounted = false;
    };
  }, [targetId, initialTitle, initialExcerpt, initialImageUrl]);

  const displayTitle = initialTitle || loadedFact?.title || 'Related Exploration Story';
  const displayExcerpt = initialExcerpt || loadedFact?.excerpt || '';
  const displayCat = (initialCategory || loadedFact?.cat || 'history').toLowerCase();
  const displayImage = initialImageUrl || loadedFact?.imageUrl || '';
  const targetLink = targetId ? `/fact/${targetId}` : (url || '#');

  const catStyle = CATEGORY_COLORS[displayCat] || CATEGORY_COLORS.history;

  // 1. Compact Variant
  if (styleVariant === 'compact') {
    return (
      <div className="my-6 not-prose">
        <Link
          to={targetLink}
          className="group flex items-center justify-between gap-3 p-3.5 bg-paper2 hover:bg-gold/10 rounded-2xl border border-black/10 hover:border-gold/50 transition-all shadow-xs"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-gold/20 text-gold flex-shrink-0 text-xs font-serif font-black">
              📖
            </span>
            <div className="truncate">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gold mr-2">
                Related Post
              </span>
              <span className="text-sm font-bold text-ink group-hover:text-gold transition-colors truncate">
                {displayTitle}
              </span>
            </div>
          </div>
          <ArrowRight size={15} className="text-ink3 group-hover:text-gold group-hover:translate-x-1 transition-all flex-shrink-0" />
        </Link>
      </div>
    );
  }

  // 2. Editorial Callout Bar Variant
  if (styleVariant === 'callout') {
    return (
      <div className="my-8 not-prose">
        <div className="p-5 rounded-2xl bg-gradient-to-r from-paper2 via-paper3 to-paper2 border-l-4 border-gold border-y border-r border-black/5 shadow-xs space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-gold flex items-center gap-1">
                <span>📖</span> READ ALSO
              </span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${catStyle.badge}`}>
                {displayCat}
              </span>
            </div>
            <Link
              to={targetLink}
              className="text-xs font-bold text-ink hover:text-gold flex items-center gap-1 group"
            >
              <span>Read Story</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <h4 className="text-base sm:text-lg font-serif font-bold text-ink leading-snug">
            <Link to={targetLink} className="hover:text-gold transition-colors">
              {displayTitle}
            </Link>
          </h4>

          {displayExcerpt && (
            <p className="text-xs sm:text-sm text-ink2 leading-relaxed line-clamp-2">
              {displayExcerpt}
            </p>
          )}
        </div>
      </div>
    );
  }

  // 3. Full Magazine Card Variant (Default & Most Beautiful)
  return (
    <div className="my-8 sm:my-10 not-prose">
      <div className="group relative bg-white rounded-3xl border border-black/10 hover:border-gold/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
        {/* Subtle top accent gradient */}
        <div className="h-1.5 w-full bg-gradient-to-r from-gold via-amber-400 to-gold/40" />

        <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Thumbnail / Visual */}
          {displayImage ? (
            <div className="w-full sm:w-36 h-36 sm:h-28 rounded-2xl overflow-hidden bg-paper2 border border-black/5 flex-shrink-0 relative shadow-xs">
              <img
                src={normalizeImageUrl(displayImage)}
                alt={displayTitle}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as any).style.display = 'none';
                }}
              />
              <span className={`absolute top-2 left-2 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md backdrop-blur-md shadow-xs ${catStyle.badge}`}>
                {displayCat}
              </span>
            </div>
          ) : (
            <div className="w-full sm:w-32 h-28 rounded-2xl bg-paper2 border border-black/5 flex-shrink-0 flex flex-col items-center justify-center gap-1.5 text-center p-3">
              <span className="text-3xl">📖</span>
              <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${catStyle.badge}`}>
                {displayCat}
              </span>
            </div>
          )}

          {/* Details & Copy */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-widest text-gold">
                  <Sparkles size={12} />
                  <span>RECOMMENDED READ</span>
                </span>
                <span className="text-black/20 text-xs">•</span>
                <span className="text-[11px] text-ink3 font-medium flex items-center gap-1">
                  <BookOpen size={12} /> 4 min read
                </span>
              </div>
            </div>

            <h4 className="text-lg sm:text-xl font-serif font-black text-ink group-hover:text-gold transition-colors leading-snug">
              <Link to={targetLink}>
                {displayTitle}
              </Link>
            </h4>

            {displayExcerpt && (
              <p className="text-xs sm:text-sm text-ink2 leading-relaxed line-clamp-2">
                {displayExcerpt}
              </p>
            )}

            {/* Read Story CTA button */}
            <div className="pt-1 flex items-center justify-between gap-3">
              <Link
                to={targetLink}
                className="inline-flex items-center gap-2 px-4 py-2 bg-ink group-hover:bg-gold text-white group-hover:text-ink text-xs font-bold rounded-xl transition-all shadow-xs"
              >
                <span>Read Full Story</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <span className="text-[11px] text-ink3 italic font-sans hidden sm:inline">
                Curated related topic
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
