import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Search, Sparkles, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { Fact, Category } from '../types';
import { factService } from '../services/factService';
import { INITIAL_FACTS } from '../seed';
import { cn } from '../lib/utils';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const CalendarExplorer: React.FC = () => {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1); // 1-12
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate()); // 1-31
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [allFacts, setAllFacts] = useState<Fact[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAllFacts();
  }, []);

  const loadAllFacts = async () => {
    setLoading(true);
    try {
      const facts = await factService.getFacts('all', false, 100);
      setAllFacts(facts && facts.length > 0 ? facts : INITIAL_FACTS);
    } catch {
      setAllFacts(INITIAL_FACTS);
    } finally {
      setLoading(false);
    }
  };

  const daysInCurrentMonth = DAYS_IN_MONTH[selectedMonth - 1] || 31;

  // Filter facts matching selected month & day (or fallback distribution)
  const matchedFacts = allFacts.filter(fact => {
    const monthMatch = fact.eventMonth ? fact.eventMonth === selectedMonth : true;
    const dayMatch = fact.eventDay ? fact.eventDay === selectedDay : true;
    const catMatch = selectedCategory === 'all' || fact.cat === selectedCategory;
    return monthMatch && dayMatch && catMatch;
  });

  const handlePrevMonth = () => {
    setSelectedMonth(prev => (prev === 1 ? 12 : prev - 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => (prev === 12 ? 1 : prev + 1));
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setSelectedMonth(now.getMonth() + 1);
    setSelectedDay(now.getDate());
  };

  return (
    <div className="min-h-screen bg-paper py-10 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>On This Exact Date (Jan 1 – Dec 31 Calendar Explorer) | FActHub</title>
        <meta name="description" content="Explore historical events, scientific discoveries, and important anniversaries recorded on any calendar date of the year." />
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-8">

        {/* Top Header Card */}
        <div className="bg-paper2 border border-black/10 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold">
                <CalendarIcon size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-black text-ink">"On This Exact Date" Explorer</h1>
                <p className="text-xs sm:text-sm text-ink3">Select any day of the year to uncover historical records & milestones</p>
              </div>
            </div>

            <button
              onClick={handleJumpToToday}
              className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gold text-ink font-bold text-xs hover:bg-gold/90 transition-all shadow-sm"
            >
              <Sparkles size={14} />
              <span>Jump to Today ({MONTH_NAMES[today.getMonth()]} {today.getDate()})</span>
            </button>
          </div>

          {/* Month Stepper & Grid */}
          <div className="mt-6 pt-6 border-t border-black/10 space-y-4">
            
            {/* Month Header Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-paper hover:bg-paper3 border border-black/10 text-ink transition-all flex items-center gap-1 text-xs font-bold"
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Prev Month</span>
              </button>

              <div className="text-lg sm:text-xl font-serif font-bold text-ink flex items-center gap-2">
                <span>{MONTH_NAMES[selectedMonth - 1]}</span>
                <span className="text-xs font-sans text-ink3 font-normal font-mono">({daysInCurrentMonth} Days)</span>
              </div>

              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-paper hover:bg-paper3 border border-black/10 text-ink transition-all flex items-center gap-1 text-xs font-bold"
              >
                <span className="hidden sm:inline">Next Month</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-16 gap-1.5 sm:gap-2">
              {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map(d => {
                const isSelected = selectedDay === d;
                const isToday = selectedMonth === today.getMonth() + 1 && d === today.getDate();

                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={cn(
                      "py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all relative",
                      isSelected
                        ? "bg-emerald-600 text-white shadow-md scale-105"
                        : isToday
                        ? "bg-gold/20 text-gold border border-gold/40 hover:bg-gold/30"
                        : "bg-paper hover:bg-paper3 text-ink2 border border-black/5"
                    )}
                  >
                    <span>{d}</span>
                    {isToday && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gold animate-ping" />
                    )}
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* Selected Date Facts Showcase */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-black/10">
            <div>
              <h2 className="text-xl font-serif font-bold text-ink">
                Events on {MONTH_NAMES[selectedMonth - 1]} {selectedDay}
              </h2>
              <p className="text-xs text-ink3">Showing historical milestones recorded on this day across centuries</p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
              {['all', 'history', 'science', 'inventions', 'discoveries'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all",
                    selectedCategory === cat
                      ? "bg-ink text-paper"
                      : "bg-paper2 hover:bg-paper3 text-ink3 border border-black/10"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Results Grid */}
          {matchedFacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchedFacts.map(fact => (
                <Link
                  key={fact.id}
                  to={`/article/${fact.id}`}
                  className="bg-paper2 border border-black/10 rounded-3xl p-6 hover:border-gold transition-all shadow-sm flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-2xl p-2 bg-paper rounded-xl border border-black/5">
                        {fact.emoji || '📜'}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/5 text-ink2">
                        YEAR {fact.year || 'RECORD'}
                      </span>
                    </div>

                    <h3 className="text-base font-serif font-bold text-ink group-hover:text-gold transition-colors line-clamp-2">
                      {fact.title}
                    </h3>
                    <p className="text-xs text-ink3 mt-2 line-clamp-3 leading-relaxed">
                      {fact.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-black/5 flex items-center justify-between text-xs font-bold text-gold">
                    <span className="text-[10px] uppercase tracking-wider text-ink3 font-sans">
                      {fact.cat}
                    </span>
                    <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read Story <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-paper2 border border-black/10 rounded-3xl p-12 text-center space-y-3 max-w-lg mx-auto">
              <div className="text-3xl">🗓️</div>
              <h3 className="text-base font-serif font-bold text-ink">
                No specific record tagged for {MONTH_NAMES[selectedMonth - 1]} {selectedDay} yet
              </h3>
              <p className="text-xs text-ink3">
                Our AI content scanner automatically adds new historical milestones daily. You can also submit an event for this date!
              </p>
              <div className="pt-2">
                <Link
                  to="/submit-fact"
                  className="inline-flex items-center gap-1.5 bg-gold text-ink font-bold px-4 py-2 rounded-2xl text-xs hover:bg-gold/90 transition-all"
                >
                  <span>Submit an Event for this Date</span>
                </Link>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
