import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { factService } from '../services/factService';
import { QuizQuestion } from '../types';
import { cn } from '../lib/utils';
import { Sparkles, RefreshCcw, ArrowLeft, LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

import { INITIAL_QUIZ } from '../seed';

export const Quiz = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(INITIAL_QUIZ);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answeredIdx, setAnsweredIdx] = useState<number | null>(null);
  const { user, isAdmin } = useAuth();
  
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiStatus, setAiStatus] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const data = await factService.getQuizQuestions();
        if (data && data.length > 0) setQuestions(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadQuiz();
  }, []);

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
    if (idx === questions[currentIdx].correct) {
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
        // Save to Database if Admin
        if (isAdmin) {
          setAiStatus("💾 Saving to database...");
          await factService.updateQuiz(data);
        }
        
        setQuestions(data);
        restartQuiz();
        setAiStatus(`✅ Successfully ${isAdmin ? 'published' : 'generated'} ${data.length} new questions!`);
        setAiPrompt("");
      } else {
        setAiStatus("❌ Failed to generate questions. Try a different request.");
      }
    } catch (err) {
       console.error(err);
       setAiStatus("❌ An error occurred. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const isFinished = currentIdx >= questions.length;
  const currentQ = questions[currentIdx];

  if (questions.length === 0) return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="animate-pulse text-gold font-serif text-xl">Preparing your daily challenge...</div>
    </div>
  );

  return (
    <div className="bg-paper min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 text-ink3 hover:text-ink transition-colors mb-4 group font-medium">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-serif font-black text-ink">⚡ FActHub Quiz</h1>
          <p className="text-ink3">Test your knowledge — updated daily</p>
        </div>

        <div className="bg-indigo rounded-[32px] p-8 lg:p-12 text-white shadow-fact-lg relative overflow-hidden">
          <div className="absolute -right-12 -top-12 text-[12rem] font-serif font-black text-white/5 select-none pointer-events-none">?</div>

          {!isFinished ? (
            <div className="space-y-8 relative z-10">
              <div className="flex items-center justify-between font-mono text-[0.7rem] text-white/50 uppercase tracking-widest">
                <span>Question {currentIdx + 1} of {questions.length}</span>
                <span>Category: {currentQ.cat}</span>
              </div>

              <h2 className="text-2xl lg:text-3xl font-serif font-bold leading-snug">
                {currentQ.q}
              </h2>

              <div className="grid gap-3">
                {currentQ.opts.map((opt, i) => {
                  const isCorrect = i === currentQ.correct;
                  const isSelected = i === answeredIdx;
                  return (
                    <button
                      key={i}
                      disabled={answeredIdx !== null}
                      onClick={() => handleAnswer(i)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl text-sm font-medium transition-all border",
                        answeredIdx === null 
                          ? "bg-white/10 border-white/20 hover:bg-white/20" 
                          : isCorrect 
                            ? "bg-sage/40 border-sage text-white" 
                            : isSelected 
                              ? "bg-coral/40 border-coral text-white" 
                              : "bg-white/5 border-white/10 opacity-50"
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 pt-4">
                {answeredIdx !== null && (
                  <button onClick={nextQuestion} className="bg-gold text-ink px-8 py-3 rounded-full font-bold hover:bg-gold-l transition-all">
                    Next Question →
                  </button>
                )}
                <button onClick={restartQuiz} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium">
                  <RefreshCcw size={16} /> Restart
                </button>
              </div>

              <div className="pt-6 border-t border-white/10">
                 <div className="flex justify-between text-[0.65rem] text-white/40 uppercase mb-2">
                    <span>Score: {score}/{currentIdx}</span>
                    <span>Progress: {Math.round((currentIdx / questions.length) * 100)}%</span>
                 </div>
                 <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gold-l" 
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentIdx / questions.length) * 100}%` }}
                    />
                 </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 space-y-6 relative z-10">
              <div className="text-7xl">🏆</div>
              <div>
                <h2 className="text-3xl font-serif font-bold mb-2">Quiz Complete!</h2>
                <p className="text-white/60">Outstanding work! You have a great memory for facts.</p>
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

        {/* AI EDITOR - Restricted to Admin */}
        <div className="bg-paper2 border border-black/10 rounded-[32px] p-8 lg:p-12 space-y-6">
          {!isAdmin ? (
            <div className="text-center space-y-4 py-4">
              <div className="flex items-center justify-center gap-2 text-indigo mb-2">
                <ShieldCheck size={24} />
                <h2 className="text-xl font-serif font-bold text-ink">Admin Controls</h2>
              </div>
              <p className="text-sm text-ink3">
                The AI Quiz Editor is restricted to administrators. Please sign in to access these features.
              </p>
              <button 
                onClick={signIn}
                className="bg-indigo text-white px-8 py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-indigo/90 mx-auto transition-all"
              >
                <LogIn size={18} /> Admin Sign In
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-indigo">
                 <Sparkles size={24} />
                 <h2 className="text-xl font-serif font-bold text-ink">AI Quiz Editor</h2>
              </div>
              <p className="text-sm text-ink3 leading-relaxed">
                Welcome Admin. Type new quiz topics or paste custom questions and let AI update the quiz for you in real-time.
              </p>
              <textarea 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Add 5 questions about Indian history or Mars science..."
                className="w-full min-h-[120px] bg-white border border-black/10 rounded-2xl p-4 text-sm font-mono text-ink outline-none focus:border-indigo transition-all resize-none"
              />
              <button 
                disabled={isAiLoading || !aiPrompt}
                onClick={generateAiQuiz}
                className="w-full bg-indigo text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo/90 disabled:opacity-50 transition-all"
              >
                {isAiLoading ? '⏳ Generating new quiz questions...' : '✨ Update Quiz with AI'}
              </button>
              {aiStatus && (
                <div className={cn("text-center text-sm font-medium p-3 rounded-lg flex items-center justify-center", {
                  "text-sage": aiStatus.startsWith('✅'),
                  "text-coral": aiStatus.startsWith('❌'),
                  "text-indigo italic": aiStatus.startsWith('Consulting')
                })}>
                  {aiStatus}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
