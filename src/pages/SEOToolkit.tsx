import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  Target, 
  TrendingUp, 
  FileText, 
  Layers, 
  HelpCircle, 
  BookOpen, 
  ShieldCheck, 
  Zap, 
  Copy, 
  Check, 
  ArrowLeft,
  BarChart3,
  Globe,
  Sliders,
  Award
} from 'lucide-react';
import { SEOKeywordResearchResult, Fact } from '../types';
import { researchKeywordsWithAI, analyzeOnPageSEO } from '../services/seoService';
import { GoogleSERPPreview } from '../components/seo/GoogleSERPPreview';
import { SEOAuditCard } from '../components/seo/SEOAuditCard';
import { INITIAL_FACTS } from '../seed';
import { useAuth } from '../contexts/AuthContext';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';

export const SEOToolkit: React.FC = () => {
  const { user } = useAuth();
  const [topic, setTopic] = useState('James Webb Space Telescope');
  const [category, setCategory] = useState('science');
  const [isLoading, setIsLoading] = useState(false);
  const [researchResult, setResearchResult] = useState<SEOKeywordResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Article selection for live auditing
  const [allArticles, setAllArticles] = useState<Fact[]>(INITIAL_FACTS);
  const [selectedArticleId, setSelectedArticleId] = useState<string>(INITIAL_FACTS[0]?.id || '');
  const [selectedArticle, setSelectedArticle] = useState<Fact>(INITIAL_FACTS[0]);

  // Load latest articles from firestore if available
  useEffect(() => {
    async function loadFacts() {
      try {
        if (!db) return;
        const snap = await getDocs(collection(db, 'facts'));
        if (!snap.empty) {
          const loaded: Fact[] = [];
          snap.forEach((d) => loaded.push({ ...d.data(), id: d.id } as Fact));
          setAllArticles(loaded);
          if (loaded.length > 0) {
            setSelectedArticleId(loaded[0].id);
            setSelectedArticle(loaded[0]);
          }
        }
      } catch (e) {
        console.warn('Using local facts for SEO toolkit:', e);
      }
    }
    loadFacts();
  }, []);

  const handleSelectArticle = (id: string) => {
    setSelectedArticleId(id);
    const found = allArticles.find(a => a.id === id);
    if (found) {
      setSelectedArticle(found);
      setTopic(found.title);
      setCategory(found.cat);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunResearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await researchKeywordsWithAI({
        topic: topic.trim(),
        category
      });
      setResearchResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to complete keyword research.');
    } finally {
      setIsLoading(false);
    }
  };

  const auditReport = analyzeOnPageSEO({
    title: selectedArticle?.seoTitle || selectedArticle?.title || '',
    full: selectedArticle?.full || '',
    excerpt: selectedArticle?.metaDescription || selectedArticle?.excerpt || '',
    targetKeyword: selectedArticle?.targetKeyword || researchResult?.focusKeyword || '',
    focusKeyword: selectedArticle?.focusKeyword || researchResult?.focusKeyword || '',
    seoTitle: selectedArticle?.seoTitle || selectedArticle?.title || '',
    metaDescription: selectedArticle?.metaDescription || selectedArticle?.excerpt || '',
    imageAlt: selectedArticle?.imageAlt || '',
    imageUrl: selectedArticle?.imageUrl || '',
    faqs: selectedArticle?.faqs || researchResult?.faqSchema || [],
    quizMCQs: selectedArticle?.quizMCQs || []
  });

  return (
    <div className="bg-paper dark:bg-[#121316] min-h-screen pb-20 text-ink dark:text-white">
      <Helmet>
        <title>Google Page 1 SEO Rank Suite & Keyword Researcher | FActHub</title>
        <meta 
          name="description" 
          content="AI-powered Google Page 1 SEO rank suite: keyword researcher, high-CTR title generator, Google PAA subheadings, FAQ schema generator, and on-page auditor." 
        />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 space-y-10">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-bold text-ink3 hover:text-ink dark:text-white/60 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-ink3 dark:text-white/50">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Google Search Guidelines 2026 Compatible</span>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="bg-white dark:bg-[#191b21] border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-sm space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold/15 text-black dark:text-gold border border-gold/30 text-xs font-bold uppercase tracking-wider">
            <Award size={14} className="text-gold" />
            <span>Google First Page Ranking Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-ink dark:text-white leading-tight">
            Rank Every Post on Page 1 of Google Search
          </h1>

          <p className="text-sm sm:text-base text-ink3 dark:text-white/70 max-w-3xl leading-relaxed">
            Google's search algorithm rewards posts with <strong>clear search intent</strong>, front-loaded keyword titles, <strong>People Also Ask (PAA) H2 subheadings</strong>, structured FAQ schemas, and authoritative E-E-A-T depth. Use this complete suite to research keywords, preview SERP snippets, and audit content before publishing.
          </p>
        </div>

        {/* SECTION 1: AI KEYWORD RESEARCHER */}
        <div className="bg-white dark:bg-[#191b21] border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-black/5 dark:border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gold/20 flex items-center justify-center text-black font-bold">
                <Search size={20} className="text-gold" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-black text-ink dark:text-white">
                  Step 1: AI Keyword Researcher & Search Intent
                </h2>
                <p className="text-xs text-ink3 dark:text-white/60">
                  Enter a topic to extract search volume, difficulty, LSI keywords, and high-CTR titles.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleRunResearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8">
                <label className="text-[11px] font-bold uppercase tracking-wider text-ink3 dark:text-white/50 block mb-1">
                  Topic / Seed Keyword
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Harappan Civilization, Wright Brothers First Flight, Black Holes"
                  className="w-full bg-paper2 dark:bg-[#111215] border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-ink dark:text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-ink3 dark:text-white/50 block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-paper2 dark:bg-[#111215] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-ink dark:text-white focus:outline-none focus:border-gold"
                >
                  <option value="history">History</option>
                  <option value="science">Science</option>
                  <option value="inventions">Inventions</option>
                  <option value="discoveries">Discoveries</option>
                  <option value="birthdays">Birthdays</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex items-end">
                <button
                  type="submit"
                  disabled={isLoading || !topic.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gold hover:bg-gold-l text-black font-bold text-xs rounded-xl shadow transition-all disabled:opacity-50 h-[42px]"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Researching...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Analyze</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-2xl text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {researchResult && (
            <div className="space-y-6 pt-4 border-t border-black/5 dark:border-white/10">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-paper2 dark:bg-black/30 border border-black/5 dark:border-white/5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink3 dark:text-white/50">
                    Target Primary Keyword
                  </span>
                  <div className="text-base font-bold text-ink dark:text-white flex items-center justify-between">
                    <span>{researchResult.focusKeyword}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(researchResult.focusKeyword, 'focus')}
                      className="text-ink3 hover:text-gold"
                    >
                      {copiedKey === 'focus' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <span className="text-xs text-gold font-semibold">Intent: {researchResult.searchIntent}</span>
                </div>

                <div className="p-4 rounded-2xl bg-paper2 dark:bg-black/30 border border-black/5 dark:border-white/5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink3 dark:text-white/50">
                    Search Volume Tier
                  </span>
                  <div className="text-base font-bold text-emerald-700 flex items-center gap-1.5">
                    <TrendingUp size={16} />
                    <span>{researchResult.searchVolumeTier}</span>
                  </div>
                  <span className="text-xs text-ink3 dark:text-white/60">
                    Competition: <strong>{researchResult.competitionLevel}</strong> ({researchResult.difficultyScore}/100)
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-paper2 dark:bg-black/30 border border-black/5 dark:border-white/5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink3 dark:text-white/50">
                    Meta Description
                  </span>
                  <div className="text-xs text-ink2 dark:text-white/80 line-clamp-2">
                    {researchResult.metaDescription}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(researchResult.metaDescription, 'meta')}
                    className="text-xs text-gold font-bold flex items-center gap-1 mt-1"
                  >
                    {copiedKey === 'meta' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>Copy Description</span>
                  </button>
                </div>
              </div>

              {/* Title Variations */}
              <div className="p-5 rounded-2xl bg-paper2 dark:bg-black/20 border border-black/5 dark:border-white/5 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white flex items-center gap-2">
                  <FileText size={15} className="text-blue-500" />
                  <span>High-CTR Title Tag Ideas (&lt; 60 characters)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {researchResult.titleTagIdeas.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white dark:bg-[#1f2128] rounded-xl border border-black/5 dark:border-white/5 flex flex-col justify-between gap-2 text-xs shadow-2xs"
                    >
                      <div className="font-bold text-ink dark:text-white leading-snug">
                        {t.title}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-black/5 text-[11px] text-ink3 dark:text-white/50">
                        <span>{t.characterCount} chars</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(t.title, `title-${idx}`)}
                          className="hover:text-gold font-bold flex items-center gap-1"
                        >
                          {copiedKey === `title-${idx}` ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          <span>Copy</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PAA questions for H2 subheadings */}
              <div className="p-5 rounded-2xl bg-paper2 dark:bg-black/20 border border-black/5 dark:border-white/5 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white flex items-center gap-2">
                  <HelpCircle size={15} className="text-coral" />
                  <span>Google "People Also Ask" (PAA) Queries for H2 Subheadings</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {researchResult.peopleAlsoAsk.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white dark:bg-[#1f2128] rounded-xl border border-black/5 dark:border-white/5 space-y-1 text-xs shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-ink dark:text-white">## {p.question}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(`## ${p.question}\n${p.snippetAnswer}`, `paa-${idx}`)}
                          className="text-ink3 hover:text-gold"
                        >
                          {copiedKey === `paa-${idx}` ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        </button>
                      </div>
                      <p className="text-ink3 dark:text-white/60 text-[11px] leading-relaxed">
                        {p.snippetAnswer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: LIVE GOOGLE SERP PREVIEW */}
        <div className="bg-white dark:bg-[#191b21] border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-black/5 dark:border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
                <Globe size={20} />
              </div>
              <div>
                <h2 className="text-lg font-serif font-black text-ink dark:text-white">
                  Step 2: Google Search Results (SERP) Live Simulator
                </h2>
                <p className="text-xs text-ink3 dark:text-white/60">
                  Verify exactly how your snippet, title, meta description, and rich FAQ accordions appear on Google.
                </p>
              </div>
            </div>
          </div>

          <GoogleSERPPreview
            title={researchResult?.titleTagIdeas?.[0]?.title || selectedArticle?.seoTitle || selectedArticle?.title || topic}
            metaDescription={researchResult?.metaDescription || selectedArticle?.metaDescription || selectedArticle?.excerpt || ''}
            category={category}
            focusKeyword={researchResult?.focusKeyword || selectedArticle?.targetKeyword || ''}
            faqs={researchResult?.faqSchema || selectedArticle?.faqs || []}
          />
        </div>

        {/* SECTION 3: ON-PAGE SEO AUDITOR */}
        <div className="bg-white dark:bg-[#191b21] border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-black/5 dark:border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold">
                <BarChart3 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-serif font-black text-ink dark:text-white">
                  Step 3: 12-Factor On-Page SEO Auditor
                </h2>
                <p className="text-xs text-ink3 dark:text-white/60">
                  Select any published post to calculate its Google Page 1 readiness score and actionable fixes.
                </p>
              </div>
            </div>

            {/* Article selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-ink3 dark:text-white/50">Audit Article:</span>
              <select
                value={selectedArticleId}
                onChange={(e) => handleSelectArticle(e.target.value)}
                className="bg-paper2 dark:bg-[#121316] border border-black/10 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-ink dark:text-white focus:outline-none focus:border-gold max-w-[240px] truncate"
              >
                {allArticles.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <SEOAuditCard report={auditReport} />
        </div>

        {/* SECTION 4: GOOGLE PAGE 1 MASTER PLAYBOOK */}
        <div className="bg-white dark:bg-[#191b21] border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-black/5 dark:border-white/10 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-gold/20 flex items-center justify-center text-black font-bold">
              <BookOpen size={20} className="text-gold" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-black text-ink dark:text-white">
                How Search Engines Work & How to Rank on Google Page 1
              </h2>
              <p className="text-xs text-ink3 dark:text-white/60">
                Core algorithmic ranking factors decoded for FActHub authors.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-paper2 dark:bg-black/30 border border-black/5 space-y-2">
              <h4 className="font-bold text-sm text-gold">1. Search Intent & Focus Keyword Front-Loading</h4>
              <p className="text-ink2 dark:text-white/80 leading-relaxed">
                Google uses natural language processing (RankBrain & Gemini) to determine user intent. If users search "when did the berlin wall fall", Google prioritizes pages with the exact keyword in the <code className="bg-black/5 px-1 py-0.5 rounded font-mono">&lt;title&gt;</code> and the single <code className="bg-black/5 px-1 py-0.5 rounded font-mono">&lt;h1&gt;</code> within the first 30 characters.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-paper2 dark:bg-black/30 border border-black/5 space-y-2">
              <h4 className="font-bold text-sm text-emerald-700">2. Structured Headings (H2 / H3) & Jump Links</h4>
              <p className="text-ink2 dark:text-white/80 leading-relaxed">
                Google crawlers do not read monolithic walls of text. By utilizing <code className="bg-black/5 px-1 py-0.5 rounded font-mono">## H2</code> subheadings answering "People Also Ask" questions, Google generates anchor jump links directly beneath your search result on the SERP!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-paper2 dark:bg-black/30 border border-black/5 space-y-2">
              <h4 className="font-bold text-sm text-blue-700">3. Schema.org FAQPage Structured Data</h4>
              <p className="text-ink2 dark:text-white/80 leading-relaxed">
                FActHub injects <code className="bg-black/5 px-1 py-0.5 rounded font-mono">application/ld+json</code> with <code className="bg-black/5 px-1 py-0.5 rounded font-mono">Article</code>, <code className="bg-black/5 px-1 py-0.5 rounded font-mono">BreadcrumbList</code>, and <code className="bg-black/5 px-1 py-0.5 rounded font-mono">FAQPage</code> schemas. This allows Google to present interactive accordion dropdowns right in search results, dominating screen space over competitors.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-paper2 dark:bg-black/30 border border-black/5 space-y-2">
              <h4 className="font-bold text-sm text-purple-700">4. E-E-A-T & Fact-Check Verification</h4>
              <p className="text-ink2 dark:text-white/80 leading-relaxed">
                Google's Helpful Content Update penalizes thin or unverified claims. Every article on FActHub includes author attribution, verified sources (<code className="bg-black/5 px-1 py-0.5 rounded font-mono">trustedSources</code>), and an editorial fact-check stamp that signals high authority to Google quality raters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
