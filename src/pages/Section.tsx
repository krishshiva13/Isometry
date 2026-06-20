import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { factService } from '../services/factService';
import { Fact, Category } from '../types';
import { FactCard } from '../components/FactCard';
import { cn } from '../lib/utils';
import { ArrowLeft } from 'lucide-react';
import { INITIAL_FACTS } from '../seed';

import { useAuth } from '../contexts/AuthContext';
import { Plus } from 'lucide-react';
import { CreateFactModal } from '../components/admin/CreateFactModal';

export const Section = () => {
  const { cat } = useParams<{ cat: string }>();
  const [facts, setFacts] = useState<Fact[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAdmin } = useAuth();
  const pageSize = 9;

  useEffect(() => {
    const loadCat = async () => {
      setLoading(true);
      try {
        const { facts: data, totalPages: total } = await factService.getFactsPaginated(cat, currentPage, pageSize, isAdmin);
        
        if (data && data.length > 0) {
          setFacts(data);
          setTotalPages(total);
        } else {
          // If Firestore is empty, use initial data
          const localData = INITIAL_FACTS.filter(f => !cat || cat === 'all' || f.cat === cat);
          setFacts(localData.slice((currentPage - 1) * pageSize, currentPage * pageSize));
          setTotalPages(Math.ceil(localData.length / pageSize));
        }
      } catch (err) {
        console.error(err);
        // Fallback to local data on error too
        const localData = INITIAL_FACTS.filter(f => !cat || cat === 'all' || f.cat === cat);
        setFacts(localData.slice((currentPage - 1) * pageSize, currentPage * pageSize));
        setTotalPages(Math.ceil(localData.length / pageSize));
      } finally {
        setLoading(false);
      }
    };
    loadCat();
  }, [cat, currentPage]);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when category changes
  }, [cat]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const catInfo: Record<string, any> = {
    history: { emoji: '⏳', name: 'History', sub: 'From ancient civilizations to modern events', color: 'bg-coral' },
    science: { emoji: '🔬', name: 'Science', sub: 'The universe\'s greatest secrets', color: 'bg-teal' },
    inventions: { emoji: '💡', name: 'Inventions', sub: 'Innovations that changed everything', color: 'bg-gold' },
    discoveries: { emoji: '🔭', name: 'Discoveries', sub: 'Breakthroughs that redefined our world', color: 'bg-indigo' },
  };

  const info = catInfo[cat || 'history'] || catInfo.history;

  return (
    <div className="bg-paper min-h-screen pb-16 fade-in">
       <div className="py-12 border-b border-black/5 mb-12">
          <div className="max-w-7xl mx-auto px-4">
            <Link to="/" className="flex items-center gap-2 text-ink3 hover:text-ink transition-colors mb-6 group w-fit">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className={cn("w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl shadow-lg text-white", info.color)}>
                  {info.emoji}
                </div>
                <div className="space-y-1">
                  <h1 className="text-3xl sm:text-4xl font-serif font-black text-ink">{info.name}</h1>
                  <p className="text-ink3 text-sm sm:text-base">{info.sub}</p>
                </div>
              </div>

              {isAdmin && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-ink text-white px-6 py-3 rounded-2xl font-bold hover:bg-gold transition-all shadow-lg"
                >
                  <Plus size={20} /> Add New Fact
                </button>
              )}
            </div>
          </div>
       </div>

       <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-paper2 border border-black/5 rounded-fact h-24 flex items-center justify-center text-ink3 text-xs italic">
            📢 Google AdSense — 728x90 Leaderboard
          </div>
       </div>

       <div className="max-w-7xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {facts.map((f, i) => (
              <React.Fragment key={f.id}>
                <FactCard fact={f} index={i} />
                {i === 2 && (
                  <div className="bg-paper2 border border-black/5 rounded-fact flex items-center justify-center text-ink3 text-xs italic min-h-[300px]">
                    📢 Google AdSense — 300x250 Rectangle
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          {facts.length === 0 && !loading && (
            <div className="text-center py-24 text-ink3 italic">No facts found in this category yet.</div>
          )}

          {/* Pagination UI */}
          {!loading && totalPages > 1 && (
            <div className="mt-16 mb-8 flex items-center justify-center gap-2">
              <button 
                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 w-10 h-10 flex items-center justify-center rounded-lg border border-black/10 text-ink disabled:opacity-30 hover:bg-gold hover:text-white transition-all"
              >
                &lsaquo;
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToPage(i + 1)}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-bold transition-all",
                    currentPage === i + 1 
                      ? "bg-ink border-ink text-white" 
                      : "bg-white border-black/10 text-ink hover:border-gold hover:text-gold"
                  )}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 w-10 h-10 flex items-center justify-center rounded-lg border border-black/10 text-ink disabled:opacity-30 hover:bg-gold hover:text-white transition-all"
              >
                &rsaquo;
              </button>
            </div>
          )}
        </div>

        <CreateFactModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialCat={cat as Category}
          onSuccess={(newFact) => {
            setFacts([newFact, ...facts]);
          }}
        />
      </div>
    );
  };
