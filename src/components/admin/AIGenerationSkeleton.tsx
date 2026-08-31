import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Globe, BookOpen, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { RetryProgress } from '../../lib/apiRetry';

interface AIGenerationSkeletonProps {
  topic: string;
  category: string;
  focus?: string;
  retryProgress?: RetryProgress | null;
}

const STAGES = [
  { id: 1, label: 'Scanning Google Search & Official Sources', desc: 'Connecting to PIB, Nature, ISRO & verified feeds...', icon: Globe },
  { id: 2, label: 'Veracity & Fact-Check Analysis', desc: 'Eliminating misinformation, clickbait & rumors...', icon: ShieldCheck },
  { id: 3, label: 'Structuring Educational Fact Narrative', desc: 'Drafting high-yield exam insights and historical chronology...', icon: BookOpen },
  { id: 4, label: 'Building Quiz MCQs & Bilingual Glossaries', desc: 'Generating 4 options with explanations and term translations...', icon: Sparkles }
];

export const AIGenerationSkeleton: React.FC<AIGenerationSkeletonProps> = ({
  topic,
  category,
  focus,
  retryProgress
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    const stageTimer = setInterval(() => {
      setCurrentStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 2800);

    return () => {
      clearInterval(timer);
      clearInterval(stageTimer);
    };
  }, []);

  return (
    <div className="bg-white border border-black/10 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in max-w-2xl mx-auto">
      
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-black/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gold/15 text-gold flex items-center justify-center animate-pulse">
            <Sparkles size={20} className="animate-spin text-gold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-gold/20 text-ink px-2 py-0.5 rounded-full">
                {category}
              </span>
              <span className="text-[10px] text-ink3 font-mono">
                {elapsedSeconds}s elapsed
              </span>
            </div>
            <h3 className="text-base font-serif font-bold text-ink truncate max-w-md mt-0.5">
              Generating: "{topic}"
            </h3>
          </div>
        </div>

        {retryProgress && (
          <div className="px-3 py-1 bg-amber-100 border border-amber-300 rounded-xl text-amber-900 text-xs font-bold animate-pulse flex items-center gap-1.5">
            <RefreshCw size={12} className="animate-spin" />
            <span>Retry {retryProgress.attempt}/{retryProgress.maxRetries}</span>
          </div>
        )}
      </div>

      {/* Retry Progress Banner if active */}
      {retryProgress && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 flex items-start gap-2.5">
          <RefreshCw size={16} className="text-amber-600 animate-spin flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Exponential Backoff Auto-Retry in progress</div>
            <p className="text-amber-800 text-[11px] leading-relaxed mt-0.5">
              {retryProgress.statusMessage}
            </p>
          </div>
        </div>
      )}

      {/* Multi-step progress list */}
      <div className="space-y-3">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;

          return (
            <div
              key={stage.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                isDone
                  ? 'bg-emerald-50/70 border-emerald-200/70 text-emerald-950'
                  : isCurrent
                  ? 'bg-gold/10 border-gold/40 text-ink shadow-xs'
                  : 'bg-paper2/50 border-black/5 text-ink3 opacity-60'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-gold text-ink animate-bounce'
                    : 'bg-black/5 text-ink3'
                }`}
              >
                {isDone ? <CheckCircle2 size={15} /> : <Icon size={14} />}
              </div>

              <div className="flex-1">
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>{stage.label}</span>
                  {isCurrent && (
                    <span className="text-[10px] font-mono text-gold uppercase font-bold animate-pulse">
                      In Progress...
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[10px] font-mono text-emerald-700 uppercase font-bold">
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-ink3 leading-snug mt-0.5">{stage.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Shimmer Placeholder Skeletons */}
      <div className="space-y-3 pt-2">
        <div className="h-4 bg-paper2 rounded-full w-3/4 animate-pulse" />
        <div className="h-4 bg-paper2 rounded-full w-full animate-pulse" />
        <div className="h-4 bg-paper2 rounded-full w-5/6 animate-pulse" />
      </div>

    </div>
  );
};
