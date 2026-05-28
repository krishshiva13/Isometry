import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, BookOpen, Share2, Copy, Send, Twitter, Facebook, Edit2, Save, X as CloseIcon } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { factService } from '../services/factService';
import { Fact } from '../types';
import { cn } from '../lib/utils';
import { INITIAL_FACTS } from '../seed';
import { useAuth } from '../contexts/AuthContext';

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
  const navigate = useNavigate();

  useEffect(() => {
    const loadArticle = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await factService.getFactById(id);
        if (data) {
          setFact(data);
          const allFromCat = await factService.getFacts(data.cat);
          setRelated(allFromCat?.filter(f => f.id !== id).slice(0, 4) || []);
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
  }, [id]);

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
      eventMonth: fact.eventMonth || 0,
      eventDay: fact.eventDay || 0
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveEdit = async () => {
    if (!fact || !id) return;
    try {
      await factService.updateFact(id, editData);
      setFact({ ...fact, ...editData } as Fact);
      setIsEditing(false);
      alert("Article updated successfully!");
    } catch (err) {
      alert("Failed to update article.");
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
                <div className="flex gap-2">
                  {!isEditing ? (
                    <button 
                      onClick={startEditing}
                      className="flex items-center gap-2 px-4 py-1.5 bg-ink text-white rounded-lg text-xs font-bold hover:bg-gold transition-all"
                    >
                      <Edit2 size={14} /> Edit Article
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={saveEdit}
                        className="flex items-center gap-2 px-4 py-1.5 bg-sage text-white rounded-lg text-xs font-bold hover:bg-sage/80 transition-all"
                      >
                        <Save size={14} /> Save
                      </button>
                      <button 
                        onClick={cancelEditing}
                        className="flex items-center gap-2 px-4 py-1.5 bg-paper3 text-ink3 rounded-lg text-xs font-bold hover:bg-paper3/80 transition-all"
                      >
                        <CloseIcon size={14} /> Cancel
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
                  <div className="space-y-1 col-span-1 sm:col-span-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-ink3">Cover Image URL (Optional)</label>
                    <input 
                      value={editData.imageUrl}
                      onChange={(e) => setEditData({...editData, imageUrl: e.target.value})}
                      className="w-full bg-white border border-black/10 p-3 rounded-xl text-sm focus:outline-none focus:border-gold font-sans"
                      placeholder="https://images.unsplash.com/photo-..."
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

            {fact.imageUrl ? (
              <div className="w-full aspect-video rounded-2xl overflow-hidden relative shadow-lg group border border-black/5 bg-paper2">
                <img 
                  src={fact.imageUrl} 
                  alt={fact.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // fall back gracefully if invalid link
                    (e.target as any).style.display = 'none';
                  }}
                />
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white font-mono text-[10px] uppercase font-bold px-3 py-1 rounded-full">
                  Verified Media Accent
                </div>
                <div className="absolute bottom-0 right-0 p-4 opacity-50">
                  <div className="bg-paper2 px-3 py-1 rounded border border-black/5 text-[0.6rem] font-mono">AD-ZONE 300x60</div>
                </div>
              </div>
            ) : (
              <div className={cn("w-full aspect-video rounded-2xl flex items-center justify-center text-[6rem] relative overflow-hidden border border-black/5", {
                "bg-coral-l": fact.cat === 'history',
                "bg-teal-l": fact.cat === 'science',
                "bg-gold-l/10": fact.cat === 'inventions',
                "bg-indigo-l": fact.cat === 'discoveries'
              })}>
                <span className="relative z-10">{fact.emoji}</span>
                <div className="absolute bottom-0 right-0 p-4 opacity-50">
                  <div className="bg-paper2 px-3 py-1 rounded border border-black/5 text-[0.6rem] font-mono">AD-ZONE 300x60</div>
                </div>
              </div>
            )}
          </header>

          <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-black prose-p:leading-relaxed prose-p:text-ink2 prose-blockquote:border-gold prose-blockquote:bg-paper2 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:italic">
             {isEditing ? (
              <textarea 
                value={editData.full}
                onChange={(e) => setEditData({...editData, full: e.target.value})}
                className="w-full h-[500px] bg-white border border-black/10 p-6 rounded-2xl font-serif text-lg leading-relaxed focus:outline-none focus:border-gold"
              />
            ) : (
              <ReactMarkdown components={renderers}>{fact.full}</ReactMarkdown>
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
    </div>
  );
};
