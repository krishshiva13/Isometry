import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Sparkles, RotateCw, CheckCircle2, ArrowRight, ArrowLeft, Layers, BookOpen, Trophy, Filter, Brain, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Fact, Category } from '../types';
import { factService } from '../services/factService';
import { INITIAL_FACTS } from '../seed';
import { cn } from '../lib/utils';

export const Flashcards: React.FC = () => {
  const [cards, setCards] = useState<Fact[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [masteredCount, setMasteredCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    loadCards();
  }, [selectedCategory]);

  const loadCards = async () => {
    try {
      const fetched = await factService.getFacts(selectedCategory === 'all' ? undefined : selectedCategory, false, 50);
      let list = fetched && fetched.length > 0 ? fetched : INITIAL_FACTS;
      if (selectedCategory !== 'all') {
        list = list.filter(f => f.cat === selectedCategory);
      }
      setCards(list);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch {
      let list = INITIAL_FACTS;
      if (selectedCategory !== 'all') {
        list = list.filter(f => f.cat === selectedCategory);
      }
      setCards(list);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleRate = (rating: 'hard' | 'good' | 'easy') => {
    if (rating === 'easy') {
      setMasteredCount(prev => prev + 1);
    } else {
      setReviewCount(prev => prev + 1);
    }

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      // Completed round
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const currentCard = cards[currentIndex];

  const categories = [
    { id: 'all', label: 'All Topics', emoji: '🌟' },
    { id: 'history', label: 'History', emoji: '📜' },
    { id: 'science', label: 'Science', emoji: '🔬' },
    { id: 'inventions', label: 'Inventions', emoji: '💡' },
    { id: 'discoveries', label: 'Discoveries', emoji: '🔭' },
  ];

  return (
    <div className="min-h-screen bg-paper py-10 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Smart Flashcards (Spaced Repetition Review) | FActHub</title>
        <meta name="description" content="Master Day in History and Science GK with interactive Leitner 3D flip flashcards for rapid exam revision." />
      </Helmet>

      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-paper2 border border-black/10 rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/15 text-gold rounded-full text-xs font-bold uppercase tracking-wider">
            <Brain size={14} /> Active Recall Revision Mode
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-ink">Smart Historical Flashcards</h1>
          <p className="text-xs sm:text-sm text-ink3 max-w-lg mx-auto">
            Test your recall before flipping the card. Categorize cards by difficulty for spaced repetition memory consolidation.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5",
                  selectedCategory === c.id
                    ? "bg-ink text-paper shadow-sm"
                    : "bg-paper hover:bg-paper3 text-ink2 border border-black/10"
                )}
              >
                <span>{c.emoji}</span>
                <span>{c.label}</span>
              </button>
            ))}
            <button
              onClick={handleShuffle}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-paper hover:bg-gold/15 text-ink2 border border-black/10 flex items-center gap-1.5 transition-all"
              title="Shuffle Cards"
            >
              <Shuffle size={12} />
              <span>Shuffle</span>
            </button>
          </div>
        </div>

        {/* Progress & Stats Bar */}
        <div className="flex items-center justify-between px-2 text-xs text-ink3 font-mono">
          <span>Card {currentIndex + 1} of {cards.length}</span>
          <div className="flex items-center gap-3 font-bold">
            <span className="text-emerald-600">Mastered: {masteredCount}</span>
            <span className="text-amber-600">Review Queue: {reviewCount}</span>
          </div>
        </div>

        {/* Flashcard 3D Stage */}
        {currentCard ? (
          <div className="perspective-1000">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className={cn(
                "relative min-h-[380px] sm:min-h-[420px] rounded-3xl p-8 cursor-pointer transition-all duration-500 transform-gpu shadow-xl border select-none flex flex-col justify-between",
                isFlipped
                  ? "bg-gradient-to-br from-ink via-ink2 to-ink text-paper border-gold/30"
                  : "bg-paper2 border-black/10 hover:border-gold/50"
              )}
            >
              
              {/* Card Top Pill */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{currentCard.emoji || '💡'}</span>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full",
                    isFlipped ? "bg-gold/20 text-gold" : "bg-black/5 text-ink2"
                  )}>
                    {currentCard.cat.toUpperCase()} • YEAR {currentCard.year || 'EVENT'}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs opacity-75">
                  <RotateCw size={14} className={isFlipped ? "text-gold animate-spin" : "text-ink3"} />
                  <span className="text-[11px]">{isFlipped ? 'Answer Revealed' : 'Click to Flip'}</span>
                </div>
              </div>

              {/* Card Main Body Content */}
              <div className="my-auto py-6 text-center space-y-4">
                {!isFlipped ? (
                  /* FRONT: Clue / Question Prompt */
                  <div className="space-y-3">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-gold block">
                      [ Recall Prompt ]
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-black text-ink leading-snug">
                      What historic event occurred in {currentCard.year ? `the year ${currentCard.year}` : 'this milestone'} regarding:
                    </h2>
                    <p className="text-base sm:text-lg font-medium text-ink2 max-w-md mx-auto italic">
                      "{currentCard.title}"
                    </p>
                  </div>
                ) : (
                  /* BACK: Detailed Explanation & Exam Notes */
                  <div className="space-y-4 text-left max-w-xl mx-auto">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-gold block text-center">
                      [ Verified Facts & Takeaways ]
                    </span>
                    <h2 className="text-lg sm:text-xl font-serif font-bold text-white leading-snug text-center">
                      {currentCard.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-paper2 leading-relaxed">
                      {currentCard.excerpt}
                    </p>

                    {currentCard.examRelevance && (
                      <div className="p-3 rounded-xl bg-white/10 border border-white/10 text-xs text-gold">
                        <span className="font-bold text-white block mb-0.5">⭐ Exam Relevance:</span>
                        {currentCard.examRelevance}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Hint */}
              <div className="text-center pt-2 border-t border-black/5">
                <span className={cn(
                  "text-[11px] font-medium",
                  isFlipped ? "text-paper3" : "text-ink3"
                )}>
                  {isFlipped ? 'Rate your recall below to advance' : 'Tap anywhere on the card to flip'}
                </span>
              </div>

            </div>
          </div>
        ) : null}

        {/* Leitner Spaced Repetition Buttons */}
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3 pt-2"
          >
            <button
              onClick={() => handleRate('hard')}
              className="p-3.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 text-xs font-bold transition-all flex flex-col items-center gap-1 shadow-xs"
            >
              <span>🔴 Hard</span>
              <span className="text-[10px] text-red-700 font-normal">Repeat Soon</span>
            </button>

            <button
              onClick={() => handleRate('good')}
              className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all flex flex-col items-center gap-1 shadow-xs"
            >
              <span>🟡 Good</span>
              <span className="text-[10px] text-amber-700 font-normal">Remembered Well</span>
            </button>

            <button
              onClick={() => handleRate('easy')}
              className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition-all flex flex-col items-center gap-1 shadow-xs"
            >
              <span>🟢 Easy</span>
              <span className="text-[10px] text-emerald-700 font-normal">Mastered</span>
            </button>
          </motion.div>
        )}

        {/* Navigation Steppers */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-paper2 border border-black/10 text-xs font-bold text-ink hover:bg-paper3 disabled:opacity-30 transition-all"
          >
            <ArrowLeft size={14} />
            <span>Previous Card</span>
          </button>

          {currentCard && (
            <Link
              to={`/article/${currentCard.id}`}
              className="text-xs font-bold text-gold hover:underline flex items-center gap-1"
            >
              <BookOpen size={14} />
              <span>Read Full Article</span>
            </Link>
          )}

          <button
            onClick={handleNext}
            disabled={currentIndex >= cards.length - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-paper2 border border-black/10 text-xs font-bold text-ink hover:bg-paper3 disabled:opacity-30 transition-all"
          >
            <span>Next Card</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
};
