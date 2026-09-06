import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Lightbulb, 
  Award, 
  Check, 
  Plus, 
  BookOpen, 
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { QuizMCQ } from '../../types';
import { cn } from '../../lib/utils';

interface ArticleExamQuizSectionProps {
  quizMCQs?: QuizMCQ[];
  articleTitle: string;
  category: string;
  examRelevance?: string;
  isAdmin?: boolean;
  onEditClick?: () => void;
}

export const ArticleExamQuizSection: React.FC<ArticleExamQuizSectionProps> = ({
  quizMCQs = [],
  articleTitle,
  category,
  examRelevance,
  isAdmin,
  onEditClick
}) => {
  // Store selected option index per question: { [questionIdx]: selectedOptionIdx }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});

  const hasMCQs = quizMCQs && quizMCQs.length > 0;

  const handleOptionSelect = (qIdx: number, optionIdx: number) => {
    if (selectedAnswers[qIdx] !== undefined) return; // already answered
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optionIdx }));
    setShowExplanations(prev => ({ ...prev, [qIdx]: true }));
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setShowExplanations({});
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = hasMCQs 
    ? quizMCQs.reduce((acc, mcq, idx) => {
        const selected = selectedAnswers[idx];
        const correctIdx = (mcq as any).correctIndex ?? mcq.answer ?? 0;
        return acc + (selected === correctIdx ? 1 : 0);
      }, 0)
    : 0;

  if (!hasMCQs) {
    return (
      <section 
        aria-label="Exam View Practice Questions"
        className="mt-12 bg-gradient-to-br from-amber-50/50 via-paper to-paper2 rounded-3xl border border-gold/25 p-6 sm:p-8 not-prose shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gold/20 flex items-center justify-center text-gold shrink-0 mt-0.5">
              <GraduationCap size={22} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-gold">
                  Exam View & Prelims Practice
                </span>
                <span className="text-[10px] bg-paper border border-black/10 text-ink3 font-bold px-2 py-0.5 rounded-full">
                  UPSC • SSC • State PSC
                </span>
              </div>
              <h3 className="text-xl font-serif font-black text-ink">
                Practice Questions & Key Concepts
              </h3>
              <p className="text-xs text-ink3 leading-relaxed max-w-xl">
                {examRelevance 
                  ? examRelevance 
                  : `Master core exam concepts related to ${articleTitle}. Test your factual retention and competitive exam readiness.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && onEditClick && (
              <button
                type="button"
                onClick={onEditClick}
                className="flex items-center gap-1.5 px-4 py-2 bg-gold hover:bg-gold-l text-black font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                <Plus size={14} />
                <span>Add Exam Questions</span>
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      aria-label="Exam View Practice Questions"
      className="mt-12 bg-white rounded-3xl border border-black/10 p-6 sm:p-8 not-prose shadow-sm space-y-6"
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gold/20 flex items-center justify-center text-gold shrink-0 mt-0.5">
            <GraduationCap size={24} />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-gold">
                Exam View: Practice Q&A
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                Interactive Quiz
              </span>
              <span className="text-[10px] bg-paper2 text-ink3 font-mono px-2 py-0.5 rounded-full border border-black/5">
                {quizMCQs.length} Question{quizMCQs.length > 1 ? 's' : ''}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-black text-ink">
              🎓 Exam View: Practice Questions & Answers
            </h3>
            <p className="text-xs text-ink3 leading-relaxed">
              Targeted multiple-choice questions for UPSC Prelims, SSC CGL, State PSCs, and competitive static GK. Click an option to test your knowledge.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {answeredCount > 0 && (
            <button
              type="button"
              onClick={handleResetQuiz}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-paper2 hover:bg-paper3 text-ink font-bold text-xs rounded-xl border border-black/5 transition-all"
              title="Reset quiz answers"
            >
              <RotateCcw size={13} className="text-ink3" />
              <span>Reset</span>
            </button>
          )}
          {isAdmin && onEditClick && (
            <button
              type="button"
              onClick={onEditClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-paper2 hover:bg-gold/20 text-ink font-bold text-xs rounded-xl border border-black/5 transition-all"
              title="Edit questions"
            >
              <Plus size={13} className="text-gold" />
              <span>Edit Q&A</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress & Score Bar when answered */}
      {answeredCount > 0 && (
        <div className="p-4 rounded-2xl bg-paper2/70 border border-black/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-gold" />
            <span className="font-bold text-ink">
              Quiz Progress: {answeredCount} of {quizMCQs.length} answered
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-ink3 font-medium">Your Score:</span>
            <span className={cn(
              "font-mono font-bold px-2.5 py-0.5 rounded-full text-xs",
              correctCount === quizMCQs.length 
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : "bg-paper border border-black/10 text-ink"
            )}>
              {correctCount} / {quizMCQs.length} ({Math.round((correctCount / quizMCQs.length) * 100)}%)
            </span>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {quizMCQs.map((mcq, qIdx) => {
          const selectedOption = selectedAnswers[qIdx];
          const correctIdx = (mcq as any).correctIndex ?? mcq.answer ?? 0;
          const isAnswered = selectedOption !== undefined;
          const isCorrect = selectedOption === correctIdx;
          const showExp = showExplanations[qIdx];

          const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

          return (
            <div 
              key={qIdx}
              className={cn(
                "rounded-2xl border p-5 sm:p-6 transition-all space-y-4",
                isAnswered
                  ? isCorrect 
                    ? "bg-emerald-50/20 border-emerald-200 shadow-2xs" 
                    : "bg-rose-50/20 border-rose-200 shadow-2xs"
                  : "bg-paper border-black/5 hover:border-black/15"
              )}
            >
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-paper2 border border-black/10 rounded-md font-mono text-[11px] font-bold text-ink">
                    Q{qIdx + 1}
                  </span>
                  {mcq.examCategory && (
                    <span className="px-2 py-0.5 bg-gold/15 text-ink font-bold text-[10px] uppercase tracking-wider rounded-md border border-gold/20">
                      🎯 {mcq.examCategory}
                    </span>
                  )}
                </div>

                {isAnswered && (
                  <span className={cn(
                    "flex items-center gap-1 text-xs font-bold font-sans",
                    isCorrect ? "text-emerald-700" : "text-rose-700"
                  )}>
                    {isCorrect ? (
                      <>
                        <CheckCircle2 size={15} className="text-emerald-600" /> Correct Answer!
                      </>
                    ) : (
                      <>
                        <XCircle size={15} className="text-rose-600" /> Incorrect Choice
                      </>
                    )}
                  </span>
                )}
              </div>

              {/* Question Statement */}
              <h4 className="text-base sm:text-lg font-bold text-ink leading-relaxed">
                {mcq.question}
              </h4>

              {/* 4 Option Buttons */}
              <div className="grid grid-cols-1 gap-2.5 pt-1">
                {mcq.options.map((optionText, optIdx) => {
                  const isThisSelected = selectedOption === optIdx;
                  const isThisCorrect = optIdx === correctIdx;

                  let optionStyle = "bg-white border-black/10 hover:border-gold hover:bg-gold/5 text-ink";
                  let badgeStyle = "bg-paper2 text-ink3 border-black/10";

                  if (isAnswered) {
                    if (isThisCorrect) {
                      optionStyle = "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-400";
                      badgeStyle = "bg-emerald-600 text-white border-emerald-600";
                    } else if (isThisSelected && !isCorrect) {
                      optionStyle = "bg-rose-50 border-rose-500 text-rose-950 ring-1 ring-rose-400";
                      badgeStyle = "bg-rose-600 text-white border-rose-600";
                    } else {
                      optionStyle = "bg-white/60 border-black/5 text-ink3 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleOptionSelect(qIdx, optIdx)}
                      className={cn(
                        "w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all text-sm group",
                        optionStyle,
                        !isAnswered && "cursor-pointer active:scale-[0.99]"
                      )}
                    >
                      <span className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 border transition-colors",
                        badgeStyle,
                        !isAnswered && "group-hover:border-gold group-hover:text-ink"
                      )}>
                        {optionLabels[optIdx] || optIdx + 1}
                      </span>
                      <span className="flex-1 leading-snug pt-0.5">{optionText}</span>
                      {isAnswered && isThisCorrect && (
                        <span className="shrink-0 text-emerald-700 font-bold text-xs flex items-center gap-1 mt-0.5">
                          <Check size={14} /> Correct
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Key Takeaways Drawer */}
              {isAnswered && (
                <div className="pt-2 animate-in fade-in duration-200">
                  <div className="p-4 rounded-xl bg-white border border-black/10 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-ink font-bold text-xs uppercase tracking-wider">
                        <Lightbulb size={15} className="text-gold" />
                        <span>Explanation & Exam Key Takeaway</span>
                      </div>
                      <span className="text-[11px] font-mono text-ink3">
                        Correct: Option {optionLabels[correctIdx]}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-ink2 leading-relaxed">
                      {mcq.explanation || (
                        <span>
                          Option <strong>{optionLabels[correctIdx]}</strong> ({mcq.options[correctIdx]}) is the verified correct answer.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
