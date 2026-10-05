import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Compass, 
  SlidersHorizontal, 
  ArrowRight, 
  Bookmark, 
  Clock, 
  Check, 
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { Fact } from '../../types';
import { 
  userInteractionService, 
  TOPIC_PRESETS, 
  RecommendedArticle 
} from '../../services/userInteractionService';
import { bookmarkService } from '../../services/bookmarkService';
import { cn } from '../../lib/utils';

interface RecommendedForYouProps {
  facts: Fact[];
}

export const RecommendedForYou: React.FC<RecommendedForYouProps> = ({ facts }) => {
  const [recommendations, setRecommendations] = useState<RecommendedArticle[]>([]);
  const [favoriteTopics, setFavoriteTopics] = useState<string[]>([]);
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);
  const [savedBookmarkIds, setSavedBookmarkIds] = useState<Record<string, boolean>>({});

  // Load preferences and calculate recommendations
  const refreshRecommendations = () => {
    const topics = userInteractionService.getFavoriteTopics();
    setFavoriteTopics(topics);
    const recs = userInteractionService.getRecommendations(facts, undefined, 4);
    setRecommendations(recs);
  };

  useEffect(() => {
    refreshRecommendations();
  }, [facts]);

  const handleToggleTopic = (topicId: string) => {
    const updated = userInteractionService.toggleFavoriteTopic(topicId);
    setFavoriteTopics([...updated]);
    const recs = userInteractionService.getRecommendations(facts, undefined, 4);
    setRecommendations(recs);
  };

  const handleToggleBookmark = async (e: React.MouseEvent, fact: Fact) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (savedBookmarkIds[fact.id]) {
        await bookmarkService.removeBookmark(fact.id);
        setSavedBookmarkIds(prev => ({ ...prev, [fact.id]: false }));
      } else {
        await bookmarkService.addBookmark(fact);
        setSavedBookmarkIds(prev => ({ ...prev, [fact.id]: true }));
      }
    } catch (err) {
      console.warn('Bookmark toggle notice:', err);
    }
  };

  if (!facts || facts.length === 0 || recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-paper2 dark:bg-[#161720] border border-black/10 dark:border-white/10 rounded-[32px] p-6 sm:p-10 space-y-6 shadow-sm">
        
        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-black/10 dark:border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gold font-mono text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} className="text-gold animate-pulse" />
              <span>Personalized Reading Feed</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-ink dark:text-white">
              Recommended for You
            </h2>
            <p className="text-xs sm:text-sm text-ink3 dark:text-white/60">
              Curated based on your past reading history, bookmarks, and favorite topics
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              onClick={() => setIsCustomizing(!isCustomizing)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer",
                isCustomizing
                  ? "bg-gold text-black border-gold shadow-xs font-black"
                  : "bg-paper dark:bg-white/10 text-ink dark:text-white border-black/10 dark:border-white/10 hover:border-gold"
              )}
            >
              <SlidersHorizontal size={13} />
              <span>{isCustomizing ? 'Done Customizing' : 'Customize Topics'}</span>
            </button>

            <button
              onClick={refreshRecommendations}
              className="p-1.5 rounded-full bg-paper dark:bg-white/10 text-ink3 hover:text-ink dark:text-white/60 dark:hover:text-white border border-black/10 dark:border-white/10 transition-colors cursor-pointer"
              title="Refresh recommendations"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* ── TOPIC CUSTOMIZER DRAWER (WHEN OPEN) ── */}
        <AnimatePresence>
          {isCustomizing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-2xl bg-paper dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-ink3 dark:text-white/60">
                  <span>Select topics you want to see more often:</span>
                  <span className="text-[11px] text-gold font-bold">
                    {favoriteTopics.length} selected
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {TOPIC_PRESETS.map((preset) => {
                    const isSelected = favoriteTopics.includes(preset.id);
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleToggleTopic(preset.id)}
                        className={cn(
                          "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer",
                          isSelected
                            ? "bg-gold text-black border-gold shadow-xs font-black"
                            : "bg-paper2 dark:bg-white/10 text-ink2 dark:text-white/70 border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30"
                        )}
                      >
                        {isSelected && <Check size={12} className="stroke-[3]" />}
                        <span>{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 4-CARD RECOMMENDATION GRID ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {recommendations.map(({ fact, reason }, idx) => {
            const yearDisplay = fact.year < 0 ? `${Math.abs(fact.year)} BC` : fact.year;
            const isSaved = !!savedBookmarkIds[fact.id];

            return (
              <div
                key={fact.id || idx}
                className="bg-paper dark:bg-[#1f202b] border border-black/10 dark:border-white/10 rounded-2xl p-5 shadow-xs hover:-translate-y-1 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Reason Badge */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gold/15 text-amber-900 dark:text-gold-l border border-gold/20 truncate max-w-[170px]" title={reason}>
                      {reason}
                    </span>

                    <button
                      onClick={(e) => handleToggleBookmark(e, fact)}
                      className={cn(
                        "p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0",
                        isSaved
                          ? "bg-gold text-black border-gold"
                          : "bg-paper2 dark:bg-white/10 text-ink3 hover:text-ink dark:text-white/60 border-black/5 dark:border-white/10"
                      )}
                      title={isSaved ? "Remove bookmark" : "Save bookmark"}
                    >
                      <Bookmark size={13} className={isSaved ? "fill-current" : ""} />
                    </button>
                  </div>

                  {/* Category & Year */}
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-ink3 dark:text-white/60">
                    <span className={cn("uppercase text-[11px]", {
                      "text-coral": fact.cat === 'history',
                      "text-teal": fact.cat === 'science',
                      "text-gold": fact.cat === 'inventions',
                      "text-indigo": fact.cat === 'discoveries'
                    })}>
                      {fact.cat}
                    </span>
                    <span>•</span>
                    <span>{yearDisplay}</span>
                  </div>

                  {/* Title */}
                  <Link to={`/article/${fact.id}`} className="block">
                    <h3 className="font-serif font-bold text-ink dark:text-white text-base leading-snug group-hover:text-gold transition-colors line-clamp-2">
                      {fact.title}
                    </h3>
                  </Link>

                  {/* Excerpt */}
                  <p className="text-xs text-ink3 dark:text-white/70 line-clamp-3 leading-relaxed">
                    {fact.excerpt}
                  </p>
                </div>

                {/* Card Footer: Read time & link */}
                <div className="pt-4 mt-4 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-ink3 dark:text-white/50 text-[11px] flex items-center gap-1">
                    <Clock size={11} /> 3 min read
                  </span>

                  <Link
                    to={`/article/${fact.id}`}
                    className="font-bold text-gold hover:text-gold-l flex items-center gap-1 transition-colors"
                  >
                    <span>Read</span>
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
