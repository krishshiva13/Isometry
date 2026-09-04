import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Search, 
  Copy, 
  Check, 
  TrendingUp, 
  Target, 
  HelpCircle, 
  FileText, 
  Layers, 
  ListOrdered, 
  BookOpen, 
  Lightbulb, 
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  BarChart3
} from 'lucide-react';
import { SEOKeywordResearchResult, Fact } from '../../types';
import { researchKeywordsWithAI, analyzeOnPageSEO } from '../../services/seoService';
import { GoogleSERPPreview } from './GoogleSERPPreview';
import { SEOAuditCard } from './SEOAuditCard';
import { cn } from '../../lib/utils';

interface SEOKeywordResearcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
  initialCategory?: string;
  currentPost?: Partial<Fact>;
  onApplyToPost?: (updates: {
    targetKeyword?: string;
    focusKeyword?: string;
    seoTitle?: string;
    metaDescription?: string;
    searchKeywords?: string[];
    faqs?: Array<{ question: string; answer: string }>;
  }) => void;
}

export const SEOKeywordResearcherModal: React.FC<SEOKeywordResearcherModalProps> = ({
  isOpen,
  onClose,
  initialTopic = '',
  initialCategory = 'history',
  currentPost,
  onApplyToPost
}) => {
  const [activeTab, setActiveTab] = useState<'research' | 'serp_preview' | 'auditor' | 'playbook'>('research');
  const [topicInput, setTopicInput] = useState(initialTopic);
  const [categoryInput, setCategoryInput] = useState(initialCategory);
  const [isLoading, setIsLoading] = useState(false);
  const [researchResult, setResearchResult] = useState<SEOKeywordResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sync initial topic when opening
  useEffect(() => {
    if (initialTopic && !topicInput) {
      setTopicInput(initialTopic);
    }
  }, [initialTopic]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunResearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topicInput.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await researchKeywordsWithAI({
        topic: topicInput.trim(),
        category: categoryInput
      });
      setResearchResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to complete SEO keyword research.');
    } finally {
      setIsLoading(false);
    }
  };

  // Run audit if post exists or use research data
  const auditReport = analyzeOnPageSEO({
    title: currentPost?.seoTitle || currentPost?.title || researchResult?.titleTagIdeas?.[0]?.title || topicInput || 'Untitled Topic',
    full: currentPost?.full || '',
    excerpt: currentPost?.excerpt || researchResult?.metaDescription || '',
    targetKeyword: currentPost?.targetKeyword || researchResult?.focusKeyword || '',
    focusKeyword: currentPost?.focusKeyword || researchResult?.focusKeyword || '',
    metaDescription: currentPost?.metaDescription || researchResult?.metaDescription || '',
    imageAlt: currentPost?.imageAlt || '',
    imageUrl: currentPost?.imageUrl || '',
    faqs: currentPost?.faqs || researchResult?.faqSchema || [],
    quizMCQs: currentPost?.quizMCQs || []
  });

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-paper dark:bg-[#15161a] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-white dark:bg-[#1c1d23] border-b border-black/10 dark:border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold/20 text-black flex items-center justify-center font-bold">
              <Sparkles size={20} className="text-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-serif font-black text-ink dark:text-white">
                  Google Page 1 SEO Rank Suite
                </h2>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-mono font-bold px-2 py-0.5 rounded-full">
                  AI Powered
                </span>
              </div>
              <p className="text-xs text-ink3 dark:text-white/60">
                Discover high-volume keywords, Google PAA subheadings, rich FAQ schemas, and optimize posts to rank #1.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-ink3 hover:text-ink dark:text-white/70 hover:bg-paper2 dark:hover:bg-white/10 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 bg-paper2 dark:bg-[#18191e] border-b border-black/5 dark:border-white/5 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('research')}
            className={cn(
              "pb-3 px-3 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap",
              activeTab === 'research'
                ? "border-gold text-gold dark:text-white"
                : "border-transparent text-ink3 hover:text-ink dark:text-white/60"
            )}
          >
            <Search size={14} />
            <span>Keyword Researcher</span>
          </button>

          <button
            onClick={() => setActiveTab('serp_preview')}
            className={cn(
              "pb-3 px-3 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap",
              activeTab === 'serp_preview'
                ? "border-gold text-gold dark:text-white"
                : "border-transparent text-ink3 hover:text-ink dark:text-white/60"
            )}
          >
            <Zap size={14} />
            <span>Google SERP Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('auditor')}
            className={cn(
              "pb-3 px-3 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap",
              activeTab === 'auditor'
                ? "border-gold text-gold dark:text-white"
                : "border-transparent text-ink3 hover:text-ink dark:text-white/60"
            )}
          >
            <BarChart3 size={14} />
            <span>On-Page SEO Auditor ({auditReport.overallScore}/100)</span>
          </button>

          <button
            onClick={() => setActiveTab('playbook')}
            className={cn(
              "pb-3 px-3 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap",
              activeTab === 'playbook'
                ? "border-gold text-gold dark:text-white"
                : "border-transparent text-ink3 hover:text-ink dark:text-white/60"
            )}
          >
            <BookOpen size={14} />
            <span>Google Ranking Playbook</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-grow">
          {/* TAB 1: KEYWORD RESEARCHER */}
          {activeTab === 'research' && (
            <div className="space-y-6">
              {/* Search Form */}
              <form onSubmit={handleRunResearch} className="p-4 bg-white dark:bg-[#1c1d23] rounded-2xl border border-black/10 dark:border-white/10 space-y-3 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white flex items-center gap-2">
                  <Target size={15} className="text-gold" />
                  <span>Enter Your Article Topic or Target Keyword</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      placeholder="e.g. Industrial Revolution, James Webb Telescope, Harappan Civilization"
                      className="w-full bg-paper2 dark:bg-[#121316] border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-ink dark:text-white focus:outline-none focus:border-gold"
                    />
                  </div>

                  <select
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="bg-paper2 dark:bg-[#121316] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-ink dark:text-white focus:outline-none focus:border-gold"
                  >
                    <option value="history">History</option>
                    <option value="science">Science</option>
                    <option value="inventions">Inventions</option>
                    <option value="discoveries">Discoveries</option>
                    <option value="birthdays">Birthdays</option>
                  </select>

                  <button
                    type="submit"
                    disabled={isLoading || !topicInput.trim()}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gold hover:bg-gold-l text-black font-bold text-xs rounded-xl shadow transition-all disabled:opacity-50 shrink-0"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Researching Trends...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>Analyze Keyword</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-ink3 dark:text-white/50">
                  <span>Popular quick ideas:</span>
                  {['Fall of Berlin Wall', 'Chandrayaan 3', 'Penicillin Discovery', 'Wright Brothers'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setTopicInput(s);
                      }}
                      className="hover:text-gold underline cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </form>

              {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/30 rounded-2xl text-xs text-rose-700 dark:text-rose-300">
                  {error}
                </div>
              )}

              {/* Research Results */}
              {researchResult ? (
                <div className="space-y-6 animate-in fade-in">
                  {/* Key Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1d23] border border-black/10 dark:border-white/10 space-y-1 shadow-2xs">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-ink3 dark:text-white/50">
                        Primary Focus Keyword
                      </div>
                      <div className="text-base font-bold text-ink dark:text-white flex items-center justify-between gap-2">
                        <span className="truncate">{researchResult.focusKeyword}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(researchResult.focusKeyword, 'focus')}
                          className="text-ink3 hover:text-gold"
                        >
                          {copiedKey === 'focus' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        </button>
                      </div>
                      <div className="text-[11px] text-gold font-semibold">
                        Intent: {researchResult.searchIntent}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1d23] border border-black/10 dark:border-white/10 space-y-1 shadow-2xs">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-ink3 dark:text-white/50">
                        Search Volume Tier
                      </div>
                      <div className="text-base font-bold text-emerald-700 flex items-center gap-1.5">
                        <TrendingUp size={16} />
                        <span>{researchResult.searchVolumeTier}</span>
                      </div>
                      <div className="text-[11px] text-ink3 dark:text-white/50">
                        Competition: <strong className="text-ink dark:text-white">{researchResult.competitionLevel}</strong> (Score {researchResult.difficultyScore}/100)
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1d23] border border-black/10 dark:border-white/10 space-y-2 shadow-2xs">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-ink3 dark:text-white/50">
                        Quick Apply
                      </div>
                      {onApplyToPost ? (
                        <button
                          type="button"
                          onClick={() => {
                            onApplyToPost({
                              targetKeyword: researchResult.focusKeyword,
                              focusKeyword: researchResult.focusKeyword,
                              seoTitle: researchResult.titleTagIdeas[0]?.title,
                              metaDescription: researchResult.metaDescription,
                              searchKeywords: [...researchResult.secondaryKeywords, ...researchResult.suggestedTags],
                              faqs: researchResult.faqSchema
                            });
                            alert("✅ SEO metadata applied to post! Save your edits to publish.");
                          }}
                          className="w-full py-2 bg-ink text-white dark:bg-white dark:text-black hover:bg-gold dark:hover:bg-gold font-bold text-xs rounded-xl transition-all shadow-sm"
                        >
                          Apply to Active Post
                        </button>
                      ) : (
                        <span className="text-xs text-ink3 dark:text-white/60">
                          Ready for article integration
                        </span>
                      )}
                    </div>
                  </div>

                  {/* High-CTR Title Tag Ideas */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1d23] border border-black/10 dark:border-white/10 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white flex items-center gap-2">
                      <FileText size={15} className="text-blue-500" />
                      <span>High-CTR Title Tag Recommendations (&lt; 60 Chars)</span>
                    </div>
                    <div className="space-y-2">
                      {researchResult.titleTagIdeas.map((idea, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-paper2 dark:bg-black/30 border border-black/5 dark:border-white/5 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="font-bold text-ink dark:text-white flex items-center gap-2">
                              <span>{idea.title}</span>
                              <span className="text-[10px] font-mono text-ink3 dark:text-white/50">
                                ({idea.characterCount} chars)
                              </span>
                            </div>
                            <div className="text-[11px] text-ink3 dark:text-white/60 italic">
                              Hook: {idea.clickHook}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(idea.title, `title-${idx}`)}
                            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-ink3 hover:text-ink shrink-0"
                            title="Copy Title"
                          >
                            {copiedKey === `title-${idx}` ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* High-CTR Meta Description */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1d23] border border-black/10 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white flex items-center gap-2">
                        <Lightbulb size={15} className="text-gold" />
                        <span>Recommended Meta Description (140-160 Chars)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(researchResult.metaDescription, 'meta')}
                        className="text-xs text-ink3 hover:text-ink flex items-center gap-1 font-bold"
                      >
                        {copiedKey === 'meta' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <p className="text-xs text-ink2 dark:text-white/80 p-3 bg-paper2 dark:bg-black/30 rounded-xl leading-relaxed border border-black/5 dark:border-white/5">
                      {researchResult.metaDescription}
                    </p>
                    <div className="text-[11px] text-ink3 dark:text-white/50 text-right font-mono">
                      {researchResult.metaDescription.length} characters
                    </div>
                  </div>

                  {/* Secondary & LSI Keywords */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1d23] border border-black/10 dark:border-white/10 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white flex items-center gap-2">
                      <Layers size={15} className="text-purple-500" />
                      <span>Secondary & LSI Keywords to Sprinkle in Body</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {researchResult.secondaryKeywords.map((kw, i) => (
                        <span
                          key={i}
                          onClick={() => handleCopy(kw, `kw-${i}`)}
                          className="cursor-pointer px-3 py-1.5 rounded-full bg-paper2 dark:bg-white/10 hover:bg-gold/20 text-xs font-medium text-ink dark:text-white border border-black/5 dark:border-white/10 transition-colors flex items-center gap-1.5"
                          title="Click to copy"
                        >
                          <span>{kw}</span>
                          {copiedKey === `kw-${i}` && <Check size={12} className="text-emerald-600" />}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Google "People Also Ask" (PAA) Questions for H2 Subheadings */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1d23] border border-black/10 dark:border-white/10 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white flex items-center gap-2">
                      <HelpCircle size={15} className="text-coral" />
                      <span>Google "People Also Ask" Queries (Use as H2 Subheadings)</span>
                    </div>
                    <div className="space-y-2.5">
                      {researchResult.peopleAlsoAsk.map((paa, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-paper2 dark:bg-black/30 border border-black/5 dark:border-white/5 space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-bold text-ink dark:text-white flex items-center gap-2">
                              <span className="bg-gold/20 text-black dark:text-gold text-[10px] font-mono px-1.5 py-0.5 rounded font-black">
                                {paa.targetHeading}
                              </span>
                              <span>## {paa.question}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(`## ${paa.question}\n${paa.snippetAnswer}`, `paa-${idx}`)}
                              className="text-ink3 hover:text-ink text-[11px] font-bold flex items-center gap-1"
                            >
                              {copiedKey === `paa-${idx}` ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                              <span>Copy H2</span>
                            </button>
                          </div>
                          <p className="text-ink3 dark:text-white/60 pl-8 leading-relaxed">
                            {paa.snippetAnswer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended SEO Tags */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1d23] border border-black/10 dark:border-white/10 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white">
                      Target Search Tags
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {researchResult.suggestedTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-paper2 dark:bg-white/5 text-ink3 dark:text-white/70 px-2.5 py-1 rounded-lg font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-ink3 dark:text-white/50 space-y-2 bg-white dark:bg-[#1c1d23] rounded-2xl border border-black/10 dark:border-white/10">
                  <Target size={32} className="mx-auto text-gold opacity-60" />
                  <div className="text-sm font-bold text-ink dark:text-white">
                    Ready to research keywords for your next post
                  </div>
                  <p className="text-xs max-w-md mx-auto">
                    Type any topic above and click <strong>"Analyze Keyword"</strong>. Our Google SEO engine will pull primary keywords, search intent, LSI terms, and high-CTR title variations.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SERP PREVIEW */}
          {activeTab === 'serp_preview' && (
            <div className="space-y-6">
              <GoogleSERPPreview
                title={currentPost?.seoTitle || currentPost?.title || researchResult?.titleTagIdeas?.[0]?.title || topicInput}
                metaDescription={currentPost?.metaDescription || currentPost?.excerpt || researchResult?.metaDescription || ''}
                category={categoryInput}
                focusKeyword={currentPost?.focusKeyword || currentPost?.targetKeyword || researchResult?.focusKeyword || ''}
                faqs={currentPost?.faqs || researchResult?.faqSchema || []}
              />
            </div>
          )}

          {/* TAB 3: ON-PAGE SEO AUDITOR */}
          {activeTab === 'auditor' && (
            <div className="space-y-6">
              <SEOAuditCard
                report={auditReport}
                onOpenResearcher={() => setActiveTab('research')}
              />
            </div>
          )}

          {/* TAB 4: GOOGLE PAGE 1 RANKING PLAYBOOK */}
          {activeTab === 'playbook' && (
            <div className="bg-white dark:bg-[#1c1d23] border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 text-ink dark:text-white leading-relaxed">
              <div className="space-y-2 border-b border-black/5 dark:border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={22} className="text-emerald-600" />
                  <h3 className="font-serif font-black text-2xl">
                    How Search Engines Work & How to Rank on Google Page 1
                  </h3>
                </div>
                <p className="text-xs text-ink3 dark:text-white/60">
                  A definitive master guide for FActHub authors and creators to consistently achieve top rankings on Google Search.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-4 rounded-2xl bg-paper2 dark:bg-black/30 border border-black/5 space-y-2">
                  <h4 className="font-bold text-sm text-gold flex items-center gap-1.5">
                    <span>1. Title Tag & H1 Rule</span>
                  </h4>
                  <p className="text-ink2 dark:text-white/80">
                    Google gives the highest weight to the first 30 characters of your <code className="font-mono bg-black/5 px-1 py-0.5 rounded">&lt;title&gt;</code> and your single <code className="font-mono bg-black/5 px-1 py-0.5 rounded">&lt;h1&gt;</code>. Always place your exact primary focus keyword at the very beginning of the title. Add a year (e.g., 2026) or curiosity hook ("Why...", "Origin Story", "Complete Guide") to maximize click-through rate (CTR).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-paper2 dark:bg-black/30 border border-black/5 space-y-2">
                  <h4 className="font-bold text-sm text-emerald-700 flex items-center gap-1.5">
                    <span>2. H2 & "People Also Ask" (PAA)</span>
                  </h4>
                  <p className="text-ink2 dark:text-white/80">
                    Never write an article with just plain text paragraphs. Break content into structured <code className="font-mono bg-black/5 px-1 py-0.5 rounded">## H2</code> subheadings that directly answer the exact questions people type into Google. This allows Google to index individual sections and grant "Jump to" sitelinks in search results.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-paper2 dark:bg-black/30 border border-black/5 space-y-2">
                  <h4 className="font-bold text-sm text-blue-700 flex items-center gap-1.5">
                    <span>3. Schema.org FAQ Rich Snippets</span>
                  </h4>
                  <p className="text-ink2 dark:text-white/80">
                    Adding FAQ structured data (<code className="font-mono bg-black/5 px-1 py-0.5 rounded">FAQPage</code> schema) is one of the highest leverage tactics in modern SEO. It causes Google to display accordion dropdowns directly below your search result, expanding your listing to occupy twice as much vertical screen space and pushing competitors down!
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-paper2 dark:bg-black/30 border border-black/5 space-y-2">
                  <h4 className="font-bold text-sm text-purple-700 flex items-center gap-1.5">
                    <span>4. E-E-A-T & Trustworthy Citations</span>
                  </h4>
                  <p className="text-ink2 dark:text-white/80">
                    Google’s Helpful Content Update penalizes thin AI fluff. To rank #1, articles must showcase Experience, Expertise, Authoritativeness, and Trust (E-E-A-T). Always attach verified references (<code className="font-mono bg-black/5 px-1 py-0.5 rounded">trustedSources</code>), an author byline, and an editorial fact-check verification stamp.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-gold/40 text-xs space-y-2">
                <div className="font-bold text-ink dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <Zap size={14} className="text-gold" />
                  <span>The 10-Minute Pre-Publishing Checklist for Every Article</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-ink2 dark:text-white/80">
                  <li><strong>Focus Keyword:</strong> Identified and placed in Title, first 100 words, and at least one H2.</li>
                  <li><strong>Title Length:</strong> Between 45 and 60 characters with power modifiers.</li>
                  <li><strong>Meta Description:</strong> Between 130 and 160 characters with active voice and call-to-action.</li>
                  <li><strong>Content Depth:</strong> At least 600 words of original, comprehensive research.</li>
                  <li><strong>Subheadings:</strong> Minimum 2-3 H2 headings answering common queries.</li>
                  <li><strong>Image Alt Text:</strong> Descriptive alt tag containing the focus keyword for Google Images.</li>
                  <li><strong>Structured Data:</strong> Article and FAQ schema active.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white dark:bg-[#1c1d23] border-t border-black/10 dark:border-white/10 flex items-center justify-between">
          <div className="text-xs text-ink3 dark:text-white/50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>SEO Engine: Online & Connected to Google Search Guidelines</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-paper2 dark:bg-white/10 hover:bg-black/5 dark:hover:bg-white/15 text-ink dark:text-white text-xs font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
