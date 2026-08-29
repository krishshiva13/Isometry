import React, { useState } from 'react';
import { ImageOff, Sparkles, Edit3 } from 'lucide-react';
import { normalizeImageUrl } from '../../lib/imageUtils';
import { cn } from '../../lib/utils';

interface ArticleHeroImageProps {
  imageUrl?: string;
  imageAlt?: string;
  imageCredit?: string;
  title: string;
  category: string;
  emoji?: string;
  onEditClick?: () => void;
  isAdmin?: boolean;
}

export const ArticleHeroImage: React.FC<ArticleHeroImageProps> = ({
  imageUrl,
  imageAlt,
  imageCredit,
  title,
  category,
  emoji = '📚',
  onEditClick,
  isAdmin = false
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const cleanUrl = imageUrl ? normalizeImageUrl(imageUrl) : '';

  // If no URL or load error, render the rich category banner
  if (!cleanUrl || hasError) {
    return (
      <div className="space-y-2">
        <div
          className={cn(
            "w-full aspect-video rounded-2xl flex flex-col items-center justify-center relative overflow-hidden border border-black/5 shadow-inner transition-all",
            {
              "bg-coral-l text-coral": category === 'history',
              "bg-teal-l text-teal": category === 'science',
              "bg-gold-l/20 text-gold-d": category === 'inventions',
              "bg-indigo-l text-indigo-900": category === 'discoveries',
              "bg-paper2 text-ink2": !['history', 'science', 'inventions', 'discoveries'].includes(category)
            }
          )}
        >
          {/* Subtle background decorative shapes */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/30 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center max-w-lg space-y-3">
            <span className="text-5xl sm:text-6xl drop-shadow-sm select-none animate-bounce-subtle">
              {emoji}
            </span>
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/70 shadow-2xs">
                {category} Spotlight
              </span>
              <p className="font-serif font-black text-base sm:text-lg text-ink line-clamp-2 leading-snug pt-1">
                {title}
              </p>
            </div>

            {isAdmin && onEditClick && (
              <button
                type="button"
                onClick={onEditClick}
                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-ink text-xs font-bold shadow-xs transition-all hover:scale-105 border border-black/5"
              >
                <Edit3 size={13} className="text-coral" />
                <span>Add / Fix Cover Image</span>
              </button>
            )}
          </div>

          <div className="absolute bottom-0 right-0 p-4 opacity-40">
            <div className="bg-paper2 px-2.5 py-1 rounded border border-black/5 text-[0.6rem] font-mono">
              AD-ZONE 300x60
            </div>
          </div>
        </div>

        {cleanUrl && hasError && imageCredit && (
          <p className="text-right text-[11px] text-ink3 font-sans italic tracking-wide">
            Source: {imageCredit}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="w-full aspect-video rounded-2xl overflow-hidden relative shadow-lg group border border-black/5 bg-paper2">
        {/* Loading skeleton placeholder */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-paper3 animate-pulse flex items-center justify-center">
            <div className="flex items-center gap-2 text-xs font-bold text-ink3">
              <Sparkles size={14} className="animate-spin text-gold" />
              <span>Loading verified media...</span>
            </div>
          </div>
        )}

        <img
          src={cleanUrl}
          alt={imageAlt || title}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={cn(
            "w-full h-full object-cover group-hover:scale-103 transition-all duration-700",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          referrerPolicy="no-referrer"
        />

        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white font-mono text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
          Verified Media Accent
        </div>

        <div className="absolute bottom-0 right-0 p-4 opacity-50 pointer-events-none">
          <div className="bg-paper2/90 px-3 py-1 rounded border border-black/5 text-[0.6rem] font-mono backdrop-blur-xs">
            AD-ZONE 300x60
          </div>
        </div>
      </div>

      {imageCredit && (
        <p className="text-right text-[11px] text-ink3 font-sans italic tracking-wide">
          Image Source: {imageCredit}
        </p>
      )}
    </div>
  );
};
