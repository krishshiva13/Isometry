import React, { useState, useEffect } from 'react';
import { Target, Flame, CheckCircle2, ChevronRight, Sparkles, BookOpen, Award, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export interface DailyGoalData {
  date: string;
  count: number;
  target: number;
  completedToday: boolean;
  streak: number;
  lastCompletedDate?: string;
}

const STORAGE_KEY = 'facthub_daily_reading_goal';
const TARGET_OPTIONS = [3, 5, 10, 15, 20];

export const getTodayDateKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getDailyGoalData = (): DailyGoalData => {
  const todayKey = getTodayDateKey();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: DailyGoalData = JSON.parse(raw);
      if (parsed.date === todayKey) {
        return parsed;
      }
      // New day: check streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      const streakMaintained = parsed.lastCompletedDate === yesterdayKey;
      return {
        date: todayKey,
        count: 0,
        target: parsed.target || 5,
        completedToday: false,
        streak: streakMaintained ? parsed.streak : (parsed.completedToday ? 1 : 0),
        lastCompletedDate: parsed.lastCompletedDate
      };
    }
  } catch (e) {
    console.warn('Failed to parse goal data', e);
  }

  return {
    date: todayKey,
    count: 0,
    target: 5,
    completedToday: false,
    streak: 1
  };
};

export const recordFactRead = () => {
  const current = getDailyGoalData();
  const newCount = current.count + 1;
  const isNowCompleted = newCount >= current.target;
  const todayKey = getTodayDateKey();

  let streak = current.streak;
  let lastCompletedDate = current.lastCompletedDate;

  if (isNowCompleted && !current.completedToday) {
    if (current.lastCompletedDate !== todayKey) {
      streak = (current.streak || 0) + 1;
      lastCompletedDate = todayKey;
    }
  }

  const updated: DailyGoalData = {
    ...current,
    count: newCount,
    completedToday: isNowCompleted || current.completedToday,
    streak,
    lastCompletedDate
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('facthub_daily_goal_updated', { detail: updated }));
  } catch (e) {
    // ignore
  }
  return updated;
};

export const DailyGoalTracker: React.FC<{ className?: string }> = ({ className }) => {
  const [goal, setGoal] = useState<DailyGoalData>(getDailyGoalData);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
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

  const handleSetTarget = (newTarget: number) => {
    const isNowCompleted = goal.count >= newTarget;
    const todayKey = getTodayDateKey();
    let streak = goal.streak;
    let lastCompletedDate = goal.lastCompletedDate;

    if (isNowCompleted && !goal.completedToday) {
      streak = (goal.streak || 0) + 1;
      lastCompletedDate = todayKey;
    }

    const updated: DailyGoalData = {
      ...goal,
      target: newTarget,
      completedToday: isNowCompleted,
      streak,
      lastCompletedDate
    };

    setGoal(updated);
    setIsEditingTarget(false);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('facthub_daily_goal_updated', { detail: updated }));
    } catch (e) {
      // ignore
    }
  };

  const handleManualIncrement = () => {
    const updated = recordFactRead();
    setGoal(updated);
    if (updated.completedToday && !goal.completedToday) {
      setJustAccomplished(true);
      setTimeout(() => setJustAccomplished(false), 4000);
    }
  };

  const percent = Math.min(100, Math.round((goal.count / Math.max(1, goal.target)) * 100));
  
  // SVG Circle Geometry
  const size = 96;
  const strokeWidth = 8;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div
      className={cn(
        "bg-white border border-black/10 rounded-2xl p-5 shadow-sm relative overflow-hidden transition-all hover:border-gold/40",
        className
      )}
    >
      {/* Background Subtle Accent Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 relative z-10">
        
        {/* Left: Circular Progress Graphic */}
        <div className="relative flex-shrink-0 flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background Track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-paper2"
              fill="transparent"
            />
            {/* Animated Progress Circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={cn(
                "transition-all duration-700 ease-out",
                goal.completedToday ? "text-emerald-500" : "text-gold"
              )}
              fill="transparent"
            />
          </svg>

          {/* Inner Badge / Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {goal.completedToday ? (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center"
              >
                <Award size={22} className="text-emerald-600 animate-bounce" />
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-tighter mt-0.5">100% Done</span>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <span className="text-lg font-serif font-black text-ink leading-none">
                  {goal.count}
                  <span className="text-xs text-ink3 font-sans font-normal">/{goal.target}</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-ink3 mt-0.5">
                  {percent}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Center: Info, Streak & Motivational Message */}
        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold/15 text-ink">
              <Target size={11} className="text-gold" /> Daily Study Goal
            </span>

            {goal.streak > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                <Flame size={11} className="text-amber-600 fill-amber-500" />
                <span>{goal.streak} Day Streak</span>
              </span>
            )}
          </div>

          <h3 className="text-base font-serif font-bold text-ink">
            {goal.completedToday
              ? '🎉 Daily Reading Goal Completed!'
              : goal.count === 0
              ? 'Start Your Knowledge Streak Today'
              : `${goal.target - goal.count} more fact${goal.target - goal.count === 1 ? '' : 's'} to hit today’s target`}
          </h3>

          <p className="text-xs text-ink3 leading-relaxed">
            {goal.completedToday
              ? 'Outstanding curiosity! Keep exploring or challenge your recall in the Daily Quiz.'
              : `You have read ${goal.count} of ${goal.target} facts today. Reading consistently builds deep memory.`}
          </p>

          {/* Target Selector Dropdown */}
          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            {isEditingTarget ? (
              <div className="flex items-center gap-1.5 bg-paper2 p-1 rounded-xl border border-black/10 animate-in fade-in">
                <span className="text-[10px] font-bold text-ink3 px-1">Goal:</span>
                {TARGET_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => handleSetTarget(t)}
                    className={cn(
                      "px-2 py-0.5 rounded-lg text-xs font-bold transition-all",
                      goal.target === t
                        ? "bg-ink text-white shadow-xs"
                        : "text-ink3 hover:text-ink hover:bg-black/5"
                    )}
                  >
                    {t}
                  </button>
                ))}
                <button
                  onClick={() => setIsEditingTarget(false)}
                  className="text-[10px] text-ink3 hover:text-ink px-1.5"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingTarget(true)}
                className="text-[11px] font-bold text-gold hover:underline flex items-center gap-1"
              >
                <span>Target: {goal.target} facts/day</span>
                <span className="text-[10px] text-ink3 font-normal">(Change)</span>
              </button>
            )}

            <button
              onClick={handleManualIncrement}
              className="inline-flex items-center gap-1 px-3 py-1 bg-paper2 hover:bg-gold/20 text-ink text-xs font-bold rounded-lg border border-black/10 transition-all hover:scale-[1.02]"
              title="Mark another fact as read"
            >
              <Plus size={12} className="text-gold" />
              <span>Mark Fact Read</span>
            </button>
          </div>
        </div>

      </div>

      {/* Goal Reached Celebration Banner */}
      <AnimatePresence>
        {justAccomplished && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-600 flex-shrink-0" />
              <span className="font-bold">Congratulations! You met today's fact-reading goal!</span>
            </div>
            <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
              +1 Streak 🏆
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
