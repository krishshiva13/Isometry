import React, { useState, useEffect } from 'react';
import { ListCollapse, ChevronRight, Hash } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TableOfContentsProps {
  content: string;
  className?: string;
}

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export function extractHeadings(markdown: string): HeadingItem[] {
  if (!markdown) return [];
  const lines = markdown.split('\n');
  const headings: HeadingItem[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
      const text = trimmed.replace(/^##\s+/, '').trim();
      const id = slugify(text);
      if (text) headings.push({ id, text, level: 2 });
    } else if (trimmed.startsWith('### ')) {
      const text = trimmed.replace(/^###\s+/, '').trim();
      const id = slugify(text);
      if (text) headings.push({ id, text, level: 3 });
    }
  }

  return headings;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ content, className }) => {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setHeadings(extractHeadings(content));
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -60% 0px' }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90; // header height offset
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveId(id);
    }
  };

  return (
    <nav
      aria-label="Table of Contents"
      className={cn(
        "bg-white dark:bg-[#1b1c22] border border-black/10 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3 not-prose",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListCollapse size={16} className="text-gold" />
          <span className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white">
            Table of Contents (Jump to Section)
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-xs text-ink3 hover:text-ink dark:text-white/60 font-medium"
        >
          {isCollapsed ? 'Show' : 'Hide'}
        </button>
      </div>

      {!isCollapsed && (
        <ul className="space-y-1.5 pt-1 text-xs border-t border-black/5 dark:border-white/10">
          {headings.map(({ id, text, level }) => {
            const isActive = activeId === id;
            return (
              <li
                key={id}
                className={cn(
                  "transition-colors",
                  level === 3 ? "pl-4" : "pl-0"
                )}
              >
                <button
                  type="button"
                  onClick={() => scrollToHeading(id)}
                  className={cn(
                    "w-full text-left py-1 px-2 rounded-lg flex items-center gap-1.5 transition-all text-xs",
                    isActive
                      ? "bg-gold/15 text-ink dark:text-white font-bold border-l-2 border-gold"
                      : "text-ink3 hover:text-ink dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  <ChevronRight size={12} className={cn("shrink-0 transition-transform", isActive ? "rotate-90 text-gold" : "text-ink3")} />
                  <span className="truncate">{text}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
};
