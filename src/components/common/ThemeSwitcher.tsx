import React, { useState, useEffect } from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';

export type ThemeMode = 'paper' | 'dark';

export const ThemeSwitcher: React.FC<{ variant?: 'compact' | 'full' }> = ({ variant = 'compact' }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('facthub_theme') as ThemeMode | null;
      if (saved === 'dark') return 'dark';
      if (saved === 'paper') return 'paper';
      return document.documentElement.classList.contains('dark') ? 'dark' : 'paper';
    }
    return 'paper';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('facthub_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('facthub_theme', 'paper');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'paper' ? 'dark' : 'paper'));
  };

  if (variant === 'full') {
    return (
      <div className="flex items-center gap-1.5 p-1 bg-paper3 dark:bg-[#252525] rounded-xl border border-black/5 dark:border-white/10">
        <button
          onClick={() => setTheme('paper')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            theme === 'paper'
              ? 'bg-paper text-ink shadow-xs'
              : 'text-ink3 hover:text-ink dark:text-neutral-400'
          }`}
          title="Switch to default warm Paper theme"
        >
          <Sun size={13} className={theme === 'paper' ? 'text-gold' : ''} />
          <span>Paper</span>
        </button>

        <button
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            theme === 'dark'
              ? 'bg-[#121212] text-white shadow-xs'
              : 'text-ink3 hover:text-ink dark:text-neutral-400'
          }`}
          title="Switch to high-contrast Dark theme"
        >
          <Moon size={13} className={theme === 'dark' ? 'text-gold' : ''} />
          <span>Dark</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-8 h-8 rounded-full bg-paper2 dark:bg-[#252525] hover:bg-paper3 dark:hover:bg-[#333] border border-black/10 dark:border-white/10 text-ink dark:text-white transition-all shadow-2xs group"
      title={`Toggle theme: currently ${theme === 'paper' ? 'Paper' : 'High-Contrast Dark'}`}
      aria-label={`Switch to ${theme === 'paper' ? 'Dark' : 'Paper'} theme`}
    >
      {theme === 'paper' ? (
        <Moon size={14} className="text-ink3 group-hover:text-gold transition-colors" />
      ) : (
        <Sun size={14} className="text-gold group-hover:rotate-45 transition-transform" />
      )}
    </button>
  );
};
