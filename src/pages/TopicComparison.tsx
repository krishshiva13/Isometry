import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Scale, Sparkles, CheckCircle2, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { cn } from '../lib/utils';

interface ComparisonData {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  topicA: {
    name: string;
    dateOrYear: string;
    keyFigure: string;
    primaryObjective: string;
    keyOutcome: string;
    examSignificance: string;
    criticalFact: string;
  };
  topicB: {
    name: string;
    dateOrYear: string;
    keyFigure: string;
    primaryObjective: string;
    keyOutcome: string;
    examSignificance: string;
    criticalFact: string;
  };
  synthesisTakeaway: string;
}

const PRESET_COMPARISONS: ComparisonData[] = [
  {
    id: "plassey-vs-buxar",
    title: "Battle of Plassey vs. Battle of Buxar",
    subtitle: "The two decisive military conflicts that cemented British East India Company rule in India",
    category: "Modern Indian History",
    topicA: {
      name: "Battle of Plassey",
      dateOrYear: "June 23, 1757",
      keyFigure: "Robert Clive vs. Siraj-ud-Daulah (Nawab of Bengal)",
      primaryObjective: "Punitive expedition following the Black Hole episode & takeover of Calcutta factory.",
      keyOutcome: "British political breakthrough in Bengal engineered via Mir Jafar's betrayal; puppet Nawab installed.",
      examSignificance: "UPSC GS-1: Established the political foothold of the British in Bengal.",
      criticalFact: "Fought near Palashi on the banks of Bhagirathi River; marked by minimal actual military combat due to conspiracy."
    },
    topicB: {
      name: "Battle of Buxar",
      dateOrYear: "October 22, 1764",
      keyFigure: "Major Hector Munro vs. Combined forces of Mir Qasim, Shuja-ud-Daula (Awadh) & Shah Alam II (Mughal Emperor)",
      primaryObjective: "Mir Qasim's resistance against rampant misuse of Dastaks (duty-free trade passes).",
      keyOutcome: "Decisive British military victory; Treaty of Allahabad (1765) granting Diwani Rights of Bengal, Bihar, and Orissa.",
      examSignificance: "UPSC GS-1: Conferred legal constitutional sovereign legitimacy & revenue collection rights to the Company.",
      criticalFact: "A real military pitched battle that defeated three reigning rulers of North India simultaneously."
    },
    synthesisTakeaway: "While Plassey was a political coup and conspiracy that opened the door to Bengal, Buxar was the definitive military showdown that gave the East India Company de-jure sovereign taxation power through the Treaty of Allahabad (1765)."
  },
  {
    id: "chandrayaan2-vs-chandrayaan3",
    title: "Chandrayaan-2 vs. Chandrayaan-3",
    subtitle: "How ISRO evolved its engineering and sensors from lunar setback to historical South Pole triumph",
    category: "Space & Astrophysics",
    topicA: {
      name: "Chandrayaan-2 Mission",
      dateOrYear: "July 22, 2019 (Launch)",
      keyFigure: "Dr. K. Sivan (ISRO Chairman), Mission Director Ritu Karidhal",
      primaryObjective: "Orbiter, Lander (Vikram), and Rover (Pragyan) demonstration targeting high-resolution lunar mapping & soft landing.",
      keyOutcome: "Orbiter placed in perfect lunar orbit (still operational); Lander crash-landed during final 2.1 km fine-braking phase due to software guidance glitch.",
      examSignificance: "Science & Tech: Payload architecture (CLASS, DFIR), Orbiter data return, lunar water signature detection.",
      criticalFact: "Equipped with 5 landing thrusters and success-based parameters that lacked wide terrain hazard tolerance."
    },
    topicB: {
      name: "Chandrayaan-3 Mission",
      dateOrYear: "July 14, 2023 (Launch) / Aug 23, 2023 (Touchdown)",
      keyFigure: "S. Somanath (ISRO Chairman), Project Director P. Veeramuthuvel",
      primaryObjective: "Failure-based engineering design solely dedicated to demonstrating safe, soft landing & surface rover mobility near the lunar South Pole.",
      keyOutcome: "100% mission success: Vikram soft-landed at 'Shiv Shakti Point'; Pragyan confirmed Sulphur (S) in lunar regolith.",
      examSignificance: "National Space Day (Aug 23), Laser Doppler Velocimeter (LDV), In-situ chemical elemental analysis.",
      criticalFact: "Sturdier legs (withstanding 3 m/s landing velocity), larger fuel reserves, expanded 4km x 2.4km landing zone, and removal of central 5th thruster."
    },
    synthesisTakeaway: "Chandrayaan-3 was re-engineered using a 'failure-based design philosophy'—expanding sensor redundancies and landing leg resilience derived directly from the high-resolution telemetry data preserved by the Chandrayaan-2 orbiter."
  },
  {
    id: "ncm-vs-cdm",
    title: "Non-Cooperation Movement (1920) vs. Civil Disobedience Movement (1930)",
    subtitle: "Gandhian Mass Satyagraha: From institutional non-cooperation to active law defiance",
    category: "Indian Freedom Struggle",
    topicA: {
      name: "Non-Cooperation Movement (NCM)",
      dateOrYear: "1920 – 1922",
      keyFigure: "Mahatma Gandhi, C.R. Das, Motilal Nehru, Ali Brothers",
      primaryObjective: "Redressal of Punjab wrongs (Jallianwala Bagh), Khilafat grievance, and attainment of Swaraj within 1 year.",
      keyOutcome: "Surrender of British titles, boycott of legislative councils, schools, courts, and foreign cloth. Suspended after Chauri Chaura incident (Feb 1922).",
      examSignificance: "UPSC GS-1: First nationwide pan-Indian mass movement involving peasantry, students, and working class.",
      criticalFact: "Focus was strictly on passive refusal to cooperate with governmental institutions without directly breaking substantive statutory civil laws."
    },
    topicB: {
      name: "Civil Disobedience Movement (CDM)",
      dateOrYear: "1930 – 1934",
      keyFigure: "Mahatma Gandhi, Sarojini Naidu, C. Rajagopalachari, Khan Abdul Ghaffar Khan",
      primaryObjective: "Attainment of Purna Swaraj (Complete Independence) & abolition of the oppressive British Salt Tax monopoly.",
      keyOutcome: "Historic Dandi March (March 12 – April 6, 1930), massive defiance of salt laws, non-payment of land revenue/Chaukidari taxes; led to Gandhi-Irwin Pact.",
      examSignificance: "UPSC GS-1: Active breach of specific colonial statutes; massive participation of women & merchant communities.",
      criticalFact: "Evolved beyond non-cooperation into direct, intentional, non-violent lawbreaking (salt making, forest law defiance)."
    },
    synthesisTakeaway: "While NCM focused on withdrawing active collaboration from British-run bodies (boycotts), CDM escalated the struggle by actively breaking colonial state laws (Salt Satyagraha), shifting the national goal from Swaraj to unconditional Purna Swaraj."
  }
];

export const TopicComparison: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>(PRESET_COMPARISONS[0].id);

  const current = PRESET_COMPARISONS.find(c => c.id === selectedId) || PRESET_COMPARISONS[0];

  return (
    <div className="min-h-screen bg-paper py-10 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Topic Comparison Matrix (Side-by-Side Exam Analysis) | FActHub</title>
        <meta name="description" content="Side-by-side comparative analysis of major historical battles, space missions, and scientific discoveries for competitive exam clarity." />
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-8">

        {/* Top Header */}
        <div className="bg-paper2 border border-black/10 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gold/15 text-gold flex items-center justify-center font-bold">
              <Scale size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-ink">Topic Comparison Matrix</h1>
              <p className="text-xs sm:text-sm text-ink3">High-yield comparative analysis of pivotal historical events & scientific milestones</p>
            </div>
          </div>

          {/* Preset Comparison Selector Tabs */}
          <div className="mt-6 pt-6 border-t border-black/10 flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {PRESET_COMPARISONS.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5",
                  selectedId === p.id
                    ? "bg-ink text-paper shadow-sm"
                    : "bg-paper hover:bg-paper3 text-ink2 border border-black/10"
                )}
              >
                <span>⚖️</span>
                <span>{p.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title & Overview */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-gold px-3 py-1 bg-gold/10 rounded-full">
            {current.category}
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-ink">
            {current.title}
          </h2>
          <p className="text-xs sm:text-sm text-ink3">
            {current.subtitle}
          </p>
        </div>

        {/* Side by Side Grid Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Side A */}
          <div className="bg-paper2 border border-black/10 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-black/10">
                <span className="text-xs font-bold uppercase tracking-wider text-gold px-2.5 py-1 rounded-full bg-gold/15">
                  Option A
                </span>
                <span className="text-xs font-mono font-bold text-ink bg-paper px-3 py-1 rounded-xl border border-black/10">
                  📅 {current.topicA.dateOrYear}
                </span>
              </div>

              <h3 className="text-xl font-serif font-black text-ink mt-3">
                {current.topicA.name}
              </h3>

              <div className="space-y-4 pt-4 text-xs sm:text-sm">
                <div>
                  <span className="font-bold text-ink3 text-xs uppercase tracking-wider block mb-1">
                    Key Historical Figures / Leaders:
                  </span>
                  <p className="font-semibold text-ink">{current.topicA.keyFigure}</p>
                </div>

                <div>
                  <span className="font-bold text-ink3 text-xs uppercase tracking-wider block mb-1">
                    Primary Objective / Context:
                  </span>
                  <p className="text-ink2 leading-relaxed">{current.topicA.primaryObjective}</p>
                </div>

                <div>
                  <span className="font-bold text-ink3 text-xs uppercase tracking-wider block mb-1">
                    Direct Outcome & Resolution:
                  </span>
                  <p className="text-ink2 leading-relaxed">{current.topicA.keyOutcome}</p>
                </div>

                <div className="p-3.5 bg-paper rounded-2xl border border-black/5">
                  <span className="font-bold text-gold text-xs block mb-1">
                    ⭐ Critical Fact to Remember:
                  </span>
                  <p className="text-xs text-ink2">{current.topicA.criticalFact}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5">
              <span className="text-[11px] font-bold text-ink3 uppercase tracking-wider block mb-1">
                Exam Syllabus Impact:
              </span>
              <p className="text-xs font-medium text-ink bg-gold/10 p-2.5 rounded-xl border border-gold/20">
                {current.topicA.examSignificance}
              </p>
            </div>
          </div>

          {/* Side B */}
          <div className="bg-paper2 border border-black/10 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-black/10">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 px-2.5 py-1 rounded-full bg-emerald-500/15">
                  Option B
                </span>
                <span className="text-xs font-mono font-bold text-ink bg-paper px-3 py-1 rounded-xl border border-black/10">
                  📅 {current.topicB.dateOrYear}
                </span>
              </div>

              <h3 className="text-xl font-serif font-black text-ink mt-3">
                {current.topicB.name}
              </h3>

              <div className="space-y-4 pt-4 text-xs sm:text-sm">
                <div>
                  <span className="font-bold text-ink3 text-xs uppercase tracking-wider block mb-1">
                    Key Historical Figures / Leaders:
                  </span>
                  <p className="font-semibold text-ink">{current.topicB.keyFigure}</p>
                </div>

                <div>
                  <span className="font-bold text-ink3 text-xs uppercase tracking-wider block mb-1">
                    Primary Objective / Context:
                  </span>
                  <p className="text-ink2 leading-relaxed">{current.topicB.primaryObjective}</p>
                </div>

                <div>
                  <span className="font-bold text-ink3 text-xs uppercase tracking-wider block mb-1">
                    Direct Outcome & Resolution:
                  </span>
                  <p className="text-ink2 leading-relaxed">{current.topicB.keyOutcome}</p>
                </div>

                <div className="p-3.5 bg-paper rounded-2xl border border-black/5">
                  <span className="font-bold text-emerald-600 text-xs block mb-1">
                    ⭐ Critical Fact to Remember:
                  </span>
                  <p className="text-xs text-ink2">{current.topicB.criticalFact}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5">
              <span className="text-[11px] font-bold text-ink3 uppercase tracking-wider block mb-1">
                Exam Syllabus Impact:
              </span>
              <p className="text-xs font-medium text-ink bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                {current.topicB.examSignificance}
              </p>
            </div>
          </div>

        </div>

        {/* Synthesis & Key Exam Takeaway Box */}
        <div className="bg-gradient-to-r from-ink via-ink2 to-ink text-paper p-6 sm:p-8 rounded-3xl shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-wider">
            <Sparkles size={16} />
            <span>Senior Exam Educator's Synthesis Note</span>
          </div>
          <p className="text-sm sm:text-base text-paper2 leading-relaxed font-serif">
            {current.synthesisTakeaway}
          </p>
        </div>

      </div>
    </div>
  );
};
