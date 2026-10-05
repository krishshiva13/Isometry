import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Clock, 
  Search, 
  Trash2, 
  ArrowRight, 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Calendar,
  Filter,
  Check
} from 'lucide-react';
import { readLaterService, ReadLaterItem } from '../services/readLaterService';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export const ReadLater: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ReadLaterItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await readLaterService.getReadLaterList();
      setItems(data);
    } catch (e) {
      console.warn('Error loading read later list:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    const unsub = readLaterService.subscribe(() => {
      loadItems();
    });
    return unsub;
  }, [user?.uid]);

  const handleToggleStatus = async (articleId: string) => {
    const newStatus = await readLaterService.toggleReadStatus(articleId);
    setToastMessage(newStatus === 'read' ? 'Marked as completed! 🎉' : 'Marked as unread');
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleRemove = async (articleId: string, title: string) => {
    await readLaterService.removeFromReadLater(articleId);
    setToastMessage(`Removed "${title.slice(0, 25)}…" from reading list`);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const filteredItems = items.filter(item => {
    const matchesStatus = statusFilter === 'all' ? true : item.readStatus === statusFilter;
    const matchesCat = categoryFilter === 'all' ? true : item.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch = !searchQuery.trim() || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCat && matchesSearch;
  });

  const unreadCount = items.filter(i => i.readStatus === 'unread').length;
  const readCount = items.filter(i => i.readStatus === 'read').length;

  return (
    <div className="bg-paper dark:bg-[#0f1015] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Read Later List | FactHub</title>
        <meta name="description" content="Access your personalized Read Later reading list on FactHub." />
      </Helmet>

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-black/10 dark:border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gold font-mono text-xs font-bold uppercase tracking-wider">
              <Clock size={14} className="text-gold" />
              <span>Personal Reading Queue</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-ink dark:text-white">
              Read Later List
            </h1>
            <p className="text-xs sm:text-sm text-ink3 dark:text-white/60">
              Articles and historical stories saved to read at your own pace
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/20">
              {unreadCount} Unread
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
              {readCount} Completed
            </span>
          </div>
        </div>

        {/* ── TOAST NOTIFICATION ── */}
        {toastMessage && (
          <div className="p-3 bg-gold/15 border border-gold/40 text-ink dark:text-gold-l text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
            <Check size={14} className="text-gold" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ── FILTER CONTROLS ── */}
        <div className="bg-paper2 dark:bg-[#161720] border border-black/10 dark:border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex bg-paper dark:bg-white/5 p-1 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold font-mono w-full md:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={cn(
                "flex-1 md:flex-initial px-4 py-1.5 rounded-lg transition-all cursor-pointer",
                statusFilter === 'all'
                  ? "bg-gold text-black shadow-xs font-black"
                  : "text-ink3 dark:text-white/60 hover:text-ink dark:hover:text-white"
              )}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setStatusFilter('unread')}
              className={cn(
                "flex-1 md:flex-initial px-4 py-1.5 rounded-lg transition-all cursor-pointer",
                statusFilter === 'unread'
                  ? "bg-gold text-black shadow-xs font-black"
                  : "text-ink3 dark:text-white/60 hover:text-ink dark:hover:text-white"
              )}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setStatusFilter('read')}
              className={cn(
                "flex-1 md:flex-initial px-4 py-1.5 rounded-lg transition-all cursor-pointer",
                statusFilter === 'read'
                  ? "bg-gold text-black shadow-xs font-black"
                  : "text-ink3 dark:text-white/60 hover:text-ink dark:hover:text-white"
              )}
            >
              Completed ({readCount})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink3 dark:text-white/40" />
            <input
              type="text"
              placeholder="Search reading list…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-sans rounded-xl bg-paper dark:bg-white/5 border border-black/10 dark:border-white/10 text-ink dark:text-white placeholder:text-ink3 dark:placeholder:text-white/40 focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        {/* ── ARTICLE LIST ── */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin mx-auto" />
            <p className="text-xs font-mono text-ink3 dark:text-white/50">Loading your reading list…</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-paper2 dark:bg-[#161720] border border-black/10 dark:border-white/10 rounded-3xl p-12 text-center space-y-4">
            <div className="text-5xl">📖</div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-serif font-bold text-lg text-ink dark:text-white">
                {items.length === 0 ? "Your Read Later list is empty" : "No matching articles found"}
              </h3>
              <p className="text-xs text-ink3 dark:text-white/60">
                {items.length === 0
                  ? "Save articles with the 'Read Later' button to build your personal reading list!"
                  : "Try clearing your search query or selecting a different status filter."}
              </p>
            </div>
            {items.length === 0 && (
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-gold hover:bg-gold-l text-black font-bold text-xs shadow-sm transition-all"
              >
                <span>Browse Trending Articles</span>
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredItems.map(item => {
              const isFinished = item.readStatus === 'read';
              const yearDisplay = item.year !== undefined ? (item.year < 0 ? `${Math.abs(item.year)} BC` : item.year) : null;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group",
                    isFinished
                      ? "bg-paper2/60 dark:bg-white/[0.03] border-black/5 dark:border-white/5 opacity-80"
                      : "bg-paper2 dark:bg-[#161720] border-black/10 dark:border-white/10 shadow-xs hover:border-gold/60"
                  )}
                >
                  {/* Left: Info */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <span className="text-2xl p-2.5 rounded-2xl bg-paper dark:bg-white/5 border border-black/5 dark:border-white/5 shrink-0 mt-0.5">
                      {item.emoji || '📖'}
                    </span>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                          item.category === 'history' ? "bg-coral/15 text-coral" :
                          item.category === 'science' ? "bg-teal/15 text-teal" :
                          item.category === 'inventions' ? "bg-gold/15 text-amber-900 dark:text-gold-l" :
                          "bg-indigo/15 text-indigo-400"
                        )}>
                          {item.category}
                        </span>
                        {yearDisplay && (
                          <span className="text-ink3 dark:text-white/50 text-[11px]">
                            • {yearDisplay}
                          </span>
                        )}
                        <span className="text-ink3 dark:text-white/40 text-[10px]">
                          • Saved {new Date(item.savedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <Link to={`/article/${item.articleId}`} className="block">
                        <h2 className={cn(
                          "font-serif font-bold text-base sm:text-lg text-ink dark:text-white group-hover:text-gold transition-colors line-clamp-1",
                          isFinished && "line-through opacity-70"
                        )}>
                          {item.title}
                        </h2>
                      </Link>

                      <p className="text-xs text-ink3 dark:text-white/60 line-clamp-2 leading-relaxed">
                        {item.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleToggleStatus(item.articleId)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer",
                        isFinished
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                          : "bg-paper dark:bg-white/5 border-black/10 dark:border-white/10 text-ink3 hover:text-ink dark:text-white/60"
                      )}
                      title={isFinished ? "Mark as unread" : "Mark as completed"}
                    >
                      {isFinished ? (
                        <>
                          <CheckCircle2 size={13} className="text-emerald-500" />
                          <span>Done</span>
                        </>
                      ) : (
                        <>
                          <Circle size={13} />
                          <span>Mark Read</span>
                        </>
                      )}
                    </button>

                    <Link
                      to={`/article/${item.articleId}`}
                      className="px-3.5 py-1.5 rounded-xl bg-gold hover:bg-gold-l text-black font-bold text-xs shadow-xs transition-all flex items-center gap-1"
                    >
                      <span>Read</span>
                      <ArrowRight size={13} />
                    </Link>

                    <button
                      onClick={() => handleRemove(item.articleId, item.title)}
                      className="p-1.5 rounded-xl text-ink3 hover:text-coral hover:bg-coral/10 transition-colors cursor-pointer"
                      title="Remove from Read Later"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
