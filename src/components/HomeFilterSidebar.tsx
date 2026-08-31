import React from 'react';
import { 
  Filter, 
  Tag, 
  Layers, 
  SlidersHorizontal, 
  Calendar, 
  Sparkles, 
  GraduationCap, 
  Rocket, 
  BookOpen, 
  Check, 
  X,
  Search,
  ArrowUpDown
} from 'lucide-react';
import { Category } from '../types';
import { cn } from '../lib/utils';

export interface FilterCriteria {
  category: Category | 'all';
  tag: string;
  sortBy: 'newest' | 'year-asc' | 'year-desc' | 'featured';
  searchQuery: string;
}

interface HomeFilterSidebarProps {
  filters: FilterCriteria;
  onChange: (filters: FilterCriteria) => void;
  categoryCounts: Record<string, number>;
  totalCount: number;
  filteredCount: number;
}

export const GK_TAG_OPTIONS = [
  { id: 'all', label: 'All Topics', emoji: '🌟' },
  { id: 'upsc', label: 'UPSC Civil Services', emoji: '🏛️', match: ['upsc', 'civil services', 'prelims', 'mains', 'polity', 'constitution'] },
  { id: 'ssc', label: 'SSC & Railways', emoji: '🚆', match: ['ssc', 'cgl', 'chsl', 'rrb', 'railway', 'ntpc'] },
  { id: 'space', label: 'Space & ISRO', emoji: '🚀', match: ['isro', 'space', 'satellite', 'nasa', 'chandrayaan', 'moon', 'mars', 'orbit'] },
  { id: 'science', label: 'Science & Physics', emoji: '🔬', match: ['science', 'physics', 'chemistry', 'biology', 'quantum', 'dna', 'nobel'] },
  { id: 'history', label: 'Freedom & World History', emoji: '📜', match: ['freedom', 'war', 'treaty', 'empire', 'revolution', 'independence', 'ancient'] },
  { id: 'inventions', label: 'Inventions & Tech', emoji: '💡', match: ['invented', 'patent', 'computer', 'engine', 'technology', 'telephone', 'electricity'] }
];

export const HomeFilterSidebar: React.FC<HomeFilterSidebarProps> = ({
  filters,
  onChange,
  categoryCounts,
  totalCount,
  filteredCount
}) => {
  const categories: Array<{ id: Category | 'all'; label: string; color: string; emoji: string }> = [
    { id: 'all', label: 'All Categories', color: 'text-ink', emoji: '🌐' },
    { id: 'history', label: 'History', color: 'text-coral', emoji: '⏳' },
    { id: 'science', label: 'Science', color: 'text-teal', emoji: '🔬' },
    { id: 'inventions', label: 'Inventions', color: 'text-gold', emoji: '💡' },
    { id: 'discoveries', label: 'Discoveries', color: 'text-indigo', emoji: '🧭' },
    { id: 'birthdays', label: 'Birthdays', color: 'text-sage', emoji: '🎂' }
  ];

  const handleCategoryChange = (cat: Category | 'all') => {
    onChange({ ...filters, category: cat });
  };

  const handleTagChange = (tagId: string) => {
    onChange({ ...filters, tag: tagId });
  };

  const handleSortChange = (sortBy: FilterCriteria['sortBy']) => {
    onChange({ ...filters, sortBy });
  };

  const handleSearchChange = (query: string) => {
    onChange({ ...filters, searchQuery: query });
  };

  const handleReset = () => {
    onChange({
      category: 'all',
      tag: 'all',
      sortBy: 'newest',
      searchQuery: ''
    });
  };

  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.tag !== 'all' ||
    filters.sortBy !== 'newest' ||
    filters.searchQuery.trim() !== '';

  return (
    <aside className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm space-y-6 self-start">
      
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-black/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gold/15 text-gold flex items-center justify-center">
            <Filter size={16} />
          </div>
          <div>
            <h3 className="text-sm font-serif font-bold text-ink">Filter Feed</h3>
            <span className="text-[10px] text-ink3">
              Showing {filteredCount} of {totalCount} facts
            </span>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline"
          >
            <X size={12} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Quick Search */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-ink3 flex items-center gap-1">
          <Search size={12} /> Search Facts
        </label>
        <div className="relative">
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search keywords, events, years..."
            className="w-full bg-paper2 border border-black/10 rounded-xl px-3 py-2 text-xs text-ink focus:border-gold outline-none placeholder:text-ink3/60"
          />
          {filters.searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink3 hover:text-ink"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-ink3 flex items-center gap-1">
          <Layers size={12} /> Categories
        </label>
        <div className="space-y-1">
          {categories.map((cat) => {
            const isSelected = filters.category === cat.id;
            const count = cat.id === 'all' ? totalCount : categoryCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left",
                  isSelected
                    ? "bg-ink text-white shadow-sm"
                    : "text-ink hover:bg-paper2 hover:text-gold"
                )}
              >
                <div className="flex items-center gap-2">
                  <span>{cat.emoji}</span>
                  <span className={isSelected ? "text-white" : cat.color}>{cat.label}</span>
                </div>
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-mono font-medium",
                    isSelected ? "bg-white/20 text-white" : "bg-paper2 text-ink3"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Focus / Exam Preparation Tags */}
      <div className="space-y-2 pt-1 border-t border-black/5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-ink3 flex items-center gap-1">
          <Tag size={12} /> Study & GK Focus Tags
        </label>
        <div className="flex flex-wrap gap-1.5">
          {GK_TAG_OPTIONS.map((tag) => {
            const isSelected = filters.tag === tag.id;
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagChange(tag.id)}
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all",
                  isSelected
                    ? "bg-gold text-ink shadow-xs"
                    : "bg-paper2 text-ink3 hover:text-ink hover:bg-black/5"
                )}
              >
                <span>{tag.emoji}</span>
                <span>{tag.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort By Options */}
      <div className="space-y-2 pt-1 border-t border-black/5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-ink3 flex items-center gap-1">
          <ArrowUpDown size={12} /> Chronology & Sorting
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'newest', label: '✨ Latest Added' },
            { id: 'featured', label: '⭐ Featured First' },
            { id: 'year-asc', label: '⏳ Ancient → Modern' },
            { id: 'year-desc', label: '📅 Modern → Ancient' }
          ].map((sort) => {
            const isSelected = filters.sortBy === sort.id;
            return (
              <button
                key={sort.id}
                type="button"
                onClick={() => handleSortChange(sort.id as FilterCriteria['sortBy'])}
                className={cn(
                  "p-2 rounded-xl text-[11px] font-bold text-left transition-all border",
                  isSelected
                    ? "bg-ink text-white border-ink shadow-xs"
                    : "bg-paper2 text-ink3 border-transparent hover:text-ink hover:bg-black/5"
                )}
              >
                {sort.label}
              </button>
            );
          })}
        </div>
      </div>

    </aside>
  );
};
