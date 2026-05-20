import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { factService } from '../services/factService';
import { Birthday } from '../types';
import { cn } from '../lib/utils';
import { INITIAL_BIRTHDAYS } from '../seed';

export const Birthdays = () => {
  const [birthdays, setBirthdays] = useState<Birthday[]>(INITIAL_BIRTHDAYS);

  useEffect(() => {
    const loadBDays = async () => {
      try {
        const data = await factService.getBirthdays(50);
        if (data && data.length > 0) setBirthdays(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadBDays();
  }, []);

  return (
    <div className="bg-paper min-h-screen pb-16 fade-in">
       <div className="py-12 border-b border-black/5 mb-12">
          <div className="max-w-7xl mx-auto px-4">
            <Link to="/" className="flex items-center gap-2 text-ink3 hover:text-ink transition-colors mb-6 group w-fit">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-16 h-16 rounded-2xl flex flex-shrink-0 items-center justify-center text-3xl shadow-lg bg-sage text-white">
                🎂
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl font-serif font-black text-ink">Famous Birthdays</h1>
                <p className="text-ink3 text-sm sm:text-base">Brilliant minds that changed the course of history</p>
              </div>
            </div>
          </div>
       </div>

       <div className="max-w-7xl mx-auto px-4">
          <div className="bg-paper2 border border-black/5 rounded-fact h-24 flex items-center justify-center text-ink3 text-xs italic mb-12">
            📢 Google AdSense — 728x90 Leaderboard
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {birthdays.map((b, i) => (
              <React.Fragment key={b.id}>
                <div className="bg-white border border-black/10 rounded-fact p-6 text-center group hover:shadow-fact-lg transition-all cursor-pointer">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center font-serif text-2xl font-bold bg-opacity-20" style={{ backgroundColor: b.color + '33', color: b.color }}>
                    {b.init}
                  </div>
                  <div className="font-serif font-bold text-ink group-hover:text-gold transition-colors">{b.name}</div>
                  <div className="font-mono text-[0.7rem] text-ink3 mt-1">Born {b.year}</div>
                  <div className="text-[0.65rem] font-bold uppercase tracking-widest mt-2" style={{ color: b.color }}>{b.field}</div>
                  <div className="text-[0.65rem] text-ink3 mt-1 italic">{b.date}</div>
                </div>
                {i === 11 && (
                  <div className="col-span-full py-8">
                    <div className="bg-paper2 border border-black/5 rounded-fact h-32 flex items-center justify-center text-ink3 text-xs italic">
                      📢 Google AdSense — 728x90 In-Feed Ad
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
       </div>
    </div>
  );
};
