import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Tag, Clock, BookOpen, Compass } from 'lucide-react';
import { Fact } from '../../types';
import { factService } from '../../services/factService';
import { INITIAL_FACTS } from '../../seed';
import { cn } from '../../lib/utils';

interface RelatedFactsSectionProps {
  currentFact: Fact;
}

export const RelatedFactsSection: React.FC<RelatedFactsSectionProps> = ({ currentFact }) => {
  const [relatedFacts, setRelatedFacts] = useState<Fact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchRelated = async () => {
      setLoading(true);
      try {
        // 1. Fetch facts from same category
        let pool: Fact[] = [];
        try {
          const remoteFacts = await factService.getFacts(currentFact.cat, false, 30);
          if (remoteFacts && remoteFacts.length > 0) {
            pool = remoteFacts;
          }
        } catch (e) {
          console.warn("Failed fetching remote facts for related section, using local cache:", e);
        }

        // Merge with initial facts if pool is small
        if (pool.length < 5) {
          const localFromCat = INITIAL_FACTS.filter(f => f.cat === currentFact.cat);
          const existingIds = new Set(pool.map(p => p.id));
          localFromCat.forEach(lf => {
            if (!existingIds.has(lf.id)) {
              pool.push(lf);
            }
          });
        }

        // 2. Exclude current article
        const candidates = pool.filter(f => f.id !== currentFact.id);

        // 3. Extract active tags & search keywords from current article
        const currentKeywords: string[] = [
          ...(currentFact.searchKeywords || []),
          ...((currentFact as any).tags || []),
          // Extract notable nouns from title
          ...currentFact.title.toLowerCase().split(/[\s,–—\-:]+/).filter(w => w.length > 3)
        ].map(k => k.toLowerCase().trim()).filter(Boolean);

        // Deduplicate target tags
        const uniqueCurrentKeywords = Array.from(new Set(currentKeywords));

        // 4. Score each candidate by tag and keyword similarity
        const scoredCandidates = candidates.map(candidate => {
          let score = 0;
          const candidateWords = [
            ...(candidate.searchKeywords || []),
            ...((candidate as any).tags || []),
            candidate.title.toLowerCase(),
            candidate.excerpt?.toLowerCase() || ''
          ].join(' ').toLowerCase();

          uniqueCurrentKeywords.forEach(tag => {
            if (candidateWords.includes(tag)) {
              score += 3;
            }
          });

          // Prefer featured or recent if score tied
          if (candidate.featured) score += 1;

          return { fact: candidate, score };
        });

        // 5. Sort by highest relevance score, then take 3 to 4
        scoredCandidates.sort((a, b) => b.score - a.score);
        const topFacts = scoredCandidates.slice(0, 4).map(sc => sc.fact);

        if (isMounted) {
          setRelatedFacts(topFacts);
        }
      } catch (err) {
        console.error("Error computing related facts:", err);
        // Fallback to static category facts
        const fallback = INITIAL_FACTS
          .filter(f => f.cat === currentFact.cat && f.id !== currentFact.id)
          .slice(0, 4);
        if (isMounted) {
          setRelatedFacts(fallback);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRelated();

    return () => {
      isMounted = false;
    };
  }, [currentFact.id, currentFact.cat, currentFact.searchKeywords, currentFact.title]);

  if (!loading && relatedFacts.length === 0) {
    return null;
  }

  // Extract top tags for display
  const displayTags = (currentFact.searchKeywords && currentFact.searchKeywords.length > 0)
    ? currentFact.searchKeywords.slice(0, 3)
    : [currentFact.cat, 'Milestone', 'Discovery'];

  return (
    <section className="mt-14 pt-10 border-t border-black/10 not-prose">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-widest text-gold flex items-center gap-1.5">
              <Compass size={14} className="text-gold" />
              Curated Knowledge Path
            </span>
            <span className="text-[10px] bg-paper2 font-mono font-bold text-ink3 px-2 py-0.5 rounded-full border border-black/5">
              Tagged: {displayTags.join(', ')}
            </span>
          </div>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-ink">
            Related {currentFact.cat.charAt(0).toUpperCase() + currentFact.cat.slice(1)} Facts
          </h2>
          <p className="text-xs sm:text-sm text-ink3 mt-1">
            Discover interconnected historical turning points and scientific discoveries matched by theme.
          </p>
        </div>

        <Link
          to={`/category/${currentFact.cat}`}
          className="text-xs font-bold text-ink hover:text-gold flex items-center gap-1 transition-colors self-start sm:self-auto shrink-0 pb-1"
        >
          <span>Explore All {currentFact.cat}</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-white rounded-2xl p-5 border border-black/5 animate-pulse space-y-3">
              <div className="h-4 bg-paper2 rounded w-1/3"></div>
              <div className="h-5 bg-paper2 rounded w-3/4"></div>
              <div className="h-12 bg-paper2 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {relatedFacts.map(fact => {
            const words = (fact.full || fact.excerpt || '').trim().split(/\s+/).length;
            const readTime = Math.max(1, Math.ceil(words / 200));

            return (
              <Link
                key={fact.id}
                to={`/article/${fact.id}`}
                className="group relative bg-white hover:bg-paper rounded-2xl border border-black/10 hover:border-gold/50 p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl" role="img" aria-label="fact emoji">
                        {fact.emoji || '💡'}
                      </span>
                      <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full", {
                        "bg-coral-l text-coral": fact.cat === 'history',
                        "bg-teal-l text-teal": fact.cat === 'science',
                        "bg-gold-l/20 text-gold": fact.cat === 'inventions',
                        "bg-indigo-l text-indigo": fact.cat === 'discoveries'
                      })}>
                        {fact.cat}
                      </span>
                    </div>

                    {fact.year && (
                      <span className="text-xs font-mono font-bold text-ink3 bg-paper2 px-2 py-0.5 rounded-md border border-black/5">
                        {fact.year}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif font-black text-base sm:text-lg text-ink group-hover:text-gold transition-colors leading-snug line-clamp-2">
                    {fact.title}
                  </h3>

                  <p className="text-xs text-ink3 line-clamp-2 leading-relaxed">
                    {fact.excerpt || (fact.full ? fact.full.substring(0, 140) + '...' : '')}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-xs text-ink3">
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Clock size={12} className="text-gold" />
                    <span>{readTime} min read</span>
                  </div>

                  <span className="inline-flex items-center gap-1 font-bold text-ink group-hover:text-gold text-xs transition-colors">
                    <span>Read Fact</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};
