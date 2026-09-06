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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = React.useRef<HTMLDivElement>(null);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    { name: 'Bookmarks', path: '/bookmarks', emoji: '🔖', desc: 'Your saved favorite facts' },
    { name: 'Student Notebook', path: '/notebook', emoji: '📓', desc: 'Saved facts & custom notes' },
    { name: 'Flashcards', path: '/flashcards', emoji: '🧠', desc: 'Active recall & memory practice' },
    { name: 'Daily Streak', path: '/daily-streak', emoji: '🔥', desc: '5 daily quick questions' },
    { name: 'Timelines', path: '/timeline', emoji: '⏳', desc: 'Interactive chronological eras' },
    { name: 'Date Explorer', path: '/calendar', emoji: '📅', desc: 'On this day in history' },
    { name: 'Topic Comparator', path: '/compare', emoji: '⚖️', desc: 'Side-by-side analysis' },
    { name: 'Daily Quiz', path: '/quiz', emoji: '⚡', desc: 'Test your general knowledge' },
    { name: 'Google SEO Toolkit', path: '/seo-toolkit', emoji: '🚀', desc: 'Page 1 keyword & SERP rank suite' },
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

          {/* Quick Study Hub Controls + Admin + Auth */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Search Button */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1.5 bg-paper2 hover:bg-paper3 border border-black/10 dark:border-white/10 rounded-full px-2.5 sm:px-3 py-1.5 text-xs text-ink3 hover:text-ink transition-all shrink-0"
              title="Search facts, people, events…"
            >
              <Search size={14} />
              <span className="hidden xl:inline">Search…</span>
            </button>

            {/* 🌓 Theme Switcher (Paper vs Dark) */}
            <ThemeSwitcher />

            {/* 🔖 Saved Facts & Bookmarks */}
            <Link
              to="/bookmarks"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-paper2 hover:bg-gold/15 border border-black/10 dark:border-white/10 text-ink3 hover:text-gold transition-colors shrink-0"
              title="Saved Facts & Bookmarks"
              aria-label="Bookmarks"
            >
              <Bookmark size={14} className="text-gold" />
            </Link>

            {/* 🔔 Daily Study & Quiz Push Notification Reminders */}
            <button
              onClick={() => setIsReminderModalOpen(true)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-paper2 hover:bg-paper3 border border-black/10 dark:border-white/10 text-ink3 hover:text-gold transition-colors shrink-0"
              title="Daily Study & Quiz Push Reminders (FCM)"
              aria-label="Daily study reminders"
            >
              <Bell size={14} />
            </button>

            {/* 📊 User Learning Progress & Recharts Dashboard */}
            <button
              onClick={() => setIsProgressModalOpen(true)}
              className="flex items-center gap-1.5 bg-paper2 hover:bg-gold/15 text-ink border border-black/10 dark:border-white/10 rounded-full px-2.5 py-1.5 text-xs font-bold transition-all shadow-2xs shrink-0"
              title="View Learning Streaks & Performance Dashboard"
            >
              <Flame size={13} className="text-coral" />
              <span className="hidden xl:inline">Analytics</span>
            </button>

            {/* Admin Controls */}
            {isAdmin && (
              <>
                <button 
                  onClick={() => setIsAICreatorOpen(true)}
                  className="flex items-center gap-1.5 bg-gold/15 hover:bg-gold/25 text-ink border border-gold/40 font-bold text-xs px-2.5 py-1.5 rounded-full transition-all shrink-0 shadow-2xs"
                  title="Open Admin AI Content Creator Studio"
                >
                  <Sparkles size={13} className="text-gold animate-pulse" />
                  <span className="hidden xl:inline">AI Studio</span>
                </button>

                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-1 bg-gold hover:bg-gold-l text-black font-bold text-xs px-2.5 sm:px-3 py-1.5 rounded-full transition-all shrink-0 shadow-sm"
                  title="Create Manual Fact"
                >
                  <Plus size={14} />
                  <span>Add Fact</span>
                </button>
              </>
            )}

            {/* User Profile / Account Menu */}
            {user ? (
              <div ref={profileMenuRef} className="relative shrink-0">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={cn(
                    "flex items-center gap-1.5 sm:gap-2 bg-paper2 hover:bg-paper3 border rounded-full pl-1 sm:pl-1.5 pr-2 sm:pr-2.5 py-1 transition-all shrink-0 shadow-2xs",
                    isAdmin ? "border-gold/60 hover:border-gold" : "border-black/10 dark:border-white/10 hover:border-ink3",
                    isProfileOpen && "ring-2 ring-gold/40"
                  )}
                  title="Your Profile & Account Menu"
                  aria-label="User Profile and Account Menu"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} className="w-6 h-6 rounded-full object-cover" alt="User" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center font-bold text-xs">
                      {(user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-bold text-ink truncate max-w-[70px] hidden md:inline">
                    {user.displayName || (user.email?.split('@')[0]) || 'User'}
                  </span>
                  {isAdmin && (
                    <span className="bg-gold text-black text-[9px] font-mono font-black px-1.5 py-0.2 rounded-full hidden sm:inline">
                      ADMIN
                    </span>
                  )}
                  <ChevronDown size={12} className={cn("text-ink3 transition-transform", isProfileOpen && "rotate-180")} />
                </button>
                
                {/* Dropdown menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full pt-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                    <div className="bg-white border border-black/10 dark:border-white/15 rounded-2xl shadow-xl p-2 min-w-[230px]">
                      <div className="px-3 py-2.5 border-b border-black/5 dark:border-white/10 mb-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-ink truncate">{user.displayName || 'Curious Learner'}</span>
                          {isAdmin && (
                            <span className="text-[9px] bg-gold text-black font-bold px-1.5 py-0.5 rounded-full uppercase">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-ink3 font-mono truncate">{user.email || user.phoneNumber}</div>
                      </div>

                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          setIsProgressModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-ink hover:bg-paper2 rounded-xl transition-colors text-left"
                      >
                        <BarChart3 size={15} className="text-gold" />
                        <span>Progress & Streaks</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          setIsReminderModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-ink hover:bg-paper2 rounded-xl transition-colors text-left"
                      >
                        <Bell size={15} className="text-coral" />
                        <span>Push Reminders</span>
                      </button>

                      <Link
                        to="/bookmarks"
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-ink hover:bg-paper2 rounded-xl transition-colors"
                      >
                        <Bookmark size={15} className="text-gold" />
                        <span>Saved Bookmarks</span>
                      </Link>

                      <Link
                        to="/notebook"
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-ink hover:bg-paper2 rounded-xl transition-colors"
                      >
                        <span>📓</span>
                        <span>My Student Notebook</span>
                      </Link>

                      <Link
                        to="/flashcards"
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-ink hover:bg-paper2 rounded-xl transition-colors"
                      >
                        <span>🧠</span>
                        <span>My Flashcard Decks</span>
                      </Link>

                      {isAdmin && (
                        <>
                          <div className="my-1 border-t border-black/5 dark:border-white/10" />
                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              setIsCreateModalOpen(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-gold hover:bg-gold/10 rounded-xl transition-colors text-left"
                          >
                            <Plus size={15} />
                            <span>Create New Fact</span>
                          </button>
                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              setIsAICreatorOpen(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-ink hover:bg-gold/10 rounded-xl transition-colors text-left"
                          >
                            <Sparkles size={15} className="text-gold" />
                            <span>AI Studio Generator</span>
                          </button>
                          <Link
                            to="/seo-toolkit"
                            onClick={() => setIsProfileOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors text-left"
                          >
                            <span>🚀</span>
                            <span>Google Page 1 SEO Suite</span>
                          </Link>
                        </>
                      )}

                      <div className="my-1 border-t border-black/5 dark:border-white/10" />

                      <button 
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-coral hover:bg-coral/10 rounded-xl transition-colors font-bold"
                      >
                        <LogOut size={15} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 bg-ink text-white dark:bg-white dark:text-black px-3.5 py-1.5 rounded-full text-xs font-bold hover:bg-gold dark:hover:bg-gold transition-all shrink-0 shadow-xs"
                title="Sign In or Register"
              >
                <UserIcon size={13} />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-1.5 text-ink hover:bg-paper2 rounded-lg shrink-0"
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
            {/* Mobile User Profile Section */}
            <div className="p-3.5 rounded-2xl bg-paper2 border border-black/10 dark:border-white/10 mb-3 shadow-2xs">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {user.photoURL ? (
                        <img src={user.photoURL} className="w-9 h-9 rounded-full object-cover" alt="User" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gold/20 text-gold flex items-center justify-center font-bold text-sm">
                          {(user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-bold text-ink leading-tight">
                          {user.displayName || 'Curious Learner'}
                        </div>
                        <div className="text-[11px] text-ink3 font-mono">
                          {user.email || user.phoneNumber}
                        </div>
                      </div>
                    </div>
                    {isAdmin && (
                      <span className="bg-gold text-black text-[9px] font-bold px-2 py-0.5 rounded-full uppercase font-mono">
                        Admin
                      </span>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsCreateModalOpen(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gold hover:bg-gold-l text-black font-bold text-xs shadow-xs"
                      >
                        <Plus size={14} />
                        <span>Add Fact</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsAICreatorOpen(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gold/20 border border-gold/40 text-ink font-bold text-xs"
                      >
                        <Sparkles size={14} className="text-gold" />
                        <span>AI Studio</span>
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-black/5 dark:border-white/5 text-xs">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsProgressModalOpen(true);
                      }}
                      className="font-bold text-gold hover:underline flex items-center gap-1"
                    >
                      <BarChart3 size={14} />
                      <span>View My Progress</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className="text-coral font-bold hover:underline flex items-center gap-1"
                    >
                      <LogOut size={14} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-ink">Welcome to FActHub</div>
                    <div className="text-[11px] text-ink3">Sign in to track reading streaks & sync notes</div>
                  </div>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="bg-gold hover:bg-gold-l text-black px-4 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 shrink-0"
                  >
                    <UserIcon size={14} />
                    <span>Sign In</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Theme & Quick Reminders Bar */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-paper2 border border-black/5 dark:border-white/5 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-ink">Theme:</span>
                <ThemeSwitcher variant="full" />
              </div>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsReminderModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-black/10 dark:border-white/10 rounded-xl text-xs font-bold text-ink shadow-2xs"
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
              <span className="text-[10px] font-mono bg-white text-black px-2 py-0.5 rounded-full font-bold">
                DASHBOARD
              </span>
            </button>

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

