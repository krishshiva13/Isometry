import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User as UserIcon, LogOut, Shield, Plus, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { authService } from '../services/authService';
import { AuthModal } from './AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { CreateFactModal } from './admin/CreateFactModal';
import { AIContentCreatorModal } from './admin/AIContentCreatorModal';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAICreatorOpen, setIsAICreatorOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/', emoji: '🏠' },
    { name: 'Daily Streak', path: '/daily-streak', emoji: '🔥', badge: '5-Q' },
    { name: 'Notebook', path: '/notebook', emoji: '📓' },
    { name: 'Flashcards', path: '/flashcards', emoji: '🧠' },
    { name: 'Timelines', path: '/timeline', emoji: '⏳' },
    { name: 'Date Explorer', path: '/calendar', emoji: '📅' },
    { name: 'Compare', path: '/compare', emoji: '⚖️' },
    { name: 'History', path: '/category/history', color: '#c94a2b' },
    { name: 'Science', path: '/category/science', color: '#0a7c6e' },
    { name: 'Exam Prep', path: '/exam-prep', emoji: '📚', badge: 'India' },
    { name: 'Magazine', path: '/magazine', emoji: '📖', badge: 'Weekly' },
    { name: 'Quiz', path: '/quiz', emoji: '⚡' },
  ];

  return (
    <>
      <header className="sticky top-0 z-[200] bg-paper/95 backdrop-blur-md border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="text-2xl font-serif font-black text-ink tracking-tight flex-shrink-0">
            F<span className="text-gold">A</span>ctHub
          </Link>

          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-ink2 hover:bg-ink hover:text-paper transition-all whitespace-nowrap group"
              >
                {link.emoji && <span>{link.emoji}</span>}
                {link.color && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: link.color }} />}
                <span>{link.name}</span>
                {link.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gold/15 text-ink font-bold group-hover:bg-gold group-hover:text-ink">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-paper2 border border-black/10 rounded-full px-4 py-1.5 text-sm text-ink3 hover:border-ink3 transition-all"
            >
              <Search size={16} />
              <span>Search…</span>
            </button>

            {isAdmin && (
              <>
                <button 
                  onClick={() => setIsAICreatorOpen(true)}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-gold/20 via-amber-500/15 to-gold/20 hover:from-gold/30 hover:to-amber-500/30 text-ink border border-gold/40 font-bold text-xs px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full transition-all shadow-sm"
                  title="Open Admin AI Content Creator & Trend Scanner"
                >
                  <Sparkles size={14} className="text-gold animate-pulse" />
                  <span className="hidden sm:inline">AI Content Creator</span>
                  <span className="sm:hidden">AI Creator</span>
                </button>

                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-1.5 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/20 font-bold text-xs px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full transition-all"
                >
                  <Plus size={14} />
                  <span className="hidden sm:inline">Add Fact</span>
                </button>
              </>
            )}

            {user ? (
              <div className="flex items-center gap-2 relative group">
                <button className="flex items-center gap-2 bg-white border border-black/10 rounded-full pl-1.5 pr-3 py-1.5 hover:border-gold transition-all">
                  {user.photoURL ? (
                    <img src={user.photoURL} className="w-6 h-6 rounded-full" alt="User" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gold/10 text-gold flex items-center justify-center">
                      <UserIcon size={14} />
                    </div>
                  )}
                  <span className="text-xs font-bold text-ink truncate max-w-[60px] hidden sm:inline">
                    {user.displayName || (user.email?.split('@')[0]) || 'User'}
                  </span>
                  {isAdmin && <Shield size={12} className="text-gold" />}
                </button>
                
                {/* Dropdown menu */}
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
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
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-coral hover:bg-coral/5 rounded-lg transition-colors"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-ink text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-gold transition-all"
              >
                Sign In
              </button>
            )}

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-ink hover:bg-paper2 rounded-lg"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
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

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 z-[199] bg-paper border-b border-black/10 p-4 shadow-xl fade-in">
          <div className="flex flex-col gap-1">
            {isAdmin && (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsAICreatorOpen(true);
                }}
                className="flex items-center gap-2 p-3 rounded-xl bg-gold/15 text-ink font-bold text-sm text-left mb-2"
              >
                <Sparkles size={16} className="text-gold" />
                <span>AI Content Creator (Admin Only)</span>
              </button>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl text-ink font-medium hover:bg-paper2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {link.emoji ? <span>{link.emoji}</span> : <span className="w-2 h-2 rounded-full" style={{ backgroundColor: link.color }} />}
                  <span>{link.name}</span>
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

