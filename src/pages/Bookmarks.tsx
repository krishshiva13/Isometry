import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Bookmark, 
  Search, 
  Trash2, 
  ArrowRight, 
  ExternalLink, 
  BookOpen, 
  Sparkles, 
  Cloud, 
  Calendar,
  Share2,
  Check
} from 'lucide-react';
import { UserBookmark } from '../types';
import { bookmarkService } from '../services/bookmarkService';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export const Bookmarks: React.FC = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<UserBookmark[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const data = await bookmarkService.getBookmarks(user?.uid);
      setBookmarks(data);
    } catch (err) {
      console.error("Failed loading bookmarks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();

    const handleUpdate = () => {
      loadBookmarks();
    };

    window.addEventListener('facthub_bookmarks_updated', handleUpdate);
    return () => {
      window.removeEventListener('facthub_bookmarks_updated', handleUpdate);
    };
  }, [user?.uid]);

  const handleRemove = async (factId: string, factTitle: string) => {
    setDeletingId(factId);
    try {
      await bookmarkService.removeBookmark(factId, user?.uid);
      setBookmarks(prev => prev.filter(b => b.factId !== factId));
      setToastMessage(`Removed "${factTitle.substring(0, 30)}..." from bookmarks`);
      setTimeout(() => setToastMessage(null), 2500);
    } catch (e) {
      console.error("Failed removing bookmark:", e);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredBookmarks = bookmarks.filter(b => {
    const matchesCat = selectedCat === 'all' || b.factCat.toLowerCase() === selectedCat.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      b.factTitle.toLowerCase().includes(query) ||
      (b.factExcerpt && b.factExcerpt.toLowerCase().includes(query)) ||
      (b.factCat && b.factCat.toLowerCase().includes(query));
    return matchesCat && matchesSearch;
  });

  const categories = ['all', 'history', 'science', 'inventions', 'discoveries'];

  return (
    <div className="bg-paper min-h-screen py-8 sm:py-12">
      <Helmet>
        <title>Saved Facts & Bookmarks | FActHub</title>
        <meta name="description" content="Revisit and review your favorite curated facts, historical milestones, and scientific discoveries stored in your FActHub account." />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-ink text-paper px-4 py-3 rounded-2xl shadow-xl border border-gold/30 flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-3">
            <Check size={16} className="text-gold" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-widest text-gold flex items-center gap-1.5">
                <Bookmark size={15} className="text-gold fill-gold" />
                Personal Reading List
              </span>
              <span className="text-[10px] font-mono bg-paper2 text-ink3 px-2 py-0.5 rounded-full border border-black/5 flex items-center gap-1">
                <Cloud size={11} className="text-teal" />
                {user ? 'Firestore Synced' : 'Saved Locally'}
              </span>
            </div>
            <h1 className="font-serif font-black text-3xl sm:text-4xl text-ink">
              Your Bookmarked Facts
            </h1>
            <p className="text-xs sm:text-sm text-ink3 mt-1">
              Quickly revisit key historical turning points, scientific breakthroughs, and high-yield milestones.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/notebook"
              className="px-4 py-2 bg-white hover:bg-paper2 border border-black/10 rounded-2xl text-xs font-bold text-ink transition-colors flex items-center gap-2 shadow-2xs"
            >
              <BookOpen size={14} className="text-gold" />
              <span>Open Student Notebook</span>
            </Link>

            <Link
              to="/"
              className="px-4 py-2 bg-ink hover:bg-black text-paper rounded-2xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <Sparkles size={13} className="text-gold" />
              <span>Explore More</span>
            </Link>
          </div>
        </div>

        {/* Filters & Search Controls */}
        <div className="bg-white rounded-3xl border border-black/10 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink3" />
              <input
                type="text"
                placeholder="Search saved facts, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-paper2 rounded-xl text-xs font-medium text-ink placeholder:text-ink3 border border-transparent focus:border-gold focus:bg-white focus:outline-none transition-all"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all shrink-0",
                    selectedCat === cat
                      ? "bg-ink text-paper shadow-2xs"
                      : "bg-paper2 text-ink3 hover:text-ink hover:bg-paper3"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-black/5 animate-pulse space-y-4">
                <div className="h-5 bg-paper2 rounded w-1/3"></div>
                <div className="h-6 bg-paper2 rounded w-3/4"></div>
                <div className="h-16 bg-paper2 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-black/15 p-12 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-gold/10 text-gold flex items-center justify-center mx-auto text-2xl">
              🔖
            </div>
            <h3 className="font-serif font-black text-xl text-ink">
              {searchQuery || selectedCat !== 'all' ? 'No matching bookmarks found' : 'No bookmarked facts yet'}
            </h3>
            <p className="text-xs text-ink3 leading-relaxed">
              {searchQuery || selectedCat !== 'all' 
                ? 'Try adjusting your search keywords or resetting your category filter.' 
                : 'Whenever you read an interesting fact on FActHub, click the "Bookmark" button to save it here for quick revision.'}
            </p>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-paper rounded-2xl text-xs font-bold hover:bg-black transition-all shadow-xs"
              >
                <span>Browse Curated Facts</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-ink3 px-1">
              <span>Showing {filteredBookmarks.length} {filteredBookmarks.length === 1 ? 'saved fact' : 'saved facts'}</span>
              <span>Sorted by recently bookmarked</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookmarks.map(bookmark => (
                <div
                  key={bookmark.factId}
                  className="group bg-white hover:bg-paper rounded-3xl border border-black/10 hover:border-gold/50 p-6 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-md relative"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl" role="img" aria-label="fact emoji">
                          {bookmark.factEmoji || '💡'}
                        </span>
                        <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full", {
                          "bg-coral-l text-coral": bookmark.factCat === 'history',
                          "bg-teal-l text-teal": bookmark.factCat === 'science',
                          "bg-gold-l/20 text-gold": bookmark.factCat === 'inventions',
                          "bg-indigo-l text-indigo": bookmark.factCat === 'discoveries'
                        })}>
                          {bookmark.factCat}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(bookmark.factId, bookmark.factTitle)}
                        disabled={deletingId === bookmark.factId}
                        className="text-ink3 hover:text-rose-600 p-1.5 rounded-xl hover:bg-rose-50 transition-colors"
                        title="Remove bookmark"
                        aria-label="Remove bookmark"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <Link to={`/article/${bookmark.factId}`} className="block">
                      <h3 className="font-serif font-black text-lg text-ink group-hover:text-gold transition-colors leading-snug line-clamp-2">
                        {bookmark.factTitle}
                      </h3>
                    </Link>

                    {bookmark.factExcerpt && (
                      <p className="text-xs text-ink3 line-clamp-3 leading-relaxed">
                        {bookmark.factExcerpt}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-black/5 flex items-center justify-between">
                    <div className="text-[10px] font-mono text-ink3 flex items-center gap-1">
                      <Calendar size={11} />
                      <span>{new Date(bookmark.bookmarkedAt).toLocaleDateString()}</span>
                    </div>

                    <Link
                      to={`/article/${bookmark.factId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-ink group-hover:text-gold transition-colors"
                    >
                      <span>Read Story</span>
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
