import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Fact } from '../types';

interface TickerProps {
  facts: Fact[];
}

export const Ticker = memo(({ facts }: TickerProps) => {
  const items = [...facts, ...facts]; // Duplicate for infinite scroll

  return (
    <div className="bg-gold py-2 border-t border-black/5 overflow-hidden">
      <div className="ticker-track">
        {items.map((fact, i) => (
          <Link
            key={`${fact.id}-${i}`}
            to={`/article/${fact.id}`}
            className="text-[0.8rem] font-bold text-ink px-8 flex items-center gap-2 whitespace-nowrap hover:opacity-70 transition-opacity"
          >
            <span className="text-sm">{fact.emoji}</span>
            <span>{fact.year < 0 ? `${Math.abs(fact.year)} BC` : fact.year} — {fact.title}</span>
            <span className="ml-6 opacity-20">•</span>
          </Link>
        ))}
      </div>
    </div>
  );
});

Ticker.displayName = 'Ticker';
