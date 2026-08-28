import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  BookOpen, 
  Calendar, 
  Download, 
  Sparkles, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Bookmark, 
  Share2, 
  Award, 
  Zap, 
  X, 
  Send, 
  Layers, 
  FileText, 
  Compass, 
  ArrowRight, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { MAGAZINE_ISSUES, MONTHLY_VOLUMES } from '../data/magazineData';
import { MagazineIssue } from '../types';
import { factService } from '../services/factService';

export const Magazine = () => {
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('2026-09');
  const [selectedIssueId, setSelectedIssueId] = useState<string>('mag-2026-09-w1');
  const [isReaderModalOpen, setIsReaderModalOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isTeaserAnswered, setIsTeaserAnswered] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Current active issue
  const activeIssue: MagazineIssue = MAGAZINE_ISSUES.find(i => i.id === selectedIssueId) || MAGAZINE_ISSUES[0];
  const activeVolume = MONTHLY_VOLUMES.find(v => v.monthKey === selectedMonthKey) || MONTHLY_VOLUMES[0];

  // Available weekly issues for current active month
  const issuesInCurrentMonth = MAGAZINE_ISSUES.filter(i => i.monthKey === selectedMonthKey);

  const handleMonthChange = (monthKey: string) => {
    setSelectedMonthKey(monthKey);
    const firstIssueInMonth = MAGAZINE_ISSUES.find(i => i.monthKey === monthKey);
    if (firstIssueInMonth) {
      setSelectedIssueId(firstIssueInMonth.id);
    }
    setSelectedOption(null);
    setIsTeaserAnswered(false);
  };

  const handleIssueChange = (issueId: string) => {
    setSelectedIssueId(issueId);
    setSelectedOption(null);
    setIsTeaserAnswered(false);
  };

  const handleTeaserSelect = (optIndex: number) => {
    if (isTeaserAnswered) return;
    setSelectedOption(optIndex);
    setIsTeaserAnswered(true);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      showToast('⚠️ Please enter a valid email address.');
      return;
    }
    try {
      await factService.subscribe(emailInput.trim());
      setIsSubscribed(true);
      showToast('🎉 Subscribed to FactHub Weekly Magazine!');
    } catch {
      setIsSubscribed(true);
      showToast('🎉 Subscribed to FactHub Weekly Magazine!');
    }
  };

  const handleDownloadIssuePDF = () => {
    showToast(`📥 Downloading "${activeIssue.title}" (${activeIssue.pdfSize || '3.4 MB'} PDF)…`);
  };

  const handleDownloadFullVolumePDF = () => {
    showToast(`📥 Downloading Full Compendium "${activeVolume.month}" (${activeVolume.pdfSize || '14.2 MB'} PDF)…`);
  };

  return (
    <div className="bg-[#FFFDF5] text-ink min-h-screen font-sans selection:bg-gold selection:text-ink">
      <Helmet>
        <title>Weekly Magazine & Monthly Series — Science, History & Discovery | FactHub</title>
        <meta 
          name="description" 
          content="Explore FactHub's weekly digital magazine published every Sunday. Read in-depth cover stories, curated knowledge capsules, origin stories, and download monthly PDF compendiums." 
        />
      </Helmet>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#09142A] text-white px-5 py-3.5 rounded-2xl shadow-2xl border-l-4 border-gold text-sm font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles size={18} className="text-gold flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── MAGAZINE HERO SECTION ── */}
      <section className="bg-[#09142A] text-white pt-12 pb-16 border-b border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider">
                <BookOpen size={14} />
                <span>FactHub Digital Magazine • Weekly Sunday Edition</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-white leading-tight">
                Monthly Series · <span className="text-amber-400 italic">Weekly Releases</span>
              </h1>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                Published every Sunday morning. Four rich weekly issues per monthly volume featuring investigative science, ancient history milestones, aerospace breakthroughs, and curated exam digests.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleDownloadFullVolumePDF}
                className="bg-amber-400 hover:bg-amber-300 text-[#09142A] font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2 whitespace-nowrap"
              >
                <Download size={15} />
                <span>Download {activeVolume.month} Volume PDF</span>
              </button>
            </div>
          </div>

          {/* Monthly Volume Selector Pills */}
          <div className="pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-xs font-mono font-bold uppercase text-white/50 mr-2 flex-shrink-0 flex items-center gap-1.5">
              <Layers size={13} />
              <span>Volume Series:</span>
            </span>
            {MONTHLY_VOLUMES.map(vol => (
              <button
                key={vol.monthKey}
                onClick={() => handleMonthChange(vol.monthKey)}
                className={cn("px-4 py-2 rounded-full text-xs font-bold transition-all flex-shrink-0 flex items-center gap-2", {
                  "bg-white text-[#09142A] shadow-md scale-105": selectedMonthKey === vol.monthKey,
                  "bg-white/10 text-white/80 hover:bg-white/20 border border-white/10": selectedMonthKey !== vol.monthKey
                })}
              >
                <span>Vol. {vol.volumeNumber} — {vol.month}</span>
                {vol.monthKey === '2026-09' && (
                  <span className="bg-amber-400 text-[#09142A] text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase">
                    Current
                  </span>
                )}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* ── WEEKLY ISSUE SWITCHER STRIP ── */}
      <div className="bg-[#0F2247] border-b border-white/10 py-3 sticky top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-300 mr-1 flex-shrink-0">
                {activeVolume.month} Releases:
              </span>
              {[1, 2, 3, 4].map(wNum => {
                const issueForWeek = issuesInCurrentMonth.find(i => i.weekNumber === wNum);
                const isSelected = activeIssue.weekNumber === wNum;
                const isAvailable = Boolean(issueForWeek);

                return (
                  <button
                    key={wNum}
                    disabled={!isAvailable}
                    onClick={() => issueForWeek && handleIssueChange(issueForWeek.id)}
                    className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap", {
                      "bg-amber-400 text-[#09142A] shadow-lg scale-105": isSelected,
                      "bg-white/10 text-white hover:bg-white/20 border border-white/10": !isSelected && isAvailable,
                      "bg-white/5 text-white/30 border border-white/5 cursor-not-allowed": !isAvailable
                    })}
                  >
                    <span>Week {wNum} Edition</span>
                    {issueForWeek && (
                      <span className="text-[10px] font-mono opacity-80">
                        (Issue #{issueForWeek.issueNumber})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="hidden lg:flex items-center gap-3 text-xs text-white/70 font-mono">
              <span>Release Date: <strong className="text-white">{activeIssue.releaseDate}</strong></span>
              <span>•</span>
              <span>{activeIssue.pdfPages} Pages</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN MAGAZINE CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

        {/* 1. FEATURED COVER STORY & HERO CARD */}
        <section className="bg-white rounded-3xl border border-black/10 overflow-hidden shadow-lg hover:border-black/20 transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            
            {/* Cover Banner Image */}
            <div className="lg:col-span-6 relative min-h-[320px] lg:min-h-[440px] bg-black">
              <img 
                src={activeIssue.coverImage} 
                alt={activeIssue.title} 
                className="w-full h-full object-cover opacity-85 hover:opacity-95 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

              {/* Cover Top Badges */}
              <div className="absolute top-5 left-5 right-5 flex items-center justify-between gap-2">
                <span className="bg-amber-400 text-[#09142A] text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow">
                  Issue #{activeIssue.issueNumber} · Week {activeIssue.weekNumber}
                </span>
                <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-mono px-3 py-1 rounded-full border border-white/20">
                  {activeIssue.releaseDate}
                </span>
              </div>

              {/* Cover Bottom Category */}
              <div className="absolute bottom-5 left-5 right-5 space-y-1 text-white">
                <div className="text-xs font-mono font-bold uppercase tracking-widest text-amber-300">
                  {activeIssue.category}
                </div>
                <div className="text-xl sm:text-2xl font-serif font-black leading-tight text-white drop-shadow-md">
                  {activeIssue.title}
                </div>
              </div>
            </div>

            {/* Cover Story Summary & Direct Reader Action */}
            <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse"></span>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-gold">
                    Cover Story of the Week
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-serif font-black text-ink leading-tight">
                  {activeIssue.featuredStory.title}
                </h2>

                <p className="text-sm text-ink2 leading-relaxed">
                  {activeIssue.featuredStory.excerpt}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {activeIssue.featuredStory.tags.map((tag, tIdx) => (
                    <span 
                      key={tIdx}
                      className="text-[11px] font-mono font-medium bg-[#F7F3E8] text-ink2 px-2.5 py-1 rounded-lg border border-black/5"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-ink">{activeIssue.featuredStory.author}</div>
                  <div className="text-[11px] text-ink3 font-mono">{activeIssue.featuredStory.readTime} • Illustrated Special</div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsReaderModalOpen(true)}
                    className="bg-[#09142A] hover:bg-[#1A56DB] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md"
                  >
                    <BookOpen size={15} />
                    <span>Read Article</span>
                  </button>

                  <button
                    onClick={handleDownloadIssuePDF}
                    className="bg-[#F7F3E8] hover:bg-gold/20 text-ink border border-black/10 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                  >
                    <Download size={14} />
                    <span>PDF ({activeIssue.pdfSize})</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 2. WEEKLY CURATED FACTS BREAKDOWN */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#09142A] pb-3">
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#1A56DB]">
                Weekly Knowledge Digest
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-black text-[#09142A]">
                Curated Facts from This Week’s Edition
              </h3>
            </div>
            <span className="text-xs text-ink3 font-mono">
              Issue #{activeIssue.issueNumber} Breakdown
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {activeIssue.curatedFacts.map((fact, fIdx) => (
              <div 
                key={fIdx}
                className="bg-white rounded-2xl border border-black/10 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{fact.emoji}</span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A56DB] bg-blue-50 px-2 py-0.5 rounded">
                      {fact.category}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-base text-ink leading-snug">
                    {fact.title}
                  </h4>
                  <p className="text-xs text-ink2 leading-relaxed">
                    {fact.summary}
                  </p>
                </div>

                <Link
                  to={`/category/${fact.category.toLowerCase()}`}
                  className="text-[11px] font-bold text-[#1A56DB] hover:underline flex items-center gap-1 pt-2 border-t border-black/5"
                >
                  <span>Explore topic</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* 3. EXAM CAPSULE & BRAIN TEASER OF THE WEEK */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Exam Capsule (7 cols) */}
          <div className="lg:col-span-7 bg-[#F7F3E8] rounded-3xl border border-black/10 p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-amber-800">
                  <Award size={15} />
                  <span>Weekly Exam Capsule</span>
                </div>
                <h4 className="font-serif font-bold text-xl text-ink">
                  High-Yield Takeaways for Competitive Aspirants
                </h4>
              </div>
              <Link 
                to="/exam-prep" 
                className="text-xs font-bold text-[#1A56DB] hover:underline hidden sm:flex items-center gap-1 whitespace-nowrap"
              >
                <span>Full Exam Hub</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {activeIssue.examCapsule.map((item, cIdx) => (
                <div key={cIdx} className="bg-white rounded-2xl p-4 border border-black/5 space-y-1 shadow-sm">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-ink font-serif">{item.topic}</span>
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded border border-purple-200">
                      {item.examTarget}
                    </span>
                  </div>
                  <p className="text-xs text-ink2 leading-relaxed">
                    {item.keyTakeaway}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Brain Teaser of the Week (5 cols) */}
          <div className="lg:col-span-5 bg-[#09142A] text-white rounded-3xl border border-white/10 p-6 sm:p-8 space-y-5 shadow-lg flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                  <Zap size={15} />
                  <span>Weekly Mind Teaser</span>
                </div>
                <span className="text-[10px] text-white/50 font-mono">Week #{activeIssue.weekNumber}</span>
              </div>

              <h4 className="font-serif font-bold text-base sm:text-lg text-white leading-snug">
                {activeIssue.brainTeaser.question}
              </h4>

              <div className="space-y-2 pt-2">
                {activeIssue.brainTeaser.options.map((opt, optI) => {
                  const isSelected = selectedOption === optI;
                  const isCorrect = optI === activeIssue.brainTeaser.answer;

                  let optClass = "bg-white/5 hover:bg-white/15 border-white/10 text-white/90";
                  if (isTeaserAnswered) {
                    if (isCorrect) {
                      optClass = "bg-emerald-600 border-emerald-400 text-white font-bold";
                    } else if (isSelected) {
                      optClass = "bg-rose-600 border-rose-400 text-white font-bold";
                    } else {
                      optClass = "bg-white/5 border-white/5 text-white/40 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={optI}
                      disabled={isTeaserAnswered}
                      onClick={() => handleTeaserSelect(optI)}
                      className={cn("w-full p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-2.5", optClass)}
                    >
                      <span className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center font-mono text-[10px] font-bold">
                        {String.fromCharCode(65 + optI)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {isTeaserAnswered && (
                <div className="p-3.5 bg-white/10 border border-white/15 rounded-xl text-xs text-white/90 leading-relaxed animate-in fade-in space-y-1">
                  <strong className="text-amber-300 font-bold block">💡 Verified Explanation:</strong>
                  <p>{activeIssue.brainTeaser.explanation}</p>
                </div>
              )}
            </div>

            <div className="pt-2 text-center">
              <Link 
                to="/quiz" 
                className="text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors inline-flex items-center gap-1"
              >
                <span>Take Full Daily GK Quiz</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

        </div>

        {/* 4. PAST EDITIONS & MONTHLY ARCHIVE */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b-2 border-[#09142A] pb-3">
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#1A56DB]">
                Full Archives
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-black text-[#09142A]">
                All Weekly Issues & Monthly Volumes
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MAGAZINE_ISSUES.map((issue) => (
              <div 
                key={issue.id}
                onClick={() => handleIssueChange(issue.id)}
                className={cn("bg-white rounded-3xl border p-5 shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-4 group", {
                  "border-amber-400 ring-2 ring-amber-400/20 shadow-md": issue.id === activeIssue.id,
                  "border-black/10 hover:border-black/20 hover:shadow-md": issue.id !== activeIssue.id
                })}
              >
                <div className="space-y-3">
                  <div className="h-40 rounded-2xl overflow-hidden relative bg-black">
                    <img 
                      src={issue.coverImage} 
                      alt={issue.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                    />
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded-md font-bold">
                      {issue.month} · Week {issue.weekNumber}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A56DB]">
                      Issue #{issue.issueNumber} • {issue.releaseDate}
                    </span>
                    <h4 className="font-serif font-bold text-base text-ink group-hover:text-[#1A56DB] transition-colors leading-snug line-clamp-2">
                      {issue.title}
                    </h4>
                    <p className="text-xs text-ink2 line-clamp-2 leading-relaxed">
                      {issue.tagline}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-black/5 flex items-center justify-between text-xs font-bold">
                  <span className="text-[#1A56DB] group-hover:underline flex items-center gap-1">
                    <span>{issue.id === activeIssue.id ? 'Currently Viewing' : 'Read Issue'}</span>
                    <ChevronRight size={14} />
                  </span>
                  <span className="text-ink3 text-[11px] font-mono">{issue.pdfSize}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. WEEKLY MAGAZINE SUBSCRIPTION */}
        <section className="bg-gradient-to-br from-[#09142A] to-[#0F2247] rounded-3xl p-8 sm:p-12 text-white border border-white/10 shadow-xl">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-[#09142A] flex items-center justify-center text-3xl mx-auto shadow-lg">
              📖
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-serif font-black text-white">
                Get Every Sunday Edition Delivered to Your Inbox
              </h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Join over 250,000 curious minds, students, and educators reading the FactHub Weekly Magazine. Ad-free summaries, full cover stories, and printable PDF digests.
              </p>
            </div>

            {!isSubscribed ? (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email address..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl p-3 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400 font-mono"
                />
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-[#09142A] font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Send size={14} />
                  <span>Subscribe Free</span>
                </button>
              </form>
            ) : (
              <div className="bg-emerald-500/20 border border-emerald-400/40 p-4 rounded-2xl text-center max-w-md mx-auto space-y-1">
                <div className="text-emerald-300 font-bold text-sm flex items-center justify-center gap-1.5">
                  <CheckCircle2 size={18} />
                  <span>You're Subscribed!</span>
                </div>
                <p className="text-xs text-white/70">Check your inbox this Sunday morning for the new release.</p>
              </div>
            )}
          </div>
        </section>

      </div>

      {/* ── FULL COVER STORY READER MODAL ── */}
      {isReaderModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 sm:p-6 overflow-y-auto animate-in fade-in"
          onClick={() => setIsReaderModalOpen(false)}
        >
          <div 
            className="bg-white text-ink w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-black/10 flex items-center justify-between gap-4 bg-[#F7F3E8]">
              <div className="space-y-1 overflow-hidden">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1A56DB]">
                  FactHub Magazine · Issue #{activeIssue.issueNumber} (Week {activeIssue.weekNumber})
                </span>
                <h3 className="font-serif font-black text-lg sm:text-xl text-ink truncate">
                  {activeIssue.featuredStory.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadIssuePDF}
                  className="bg-[#09142A] text-white hover:bg-gold hover:text-ink text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow"
                >
                  <Download size={13} />
                  <span className="hidden sm:inline">PDF</span>
                </button>
                <button
                  onClick={() => setIsReaderModalOpen(false)}
                  className="p-2 text-ink3 hover:text-ink rounded-xl hover:bg-black/5 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body Article */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 font-serif text-base leading-relaxed">
              <div className="space-y-2 font-sans border-b border-black/5 pb-4">
                <div className="text-xs text-ink3 font-mono">
                  By <strong>{activeIssue.featuredStory.author}</strong> • {activeIssue.featuredStory.readTime}
                </div>
                <p className="text-sm font-medium text-ink2 italic font-serif">
                  "{activeIssue.featuredStory.excerpt}"
                </p>
              </div>

              <div className="prose prose-stone max-w-none text-ink leading-relaxed">
                <ReactMarkdown>{activeIssue.featuredStory.fullContent}</ReactMarkdown>
              </div>

              <div className="pt-6 border-t border-black/10 font-sans space-y-3">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-ink3">Article Tags & Syllabus Mapping:</div>
                <div className="flex flex-wrap gap-2">
                  {activeIssue.featuredStory.tags.map((tag, idx) => (
                    <span key={idx} className="bg-[#F7F3E8] text-ink font-mono text-xs px-3 py-1 rounded-lg border border-black/5 font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-black/10 bg-[#F7F3E8] flex items-center justify-between text-xs font-sans">
              <span className="text-ink3 font-mono">© FactHub Editorial Publishing</span>
              <button
                onClick={() => setIsReaderModalOpen(false)}
                className="px-5 py-2 bg-[#09142A] text-white font-bold rounded-xl hover:bg-[#1A56DB] transition-colors"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
