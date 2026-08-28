import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Flame, Trophy, Award, CheckCircle2, XCircle, ArrowRight, RotateCcw, Share2, Sparkles, Clock, Target, BookOpen, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QuizMCQ, UserStreakData } from '../types';
import { factService } from '../services/factService';
import { notebookService } from '../services/notebookService';
import { INITIAL_FACTS } from '../seed';
import { cn } from '../lib/utils';

// High yield curated questions pool fallback
const CURATED_DAILY_QUESTIONS: Array<QuizMCQ & { topic: string; factId?: string }> = [
  {
    topic: "Space & Astrophysics",
    question: "Which Indian space mission made India the first nation to successfully land a lunar craft on the Moon's South Pole region?",
    options: ["Chandrayaan-1", "Chandrayaan-2", "Chandrayaan-3", "Mangalyaan (MOM)"],
    answer: 2,
    explanation: "On August 23, 2023, ISRO's Chandrayaan-3 successfully touched down near the lunar south pole, making India the 4th country to soft-land on the Moon and the first near the southern polar region."
  },
  {
    topic: "Modern Indian History",
    question: "The historic Non-Cooperation Movement was launched by Mahatma Gandhi in 1920 primarily in response to which two events?",
    options: [
      "Rowlatt Act & Jallianwala Bagh Massacre",
      "Partition of Bengal & Swadeshi Movement",
      "Simon Commission & Salt Satyagraha",
      "Cripps Mission & Quit India Call"
    ],
    answer: 0,
    explanation: "The Non-Cooperation Movement (1920-1922) was initiated following the draconian Rowlatt Act of 1919, the brutal Jallianwala Bagh Massacre in Amritsar, and support for the Khilafat cause."
  },
  {
    topic: "General Science & Inventions",
    question: "The discovery of the 'Raman Effect', which won Sir C.V. Raman the Nobel Prize in Physics in 1930, deals with which physical phenomenon?",
    options: [
      "Photoelectric emission from metals",
      "Inelastic scattering of light photons by molecules",
      "Diffraction of X-rays in crystals",
      "Nuclear magnetic resonance"
    ],
    answer: 1,
    explanation: "The Raman Effect describes how a light beam passing through a transparent material undergoes inelastic scattering, with a fraction of the photons shifting in wavelength due to molecular vibrations."
  },
  {
    topic: "Indian Polity & Constitution",
    question: "Under which Article of the Indian Constitution can the Supreme Court issue Writs for the enforcement of Fundamental Rights?",
    options: ["Article 21", "Article 32", "Article 226", "Article 368"],
    answer: 1,
    explanation: "Article 32 gives citizens the right to move the Supreme Court directly for the enforcement of Fundamental Rights, famously called the 'Heart and Soul of the Constitution' by Dr. B.R. Ambedkar (Article 226 empowers High Courts)."
  },
  {
    topic: "World Geography & Discoveries",
    question: "Which historic expedition was the first to successfully reach the South Pole on December 14, 1911?",
    options: ["Robert Falcon Scott", "Roald Amundsen", "Ernest Shackleton", "James Cook"],
    answer: 1,
    explanation: "Norwegian explorer Roald Amundsen led the first expedition to reach the geographic South Pole on December 14, 1911, arriving 33 days ahead of Robert Falcon Scott's British party."
  }
];

export const DailyStreakChallenge: React.FC = () => {
  const [questions, setQuestions] = useState<QuizMCQ[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [userStreak, setUserStreak] = useState<UserStreakData>(notebookService.getUserStreak());
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [showShareToast, setShowShareToast] = useState(false);

  // Load questions from latest published facts with fallback
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const facts = await factService.getFacts('all', false, 15);
        const collectedMCQs: QuizMCQ[] = [];

        if (facts && facts.length > 0) {
          facts.forEach(f => {
            if (f.quizMCQs && f.quizMCQs.length > 0) {
              collectedMCQs.push(...f.quizMCQs);
            }
          });
        }

        if (collectedMCQs.length >= 5) {
          setQuestions(collectedMCQs.slice(0, 5));
        } else {
          setQuestions(CURATED_DAILY_QUESTIONS);
        }
      } catch {
        setQuestions(CURATED_DAILY_QUESTIONS);
      }
    };

    loadQuestions();
    setUserStreak(notebookService.getUserStreak());
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning || isQuizCompleted || questions.length === 0) return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, isQuizCompleted, questions.length]);

  const handleSelectOption = (idx: number) => {
    if (isAnswerRevealed) return;
    setSelectedOption(idx);
    setIsAnswerRevealed(true);

    const currentQ = questions[currentIndex];
    if (idx === currentQ.answer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerRevealed(false);
    } else {
      // Complete quiz and record streak
      const finalScore = selectedOption === questions[currentIndex].answer ? score + 1 : score;
      const updatedStreak = notebookService.recordQuizAttempt(finalScore, questions.length);
      setUserStreak(updatedStreak);
      setIsQuizCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerRevealed(false);
    setScore(0);
    setIsQuizCompleted(false);
    setTimerSeconds(60);
    setIsTimerRunning(true);
  };

  const handleShare = () => {
    const text = `🔥 I completed today's FActHub Daily GK Streak Challenge with a score of ${score}/${questions.length}! Current Streak: ${userStreak.currentStreak} Days. Test your knowledge: https://facthub.app/daily-streak`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-paper py-10 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Daily GK Streak Challenge (5-Question Test) | FActHub</title>
        <meta name="description" content="Take today's 5-question daily GK streak challenge on Day in History, Science discoveries, and competitive exam static GK. Build your learning streak!" />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-8">

        {/* Top Header Card */}
        <div className="bg-gradient-to-br from-ink via-ink2 to-ink text-paper p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 text-gold pointer-events-none">
            <Flame size={220} />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/20 text-gold rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-gold/30">
                <Sparkles size={14} /> Daily Retention Challenge
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-white">Daily 5-Question GK Streak</h1>
              <p className="text-xs sm:text-sm text-paper3 mt-1">5 high-yield questions every day based on historical milestones & exam GK</p>
            </div>

            {/* Live Streak Counter */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15">
              <div className="w-12 h-12 rounded-xl bg-gold/20 text-gold flex items-center justify-center animate-bounce">
                <Flame size={28} className="fill-gold" />
              </div>
              <div>
                <div className="text-xl font-mono font-black text-gold">{userStreak.currentStreak} Days</div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-paper3">Active Streak 🔥</div>
              </div>
            </div>
          </div>

          {/* Badges strip */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-paper3 mr-1">Earned Badges:</span>
            {userStreak.badges && userStreak.badges.length > 0 ? (
              userStreak.badges.map(b => (
                <span key={b} className="px-2.5 py-1 rounded-lg bg-white/15 text-gold text-xs font-bold border border-white/10">
                  {b}
                </span>
              ))
            ) : (
              <span className="text-xs text-paper3 italic">Complete today's challenge to unlock your first streak badge!</span>
            )}
          </div>
        </div>

        {/* Challenge Area */}
        {!isQuizCompleted && currentQ ? (
          <div className="bg-paper2 border border-black/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Question Header Status */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-black/10">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-gold text-ink font-bold text-xs">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-xs text-ink3 hidden sm:inline">• High-Yield Revision</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-ink bg-paper px-3 py-1 rounded-full border border-black/10">
                  <Clock size={14} className={timerSeconds < 15 ? "text-red-500 animate-spin" : "text-gold"} />
                  <span>{timerSeconds}s</span>
                </div>
                <div className="text-xs font-mono font-bold text-ink bg-gold/15 px-3 py-1 rounded-full text-gold">
                  Score: {score}/{currentIndex + (isAnswerRevealed && selectedOption === currentQ.answer ? 1 : 0)}
                </div>
              </div>
            </div>

            {/* Question Text */}
            <h2 className="text-lg sm:text-xl font-serif font-bold text-ink leading-relaxed">
              {currentQ.question}
            </h2>

            {/* Options */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.answer;

                let btnStyle = "border-black/10 bg-paper hover:border-gold hover:bg-gold/5 text-ink";
                if (isAnswerRevealed) {
                  if (isCorrect) {
                    btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20";
                  } else if (isSelected && !isCorrect) {
                    btnStyle = "border-red-500 bg-red-50 text-red-950 line-through ring-2 ring-red-500/20";
                  } else {
                    btnStyle = "border-black/5 bg-paper/50 opacity-60 text-ink3";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswerRevealed}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 text-sm font-medium",
                      btnStyle
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs bg-black/5">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {isAnswerRevealed && isCorrect && (
                      <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                    )}
                    {isAnswerRevealed && isSelected && !isCorrect && (
                      <XCircle size={18} className="text-red-500 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation & Next Action */}
            {isAnswerRevealed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-paper rounded-2xl border border-black/10 space-y-4"
              >
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gold mb-1 flex items-center gap-1">
                    <BookOpen size={14} /> Exam Explanation & Fact Background
                  </div>
                  <p className="text-xs sm:text-sm text-ink2 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-gold hover:bg-gold/90 text-ink font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-md active:scale-98"
                  >
                    <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'View Results & Streak'}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

          </div>
        ) : isQuizCompleted ? (
          /* Quiz Results Completion Card */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-paper2 border border-black/10 rounded-3xl p-8 text-center space-y-6 shadow-xl"
          >
            <div className="w-20 h-20 rounded-3xl bg-gold/20 text-gold mx-auto flex items-center justify-center shadow-inner">
              <Trophy size={42} className="fill-gold" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-ink">Challenge Completed!</h2>
              <p className="text-xs sm:text-sm text-ink3 mt-1">Daily streak points and accuracy record updated successfully.</p>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              <div className="bg-paper p-4 rounded-2xl border border-black/10">
                <div className="text-2xl font-mono font-black text-gold">{score}/{questions.length}</div>
                <div className="text-[10px] uppercase font-bold text-ink3">Today's Score</div>
              </div>
              <div className="bg-paper p-4 rounded-2xl border border-black/10">
                <div className="text-2xl font-mono font-black text-emerald-600">
                  {Math.round((score / Math.max(1, questions.length)) * 100)}%
                </div>
                <div className="text-[10px] uppercase font-bold text-ink3">Accuracy</div>
              </div>
              <div className="bg-paper p-4 rounded-2xl border border-black/10">
                <div className="text-2xl font-mono font-black text-gold flex items-center justify-center gap-1">
                  <Flame size={20} className="fill-gold" /> {userStreak.currentStreak}
                </div>
                <div className="text-[10px] uppercase font-bold text-ink3">Day Streak</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={handleShare}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-ink text-paper font-bold px-6 py-3 rounded-2xl text-xs hover:bg-black transition-all shadow-md"
              >
                <Share2 size={16} />
                <span>{showShareToast ? 'Link Copied!' : 'Share Your Score & Streak'}</span>
              </button>

              <button
                onClick={handleRestart}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-paper text-ink font-bold px-6 py-3 rounded-2xl text-xs border border-black/10 hover:border-gold transition-all"
              >
                <RotateCcw size={16} />
                <span>Retake Quiz</span>
              </button>

              <Link
                to="/flashcards"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gold text-ink font-bold px-6 py-3 rounded-2xl text-xs hover:bg-gold/90 transition-all shadow-md"
              >
                <Sparkles size={16} />
                <span>Review Flashcards</span>
              </Link>
            </div>

          </motion.div>
        ) : null}

        {/* Quick Links & Study Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <Link
            to="/notebook"
            className="p-5 rounded-2xl bg-paper2 border border-black/10 hover:border-gold transition-all group flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center font-bold">
              📓
            </div>
            <div>
              <div className="text-xs font-bold text-ink group-hover:text-gold transition-colors">Student Notebook</div>
              <div className="text-[10px] text-ink3">Organize saved facts & notes</div>
            </div>
          </Link>

          <Link
            to="/calendar"
            className="p-5 rounded-2xl bg-paper2 border border-black/10 hover:border-gold transition-all group flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold">
              📅
            </div>
            <div>
              <div className="text-xs font-bold text-ink group-hover:text-emerald-600 transition-colors">Date Explorer</div>
              <div className="text-[10px] text-ink3">Browse any date Jan 1 - Dec 31</div>
            </div>
          </Link>

          <Link
            to="/timeline"
            className="p-5 rounded-2xl bg-paper2 border border-black/10 hover:border-gold transition-all group flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center font-bold">
              ⏳
            </div>
            <div>
              <div className="text-xs font-bold text-ink group-hover:text-blue-600 transition-colors">Visual Timelines</div>
              <div className="text-[10px] text-ink3">Explore chronological eras</div>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
};
