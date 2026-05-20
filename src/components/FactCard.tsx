import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Fact } from '../types';

interface FactCardProps {
  fact: Fact;
  index: number;
}

export const FactCard = memo(({ fact, index }: FactCardProps) => {
  const catColors: Record<string, string> = {
    history: 'coral',
    science: 'teal',
    inventions: 'gold',
    discoveries: 'indigo',
    birthdays: 'sage'
  };

  const colorKey = catColors[fact.cat] || 'ink';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -3 }}
      className="bg-white border border-black/10 rounded-fact shadow-fact overflow-hidden flex flex-col group cursor-pointer"
    >
      <div className={cn("h-1 w-full bg-gradient-to-r", {
        "from-coral to-orange-400": fact.cat === 'history',
        "from-teal to-emerald-400": fact.cat === 'science',
        "from-gold to-gold-l": fact.cat === 'inventions',
        "from-indigo to-blue-400": fact.cat === 'discoveries',
        "from-sage to-green-400": fact.cat === 'birthdays'
      })} />
      
      <div className="p-5 flex-1 flex flex-col">
        <div className={cn("flex items-center gap-1.5 text-[0.7rem] font-bold tracking-wider uppercase mb-2", {
          "text-coral": fact.cat === 'history',
          "text-teal": fact.cat === 'science',
          "text-gold": fact.cat === 'inventions',
          "text-indigo": fact.cat === 'discoveries',
          "text-sage": fact.cat === 'birthdays'
        })}>
          <span className={cn("w-1.5 h-1.5 rounded-full", {
            "bg-coral": fact.cat === 'history',
            "bg-teal": fact.cat === 'science',
            "bg-gold": fact.cat === 'inventions',
            "bg-indigo": fact.cat === 'discoveries',
            "bg-sage": fact.cat === 'birthdays'
          })} />
          {fact.cat}
        </div>
        
        <h3 className="font-serif font-bold text-lg text-ink leading-tight mb-2 group-hover:text-gold transition-colors">
          {fact.title}
        </h3>
        
        <p className="text-sm text-ink3 line-clamp-3 leading-relaxed flex-1">
          {fact.excerpt}
        </p>
      </div>

      <div className="px-5 py-4 border-t border-black/5 bg-paper/50 flex items-center justify-between">
        <span className="font-mono text-xs text-ink3">
          {fact.year < 0 ? `${Math.abs(fact.year)} BC` : fact.year}
        </span>
        <Link 
          to={`/article/${fact.id}`}
          className="text-xs font-bold text-gold flex items-center gap-1 hover:gap-2 transition-all"
        >
          Read more <span>→</span>
        </Link>
      </div>
    </motion.div>
  );
});

FactCard.displayName = 'FactCard';
