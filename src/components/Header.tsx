import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User as UserIcon, LogOut, Shield, Plus, Sparkles, Bookmark, Brain, Flame, ChevronDown, BookOpen, Clock, Calendar, Scale, Zap, Bell, BarChart2, BarChart3 } from 'lucide-react';
import { cn } from '../lib/utils';
import { authService } from '../services/authService';
import { AuthModal } from './AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { CreateFactModal } from './admin/CreateFactModal';
import { AIContentCreatorModal } from './admin/AIContentCreatorModal';
import { ThemeSwitcher } from './common/ThemeSwitcher';
import { NotificationReminderModal } from './common/NotificationReminderModal';
import { UserProfileProgressModal } from './UserProfileProgressModal';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAICreatorOpen, setIsAICreatorOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  const primaryNavLinks = [
    { name: 'History', path: '/category/history', color: '#c94a2b' },
    { name: 'Science', path: '/category/science', color: '#0a7c6e' },
    { name: 'Exam Prep', path: '/exam-prep', emoji: '📚', badge: 'India' },
    { name: 'Magazine', path: '/magazine', emoji: '📖', badge: 'Weekly' },
  ];

  const studyTools = [
    { name: 'Student Notebook', path: '/notebook', emoji: '📓', desc: 'Saved facts & custom notes' },
    { name: 'Flashcards', path: '/flashcards', emoji: '🧠', desc: 'Active recall & memory practice' },
    { name: 'Daily Streak', path: '/daily-streak', emoji: '🔥', desc: '5 daily quick questions' },
    { name: 'Timelines', path: '/timeline', emoji: '⏳', desc: 'Interactive chronological eras' },
    { name: 'Date Explorer', path: '/calendar', emoji: '📅', desc: 'On this day in history' },
    { name: 'Topic Comparator', path: '/compare', emoji: '⚖️', desc: 'Side-by-side analysis' },
    { name: 'Daily Quiz', path: '/quiz', emoji: '⚡', desc: 'Test your general knowledge' },
  ];

  return (
    <>
      <header className="sticky top-0 z-[200] bg-paper/95 backdrop-blur-md border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-2xl font-serif font-black text-ink tracking-tight flex-shrink-0">
              F<span className="text-gold">A</span>ctHub
            </Link>

            {/* Primary Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                to="/"
                className="px-3 py-1.5 rounded-full text-xs font-bold text-ink2 hover:text-ink hover:bg-paper2 transition-all"
              >
                Home
              </Link>
              {primaryNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-ink2 hover:text-ink hover:bg-paper2 transition-all whitespace-nowrap group"
                >
                  {link.emoji && <span>{link.emoji}</span>}
                  {link.color && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: link.color }} />}
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-gold/15 text-ink font-bold group-hover:bg-gold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}

              {/* Study Tools Dropdown */}
              <div className="relative group">
                <button
                  onClick={() => setIsToolsOpen(!isToolsOpen)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-ink2 hover:text-ink hover:bg-paper2 transition-all"
                >
                  <span>Tools & Archives</span>
                  <ChevronDown size={13} className="text-ink3 group-hover:text-ink transition-transform group-hover:rotate-180" />
                </button>

                <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all w-64 z-50">
                  <div className="bg-white border border-black/10 rounded-2xl shadow-xl p-2 space-y-1">
                    <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-ink3 font-bold border-b border-black/5">
                      Learning & Exploration Suite
                    </div>
                    {studyTools.map((tool) => (
                      <Link
                        key={tool.name}
                        to={tool.path}
                        className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-paper2 transition-colors group/item"
                      >
                        <span className="text-base">{tool.emoji}</span>
                        <div>
                          <div className="text-xs font-bold text-ink group-hover/item:text-gold transition-colors">
                            {tool.name}
                          </div>
                          <div className="text-[10px] text-ink3 leading-tight">
                            {tool.desc}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </nav>
          </div>

          {/* Quick Study Hub Buttons + Admin + Auth */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Direct Prominent Study Links */}
            <div className="hidden md:flex items-center gap-1.5 bg-paper2 p-1 rounded-full border border-black/5">
              <Link
                to="/notebook"
                className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-gold/20 text-ink rounded-full text-xs font-bold transition-all border border-black/5 shadow-2xs group"
                title="Student Notebook - Saved Notes"
              >
                <span>📓</span>
                <span className="group-hover:text-gold transition-colors">Notebook</span>
              </Link>
              <Link
                to="/flashcards"
                className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-purple-100 text-ink rounded-full text-xs font-bold transition-all border border-black/5 shadow-2xs group"
                title="Smart Spaced Flashcards"
              >
                <span>🧠</span>
                <span className="group-hover:text-purple-700 transition-colors">Flashcards</span>
              </Link>
            </div>

            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1.5 bg-paper2 border border-black/10 rounded-full px-3 py-1.5 text-xs text-ink3 hover:border-ink3 transition-all"
            >
              <Search size={14} />
              <span className="hidden sm:inline">Search…</span>
            </button>

            {/* 🌓 Theme Switcher (Paper vs Dark) */}
            <ThemeSwitcher />

            {/* 🔔 Daily Study & Quiz Push Notification Reminders */}
            <button
              onClick={() => setIsReminderModalOpen(true)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-paper2 hover:bg-paper3 border border-black/10 text-ink3 hover:text-gold transition-colors"
              title="Daily Study & Quiz Push Reminders (FCM)"
              aria-label="Daily study reminders"
            >
              <Bell size={14} />
            </button>

            {/* 📊 User Learning Progress & Recharts Dashboard */}
            <button
              onClick={() => setIsProgressModalOpen(true)}
              className="flex items-center gap-1.5 bg-paper2 hover:bg-gold/15 text-ink border border-black/10 rounded-full px-2.5 py-1.5 text-xs font-bold transition-all shadow-2xs"
              title="View Learning Streaks & Performance Dashboard"
            >
              <Flame size={13} className="text-coral" />
              <span className="hidden md:inline">Analytics</span>
            </button>

            {isAdmin && (
              <>
                <button 
                  onClick={() => setIsAICreatorOpen(true)}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-gold/20 via-amber-500/15 to-gold/20 hover:from-gold/30 hover:to-amber-500/30 text-ink border border-gold/40 font-bold text-xs px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full transition-all shadow-sm"
                  title="Open Admin AI Content Creator Studio"
                >
                  <Sparkles size={13} className="text-gold animate-pulse" />
                  <span className="hidden xl:inline">AI Content Creator</span>
                  <span className="xl:hidden">AI Creator</span>
                </button>

                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-1 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/20 font-bold text-xs px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full transition-all"
                  title="Create Manual Fact"
                >
                  <Plus size={13} />
                  <span className="hidden sm:inline">Add Fact</span>
                </button>
              </>
            )}

            {user ? (
              <div className="flex items-center gap-2 relative group">
                <button className="flex items-center gap-2 bg-white border border-black/10 rounded-full pl-1.5 pr-2.5 py-1 hover:border-gold transition-all">
                  {user.photoURL ? (
                    <img src={user.photoURL} className="w-5 h-5 rounded-full" alt="User" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gold/10 text-gold flex items-center justify-center">
                      <UserIcon size={12} />
                    </div>
                  )}
                  <span className="text-xs font-bold text-ink truncate max-w-[60px] hidden sm:inline">
                    {user.displayName || (user.email?.split('@')[0]) || 'User'}
                  </span>
                  {isAdmin && <Shield size={11} className="text-gold" />}
                </button>
                
                {/* Dropdown menu */}
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="bg-white border border-black/10 rounded-2xl shadow-xl p-2 min-w-[220px]">
                    <div className="px-3 py-2 border-b border-black/5 mb-1">
                      <div className="text-sm font-bold text-ink truncate">{user.displayName || 'Curious Learner'}</div>
                      <div className="text-[10px] text-ink3 font-mono">{user.email || user.phoneNumber}</div>
                      {isAdmin && (
                        <div className="mt-1 text-[10px] font-bold text-gold uppercase tracking-wider flex items-center gap-1">
                          <Shield size={10} /> Verified Admin
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setIsProgressModalOpen(true)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-ink hover:bg-paper2 rounded-lg transition-colors text-left"
                    >
                      <BarChart3 size={14} className="text-gold" />
                      <span>Progress & Analytics</span>
                    </button>

                    <button
                      onClick={() => setIsReminderModalOpen(true)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-ink hover:bg-paper2 rounded-lg transition-colors text-left"
                    >
                      <Bell size={14} className="text-coral" />
                      <span>Push Reminders</span>
                    </button>

                    <Link
                      to="/notebook"
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-ink hover:bg-paper2 rounded-lg transition-colors"
                    >
                      <span>📓</span> My Student Notebook
                    </Link>

                    <Link
                      to="/flashcards"
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-ink hover:bg-paper2 rounded-lg transition-colors"
                    >
                      <span>🧠</span> My Flashcard Decks
                    </Link>

                    {isAdmin && (
                      <button
                        onClick={() => setIsAICreatorOpen(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-ink hover:bg-gold/10 rounded-lg transition-colors text-left"
                      >
                        <Sparkles size={14} className="text-gold" />
                        <span>AI Content Studio</span>
                      </button>
                    )}

                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-coral hover:bg-coral/5 rounded-lg transition-colors font-bold"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-ink text-white px-3.5 py-1.5 rounded-full text-xs font-bold hover:bg-gold transition-all"
              >
                Sign In
              </button>
            )}

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-1.5 text-ink hover:bg-paper2 rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      <CreateFactModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(newFact) => {
          setIsCreateModalOpen(false);
          navigate(`/article/${newFact.id}`);
        }}
      />

      <AIContentCreatorModal
        isOpen={isAICreatorOpen}
        onClose={() => setIsAICreatorOpen(false)}
        onFactPublished={(newFact) => {
          setIsAICreatorOpen(false);
          navigate(`/article/${newFact.id}`);
        }}
      />

      <NotificationReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
      />

      <UserProfileProgressModal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
      />

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 z-[199] bg-paper border-b border-black/10 p-4 shadow-xl fade-in max-h-[85vh] overflow-y-auto">
          <div className="flex flex-col gap-1">
            {/* Mobile Theme & Quick Reminders Bar */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-paper2 border border-black/5 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-ink">Theme:</span>
                <ThemeSwitcher variant="full" />
              </div>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsReminderModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl text-xs font-bold text-ink border border-black/10 shadow-2xs"
              >
                <Bell size={13} className="text-gold" />
                <span>Reminders</span>
              </button>
            </div>

            <button
              onClick={() => {
                setIsMenuOpen(false);
                setIsProgressModalOpen(true);
              }}
              className="flex items-center justify-between p-3 rounded-2xl bg-gold/15 text-ink font-bold text-sm text-left mb-2 border border-gold/20"
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 size={17} className="text-gold" />
                <span>Learning Analytics & Streaks</span>
              </div>
              <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-full font-bold">
                DASHBOARD
              </span>
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsAICreatorOpen(true);
                }}
                className="flex items-center gap-2 p-3 rounded-xl bg-gold/15 text-ink font-bold text-sm text-left mb-2"
              >
                <Sparkles size={16} className="text-gold" />
                <span>AI Content Creator Studio</span>
              </button>
            )}

            <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-ink3 font-bold">
              Study & Personal Hub
            </div>
            {studyTools.map((tool) => (
              <Link
                key={tool.name}
                to={tool.path}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl text-ink font-medium hover:bg-paper2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{tool.emoji}</span>
                  <div>
                    <div className="text-sm font-bold text-ink">{tool.name}</div>
                    <div className="text-[10px] text-ink3">{tool.desc}</div>
                  </div>
                </div>
              </Link>
            ))}

            <div className="border-t border-black/10 my-2 pt-2 px-2 text-[10px] font-mono uppercase tracking-wider text-ink3 font-bold">
              Categories & Topics
            </div>
            {primaryNavLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl text-ink font-medium hover:bg-paper2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {link.emoji ? <span>{link.emoji}</span> : <span className="w-2 h-2 rounded-full" style={{ backgroundColor: link.color }} />}
                  <span className="text-sm font-bold">{link.name}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gold/20 text-ink font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search Overlay Placeholder */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[300] bg-ink/70 backdrop-blur-sm flex justify-center pt-24 px-4 overflow-hidden" onClick={() => setIsSearchOpen(false)}>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden h-fit animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 p-4 border-b border-black/10">
              <Search className="text-ink3" />
              <input 
                autoFocus
                type="text" 
                placeholder="Search facts, people, events…" 
                className="flex-1 border-none outline-none text-lg font-sans text-ink"
              />
              <button onClick={() => setIsSearchOpen(false)} className="text-ink3 hover:text-ink">
                <X size={24} />
              </button>
            </div>
            <div className="p-4 text-center text-ink3 text-sm">
              Start typing to search...
            </div>
          </div>
        </div>
      )}
    </>
  );
};

