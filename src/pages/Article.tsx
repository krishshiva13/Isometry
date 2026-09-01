import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, BookOpen, Share2, Copy, Send, Twitter, Facebook, Edit2, Save, X as CloseIcon, Trash2, ShoppingBag, ExternalLink, ShieldCheck, Plus, BookCheck, Bookmark, Sparkles, Image, Volume2, Award } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { factService } from '../services/factService';
import { Fact, AffiliateProduct } from '../types';
import { cn } from '../lib/utils';
import { INITIAL_FACTS } from '../seed';
import { useAuth } from '../contexts/AuthContext';
import { AudioNarrationPlayer } from '../components/AudioNarrationPlayer';
import { ShareCardModal } from '../components/ShareCardModal';
import { SaveToNotebookModal } from '../components/SaveToNotebookModal';
import { notebookService } from '../services/notebookService';
import { ArticleHeroImage } from '../components/common/ArticleHeroImage';
import { ImageUploadField } from '../components/common/ImageUploadField';
import { MarkdownToolbar } from '../components/common/MarkdownToolbar';
import { normalizeImageUrl } from '../lib/imageUtils';
import { recordFactRead } from '../components/DailyGoalTracker';

const DEFAULT_CATEGORY_BOOKS: Record<string, AffiliateProduct[]> = {
  history: [
    {
      title: "Sapiens: A Brief History of Humankind",
      authorOrBrand: "Yuval Noah Harari",
      url: "https://www.amazon.com/dp/0062316095",
      imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400",
      badge: "⭐ Essential History",
      note: "An international bestseller exploring 70,000 years of human evolution, cognition, and civilizations.",
      price: "View on Amazon",
      platform: "Amazon"
    }
  ],
  science: [
    {
      title: "A Short History of Nearly Everything",
      authorOrBrand: "Bill Bryson",
      url: "https://www.amazon.com/dp/076790818X",
      imageUrl: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&q=80&w=400",
      badge: "🔬 Top Science Read",
      note: "A journey through physical sciences, geology, and biology explained in an engaging and accessible narrative.",
      price: "View on Amazon",
      platform: "Amazon"
    }
  ],
  inventions: [
    {
      title: "The Innovators: How a Group of Hackers and Geeks Created the Digital Revolution",
      authorOrBrand: "Walter Isaacson",
      url: "https://www.amazon.com/dp/1476708703",
      imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400",
      badge: "💡 Tech & Inventions",
      note: "The story of the pioneering minds behind the computer, internet, and digital age innovations.",
      price: "View on Amazon",
      platform: "Amazon"
    }
  ],
  discoveries: [
    {
      title: "Cosmos",
      authorOrBrand: "Carl Sagan",
      url: "https://www.amazon.com/dp/0345539435",
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400",
      badge: "🔭 Astronomy Classic",
      note: "The landmark masterwork on astrophysics, cosmic exploration, and humanity's place in the universe.",
      price: "View on Amazon",
      platform: "Amazon"
    }
  ]
};

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

const renderHighlightedText = (text: string) => {
  if (!text) return null;
  
  const regex = /\[(gold|coral|teal|indigo|red|green|blue|slate|purple)\](.*?)\[\/\1\]/gi;
  const elements: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  let match;
  
  const localRegex = new RegExp(regex);
  
  while ((match = localRegex.exec(text)) !== null) {
    const matchIndex = match.index;
    const color = match[1].toLowerCase();
    const content = match[2];
    
    if (matchIndex > lastIndex) {
      elements.push(text.substring(lastIndex, matchIndex));
    }
    
    let textColorClass = "text-gold";
    if (color === "coral") textColorClass = "text-coral font-bold";
    else if (color === "teal") textColorClass = "text-teal font-bold";
    else if (color === "indigo") textColorClass = "text-indigo font-bold";
    else if (color === "red") textColorClass = "text-rose-600 font-bold";
    else if (color === "green") textColorClass = "text-emerald-600 font-bold";
    else if (color === "blue") textColorClass = "text-blue-600 font-bold";
    else if (color === "slate") textColorClass = "text-slate-600 font-bold";
    else if (color === "purple") textColorClass = "text-purple-600 font-bold";
    else textColorClass = "text-gold font-bold";
    
    elements.push(
      <span key={matchIndex} className={textColorClass}>
        {content}
      </span>
    );
    
    lastIndex = localRegex.lastIndex;
  }
  
  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }
  
  return elements.length > 0 ? elements : text;
};

const renderers = {
  h1: ({ children }: any) => {
    const text = typeof children === 'string' ? children : '';
    return (
      <h1 className="text-3xl font-serif font-black text-ink mt-8 mb-4">
        {text ? renderHighlightedText(text) : React.Children.map(children, child => typeof child === 'string' ? renderHighlightedText(child) : child)}
      </h1>
    );
  },
  h2: ({ children }: any) => {
    const text = typeof children === 'string' ? children : '';
    return (
      <h2 className="text-2xl font-serif font-black text-ink mt-6 mb-3">
        {text ? renderHighlightedText(text) : React.Children.map(children, child => typeof child === 'string' ? renderHighlightedText(child) : child)}
      </h2>
    );
  },
  h3: ({ children }: any) => {
    const text = typeof children === 'string' ? children : '';
    return (
      <h3 className="text-xl font-serif font-bold text-ink mt-4 mb-2">
        {text ? renderHighlightedText(text) : React.Children.map(children, child => typeof child === 'string' ? renderHighlightedText(child) : child)}
      </h3>
    );
  },
  p: ({ children }: any) => {
    const formattedChildren = React.Children.map(children, child => {
      if (typeof child === 'string') {
        return renderHighlightedText(child);
      }
      return child;
    });
    return <p className="leading-relaxed text-ink2 mb-6">{formattedChildren}</p>;
  },
  li: ({ children }: any) => {
    const formattedChildren = React.Children.map(children, child => {
      if (typeof child === 'string') {
        return renderHighlightedText(child);
      }
      return child;
    });
    return <li className="text-ink2 mb-2">{formattedChildren}</li>;
  },
  img: ({ src, alt }: any) => {
    const parts = alt ? alt.split('|') : [];
    const altText = parts[0] ? parts[0].trim() : '';
    const credit = parts[1] ? parts[1].trim() : '';
    const cleanSrc = normalizeImageUrl(src);

    return (
      <span className="block my-8 space-y-2">
        <span className="block w-full rounded-2xl overflow-hidden shadow-md border border-black/5 bg-paper2">
          <img 
            src={cleanSrc} 
            alt={altText || 'Article media'} 
            className="w-full h-auto object-cover max-h-[500px]" 
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              if (target.src.includes('?width=')) {
                target.src = target.src.split('?')[0];
              }
            }}
          />
        </span>
        {(altText || credit) && (
          <span className="block text-center font-sans text-xs text-ink3 leading-normal px-4">
            {altText && <span className="text-ink2 font-medium">{altText}</span>}
            {altText && credit && <span className="mx-1.5 opacity-30">|</span>}
            {credit && <span className="italic">{credit}</span>}
          </span>
        )}
      </span>
    );
  }
};

export const Article = () => {
  const { id } = useParams<{ id: string }>();
  const [fact, setFact] = useState<Fact | null>(null);
  const [related, setRelated] = useState<Fact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Fact>>({});
  const [isDeletingConfirm, setIsDeletingConfirm] = useState(false);
  const [showShareCardModal, setShowShareCardModal] = useState(false);
  const [showSaveNotebookModal, setShowSaveNotebookModal] = useState(false);
  const [showTelegramCapsuleToast, setShowTelegramCapsuleToast] = useState(false);
  const [showProductFormInEdit, setShowProductFormInEdit] = useState(false);
  const [newProductInEdit, setNewProductInEdit] = useState<AffiliateProduct>({
    title: '',
    authorOrBrand: '',
    url: '',
    imageUrl: '',
    badge: 'Recommended Book',
    note: '',
    price: 'View on Amazon',
    platform: 'Amazon'
  });
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsertColor = (colorName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = editData.full || '';
    const selectedText = currentText.substring(start, end);
    const replacement = `[${colorName}]${selectedText || 'important text'}[/${colorName}]`;

    const newValue = currentText.substring(0, start) + replacement + currentText.substring(end);
    setEditData({ ...editData, full: newValue });

    // Re-focus and set selection back
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + replacement.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  useEffect(() => {
    const loadArticle = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await factService.getFactById(id);
        if (data) {
          const nowISO = new Date().toISOString();
          if (data.publishAt && data.publishAt > nowISO && !isAdmin) {
            setError("This interesting fact is scheduled for a future release! Please check back later.");
          } else {
            setFact(data);
            recordFactRead();
            const allFromCat = await factService.getFacts(data.cat, false, 20, isAdmin);
            setRelated(allFromCat?.filter(f => f.id !== id).slice(0, 4) || []);
          }
        } else {
          // Fallback to seed data if not found in Firestore
          const localFact = INITIAL_FACTS.find(f => f.id === id);
          if (localFact) {
            setFact(localFact);
            setRelated(INITIAL_FACTS.filter(f => f.cat === localFact.cat && f.id !== id).slice(0, 4));
          } else {
            setError("Fact not found in our universe.");
          }
        }
      } catch (err: any) {
        console.error("Failed to load article", err);
        // Fallback to local if network error
        const localFact = INITIAL_FACTS.find(f => f.id === id);
        if (localFact) {
          setFact(localFact);
          setRelated(INITIAL_FACTS.filter(f => f.cat === localFact.cat && f.id !== id).slice(0, 4));
        } else {
          setError("Network connection issue. Please check your internet or Firebase configuration.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
    window.scrollTo(0, 0);
  }, [id, isAdmin]);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out this amazing fact on FActHub: ${fact?.title}`;
    
    switch (platform) {
      case 'WhatsApp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'X':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'Facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'Copy':
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        break;
    }
  };

  const startEditing = () => {
    if (!fact) return;
    setEditData({ 
      title: fact.title, 
      full: fact.full, 
      excerpt: fact.excerpt, 
      year: fact.year,
      emoji: fact.emoji || '📝',
      imageUrl: fact.imageUrl || '',
      imageAlt: fact.imageAlt || '',
      imageCredit: fact.imageCredit || '',
      eventMonth: fact.eventMonth || 0,
      eventDay: fact.eventDay || 0,
      publishAt: fact.publishAt || '',
      affiliateProducts: fact.affiliateProducts ? [...fact.affiliateProducts] : []
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveEdit = async () => {
    if (!fact || !id) return;
    try {
      const cleanedUpdates = Object.entries(editData).reduce((acc, [key, val]) => {
        if (val !== undefined) {
          acc[key] = val;
        }
        return acc;
      }, {} as Record<string, any>);

      await factService.updateFact(id, cleanedUpdates);
      setFact({ ...fact, ...cleanedUpdates } as Fact);
      setIsEditing(false);
      alert("Article updated successfully!");
    } catch (err: any) {
      console.error("Update fact error details:", err);
      let message = "Failed to update article.";
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
    }
  };

  const handleDeletePost = async () => {
    if (!fact || !id) return;
    try {
      await factService.deleteFact(id);
      alert("Article deleted successfully.");
      navigate("/");
    } catch (err: any) {
      console.error("Delete fact error details:", err);
      let message = "Failed to delete article.";
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
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold" />
      </div>
    );
  }

  if (error || !fact) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-paper text-center p-6">
        <div className="text-6xl mb-6">🛸</div>
        <h1 className="text-3xl font-serif font-black mb-4">
          {error || "Fact not found"}
        </h1>
        <p className="text-ink3 max-w-md mb-8">
          The requested fact could not be loaded. This might be due to a poor connection or the fact no longer exists.
        </p>
        <Link to="/" className="bg-ink text-white px-8 py-3 rounded-full font-bold hover:bg-gold transition-all">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-paper min-h-screen pb-16 fade-in">
      <Helmet>
        <title>{fact.title} | {fact.cat.charAt(0).toUpperCase() + fact.cat.slice(1)} | FActHub</title>
        <meta name="description" content={fact.excerpt || fact.full.substring(0, 160)} />
        <meta property="og:title" content={`${fact.title} | FActHub`} />
        <meta property="og:description" content={fact.excerpt || fact.full.substring(0, 160)} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="keywords" content={`fact, ${fact.cat}, history, science, inventions, discoveries, curiousity, facts for students`} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-ink3 hover:text-ink transition-colors group font-medium"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
            <span className="text-ink/10">|</span>
            <Link to="/" className="text-ink3 hover:text-ink transition-colors font-medium">
              Back to Home
            </Link>
          </div>

          <header className="space-y-6 mb-12">
            <div className="flex items-center justify-between">
              <div className={cn("inline-flex px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest", {
                "bg-coral-l text-coral": fact.cat === 'history',
                "bg-teal-l text-teal": fact.cat === 'science',
                "bg-gold-l/20 text-gold": fact.cat === 'inventions',
                "bg-indigo-l text-indigo": fact.cat === 'discoveries'
              })}>
                {fact.cat}
              </div>
              
              {isAdmin && (
                <div className="flex gap-2 items-center">
                  {!isEditing ? (
                    <>
                      {isDeletingConfirm ? (
                        <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30 p-1 rounded-lg text-xs animate-pulse">
                          <span className="font-bold text-rose-600 dark:text-rose-400 px-1.5">Delete this article?</span>
                          <button
                            onClick={handleDeletePost}
                            className="bg-rose-600 text-white px-2.5 py-1 rounded font-bold hover:bg-rose-700 transition-colors"
                          >
                            Yes, delete
                          </button>
                          <button
                            onClick={() => setIsDeletingConfirm(false)}
                            className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={startEditing}
                            className="flex items-center gap-2 px-2.5 sm:px-4 py-1.5 bg-ink text-white rounded-lg text-xs font-bold hover:bg-gold hover:text-ink transition-all"
                          >
                            <Edit2 size={13} /> Edit Article
                          </button>
                          <button 
                            onClick={() => setIsDeletingConfirm(true)}
                            className="flex items-center gap-2 px-2.5 sm:px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-all"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={saveEdit}
                        className="flex items-center gap-2 px-4 py-1.5 bg-sage text-white rounded-lg text-xs font-bold hover:bg-sage/80 transition-all"
                      >
                        <Save size={13} /> Save
                      </button>
                      <button 
                        onClick={cancelEditing}
                        className="flex items-center gap-2 px-4 py-1.5 bg-paper3 text-ink3 rounded-lg text-xs font-bold hover:bg-paper3/80 transition-all"
                      >
                        <CloseIcon size={13} /> Cancel
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4 bg-paper2 p-6 rounded-2xl border border-black/5">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-ink3">Article Title</label>
                  <input 
                    value={editData.title}
                    onChange={(e) => setEditData({...editData, title: e.target.value})}
                    className="w-full text-2xl font-serif font-black text-ink bg-white border border-black/10 p-3 rounded-xl focus:outline-none focus:border-gold"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-ink3">Short Summary (Excerpt)</label>
                  <textarea 
                    value={editData.excerpt}
                    onChange={(e) => setEditData({...editData, excerpt: e.target.value})}
                    className="w-full bg-white border border-black/10 p-3 rounded-xl text-sm focus:outline-none focus:border-gold resize-none h-20"
                    placeholder="Short summary of the article..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-ink3">Accent Emoji</label>
                    <input 
                      value={editData.emoji}
                      onChange={(e) => setEditData({...editData, emoji: e.target.value})}
                      className="w-full bg-white border border-black/10 p-3 rounded-xl focus:outline-none focus:border-gold font-sans"
                      placeholder="📝"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-3">
                    <ImageUploadField
                      label="Cover / Featured Image (Upload File or Paste Link)"
                      imageUrl={editData.imageUrl || ''}
                      imageAlt={editData.imageAlt || ''}
                      imageCredit={editData.imageCredit || ''}
                      onChange={(media) => {
                        setEditData({
                          ...editData,
                          imageUrl: media.imageUrl,
                          imageAlt: media.imageAlt !== undefined ? media.imageAlt : editData.imageAlt,
                          imageCredit: media.imageCredit !== undefined ? media.imageCredit : editData.imageCredit
                        });
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-ink3">Event Month (Optional)</label>
                    <select 
                      value={editData.eventMonth || 0}
                      onChange={(e) => setEditData({...editData, eventMonth: parseInt(e.target.value)})}
                      className="w-full bg-white border border-black/10 p-3 rounded-xl text-sm focus:outline-none focus:border-gold font-sans"
                    >
                      <option value={0}>None (Any)</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2000, i, 1).toLocaleString('en-US', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-ink3">Event Day (Optional)</label>
                    <select 
                      value={editData.eventDay || 0}
                      onChange={(e) => setEditData({...editData, eventDay: parseInt(e.target.value)})}
                      className="w-full bg-white border border-black/10 p-3 rounded-xl text-sm focus:outline-none focus:border-gold font-sans"
                    >
                      <option value={0}>None (Any)</option>
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-paper3 p-4 rounded-xl border border-black/5 space-y-2 mt-2 col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-ink3 block">
                    Publication Schedule (Optional)
                  </label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <input 
                      type="datetime-local"
                      value={editData.publishAt || ''}
                      onChange={(e) => setEditData({...editData, publishAt: e.target.value})}
                      className="bg-white border border-black/10 p-2 rounded-xl text-sm focus:outline-none focus:border-gold font-sans font-medium"
                    />
                    {editData.publishAt ? (
                      <button 
                        type="button"
                        onClick={() => setEditData({...editData, publishAt: ''})}
                        className="text-xs text-rose-600 hover:text-rose-800 font-bold transition-colors"
                      >
                        Publish Immediately
                      </button>
                    ) : (
                      <span className="text-xs text-ink3 italic">Currently published immediately (live)</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <h1 className="text-4xl sm:text-5xl lg:text-5xl font-serif font-black text-ink leading-tight tracking-tight">
                {fact.title}
              </h1>
            )}

            <div className="flex flex-wrap items-center gap-6 text-sm text-ink3 font-mono">
              <span className="flex items-center gap-2">
                <Calendar size={16} /> 
                {isEditing ? (
                  <input 
                    type="number"
                    value={editData.year}
                    onChange={(e) => setEditData({...editData, year: parseInt(e.target.value)})}
                    className="w-24 bg-white border border-black/10 px-2 py-1 rounded"
                  />
                ) : (
                  fact.year < 0 ? `${Math.abs(fact.year)} BC` : fact.year
                )}
              </span>
              <span className="flex items-center gap-2"><BookOpen size={16} /> 5 min read</span>
              <span>FActHub Verified</span>
            </div>

            {/* 🎓 Exam Relevance & PYQ Tagger Strip */}
            {fact.examRelevance && (
              <div className="p-4 bg-gold/10 border border-gold/25 rounded-2xl flex items-start gap-3 text-xs not-prose">
                <Award size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-ink flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <span>Target Competitive Exams & PYQs:</span>
                  </div>
                  <p className="text-ink2 mt-0.5 leading-relaxed font-medium">
                    {fact.examRelevance}
                  </p>
                </div>
              </div>
            )}

            {/* 🛠️ Student Toolkit Action Bar */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 pb-2 not-prose">
              <button
                onClick={() => setShowSaveNotebookModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-paper2 hover:bg-gold/15 text-ink font-bold text-xs border border-black/10 transition-all shadow-xs"
              >
                <Bookmark size={14} className="text-gold" />
                <span>Save to Notebook</span>
              </button>

              <button
                onClick={() => setShowShareCardModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-paper2 hover:bg-paper3 text-ink font-bold text-xs border border-black/10 transition-all shadow-xs"
              >
                <Image size={14} className="text-blue-600" />
                <span>Generate Social Card</span>
              </button>

              <button
                onClick={() => {
                  const capsuleText = `💡 *FACTHUB STUDY CAPSULE*\n\n📌 *${fact.title}*\n🗓️ Year: ${fact.year || 'Milestone'} | ${fact.cat.toUpperCase()}\n\n📖 *Key Takeaways:*\n${fact.excerpt}\n\n🎯 *Exam Focus:* ${fact.examRelevance || 'General Awareness'}\n\n🔗 Read verified story: https://facthub.app/article/${fact.id}`;
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(capsuleText);
                    setShowTelegramCapsuleToast(true);
                    setTimeout(() => setShowTelegramCapsuleToast(false), 2500);
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-paper2 hover:bg-paper3 text-ink font-bold text-xs border border-black/10 transition-all shadow-xs"
              >
                <Send size={14} className="text-emerald-600" />
                <span>{showTelegramCapsuleToast ? 'Capsule Copied!' : 'Copy Study Capsule'}</span>
              </button>

              <Link
                to="/daily-streak"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-ink hover:bg-black text-paper font-bold text-xs transition-all shadow-xs"
              >
                <Sparkles size={14} className="text-gold" />
                <span>Practice Daily Streak Quiz</span>
              </Link>
            </div>

            {/* 🎧 High Quality Web Speech Audio Narration Player */}
            <AudioNarrationPlayer
              title={fact.title}
              content={fact.full || fact.excerpt}
              excerpt={fact.excerpt}
              category={fact.cat}
            />

            <ArticleHeroImage
              imageUrl={fact.imageUrl}
              imageAlt={fact.imageAlt || fact.title}
              imageCredit={fact.imageCredit}
              title={fact.title}
              category={fact.cat}
              emoji={fact.emoji}
              isAdmin={isAdmin}
              onEditClick={() => {
                setIsEditing(true);
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
            />
          </header>

          <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-black prose-p:leading-relaxed prose-p:text-ink2 prose-blockquote:border-gold prose-blockquote:bg-paper2 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:italic">
             {isEditing ? (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-amber-50 border border-gold/30 text-xs sm:text-sm text-ink2 leading-relaxed space-y-3 font-sans shadow-sm">
                  <div className="font-bold flex items-center gap-2 text-ink uppercase tracking-wider text-[11px]">
                    💡 Adding Mid-Article Images with Alt Text & Credits
                  </div>
                  <p className="m-0 text-ink2">
                    To place images directly inside your story, write standard Markdown image tags. Use a vertical bar <code className="bg-black/5 px-1 py-0.5 rounded text-coral font-bold font-mono">|</code> to include both the **Alt Text** and **Credit/Source**:
                  </p>
                  <div className="bg-white border border-black/10 rounded-xl p-3 font-mono text-xs sm:text-sm text-ink select-all overflow-x-auto shadow-inner">
                    ![Your Alt Text / Caption | Credit: Creator Name](IMAGE_URL)
                  </div>
                  <p className="m-0 text-ink3 text-xs">
                    <strong>Example:</strong> <code className="bg-black/5 px-1 py-0.5 rounded text-ink2">![The Great Pyramid of Giza | Credit: John Doe / Wikimedia Commons](https://images.unsplash.com/photo-1539650116574-8efeb43e2750)</code>
                  </p>
                </div>

                {/* Formatting Toolbar with In-Article Image & Credit Inserter */}
                <div className="font-sans not-prose">
                  <MarkdownToolbar
                    textareaRef={textareaRef}
                    value={editData.full || ''}
                    onChange={(newVal) => setEditData({ ...editData, full: newVal })}
                  />
                </div>

                {/* Interactive Easy Text Color Injector */}
                <div className="p-5 rounded-2xl bg-white border border-black/10 space-y-3 font-sans shadow-sm not-prose">
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
                        <span className={cn("w-3 h-3 rounded-full shadow-inner", c.bg)} />
                        <span className={c.text}>{c.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-ink3 leading-relaxed border-t border-black/5 pt-2">
                    * Highlights work on any text, headings (e.g. <code className="font-mono"># Heading</code>), lists, and paragraphs without requiring any HTML coding.
                  </p>
                </div>
                
                <textarea 
                  ref={textareaRef}
                  value={editData.full}
                  onChange={(e) => setEditData({...editData, full: e.target.value})}
                  className="w-full h-[500px] bg-white border border-black/10 p-6 rounded-2xl font-serif text-lg leading-relaxed focus:outline-none focus:border-gold"
                  placeholder="Write full article here..."
                />

                {/* Affiliate Products Management in Edit Mode */}
                <div className="bg-paper2 p-6 rounded-2xl border border-black/10 space-y-4 font-sans mt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-3">
                    <div>
                      <h4 className="font-serif font-bold text-base text-ink flex items-center gap-2">
                        <ShoppingBag size={18} className="text-gold" />
                        <span>Recommended Books & Products (Affiliate Links)</span>
                      </h4>
                      <p className="text-xs text-ink3 mt-0.5">
                        Add curated books or gear to display at the bottom of this article.
                      </p>
                    </div>
                    {!showProductFormInEdit && (
                      <button
                        type="button"
                        onClick={() => setShowProductFormInEdit(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gold/20 text-xs font-bold text-ink rounded-xl border border-black/10 transition-all w-fit"
                      >
                        <Plus size={14} /> Add Book / Product
                      </button>
                    )}
                  </div>

                  {/* List of Attached Products */}
                  {editData.affiliateProducts && editData.affiliateProducts.length > 0 ? (
                    <div className="space-y-2">
                      {editData.affiliateProducts.map((prod, pIdx) => (
                        <div key={pIdx} className="bg-white p-3 rounded-xl border border-black/5 flex items-center justify-between gap-3 text-sm">
                          <div className="flex items-center gap-3 overflow-hidden">
                            {prod.imageUrl ? (
                              <img src={prod.imageUrl} alt={prod.title} className="w-10 h-10 object-cover rounded-lg border border-black/10 flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center text-xs flex-shrink-0 font-serif">📖</div>
                            )}
                            <div className="truncate">
                              <div className="font-bold text-ink truncate flex items-center gap-1.5">
                                <span>{prod.title}</span>
                                {prod.authorOrBrand && <span className="text-xs text-ink3 font-normal">by {prod.authorOrBrand}</span>}
                              </div>
                              <div className="text-xs text-ink3 truncate font-mono flex items-center gap-2">
                                <span className="text-gold font-bold">{prod.badge || 'Recommended'}</span>
                                <span>•</span>
                                <span className="truncate">{prod.url}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (editData.affiliateProducts || []).filter((_, i) => i !== pIdx);
                              setEditData({ ...editData, affiliateProducts: updated });
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
                            title="Remove product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    !showProductFormInEdit && (
                      <p className="text-xs text-ink3 italic">
                        No specific products attached to this article yet. (Default category recommendations will show automatically if empty).
                      </p>
                    )
                  )}

                  {/* Inline Add Product Form */}
                  {showProductFormInEdit && (
                    <div className="p-4 bg-white rounded-xl border border-black/10 space-y-3">
                      <div className="flex items-center justify-between border-b border-black/5 pb-2">
                        <span className="font-bold text-xs uppercase tracking-wider text-ink flex items-center gap-1.5">
                          <BookCheck size={14} className="text-gold" />
                          New Product Information
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowProductFormInEdit(false)}
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
                            value={newProductInEdit.title}
                            onChange={(e) => setNewProductInEdit({ ...newProductInEdit, title: e.target.value })}
                            placeholder="e.g., Sapiens: A Brief History"
                            className="w-full bg-paper2 border border-black/10 rounded-xl p-2.5 text-xs text-ink focus:outline-none focus:border-gold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">Author / Brand</label>
                          <input
                            type="text"
                            value={newProductInEdit.authorOrBrand}
                            onChange={(e) => setNewProductInEdit({ ...newProductInEdit, authorOrBrand: e.target.value })}
                            placeholder="e.g., Yuval Noah Harari"
                            className="w-full bg-paper2 border border-black/10 rounded-xl p-2.5 text-xs text-ink focus:outline-none focus:border-gold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">Affiliate Link URL *</label>
                          <input
                            type="url"
                            value={newProductInEdit.url}
                            onChange={(e) => setNewProductInEdit({ ...newProductInEdit, url: e.target.value })}
                            placeholder="https://amzn.to/..."
                            className="w-full bg-paper2 border border-black/10 rounded-xl p-2.5 text-xs text-ink focus:outline-none focus:border-gold font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">Image URL (Optional)</label>
                          <input
                            type="url"
                            value={newProductInEdit.imageUrl}
                            onChange={(e) => setNewProductInEdit({ ...newProductInEdit, imageUrl: e.target.value })}
                            placeholder="https://images-na.ssl-images-amazon.com/..."
                            className="w-full bg-paper2 border border-black/10 rounded-xl p-2.5 text-xs text-ink focus:outline-none focus:border-gold font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">Badge / Tag</label>
                          <input
                            type="text"
                            value={newProductInEdit.badge}
                            onChange={(e) => setNewProductInEdit({ ...newProductInEdit, badge: e.target.value })}
                            placeholder="e.g., Recommended Book, Bestseller"
                            className="w-full bg-paper2 border border-black/10 rounded-xl p-2.5 text-xs text-ink focus:outline-none focus:border-gold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">Button CTA Text</label>
                          <input
                            type="text"
                            value={newProductInEdit.price}
                            onChange={(e) => setNewProductInEdit({ ...newProductInEdit, price: e.target.value })}
                            placeholder="e.g., View on Amazon"
                            className="w-full bg-paper2 border border-black/10 rounded-xl p-2.5 text-xs text-ink focus:outline-none focus:border-gold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">Why We Recommend This</label>
                        <input
                          type="text"
                          value={newProductInEdit.note}
                          onChange={(e) => setNewProductInEdit({ ...newProductInEdit, note: e.target.value })}
                          placeholder="e.g., An essential companion book to understand ancient human societies."
                          className="w-full bg-paper2 border border-black/10 rounded-xl p-2.5 text-xs text-ink focus:outline-none focus:border-gold"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowProductFormInEdit(false)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-ink3 hover:bg-black/5"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!newProductInEdit.title.trim() || !newProductInEdit.url.trim()) {
                              alert("Please provide at least a Product Title and an Affiliate URL.");
                              return;
                            }
                            const existing = editData.affiliateProducts || [];
                            setEditData({ ...editData, affiliateProducts: [...existing, { ...newProductInEdit }] });
                            setNewProductInEdit({
                              title: '',
                              authorOrBrand: '',
                              url: '',
                              imageUrl: '',
                              badge: 'Recommended Book',
                              note: '',
                              price: 'View on Amazon',
                              platform: 'Amazon'
                            });
                            setShowProductFormInEdit(false);
                          }}
                          className="px-5 py-2 bg-ink text-white rounded-xl text-xs font-bold hover:bg-gold hover:text-ink transition-all shadow"
                        >
                          Attach Product
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <ReactMarkdown components={renderers}>{fact.full}</ReactMarkdown>

                {/* 📚 SAFEGUARDED RECOMMENDED READING & AFFILIATE PRODUCTS SHOWCASE */}
                {(() => {
                  const productsToShow = (fact.affiliateProducts && fact.affiliateProducts.length > 0)
                    ? fact.affiliateProducts
                    : (DEFAULT_CATEGORY_BOOKS[fact.cat] || []);

                  if (!productsToShow || productsToShow.length === 0) return null;

                  return (
                    <div className="mt-12 bg-white rounded-3xl border border-black/10 p-6 sm:p-8 shadow-sm space-y-6 not-prose">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse"></span>
                            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-gold">Further Learning & Deep Dive</span>
                          </div>
                          <h3 className="text-xl sm:text-2xl font-serif font-black text-ink">
                            📚 Recommended Reading & Resources
                          </h3>
                        </div>
                        <div className="text-xs text-ink3 font-medium bg-paper2 px-3 py-1.5 rounded-xl border border-black/5 w-fit">
                          Curated by FActHub Editorial
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {productsToShow.map((item, idx) => (
                          <div 
                            key={idx}
                            className="group bg-paper rounded-2xl border border-black/5 p-5 hover:border-gold/40 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-5"
                          >
                            <div className="w-20 h-28 sm:w-24 sm:h-32 rounded-xl overflow-hidden bg-paper2 border border-black/10 flex-shrink-0 flex items-center justify-center relative shadow-sm">
                              {item.imageUrl ? (
                                <img 
                                  src={item.imageUrl} 
                                  alt={item.title} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    (e.target as any).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <span className="text-3xl">📖</span>
                              )}
                              <span className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-mono uppercase px-1.5 py-0.5 rounded backdrop-blur-sm">
                                Book
                              </span>
                            </div>

                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="bg-gold/15 text-ink font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-gold/20">
                                  {item.badge || 'Recommended Reading'}
                                </span>
                                {item.authorOrBrand && (
                                  <span className="text-xs text-ink3 font-medium">
                                    by <strong className="text-ink2">{item.authorOrBrand}</strong>
                                  </span>
                                )}
                              </div>

                              <h4 className="text-lg font-serif font-black text-ink group-hover:text-gold transition-colors leading-snug">
                                {item.title}
                              </h4>

                              {item.note && (
                                <p className="text-xs text-ink2 leading-relaxed bg-white/70 p-3 rounded-xl border border-black/5">
                                  {item.note}
                                </p>
                              )}

                              <div className="pt-1 flex items-center justify-between flex-wrap gap-3">
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="nofollow sponsored noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-white hover:bg-gold hover:text-ink text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow group/btn"
                                >
                                  <span>{item.price || 'View on Amazon'}</span>
                                  <ExternalLink size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                </a>

                                <span className="text-[11px] text-ink3 font-mono flex items-center gap-1">
                                  <span>🛒</span>
                                  <span>{item.platform || 'Amazon'} Verified Link</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* FTC / Google Safeguard Reader Disclosure */}
                      <div className="p-4 bg-paper2 rounded-2xl border border-black/5 flex items-start gap-3 text-xs text-ink3 leading-relaxed">
                        <ShieldCheck size={18} className="text-emerald-700 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-ink font-bold block mb-0.5">Trust & Transparency Disclosure:</strong>
                          FActHub is reader-supported. When you purchase through links on our site, we may earn an affiliate commission at no extra cost to you. We strictly curate books and educational materials relevant to the topic. Outbound links are secured with <code className="bg-white px-1 py-0.5 rounded text-ink2 border border-black/5 font-mono text-[10px]">rel="nofollow sponsored"</code> to comply with Google Search and webmaster guidelines.
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>

          <div className="mt-16 p-8 bg-paper2 rounded-2xl border border-black/5">
             <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-ink uppercase tracking-widest text-xs">Share this fact</h3>
                  <p className="text-[10px] text-ink3 mt-1">Spread the knowledge with your friends</p>
                </div>
                <Share2 size={18} className="text-gold" />
             </div>
             <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => handleShare('WhatsApp')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white rounded-xl text-sm font-bold hover:scale-105 transition-all shadow-lg shadow-green-500/10"
                >
                  <Send size={16} fill="white" /> WhatsApp
                </button>
                <button 
                  onClick={() => handleShare('X')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:scale-105 transition-all"
                >
                  <Twitter size={16} fill="white" /> Post on X
                </button>
                <button 
                  onClick={() => handleShare('Facebook')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#1877F2] text-white rounded-xl text-sm font-bold hover:scale-105 transition-all shadow-lg shadow-blue-500/10"
                >
                  <Facebook size={16} fill="white" /> Facebook
                </button>
                <button 
                  onClick={() => handleShare('Copy')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-black/10 text-ink rounded-xl text-sm font-bold hover:bg-gold hover:text-white hover:border-gold transition-all"
                >
                  <Copy size={16} /> Copy Link
                </button>
             </div>
          </div>

          <div className="mt-8 flex items-center justify-between bg-white border border-black/10 p-5 rounded-2xl shadow-sm">
            <span className="text-xs sm:text-sm text-ink3 font-serif italic">Finished reading this story?</span>
            <Link 
              to="/" 
              className="flex items-center gap-2 px-5 py-2.5 bg-ink text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-gold focus:scale-95 hover:text-ink transition-all shadow shadow-black/5 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>

        <aside className="space-y-10">
          <div className="bg-paper2 border border-black/5 rounded-2xl aspect-[300/250] flex items-center justify-center text-ink3 text-xs italic">
            📢 Google AdSense — 300x250 Rectangle
          </div>

          <div className="space-y-6">
            <h3 className="font-serif font-bold text-xl text-ink border-b border-black/10 pb-4">
              More {fact.cat.charAt(0).toUpperCase() + fact.cat.slice(1)} Facts
            </h3>
            <div className="space-y-6">
              {related.map(r => (
                <Link key={r.id} to={`/article/${r.id}`} className="flex gap-4 group">
                  <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", {
                    "bg-coral": r.cat === 'history',
                    "bg-teal": r.cat === 'science',
                    "bg-gold": r.cat === 'inventions',
                    "bg-indigo": r.cat === 'discoveries'
                  })} />
                  <div>
                    <h4 className="font-bold text-sm text-ink leading-snug group-hover:text-gold transition-colors">{r.title}</h4>
                    <span className="font-mono text-[0.65rem] text-ink3">{r.year < 0 ? `${Math.abs(r.year)} BC` : r.year}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-ink rounded-2xl p-6 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 text-6xl font-serif font-black text-white/5 pr-4 pt-2">★</div>
            <div className="font-mono text-[0.6rem] text-gold-l uppercase tracking-widest mb-4">Fact of the Day</div>
            <p className="text-sm italic leading-relaxed text-white/80 mb-6">
              "Oxford University is older than the Aztec Empire. Teaching began at Oxford around 1096 AD; the Aztec Empire was founded in 1428 AD."
            </p>
            <button className="bg-gold text-ink font-bold text-xs px-4 py-2 rounded-full hover:bg-gold-l transition-all">
              Next Fact →
            </button>
          </div>

          <div className="bg-paper2 border border-black/5 rounded-2xl aspect-[300/600] hidden lg:flex items-center justify-center text-ink3 text-xs italic">
            📢 Google AdSense — 300x600 Half-Page Ad
          </div>
        </aside>
      </div>

      {/* 🖼️ Social Media Share Card Generator Modal */}
      <ShareCardModal
        isOpen={showShareCardModal}
        onClose={() => setShowShareCardModal(false)}
        title={fact.title}
        year={fact.year}
        category={fact.cat}
        excerpt={fact.excerpt || fact.full.substring(0, 160)}
        emoji={fact.emoji}
      />

      {/* 📓 Student Revision Notebook Modal */}
      <SaveToNotebookModal
        isOpen={showSaveNotebookModal}
        onClose={() => setShowSaveNotebookModal(false)}
        fact={fact}
      />
    </div>
  );
};
