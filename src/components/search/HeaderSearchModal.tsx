import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  X, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  BookOpen, 
  User, 
  Zap, 
  Sliders, 
  CornerDownLeft,
  Flame,
  Bookmark
} from 'lucide-react';
import { searchIndexService, SearchIndexItem, SearchItemType } from '../../services/searchIndexService';
import { cn } from '../../lib/utils';

interface HeaderSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECENT_SEARCHES_KEY = 'facthub_recent_search_queries_v1';
const POPULAR_SEARCH_SUGGESTIONS = [
  'Apollo 11 Moon Landing',
  'Albert Einstein',
  'Fall of the Berlin Wall',
  'Penicillin Antibiotics',
  'Gutenberg Printing Press',
  'Daily 5-MCQ Quiz',
  'Theory of Relativity',
  'Alexander Graham Bell'
];

export const HeaderSearchModal: React.FC<HeaderSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | SearchItemType>('all');
  const [results, setResults] = useState<SearchIndexItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load recent searches
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (raw) setRecentSearches(JSON.parse(raw));
    } catch {}
  }, []);

  // Save query to recent searches
  const saveRecentSearch = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      const updated = [trimmed, ...recentSearches.filter(q => q.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {}
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Execute search when query or filter changes
  useEffect(() => {
    const res = searchIndexService.search(query, activeFilter, 12);
    setResults(res);
    setSelectedIndex(0);
  }, [query, activeFilter]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + Math.max(1, results.length)) % Math.max(1, results.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelectItem(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelectItem = (item: SearchIndexItem) => {
    saveRecentSearch(query || item.title);
    onClose();
    if (item.url.startsWith('http')) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(item.url);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[350] bg-black/70 backdrop-blur-md flex justify-center items-start pt-12 sm:pt-20 px-3 sm:px-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: -15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -15 }}
        transition={{ duration: 0.18 }}
        className="bg-paper dark:bg-[#16171f] w-full max-w-2xl rounded-3xl shadow-2xl border border-black/15 dark:border-white/15 overflow-hidden flex flex-col my-4 max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* ── TOP SEARCH INPUT BAR ── */}
        <div className="p-4 sm:p-5 border-b border-black/10 dark:border-white/10 flex items-center gap-3 bg-white dark:bg-[#1d1e27]">
          <Search size={22} className="text-gold shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search articles, historical figures, quiz topics, or tools…"
            className="flex-1 bg-transparent border-none outline-none text-base sm:text-lg font-sans text-ink dark:text-white placeholder:text-ink3 dark:placeholder:text-white/40"
          />
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-ink3 hover:text-ink dark:text-white/60 dark:hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block font-mono text-[10px] uppercase font-bold px-2 py-1 rounded bg-black/5 dark:bg-white/10 text-ink3 dark:text-white/50 border border-black/10 dark:border-white/10">
              ESC to close
            </kbd>
          )}
          <button 
            onClick={onClose} 
            className="sm:hidden p-1.5 rounded-lg text-ink3 hover:text-ink dark:text-white/60 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── FILTER CHIPS ── */}
        <div className="px-4 py-2.5 bg-paper2 dark:bg-[#13141b] border-b border-black/5 dark:border-white/5 flex items-center gap-1.5 overflow-x-auto text-xs font-mono font-bold">
          {[
            { id: 'all', label: 'All Results' },
            { id: 'article', label: '📖 Articles' },
            { id: 'figure', label: '👤 Historical Figures' },
            { id: 'quiz', label: '⚡ Quiz Topics' },
            { id: 'tool', label: '🛠 Study Tools' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={cn(
                "px-3 py-1 rounded-xl transition-all shrink-0 cursor-pointer border",
                activeFilter === f.id
                  ? "bg-gold text-black border-gold shadow-xs font-black"
                  : "bg-paper dark:bg-white/5 text-ink3 dark:text-white/60 border-black/5 dark:border-white/5 hover:text-ink dark:hover:text-white"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── SEARCH RESULTS & RECENT SUGGESTIONS ── */}
        <div ref={listRef} className="overflow-y-auto p-3 sm:p-4 space-y-2 flex-1 max-h-[55vh]">
          {/* If query is empty, show Recent Searches & Popular Suggestions */}
          {!query.trim() && (
            <div className="space-y-5 py-2">
              {recentSearches.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-ink3 dark:text-white/50 px-2">
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} /> Recent Searches
                    </span>
                    <button 
                      onClick={clearRecentSearches}
                      className="text-[11px] hover:text-coral transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 px-1">
                    {recentSearches.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => setQuery(r)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs text-ink dark:text-white font-medium hover:border-gold transition-colors cursor-pointer"
                      >
                        <Clock size={11} className="text-ink3 opacity-70" />
                        <span>{r}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Suggestions */}
              <div className="space-y-2">
                <div className="text-xs font-mono font-bold text-ink3 dark:text-white/50 px-2 flex items-center gap-1.5">
                  <Flame size={12} className="text-amber-500" /> Popular Topics to Explore
                </div>
                <div className="flex flex-wrap gap-2 px-1">
                  {POPULAR_SEARCH_SUGGESTIONS.map((topic, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(topic)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-medium text-ink2 dark:text-white/80 hover:bg-gold/15 hover:border-gold transition-all cursor-pointer"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Jump Previews */}
              <div className="pt-2">
                <div className="text-xs font-mono font-bold text-ink3 dark:text-white/50 px-2 mb-2">
                  Top Recommended Shortcuts
                </div>
                <div className="space-y-1.5">
                  {results.slice(0, 4).map((item, idx) => (
                    <div
                      key={item.id}
                      data-index={idx}
                      onClick={() => handleSelectItem(item)}
                      className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-gold dark:hover:border-gold transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl shrink-0 p-2 rounded-xl bg-paper2 dark:bg-white/10">
                          {item.icon}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-ink dark:text-white truncate group-hover:text-gold transition-colors">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-ink3 dark:text-white/60 truncate">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-gold shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Open</span>
                        <ArrowRight size={13} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* If query has text, show matching indexed results */}
          {query.trim() && (
            <>
              {results.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="text-4xl">🔍</div>
                  <div className="font-serif font-bold text-ink dark:text-white text-lg">
                    No results found for "{query}"
                  </div>
                  <p className="text-xs text-ink3 dark:text-white/60 max-w-sm mx-auto">
                    Try searching for famous historical figures (e.g. Einstein), breakthroughs (e.g. Moon Landing), or quiz topics.
                  </p>
                </div>
              ) : (
                results.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      data-index={idx}
                      onClick={() => handleSelectItem(item)}
                      className={cn(
                        "p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start sm:items-center justify-between gap-3 group",
                        isSelected
                          ? "bg-gold/15 border-gold shadow-sm scale-[1.01]"
                          : "bg-white dark:bg-white/5 border-black/5 dark:border-white/5 hover:border-gold/50"
                      )}
                    >
                      {/* Left Icon & Content */}
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        <span className="text-2xl shrink-0 p-2 rounded-xl bg-paper2 dark:bg-white/10 mt-0.5 sm:mt-0">
                          {item.icon}
                        </span>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-ink dark:text-white truncate group-hover:text-gold transition-colors">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-ink2 dark:text-white/70">
                                {item.badge}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-ink3 dark:text-white/60 line-clamp-1">
                            {item.description}
                          </p>

                          <div className="text-[10px] font-mono text-ink3 dark:text-white/50 flex items-center gap-2">
                            <span>{item.subtitle}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Enter action indicator */}
                      <div className="shrink-0 flex items-center gap-1.5 text-xs font-mono font-bold text-gold opacity-80 group-hover:opacity-100 transition-opacity">
                        <span className="hidden sm:inline">Press Enter</span>
                        <CornerDownLeft size={13} />
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>

        {/* ── FOOTER BAR ── */}
        <div className="p-3 bg-paper2 dark:bg-[#12131a] border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-ink3 dark:text-white/50">
          <div className="flex items-center gap-3">
            <span>Navigate: <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-bold">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-bold">↓</kbd></span>
            <span>Select: <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-bold">↵</kbd></span>
          </div>
          <div>
            <span>Instant Searchable Index</span>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
