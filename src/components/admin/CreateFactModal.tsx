import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Plus, Calendar, Clock, ShoppingBag, Trash2, ExternalLink, BookCheck, ShieldAlert } from 'lucide-react';
import { factService } from '../../services/factService';
import { Fact, Category, AffiliateProduct } from '../../types';
import { ImageUploadField } from '../common/ImageUploadField';
import { MarkdownToolbar } from '../common/MarkdownToolbar';

const COLOR_OPTIONS = [
  { name: 'gold', label: 'Gold', bg: 'bg-[#d9ad42]', text: 'text-[#d9ad42]' },
  { name: 'coral', label: 'Coral', bg: 'bg-[#ff6b6b]', text: 'text-[#ff6b6b]' },
  { name: 'teal', label: 'Teal', bg: 'bg-[#2ec4b6]', text: 'text-[#2ec4b6]' },
  { name: 'indigo', label: 'Indigo', bg: 'bg-[#4f46e5]', text: 'text-[#4f46e5]' },
  { name: 'red', label: 'Red', bg: 'bg-rose-600', text: 'text-rose-600' },
  { name: 'green', label: 'Green', bg: 'bg-emerald-600', text: 'text-emerald-600' },
  { name: 'blue', label: 'Blue', bg: 'bg-blue-600', text: 'text-blue-600' },
  { name: 'slate', label: 'Slate', bg: 'bg-slate-600', text: 'text-slate-600' },
  { name: 'purple', label: 'Purple', bg: 'bg-purple-600', text: 'text-purple-600' }
];

interface CreateFactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newFact: Fact) => void;
  initialCat?: Category;
}

export const CreateFactModal = ({ isOpen, onClose, onSuccess, initialCat }: CreateFactModalProps) => {
  const [loading, setLoading] = useState(false);
  const [pubType, setPubType] = useState<'immediate' | 'schedule'>('immediate');
  const [scheduleTime, setScheduleTime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    d.setMinutes(0);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });

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

  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<AffiliateProduct>({
    title: '',
    authorOrBrand: '',
    url: '',
    imageUrl: '',
    badge: 'Recommended Book',
    note: '',
    price: 'View on Amazon',
    platform: 'Amazon'
  });

  const handleAddProduct = () => {
    if (!currentProduct.title.trim() || !currentProduct.url.trim()) {
      alert("Please provide at least a Product/Book Title and an Affiliate URL.");
      return;
    }
    setProducts([...products, { ...currentProduct }]);
    setCurrentProduct({
      title: '',
      authorOrBrand: '',
      url: '',
      imageUrl: '',
      badge: 'Recommended Book',
      note: '',
      price: 'View on Amazon',
      platform: 'Amazon'
    });
    setShowProductForm(false);
  };

  const handleRemoveProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsertColor = (colorName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = formData.full || '';
    const selectedText = currentText.substring(start, end);
    const replacement = `[${colorName}]${selectedText || 'important text'}[/${colorName}]`;

    const newValue = currentText.substring(0, start) + replacement + currentText.substring(end);
    setFormData({ ...formData, full: newValue });

    // Re-focus and set selection back
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + replacement.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const categories = ['history', 'science', 'inventions', 'discoveries'];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanTitle = formData.title?.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-') || `fact-${Date.now()}`;
      const id = cleanTitle.substring(0, 100);
      const newFact: any = { 
        ...formData, 
        id
      };
      if (products.length > 0) {
        newFact.affiliateProducts = products;
      }
      if (pubType === 'schedule') {
        newFact.publishAt = scheduleTime;
      }
      await factService.createFact(newFact as Fact);
      onSuccess(newFact);
      onClose();
    } catch (err: any) {
      console.error("Create fact error details:", err);
      let message = "Failed to create fact";
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.error) {
          message += `:\n${parsed.error}`;
        }
      } catch {
        if (err?.message) {
          message += `:\n${err.message}`;
        }
      }
      alert(message);
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

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-ink3">Emoji Accent</label>
                <input 
                  value={formData.emoji}
                  onChange={(e) => setFormData({...formData, emoji: e.target.value})}
                  className="w-24 bg-white border border-black/10 rounded-xl px-4 py-2.5 focus:border-gold outline-none transition-all text-center text-xl"
                  placeholder="📝"
                />
              </div>

              <div className="bg-paper2 p-4 rounded-2xl border border-black/5">
                <ImageUploadField
                  label="Cover / Featured Image"
                  imageUrl={formData.imageUrl || ''}
                  imageAlt={formData.imageAlt || formData.title}
                  imageCredit={formData.imageCredit || ''}
                  onChange={(media) => {
                    setFormData({
                      ...formData,
                      imageUrl: media.imageUrl,
                      imageAlt: media.imageAlt !== undefined ? media.imageAlt : formData.imageAlt,
                      imageCredit: media.imageCredit !== undefined ? media.imageCredit : formData.imageCredit
                    });
                  }}
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

              {/* Interactive Easy Text Color Injector */}
              <div className="p-5 rounded-2xl bg-white border border-black/10 space-y-3 font-sans shadow-sm">
                <div className="text-xs font-bold uppercase tracking-widest text-ink flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
                  🎨 Click to Add Color to Heading or Important Words
                </div>
                <p className="text-xs text-ink3 leading-normal">
                  Select a word or a sentence in the editor below, and click a color to highlight it instantly:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => handleInsertColor(c.name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/5 hover:border-black/10 hover:bg-black/5 transition-all text-xs font-bold cursor-pointer"
                    >
                      <span className={`w-3 h-3 rounded-full shadow-inner ${c.bg}`} />
                      <span className={c.text}>{c.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-ink3 leading-relaxed border-t border-black/5 pt-2">
                  * Highlights work on any text, headings (e.g. <code className="font-mono"># Heading</code>), lists, and paragraphs without requiring any HTML coding.
                </p>
              </div>

              {/* Formatting and Bullet / Number List Toolbar */}
              <MarkdownToolbar
                textareaRef={textareaRef}
                value={formData.full || ''}
                onChange={(val) => setFormData({ ...formData, full: val })}
              />

              <textarea 
                ref={textareaRef}
                value={formData.full}
                onChange={(e) => setFormData({...formData, full: e.target.value})}
                className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:border-gold outline-none transition-all h-64 font-serif leading-relaxed"
                placeholder="Write the full story here... Use Markdown or the list formatting tools above."
                required
              />
            </div>

            {/* Recommended Products & Affiliate Books Section */}
            <div className="bg-white p-6 rounded-2xl border border-black/10 shadow-sm space-y-4 font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-ink font-serif font-bold text-base">
                    <ShoppingBag size={18} className="text-gold" />
                    <span>Recommended Books & Products (Affiliate Links)</span>
                  </div>
                  <p className="text-xs text-ink3">
                    Add relevant books or tools for this article. Links will automatically follow Google SEO and Amazon compliance rules.
                  </p>
                </div>
                {!showProductForm && (
                  <button
                    type="button"
                    onClick={() => setShowProductForm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-paper2 hover:bg-gold/20 hover:text-ink text-xs font-bold rounded-xl border border-black/5 transition-all w-fit"
                  >
                    <Plus size={14} /> Add Product / Book
                  </button>
                )}
              </div>

              {/* Compliance note */}
              <div className="p-3 bg-emerald-50/60 border border-emerald-200/50 rounded-xl flex items-start gap-2 text-xs text-emerald-950">
                <ShieldAlert size={16} className="text-emerald-700 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Google & FTC Safeguard Enabled:</strong> Links automatically include <code className="bg-emerald-100/60 px-1 py-0.5 rounded font-mono text-[11px]">rel="nofollow sponsored"</code> and reader-disclosure badges to keep your SEO score 100% safe.
                </span>
              </div>

              {/* Added Products List */}
              {products.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-ink3">
                    Attached Products ({products.length}):
                  </div>
                  <div className="grid gap-2">
                    {products.map((p, idx) => (
                      <div key={idx} className="p-3 bg-paper2 rounded-xl border border-black/5 flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.title} className="w-10 h-10 object-cover rounded-lg border border-black/10 flex-shrink-0 bg-white" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center text-xs flex-shrink-0 font-serif">📖</div>
                          )}
                          <div className="truncate">
                            <div className="font-bold text-ink truncate flex items-center gap-1.5">
                              <span>{p.title}</span>
                              {p.authorOrBrand && <span className="text-xs text-ink3 font-normal">by {p.authorOrBrand}</span>}
                            </div>
                            <div className="text-xs text-ink3 truncate font-mono flex items-center gap-2">
                              <span className="text-gold font-bold">{p.badge || 'Recommended'}</span>
                              <span>•</span>
                              <span className="truncate">{p.url}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(idx)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
                          title="Remove product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                !showProductForm && (
                  <p className="text-xs text-ink3 italic py-1">
                    No affiliate products attached yet. Click "+ Add Product / Book" to recommend resources for this post.
                  </p>
                )
              )}

              {/* Inline Product Creator Form */}
              {showProductForm && (
                <div className="p-4 bg-paper2 rounded-2xl border border-black/10 space-y-3 animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center justify-between border-b border-black/5 pb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-ink flex items-center gap-1.5">
                      <BookCheck size={14} className="text-gold" />
                      Add Product Details
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowProductForm(false)}
                      className="text-xs text-ink3 hover:text-ink font-medium"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">Book / Product Title *</label>
                      <input
                        type="text"
                        value={currentProduct.title}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, title: e.target.value })}
                        placeholder="e.g., A Brief History of Time"
                        className="w-full bg-white border border-black/10 rounded-xl p-2.5 text-xs text-ink focus:outline-none focus:border-gold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">Author / Brand</label>
                      <input
                        type="text"
                        value={currentProduct.authorOrBrand}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, authorOrBrand: e.target.value })}
                        placeholder="e.g., Stephen Hawking"
                        className="w-full bg-white border border-black/10 rounded-xl p-2.5 text-xs text-ink focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">Affiliate Link URL (Amazon / Bookshop) *</label>
                      <input
                        type="url"
                        value={currentProduct.url}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, url: e.target.value })}
                        placeholder="https://amzn.to/... or https://amazon.com/dp/..."
                        className="w-full bg-white border border-black/10 rounded-xl p-2.5 text-xs text-ink focus:outline-none focus:border-gold font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">Product Image URL (Optional)</label>
                      <input
                        type="url"
                        value={currentProduct.imageUrl}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, imageUrl: e.target.value })}
                        placeholder="https://images-na.ssl-images-amazon.com/..."
                        className="w-full bg-white border border-black/10 rounded-xl p-2.5 text-xs text-ink focus:outline-none focus:border-gold font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">Badge / Tag</label>
                      <input
                        type="text"
                        value={currentProduct.badge}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, badge: e.target.value })}
                        placeholder="e.g., Recommended Book, Editor's Pick"
                        className="w-full bg-white border border-black/10 rounded-xl p-2.5 text-xs text-ink focus:outline-none focus:border-gold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">Button CTA Text</label>
                      <input
                        type="text"
                        value={currentProduct.price}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, price: e.target.value })}
                        placeholder="e.g., View on Amazon, Buy Book"
                        className="w-full bg-white border border-black/10 rounded-xl p-2.5 text-xs text-ink focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">Why We Recommend This (Note for Readers)</label>
                    <input
                      type="text"
                      value={currentProduct.note}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, note: e.target.value })}
                      placeholder="e.g., The definitive guide explaining quantum theory and relativity for beginners."
                      className="w-full bg-white border border-black/10 rounded-xl p-2.5 text-xs text-ink focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowProductForm(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-ink3 hover:bg-black/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      className="px-5 py-2 bg-ink text-white rounded-xl text-xs font-bold hover:bg-gold hover:text-ink transition-all shadow"
                    >
                      Add to Article
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Scheduling and Publish section */}
            <div className="bg-paper2 p-6 rounded-2xl border border-black/5 space-y-4">
              <div className="flex items-center gap-2 text-gold font-serif font-bold text-sm">
                <Calendar size={18} />
                <span>Publication Schedule</span>
              </div>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="pubType"
                    value="immediate"
                    checked={pubType === 'immediate'}
                    onChange={() => setPubType('immediate')}
                    className="w-4 h-4 accent-gold cursor-pointer"
                  />
                  <span className="text-sm font-bold text-ink2 group-hover:text-ink transition-colors">Publish Immediately</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="pubType"
                    value="schedule"
                    checked={pubType === 'schedule'}
                    onChange={() => setPubType('schedule')}
                    className="w-4 h-4 accent-gold cursor-pointer"
                  />
                  <span className="text-sm font-bold text-ink2 group-hover:text-ink transition-colors">Schedule for Later</span>
                </label>
              </div>
              
              {pubType === 'schedule' && (
                <div className="p-4 bg-white border border-black/10 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="space-y-1.5 max-w-sm">
                    <label className="text-xs font-bold uppercase tracking-widest text-ink3 flex items-center gap-1.5">
                      <Clock size={14} className="text-gold" />
                      Release Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full bg-paper border border-black/10 rounded-lg px-3 py-2.5 focus:border-gold outline-none transition-all text-sm font-sans font-medium"
                      required
                      min={new Date().toISOString().substring(0, 16)}
                    />
                    <p className="text-[10px] text-ink3 leading-relaxed">
                      * Scheduled blogs are hidden from search engines and visitors until the selected release time is reached.
                    </p>
                  </div>
                </div>
              )}
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
