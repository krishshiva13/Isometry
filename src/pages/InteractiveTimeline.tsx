import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Clock, Sparkles, ArrowRight, BookOpen, Layers, Milestone, Compass, ChevronRight } from 'lucide-react';
import { HistoricalTimelineEvent } from '../types';
import { cn } from '../lib/utils';

const CHRONOLOGICAL_TIMELINE: HistoricalTimelineEvent[] = [
  {
    id: "tl-indus-valley",
    year: -2500,
    displayDate: "2500 BCE",
    title: "Indus Valley Civilization & Urban Planning",
    category: "history",
    era: "Ancient & Classical",
    description: "Flourishing of Harappa and Mohenjo-Daro with advanced grid-pattern town planning, drainage sanitation systems, and standardized weights and measures.",
    keyLeadersOrMinds: ["Harappan Civil Engineers", "Bronze Age Artisans"],
    examSignificance: "UPSC Ancient India GS-1, Architecture & Metallurgy questions."
  },
  {
    id: "tl-maurya",
    year: -261,
    displayDate: "261 BCE",
    title: "Kalinga War & Emperor Ashoka's Edicts of Dhamma",
    category: "history",
    era: "Ancient & Classical",
    description: "Following the devastating Kalinga War, Ashoka embraces Buddhism and propagates non-violence (Ahimsa) and ethical governance inscribed across rock and pillar edicts.",
    keyLeadersOrMinds: ["Emperor Ashoka", "Upagupta"],
    examSignificance: "Ashokan Edicts, Mauryan Administration & Epigraphy."
  },
  {
    id: "tl-aryabhata",
    year: 499,
    displayDate: "499 CE",
    title: "Aryabhata's Aryabhatiya: Zero & Heliocentrism",
    category: "science",
    era: "Ancient & Classical",
    description: "Aryabhata composes his seminal treatise introducing the approximation of Pi (3.1416), place-value system, trigonometry, and the rotation of Earth on its axis.",
    keyLeadersOrMinds: ["Aryabhata I"],
    examSignificance: "Scientific developments in Classical India, Ancient Astronomy."
  },
  {
    id: "tl-plassey",
    year: 1757,
    displayDate: "June 23, 1757",
    title: "Battle of Plassey: Foundation of British Colonial Rule",
    category: "history",
    era: "Modern History & Freedom",
    description: "Robert Clive defeats Siraj-ud-Daulah through political conspiracy, establishing British East India Company's financial and territorial dominance in Bengal.",
    keyLeadersOrMinds: ["Siraj-ud-Daulah", "Robert Clive", "Mir Jafar"],
    examSignificance: "Transition to British rule, Dual Government of Bengal."
  },
  {
    id: "tl-1857",
    year: 1857,
    displayDate: "May 10, 1857",
    title: "The Great Indian Revolt of 1857",
    category: "history",
    era: "Modern History & Freedom",
    description: "The first major armed uprising against British rule initiated at Meerut, resulting in the abolition of the Company rule and direct transfer to the British Crown under the 1858 Act.",
    keyLeadersOrMinds: ["Mangal Pandey", "Rani Lakshmibai", "Bahadur Shah Zafar", "Kunwar Singh"],
    examSignificance: "Causes, socio-religious factors, and Government of India Act 1858."
  },
  {
    id: "tl-relativity",
    year: 1905,
    displayDate: "1905 CE",
    title: "Albert Einstein's Annus Mirabilis Papers",
    category: "science",
    era: "Scientific Revolution",
    description: "Publication of four revolutionary papers covering the Photoelectric Effect, Brownian Motion, Special Relativity, and Mass-Energy equivalence (E=mc²).",
    keyLeadersOrMinds: ["Albert Einstein"],
    examSignificance: "Fundamental Modern Physics, Quantum Hypothesis."
  },
  {
    id: "tl-raman",
    year: 1928,
    displayDate: "February 28, 1928",
    title: "Discovery of the Raman Effect (National Science Day)",
    category: "discoveries",
    era: "Scientific Revolution",
    description: "Sir C.V. Raman discovers the inelastic scattering of light photons, earning Asia's first Nobel Prize in Physics (1930) and founding modern spectroscopy.",
    keyLeadersOrMinds: ["Sir C.V. Raman", "K.S. Krishnan"],
    examSignificance: "Raman Spectroscopy, National Science Day origins."
  },
  {
    id: "tl-independence",
    year: 1947,
    displayDate: "August 15, 1947",
    title: "Indian Independence & 'Tryst with Destiny'",
    category: "history",
    era: "Modern History & Freedom",
    description: "India achieves sovereign freedom from British colonial rule following decades of mass satyagraha, constitutional struggles, and freedom sacrifices.",
    keyLeadersOrMinds: ["Mahatma Gandhi", "Jawaharlal Nehru", "Sardar Patel", "Netaji Subhas Chandra Bose"],
    examSignificance: "Indian Independence Act 1947, Integration of Princely States."
  },
  {
    id: "tl-constitution",
    year: 1950,
    displayDate: "January 26, 1950",
    title: "Enactment of the Constitution of India",
    category: "history",
    era: "Modern History & Freedom",
    description: "The supreme law of India drafted by the Constituent Assembly under Dr. B.R. Ambedkar comes into effect, establishing India as a Sovereign Democratic Republic.",
    keyLeadersOrMinds: ["Dr. B.R. Ambedkar", "Dr. Rajendra Prasad", "Sir B.N. Rau"],
    examSignificance: "Preamble, Fundamental Rights, Directive Principles, Parliamentary system."
  },
  {
    id: "tl-chandrayaan3",
    year: 2023,
    displayDate: "August 23, 2023",
    title: "Chandrayaan-3 Moon South Pole Landing (National Space Day)",
    category: "discoveries",
    era: "Space & Digital Age",
    description: "ISRO becomes the first space agency in world history to soft-land near the Moon's South Pole with the Vikram lander and Pragyan rover.",
    keyLeadersOrMinds: ["S. Somanath", "P. Veeramuthuvel", "ISRO Scientific Team"],
    examSignificance: "National Space Day, Cryogenic Propulsion, Lunar Ice & Space Economy."
  }
];

export const InteractiveTimeline: React.FC = () => {
  const [selectedEra, setSelectedEra] = useState<string>('All Eras');
  const [activeEvent, setActiveEvent] = useState<HistoricalTimelineEvent>(CHRONOLOGICAL_TIMELINE[0]);

  const eras = [
    'All Eras',
    'Ancient & Classical',
    'Modern History & Freedom',
    'Scientific Revolution',
    'Space & Digital Age'
  ];

  const filteredEvents = selectedEra === 'All Eras'
    ? CHRONOLOGICAL_TIMELINE
    : CHRONOLOGICAL_TIMELINE.filter(e => e.era === selectedEra);

  return (
    <div className="min-h-screen bg-paper py-10 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Interactive Chronological Timeline | FActHub</title>
        <meta name="description" content="Explore humanity's greatest milestones in chronological order with our interactive visual history and science timeline." />
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header Card */}
        <div className="bg-paper2 border border-black/10 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-600 flex items-center justify-center font-bold">
                <Clock size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-black text-ink">Chronological Timelines</h1>
                <p className="text-xs sm:text-sm text-ink3">Visual epoch progression of historical, scientific, and civilizational turning points</p>
              </div>
            </div>
          </div>

          {/* Era Filter Tabs */}
          <div className="mt-6 pt-6 border-t border-black/10 flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {eras.map(era => (
              <button
                key={era}
                onClick={() => setSelectedEra(era)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5",
                  selectedEra === era
                    ? "bg-ink text-paper shadow-sm"
                    : "bg-paper hover:bg-paper3 text-ink2 border border-black/10"
                )}
              >
                <Milestone size={12} className={selectedEra === era ? "text-gold" : "text-ink3"} />
                <span>{era}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Visualization Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Stepped Timeline Path */}
          <div className="lg:col-span-7 space-y-4 relative">
            
            {/* Vertical spine line */}
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-black/10 -z-0 hidden sm:block" />

            {filteredEvents.map((evt, idx) => {
              const isActive = activeEvent.id === evt.id;

              return (
                <div
                  key={evt.id}
                  onClick={() => setActiveEvent(evt)}
                  className={cn(
                    "relative z-10 p-5 rounded-3xl border transition-all cursor-pointer flex items-start gap-4",
                    isActive
                      ? "bg-paper2 border-gold shadow-md scale-[1.01]"
                      : "bg-paper hover:bg-paper2 border-black/10"
                  )}
                >
                  {/* Timeline Badge Marker */}
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center font-mono font-bold text-xs transition-all",
                    isActive
                      ? "bg-gold text-ink shadow-sm"
                      : "bg-paper2 text-ink2 border border-black/10"
                  )}>
                    {evt.year > 0 ? evt.year : `${Math.abs(evt.year)}B`}
                  </div>

                  {/* Content snippet */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gold px-2 py-0.5 rounded bg-gold/10">
                        {evt.era}
                      </span>
                      <span className="text-[11px] font-mono text-ink3 font-bold">
                        {evt.displayDate}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-serif font-bold text-ink truncate">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-ink3 line-clamp-2 mt-1 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  <ChevronRight size={18} className={cn("flex-shrink-0 self-center transition-transform", isActive ? "text-gold translate-x-1" : "text-ink3")} />
                </div>
              );
            })}

          </div>

          {/* Active Event Detail Drawer */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-paper2 border border-black/10 rounded-3xl p-6 sm:p-7 shadow-lg space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-black/10">
                <span className="text-xs font-mono font-bold text-gold uppercase tracking-wider">
                  Timeline Spotlight
                </span>
                <span className="text-xs font-mono font-bold text-ink px-2.5 py-1 bg-paper rounded-full border border-black/10">
                  {activeEvent.displayDate}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink3 px-2 py-0.5 rounded bg-black/5">
                  {activeEvent.category.toUpperCase()} • {activeEvent.era}
                </span>
                <h2 className="text-xl font-serif font-black text-ink mt-2">
                  {activeEvent.title}
                </h2>
              </div>

              <div className="text-xs sm:text-sm text-ink2 leading-relaxed bg-paper p-4 rounded-2xl border border-black/5">
                {activeEvent.description}
              </div>

              {activeEvent.keyLeadersOrMinds && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-ink3 mb-1.5">
                    Key Historical Minds / Leaders:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeEvent.keyLeadersOrMinds.map(leader => (
                      <span key={leader} className="px-2.5 py-1 bg-gold/15 text-ink font-bold text-xs rounded-xl">
                        👤 {leader}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeEvent.examSignificance && (
                <div className="p-4 rounded-2xl bg-gold/10 border border-gold/20 text-xs text-ink space-y-1">
                  <span className="font-bold text-gold flex items-center gap-1">
                    <Sparkles size={14} /> Competitive Exam Syllabus Significance:
                  </span>
                  <p className="text-ink2 leading-relaxed">
                    {activeEvent.examSignificance}
                  </p>
                </div>
              )}

              <div className="pt-2">
                <Link
                  to="/daily-streak"
                  className="w-full flex items-center justify-center gap-2 bg-ink hover:bg-black text-paper font-bold py-3 rounded-2xl text-xs transition-all shadow-md"
                >
                  <span>Practice Related Quiz Questions</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
