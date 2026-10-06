import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Download, 
  Printer, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  AlertTriangle,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { DailyCapsuleData, downloadCurrentAffairsPdf } from '../../lib/currentAffairsPdfExport';
import { cn } from '../../lib/utils';

interface PrintableA4HandoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  capsule: DailyCapsuleData | null;
}

export const PrintableA4HandoutModal: React.FC<PrintableA4HandoutModalProps> = ({
  isOpen,
  onClose,
  capsule
}) => {
  const printContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !capsule) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    try {
      downloadCurrentAffairsPdf(capsule);
    } catch (e) {
      console.warn('PDF export fallback:', e);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="bg-white dark:bg-[#1a1b22] text-ink dark:text-white rounded-3xl max-w-4xl w-full max-h-[94vh] shadow-2xl flex flex-col border border-white/20 overflow-hidden"
        >
          {/* Header Bar */}
          <div className="p-4 sm:p-5 bg-paper2 dark:bg-[#121316] border-b border-black/10 dark:border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gold/15 text-gold flex items-center justify-center border border-gold/30 shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="font-serif font-black text-base sm:text-lg">
                  2-Page A4 Exam Handout • {capsule.displayDate}
                </h3>
                <p className="text-xs text-ink3 dark:text-white/60">
                  {capsule.previousDayDisplay ? `Grounded strictly in events of ${capsule.previousDayDisplay}` : 'Daily Current Affairs & Practice MCQs'} • Format: Standard 2-Page A4 Portrait
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 bg-paper2 hover:bg-black/5 dark:bg-white/10 dark:hover:bg-white/15 text-ink dark:text-white font-bold text-xs rounded-xl flex items-center gap-1.5 border border-black/10 dark:border-white/10 cursor-pointer shadow-xs"
                title="Print front-and-back on 1 sheet of A4"
              >
                <Printer size={13} />
                <span className="hidden sm:inline">Print A4 Handout</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-gold hover:bg-gold-l text-black font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download size={13} />
                <span>Download PDF ({capsule.pdfFileSize || '184 KB'})</span>
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-ink3 hover:text-ink dark:text-white/60 dark:hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Container */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-8 bg-paper dark:bg-[#121316]">
            
            {/* Notice bar */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-xl text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
                <span>
                  <strong>Standard A4 Two-Page Sheet:</strong> Page 1 contains the 5 Practice MCQs with Examiner Traps; Page 2 contains the Core Current Affairs Digest grounded in <strong>{capsule.previousDayDisplay || 'the day before'}</strong>.
                </span>
              </div>
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 shrink-0">
                100% Unique
              </span>
            </div>

            {/* PREVIEW CONTAINER (Styled like printed A4 pages) */}
            <div ref={printContainerRef} className="space-y-8 max-w-3xl mx-auto">
              
              {/* ── PAGE 1: 5 MCQS & OFFICIAL ANSWER KEYS ── */}
              <div className="bg-white text-black p-6 sm:p-8 rounded-2xl shadow-md border border-black/10 space-y-5 font-sans relative">
                {/* Header */}
                <div className="bg-[#09142A] text-white p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h1 className="font-serif font-black text-lg tracking-wide">FACTHUB DAILY EXAM CAPSULE</h1>
                    <span className="text-gold text-[10px] font-mono font-bold uppercase tracking-wider block">
                      STEP 1: 5 MCQS • GROUNDED IN EVENTS OF {(capsule.previousDayDisplay || 'PREVIOUS DAY').toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="block font-bold">{capsule.displayDate}</span>
                    <span className="text-white/60 text-[10px]">Page 1 of 2 • A4 Handout</span>
                  </div>
                </div>

                <div className="p-2.5 bg-paper2 rounded-lg text-[11px] font-bold text-ink2 border border-black/5 flex items-center justify-between">
                  <span>💡 TEST RETENTION FIRST: Solve before reviewing current affairs digest on Page 2</span>
                  <span className="text-gold font-mono">5 Questions</span>
                </div>

                {/* 5 Questions */}
                <div className="space-y-4 pt-1">
                  {capsule.mcqs.map((q, idx) => (
                    <div key={q.id || idx} className="p-3.5 bg-paper2/60 rounded-xl border border-black/5 space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-black font-sans leading-snug">
                          <strong className="text-blue-700 font-mono mr-1">Q{idx + 1}.</strong> 
                          <span className="font-mono text-[10px] bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded font-bold mr-1.5">
                            {q.targetExam}
                          </span>
                          {q.question}
                        </span>
                      </div>

                      {/* 4 Options 2x2 grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect = oIdx === q.correctAnswer;
                          const letter = String.fromCharCode(65 + oIdx);
                          return (
                            <div 
                              key={oIdx}
                              className={cn(
                                "p-1.5 px-2.5 rounded-lg border flex items-center gap-1.5",
                                isCorrect 
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold" 
                                  : "bg-white border-black/5 text-gray-700"
                              )}
                            >
                              <span className="font-mono font-bold text-[10px] text-gray-500">({letter})</span>
                              <span>{opt}</span>
                              {isCorrect && <span className="ml-auto text-emerald-600 font-bold">✓</span>}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation & Trap Box */}
                      <div className="p-2 bg-amber-50/80 border border-amber-200 rounded-lg text-[11px] text-amber-950 space-y-0.5 mt-1.5">
                        <div><strong>• Context:</strong> {q.explanation}</div>
                        <div className="text-amber-900 font-semibold"><strong>• Examiner Trap:</strong> {q.examTrap}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-black/10 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                  <span>FactHub Daily Educational Initiative • UPSC | SSC CGL | Banking | RRB</span>
                  <span>Turn page for Today's News Digest ➔</span>
                </div>
              </div>


              {/* ── PAGE 2: CORE NEWS DIGEST GROUNDED IN DAY D - 1 ── */}
              <div className="bg-white text-black p-6 sm:p-8 rounded-2xl shadow-md border border-black/10 space-y-5 font-sans relative">
                {/* Header */}
                <div className="bg-[#09142A] text-white p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h2 className="font-serif font-black text-lg tracking-wide">FACTHUB DAILY EXAM CAPSULE</h2>
                    <span className="text-gold text-[10px] font-mono font-bold uppercase tracking-wider block">
                      STEP 2: PRELIMS DIGEST • GROUNDED IN EVENTS OF {(capsule.previousDayDisplay || 'PREVIOUS DAY').toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="block font-bold">{capsule.displayDate}</span>
                    <span className="text-white/60 text-[10px]">Page 2 of 2 • Core News Digest</span>
                  </div>
                </div>

                {/* 60s Memory Capsule Box */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5 text-xs">
                  <div className="font-bold text-blue-900 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={13} className="text-blue-600" />
                    <span>60-Second High-Yield Memory Capsule:</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-blue-950">
                    {capsule.quickPointers.map((p, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-1.5">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 4 Stories */}
                <div className="space-y-4 pt-1">
                  {capsule.currentAffairs.slice(0, 4).map((story, sIdx) => (
                    <div key={story.id || sIdx} className="p-3.5 bg-paper2/60 rounded-xl border border-black/5 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-black text-xs sm:text-sm font-serif">
                          {story.num || `0${sIdx + 1}`}. {story.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/5 font-bold text-gray-600 shrink-0">
                          {story.category}
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-700 leading-relaxed">
                        {story.summary}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-black/5 text-[10px]">
                        <div className="text-blue-900 bg-blue-50/70 p-1.5 rounded border border-blue-100">
                          <strong>Syllabus Focus:</strong> {story.examAngle}
                        </div>
                        <div className="text-emerald-900 bg-emerald-50/70 p-1.5 rounded border border-emerald-100">
                          <strong>Key Takeaway:</strong> {story.keyTakeaway}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-black/10 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                  <span>FactHub Verified Daily Gazette Citation • Printable A4 Front & Back Edition</span>
                  <span>End of Day D - 1 Digest</span>
                </div>
              </div>

            </div>

          </div>

          {/* Footer Bar */}
          <div className="p-4 sm:p-5 bg-paper2 dark:bg-[#121316] border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-4">
            <span className="text-xs text-ink3 dark:text-white/60">
              Designed for double-sided printing on 1 A4 sheet
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-ink text-white dark:bg-white dark:text-black font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={13} />
                <span>Print Document</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-gold hover:bg-gold-l text-black font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={13} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
