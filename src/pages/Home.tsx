import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { 
  Filter, 
  Sparkles, 
  Layers, 
  SlidersHorizontal, 
  BookOpen, 
  RefreshCw, 
  Compass, 
  X, 
  ChevronRight,
  Target
} from 'lucide-react';
import { factService } from '../services/factService';
import { Fact, Birthday, Category } from '../types';
import { cn } from '../lib/utils';
import { Ticker } from '../components/Ticker';
import { FactCard } from '../components/FactCard';
import { StudyHubSection } from '../components/StudyHubSection';
import { DailyGoalTracker } from '../components/DailyGoalTracker';
import { HomeFilterSidebar, FilterCriteria, GK_TAG_OPTIONS } from '../components/HomeFilterSidebar';
import { INITIAL_FACTS, INITIAL_BIRTHDAYS, INITIAL_QUIZ } from '../seed';
import { useAuth } from '../contexts/AuthContext';

export const Home = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const [facts, setFacts] = useState<Fact[]>(INITIAL_FACTS);
  const [birthdays, setBirthdays] = useState<Birthday[]>(INITIAL_BIRTHDAYS);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Client-side instant filter state
  const [filters, setFilters] = useState<FilterCriteria>({
    category: 'all',
    tag: 'all',
    sortBy: 'newest',
    searchQuery: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!authLoading && isAdmin) {
          await factService.seedData(INITIAL_FACTS, INITIAL_BIRTHDAYS, INITIAL_QUIZ);
        }
        
        const fetchedFacts = await factService.getFacts(undefined, false, 50, isAdmin);
        const fetchedBDays = await factService.getBirthdays(6);

        if (fetchedFacts && fetchedFacts.length > 0) setFacts(fetchedFacts);
        if (fetchedBDays && fetchedBDays.length > 0) setBirthdays(fetchedBDays);
      } catch (error) {
        console.error("Failed to load home data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authLoading, isAdmin]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      history: 0,
      science: 0,
      inventions: 0,
      discoveries: 0,
      birthdays: 0
    };
    facts.forEach((f) => {
      if (counts[f.cat] !== undefined) {
        counts[f.cat]++;
      }
    });
    return counts;
  }, [facts]);

  // Filtered & Sorted Facts
  const filteredFacts = useMemo(() => {
    let result = [...facts];

    // 1. Category Filter
    if (filters.category !== 'all') {
      result = result.filter((f) => f.cat === filters.category);
    }

    // 2. Tag Filter
    if (filters.tag !== 'all') {
      const selectedTag = GK_TAG_OPTIONS.find((t) => t.id === filters.tag);
      if (selectedTag && selectedTag.match) {
        const keywords = selectedTag.match;
        result = result.filter((f) => {
          const text = `${f.title} ${f.excerpt} ${f.full || ''} ${f.cat}`.toLowerCase();
          return keywords.some((kw) => text.includes(kw));
        });
      }
    }

    // 3. Search Query Filter
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter((f) => {
        const searchCorpus = `${f.title} ${f.excerpt} ${f.year} ${f.cat} ${f.full || ''}`.toLowerCase();
        return searchCorpus.includes(q);
      });
    }

    // 4. Sorting
    if (filters.sortBy === 'newest') {
      result.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    } else if (filters.sortBy === 'year-asc') {
      result.sort((a, b) => a.year - b.year);
    } else if (filters.sortBy === 'year-desc') {
      result.sort((a, b) => b.year - a.year);
    } else if (filters.sortBy === 'featured') {
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [facts, filters]);

  const featuredFacts = facts.filter((f) => f.featured);
  const mainFeat = featuredFacts[0];
  const sideFeat = featuredFacts.slice(1, 5);

  const today = new Date();
  const curMonth = today.getMonth() + 1;
  const curDay = today.getDate();
  const todayEvents = facts.filter((f) => f.eventMonth === curMonth && f.eventDay === curDay);

  return (
    <div className="fade-in">
      <Helmet>
        <title>FActHub | Daily Source of Amazing Facts, History & Science</title>
        <meta name="description" content="Discover fascinating facts about history, science, inventions, discoveries, and famous birthdays. Your daily source of curiosity and knowledge." />
        <meta name="keywords" content="facts, amazing facts, today in history, famous birthdays, science facts, inventions, discoveries, history facts, FActHub" />
        <meta property="og:title" content="FActHub | Amazing Daily Facts" />
        <meta property="og:description" content="Explore the world of amazing facts and history stories on FActHub." />
        <meta property="og:image" content="https://www.google.com/favicon.ico" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <Ticker facts={facts} />

      {/* Hero Section */}
      <section className="relative bg-[#0c0c0b] text-white pt-16 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-black/10 dark:border-white/10">
        <div className="hero-grid-bg opacity-10" />
        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-3 gap-12 items-center">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 text-gold-l font-mono text-[0.7rem] uppercase tracking-widest">
              <span className="w-6 h-px bg-gold-l" />
              📅 {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <h1 className="text-white text-4xl sm:text-5xl lg:text-7xl font-serif font-black leading-tight tracking-tight">
              Every Fact Has a<br />
              <span className="text-gold-l italic">Story Worth Knowing</span>
            </h1>
            <p className="text-white/80 text-lg max-w-xl leading-relaxed">
              Explore history's greatest moments, science breakthroughs, brilliant inventions, amazing discoveries, and the brilliant minds that shaped our world.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/category/history" className="bg-gold hover:bg-gold-l text-black font-bold px-8 py-3 rounded-full transition-all transform hover:-translate-y-1 shadow-md">
                ⏳ Explore History
              </Link>
              <Link to="/quiz" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-3 rounded-full font-bold transition-all">
                ⚡ Take a Quiz
              </Link>
            </div>
          </div>

          <div className="hidden lg:block bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm self-stretch max-h-[480px] overflow-y-auto">
            <div className="font-mono text-[0.7rem] text-gold-l uppercase tracking-widest mb-6 flex justify-between items-center">
              <span>✦ Today in History</span>
              {todayEvents.length > 0 && <span className="bg-gold text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">{todayEvents.length} Active</span>}
            </div>
            
            <div className="space-y-6">
              {todayEvents.length > 0 ? (
                todayEvents.map((ev) => (
                  <Link 
                    key={ev.id} 
                    to={`/article/${ev.id}`} 
                    className="block group border-b border-white/10 pb-6 last:border-0 last:pb-0 hover:scale-[1.01] transition-all"
                  >
                    <div className="text-2xl font-serif font-bold text-gold-l leading-none flex items-center gap-2">
                      <span className="text-lg">{ev.emoji || "⏳"}</span>
                      {ev.year < 0 ? `${Math.abs(ev.year)} BC` : ev.year}
                    </div>
                    <div className="text-sm text-white/70 mt-2 leading-snug group-hover:text-gold-l transition-colors">
                      {ev.title}
                    </div>
                    <div className="text-[10px] text-white/40 mt-1 uppercase font-semibold font-mono">Read Article →</div>
                  </Link>
                ))
              ) : (
                <>
                  {[
                    { year: 1940, text: 'Winston Churchill became British PM' },
                    { year: 1796, text: 'Edward Jenner administered first vaccine' },
                    { year: 1969, text: 'Apollo 11 mission reached lunar orbit' }
                  ].map((ev, i) => (
                    <div key={i} className="group border-b border-white/10 pb-6 last:border-0 last:pb-0">
                      <div className="text-2xl font-serif font-bold text-gold-l leading-none">{ev.year}</div>
                      <div className="text-sm text-white/70 mt-2 leading-snug group-hover:text-white transition-colors">
                        {ev.text}
                      </div>
                    </div>
                  ))}
                  
                  {isAdmin && (
                    <div className="pt-2">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white/50 text-center leading-relaxed font-sans">
                        💡 <strong>Admin Hint:</strong> Show custom articles here! Create or Edit any article and set its <strong>Event month & day</strong> to match today's date!
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Daily Study Goal Tracker & Quick Actions */}
      <section className="py-6 px-4 bg-paper max-w-7xl mx-auto -mt-6 relative z-20">
        <DailyGoalTracker />
      </section>

      {/* Interactive Study Tools & Pages Hub */}
      <StudyHubSection />

      {/* Featured Grid */}
      <section className="py-16 px-4 bg-paper2">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-serif font-bold text-ink">Featured Facts</h2>
              <p className="text-sm text-ink3">Hand-picked stories from our editors</p>
            </div>
            <Link to="/category/history" className="text-sm font-bold text-gold hover:underline">View all →</Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {mainFeat && (
              <Link
                to={`/article/${mainFeat.id}`}
                className="lg:col-span-2 lg:row-span-2 relative bg-[#0c0c0b] text-white rounded-fact p-8 flex flex-col justify-end min-h-[400px] group overflow-hidden border border-black/10 dark:border-white/10 shadow-fact"
              >
                <div className="absolute top-0 right-0 text-[10rem] font-serif font-black text-white/[0.04] leading-none select-none pointer-events-none">
                  {mainFeat.year < 0 ? 'BC' : mainFeat.year}
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2 text-gold-l font-bold text-xs uppercase tracking-widest">
                    <span className="w-4 h-px bg-gold-l" />
                    {mainFeat.cat}
                  </div>
                  <h3 className="text-white text-3xl font-serif font-bold leading-tight group-hover:text-gold-l transition-colors">
                    {mainFeat.title}
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed max-w-lg">
                    {mainFeat.excerpt}
                  </p>
                  <div className="text-gold-l font-mono text-xs pt-4">
                    — {mainFeat.year < 0 ? `${Math.abs(mainFeat.year)} BC` : mainFeat.year} · Read full story →
                  </div>
                </div>
              </Link>
            )}

            {sideFeat.map((f) => (
              <div key={f.id} className="bg-white border border-black/10 rounded-fact p-6 shadow-fact hover:-translate-y-1 transition-all group flex flex-col justify-between cursor-pointer">
                <Link to={`/article/${f.id}`}>
                  <div className={cn("text-[0.65rem] font-bold uppercase tracking-widest mb-2", {
                    "text-coral": f.cat === 'history',
                    "text-teal": f.cat === 'science',
                    "text-gold": f.cat === 'inventions',
                    "text-indigo": f.cat === 'discoveries'
                  })}>
                    {f.cat}
                  </div>
                  <h4 className="font-serif font-bold text-ink leading-snug group-hover:text-gold transition-colors">
                    {f.title}
                  </h4>
                  <div className="font-mono text-xs text-ink3 mt-4">
                    {f.year < 0 ? `${Math.abs(f.year)} BC` : f.year}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Fact Feed with Tag-Based Filter Sidebar */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-black/10">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-serif font-bold text-ink">Explore Knowledge Feed</h2>
                <span className="bg-gold/20 text-ink text-xs font-bold px-2 py-0.5 rounded-full">
                  {filteredFacts.length} Facts
                </span>
              </div>
              <p className="text-sm text-ink3">Filter facts by category, competitive exam topic, and historical chronology</p>
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-xl text-xs font-bold transition-all self-start sm:self-auto"
            >
              <SlidersHorizontal size={14} className="text-gold" />
              <span>{mobileFilterOpen ? 'Hide Filters' : 'Filter & Sort'}</span>
            </button>
          </div>

          {/* Mobile Filter Drawer (Collapsible) */}
          <AnimatePresence>
            {mobileFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden overflow-hidden"
              >
                <HomeFilterSidebar
                  filters={filters}
                  onChange={setFilters}
                  categoryCounts={categoryCounts}
                  totalCount={facts.length}
                  filteredCount={filteredFacts.length}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop Layout: Sidebar + Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Filter Sidebar (Sticky on Desktop) */}
            <div className="hidden lg:block lg:col-span-4 sticky top-24">
              <HomeFilterSidebar
                filters={filters}
                onChange={setFilters}
                categoryCounts={categoryCounts}
                totalCount={facts.length}
                filteredCount={filteredFacts.length}
              />
            </div>

            {/* Right Feed Cards */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Active Filter Chips Bar */}
              {(filters.category !== 'all' || filters.tag !== 'all' || filters.searchQuery) && (
                <div className="bg-paper2 p-3 rounded-xl border border-black/5 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-ink3">Active Filters:</span>
                  
                  {filters.category !== 'all' && (
                    <span className="inline-flex items-center gap-1 bg-ink text-white px-2.5 py-1 rounded-lg font-medium">
                      <span>Category: {filters.category.toUpperCase()}</span>
                      <button onClick={() => setFilters({ ...filters, category: 'all' })} className="hover:text-gold">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {filters.tag !== 'all' && (
                    <span className="inline-flex items-center gap-1 bg-gold text-ink px-2.5 py-1 rounded-lg font-bold">
                      <span>Tag: {GK_TAG_OPTIONS.find((t) => t.id === filters.tag)?.label || filters.tag}</span>
                      <button onClick={() => setFilters({ ...filters, tag: 'all' })} className="hover:text-rose-700">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {filters.searchQuery && (
                    <span className="inline-flex items-center gap-1 bg-white border border-black/10 px-2.5 py-1 rounded-lg text-ink font-medium">
                      <span>Query: "{filters.searchQuery}"</span>
                      <button onClick={() => setFilters({ ...filters, searchQuery: '' })} className="hover:text-rose-600">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  <button
                    onClick={() => setFilters({ category: 'all', tag: 'all', sortBy: 'newest', searchQuery: '' })}
                    className="text-xs font-bold text-rose-600 hover:underline ml-auto"
                  >
                    Reset All
                  </button>
                </div>
              )}

              {filteredFacts.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-6">
                  {filteredFacts.map((fact, i) => (
                    <FactCard key={fact.id} fact={fact} index={i} />
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-black/10 rounded-2xl p-12 text-center space-y-4">
                  <div className="w-14 h-14 bg-paper2 rounded-full flex items-center justify-center mx-auto text-2xl">
                    🔍
                  </div>
                  <h3 className="text-lg font-serif font-bold text-ink">No Facts Found</h3>
                  <p className="text-xs text-ink3 max-w-sm mx-auto">
                    No articles matched your search filter. Try clearing your tags or search for another keyword.
                  </p>
                  <button
                    onClick={() => setFilters({ category: 'all', tag: 'all', sortBy: 'newest', searchQuery: '' })}
                    className="px-4 py-2 bg-ink text-white text-xs font-bold rounded-xl hover:bg-gold hover:text-ink transition-all"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Birthdays Section */}
      <section className="py-16 px-4 bg-[#0c0c0b] text-white border-t border-black/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-2xl font-serif font-bold text-white">🎂 Famous Birthdays</h2>
              <p className="text-sm text-white/70">Brilliant minds — sorted by date</p>
            </div>
            <Link to="/birthdays" className="text-sm font-bold text-gold-l hover:underline">All birthdays →</Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {birthdays.map((b) => (
              <div key={b.id} className="bg-white/5 border border-white/10 rounded-fact p-5 text-center group hover:bg-white/10 transition-all cursor-pointer">
                <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center font-serif text-xl font-bold bg-opacity-20" style={{ backgroundColor: b.color + '33', color: b.color }}>
                  {b.init}
                </div>
                <div className="font-serif font-bold text-sm leading-tight text-white group-hover:text-gold-l transition-colors">{b.name}</div>
                <div className="font-mono text-[0.65rem] text-white/50 mt-1">Born {b.year}</div>
                <div className="text-[0.6rem] font-bold uppercase tracking-widest mt-2" style={{ color: b.color }}>{b.field}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-gold py-16 px-4 text-center">
        <div className="max-w-xl mx-auto space-y-6">
          <h2 className="text-3xl font-serif font-black text-black">📬 Get Your Daily Fact</h2>
          <p className="text-black/80 font-medium">One amazing fact every morning. Free forever.</p>
          <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => { e.preventDefault(); alert("Subscribed!"); }}>
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 px-6 py-3 rounded-full bg-white text-black outline-none border border-black/10"
              required
            />
            <button className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-neutral-800 transition-all">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
