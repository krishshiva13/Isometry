import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Eye, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  BookOpen, 
  Columns, 
  Layers, 
  Sun, 
  Moon, 
  Highlighter, 
  Copy, 
  Check, 
  Sparkles,
  ExternalLink,
  HelpCircle,
  Award,
  CheckCircle2,
  X,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { 
  DailyCapsuleData, 
  downloadCurrentAffairsPdf, 
  getCurrentAffairsPdfBlobUrl 
} from '../../lib/currentAffairsPdfExport';

export interface PDFViewerPage {
  pageNumber: number;
  title: string;
  badge?: string;
  content?: React.ReactNode;
}

export interface PDFDocumentViewerProps {
  /** Daily capsule data containing MCQs, current affairs, date, and metadata */
  capsule?: DailyCapsuleData;
  /** Optional raw PDF URL or generated Blob URL */
  pdfUrl?: string;
  /** Document title */
  title?: string;
  /** Subtitle or date string */
  subtitle?: string;
  /** File name for display and download */
  fileName?: string;
  /** File size for display badge */
  fileSize?: string;
  /** Number of pages */
  pageCount?: number;
  /** Custom pages array (optional, fallback to capsule-driven rendering) */
  customPages?: PDFViewerPage[];
  /** Callback when user clicks download */
  onDownload?: () => void;
  /** Callback when user clicks print */
  onPrint?: () => void;
  /** Initial page index (1-based) */
  initialPage?: number;
  /** Custom extra classes */
  className?: string;
  /** Callback when a question is saved to student notebook */
  onSaveQuestion?: (questionId: string) => void;
  /** Saved questions map */
  savedQuestions?: Record<string, boolean>;
}

export const PDFDocumentViewer: React.FC<PDFDocumentViewerProps> = ({
  capsule,
  pdfUrl: externalPdfUrl,
  title,
  subtitle,
  fileName,
  fileSize,
  pageCount = 2,
  customPages,
  onDownload,
  onPrint,
  initialPage = 1,
  className,
  onSaveQuestion,
  savedQuestions = {},
}) => {
  // State management
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [readingTheme, setReadingTheme] = useState<'paper' | 'sepia' | 'night'>('paper');
  const [layoutMode, setLayoutMode] = useState<'single' | 'spread' | 'continuous'>('single');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [highlightExamTraps, setHighlightExamTraps] = useState<boolean>(true);
  const [activeTabMode, setActiveTabMode] = useState<'reader' | 'download'>('reader');
  const [copiedPage, setCopiedPage] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const displayTitle = title || (capsule ? `FactHub Daily Current Affairs Capsule • ${capsule.displayDate}` : 'FactHub Study Capsule');
  const displaySubtitle = subtitle || (capsule ? `${capsule.dayBadge} — 5 MCQs & Core News Digest` : 'Verified Educational Handout');
  const displayFileName = fileName || capsule?.pdfFileName || 'FactHub-Daily-Study-Capsule.pdf';
  const displayFileSize = fileSize || capsule?.pdfFileSize || '184 KB';
  const totalPages = customPages ? customPages.length : (capsule?.pdfPageCount || pageCount || 2);

  // Sync initialPage if changed from outside
  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  // Handle Fullscreen ESC and Arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      } else if (e.key === 'ArrowRight' && !isSearchOpen) {
        handleNextPage();
      } else if (e.key === 'ArrowLeft' && !isSearchOpen) {
        handlePrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, currentPage, totalPages, isSearchOpen]);

  const showToast = (text: string) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePrevPage = () => {
    setCurrentPage(p => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(p => Math.min(totalPages, p + 1));
  };

  const handleZoomIn = () => {
    setZoomLevel(z => Math.min(175, z + 15));
  };

  const handleZoomOut = () => {
    setZoomLevel(z => Math.max(70, z - 15));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
    showToast('🖨️ Opening print preview for 2-page A4 study capsule...');
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (capsule) {
      try {
        downloadCurrentAffairsPdf(capsule);
        showToast(`📥 Downloading "${displayFileName}"...`);
      } catch (err) {
        console.error('Download error', err);
        window.print();
      }
    } else {
      showToast('📥 Downloading document...');
    }
  };

  const handleCopyPageText = () => {
    if (!capsule) return;
    let textToCopy = '';
    if (currentPage === 1) {
      textToCopy = `FACTHUB DAILY STUDY SHEET • ${capsule.displayDate}\nPart I: 5 MCQs\n\n` + 
        capsule.mcqs.map((q, i) => `Q${i + 1}. [${q.targetExam}] ${q.question}\nOptions: ${q.options.join(', ')}\nAnswer: ${q.options[q.correctAnswer]}\nExplanation: ${q.explanation}\nTrap: ${q.examTrap}`).join('\n\n');
    } else {
      textToCopy = `FACTHUB DAILY STUDY SHEET • ${capsule.displayDate}\nPart II: Current Affairs Digest\n\n` + 
        capsule.currentAffairs.map((ca, i) => `${i + 1}. ${ca.title}\n${ca.summary}\nExam Angle: ${ca.examAngle}\nKey Takeaway: ${ca.keyTakeaway}`).join('\n\n');
    }
    navigator.clipboard.writeText(textToCopy);
    setCopiedPage(true);
    showToast(`📋 Page ${currentPage} notes copied to clipboard!`);
    setTimeout(() => setCopiedPage(false), 2000);
  };

  // Search match count calculator
  const searchMatchesCount = useMemo(() => {
    if (!searchQuery.trim() || !capsule) return 0;
    const query = searchQuery.toLowerCase();
    let count = 0;
    
    // Check MCQs
    capsule.mcqs.forEach(q => {
      if (q.question.toLowerCase().includes(query)) count++;
      if (q.explanation.toLowerCase().includes(query)) count++;
      if (q.examTrap.toLowerCase().includes(query)) count++;
      q.options.forEach(opt => {
        if (opt.toLowerCase().includes(query)) count++;
      });
    });

    // Check Current Affairs
    capsule.currentAffairs.forEach(ca => {
      if (ca.title.toLowerCase().includes(query)) count++;
      if (ca.summary.toLowerCase().includes(query)) count++;
      if (ca.examAngle.toLowerCase().includes(query)) count++;
      if (ca.keyTakeaway.toLowerCase().includes(query)) count++;
    });

    return count;
  }, [searchQuery, capsule]);

  // Highlight helper component
  const HighlightText: React.FC<{ text: string }> = ({ text }) => {
    if (!searchQuery.trim()) return <>{text}</>;
    
    const parts = text.split(new RegExp(`(${searchQuery.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === searchQuery.toLowerCase() ? (
            <mark key={i} className="bg-amber-300 text-black px-0.5 rounded font-bold shadow-xs">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Bulletproof Theme Configuration with guaranteed contrast
  const themeStyles = {
    paper: {
      dataSheet: 'paper',
      outerBg: 'bg-[#18191E]',
      sheetBg: 'bg-[#FAF8F5] text-[#0F172A] border-[#E2E8F0]',
      sheetHeaderBg: 'bg-[#09142A] text-white',
      accentBorder: 'border-[#09142A]',
      accentBg: 'bg-[#09142A]',
      cardBg: 'bg-[#FFFFFF] text-[#0F172A] border-[#E2E8F0]',
      cardTitle: 'text-[#0F172A]',
      cardBody: 'text-[#334155]',
      cardMeta: 'text-[#64748B]',
      optDefault: 'bg-[#F8FAFC] text-[#1E293B] border-[#E2E8F0]',
      optLetter: 'text-[#64748B]',
      optCorrect: 'bg-[#ECFDF5] text-[#065F46] border-[#6EE7B7]',
      calloutBg: 'bg-[#FFFBEB] text-[#78350F] border-[#FDE68A]',
      trapText: 'text-[#92400E]',
      focusBg: 'bg-[#EFF6FF] text-[#1E3A8A] border-[#BFDBFE]',
      tagBg: 'bg-[#F1F5F9] text-[#334155] border-[#CBD5E1]',
      watermark: 'text-black/5',
    },
    sepia: {
      dataSheet: 'sepia',
      outerBg: 'bg-[#2B231B]',
      sheetBg: 'bg-[#F5EEDB] text-[#291E13] border-[#E3D3BA]',
      sheetHeaderBg: 'bg-[#4A3728] text-[#FDF9F3]',
      accentBorder: 'border-[#4A3728]',
      accentBg: 'bg-[#4A3728]',
      cardBg: 'bg-[#FBF6EC] text-[#291E13] border-[#E3D3BA]',
      cardTitle: 'text-[#1C1309]',
      cardBody: 'text-[#453322]',
      cardMeta: 'text-[#7A624E]',
      optDefault: 'bg-[#EFE5D1] text-[#291E13] border-[#DFD1B8]',
      optLetter: 'text-[#7A624E]',
      optCorrect: 'bg-[#E8F5E9] text-[#1B5E20] border-[#C8E6C9]',
      calloutBg: 'bg-[#FDEBD0] text-[#7E5109] border-[#FAD7A0]',
      trapText: 'text-[#7E5109]',
      focusBg: 'bg-[#EAE0D0] text-[#332211] border-[#D5C2A5]',
      tagBg: 'bg-[#EFE3CF] text-[#5D4632] border-[#DAC7AF]',
      watermark: 'text-[#4A3728]/5',
    },
    night: {
      dataSheet: 'night',
      outerBg: 'bg-[#090A0F]',
      sheetBg: 'bg-[#0F1117] text-[#F1F5F9] border-[#2A2E3D]',
      sheetHeaderBg: 'bg-[#0B0D13] text-[#F8FAFC]',
      accentBorder: 'border-[#38BDF8]',
      accentBg: 'bg-[#1E293B]',
      cardBg: 'bg-[#181B24] text-[#F1F5F9] border-[#2A2E3D]',
      cardTitle: 'text-[#FFFFFF]',
      cardBody: 'text-[#CBD5E1]',
      cardMeta: 'text-[#94A3B8]',
      optDefault: 'bg-[#13151D] text-[#E2E8F0] border-[#2A2E3D]',
      optLetter: 'text-[#94A3B8]',
      optCorrect: 'bg-[#064E3B] text-[#A7F3D0] border-[#059669]',
      calloutBg: 'bg-[#2D2311] text-[#FDE047] border-[#785412]',
      trapText: 'text-[#FEF08A]',
      focusBg: 'bg-[#132238] text-[#93C5FD] border-[#1D4ED8]',
      tagBg: 'bg-[#1F2432] text-[#94A3B8] border-[#333A4D]',
      watermark: 'text-white/5',
    }
  }[readingTheme];

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 1 RENDER: 5 MCQs + EXPLANATIONS & TRAPS
  // ═══════════════════════════════════════════════════════════════════════════
  const renderPage1 = () => {
    if (!capsule) return null;
    return (
      <div 
        data-sheet={themeStyles.dataSheet}
        className={cn(
          "p-6 sm:p-10 space-y-6 font-serif relative overflow-hidden transition-colors min-h-[920px] facthub-paper-sheet",
          themeStyles.sheetBg
        )}
      >
        {/* Subtle Background Watermark */}
        <div className={cn("absolute inset-0 flex items-center justify-center pointer-events-none select-none -rotate-12", themeStyles.watermark)}>
          <span className="text-5xl sm:text-7xl font-black font-sans tracking-widest text-center opacity-70">
            FACTHUB VERIFIED<br/>EXAM CAPSULE
          </span>
        </div>

        {/* Page Institutional Header */}
        <div className={cn("rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md", themeStyles.sheetHeaderBg)}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-xl sm:text-2xl tracking-tight text-white">
                F<span className="text-amber-400">A</span>ctHub Exam Prep
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/20 text-white font-bold uppercase tracking-wider">
                A4 Handout
              </span>
            </div>
            <p className="text-xs text-white/80 font-sans">
              Daily Practice MCQs & Question Setter Trap Analysis
            </p>
          </div>

          <div className="text-left sm:text-right font-mono text-xs space-y-0.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10">
            <div className="font-bold text-amber-300">{capsule.displayDate}</div>
            <div className="text-[11px] text-white/70">Page 1 of 2 • UPSC | SSC | Banking</div>
          </div>
        </div>

        {/* Part I Banner */}
        <div className="flex items-center justify-between border-b-2 border-current pb-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-sans font-bold uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Part I: 5 High-Yield Daily Current Affairs MCQs</span>
          </div>
          <span className="text-[11px] font-mono opacity-70">
            Target Time: 6 Mins
          </span>
        </div>

        {/* 5 MCQs List */}
        <div className="space-y-4 relative z-10 font-sans">
          {capsule.mcqs.map((q, idx) => {
            const isSaved = savedQuestions[q.id];
            return (
              <div 
                key={q.id}
                className={cn(
                  "p-4 rounded-xl border transition-all text-xs space-y-2 shadow-xs facthub-paper-card",
                  themeStyles.cardBg
                )}
              >
                {/* Question title & target exam */}
                <div className="flex items-start justify-between gap-3">
                  <div className={cn("font-bold text-sm leading-snug facthub-paper-title", themeStyles.cardTitle)}>
                    <span className="text-amber-600 dark:text-amber-500 font-mono font-bold mr-1.5">Q{idx + 1}.</span>
                    <span className={cn("text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded mr-2 border", themeStyles.tagBg)}>
                      {q.targetExam}
                    </span>
                    <HighlightText text={q.question} />
                  </div>

                  {onSaveQuestion && (
                    <button
                      onClick={() => onSaveQuestion(q.id)}
                      className={cn(
                        "shrink-0 p-1 rounded-md text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer",
                        isSaved ? "text-emerald-600 font-bold" : "opacity-60 hover:opacity-100"
                      )}
                      title="Save to notebook"
                    >
                      {isSaved ? <Check size={12} /> : <BookOpen size={12} />}
                      <span>{isSaved ? 'Saved' : 'Save'}</span>
                    </button>
                  )}
                </div>

                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-sans text-xs">
                  {q.options.map((opt, oIdx) => {
                    const isCorrect = oIdx === q.correctAnswer;
                    return (
                      <div
                        key={oIdx}
                        className={cn(
                          "px-2.5 py-1.5 rounded-lg border flex items-center justify-between text-xs transition-colors",
                          isCorrect ? themeStyles.optCorrect : themeStyles.optDefault
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className={cn("font-mono font-bold text-[11px]", isCorrect ? "font-black" : themeStyles.optLetter)}>
                            ({String.fromCharCode(65 + oIdx)})
                          </span>
                          <span className={isCorrect ? "font-bold" : ""}>
                            <HighlightText text={opt} />
                          </span>
                        </div>
                        {isCorrect && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold shrink-0">
                            ✓ Key
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation & Trap Box */}
                <div className={cn("p-2.5 rounded-lg border text-[11px] leading-relaxed space-y-1 mt-2", themeStyles.calloutBg)}>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold shrink-0">💡 Fact & Reason:</span>
                    <span><HighlightText text={q.explanation} /></span>
                  </div>
                  {highlightExamTraps && (
                    <div className={cn("flex items-start gap-1.5 pt-1 border-t border-current/15 font-medium", themeStyles.trapText)}>
                      <span className="font-bold shrink-0">⚠️ Examiner Trap:</span>
                      <span><HighlightText text={q.examTrap} /></span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-current/10 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono opacity-75 gap-2">
          <span>FactHub Verified Educational Initiative • Non-Commercial Study Capsule</span>
          <span className="font-bold text-amber-600 dark:text-amber-400">Page 1 of 2 (Turn over for News Digest) ➔</span>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 2 RENDER: CURRENT AFFAIRS DIGEST & EXAM ANGLES
  // ═══════════════════════════════════════════════════════════════════════════
  const renderPage2 = () => {
    if (!capsule) return null;
    return (
      <div 
        data-sheet={themeStyles.dataSheet}
        className={cn(
          "p-6 sm:p-10 space-y-6 font-serif relative overflow-hidden transition-colors min-h-[920px] facthub-paper-sheet",
          themeStyles.sheetBg
        )}
      >
        {/* Subtle Background Watermark */}
        <div className={cn("absolute inset-0 flex items-center justify-center pointer-events-none select-none -rotate-12", themeStyles.watermark)}>
          <span className="text-5xl sm:text-7xl font-black font-sans tracking-widest text-center opacity-70">
            FACTHUB VERIFIED<br/>EXAM CAPSULE
          </span>
        </div>

        {/* Page Institutional Header */}
        <div className={cn("rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md", themeStyles.sheetHeaderBg)}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-xl sm:text-2xl tracking-tight text-white">
                F<span className="text-amber-400">A</span>ctHub Exam Prep
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/20 text-white font-bold uppercase tracking-wider">
                A4 Handout
              </span>
            </div>
            <p className="text-xs text-white/80 font-sans">
              Daily Current Affairs Digest, PIB Gazette & Analytical Exam Angles
            </p>
          </div>

          <div className="text-left sm:text-right font-mono text-xs space-y-0.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10">
            <div className="font-bold text-amber-300">{capsule.displayDate}</div>
            <div className="text-[11px] text-white/70">Page 2 of 2 • Official Edition</div>
          </div>
        </div>

        {/* 60-Second Memory Box */}
        <div className={cn("rounded-xl p-4 border font-sans text-xs space-y-2", themeStyles.focusBg)}>
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[11px]">
            <Award size={14} className="text-amber-500 shrink-0" />
            <span>Part II: Today's 60-Second High-Yield Memory Capsule</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] leading-relaxed">
            {capsule.quickPointers.map((ptr, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="font-bold text-amber-500 shrink-0">•</span>
                <span className="font-medium"><HighlightText text={ptr} /></span>
              </li>
            ))}
          </ul>
        </div>

        {/* Curated Current Affairs Articles */}
        <div className="space-y-4 relative z-10 font-sans">
          {capsule.currentAffairs.map((ca, idx) => (
            <div 
              key={ca.id}
              className={cn(
                "p-4 rounded-xl border text-xs space-y-2.5 transition-all shadow-xs facthub-paper-card",
                themeStyles.cardBg
              )}
            >
              {/* Title & metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <h4 className={cn("font-serif font-bold text-sm leading-snug facthub-paper-title", themeStyles.cardTitle)}>
                  <span className="text-amber-600 dark:text-amber-500 font-mono font-bold mr-1.5">0{idx + 1}.</span>
                  <HighlightText text={ca.title} />
                </h4>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={cn("text-[10px] font-mono uppercase px-2 py-0.5 rounded border", themeStyles.tagBg)}>
                    {ca.category}
                  </span>
                  {ca.exams.map((ex, exI) => (
                    <span key={exI} className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border", ex.tagClass)}>
                      {ex.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <p className={cn("text-xs leading-relaxed font-serif facthub-paper-body", themeStyles.cardBody)}>
                <HighlightText text={ca.summary} />
              </p>

              {/* Prelims & Mains Focus Box */}
              <div className={cn("p-2.5 rounded-lg border text-[11px] leading-relaxed space-y-1.5", themeStyles.calloutBg)}>
                <div className="flex items-start gap-1.5">
                  <strong className="shrink-0 font-bold">🎯 Prelims Focus:</strong>
                  <span><HighlightText text={ca.examAngle} /></span>
                </div>
                <div className="flex items-start gap-1.5 pt-1 border-t border-current/15">
                  <strong className="shrink-0 font-bold">📌 Key Takeaway:</strong>
                  <span><HighlightText text={ca.keyTakeaway} /></span>
                  <span className={cn("font-mono text-[10px] ml-auto shrink-0 opacity-75", themeStyles.cardMeta)}>
                    Source: {ca.source}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-current/10 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono opacity-75 gap-2">
          <span>FactHub Daily Current Affairs • Download PDF anytime at facthub.com/exam-prep</span>
          <span className="font-bold">End of 2-Page Daily Capsule • Page 2 of 2 ✓</span>
        </div>
      </div>
    );
  };

  // Custom pages fallback if provided
  const renderCustomPage = (pageNum: number) => {
    if (!customPages || !customPages[pageNum - 1]) return null;
    const page = customPages[pageNum - 1];
    return (
      <div 
        data-sheet={themeStyles.dataSheet}
        className={cn("p-6 sm:p-10 space-y-6 font-serif min-h-[920px] facthub-paper-sheet", themeStyles.sheetBg)}
      >
        <div className={cn("rounded-2xl p-4 flex items-center justify-between", themeStyles.sheetHeaderBg)}>
          <div className="font-serif font-black text-xl text-white">{page.title}</div>
          <div className="font-mono text-xs text-white/80">Page {pageNum} of {customPages.length}</div>
        </div>
        <div className={cn("p-4 rounded-xl border facthub-paper-card", themeStyles.cardBg)}>
          {page.content}
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "rounded-3xl border border-black/10 dark:border-white/10 overflow-hidden shadow-2xl transition-all duration-300 flex flex-col",
        isFullscreen ? "fixed inset-0 z-50 rounded-none bg-black/95 p-2 sm:p-4" : "bg-paper dark:bg-[#121318]",
        className
      )}
    >
      {/* ── TOAST NOTIFICATION ── */}
      {toastMsg && (
        <div className="absolute top-16 right-6 z-50 bg-[#09142A] text-white px-4 py-2.5 rounded-xl shadow-2xl border-l-4 border-amber-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <Sparkles size={14} className="text-amber-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── TOP CONTROL BAR ── */}
      <div className="bg-[#09142A] text-white px-4 sm:px-6 py-3.5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        
        {/* Left: Document Info & Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          <div className="w-8 h-8 rounded-xl bg-gold/20 flex items-center justify-center text-gold shrink-0">
            <FileText size={16} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-sm sm:text-base text-white truncate max-w-xs sm:max-w-md">
                {displayTitle}
              </h3>
              <span className="text-[10px] font-mono font-bold bg-white/10 px-2 py-0.5 rounded text-white/80 shrink-0">
                {displayFileSize}
              </span>
            </div>
            <p className="text-[11px] text-white/60 truncate font-sans">
              {displaySubtitle}
            </p>
          </div>

          {/* Reader vs PDF Download / Export tab toggle */}
          <div className="flex items-center bg-white/10 rounded-xl p-0.5 ml-2 border border-white/10 shrink-0">
            <button
              onClick={() => setActiveTabMode('reader')}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                activeTabMode === 'reader' ? "bg-gold text-black shadow-xs font-black" : "text-white/70 hover:text-white"
              )}
            >
              <BookOpen size={12} />
              <span>Smart Reader</span>
            </button>
            <button
              onClick={() => setActiveTabMode('download')}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                activeTabMode === 'download' ? "bg-gold text-black shadow-xs font-black" : "text-white/70 hover:text-white"
              )}
              title="Download original A4 PDF or print physical handout"
            >
              <Download size={12} />
              <span>PDF Download & Print</span>
            </button>
          </div>
        </div>

        {/* Center: Page Navigation & Zoom (Smart Reader Mode) */}
        {activeTabMode === 'reader' && (
          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            
            {/* Page Stepper */}
            <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/10">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className={cn(
                  "p-1 rounded-lg text-white transition-colors cursor-pointer",
                  currentPage <= 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-white/20"
                )}
                title="Previous page (Left arrow)"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="px-2.5 text-xs font-mono font-bold">
                Page <span className="text-gold">{currentPage}</span> / {totalPages}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className={cn(
                  "p-1 rounded-lg text-white transition-colors cursor-pointer",
                  currentPage >= totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-white/20"
                )}
                title="Next page (Right arrow)"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* View Mode (Single vs Spread vs Continuous) */}
            <div className="hidden sm:flex items-center bg-white/10 rounded-xl p-1 border border-white/10">
              <button
                onClick={() => setLayoutMode('single')}
                className={cn("p-1.5 rounded-lg text-xs transition-colors cursor-pointer", layoutMode === 'single' ? "bg-gold text-black" : "text-white/70 hover:text-white")}
                title="Single Page View"
              >
                <Layers size={14} />
              </button>
              <button
                onClick={() => setLayoutMode('spread')}
                className={cn("p-1.5 rounded-lg text-xs transition-colors cursor-pointer", layoutMode === 'spread' ? "bg-gold text-black" : "text-white/70 hover:text-white")}
                title="2-Page Side-by-Side Spread"
              >
                <Columns size={14} />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/10">
              <button
                onClick={handleZoomOut}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>

              <button
                onClick={handleResetZoom}
                className="px-1.5 text-[11px] font-mono font-bold text-gold hover:underline cursor-pointer"
                title="Reset Zoom to 100%"
              >
                {zoomLevel}%
              </button>

              <button
                onClick={handleZoomIn}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
            </div>

            {/* Theme Selector (Paper / Sepia / Night) */}
            <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/10">
              <button
                onClick={() => setReadingTheme('paper')}
                className={cn(
                  "px-2.5 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors", 
                  readingTheme === 'paper' ? "bg-white text-black shadow-xs font-black" : "text-white/70 hover:text-white"
                )}
                title="Clean Paper Theme (Crisp off-white handout)"
              >
                Paper
              </button>
              <button
                onClick={() => setReadingTheme('sepia')}
                className={cn(
                  "px-2.5 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors", 
                  readingTheme === 'sepia' ? "bg-[#F5EEDB] text-[#291E13] shadow-xs font-black" : "text-white/70 hover:text-white"
                )}
                title="Warm Sepia Eye-Care Theme"
              >
                Sepia
              </button>
              <button
                onClick={() => setReadingTheme('night')}
                className={cn(
                  "px-2.5 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors", 
                  readingTheme === 'night' ? "bg-slate-900 text-amber-300 shadow-xs font-black" : "text-white/70 hover:text-white"
                )}
                title="Dark Night Theme (High contrast late night study)"
              >
                Night
              </button>
            </div>
          </div>
        )}

        {/* Right: Search, Traps, Print, Download, Fullscreen */}
        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          
          {/* Search Toggle */}
          {activeTabMode === 'reader' && (
            <button
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                if (!isSearchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
              className={cn(
                "p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1",
                isSearchOpen ? "bg-gold text-black border-gold" : "bg-white/10 hover:bg-white/20 text-white border-white/15"
              )}
              title="Search text inside document"
            >
              <Search size={14} />
              <span className="hidden sm:inline">Search</span>
            </button>
          )}

          {/* Exam Traps Highlighter Toggle */}
          {activeTabMode === 'reader' && (
            <button
              onClick={() => {
                setHighlightExamTraps(!highlightExamTraps);
                showToast(highlightExamTraps ? 'Highlighter disabled' : 'Highlighter enabled for Examiner Traps');
              }}
              className={cn(
                "p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1",
                highlightExamTraps ? "bg-amber-400/20 text-amber-300 border-amber-400/40" : "bg-white/10 text-white/60 border-white/15"
              )}
              title="Toggle examiner trap highlights"
            >
              <Highlighter size={14} />
              <span className="hidden lg:inline">Traps</span>
            </button>
          )}

          {/* Copy Page Text */}
          {activeTabMode === 'reader' && (
            <button
              onClick={handleCopyPageText}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-colors cursor-pointer"
              title="Copy current page notes to clipboard"
            >
              {copiedPage ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          )}

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-colors cursor-pointer"
            title="Print clean 2-page A4 handout"
          >
            <Printer size={14} />
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownload}
            className="px-3.5 py-2 rounded-xl bg-gold hover:bg-gold-l text-black font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            title="Download printable PDF capsule"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Download PDF</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen (ESC)' : 'Fullscreen Study Mode'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>

      </div>

      {/* ── EXPANDABLE IN-DOCUMENT SEARCH BAR ── */}
      {isSearchOpen && activeTabMode === 'reader' && (
        <div className="bg-[#101E38] text-white px-4 sm:px-6 py-2.5 border-b border-white/10 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 flex-grow max-w-xl">
            <Search size={14} className="text-amber-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search words in document (e.g. Swachh Bharat, Hydrogen, RBI, Champaran, Shastri)..."
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/50 focus:outline-none focus:border-gold"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-white/60 hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            {searchQuery.trim() && (
              <span className="bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                {searchMatchesCount} {searchMatchesCount === 1 ? 'match' : 'matches'} found
              </span>
            )}
            <button
              onClick={() => setIsSearchOpen(false)}
              className="text-white/60 hover:text-white cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN VIEWER BODY ── */}
      <div className={cn("flex flex-grow overflow-hidden relative", themeStyles.outerBg)}>
        
        {/* Left Thumbnails Strip (Desktop Collapsible) */}
        {showThumbnails && activeTabMode === 'reader' && (
          <aside className="w-48 hidden lg:flex flex-col bg-black/40 border-r border-white/10 p-3 space-y-3 shrink-0 overflow-y-auto">
            <div className="flex items-center justify-between text-[11px] font-mono text-white/60 px-1">
              <span>Thumbnails</span>
              <span>{totalPages} Pages</span>
            </div>

            {/* Thumbnail Page 1 */}
            <div
              onClick={() => setCurrentPage(1)}
              className={cn(
                "p-2 rounded-xl border transition-all cursor-pointer space-y-1.5 group",
                currentPage === 1 
                  ? "bg-white/15 border-gold ring-1 ring-gold shadow-md" 
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              )}
            >
              <div className="aspect-[1/1.41] bg-[#FAF8F5] rounded p-2 text-[8px] font-serif text-[#0F172A] leading-tight overflow-hidden opacity-95 shadow-inner flex flex-col justify-between">
                <div>
                  <div className="font-bold text-[9px] text-[#09142A] border-b border-black/10 pb-0.5">
                    Part I: 5 MCQs
                  </div>
                  <div className="space-y-1 pt-1 opacity-70">
                    <div className="h-1 bg-black/40 rounded w-full" />
                    <div className="h-1 bg-black/25 rounded w-4/5" />
                    <div className="h-1 bg-black/25 rounded w-3/4" />
                  </div>
                </div>
                <div className="font-mono text-[7px] text-[#475569] border-t border-black/10 pt-0.5">
                  Page 1: Practice Questions
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-white/80 px-1">
                <span>Page 1</span>
                <span className="text-[9px] text-amber-400 font-bold">5 MCQs</span>
              </div>
            </div>

            {/* Thumbnail Page 2 */}
            <div
              onClick={() => setCurrentPage(2)}
              className={cn(
                "p-2 rounded-xl border transition-all cursor-pointer space-y-1.5 group",
                currentPage === 2 
                  ? "bg-white/15 border-gold ring-1 ring-gold shadow-md" 
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              )}
            >
              <div className="aspect-[1/1.41] bg-[#FAF8F5] rounded p-2 text-[8px] font-serif text-[#0F172A] leading-tight overflow-hidden opacity-95 shadow-inner flex flex-col justify-between">
                <div>
                  <div className="font-bold text-[9px] text-[#09142A] border-b border-black/10 pb-0.5">
                    Part II: Core Digest
                  </div>
                  <div className="space-y-1 pt-1 opacity-70">
                    <div className="h-1 bg-blue-600/40 rounded w-full" />
                    <div className="h-1 bg-black/25 rounded w-4/5" />
                    <div className="h-1 bg-black/25 rounded w-5/6" />
                  </div>
                </div>
                <div className="font-mono text-[7px] text-[#475569] border-t border-black/10 pt-0.5">
                  Page 2: Current Affairs Digest
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-white/80 px-1">
                <span>Page 2</span>
                <span className="text-[9px] text-blue-400 font-bold">News Digest</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 text-[10px] font-mono text-white/40 text-center">
              Print-Ready A4 Format
            </div>
          </aside>
        )}

        {/* Center Document Reading Canvas / PDF Station */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-8 flex justify-center items-start scrollbar-thin">
          
          {activeTabMode === 'reader' ? (
            <div 
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="transition-transform duration-200 w-full flex justify-center"
            >
              {layoutMode === 'single' && (
                <div className="w-full max-w-3xl shadow-2xl rounded-2xl overflow-hidden border border-black/10 animate-in fade-in duration-200">
                  {customPages 
                    ? renderCustomPage(currentPage)
                    : currentPage === 1 ? renderPage1() : renderPage2()
                  }
                </div>
              )}

              {layoutMode === 'spread' && (
                <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 shadow-2xl animate-in fade-in duration-200">
                  <div className="rounded-2xl overflow-hidden border border-black/10">
                    {customPages ? renderCustomPage(1) : renderPage1()}
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-black/10">
                    {customPages ? renderCustomPage(2) : renderPage2()}
                  </div>
                </div>
              )}

              {layoutMode === 'continuous' && (
                <div className="w-full max-w-3xl space-y-8 animate-in fade-in duration-200">
                  <div className="rounded-2xl overflow-hidden border border-black/10 shadow-2xl">
                    {customPages ? renderCustomPage(1) : renderPage1()}
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-black/10 shadow-2xl">
                    {customPages ? renderCustomPage(2) : renderPage2()}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // PDF Download & Handout Station (Eliminates Chrome blocked iframe error)
            <div className="w-full max-w-3xl bg-[#09142A] text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/20 flex flex-col space-y-8 animate-in fade-in">
              
              {/* Station Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold font-mono text-[11px] font-bold uppercase tracking-wider border border-gold/30">
                    <FileText size={14} />
                    <span>Official Study Handout & PDF Hub</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif font-black text-white">
                    {displayTitle}
                  </h3>
                  <p className="text-xs text-white/70">
                    Official 2-Page A4 Printable Compendium • {displayFileSize} • Print-Optimized
                  </p>
                </div>

                <button
                  onClick={() => setActiveTabMode('reader')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  <BookOpen size={14} />
                  <span>Return to Smart Reader</span>
                </button>
              </div>

              {/* Informational Notice Banner (Explaining Chrome sandbox policy) */}
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-3 text-xs text-blue-200 leading-relaxed">
                <Sparkles size={18} className="text-gold shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-white">
                    Built for Direct In-App Study & Offline Revision
                  </p>
                  <p className="text-white/80 text-[11px]">
                    Google Chrome disables embedded PDF browser plugins in iframe preview environments. For interactive reading, switch to our <strong>Smart Reader</strong> tab above. For offline revision or physical prints, click the instant download or print buttons below.
                  </p>
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <button
                  onClick={handleDownload}
                  className="p-5 rounded-2xl bg-gold hover:bg-gold-l text-black font-bold text-left transition-all shadow-xl flex flex-col justify-between space-y-4 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 rounded-xl bg-black/10 text-black">
                      <Download size={22} />
                    </span>
                    <span className="text-xs font-mono font-bold bg-black/10 px-2.5 py-1 rounded-lg">
                      {displayFileSize}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-black tracking-tight group-hover:translate-x-1 transition-transform">
                      Download Official PDF ➔
                    </h4>
                    <p className="text-xs opacity-85 mt-0.5">
                      Save complete 2-page A4 document directly to your device
                    </p>
                  </div>
                </button>

                <button
                  onClick={handlePrint}
                  className="p-5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-left transition-all border border-white/15 flex flex-col justify-between space-y-4 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 rounded-xl bg-white/10 text-white">
                      <Printer size={22} />
                    </span>
                    <span className="text-xs font-mono font-bold bg-white/10 px-2.5 py-1 rounded-lg">
                      A4 Format
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-black tracking-tight group-hover:translate-x-1 transition-transform">
                      Print 2-Page Handout ➔
                    </h4>
                    <p className="text-xs text-white/70 mt-0.5">
                      Clean print-ready layout without website navigation or ads
                    </p>
                  </div>
                </button>

              </div>

              {/* Document Architecture Overview Cards */}
              <div className="space-y-3">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-white/60">
                  Capsule Contents Breakdown:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between font-bold text-amber-300">
                      <span>Page 1: Active Recall Testing</span>
                      <span className="font-mono text-[10px] bg-amber-400/20 px-2 py-0.5 rounded text-amber-300">
                        5 MCQs
                      </span>
                    </div>
                    <p className="text-white/70 text-[11px] leading-relaxed">
                      5 exam-standard practice questions with ABCD options, official answer keys, and deep examiner trap explanations.
                    </p>
                    <button
                      onClick={() => {
                        setCurrentPage(1);
                        setActiveTabMode('reader');
                      }}
                      className="text-gold text-[11px] font-bold inline-flex items-center gap-1 hover:underline cursor-pointer pt-1"
                    >
                      <span>Read Page 1 in Smart Reader</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between font-bold text-blue-300">
                      <span>Page 2: Core News Digest</span>
                      <span className="font-mono text-[10px] bg-blue-400/20 px-2 py-0.5 rounded text-blue-300">
                        Exam Angles
                      </span>
                    </div>
                    <p className="text-white/70 text-[11px] leading-relaxed">
                      60-second high-yield memory pointers, curated national & global milestones, and explicit Prelims & Mains analytical angles.
                    </p>
                    <button
                      onClick={() => {
                        setCurrentPage(2);
                        setActiveTabMode('reader');
                      }}
                      className="text-gold text-[11px] font-bold inline-flex items-center gap-1 hover:underline cursor-pointer pt-1"
                    >
                      <span>Read Page 2 in Smart Reader</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions Footer */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-white/60 font-mono">
                <span>File: {displayFileName}</span>
                <button
                  onClick={handleCopyPageText}
                  className="inline-flex items-center gap-1 text-white hover:text-gold font-bold transition-colors cursor-pointer"
                >
                  <Copy size={13} />
                  <span>Copy Text Notes</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* ── BOTTOM MOBILE STATUS STRIP ── */}
      <div className="bg-[#09142A] text-white/70 px-4 py-2.5 border-t border-white/10 flex items-center justify-between text-xs font-mono shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 size={13} />
            <span className="hidden sm:inline">Exam Ready</span>
          </span>
          <span>A4 Format (2 Pages)</span>
          <span className="hidden md:inline">• Keyboard Nav: ← / → Page, ESC Fullscreen</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setCurrentPage(1);
              if (activeTabMode !== 'reader') setActiveTabMode('reader');
            }}
            className={cn("px-2 py-0.5 rounded cursor-pointer", currentPage === 1 && activeTabMode === 'reader' ? "bg-gold text-black font-bold" : "hover:text-white")}
          >
            Page 1 (MCQs)
          </button>
          <button
            onClick={() => {
              setCurrentPage(2);
              if (activeTabMode !== 'reader') setActiveTabMode('reader');
            }}
            className={cn("px-2 py-0.5 rounded cursor-pointer", currentPage === 2 && activeTabMode === 'reader' ? "bg-gold text-black font-bold" : "hover:text-white")}
          >
            Page 2 (News)
          </button>
        </div>
      </div>

    </div>
  );
};

export default PDFDocumentViewer;
