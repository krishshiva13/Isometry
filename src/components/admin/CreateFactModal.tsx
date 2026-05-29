import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Plus } from 'lucide-react';
import { factService } from '../../services/factService';
import { Fact, Category } from '../../types';

interface CreateFactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newFact: Fact) => void;
  initialCat?: Category;
}

export const CreateFactModal = ({ isOpen, onClose, onSuccess, initialCat }: CreateFactModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Fact>>({
    cat: initialCat || 'history',
    title: '',
    excerpt: '',
    full: '',
    year: new Date().getFullYear(),
    featured: false,
    emoji: '📝',
    imageUrl: '',
    imageAlt: '',
    imageCredit: '',
    eventMonth: 0,
    eventDay: 0
  });

  const categories = ['history', 'science', 'inventions', 'discoveries'];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const id = formData.title?.toLowerCase().replace(/\s+/g, '-') || `fact-${Date.now()}`;
      const newFact = { ...formData, id } as Fact;
      await factService.createFact(newFact);
      onSuccess(newFact);
      onClose();
    } catch (err) {
      alert("Failed to create fact");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-paper w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-black/5"
        >
          <div className="p-6 border-b border-black/5 flex items-center justify-between bg-paper2">
            <h2 className="text-2xl font-serif font-black flex items-center gap-3">
              <Plus className="text-gold" /> Create New Fact Article
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-all">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-ink3">Category</label>
                <select 
                  value={formData.cat}
                  onChange={(e) => setFormData({...formData, cat: e.target.value as Category})}
                  className="w-full bg-white border border-black/10 rounded-xl px-3 py-3 focus:border-gold outline-none transition-all text-sm"
                >
                  {categories.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-ink3">Year</label>
                <input 
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                  className="w-full bg-white border border-black/10 rounded-xl px-3 py-3 focus:border-gold outline-none transition-all text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-ink3">Event Month</label>
                <select 
                  value={formData.eventMonth || 0}
                  onChange={(e) => setFormData({...formData, eventMonth: parseInt(e.target.value)})}
                  className="w-full bg-white border border-black/10 rounded-xl px-3 py-3 focus:border-gold outline-none transition-all text-sm"
                >
                  <option value={0}>None (Any)</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i, 1).toLocaleString('en-US', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-ink3">Event Day</label>
                <select 
                  value={formData.eventDay || 0}
                  onChange={(e) => setFormData({...formData, eventDay: parseInt(e.target.value)})}
                  className="w-full bg-white border border-black/10 rounded-xl px-3 py-3 focus:border-gold outline-none transition-all text-sm"
                >
                  <option value={0}>None (Any)</option>
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-ink3">Title</label>
              <input 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:border-gold outline-none transition-all font-serif text-lg font-bold"
                placeholder="The Great Wall..."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-ink3">Emoji Accent</label>
                <input 
                  value={formData.emoji}
                  onChange={(e) => setFormData({...formData, emoji: e.target.value})}
                  className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:border-gold outline-none transition-all text-center text-xl"
                  placeholder="📝"
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-ink3">Cover Image URL (Optional)</label>
                <input 
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:border-gold outline-none transition-all text-sm"
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-paper2 p-4 rounded-2xl border border-black/5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-ink3">Cover Image Alt Text (SEO)</label>
                <input 
                  value={formData.imageAlt || ''}
                  onChange={(e) => setFormData({...formData, imageAlt: e.target.value})}
                  className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:border-gold outline-none transition-all text-sm"
                  placeholder="Describe what is in the image..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-ink3">Cover Image Credit / Source</label>
                <input 
                  value={formData.imageCredit || ''}
                  onChange={(e) => setFormData({...formData, imageCredit: e.target.value})}
                  className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:border-gold outline-none transition-all text-sm"
                  placeholder="e.g., Jane Smith via Wikimedia Commons"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-ink3">Excerpt (Short Summary)</label>
              <textarea 
                value={formData.excerpt}
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:border-gold outline-none transition-all h-24 resize-none"
                placeholder="Briefly describe the fact..."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-ink3">Full Article Content (Markdown)</label>
              
              <div className="p-4 rounded-xl bg-amber-50 border border-gold/30 text-xs text-ink2 leading-relaxed space-y-2 font-sans shadow-sm">
                <div className="font-bold flex items-center gap-1.5 text-ink uppercase tracking-wider text-[10px]">
                  💡 MID-ARTICLE IMAGE & CREDITS GUIDE
                </div>
                <p className="m-0 text-ink2">
                  To place images directly inside your story, use the standard Markdown format and a vertical bar <code className="bg-black/5 px-1 py-0.5 rounded text-coral font-bold font-mono">|</code> to include both **Alt Text** and **Credit/Source**:
                </p>
                <div className="bg-white border border-black/10 rounded-lg p-2 font-mono text-[11px] text-ink select-all overflow-x-auto shadow-inner">
                  ![Your Alt Text / Caption | Credit: Creator Name](IMAGE_URL)
                </div>
                <p className="m-0 text-ink3 text-[10px]">
                  <strong>Example:</strong> <code className="bg-black/5 px-1 py-0.5 rounded text-ink2">![The Great Pyramid of Giza | Credit: John Doe / Wikimedia Commons](https://images.unsplash.com/photo-1539650116574-8efeb43e2750)</code>
                </p>
              </div>

              <textarea 
                value={formData.full}
                onChange={(e) => setFormData({...formData, full: e.target.value})}
                className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:border-gold outline-none transition-all h-64 font-serif leading-relaxed"
                placeholder="Write the full story here... Use Markdown."
                required
              />
            </div>

            <div className="flex items-center gap-4 py-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                  className="w-5 h-5 accent-gold cursor-pointer"
                />
                <span className="text-sm font-bold text-ink2 group-hover:text-ink transition-all">Feature this article on home page</span>
              </label>
            </div>
          </form>

          <div className="p-6 border-t border-black/5 bg-paper2 flex justify-end gap-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-ink3 font-bold hover:bg-black/5 transition-all"
            >
              Discard
            </button>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-2.5 bg-ink text-white rounded-xl font-bold hover:bg-gold transition-all shadow-lg shadow-black/10 disabled:opacity-50"
            >
              {loading ? "Publishing..." : <><Save size={18} /> Publish Fact</>}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
