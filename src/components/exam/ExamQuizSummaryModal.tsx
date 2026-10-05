import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  BookOpen, 
  FileText, 
  Award, 
  Flame, 
  ChevronRight, 
  AlertTriangle,
  Bookmark,
  Share2
} from 'lucide-react';
import { ExamMCQ } from '../../pages/ExamPrep';
import { cn } from '../../lib/utils';

interface ExamQuizSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  mcqs: ExamMCQ[];
  selectedAnswers: Record<number, number>;
  score: number;
  onRetake: () => void;
  onOpenPdfViewer: () => void;
}

export const ExamQuizSummaryModal: React.FC<ExamQuizSummaryModalProps> = ({
  isOpen,
  onClose,
  mcqs,
  selectedAnswers,
  score,
  onRetake,
  onOpenPdfViewer
}) => {
  if (!isOpen) return null;

  const total = mcqs.length;
  const accuracy = Math.round((score / Math.max(1, total)) * 100);
  
  let gradeBadge = { label: '🏆 Excellent Mastery', color: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' };
  if (accuracy >= 80) {
    gradeBadge = { label: '🏆 High Performance', color: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' };
  } else if (accuracy >= 60) {
    gradeBadge = { label: '⭐ Good Effort - Revise Traps', color: 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30' };
  } else {
    gradeBadge = { label: '📚 Conceptual Revision Needed', color: 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/30' };
  }

  return (
    <div 
      className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex justify-center items-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="bg-paper dark:bg-[#15161e] border border-black/15 dark:border-white/15 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-4"
        onClick={e => e.stopPropagation()}
      >
        {/* ── HEADER ── */}
        <div className="bg-white dark:bg-[#1c1d28] p-5 sm:p-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gold/20 flex items-center justify-center text-2xl shrink-0">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-black text-xl text-ink dark:text-white">
                  Daily Practice Test Summary
                </h2>
                <span className={cn("text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border", gradeBadge.color)}>
                  {gradeBadge.label}
                </span>
              </div>
              <p className="text-xs text-ink3 dark:text-white/60">
                Detailed question-by-question analysis, answer keys & examiner traps
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-ink3 hover:text-ink dark:text-white/60 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── SCORE BANNER ── */}
        <div className="bg-gradient-to-r from-amber-500/15 via-gold/10 to-emerald-500/10 p-5 sm:p-6 border-b border-black/5 dark:border-white/5 shrink-0">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-wider text-ink3 dark:text-white/50 block">Final Score</span>
              <span className="text-2xl sm:text-3xl font-serif font-black text-gold">
                {score} <span className="text-sm text-ink3 dark:text-white/50">/ {total}</span>
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-wider text-ink3 dark:text-white/50 block">Accuracy</span>
              <span className="text-2xl sm:text-3xl font-mono font-black text-ink dark:text-white">
                {accuracy}%
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col justify-center items-center">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold block flex items-center gap-1">
                <Flame size={12} className="text-coral" /> Daily Goal
              </span>
              <span className="text-xs sm:text-sm font-bold text-ink dark:text-white mt-1">
                Streak Recorded!
              </span>
            </div>
          </div>
        </div>

        {/* ── QUESTION-BY-QUESTION REVIEW LIST ── */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-ink3 dark:text-white/50 px-1">
            Question Analysis & Trap Review:
          </div>

          {mcqs.map((mcq, idx) => {
            const userChoice = selectedAnswers[idx];
            const isCorrect = userChoice === mcq.correctAnswer;
            const isAnswered = typeof userChoice === 'number';

            return (
              <div 
                key={mcq.id || idx}
                className={cn(
                  "p-4 rounded-2xl border transition-all space-y-3",
                  isCorrect
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30"
                    : isAnswered
                      ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-500/30"
                      : "bg-paper2 dark:bg-white/5 border-black/10 dark:border-white/10"
                )}
              >
                {/* Question Status Header */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-ink3 dark:text-white/60">
                      Q{idx + 1}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-ink2 dark:text-white/70">
                      {mcq.targetExam || 'Competitive Exam'}
                    </span>
                  </div>

                  <span className={cn(
                    "inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full",
                    isCorrect
                      ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                      : isAnswered
                        ? "bg-rose-500/20 text-rose-800 dark:text-rose-300"
                        : "bg-black/10 text-ink3"
                  )}>
                    {isCorrect ? (
                      <>
                        <CheckCircle2 size={12} />
                        <span>Correct (+1)</span>
                      </>
                    ) : isAnswered ? (
                      <>
                        <XCircle size={12} />
                        <span>Incorrect</span>
                      </>
                    ) : (
                      <>
                        <HelpCircle size={12} />
                        <span>Not Answered</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Question Prompt */}
                <div className="font-serif font-bold text-sm sm:text-base text-ink dark:text-white">
                  {mcq.question}
                </div>

                {/* Choices Comparison */}
                <div className="space-y-1.5 pt-1 text-xs font-mono">
                  {mcq.options.map((opt, optIdx) => {
                    const isOptionCorrect = optIdx === mcq.correctAnswer;
                    const isOptionSelected = optIdx === userChoice;

                    return (
                      <div
                        key={optIdx}
                        className={cn(
                          "p-2 rounded-xl border flex items-center justify-between gap-2 text-xs",
                          isOptionCorrect
                            ? "bg-emerald-500/15 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-bold"
                            : isOptionSelected && !isOptionCorrect
                              ? "bg-rose-500/15 border-rose-500 text-rose-950 dark:text-rose-200 font-bold"
                              : "bg-white/60 dark:bg-white/5 border-transparent text-ink3 dark:text-white/60"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 text-center font-bold">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>

                        {isOptionCorrect && (
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase shrink-0">
                            ✓ Correct Answer
                          </span>
                        )}
                        {isOptionSelected && !isOptionCorrect && (
                          <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase shrink-0">
                            ✗ Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Detailed Explanation */}
                {mcq.explanation && (
                  <div className="pt-2 text-xs text-ink2 dark:text-white/80 leading-relaxed space-y-1">
                    <strong className="block font-bold text-ink dark:text-white">Explanation:</strong>
                    <p>{mcq.explanation}</p>
                  </div>
                )}

                {/* Examiner Trap */}
                {mcq.examTrap && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-950 dark:text-amber-200 space-y-0.5">
                    <strong className="flex items-center gap-1 font-bold text-amber-900 dark:text-amber-300">
                      <AlertTriangle size={13} /> Examiner Trap Analysis:
                    </strong>
                    <p className="leading-relaxed">{mcq.examTrap}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div className="p-4 sm:p-5 bg-white dark:bg-[#181922] border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              onClose();
              onRetake();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-black/15 dark:border-white/15 text-xs font-bold text-ink dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Retake Practice</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onOpenPdfViewer();
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <FileText size={14} />
              <span>Read Full Capsule (PDF)</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-l text-black font-black text-xs transition-all shadow-sm cursor-pointer"
            >
              <span>Done</span>
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
