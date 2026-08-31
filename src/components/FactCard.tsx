import React, { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Share2, Bookmark, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { Fact } from '../types';
import { ShareCardModal } from './ShareCardModal';
import { recordFactRead } from './DailyGoalTracker';

interface FactCardProps {
  fact: Fact;
  index: number;
  onRead?: (fact: Fact) => void;
}

export const FactCard = memo(({ fact, index, onRead }: FactCardProps) => {
  const [isShareOpen, setIsShareOpen] = useState(false);

  const catColors: Record<string, string> = {
    history: 'coral',
    science: 'teal',
    inventions: 'gold',
    discoveries: 'indigo',
    birthdays: 'sage'
  };

  const colorKey = catColors[fact.cat] || 'ink';

  const handleCardClick = () => {
    recordFactRead();
    if (onRead) onRead(fact);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.04, 0.4) }}
        whileHover={{ y: -3 }}
        className="bg-white border border-black/10 rounded-fact shadow-fact overflow-hidden flex flex-col group transition-all"
      >
        <div className={cn("h-1 w-full bg-gradient-to-r", {
          "from-coral to-orange-400": fact.cat === 'history',
          "from-teal to-emerald-400": fact.cat === 'science',
          "from-gold to-gold-l": fact.cat === 'inventions',
          "from-indigo to-blue-400": fact.cat === 'discoveries',
          "from-sage to-green-400": fact.cat === 'birthdays'
        })} />
        
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className={cn("flex items-center gap-1.5 text-[0.7rem] font-bold tracking-wider uppercase", {
              "text-coral": fact.cat === 'history',
              "text-teal": fact.cat === 'science',
              "text-gold": fact.cat === 'inventions',
              "text-indigo": fact.cat === 'discoveries',
              "text-sage": fact.cat === 'birthdays'
            })}>
              <span className={cn("w-1.5 h-1.5 rounded-full", {
                "bg-coral": fact.cat === 'history',
                "bg-teal": fact.cat === 'science',
                "bg-gold": fact.cat === 'inventions',
                "bg-indigo": fact.cat === 'discoveries',
                "bg-sage": fact.cat === 'birthdays'
              })} />
              {fact.cat}
            </div>

            {/* Quick Share Card Trigger Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsShareOpen(true);
              }}
              className="p-1.5 rounded-lg text-ink3 hover:text-gold hover:bg-gold/10 transition-colors flex items-center gap-1 text-[11px] font-bold"
              title="Generate shareable image card"
            >
              <Share2 size={13} />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
          
          <Link
            to={`/article/${fact.id}`}
            onClick={handleCardClick}
            className="block group-hover:text-gold transition-colors"
          >
            <h3 className="font-serif font-bold text-lg text-ink leading-tight mb-2 group-hover:text-gold transition-colors">
              {fact.title}
            </h3>
          </Link>
          
          <p className="text-sm text-ink3 line-clamp-3 leading-relaxed flex-1">
            {fact.excerpt}
          </p>
        </div>

        <div className="px-5 py-3.5 border-t border-black/5 bg-paper/50 flex items-center justify-between">
          <span className="font-mono text-xs text-ink3">
            {fact.year < 0 ? `${Math.abs(fact.year)} BC` : fact.year}
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsShareOpen(true);
              }}
              className="text-xs font-bold text-ink3 hover:text-gold transition-colors flex items-center gap-1 sm:hidden"
            >
              <Share2 size={12} />
            </button>

            <Link 
              to={`/article/${fact.id}`}
              onClick={handleCardClick}
              className="text-xs font-bold text-gold flex items-center gap-1 hover:gap-2 transition-all"
            >
              <span>Read article</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Share Image Card Canvas Modal */}
      <ShareCardModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={fact.title}
        year={fact.year}
        category={fact.cat}
        excerpt={fact.excerpt}
        emoji={fact.emoji || '💡'}
      />
    </>
  );
});

FactCard.displayName = 'FactCard';
