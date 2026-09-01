import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  Sparkles, 
  Check, 
  Loader2, 
  HelpCircle, 
  ArrowRight, 
  Layers, 
  Layout, 
  Bookmark, 
  Compass, 
  Link as LinkIcon,
  Filter
} from 'lucide-react';
import { factService } from '../../services/factService';
import { Fact, Category } from '../../types';
import { INITIAL_FACTS } from '../../seed';
import { EmbeddedRelatedCard } from './EmbeddedRelatedCard';

interface InsertRelatedArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (markdownTag: string, placement: 'cursor' | 'after_intro' | 'middle' | 'end') => void;
  currentArticleId?: string;
}

export const InsertRelatedArticleModal: React.FC<InsertRelatedArticleModalProps> = ({
  isOpen,
  onClose,
  onInsert,
  currentArticleId
}) => {
  const [facts, setFacts] = useState<Fact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Selection & Configuration State
  const [selectedFact, setSelectedFact] = useState<Fact | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customExcerpt, setCustomExcerpt] = useState('');
  const [cardVariant, setCardVariant] = useState<'card' | 'callout' | 'compact'>('card');
  const [placement, setPlacement] = useState<'cursor' | 'after_intro' | 'middle' | 'end'>('middle');

  useEffect(() => {
    if (!isOpen) return;

    const fetchAllArticles = async () => {
      setLoading(true);
      try {
        const liveFacts = await factService.getFacts('all', false, 50, true);
        if (liveFacts && liveFacts.length > 0) {
          // Merge with initial facts ensuring unique IDs
          const map = new Map<string, Fact>();
          liveFacts.forEach(f => map.set(f.id, f));
          INITIAL_FACTS.forEach(f => {
            if (!map.has(f.id)) map.set(f.id, f);
          });
          const merged = Array.from(map.values()).filter(f => f.id !== currentArticleId);
          setFacts(merged);
          if (merged.length > 0 && !selectedFact) {
            setSelectedFact(merged[0]);
          }
        } else {
          const filtered = INITIAL_FACTS.filter(f => f.id !== currentArticleId);
          setFacts(filtered);
          if (filtered.length > 0 && !selectedFact) {
            setSelectedFact(filtered[0]);
          }
        }
      } catch (err) {
        console.warn("Using local facts fallback", err);
        const filtered = INITIAL_FACTS.filter(f => f.id !== currentArticleId);
        setFacts(filtered);
        if (filtered.length > 0 && !selectedFact) {
          setSelectedFact(filtered[0]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllArticles();
  }, [isOpen, currentArticleId]);

  if (!isOpen) return null;

  // Filter facts by search and category
  const filteredFacts = facts.filter(f => {
    const matchesCat = selectedCategory === 'all' || f.cat.toLowerCase() === selectedCategory.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCat;

    const matchesQuery = 
      f.title.toLowerCase().includes(q) || 
      f.excerpt.toLowerCase().includes(q) ||
      (f.targetKeyword && f.targetKeyword.toLowerCase().includes(q)) ||
      (f.year && String(f.year).includes(q));

    return matchesCat && matchesQuery;
  });

  const handleSelectFact = (fact: Fact) => {
    setSelectedFact(fact);
    setCustomTitle(fact.title);
    setCustomExcerpt(fact.excerpt);
    setCustomUrl(`/fact/${fact.id}`);
  };

  const handleConfirmInsert = () => {
    if (!selectedFact && !customUrl.trim()) {
      alert("Please select an article or provide a valid post link.");
      return;
    }

    const targetId = selectedFact ? selectedFact.id : (customUrl.match(/\/fact\/([^/?#]+)/)?.[1] || '');
    const title = (customTitle || selectedFact?.title || '').replace(/"/g, "'").trim();
    const excerpt = (customExcerpt || selectedFact?.excerpt || '').replace(/"/g, "'").trim();
    const cat = selectedFact?.cat || 'history';
    const image = selectedFact?.imageUrl || '';

    // Markdown tag format:
    // :::related[FACT_ID]{title="..." excerpt="..." cat="..." image="..." variant="..."}:::
    // This allows exact hydration in renderers and stays clean and readable
    const markdownTag = `\n\n:::related[${targetId || customUrl}]{title="${title}" excerpt="${excerpt}" cat="${cat}" image="${image}" variant="${cardVariant}"}:::\n\n`;

    onInsert(markdownTag, placement);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[300] bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-paper w-full max-w-4xl rounded-3xl shadow-2xl border border-black/10 overflow-hidden flex flex-col my-auto max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-paper2 border-b border-black/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gold/20 text-gold flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="font-serif font-black text-lg text-ink">
                Embed Related Article in Blog Content
              </h3>
              <p className="text-xs text-ink3">
                Insert a magazine-grade "Read Also" post card or callout anywhere in your article
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/5 text-ink3 hover:text-ink transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden flex-1 min-h-0">
          
          {/* Left Column: Article Search & Selection (7 cols) */}
          <div className="lg:col-span-7 p-5 border-b lg:border-b-0 lg:border-r border-black/10 flex flex-col gap-3 overflow-y-auto max-h-[50vh] lg:max-h-[75vh]">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-ink3 block">
                1. Select an Article from your Publication
              </label>
              
              {/* Search Bar */}
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles by title, topic, or keyword..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-black/10 rounded-xl text-xs text-ink focus:border-gold outline-none"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {['all', 'history', 'science', 'inventions', 'discoveries', 'birthdays'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg font-bold capitalize whitespace-nowrap transition-all text-[11px] ${
                      selectedCategory === cat 
                        ? 'bg-ink text-white shadow-2xs' 
                        : 'bg-paper2 text-ink3 hover:text-ink border border-black/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Facts */}
            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-ink3 text-xs">
                  <Loader2 size={20} className="animate-spin text-gold" />
                  <span>Loading publication articles...</span>
                </div>
              ) : filteredFacts.length === 0 ? (
                <div className="py-10 text-center text-xs text-ink3 bg-paper2/50 rounded-2xl p-4 border border-dashed border-black/10">
                  No articles found matching "{searchQuery}". You can paste a custom link on the right.
                </div>
              ) : (
                filteredFacts.map((item) => {
                  const isSelected = selectedFact?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectFact(item)}
                      className={`w-full p-3 rounded-2xl border text-left transition-all flex items-start gap-3 group ${
                        isSelected
                          ? 'border-gold bg-gold/10 ring-2 ring-gold/20 shadow-xs'
                          : 'border-black/5 bg-white hover:bg-paper2 hover:border-black/15'
                      }`}
                    >
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.title}
                          className="w-14 h-14 object-cover rounded-xl border border-black/5 flex-shrink-0"
                          onError={(e) => { (e.target as any).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-paper2 border border-black/5 flex items-center justify-center text-xl flex-shrink-0">
                          {item.emoji || '📖'}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-paper3 text-ink2 border border-black/5">
                            {item.cat}
                          </span>
                          {item.year && (
                            <span className="text-[10px] text-ink3 font-mono">
                              {item.year < 0 ? `${Math.abs(item.year)} BC` : item.year}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-serif font-bold text-ink group-hover:text-gold line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-ink3 line-clamp-1 mt-0.5">
                          {item.excerpt}
                        </p>
                      </div>

                      <div className="flex-shrink-0 self-center">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          isSelected ? 'bg-gold text-ink font-bold' : 'border border-black/15 text-transparent'
                        }`}>
                          <Check size={12} />
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Style, Placement & Live Preview (5 cols) */}
          <div className="lg:col-span-5 p-5 bg-paper2 flex flex-col gap-4 overflow-y-auto max-h-[50vh] lg:max-h-[75vh]">
            
            {/* Style Variant Choice */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-ink3 block">
                2. Choose Card Layout Style
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setCardVariant('card')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    cardVariant === 'card'
                      ? 'bg-ink text-white border-ink shadow-xs'
                      : 'bg-white text-ink2 border-black/10 hover:bg-paper3'
                  }`}
                >
                  <span className="block text-sm mb-0.5">📰</span>
                  <span className="text-[11px] font-bold block">Magazine Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCardVariant('callout')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    cardVariant === 'callout'
                      ? 'bg-ink text-white border-ink shadow-xs'
                      : 'bg-white text-ink2 border-black/10 hover:bg-paper3'
                  }`}
                >
                  <span className="block text-sm mb-0.5">📌</span>
                  <span className="text-[11px] font-bold block">Callout Bar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCardVariant('compact')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    cardVariant === 'compact'
                      ? 'bg-ink text-white border-ink shadow-xs'
                      : 'bg-white text-ink2 border-black/10 hover:bg-paper3'
                  }`}
                >
                  <span className="block text-sm mb-0.5">🔗</span>
                  <span className="text-[11px] font-bold block">Compact Link</span>
                </button>
              </div>
            </div>

            {/* Placement Choice */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-ink3 block">
                3. Where to insert in the blog content?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPlacement('cursor')}
                  className={`p-2 rounded-xl border text-center text-xs font-bold transition-all ${
                    placement === 'cursor'
                      ? 'bg-gold text-ink border-gold shadow-xs font-black'
                      : 'bg-white text-ink2 border-black/10 hover:bg-paper3'
                  }`}
                >
                  <span className="block text-xs mb-0.5">📍</span>
                  <span>Cursor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlacement('after_intro')}
                  className={`p-2 rounded-xl border text-center text-xs font-bold transition-all ${
                    placement === 'after_intro'
                      ? 'bg-gold text-ink border-gold shadow-xs font-black'
                      : 'bg-white text-ink2 border-black/10 hover:bg-paper3'
                  }`}
                >
                  <span className="block text-xs mb-0.5">📌</span>
                  <span>After Intro</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlacement('middle')}
                  className={`p-2 rounded-xl border text-center text-xs font-bold transition-all ${
                    placement === 'middle'
                      ? 'bg-gold text-ink border-gold shadow-xs font-black'
                      : 'bg-white text-ink2 border-black/10 hover:bg-paper3'
                  }`}
                >
                  <span className="block text-xs mb-0.5">⚖️</span>
                  <span>In Middle</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlacement('end')}
                  className={`p-2 rounded-xl border text-center text-xs font-bold transition-all ${
                    placement === 'end'
                      ? 'bg-gold text-ink border-gold shadow-xs font-black'
                      : 'bg-white text-ink2 border-black/10 hover:bg-paper3'
                  }`}
                >
                  <span className="block text-xs mb-0.5">🏁</span>
                  <span>At End</span>
                </button>
              </div>
            </div>

            {/* Live Reader Preview of Card */}
            <div className="space-y-1.5 flex-1 min-h-[140px]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-ink3 flex items-center justify-between">
                <span>Live Reader Preview</span>
                <span className="text-gold font-medium text-[10px]">Embedded Output</span>
              </div>

              {selectedFact ? (
                <div className="transform scale-95 origin-top">
                  <EmbeddedRelatedCard
                    factId={selectedFact.id}
                    title={customTitle || selectedFact.title}
                    excerpt={customExcerpt || selectedFact.excerpt}
                    category={selectedFact.cat}
                    imageUrl={selectedFact.imageUrl}
                    styleVariant={cardVariant}
                  />
                </div>
              ) : (
                <div className="p-6 bg-white rounded-2xl border border-black/10 text-center text-xs text-ink3">
                  Select an article on the left to see live preview
                </div>
              )}
            </div>

            {/* Markdown Tag Note */}
            <div className="p-2.5 bg-amber-50 rounded-xl border border-gold/30 text-[10px] text-ink2 leading-relaxed flex items-start gap-1.5">
              <HelpCircle size={13} className="text-gold flex-shrink-0 mt-0.5" />
              <span>
                <strong>Markdown Directive:</strong> Injects <code className="bg-white px-1 py-0.5 rounded border border-black/10 font-mono text-[9px] text-coral font-bold">:::related[id]{'{...}'}:::</code> which converts into this interactive story card for your readers.
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-paper2 border-t border-black/10 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-ink3 hover:text-ink transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleConfirmInsert}
            disabled={!selectedFact && !customUrl.trim()}
            className="px-6 py-2.5 bg-ink hover:bg-gold text-white hover:text-ink text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check size={14} />
            <span>Insert Related Article Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
