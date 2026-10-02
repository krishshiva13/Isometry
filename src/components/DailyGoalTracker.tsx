import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Flame, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  Award, 
  Plus, 
  HelpCircle, 
  Sliders, 
  RotateCcw, 
  ArrowRight,
  Check,
  Zap,
  TrendingUp,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export type GoalMode = 'facts' | 'quizzes' | 'both';

export interface DailyGoalData {
  date: string;
  mode: GoalMode;
  
  // Facts progress (count & target maintained for backward compatibility)
  count: number;
  target: number;
  factsLearned: number;
  factsTarget: number;

  // Quizzes progress
  quizzesCompleted: number;
  quizzesTarget: number;

  completedToday: boolean;
  streak: number;
  lastCompletedDate?: string;
}

const STORAGE_KEY = 'facthub_daily_reading_goal';
const FACT_PRESETS = [3, 5, 10, 15, 20];
const QUIZ_PRESETS = [1, 2, 3, 5];

export const getTodayDateKey = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getDailyGoalData = (): DailyGoalData => {
  const todayKey = getTodayDateKey();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const mode: GoalMode = parsed.mode || 'facts';
      const factsTarget = typeof parsed.factsTarget === 'number' ? parsed.factsTarget : (parsed.target || 5);
      const quizzesTarget = typeof parsed.quizzesTarget === 'number' ? parsed.quizzesTarget : 2;
      const factsLearned = typeof parsed.factsLearned === 'number' ? parsed.factsLearned : (parsed.count || 0);
      const quizzesCompleted = typeof parsed.quizzesCompleted === 'number' ? parsed.quizzesCompleted : 0;

      if (parsed.date === todayKey) {
        return {
          date: todayKey,
          mode,
          count: factsLearned,
          target: factsTarget,
          factsLearned,
          factsTarget,
          quizzesCompleted,
          quizzesTarget,
          completedToday: Boolean(parsed.completedToday),
          streak: typeof parsed.streak === 'number' ? parsed.streak : 1,
          lastCompletedDate: parsed.lastCompletedDate
        };
      }

      // Transition to a new day: check whether streak continues
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      const streakMaintained = parsed.lastCompletedDate === yesterdayKey;
      const carriedStreak = streakMaintained ? parsed.streak : (parsed.completedToday ? 1 : 0);

      return {
        date: todayKey,
        mode,
        count: 0,
        target: factsTarget,
        factsLearned: 0,
        factsTarget,
        quizzesCompleted: 0,
        quizzesTarget,
        completedToday: false,
        streak: carriedStreak,
        lastCompletedDate: parsed.lastCompletedDate
      };
    }
  } catch (e) {
    console.warn('Failed to parse goal data from localStorage', e);
  }

  // Initial default state
  return {
    date: todayKey,
    mode: 'facts',
    count: 0,
    target: 5,
    factsLearned: 0,
    factsTarget: 5,
    quizzesCompleted: 0,
    quizzesTarget: 2,
    completedToday: false,
    streak: 1
  };
};

/**
 * Checks if the current goal requirements are fulfilled based on mode
 */
function isGoalFulfilled(data: {
  mode: GoalMode;
  factsLearned: number;
  factsTarget: number;
  quizzesCompleted: number;
  quizzesTarget: number;
}): boolean {
  if (data.mode === 'facts') {
    return data.factsLearned >= data.factsTarget;
  }
  if (data.mode === 'quizzes') {
    return data.quizzesCompleted >= data.quizzesTarget;
  }
  // 'both'
  return data.factsLearned >= data.factsTarget && data.quizzesCompleted >= data.quizzesTarget;
}

function saveAndDispatch(updated: DailyGoalData): DailyGoalData {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('facthub_daily_goal_updated', { detail: updated }));
  } catch (e) {
    // ignore local storage restrictions
  }
  return updated;
}

/**
 * Logs a fact as read/learned
 */
export const recordFactRead = (): DailyGoalData => {
  const current = getDailyGoalData();
  const newFactsLearned = current.factsLearned + 1;
  const todayKey = getTodayDateKey();

  const fulfilledNow = isGoalFulfilled({
    mode: current.mode,
    factsLearned: newFactsLearned,
    factsTarget: current.factsTarget,
    quizzesCompleted: current.quizzesCompleted,
    quizzesTarget: current.quizzesTarget
  });

  let streak = current.streak;
  let lastCompletedDate = current.lastCompletedDate;

  if (fulfilledNow && !current.completedToday) {
    if (current.lastCompletedDate !== todayKey) {
      streak = (current.streak || 0) + 1;
      lastCompletedDate = todayKey;
    }
  }

  const updated: DailyGoalData = {
    ...current,
    count: newFactsLearned,
    factsLearned: newFactsLearned,
    completedToday: fulfilledNow || current.completedToday,
    streak,
    lastCompletedDate
  };

  return saveAndDispatch(updated);
};

/**
 * Logs a quiz as completed
 */
export const recordQuizCompleted = (): DailyGoalData => {
  const current = getDailyGoalData();
  const newQuizzes = current.quizzesCompleted + 1;
  const todayKey = getTodayDateKey();

  const fulfilledNow = isGoalFulfilled({
    mode: current.mode,
    factsLearned: current.factsLearned,
    factsTarget: current.factsTarget,
    quizzesCompleted: newQuizzes,
    quizzesTarget: current.quizzesTarget
  });

  let streak = current.streak;
  let lastCompletedDate = current.lastCompletedDate;

  if (fulfilledNow && !current.completedToday) {
    if (current.lastCompletedDate !== todayKey) {
      streak = (current.streak || 0) + 1;
      lastCompletedDate = todayKey;
    }
  }

  const updated: DailyGoalData = {
    ...current,
    quizzesCompleted: newQuizzes,
    completedToday: fulfilledNow || current.completedToday,
    streak,
    lastCompletedDate
  };

  return saveAndDispatch(updated);
};

/**
 * Updates targets and recalculates completion status
 */
export const setDailyGoalTarget = (
  type: 'facts' | 'quizzes',
  newTarget: number,
  newMode?: GoalMode
): DailyGoalData => {
  const current = getDailyGoalData();
  const validTarget = Math.max(1, newTarget);
  const mode = newMode || current.mode;

  const factsTarget = type === 'facts' ? validTarget : current.factsTarget;
  const quizzesTarget = type === 'quizzes' ? validTarget : current.quizzesTarget;

  const fulfilledNow = isGoalFulfilled({
    mode,
    factsLearned: current.factsLearned,
    factsTarget,
    quizzesCompleted: current.quizzesCompleted,
    quizzesTarget
  });

  const todayKey = getTodayDateKey();
  let streak = current.streak;
  let lastCompletedDate = current.lastCompletedDate;

  if (fulfilledNow && !current.completedToday) {
    if (current.lastCompletedDate !== todayKey) {
      streak = (current.streak || 0) + 1;
      lastCompletedDate = todayKey;
    }
  }

  const updated: DailyGoalData = {
    ...current,
    mode,
    target: factsTarget,
    factsTarget,
    quizzesTarget,
    completedToday: fulfilledNow,
    streak,
    lastCompletedDate
  };

  return saveAndDispatch(updated);
};

/**
 * Switch the active tracking mode: 'facts' | 'quizzes' | 'both'
 */
export const setDailyGoalMode = (mode: GoalMode): DailyGoalData => {
  const current = getDailyGoalData();
  const fulfilledNow = isGoalFulfilled({
    mode,
    factsLearned: current.factsLearned,
    factsTarget: current.factsTarget,
    quizzesCompleted: current.quizzesCompleted,
    quizzesTarget: current.quizzesTarget
  });

  const updated: DailyGoalData = {
    ...current,
    mode,
    completedToday: fulfilledNow
  };

  return saveAndDispatch(updated);
};

/**
 * Reset today's progress for testing/fresh start
 */
export const resetDailyGoalToday = (): DailyGoalData => {
  const current = getDailyGoalData();
  const updated: DailyGoalData = {
    ...current,
    count: 0,
    factsLearned: 0,
    quizzesCompleted: 0,
    completedToday: false
  };

  return saveAndDispatch(updated);
};

interface DailyGoalTrackerProps {
  className?: string;
  compact?: boolean;
}

export const DailyGoalTracker: React.FC<DailyGoalTrackerProps> = ({ 
  className,
  compact = false 
}) => {
  const [goal, setGoal] = useState<DailyGoalData>(getDailyGoalData);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [customInputValue, setCustomInputValue] = useState<string>('');
  const [justAccomplished, setJustAccomplished] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setGoal(getDailyGoalData());
    };

    window.addEventListener('facthub_daily_goal_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('facthub_daily_goal_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleModeChange = (mode: GoalMode) => {
    const updated = setDailyGoalMode(mode);
    setGoal(updated);
    setIsEditingTarget(false);
  };

  const handleQuickPreset = (type: 'facts' | 'quizzes', target: number) => {
    const updated = setDailyGoalTarget(type, target);
    setGoal(updated);
    if (updated.completedToday && !goal.completedToday) {
      triggerCelebration();
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customInputValue, 10);
    if (isNaN(val) || val <= 0) return;

    const targetType = goal.mode === 'quizzes' ? 'quizzes' : 'facts';
    const updated = setDailyGoalTarget(targetType, val);
    setGoal(updated);
    setIsEditingTarget(false);
    setCustomInputValue('');
    if (updated.completedToday && !goal.completedToday) {
      triggerCelebration();
    }
  };

  const handleStepAdjust = (type: 'facts' | 'quizzes', delta: number) => {
    const currentTarget = type === 'facts' ? goal.factsTarget : goal.quizzesTarget;
    const nextTarget = Math.max(1, currentTarget + delta);
    const updated = setDailyGoalTarget(type, nextTarget);
    setGoal(updated);
    if (updated.completedToday && !goal.completedToday) {
      triggerCelebration();
    }
  };

  const triggerCelebration = () => {
    setJustAccomplished(true);
    setTimeout(() => setJustAccomplished(false), 5000);
  };

  const handleAddFact = () => {
    const updated = recordFactRead();
    setGoal(updated);
    if (updated.completedToday && !goal.completedToday) {
      triggerCelebration();
    }
  };

  const handleAddQuiz = () => {
    const updated = recordQuizCompleted();
    setGoal(updated);
    if (updated.completedToday && !goal.completedToday) {
      triggerCelebration();
    }
  };

  const handleReset = () => {
    if (window.confirm("Reset today's learning progress? Your streak history will remain safe.")) {
      const updated = resetDailyGoalToday();
      setGoal(updated);
    }
  };

  // Compute percentages
  const factsPercent = Math.min(100, Math.round((goal.factsLearned / Math.max(1, goal.factsTarget)) * 100));
  const quizzesPercent = Math.min(100, Math.round((goal.quizzesCompleted / Math.max(1, goal.quizzesTarget)) * 100));

  let primaryPercent = factsPercent;
  let primaryCurrent = goal.factsLearned;
  let primaryTarget = goal.factsTarget;
  let primaryUnit = 'Facts';

  if (goal.mode === 'quizzes') {
    primaryPercent = quizzesPercent;
    primaryCurrent = goal.quizzesCompleted;
    primaryTarget = goal.quizzesTarget;
    primaryUnit = 'Quizzes';
  } else if (goal.mode === 'both') {
    primaryPercent = Math.round((factsPercent + quizzesPercent) / 2);
  }

  const isCompleted = goal.completedToday;
  const remainingFacts = Math.max(0, goal.factsTarget - goal.factsLearned);
  const remainingQuizzes = Math.max(0, goal.quizzesTarget - goal.quizzesCompleted);

  return (
    <div
      className={cn(
        "bg-white dark:bg-[#18191e] border border-black/10 dark:border-white/10 rounded-3xl p-5 sm:p-7 shadow-sm relative overflow-hidden transition-all hover:border-gold/40 text-ink dark:text-white",
        className
      )}
    >
      {/* Decorative Glow Background */}
      <div 
        className={cn(
          "absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700",
          isCompleted ? "bg-emerald-500/10" : "bg-gold/10"
        )} 
      />

      {/* TOP HEADER: Goal Mode Tabs & Streak Display */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-4 relative z-10">
        
        {/* Goal Title & Mode Switcher */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center font-bold transition-colors",
              isCompleted ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-gold/20 text-gold-d dark:text-gold"
            )}>
              <Target size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-black flex items-center gap-2">
                <span>Daily Knowledge Goal</span>
                {isCompleted && (
                  <span className="text-[10px] font-sans font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Goal Achieved!
                  </span>
                )}
              </h2>
              <p className="text-xs text-ink3 dark:text-white/60">
                Set and track your daily learning target to build a permanent memory habit.
              </p>
            </div>
          </div>

          {/* Goal Mode Buttons: Facts vs Quizzes vs Both */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-ink3 dark:text-white/50 mr-1">Goal Type:</span>
            
            <button
              type="button"
              onClick={() => handleModeChange('facts')}
              className={cn(
                "px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                goal.mode === 'facts'
                  ? "bg-ink text-white dark:bg-white dark:text-black shadow-xs"
                  : "bg-paper2 dark:bg-white/5 text-ink3 dark:text-white/60 hover:text-ink dark:hover:text-white"
              )}
            >
              <BookOpen size={13} />
              <span>Facts to Learn</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('quizzes')}
              className={cn(
                "px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                goal.mode === 'quizzes'
                  ? "bg-ink text-white dark:bg-white dark:text-black shadow-xs"
                  : "bg-paper2 dark:bg-white/5 text-ink3 dark:text-white/60 hover:text-ink dark:hover:text-white"
              )}
            >
              <HelpCircle size={13} />
              <span>Quizzes to Complete</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('both')}
              className={cn(
                "px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                goal.mode === 'both'
                  ? "bg-gold text-black shadow-xs font-black"
                  : "bg-paper2 dark:bg-white/5 text-ink3 dark:text-white/60 hover:text-ink dark:hover:text-white"
              )}
            >
              <Zap size={13} />
              <span>Dual Quest (Both)</span>
            </button>
          </div>
        </div>

        {/* Right: Streak & Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-xs shadow-2xs">
            <Flame size={16} className="text-amber-500 fill-amber-500 animate-pulse" />
            <span>{goal.streak || 1} Day Streak</span>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingTarget(!isEditingTarget)}
            className={cn(
              "p-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer",
              isEditingTarget
                ? "bg-gold text-black border-gold"
                : "bg-paper2 dark:bg-white/5 text-ink3 dark:text-white/60 border-black/5 dark:border-white/10 hover:text-ink dark:hover:text-white"
            )}
            title="Configure Target Goals"
          >
            <Sliders size={15} />
            <span className="hidden sm:inline">Set Target</span>
          </button>
        </div>
      </div>

      {/* TARGET EDITING ACCORDION PANEL */}
      <AnimatePresence>
        {isEditingTarget && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-black/5 dark:border-white/10 relative z-10"
          >
            <div className="py-4 space-y-4 bg-paper2/50 dark:bg-white/[0.02] p-4 rounded-2xl my-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white flex items-center gap-1.5">
                  <Sliders size={14} className="text-gold" />
                  <span>Customize Your Daily Targets</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingTarget(false)}
                  className="text-ink3 hover:text-ink dark:text-white/50 dark:hover:text-white p-1"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Facts Target Setting */}
              {(goal.mode === 'facts' || goal.mode === 'both') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink2 dark:text-white/80">
                      📖 Facts to Learn Daily Target:
                    </span>
                    <span className="font-mono font-bold text-gold">
                      {goal.factsTarget} Facts / Day
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleStepAdjust('facts', -1)}
                        className="px-2.5 py-1 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/10"
                        title="Decrease target"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-mono text-xs font-bold">{goal.factsTarget}</span>
                      <button
                        type="button"
                        onClick={() => handleStepAdjust('facts', 1)}
                        className="px-2.5 py-1 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/10"
                        title="Increase target"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-ink3 dark:text-white/50 mr-1">Presets:</span>
                      {FACT_PRESETS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleQuickPreset('facts', p)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all",
                            goal.factsTarget === p
                              ? "bg-ink text-white dark:bg-white dark:text-black"
                              : "bg-white dark:bg-white/10 text-ink3 hover:text-ink dark:text-white/70 hover:bg-gold/20"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quizzes Target Setting */}
              {(goal.mode === 'quizzes' || goal.mode === 'both') && (
                <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink2 dark:text-white/80">
                      🎯 Quizzes to Complete Daily Target:
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {goal.quizzesTarget} Quizzes / Day
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center rounded-xl bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleStepAdjust('quizzes', -1)}
                        className="px-2.5 py-1 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/10"
                        title="Decrease target"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-mono text-xs font-bold">{goal.quizzesTarget}</span>
                      <button
                        type="button"
                        onClick={() => handleStepAdjust('quizzes', 1)}
                        className="px-2.5 py-1 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/10"
                        title="Increase target"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-ink3 dark:text-white/50 mr-1">Presets:</span>
                      {QUIZ_PRESETS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleQuickPreset('quizzes', p)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all",
                            goal.quizzesTarget === p
                              ? "bg-ink text-white dark:bg-white dark:text-black"
                              : "bg-white dark:bg-white/10 text-ink3 hover:text-ink dark:text-white/70 hover:bg-gold/20"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Number Input Form */}
              <form onSubmit={handleCustomSubmit} className="pt-2 flex items-center gap-2 border-t border-black/5 dark:border-white/5">
                <span className="text-xs text-ink3 dark:text-white/60">Or enter custom number:</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={customInputValue}
                  onChange={(e) => setCustomInputValue(e.target.value)}
                  placeholder="e.g. 7"
                  className="w-20 bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 rounded-xl px-3 py-1 text-xs text-ink dark:text-white font-mono font-bold focus:outline-none focus:border-gold"
                />
                <button
                  type="submit"
                  disabled={!customInputValue.trim()}
                  className="px-3 py-1 bg-gold hover:bg-gold-l text-black font-bold text-xs rounded-xl shadow-xs disabled:opacity-40 cursor-pointer"
                >
                  Save Custom
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN VISUAL PROGRESS BAR SECTION */}
      <div className="py-5 space-y-4 relative z-10">
        
        {/* Single Mode: Facts or Quizzes */}
        {goal.mode !== 'both' ? (
          <div className="space-y-2.5">
            {/* Numbers & Percent Header */}
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-ink3 dark:text-white/50 flex items-center gap-1.5">
                  <TrendingUp size={13} className="text-gold" />
                  <span>
                    {goal.mode === 'facts' ? 'Facts Learned Today' : 'Quizzes Completed Today'}
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-serif font-black text-ink dark:text-white mt-0.5">
                  {primaryCurrent}{' '}
                  <span className="text-sm font-sans font-medium text-ink3 dark:text-white/60">
                    / {primaryTarget} {primaryUnit}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className={cn(
                  "text-2xl sm:text-3xl font-black font-mono tracking-tight",
                  isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-gold"
                )}>
                  {primaryPercent}%
                </span>
                <div className="text-[11px] font-semibold text-ink3 dark:text-white/60">
                  {isCompleted
                    ? 'Goal Accomplished!'
                    : `${primaryTarget - primaryCurrent} more to hit target`}
                </div>
              </div>
            </div>

            {/* Visual Progress Bar Track */}
            <div className="relative w-full h-4 sm:h-5 bg-paper2 dark:bg-black/40 rounded-full overflow-hidden p-0.5 border border-black/5 dark:border-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${primaryPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={cn(
                  "h-full rounded-full transition-all relative overflow-hidden",
                  isCompleted
                    ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-sm"
                    : "bg-gradient-to-r from-amber-500 via-gold to-yellow-400 shadow-xs"
                )}
              >
                {/* Subtle Moving Shimmer Bar */}
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-[pulse_2s_infinite]" />
              </motion.div>

              {/* Milestone Checkpoints (25%, 50%, 75%) */}
              <div className="absolute inset-0 flex justify-between px-[25%] pointer-events-none">
                <div className="w-0.5 h-full bg-black/10 dark:bg-white/10" />
                <div className="w-0.5 h-full bg-black/10 dark:bg-white/10" />
              </div>
            </div>

            {/* Milestone markers labels */}
            <div className="flex justify-between text-[10px] font-mono text-ink3 dark:text-white/40 px-1 pt-0.5">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span className={isCompleted ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}>100%</span>
            </div>
          </div>
        ) : (
          /* Dual Mode (Combined Challenge: Facts + Quizzes) */
          <div className="space-y-4">
            {/* Overall Aggregate Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="uppercase tracking-wider text-ink3 dark:text-white/60 flex items-center gap-1.5">
                  <Zap size={14} className="text-gold" />
                  <span>Dual Quest Progress</span>
                </span>
                <span className={cn(
                  "font-mono text-base font-black",
                  isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-gold"
                )}>
                  {primaryPercent}% Overall
                </span>
              </div>

              <div className="relative w-full h-3.5 bg-paper2 dark:bg-black/40 rounded-full overflow-hidden border border-black/5 dark:border-white/10 p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${primaryPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={cn(
                    "h-full rounded-full transition-all",
                    isCompleted
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                      : "bg-gradient-to-r from-amber-500 via-gold to-emerald-400"
                  )}
                />
              </div>
            </div>

            {/* Individual Sub-Bars for Facts & Quizzes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Facts Sub-Bar */}
              <div className="p-3 rounded-2xl bg-paper2/60 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-1">
                    <BookOpen size={13} className="text-gold" />
                    <span>Facts: {goal.factsLearned} / {goal.factsTarget}</span>
                  </span>
                  <span className="font-mono font-bold text-gold">{factsPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-white dark:bg-black/40 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${factsPercent}%` }}
                    className={cn(
                      "h-full rounded-full transition-all",
                      factsPercent >= 100 ? "bg-emerald-500" : "bg-gold"
                    )}
                  />
                </div>
              </div>

              {/* Quizzes Sub-Bar */}
              <div className="p-3 rounded-2xl bg-paper2/60 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-1">
                    <HelpCircle size={13} className="text-blue-500" />
                    <span>Quizzes: {goal.quizzesCompleted} / {goal.quizzesTarget}</span>
                  </span>
                  <span className="font-mono font-bold text-blue-500">{quizzesPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-white dark:bg-black/40 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${quizzesPercent}%` }}
                    className={cn(
                      "h-full rounded-full transition-all",
                      quizzesPercent >= 100 ? "bg-emerald-500" : "bg-blue-500"
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* QUICK ACTION BUTTONS & MOTIVATION BAR */}
      <div className="pt-3 border-t border-black/5 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs relative z-10">
        
        {/* Dynamic Contextual Guidance */}
        <div className="text-ink3 dark:text-white/70 text-center sm:text-left">
          {isCompleted ? (
            <span className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-center sm:justify-start gap-1.5">
              <CheckCircle2 size={15} />
              <span>Outstanding dedication! Daily goal achieved. Your streak is safe!</span>
            </span>
          ) : goal.mode === 'facts' ? (
            <span>
              {remainingFacts === 0 
                ? 'Ready to finish today’s target!' 
                : `Read ${remainingFacts} more fact${remainingFacts === 1 ? '' : 's'} to fulfill today’s knowledge streak.`}
            </span>
          ) : goal.mode === 'quizzes' ? (
            <span>
              {remainingQuizzes === 0 
                ? 'Quiz target reached!' 
                : `Complete ${remainingQuizzes} more quiz${remainingQuizzes === 1 ? '' : 'zes'} to solidify learning.`}
            </span>
          ) : (
            <span>
              {remainingFacts > 0 && remainingQuizzes > 0
                ? `${remainingFacts} facts & ${remainingQuizzes} quizzes remaining today.`
                : remainingFacts > 0
                ? `${remainingFacts} facts remaining.`
                : `${remainingQuizzes} quizzes remaining.`}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* Quick Mark Fact Read Button */}
          <button
            type="button"
            onClick={handleAddFact}
            className="px-3 py-1.5 rounded-xl bg-paper2 dark:bg-white/10 hover:bg-gold hover:text-black border border-black/10 dark:border-white/10 font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:scale-[1.02]"
            title="Increment facts learned count by 1"
          >
            <Plus size={13} className="text-gold hover:text-black" />
            <span>+1 Fact Read</span>
          </button>

          {/* Quick Mark Quiz Completed Button */}
          <button
            type="button"
            onClick={handleAddQuiz}
            className="px-3 py-1.5 rounded-xl bg-paper2 dark:bg-white/10 hover:bg-emerald-500 hover:text-white border border-black/10 dark:border-white/10 font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:scale-[1.02]"
            title="Increment quizzes completed count by 1"
          >
            <Plus size={13} className="text-emerald-500 hover:text-white" />
            <span>+1 Quiz Completed</span>
          </button>

          {/* Direct link to take a quiz */}
          <Link
            to="/quiz"
            className="px-3 py-1.5 rounded-xl bg-ink text-white dark:bg-white dark:text-black hover:bg-gold dark:hover:bg-gold font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
          >
            <span>Take Quiz</span>
            <ArrowRight size={13} />
          </Link>

          {/* Reset button (low key) */}
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 text-ink3 hover:text-rose-600 dark:text-white/40 dark:hover:text-rose-400 rounded-lg transition-colors"
            title="Reset today's progress"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* CELEBRATION BANNER (Fires when goal completed) */}
      <AnimatePresence>
        {justAccomplished && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="mt-4 p-4 bg-emerald-500 text-white rounded-2xl flex items-center justify-between text-xs shadow-lg relative overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles size={20} className="text-white animate-spin" />
              </div>
              <div>
                <div className="font-serif font-black text-sm">
                  🎉 Fantastic Achievement! Daily Goal Reached!
                </div>
                <div className="text-white/90 text-[11px]">
                  You have fulfilled your target for today. Keep the curiosity alive tomorrow!
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl font-bold font-mono shrink-0">
              <Flame size={14} className="text-amber-300 fill-amber-300" />
              <span>+{goal.streak} Streak!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
