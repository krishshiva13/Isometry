import React, { useState, useEffect } from 'react';
import { Sparkles, X, ChevronDown, ChevronUp, ArrowRight, Copy, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CuratedFact {
  text: string;
  category: string;
  tag: string;
}

const CURATED_FACTS: CuratedFact[] = [
  {
    text: "Oxford University is older than the Aztec Empire. Teaching began at Oxford around 1096 AD; the Aztec Empire was founded in 1428 AD.",
    category: "History",
    tag: "Milestone"
  },
  {
    text: "Cleopatra lived closer in time to the Moon landing (1969) than to the construction of the Great Pyramid of Giza (~2560 BC).",
    category: "History",
    tag: "Chronology"
  },
  {
    text: "Honey never spoils. Archaeologists have discovered pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.",
    category: "Science",
    tag: "Chemistry"
  },
  {
    text: "A day on Venus is longer than a year on Venus. It takes Venus 243 Earth days to complete one rotation, but only 225 Earth days to orbit the Sun.",
    category: "Space",
    tag: "Astronomy"
  },
  {
    text: "The mantis shrimp can punch with the acceleration of a .22 caliber bullet, creating cavitation bubbles that briefly boil the surrounding water.",
    category: "Nature",
    tag: "Biology"
  },
  {
    text: "Bananas share approximately 60% of their DNA with human beings.",
    category: "Science",
    tag: "Genetics"
  },
  {
    text: "The Eiffel Tower can grow more than 15 cm (6 inches) taller during hot summers due to the thermal expansion of its wrought iron frame.",
    category: "Inventions",
    tag: "Physics"
  },
  {
    text: "Sharks are older than trees and Saturn's rings. The earliest evidence of shark scales dates back 450 million years; trees emerged around 350 million years ago.",
    category: "Nature",
    tag: "Evolution"
  },
  {
    text: "Water can boil and freeze at the exact same time under specific temperature and pressure conditions, known in thermodynamics as the 'triple point'.",
    category: "Science",
    tag: "Physics"
  },
  {
    text: "Voyager 1, launched in 1977, is now over 24 billion kilometers from Earth in interstellar space, still transmitting data back with just 22.4 watts of transmitter power.",
    category: "Space",
    tag: "Exploration"
  }
];

const STORAGE_KEY = 'facthub_fotd_minimized';

export const FactOfTheDayCard: React.FC<{ className?: string }> = ({ className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [copied, setCopied] = useState(false);

  // Sync state with localStorage
  const handleToggleMinimize = (minimize: boolean) => {
    setIsMinimized(minimize);
    try {
      localStorage.setItem(STORAGE_KEY, String(minimize));
    } catch {
      // Ignore storage errors
    }
  };

  const handleNextFact = () => {
    setCurrentIndex((prev) => (prev + 1) % CURATED_FACTS.length);
    setCopied(false);
  };

  const handleCopy = () => {
    const fact = CURATED_FACTS[currentIndex];
    navigator.clipboard.writeText(`"${fact.text}" — via FActHub`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentFact = CURATED_FACTS[currentIndex];

  // Minimized state: Clean, compact banner with option to reopen
  if (isMinimized) {
    return (
      <div className={cn("transition-all duration-300", className)}>
        <button
          type="button"
          onClick={() => handleToggleMinimize(false)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-paper2 dark:bg-[#1b1c22] hover:bg-gold/15 dark:hover:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl text-xs font-bold text-ink dark:text-white transition-all shadow-2xs group"
          title="Click to open Fact of the Day"
          aria-label="Open Fact of the Day"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-gold group-hover:rotate-12 transition-transform" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink dark:text-white/90">
              Fact of the Day
            </span>
          </div>
          <span className="text-[11px] text-ink3 group-hover:text-gold flex items-center gap-1 font-medium transition-colors">
            <span>Open</span>
            <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
          </span>
        </button>
      </div>
    );
  }

  // Expanded card state with close button, next fact, and copy option
  return (
    <div
      className={cn(
        "bg-ink dark:bg-[#16171d] rounded-2xl p-5 text-white overflow-hidden relative shadow-sm border border-black/10 dark:border-white/10 transition-all duration-300 not-prose",
        className
      )}
    >
      {/* Subtle background star watermark */}
      <div
        className="absolute top-0 right-0 text-6xl font-serif font-black text-white/5 pr-4 pt-1 select-none pointer-events-none"
        aria-hidden="true"
      >
        ★
      </div>

      {/* Card Header with Category and Close Button */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-gold animate-pulse" />
          <span className="font-mono text-[0.65rem] text-gold-l uppercase tracking-widest font-bold">
            Fact of the Day
          </span>
          <span className="text-[10px] font-mono text-white/50 bg-white/10 px-1.5 py-0.5 rounded">
            {currentFact.category}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            title={copied ? "Copied to clipboard!" : "Copy fact"}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Copy fact"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>
          <button
            type="button"
            onClick={() => handleToggleMinimize(true)}
            title="Close / Minimize Fact of the Day"
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close Fact of the Day"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Fact Text */}
      <p className="text-xs sm:text-sm italic leading-relaxed text-white/90 mb-4 relative z-10">
        "{currentFact.text}"
      </p>

      {/* Card Footer with Counter and Interactive Next Fact Button */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10 relative z-10">
        <span className="text-[10px] font-mono text-white/50">
          Fact {currentIndex + 1} of {CURATED_FACTS.length}
        </span>
        <button
          type="button"
          onClick={handleNextFact}
          className="bg-gold text-ink font-bold text-xs px-3.5 py-1.5 rounded-full hover:bg-gold-l active:scale-95 transition-all flex items-center gap-1.5 shadow-2xs group"
          title="View another fascinating fact"
        >
          <span>Next Fact</span>
          <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
