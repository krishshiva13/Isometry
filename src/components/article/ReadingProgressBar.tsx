import React, { useEffect, useState } from 'react';

interface ReadingProgressBarProps {
  /** Optional container element ID to measure specifically, defaults to entire window */
  targetId?: string;
}

export const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({ targetId }) => {
  const [completion, setCompletion] = useState<number>(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      if (targetId) {
        const element = document.getElementById(targetId);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top;
          const elementHeight = rect.height;
          const windowHeight = window.innerHeight;

          if (elementTop > 0) {
            setCompletion(0);
          } else {
            const totalScrollable = elementHeight - windowHeight;
            if (totalScrollable <= 0) {
              setCompletion(100);
            } else {
              const scrolled = Math.min(Math.max(-elementTop / totalScrollable, 0), 1);
              setCompletion(Math.round(scrolled * 100));
            }
          }
          return;
        }
      }

      // Default: window-based scroll progress
      const currentProgress = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        setCompletion(Math.min(100, Math.max(0, Math.round((currentProgress / scrollHeight) * 100))));
      }
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
    };
  }, [targetId]);

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 h-1 sm:h-1.5 bg-black/5 pointer-events-none"
      role="progressbar"
      aria-valuenow={completion}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div 
        className="h-full bg-gold transition-[width] duration-150 ease-out shadow-xs"
        style={{ width: `${completion}%` }}
      />
    </div>
  );
};
