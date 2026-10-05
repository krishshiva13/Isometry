import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Medal, Crown, Flame, Clock, Award, CheckCircle2, User, RefreshCw, Wifi, WifiOff, Sparkles, Send, ShieldCheck } from 'lucide-react';
import { quizLeaderboardService, QuizLeaderboardEntry } from '../../services/quizLeaderboardService';
import { quizOfflineService } from '../../services/quizOfflineService';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

interface QuizLeaderboardProps {
  currentDate?: string;
  userLatestScore?: {
    score: number;
    total: number;
    timeTakenSeconds: number;
    category?: string;
    quizDate: string;
  } | null;
  onScoreSubmitted?: () => void;
}

export const QuizLeaderboard: React.FC<QuizLeaderboardProps> = ({
  currentDate = '2026-08-05',
  userLatestScore,
  onScoreSubmitted
}) => {
  const { user } = useAuth();
  const [filterPeriod, setFilterPeriod] = useState<'date' | 'all'>('date');
  const [entries, setEntries] = useState<QuizLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(quizOfflineService.isOnline());
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Just now');

  // Score submission state
  const [submitName, setSubmitName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasSubmittedCurrent, setHasSubmittedCurrent] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>('');

  // Track network state
  useEffect(() => {
    const unsubscribe = quizOfflineService.subscribeNetworkState((online) => {
      setIsOnline(online);
      if (online) {
        // Auto-sync any queued offline submissions
        quizLeaderboardService.syncOfflineSubmissions().then((syncedCount) => {
          if (syncedCount > 0) {
            loadLeaderboardData();
          }
        });
      }
    });
    return unsubscribe;
  }, []);

  // Pre-fill submit name from auth or stored preference
  useEffect(() => {
    if (user?.displayName) {
      setSubmitName(user.displayName);
    } else {
      const savedNickname = localStorage.getItem('facthub_user_nickname') || '';
      if (savedNickname) setSubmitName(savedNickname);
    }
  }, [user]);

  const loadLeaderboardData = async () => {
    setLoading(true);
    try {
      const data = await quizLeaderboardService.getLeaderboard(currentDate, filterPeriod);
      setEntries(data);
      setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.warn('Leaderboard loading notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboardData();
  }, [currentDate, filterPeriod]);

  // Handle Score Submission
  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userLatestScore || hasSubmittedCurrent) return;

    const finalName = submitName.trim() || user?.displayName || 'Quiz Explorer';
    localStorage.setItem('facthub_user_nickname', finalName);

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const accuracy = Math.round((userLatestScore.score / Math.max(1, userLatestScore.total)) * 100);
      
      const res = await quizLeaderboardService.submitScore({
        userName: finalName,
        userId: user?.uid,
        userPhoto: user?.photoURL || undefined,
        score: userLatestScore.score,
        totalQuestions: userLatestScore.total,
        accuracy,
        timeTakenSeconds: userLatestScore.timeTakenSeconds || 45,
        quizDate: userLatestScore.quizDate || currentDate,
        category: userLatestScore.category || 'General'
      });

      setHasSubmittedCurrent(true);
      setSubmitMessage(isOnline ? '🎉 Score posted to Leaderboard!' : '⚡ Saved offline! Will sync automatically when online.');
      
      // Reload leaderboard to show position
      await loadLeaderboardData();
      if (onScoreSubmitted) onScoreSubmitted();
    } catch (err: any) {
      console.error('Submit score error:', err);
      setSubmitMessage('❌ Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Top 3 Podium
  const top1 = entries[0];
  const top2 = entries[1];
  const top3 = entries[2];
  const remainingEntries = entries.slice(3, 20);

  return (
    <div className="bg-paper2 dark:bg-[#15161c] border border-black/10 dark:border-white/10 rounded-[32px] p-6 sm:p-8 space-y-8 shadow-sm">
      
      {/* ── HEADER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10 dark:border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <Trophy size={20} />
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-black text-ink dark:text-white">
              Quiz Leaderboard & Top Performers
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-ink3 dark:text-white/60">
            Top scores, speed champions, and daily verified knowledge ranks
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {/* Network status pill */}
          <span className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border",
            isOnline
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
              : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-500/20"
          )}>
            {isOnline ? <Wifi size={12} className="text-emerald-500" /> : <WifiOff size={12} className="text-amber-500" />}
            <span>{isOnline ? 'Live Leaderboard' : 'Offline Cache'}</span>
          </span>

          {/* Refresh button */}
          <button
            onClick={loadLeaderboardData}
            disabled={loading}
            className="p-2 rounded-xl bg-paper dark:bg-white/10 hover:bg-black/5 dark:hover:bg-white/20 text-ink dark:text-white border border-black/10 dark:border-white/10 transition-colors cursor-pointer"
            title="Refresh Leaderboard"
          >
            <RefreshCw size={14} className={cn(loading && "animate-spin text-gold")} />
          </button>
        </div>
      </div>

      {/* ── FILTER TABS ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex bg-paper dark:bg-white/5 p-1 rounded-2xl border border-black/10 dark:border-white/10 text-xs font-bold font-mono">
          <button
            onClick={() => setFilterPeriod('date')}
            className={cn(
              "px-4 py-2 rounded-xl transition-all cursor-pointer",
              filterPeriod === 'date'
                ? "bg-gold text-black shadow-xs font-black"
                : "text-ink3 dark:text-white/60 hover:text-ink dark:hover:text-white"
            )}
          >
            📅 {currentDate === 'all' ? 'All Daily Quizzes' : `Quiz: ${currentDate}`}
          </button>
          <button
            onClick={() => setFilterPeriod('all')}
            className={cn(
              "px-4 py-2 rounded-xl transition-all cursor-pointer",
              filterPeriod === 'all'
                ? "bg-gold text-black shadow-xs font-black"
                : "text-ink3 dark:text-white/60 hover:text-ink dark:hover:text-white"
            )}
          >
            🌟 All-Time Champions
          </button>
        </div>

        <div className="text-xs font-mono text-ink3 dark:text-white/50">
          Showing top {entries.length} participants • Updated {lastSyncedTime}
        </div>
      </div>

      {/* ── USER SCORE SUBMISSION CALLOUT (IF JUST COMPLETED QUIZ) ── */}
      {userLatestScore && !hasSubmittedCurrent && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-500/15 via-gold/10 to-amber-500/15 border-2 border-gold/40 rounded-3xl p-5 sm:p-6 space-y-4"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                <Sparkles size={14} className="text-gold" />
                <span>You Just Scored {userLatestScore.score} / {userLatestScore.total}!</span>
              </span>
              <h3 className="text-lg font-serif font-black text-ink dark:text-white">
                Claim your rank on today's leaderboard!
              </h3>
              <p className="text-xs text-ink2 dark:text-white/70">
                Time: {userLatestScore.timeTakenSeconds}s • Accuracy: {Math.round((userLatestScore.score / userLatestScore.total) * 100)}%
              </p>
            </div>

            <form onSubmit={handleSubmitScore} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                required
                maxLength={40}
                placeholder="Enter your name / nickname"
                value={submitName}
                onChange={(e) => setSubmitName(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#1a1b22] text-ink dark:text-white text-xs font-bold focus:outline-none focus:border-gold w-full sm:w-56"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-gold hover:bg-gold-l text-black font-black text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <Send size={13} />
                )}
                <span>Post Score</span>
              </button>
            </form>
          </div>
        </motion.div>
      )}

      {submitMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          <span>{submitMessage}</span>
        </div>
      )}

      {/* ── TOP 3 PODIUM ── */}
      {top1 && (
        <div className="pt-4 pb-2">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xl mx-auto items-end">
            
            {/* Rank #2 (Silver, Left) */}
            <div className="flex flex-col items-center">
              {top2 ? (
                <>
                  <div className="relative mb-2">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-900 font-bold font-mono text-base flex items-center justify-center shadow-md border-2 border-slate-300">
                      🥈
                    </div>
                  </div>
                  <span className="text-xs font-bold text-ink dark:text-white truncate max-w-[90px] sm:max-w-[130px] text-center">
                    {top2.userName}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-ink3 dark:text-white/60">
                    {top2.score}/{top2.totalQuestions} ({top2.timeTakenSeconds}s)
                  </span>
                  <div className="w-full bg-slate-300/40 dark:bg-white/10 rounded-t-2xl h-20 sm:h-24 flex flex-col items-center justify-center mt-2 border-t-2 border-slate-400">
                    <span className="font-mono text-base sm:text-xl font-black text-slate-600 dark:text-slate-300">#2</span>
                    <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400">Silver</span>
                  </div>
                </>
              ) : (
                <div className="h-28 flex items-center justify-center text-xs text-ink3">Awaiting #2</div>
              )}
            </div>

            {/* Rank #1 (Gold, Center, Tallest) */}
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <Crown size={22} className="text-amber-500 absolute -top-5 left-1/2 -translate-x-1/2 animate-bounce" />
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-200 text-amber-950 font-bold font-mono text-lg flex items-center justify-center shadow-lg border-2 border-amber-400">
                  🥇
                </div>
              </div>
              <span className="text-xs sm:text-sm font-black text-ink dark:text-white truncate max-w-[100px] sm:max-w-[150px] text-center">
                {top1.userName}
              </span>
              <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-400">
                {top1.score}/{top1.totalQuestions} ({top1.timeTakenSeconds}s)
              </span>
              <div className="w-full bg-gradient-to-b from-amber-400/30 to-amber-500/10 dark:from-amber-400/20 dark:to-transparent rounded-t-2xl h-28 sm:h-32 flex flex-col items-center justify-center mt-2 border-t-4 border-gold shadow-md">
                <span className="font-mono text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">#1</span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Champion</span>
              </div>
            </div>

            {/* Rank #3 (Bronze, Right) */}
            <div className="flex flex-col items-center">
              {top3 ? (
                <>
                  <div className="relative mb-2">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-800 to-amber-600 text-amber-100 font-bold font-mono text-base flex items-center justify-center shadow-md border-2 border-amber-700">
                      🥉
                    </div>
                  </div>
                  <span className="text-xs font-bold text-ink dark:text-white truncate max-w-[90px] sm:max-w-[130px] text-center">
                    {top3.userName}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-ink3 dark:text-white/60">
                    {top3.score}/{top3.totalQuestions} ({top3.timeTakenSeconds}s)
                  </span>
                  <div className="w-full bg-amber-900/20 dark:bg-white/5 rounded-t-2xl h-16 sm:h-20 flex flex-col items-center justify-center mt-2 border-t-2 border-amber-700">
                    <span className="font-mono text-base sm:text-xl font-black text-amber-800 dark:text-amber-500">#3</span>
                    <span className="text-[10px] font-mono uppercase text-amber-800/80 dark:text-amber-400/80">Bronze</span>
                  </div>
                </>
              ) : (
                <div className="h-28 flex items-center justify-center text-xs text-ink3">Awaiting #3</div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── RANKED LIST (POSITIONS 4+) ── */}
      <div className="space-y-2">
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-ink3 dark:text-white/50 px-2 flex items-center justify-between">
          <span>Rank & Participant</span>
          <div className="flex items-center gap-6">
            <span>Accuracy</span>
            <span>Time</span>
          </div>
        </div>

        {remainingEntries.length === 0 && entries.length <= 3 ? (
          <div className="text-center py-6 text-ink3 dark:text-white/50 text-xs">
            Take today's quiz above to claim your position on this leaderboard!
          </div>
        ) : (
          remainingEntries.map((item, idx) => {
            const rank = idx + 4;
            const isCurrentUser = user && (item.userId === user.uid || item.userName === user.displayName);

            return (
              <div
                key={item.id || idx}
                className={cn(
                  "p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3",
                  isCurrentUser
                    ? "bg-gold/15 border-gold shadow-sm"
                    : "bg-paper dark:bg-white/5 border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20"
                )}
              >
                {/* Left: Rank & Avatar & Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 text-center font-mono font-black text-xs text-ink3 dark:text-white/60">
                    #{rank}
                  </span>
                  
                  <div className="w-8 h-8 rounded-xl bg-paper2 dark:bg-white/10 text-ink dark:text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-black/5 dark:border-white/10">
                    {item.userName.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-ink dark:text-white truncate">
                        {item.userName}
                      </span>
                      {isCurrentUser && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-black bg-gold text-black">
                          YOU
                        </span>
                      )}
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-mono text-gold-l dark:text-amber-400">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Accuracy Bar & Time */}
                <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-ink dark:text-white">
                      {item.score}/{item.totalQuestions} ({item.accuracy}%)
                    </div>
                    <div className="w-16 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-gold rounded-full"
                        style={{ width: `${item.accuracy}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-ink3 dark:text-white/60 min-w-[50px] justify-end">
                    <Clock size={12} className="opacity-60" />
                    <span>{item.timeTakenSeconds}s</span>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ── MOTIVATIONAL FOOTER ── */}
      <div className="pt-3 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-ink3 dark:text-white/50 gap-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Scores are recorded with speed and accuracy metrics.</span>
        </div>
        <div>
          <span>Play daily quizzes to build your knowledge streak!</span>
        </div>
      </div>

    </div>
  );
};
