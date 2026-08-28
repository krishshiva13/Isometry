import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { factService } from '../services/factService';
import { QuizQuestion } from '../types';
import { cn } from '../lib/utils';
import { Sparkles, RefreshCcw, ArrowLeft, LogIn, ShieldCheck, Calendar as CalendarIcon, Plus, Edit2, Trash2, CheckCircle2, HelpCircle, FileText, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { INITIAL_QUIZ } from '../seed';

const CATEGORIES = ['History', 'Science', 'Inventions', 'Discoveries', 'Birthdays', 'General'];

export const Quiz = () => {
  // Calendar / Date selection (Default to August 5, 2026 or current date)
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-05');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Playback state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answeredIdx, setAnsweredIdx] = useState<number | null>(null);

  const { user, isAdmin } = useAuth();

  // Admin Mode state
  const [adminTab, setAdminTab] = useState<'manual' | 'ai'>('manual');

  // Manual Form State
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [manualDate, setManualDate] = useState<string>('2026-08-05');
  const [manualQuestion, setManualQuestion] = useState('');
  const [manualCategory, setManualCategory] = useState('History');
  const [manualOptions, setManualOptions] = useState<[string, string, string, string]>(['', '', '', '']);
  const [manualCorrect, setManualCorrect] = useState<number>(0);
  const [manualExplanation, setManualExplanation] = useState('');
  const [manualStatus, setManualStatus] = useState('');
  const [isSavingManual, setIsSavingManual] = useState(false);

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiStatus, setAiStatus] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Load quiz for selected date
  const loadQuizForDate = async (dateStr: string) => {
    setLoading(true);
    try {
      const data = await factService.getQuizQuestions(dateStr);
      if (data && data.length > 0) {
        setQuestions(data);
      } else if (dateStr === 'all') {
        const allData = await factService.getQuizQuestions('all');
        setQuestions(allData || INITIAL_QUIZ);
      } else {
        // Fallback to initial quiz if none found for that date
        setQuestions([]);
      }
    } catch (err) {
      console.error(err);
      setQuestions([]);
    } finally {
      setLoading(false);
      restartQuiz();
    }
  };

  useEffect(() => {
    loadQuizForDate(selectedDate);
    setManualDate(selectedDate === 'all' ? '2026-08-05' : selectedDate);
  }, [selectedDate]);

  const signIn = async () => {
    try {
      await authService.signInWithGoogle();
    } catch (error) {
      console.error("Sign in failed", error);
    }
  };

  const handleAnswer = (idx: number) => {
    if (answeredIdx !== null) return;
    setAnsweredIdx(idx);
    if (idx === questions[currentIdx]?.correct) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    setCurrentIdx(prev => prev + 1);
    setAnsweredIdx(null);
  };

  const restartQuiz = () => {
    setCurrentIdx(0);
    setScore(0);
    setAnsweredIdx(null);
  };

  // Save manual question
  const handleSaveManualQuestion = async (e?: React.FormEvent, isNextQuestion: boolean = false) => {
    if (e) e.preventDefault();
    if (!manualQuestion.trim()) {
      setManualStatus("❌ Please write a question.");
      return;
    }
    if (manualOptions.some(o => !o.trim())) {
      setManualStatus("❌ Please fill in all 4 options.");
      return;
    }

    setIsSavingManual(true);
    setManualStatus("💾 Saving question to database...");

    const questionData: Omit<QuizQuestion, 'id'> = {
      q: manualQuestion.trim(),
      opts: manualOptions.map(o => o.trim()),
      correct: manualCorrect,
      cat: manualCategory,
      explanation: manualExplanation.trim(),
      date: manualDate
    };

    try {
      if (editingQuestionId) {
        await factService.updateQuizQuestion(editingQuestionId, questionData);
      } else {
        await factService.createQuizQuestion(questionData);
      }

      // Reload current date questions to get accurate count
      await loadQuizForDate(manualDate);
      // Also update selected date to match manual date if different
      if (selectedDate !== manualDate && selectedDate !== 'all') {
        setSelectedDate(manualDate);
      }

      if (isNextQuestion) {
        // Reset inputs but keep date and category for fast entry of next question
        setEditingQuestionId(null);
        setManualQuestion('');
        setManualOptions(['', '', '', '']);
        setManualCorrect(0);
        setManualExplanation('');
        
        const count = questions.length + 1;
        setManualStatus(`✅ Question saved! Enter Question #${count + 1} below:`);
      } else {
        setManualStatus("✅ Question saved successfully!");
        resetManualForm();
      }
    } catch (err: any) {
      console.error("Save Quiz Question Error:", err);
      const errMsg = err?.message || String(err);
      setManualStatus(`❌ Failed to save: ${errMsg}`);
    } finally {
      setIsSavingManual(false);
    }
  };

  const resetManualForm = () => {
    setEditingQuestionId(null);
    setManualQuestion('');
    setManualOptions(['', '', '', '']);
    setManualCorrect(0);
    setManualExplanation('');
  };

  const editQuestion = (q: QuizQuestion) => {
    setEditingQuestionId(q.id);
    setManualQuestion(q.q);
    setManualCategory(q.cat || 'History');
    setManualOptions([
      q.opts[0] || '',
      q.opts[1] || '',
      q.opts[2] || '',
      q.opts[3] || ''
    ]);
    setManualCorrect(q.correct || 0);
    setManualExplanation(q.explanation || '');
    setManualDate(q.date || selectedDate);
    setManualStatus("Editing selected question...");
    
    // Smooth scroll down to manual form
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      await factService.deleteQuizQuestion(id);
      await loadQuizForDate(selectedDate);
    } catch (err) {
      console.error(err);
      alert("Failed to delete question.");
    }
  };

  // Generate AI Quiz
  const generateAiQuiz = async () => {
    if (!aiPrompt) return;
    setIsAiLoading(true);
    setAiStatus("Consulting Gemini AI...");
    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        if (isAdmin) {
          setAiStatus("💾 Saving questions to database...");
          // Assign target date to AI generated questions
          const formattedQuestions = data.map(item => ({
            ...item,
            date: manualDate
          }));
          await factService.updateQuiz(formattedQuestions, manualDate);
        }
        
        await loadQuizForDate(selectedDate);
        setAiStatus(`✅ Successfully ${isAdmin ? 'published' : 'generated'} ${data.length} new questions for ${manualDate}!`);
        setAiPrompt("");
      } else {
        setAiStatus("❌ Failed to generate questions. Try a different prompt.");
      }
    } catch (err) {
       console.error(err);
       setAiStatus("❌ An error occurred. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const isFinished = questions.length > 0 && currentIdx >= questions.length;
  const currentQ = questions[currentIdx];

  return (
    <div className="bg-paper min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Header Navigation */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-2 text-ink3 hover:text-ink transition-colors mb-2 group font-medium">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-serif font-black text-ink flex items-center justify-center gap-3">
            <span>⚡ FActHub Daily Quiz</span>
          </h1>
          <p className="text-ink3 text-sm">Challenge your knowledge with daily facts and trivia</p>
        </div>

        {/* Date / Calendar Selector Bar */}
        <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-ink font-serif font-bold text-lg">
              <CalendarIcon size={20} className="text-gold" />
              <span>Select Quiz Date</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input 
                type="date"
                value={selectedDate === 'all' ? '2026-08-05' : selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-paper2 border border-black/10 text-ink font-mono text-sm px-4 py-2 rounded-xl focus:outline-none focus:border-gold w-full sm:w-auto font-bold"
              />
              <button 
                onClick={() => setSelectedDate('all')}
                className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all border", {
                  "bg-ink text-white border-ink": selectedDate === 'all',
                  "bg-paper2 text-ink3 border-black/10 hover:text-ink": selectedDate !== 'all'
                })}
              >
                All Quizzes
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-black/5 text-xs font-mono text-ink3">
            <span className="font-bold text-ink">Quick Launch Dates:</span>
            {['2026-08-05', '2026-08-06', '2026-08-07'].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className={cn("px-3 py-1 rounded-lg transition-all border", {
                  "bg-gold text-ink font-bold border-gold": selectedDate === d,
                  "bg-paper2 hover:bg-black/5 text-ink2 border-black/5": selectedDate !== d
                })}
              >
                Aug {parseInt(d.split('-')[2])}, 2026
              </button>
            ))}
          </div>
        </div>

        {/* Quiz Play Window */}
        <div className="bg-indigo rounded-[32px] p-6 sm:p-10 text-white shadow-fact-lg relative overflow-hidden">
          <div className="absolute -right-12 -top-12 text-[12rem] font-serif font-black text-white/5 select-none pointer-events-none">?</div>

          {loading ? (
            <div className="text-center py-16 space-y-3">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-gold border-t-transparent mx-auto"></div>
              <p className="text-white/70 font-mono text-sm">Loading quiz questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 space-y-5 relative z-10">
              <div className="text-6xl">📅</div>
              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-bold">No Quiz Questions for {selectedDate}</h2>
                <p className="text-white/70 text-sm max-w-md mx-auto">
                  There are no questions added for this specific date yet. Select another date above or view all quizzes!
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button 
                  onClick={() => setSelectedDate('all')}
                  className="bg-gold text-ink px-6 py-2.5 rounded-full font-bold hover:bg-gold-l transition-all text-sm"
                >
                  View All Quizzes
                </button>
                {isAdmin && (
                  <button 
                    onClick={() => {
                      setManualDate(selectedDate);
                      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                    }}
                    className="bg-white/10 border border-white/20 text-white px-6 py-2.5 rounded-full font-bold hover:bg-white/20 transition-all text-sm flex items-center gap-2"
                  >
                    <Plus size={16} /> Add Questions for this Date
                  </button>
                )}
              </div>
            </div>
          ) : !isFinished ? (
            <div className="space-y-8 relative z-10">
              <div className="flex items-center justify-between font-mono text-[0.7rem] text-white/60 uppercase tracking-widest">
                <span>Question {currentIdx + 1} of {questions.length}</span>
                <span className="bg-white/10 px-3 py-1 rounded-full text-gold-l font-bold">
                  {currentQ.date ? `📅 ${currentQ.date}` : currentQ.cat}
                </span>
              </div>

              <h2 className="text-2xl lg:text-3xl font-serif font-bold leading-snug">
                {currentQ.q}
              </h2>

              {/* 4 Options */}
              <div className="grid gap-3">
                {currentQ.opts.map((opt, i) => {
                  const isCorrect = i === currentQ.correct;
                  const isSelected = i === answeredIdx;
                  const optionLetters = ['A', 'B', 'C', 'D'];
                  return (
                    <button
                      key={i}
                      disabled={answeredIdx !== null}
                      onClick={() => handleAnswer(i)}
                      className={cn(
                        "w-full text-left p-4 rounded-2xl text-sm font-medium transition-all border flex items-center gap-3",
                        answeredIdx === null 
                          ? "bg-white/10 border-white/20 hover:bg-white/20 text-white" 
                          : isCorrect 
                            ? "bg-sage border-sage text-white font-bold" 
                            : isSelected 
                              ? "bg-coral border-coral text-white font-bold" 
                              : "bg-white/5 border-white/10 text-white/40 opacity-50"
                      )}
                    >
                      <span className="w-7 h-7 rounded-lg bg-black/20 flex items-center justify-center font-mono text-xs font-bold flex-shrink-0">
                        {optionLetters[i]}
                      </span>
                      <span className="flex-grow">{opt}</span>
                      {answeredIdx !== null && isCorrect && (
                        <CheckCircle2 size={18} className="text-white flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Answer & Explanation Section (Shown after answering) */}
              <AnimatePresence>
                {answeredIdx !== null && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={cn("p-5 rounded-2xl border space-y-2 text-sm", {
                      "bg-sage/20 border-sage/40 text-white": answeredIdx === currentQ.correct,
                      "bg-coral/20 border-coral/40 text-white": answeredIdx !== currentQ.correct
                    })}
                  >
                    <div className="flex items-center gap-2 font-bold text-base">
                      {answeredIdx === currentQ.correct ? (
                        <><span>🎉 Correct Answer!</span></>
                      ) : (
                        <><span>❌ Incorrect</span></>
                      )}
                    </div>
                    
                    <p className="text-white/90">
                      <strong>Correct Option:</strong> {currentQ.opts[currentQ.correct]}
                    </p>

                    {currentQ.explanation && (
                      <div className="pt-2 border-t border-white/10 text-white/80 text-xs leading-relaxed space-y-1">
                        <span className="font-bold uppercase tracking-wider text-[10px] text-gold-l flex items-center gap-1">
                          <HelpCircle size={12} /> Explanation:
                        </span>
                        <p>{currentQ.explanation}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between pt-2">
                <button onClick={restartQuiz} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs font-medium">
                  <RefreshCcw size={14} /> Restart Quiz
                </button>

                {answeredIdx !== null && (
                  <button onClick={nextQuestion} className="bg-gold text-ink px-8 py-3 rounded-full font-bold hover:bg-gold-l transition-all shadow-lg text-sm">
                    Next Question →
                  </button>
                )}
              </div>

              {/* Progress */}
              <div className="pt-4 border-t border-white/10">
                 <div className="flex justify-between text-[0.65rem] text-white/50 font-mono uppercase mb-2">
                    <span>Score: {score}/{currentIdx + (answeredIdx !== null ? 1 : 0)}</span>
                    <span>Progress: {Math.round(((currentIdx + (answeredIdx !== null ? 1 : 0)) / questions.length) * 100)}%</span>
                 </div>
                 <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gold-l" 
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentIdx + (answeredIdx !== null ? 1 : 0)) / questions.length) * 100}%` }}
                    />
                 </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 space-y-6 relative z-10">
              <div className="text-7xl">🏆</div>
              <div>
                <h2 className="text-3xl font-serif font-bold mb-2">Quiz Complete!</h2>
                <p className="text-white/70">Great job completing the daily knowledge check.</p>
              </div>
              <div className="text-6xl font-serif font-black text-gold-l">
                {score} / {questions.length}
              </div>
              <div className="flex justify-center gap-4">
                 <button onClick={restartQuiz} className="bg-gold text-ink px-8 py-3 rounded-full font-bold hover:bg-gold-l transition-all">
                    ↺ Try Again
                 </button>
                 <button onClick={() => location.href='/' } className="bg-white/10 border border-white/20 text-white px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-all">
                    🏠 Home
                 </button>
              </div>
            </div>
          )}
        </div>

        {/* ADMIN QUIZ EDITOR PANEL - Only visible to verified administrators */}
        {isAdmin && (
          <div className="bg-paper2 border border-black/10 rounded-[32px] p-6 sm:p-10 space-y-6">
            {/* Tab Selector */}
            <div className="flex items-center justify-between border-b border-black/10 pb-4 flex-wrap gap-4">
              <div className="flex items-center gap-2 text-indigo">
                 <Edit2 size={22} />
                 <h2 className="text-xl font-serif font-bold text-ink">Quiz Admin Manager</h2>
              </div>

              <div className="flex bg-white p-1 rounded-xl border border-black/10 font-mono text-xs">
                <button
                  onClick={() => setAdminTab('manual')}
                  className={cn("px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5", {
                    "bg-indigo text-white shadow": adminTab === 'manual',
                    "text-ink3 hover:text-ink": adminTab !== 'manual'
                  })}
                >
                  <FileText size={14} /> Write Quiz Manually
                </button>
                <button
                  onClick={() => setAdminTab('ai')}
                  className={cn("px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5", {
                    "bg-indigo text-white shadow": adminTab === 'ai',
                    "text-ink3 hover:text-ink": adminTab !== 'ai'
                  })}
                >
                  <Sparkles size={14} /> AI Generator
                </button>
              </div>
            </div>

              {/* MANUAL QUIZ WRITING TAB */}
              {adminTab === 'manual' && (
                <div className="space-y-6">
                  {/* Step Progress / Questions count banner */}
                  <div className="bg-indigo/5 border border-indigo/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="font-serif font-bold text-ink text-sm flex items-center gap-2">
                        <span>📅 Quiz Date: <strong className="text-indigo">{manualDate}</strong></span>
                        <span className="bg-indigo text-white px-2 py-0.5 rounded-md text-[11px] font-mono font-bold">
                          {questions.length} Saved {questions.length === 1 ? 'Question' : 'Questions'}
                        </span>
                      </div>
                      <p className="text-xs text-ink3">
                        Write 3 to 5 questions per quiz. Click <strong>"Save & Add Next Question"</strong> to continuously add questions!
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[1, 2, 3, 4, 5].map((num) => {
                        const isSaved = num <= questions.length;
                        return (
                          <div 
                            key={num}
                            className={cn("w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center transition-all border", {
                              "bg-sage text-white border-sage shadow": isSaved,
                              "bg-white text-ink3 border-black/10": !isSaved
                            })}
                            title={isSaved ? `Question ${num} Saved` : `Question ${num}`}
                          >
                            {isSaved ? '✓' : `Q${num}`}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <form onSubmit={(e) => handleSaveManualQuestion(e, false)} className="space-y-5 bg-white p-6 rounded-2xl border border-black/10 shadow-sm">
                    <div className="flex items-center justify-between border-b border-black/5 pb-3">
                      <div className="space-y-0.5">
                        <h3 className="font-serif font-bold text-lg text-ink flex items-center gap-2">
                          {editingQuestionId ? '✏️ Edit Question' : `➕ Write Question #${questions.length + 1}`}
                        </h3>
                        <p className="text-xs text-ink3">Fill in question text, 4 choices, and select the correct answer.</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={resetManualForm}
                          className="text-xs text-ink3 hover:text-ink font-bold px-3 py-1.5 rounded-lg bg-paper2 hover:bg-black/5 transition-colors"
                        >
                          Clear Form
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-ink3">Target Quiz Date</label>
                        <input 
                          type="date"
                          value={manualDate}
                          onChange={(e) => setManualDate(e.target.value)}
                          className="w-full bg-paper2 border border-black/10 p-2.5 rounded-xl text-sm font-mono font-bold text-ink focus:outline-none focus:border-indigo"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-ink3">Category</label>
                        <select 
                          value={manualCategory}
                          onChange={(e) => setManualCategory(e.target.value)}
                          className="w-full bg-paper2 border border-black/10 p-2.5 rounded-xl text-sm font-bold text-ink focus:outline-none focus:border-indigo"
                        >
                          {CATEGORIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Question Text */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-ink3">Question Text</label>
                      <textarea 
                        value={manualQuestion}
                        onChange={(e) => setManualQuestion(e.target.value)}
                        placeholder="e.g. Which spacecraft was the first to land humans on the Moon?"
                        className="w-full min-h-[80px] bg-paper2 border border-black/10 p-3 rounded-xl text-sm font-sans text-ink focus:outline-none focus:border-indigo resize-none"
                      />
                    </div>

                    {/* 4 Options */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-ink3 block">
                        4 Options (Click the letter badge next to the option that is Correct)
                      </label>

                      {['Option A', 'Option B', 'Option C', 'Option D'].map((label, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setManualCorrect(idx)}
                            className={cn("w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-bold transition-all border flex-shrink-0 cursor-pointer", {
                              "bg-sage text-white border-sage shadow-md scale-105": manualCorrect === idx,
                              "bg-paper2 text-ink3 border-black/10 hover:border-black/30": manualCorrect !== idx
                            })}
                            title="Click to set as Correct Answer"
                          >
                            {manualCorrect === idx ? <Check size={16} /> : String.fromCharCode(65 + idx)}
                          </button>
                          <input 
                            type="text"
                            value={manualOptions[idx]}
                            onChange={(e) => {
                              const newOpts = [...manualOptions] as [string, string, string, string];
                              newOpts[idx] = e.target.value;
                              setManualOptions(newOpts);
                            }}
                            placeholder={`Enter ${label}...`}
                            className={cn("w-full bg-paper2 border p-2.5 rounded-xl text-sm focus:outline-none transition-all", {
                              "border-sage ring-2 ring-sage/20 font-bold text-ink": manualCorrect === idx,
                              "border-black/10 focus:border-indigo": manualCorrect !== idx
                            })}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Explanation */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-ink3">Answer Explanation (Optional)</label>
                      <textarea 
                        value={manualExplanation}
                        onChange={(e) => setManualExplanation(e.target.value)}
                        placeholder="e.g. Apollo 11 landed on the moon on July 20, 1969 with Neil Armstrong and Buzz Aldrin."
                        className="w-full min-h-[60px] bg-paper2 border border-black/10 p-3 rounded-xl text-xs font-sans text-ink focus:outline-none focus:border-indigo resize-none"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                      <button 
                        type="button"
                        disabled={isSavingManual}
                        onClick={(e) => handleSaveManualQuestion(e, true)}
                        className="bg-indigo text-white px-6 py-3.5 rounded-xl font-bold hover:bg-indigo/90 disabled:opacity-50 transition-all text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        {isSavingManual ? 'Saving...' : '➡️ Save & Add Next Question'}
                      </button>

                      <button 
                        type="submit"
                        disabled={isSavingManual}
                        className="bg-sage text-white px-6 py-3.5 rounded-xl font-bold hover:bg-sage/90 disabled:opacity-50 transition-all text-sm flex items-center justify-center gap-2 shadow"
                      >
                        {isSavingManual ? 'Saving...' : editingQuestionId ? '💾 Update Question' : '✓ Save & Finish'}
                      </button>

                      {editingQuestionId && (
                        <button 
                          type="button"
                          onClick={resetManualForm}
                          className="bg-paper3 text-ink3 px-5 py-3 rounded-xl font-bold hover:bg-black/5 transition-all text-sm text-center"
                        >
                          Cancel Editing
                        </button>
                      )}
                    </div>

                    {manualStatus && (
                      <div className={cn("text-xs font-bold p-3 rounded-xl border flex items-center gap-2", {
                        "bg-sage/10 text-sage border-sage/30": manualStatus.startsWith('✅'),
                        "bg-coral/10 text-coral border-coral/30": manualStatus.startsWith('❌'),
                        "bg-indigo/10 text-indigo border-indigo/30": manualStatus.startsWith('💾')
                      })}>
                        <span>{manualStatus}</span>
                      </div>
                    )}
                  </form>

                  {/* List of existing questions for selected date */}
                  <div className="space-y-3">
                    <h3 className="font-serif font-bold text-ink text-base">
                      Questions List ({questions.length} total)
                    </h3>

                    {questions.length === 0 ? (
                      <p className="text-xs text-ink3 italic">No questions created yet for this view.</p>
                    ) : (
                      <div className="space-y-3">
                        {questions.map((q, i) => (
                          <div key={q.id} className="bg-white p-4 rounded-xl border border-black/10 flex items-start justify-between gap-4">
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-indigo text-xs">#{i + 1}</span>
                                <span className="bg-paper2 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-ink3">{q.cat}</span>
                                {q.date && <span className="bg-gold/20 text-ink px-2 py-0.5 rounded text-[10px] font-mono font-bold">📅 {q.date}</span>}
                              </div>
                              <p className="font-bold text-ink">{q.q}</p>
                              <div className="grid grid-cols-2 gap-1 text-xs text-ink3">
                                {q.opts.map((opt, optIdx) => (
                                  <span key={optIdx} className={cn({ "text-sage font-bold": optIdx === q.correct })}>
                                    {String.fromCharCode(65 + optIdx)}. {opt} {optIdx === q.correct ? '✓' : ''}
                                  </span>
                                ))}
                              </div>
                              {q.explanation && (
                                <p className="text-[11px] text-ink3 italic">💡 {q.explanation}</p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button 
                                onClick={() => editQuestion(q)}
                                className="p-2 bg-paper2 hover:bg-black/5 text-ink rounded-lg transition-colors"
                                title="Edit question"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                                title="Delete question"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AI GENERATOR TAB */}
              {adminTab === 'ai' && (
                <div className="space-y-4">
                  <p className="text-sm text-ink3 leading-relaxed">
                    Type a topic or prompt below to automatically generate 5 multiple choice questions with AI and assign them to a specific quiz date.
                  </p>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-ink3">Target Quiz Date</label>
                    <input 
                      type="date"
                      value={manualDate}
                      onChange={(e) => setManualDate(e.target.value)}
                      className="bg-white border border-black/10 p-2.5 rounded-xl text-sm font-mono font-bold text-ink focus:outline-none focus:border-indigo"
                    />
                  </div>

                  <textarea 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. Generate 5 interesting questions about space discoveries, black holes, and Mars rovers..."
                    className="w-full min-h-[120px] bg-white border border-black/10 rounded-2xl p-4 text-sm font-sans text-ink outline-none focus:border-indigo transition-all resize-none"
                  />
                  
                  <button 
                    disabled={isAiLoading || !aiPrompt}
                    onClick={generateAiQuiz}
                    className="w-full bg-indigo text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo/90 disabled:opacity-50 transition-all shadow"
                  >
                    {isAiLoading ? '⏳ Generating questions...' : `✨ Generate & Publish AI Quiz for ${manualDate}`}
                  </button>

                  {aiStatus && (
                    <div className={cn("text-center text-sm font-medium p-3 rounded-lg flex items-center justify-center", {
                      "text-sage font-bold": aiStatus.startsWith('✅'),
                      "text-coral font-bold": aiStatus.startsWith('❌'),
                      "text-indigo italic": aiStatus.startsWith('Consulting')
                    })}>
                      {aiStatus}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

      </div>
    </div>
  );
};
