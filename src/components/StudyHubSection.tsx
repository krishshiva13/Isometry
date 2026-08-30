import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Brain, 
  Flame, 
  Calendar, 
  Scale, 
  Clock, 
  GraduationCap, 
  Newspaper,
  ArrowRight,
  Sparkles,
  Zap,
  Bookmark
} from 'lucide-react';

export const StudyHubSection: React.FC = () => {
  const studyTools = [
    {
      id: 'notebook',
      title: 'Student Notebook',
      badge: 'Saved Notes',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      emoji: '📓',
      icon: Bookmark,
      description: 'Your private study workspace. Save any fact, organize by exam topic, and export clean revision sheets.',
      path: '/notebook',
      buttonText: 'Open Notebook',
      bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      borderColor: 'hover:border-amber-400',
      tag: 'Personal Hub'
    },
    {
      id: 'flashcards',
      title: 'Smart Flashcards',
      badge: 'Active Recall',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
      emoji: '🧠',
      icon: Brain,
      description: 'Master facts faster with interactive flip-cards and spaced-repetition testing across all topics.',
      path: '/flashcards',
      buttonText: 'Launch Flashcards',
      bgGradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
      borderColor: 'hover:border-purple-400',
      tag: 'Memory Booster'
    },
    {
      id: 'daily-streak',
      title: 'Daily Streak Sprint',
      badge: '5 Questions',
      badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
      emoji: '🔥',
      icon: Flame,
      description: 'Test your daily retention with 5 fresh questions every morning. Keep your streak alive!',
      path: '/daily-streak',
      buttonText: 'Play Today\'s Sprint',
      bgGradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
      borderColor: 'hover:border-rose-400',
      tag: 'Daily Habit'
    },
    {
      id: 'timeline',
      title: 'Interactive Timelines',
      badge: 'Visual History',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      emoji: '⏳',
      icon: Clock,
      description: 'Explore chronological milestones, historical eras, and scientific breakthroughs across the centuries.',
      path: '/timeline',
      buttonText: 'Explore Timelines',
      bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      borderColor: 'hover:border-emerald-400',
      tag: 'Chronology'
    },
    {
      id: 'calendar',
      title: '365-Day Date Explorer',
      badge: 'On This Day',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
      emoji: '📅',
      icon: Calendar,
      description: 'Travel through time. Pick any day of the year to discover historic milestones and famous birthdays.',
      path: '/calendar',
      buttonText: 'Browse Any Date',
      bgGradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      borderColor: 'hover:border-blue-400',
      tag: 'Archive'
    },
    {
      id: 'compare',
      title: 'Fact & Topic Comparator',
      badge: 'Side-by-Side',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      emoji: '⚖️',
      icon: Scale,
      description: 'Directly compare 2 historical leaders, scientific inventions, or events with structured matrices.',
      path: '/compare',
      buttonText: 'Compare Topics',
      bgGradient: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
      borderColor: 'hover:border-indigo-400',
      tag: 'Analysis'
    },
    {
      id: 'exam-prep',
      title: 'Exam Prep Hub (India)',
      badge: 'UPSC / SSC / PSC',
      badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
      emoji: '📚',
      icon: GraduationCap,
      description: 'Curated General Knowledge and syllabus-mapped facts tailored for government competitive exams.',
      path: '/exam-prep',
      buttonText: 'Start Exam Prep',
      bgGradient: 'from-teal-500/10 via-teal-500/5 to-transparent',
      borderColor: 'hover:border-teal-400',
      tag: 'Syllabus Mapped'
    },
    {
      id: 'magazine',
      title: 'FactHub Magazine',
      badge: 'Weekly Edition',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      emoji: '📖',
      icon: Newspaper,
      description: 'Long-read stories, weekly digests, and editorial retrospectives formatted for immersive reading.',
      path: '/magazine',
      buttonText: 'Read Magazine',
      bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      borderColor: 'hover:border-amber-400',
      tag: 'Editorial'
    }
  ];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-black/10">
      {/* Header with Title and Quick Pills */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-gold font-mono text-xs uppercase tracking-widest font-bold mb-1.5">
            <Sparkles size={14} className="animate-pulse" />
            <span>Interactive Learning & Study Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-ink tracking-tight">
            Study Tools & Quick-Access Pages
          </h2>
          <p className="text-sm text-ink3 mt-1 max-w-2xl">
            Save notes, practice with flashcards, solve daily streaks, and explore interactive chronologies.
          </p>
        </div>

        {/* Quick-Jump Ribbon */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide flex-shrink-0">
          <Link
            to="/notebook"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-paper2 hover:bg-gold hover:text-ink border border-black/10 rounded-full text-xs font-bold text-ink transition-all shadow-2xs whitespace-nowrap"
          >
            <span>📓 Notebook</span>
          </Link>
          <Link
            to="/flashcards"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-paper2 hover:bg-gold hover:text-ink border border-black/10 rounded-full text-xs font-bold text-ink transition-all shadow-2xs whitespace-nowrap"
          >
            <span>🧠 Flashcards</span>
          </Link>
          <Link
            to="/daily-streak"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-paper2 hover:bg-gold hover:text-ink border border-black/10 rounded-full text-xs font-bold text-ink transition-all shadow-2xs whitespace-nowrap"
          >
            <span>🔥 Daily Streak</span>
          </Link>
          <Link
            to="/timeline"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-paper2 hover:bg-gold hover:text-ink border border-black/10 rounded-full text-xs font-bold text-ink transition-all shadow-2xs whitespace-nowrap"
          >
            <span>⏳ Timelines</span>
          </Link>
        </div>
      </div>

      {/* Grid of All Study Hub Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {studyTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.id}
              to={tool.path}
              className={`group relative bg-paper rounded-2xl p-5 border border-black/10 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden bg-gradient-to-b ${tool.bgGradient} ${tool.borderColor}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white border border-black/10 shadow-2xs flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    <span>{tool.emoji}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${tool.badgeColor}`}>
                    {tool.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-serif font-bold text-ink group-hover:text-gold transition-colors flex items-center gap-1.5">
                    <span>{tool.title}</span>
                  </h3>
                  <p className="text-xs text-ink3 mt-1.5 leading-relaxed line-clamp-2">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-black/5 flex items-center justify-between text-xs font-bold text-ink group-hover:text-gold transition-colors">
                <span>{tool.buttonText}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
