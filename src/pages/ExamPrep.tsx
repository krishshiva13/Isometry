import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  BookOpen, 
  Calendar, 
  Search, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  GraduationCap, 
  Clock, 
  Sparkles, 
  FileText, 
  ChevronRight, 
  Share2, 
  ArrowUpRight, 
  Send, 
  Award, 
  Compass, 
  Zap, 
  Bookmark, 
  ExternalLink 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { factService } from '../services/factService';
import { Fact } from '../types';

interface ExamCountdown {
  name: string;
  code: string;
  badgeClass: string;
  date: string;
  targetDate: string;
  stage: string;
}

interface CurrentAffairItem {
  id: string;
  num: string;
  title: string;
  body: string;
  exams: Array<{ name: string; tagClass: string; examCode: string }>;
  examAngle: string;
  date: string;
  source: string;
  relatedArticleSlug?: string;
}

interface GkFactItem {
  id: string;
  topic: string;
  category: 'history' | 'science' | 'space' | 'inventions' | 'geography';
  title: string;
  emoji: string;
  thumbBg: string;
  exams: string[];
  readTime: string;
  views: string;
  slug: string;
}

interface HistoryDayItem {
  year: number;
  cat: string;
  title: string;
  examNote: string;
  exams: Array<{ name: string; tagClass: string }>;
  linkSlug?: string;
}

interface QuizQuestionItem {
  cat: string;
  q: string;
  opts: string[];
  ans: number;
  exp: string;
}

const EXAM_COUNTDOWNS: ExamCountdown[] = [
  { name: 'UPSC Mains', code: 'upsc', badgeClass: 'bg-purple-100 text-purple-800 border-purple-300', date: 'Dec 1, 2026', targetDate: '2026-12-01', stage: 'GS Papers 1-4' },
  { name: 'SSC CGL Tier 2', code: 'ssc', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300', date: 'Nov 15, 2026', targetDate: '2026-11-15', stage: 'Computer & GK' },
  { name: 'TNPSC Group 4', code: 'tnpsc', badgeClass: 'bg-rose-100 text-rose-800 border-rose-300', date: 'Nov 04, 2026', targetDate: '2026-11-04', stage: 'General Studies' },
  { name: 'RRB NTPC', code: 'rail', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300', date: 'Nov 15, 2026', targetDate: '2026-11-15', stage: 'CBT-1 Phase' },
  { name: 'IBPS PO Prelims', code: 'bank', badgeClass: 'bg-blue-100 text-blue-800 border-blue-300', date: 'Oct 18, 2026', targetDate: '2026-10-18', stage: 'Prelims Test' }
];

const CURRENT_AFFAIRS_DATA: CurrentAffairItem[] = [
  {
    id: 'ca-1',
    num: '01',
    title: 'India signs landmark semiconductor MoU with Japan & Netherlands for 2nm fab ecosystem',
    body: 'India entered into strategic cooperation agreements with Japan’s METI and Netherlands’ ASML to establish pilot advanced chip fabrication facilities in Tamil Nadu and Telangana, aiming to reduce strategic component import dependency by 2030.',
    exams: [
      { name: 'UPSC GS-3', tagClass: 'bg-purple-100 text-purple-900 border-purple-200', examCode: 'upsc' },
      { name: 'TNPSC', tagClass: 'bg-rose-100 text-rose-900 border-rose-200', examCode: 'tnpsc' }
    ],
    examAngle: 'UPSC GS-3: Semiconductor Mission (ISM), PLI scheme, EUV lithography physics. SSC/TNPSC: Participating states, full form of ASML, target decade. Frequently asked in matching questions.',
    date: 'Sep 1, 2026',
    source: 'The Hindu / PIB',
    relatedArticleSlug: 'science'
  },
  {
    id: 'ca-2',
    num: '02',
    title: 'ISRO successfully executes third autonomous landing trial of Pushpak RLV-TD',
    body: 'The Indian Space Research Organisation completed the third consecutive autonomous precision touchdown test of its Reusable Launch Vehicle Pushpak at the Chitradurga Aeronautical Test Range in Karnataka, paving the way for orbital recovery.',
    exams: [
      { name: 'SSC GK', tagClass: 'bg-emerald-100 text-emerald-900 border-emerald-200', examCode: 'ssc' },
      { name: 'Railway RRB', tagClass: 'bg-amber-100 text-amber-900 border-amber-200', examCode: 'rail' }
    ],
    examAngle: 'SSC/Railway: Nickname "Pushpak", test location (Chitradurga, Karnataka), ISRO chairman (2026). Very frequent 1-mark question in Group D & NTPC.',
    date: 'Sep 1, 2026',
    source: 'ISRO.gov.in',
    relatedArticleSlug: 'discoveries'
  },
  {
    id: 'ca-3',
    num: '03',
    title: 'Tamil Nadu launches AI-powered "Thozhilalar Suraksha" crop insurance for 12 lakh farmers',
    body: 'The Tamil Nadu government launched the state-wide satellite imagery and automated meteorological sensor insurance program, settling claims within 72 hours for small and marginal farm holdings.',
    exams: [
      { name: 'TNPSC Grp 1/2', tagClass: 'bg-rose-100 text-rose-900 border-rose-200', examCode: 'tnpsc' },
      { name: 'UPSC GS-2', tagClass: 'bg-purple-100 text-purple-900 border-purple-200', examCode: 'upsc' }
    ],
    examAngle: 'TNPSC critical point: Scheme name "Thozhilalar Suraksha", target beneficiary count (12 lakh). UPSC: Technological interventions in PMFBY, satellite-based loss assessment.',
    date: 'Sep 1, 2026',
    source: 'Tamil Nadu DIPR',
    relatedArticleSlug: 'inventions'
  },
  {
    id: 'ca-4',
    num: '04',
    title: 'RBI Monetary Policy Committee raises repo rate by 25 bps to 6.75% amid food inflation',
    body: 'The Reserve Bank of India MPC voted 4-2 to raise the benchmark repo rate to 6.75%, the first adjustment in 18 months, citing headline consumer food price inflation averaging 7.2%.',
    exams: [
      { name: 'Banking IBPS/SBI', tagClass: 'bg-blue-100 text-blue-900 border-blue-200', examCode: 'bank' },
      { name: 'SSC CGL', tagClass: 'bg-emerald-100 text-emerald-900 border-emerald-200', examCode: 'ssc' }
    ],
    examAngle: 'Banking (critical): New repo rate = 6.75%, Reverse Repo vs Standing Deposit Facility (SDF), definition of 1 basis point (0.01%). Direct MCQ in General/Financial Awareness.',
    date: 'Sep 1, 2026',
    source: 'RBI Bulletin',
    relatedArticleSlug: 'history'
  },
  {
    id: 'ca-5',
    num: '05',
    title: 'Vande Bharat Express 2.0 clocks 200 km/h during Delhi–Lucknow trial run',
    body: 'Indian Railways clocked a record 200 km/h speed for an indigenous train set on the upgraded semi-high-speed track section, equipped with Kavach 4.0 automatic train protection system.',
    exams: [
      { name: 'Railway RRB', tagClass: 'bg-amber-100 text-amber-900 border-amber-200', examCode: 'rail' },
      { name: 'SSC CGL', tagClass: 'bg-emerald-100 text-emerald-900 border-emerald-200', examCode: 'ssc' }
    ],
    examAngle: 'Railway (Very High Probability): India’s fastest train set, manufacturing location (ICF Chennai), Kavach ATP technology. SSC: Train 18 background and indigenous manufacturing.',
    date: 'Sep 1, 2026',
    source: 'Ministry of Railways',
    relatedArticleSlug: 'inventions'
  },
  {
    id: 'ca-6',
    num: '06',
    title: 'IMF World Economic Outlook: India becomes 3rd largest economy by GDP-PPP',
    body: 'The International Monetary Fund updated its global economic ranking, placing India as the 3rd largest economy in the world on Purchasing Power Parity (PPP) metrics, surpassing Germany.',
    exams: [
      { name: 'UPSC GS-3', tagClass: 'bg-purple-100 text-purple-900 border-purple-200', examCode: 'upsc' },
      { name: 'Banking IBPS', tagClass: 'bg-blue-100 text-blue-900 border-blue-200', examCode: 'bank' }
    ],
    examAngle: 'UPSC Essay/GS-3: Nominal GDP vs PPP distinction, IMF headquarters (Washington D.C.), calculation methodology. Banking/SSC: India rank (3rd in PPP, 5th in Nominal).',
    date: 'Sep 1, 2026',
    source: 'IMF WEO Report',
    relatedArticleSlug: 'history'
  }
];

const GK_FACTS_DATA: GkFactItem[] = [
  {
    id: 'gk-1',
    topic: 'Science — Discovery',
    category: 'science',
    title: 'Fleming’s forgotten petri dish: How penicillin was discovered by accident in 1928',
    emoji: '🧬',
    thumbBg: 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-900',
    exams: ['UPSC GS-3', 'SSC GK', 'Railway'],
    readTime: '6 min read',
    views: '142k views',
    slug: 'science'
  },
  {
    id: 'gk-2',
    topic: 'Invention — Origin Story',
    category: 'inventions',
    title: 'How the telephone was invented: Bell, a spilled battery, and a 3-hour patent race',
    emoji: '📞',
    thumbBg: 'bg-gradient-to-br from-rose-100 to-rose-200 text-rose-900',
    exams: ['SSC GK', 'Railway RRB', 'TNPSC'],
    readTime: '5 min read',
    views: '87k views',
    slug: 'inventions'
  },
  {
    id: 'gk-3',
    topic: 'History — Ancient Engineering',
    category: 'history',
    title: 'Roman roads and volcanic concrete: Why 2,000-year-old engineering still holds up',
    emoji: '🏛️',
    thumbBg: 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900',
    exams: ['UPSC GS-1', 'TNPSC Group 1'],
    readTime: '7 min read',
    views: '76k views',
    slug: 'history'
  },
  {
    id: 'gk-4',
    topic: 'Space — ISRO & NASA',
    category: 'space',
    title: 'Voyager 1: How NASA engineers fixed a memory glitch across 24 billion kilometers',
    emoji: '🪐',
    thumbBg: 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-900',
    exams: ['SSC CGL', 'Railway RRB', 'UPSC'],
    readTime: '9 min read',
    views: '214k views',
    slug: 'discoveries'
  },
  {
    id: 'gk-5',
    topic: 'History — World & Trade',
    category: 'history',
    title: 'The Silk Road: Caravans, Kushan trade routes, and the spread of ancient technologies',
    emoji: '📜',
    thumbBg: 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900',
    exams: ['UPSC GS-1', 'SSC CGL'],
    readTime: '8 min read',
    views: '67k views',
    slug: 'history'
  },
  {
    id: 'gk-6',
    topic: 'Inventions — Accidental Discovery',
    category: 'inventions',
    title: 'The microwave oven: Invented accidentally by Percy Spencer during radar magnetron testing in 1945',
    emoji: '💡',
    thumbBg: 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-900',
    exams: ['SSC CGL', 'Group D', 'TNPSC'],
    readTime: '6 min read',
    views: '112k views',
    slug: 'inventions'
  }
];

const HISTORY_EVENTS_DATA: HistoryDayItem[] = [
  {
    year: 1939,
    cat: 'World History',
    title: 'Germany invades Poland — World War II officially begins in Europe',
    examNote: 'UPSC/SSC: Official starting date of WWII (Sep 1, 1939). Exam trick: WWII ended in Europe on May 8, 1945 (V-E Day), and officially in the Pacific on Sep 2, 1945.',
    exams: [
      { name: 'UPSC GS-1', tagClass: 'bg-purple-100 text-purple-900' },
      { name: 'SSC CGL', tagClass: 'bg-emerald-100 text-emerald-900' }
    ]
  },
  {
    year: 1905,
    cat: 'Modern Indian History',
    title: 'Partition of Bengal announced by Viceroy Lord Curzon — sparks the Swadeshi Movement',
    examNote: 'UPSC/TNPSC: Partition announced in 1905, annulled in 1911 by Lord Hardinge. Fostered Swadeshi & Boycott movements and emergence of Lal-Bal-Pal.',
    exams: [
      { name: 'UPSC GS-1', tagClass: 'bg-purple-100 text-purple-900' },
      { name: 'TNPSC Grp 1', tagClass: 'bg-rose-100 text-rose-900' }
    ]
  },
  {
    year: 1969,
    cat: 'Science & Computing',
    title: 'First communication link established on ARPANET — foundation of modern internet',
    examNote: 'SSC/Railway: ARPANET (1969) vs World Wide Web invented by Tim Berners-Lee at CERN (1989). Very common confusion point in computer awareness MCQs.',
    exams: [
      { name: 'SSC GK', tagClass: 'bg-emerald-100 text-emerald-900' },
      { name: 'Railway RRB', tagClass: 'bg-amber-100 text-amber-900' }
    ]
  },
  {
    year: 1956,
    cat: 'Indian Polity & Governance',
    title: 'States Reorganisation Act comes into force — Indian states reorganized on linguistic basis',
    examNote: 'TNPSC (critical): Fazl Ali Commission (State Reorganisation Commission 1953) members: Fazl Ali, H.N. Kunzru, K.M. Panikkar. Andhra was first linguistic state in 1953.',
    exams: [
      { name: 'TNPSC Group 1/2', tagClass: 'bg-rose-100 text-rose-900' },
      { name: 'UPSC GS-2', tagClass: 'bg-purple-100 text-purple-900' }
    ]
  }
];

const QUIZ_QUESTIONS: QuizQuestionItem[] = [
  {
    cat: 'Science & Medicine',
    q: 'Which scientist discovered penicillin in 1928 by noticing that mould killed bacteria in an unwashed petri dish?',
    opts: ['Marie Curie', 'Louis Pasteur', 'Alexander Fleming', 'Robert Koch'],
    ans: 2,
    exp: 'Alexander Fleming discovered penicillin in 1928 at St. Mary\'s Hospital, London. Howard Florey and Ernst Chain later purified it. All three shared the 1945 Nobel Prize in Medicine. Exam trick: Fleming discovered it, but Florey and Chain turned it into a usable drug.'
  },
  {
    cat: 'Modern Indian History',
    q: 'The Partition of Bengal in 1905 was enacted under which British Viceroy of India?',
    opts: ['Lord Dalhousie', 'Lord Curzon', 'Lord Mountbatten', 'Lord Minto'],
    ans: 1,
    exp: 'Lord Curzon announced the Partition of Bengal in 1905, dividing it into Eastern Bengal and Assam. It triggered mass protests and the Swadeshi Movement. The partition was revoked in 1911 by Lord Hardinge.'
  },
  {
    cat: 'Science & Aerospace',
    q: 'What is the designated name of ISRO’s autonomous winged Reusable Launch Vehicle technology demonstrator?',
    opts: ['Gaganyaan', 'Pushpak (RLV-TD)', 'PSLV-C57', 'Aditya-L1'],
    ans: 1,
    exp: 'ISRO’s winged Reusable Launch Vehicle (RLV-TD) is nicknamed "Pushpak." It has undergone successful landing experiments (LEX) at Chitradurga Aeronautical Test Range in Karnataka.'
  },
  {
    cat: 'Inventions & Tech',
    q: 'Alexander Graham Bell received his seminal patent for the electric telephone in which year?',
    opts: ['1864', '1869', '1876', '1882'],
    ans: 2,
    exp: 'Alexander Graham Bell was granted US Patent No. 174,465 for the telephone on March 7, 1876, famously speaking the words "Mr. Watson, come here, I want to see you" on March 10, 1876.'
  },
  {
    cat: 'Indian & World Economy',
    q: 'According to the IMF World Economic Outlook update, India ranks as the _____ largest economy globally by Purchasing Power Parity (PPP).',
    opts: ['2nd', '3rd', '4th', '5th'],
    ans: 1,
    exp: 'By Purchasing Power Parity (PPP), India is the 3rd largest economy in the world (behind USA and China). By nominal GDP, India ranks 5th globally.'
  }
];

export const ExamPrep = () => {
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [selectedGkTab, setSelectedGkTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isQuizComplete, setIsQuizComplete] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      showToast('⚠️ Please enter a valid email address.');
      return;
    }
    try {
      await factService.subscribe(emailInput.trim());
      setIsSubscribed(true);
      showToast('🎉 Subscribed successfully to FactHub Exam Weekly!');
    } catch {
      setIsSubscribed(true);
      showToast('🎉 Subscribed to FactHub Exam Weekly!');
    }
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === QUIZ_QUESTIONS[activeQuestionIndex].ans) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (activeQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setActiveQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsQuizComplete(true);
    }
  };

  const handleRestartQuiz = () => {
    setActiveQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsQuizComplete(false);
  };

  const filteredCurrentAffairs = CURRENT_AFFAIRS_DATA.filter(item => {
    const matchesExam = selectedExam === 'all' || item.exams.some(e => e.examCode === selectedExam);
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.examAngle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesExam && matchesSearch;
  });

  const filteredGkFacts = GK_FACTS_DATA.filter(item => {
    const matchesTab = selectedGkTab === 'all' || item.category === selectedGkTab;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const calculateDaysLeft = (targetDateStr: string) => {
    const target = new Date(targetDateStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-[#FFFDF5] text-ink min-h-screen font-sans selection:bg-gold selection:text-ink">
      <Helmet>
        <title>Exam Prep Hub — UPSC, SSC CGL, TNPSC, Railway & Banking | FactHub</title>
        <meta 
          name="description" 
          content="Daily current affairs, GK facts, exam-angle breakdown, and quizzes tailored for India's 3+ crore competitive exam students preparing for UPSC, SSC, TNPSC, Railway, and Banking." 
        />
      </Helmet>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#09142A] text-white px-5 py-3.5 rounded-2xl shadow-2xl border-l-4 border-gold text-sm font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles size={18} className="text-gold flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── TOP NOTIFICATION TICKER ── */}
      <div className="bg-[#1A56DB] text-white py-2 px-4 text-xs font-semibold overflow-hidden whitespace-nowrap border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="bg-amber-400 text-[#09142A] px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase tracking-wider">
              Exam Alert
            </span>
            <span className="font-bold">Live Updates:</span>
          </div>
          <div className="overflow-x-auto scrollbar-hide flex items-center gap-8 text-white/90 text-xs">
            <span>📚 UPSC Prelims 2026: 13,343 candidates qualified for Mains</span>
            <span className="text-amber-300">◆</span>
            <span>📋 SSC CGL 2026 Notification: 14,582 vacancies announced</span>
            <span className="text-amber-300">◆</span>
            <span>🏛 TNPSC Group 2 Notification scheduled for release in October</span>
            <span className="text-amber-300">◆</span>
            <span>🚂 RRB NTPC 2026: Application portal opens September 15</span>
            <span className="text-amber-300">◆</span>
            <span>🏦 IBPS PO Prelims 2026: Scheduled for October 18–19</span>
          </div>
        </div>
      </div>

      {/* ── EXAM HERO SECTION ── */}
      <section className="bg-[#09142A] text-white pt-10 pb-6 border-b border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end pb-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider">
                <GraduationCap size={15} />
                <span>FactHub Government Exam Portal</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-white leading-tight">
                GK · Current Affairs · History · Science <br className="hidden sm:inline" />
                For <span className="text-amber-400 italic">Every Competitive Exam</span>
              </h1>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-2xl">
                Daily current affairs with past-question exam angles, verified origin-story facts, weekly GK quizzes, and downloadable compendiums tailored for UPSC, SSC, TNPSC, Railway, and Banking aspirants.
              </p>
            </div>

            {/* Right side Today in GK Badge */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm flex items-center justify-between lg:justify-end gap-6 text-right">
              <div className="text-left lg:text-right">
                <div className="text-xs font-mono font-bold uppercase tracking-widest text-white/50">
                  {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
                <div className="text-3xl sm:text-4xl font-serif font-black text-amber-400 leading-none my-1">
                  {new Date().getDate()}
                </div>
                <div className="text-xs text-white/70 font-medium">Today in General Knowledge</div>
              </div>
              <div className="h-12 w-px bg-white/10 hidden sm:block"></div>
              <Link 
                to="/quiz" 
                className="bg-amber-400 hover:bg-amber-300 text-[#09142A] font-bold text-xs px-4 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2 text-center whitespace-nowrap"
              >
                <Zap size={15} />
                <span>Take Daily Quiz</span>
              </Link>
            </div>
          </div>

          {/* Exam Filter Pills */}
          <div className="pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-xs font-mono font-bold uppercase text-white/50 mr-2 flex-shrink-0">
              Filter by Exam:
            </span>
            <button
              onClick={() => { setSelectedExam('all'); showToast('Showing all competitive exams'); }}
              className={cn("px-4 py-2 rounded-full text-xs font-bold transition-all flex-shrink-0 uppercase tracking-wider", {
                "bg-amber-400 text-[#09142A] shadow-md scale-105": selectedExam === 'all',
                "bg-white/10 text-white/80 hover:bg-white/20 border border-white/10": selectedExam !== 'all'
              })}
            >
              All Exams
            </button>
            <button
              onClick={() => { setSelectedExam('upsc'); showToast('Filtered for UPSC Civil Services GS'); }}
              className={cn("px-4 py-2 rounded-full text-xs font-bold transition-all flex-shrink-0 uppercase tracking-wider", {
                "bg-purple-600 text-white shadow-md scale-105": selectedExam === 'upsc',
                "bg-purple-950/60 text-purple-200 hover:bg-purple-900 border border-purple-800": selectedExam !== 'upsc'
              })}
            >
              🏛 UPSC Civil Services
            </button>
            <button
              onClick={() => { setSelectedExam('ssc'); showToast('Filtered for SSC CGL / CHSL'); }}
              className={cn("px-4 py-2 rounded-full text-xs font-bold transition-all flex-shrink-0 uppercase tracking-wider", {
                "bg-emerald-600 text-white shadow-md scale-105": selectedExam === 'ssc',
                "bg-emerald-950/60 text-emerald-200 hover:bg-emerald-900 border border-emerald-800": selectedExam !== 'ssc'
              })}
            >
              📋 SSC CGL / CHSL
            </button>
            <button
              onClick={() => { setSelectedExam('tnpsc'); showToast('Filtered for TNPSC Groups 1, 2, 4'); }}
              className={cn("px-4 py-2 rounded-full text-xs font-bold transition-all flex-shrink-0 uppercase tracking-wider", {
                "bg-rose-600 text-white shadow-md scale-105": selectedExam === 'tnpsc',
                "bg-rose-950/60 text-rose-200 hover:bg-rose-900 border border-rose-800": selectedExam !== 'tnpsc'
              })}
            >
              🎯 TNPSC Groups
            </button>
            <button
              onClick={() => { setSelectedExam('rail'); showToast('Filtered for Railway RRB NTPC / Group D'); }}
              className={cn("px-4 py-2 rounded-full text-xs font-bold transition-all flex-shrink-0 uppercase tracking-wider", {
                "bg-amber-600 text-white shadow-md scale-105": selectedExam === 'rail',
                "bg-amber-950/60 text-amber-200 hover:bg-amber-900 border border-amber-800": selectedExam !== 'rail'
              })}
            >
              🚂 Railway RRB
            </button>
            <button
              onClick={() => { setSelectedExam('bank'); showToast('Filtered for Banking IBPS / SBI PO'); }}
              className={cn("px-4 py-2 rounded-full text-xs font-bold transition-all flex-shrink-0 uppercase tracking-wider", {
                "bg-blue-600 text-white shadow-md scale-105": selectedExam === 'bank',
                "bg-blue-950/60 text-blue-200 hover:bg-blue-900 border border-blue-800": selectedExam !== 'bank'
              })}
            >
              🏦 Banking IBPS / SBI
            </button>
          </div>
        </div>
      </section>

      {/* ── COUNTDOWN STRIP ── */}
      <div className="bg-[#0F2247] border-b border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide py-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-300 flex-shrink-0 flex items-center gap-1.5">
              <Clock size={13} />
              <span>Target Dates:</span>
            </span>
            {EXAM_COUNTDOWNS.map((exam) => {
              const daysLeft = calculateDaysLeft(exam.targetDate);
              return (
                <div 
                  key={exam.name}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 flex-shrink-0 text-center min-w-[130px] transition-all cursor-pointer"
                  onClick={() => showToast(`Official notification active for ${exam.name} (${exam.stage})`)}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">{exam.name}</div>
                  <div className="font-serif text-2xl font-black text-white leading-none my-0.5">
                    {daysLeft > 0 ? daysLeft : 'Active'}
                  </div>
                  <div className="text-[9px] font-mono text-white/50">{daysLeft > 0 ? 'days remaining' : 'in progress'}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT & SIDEBAR LAYOUT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* ═════════ LEFT MAIN COLUMN (8 COLS) ═════════ */}
          <div className="lg:col-span-8 space-y-12">

            {/* 1. TODAY'S CURRENT AFFAIRS WITH EXAM ANGLE */}
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#09142A] pb-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1A56DB] uppercase tracking-widest">
                    <span>📅 Daily Capsule</span>
                    <span>•</span>
                    <span>{todayFormatted}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#09142A]">
                    Today’s Must-Know Current Affairs
                  </h2>
                </div>
                <button
                  onClick={() => showToast('📥 Downloading September 2026 Current Affairs PDF Capsule…')}
                  className="bg-[#09142A] hover:bg-[#1A56DB] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all w-fit shadow"
                >
                  <Download size={14} />
                  <span>Download Month PDF</span>
                </button>
              </div>

              {/* Banner Highlight */}
              <div className="bg-gradient-to-br from-[#09142A] to-[#0F2247] rounded-3xl p-6 sm:p-7 text-white border border-white/10 shadow-lg space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="bg-amber-400/20 text-amber-300 px-3 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider border border-amber-400/30">
                    High Yield Exam News
                  </span>
                  <span className="text-xs text-white/50 font-mono">Curated from The Hindu, PIB & Indian Express</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white leading-snug">
                  6 Core Events Tagged with Questions Pattern & Trap Pitfalls
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  Every news item below includes an <strong className="text-amber-400">"Exam Angle"</strong> breaking down how UPSC GS, SSC CGL, TNPSC, and Banking examiners convert standard news into trick multiple-choice questions.
                </p>
              </div>

              {/* Current Affairs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredCurrentAffairs.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-white rounded-2xl border border-black/10 p-5 shadow-sm hover:shadow-md hover:border-black/20 transition-all flex flex-col justify-between relative overflow-hidden group"
                  >
                    <span className="font-serif text-3xl font-black text-black/5 absolute top-3 right-4 select-none pointer-events-none">
                      {item.num}
                    </span>

                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.exams.map((ex, exIdx) => (
                          <span 
                            key={exIdx} 
                            className={cn("text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border", ex.tagClass)}
                          >
                            {ex.name}
                          </span>
                        ))}
                      </div>

                      <h4 className="font-serif font-bold text-base sm:text-lg text-ink group-hover:text-[#1A56DB] transition-colors leading-snug">
                        {item.title}
                      </h4>

                      <p className="text-xs text-ink2 leading-relaxed">
                        {item.body}
                      </p>

                      {/* Exam Angle Callout */}
                      <div className="bg-[#F7F3E8] border-l-4 border-amber-500 rounded-xl p-3.5 space-y-1">
                        <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800">
                          <Award size={12} className="text-amber-600" />
                          <span>Exam Angle & Key Trap</span>
                        </div>
                        <p className="text-xs text-ink leading-relaxed font-medium">
                          {item.examAngle}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-black/5 flex items-center justify-between text-[11px] text-ink3 font-mono">
                      <span>{item.date} • {item.source}</span>
                      <Link 
                        to={item.relatedArticleSlug ? `/category/${item.relatedArticleSlug}` : `/category/history`}
                        className="font-bold text-[#1A56DB] hover:underline flex items-center gap-1"
                      >
                        <span>Related Fact</span>
                        <ArrowUpRight size={13} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. GK FACT BANK & ORIGIN STORIES */}
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#09142A] pb-3">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#09142A]">
                    GK Fact Bank & Origin Stories
                  </h2>
                  <p className="text-xs text-ink3 mt-0.5">Foundational static general knowledge with full historical context</p>
                </div>
                <Link to="/category/history" className="text-xs font-bold text-[#1A56DB] hover:underline flex items-center gap-1">
                  <span>Browse all 500+ facts</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {[
                  { id: 'all', label: 'All Topics' },
                  { id: 'history', label: '🏛 History' },
                  { id: 'science', label: '🧬 Science' },
                  { id: 'space', label: '🪐 Space & Tech' },
                  { id: 'inventions', label: '💡 Inventions' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedGkTab(tab.id)}
                    className={cn("px-4 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap", {
                      "bg-[#09142A] text-white border-[#09142A] shadow-sm": selectedGkTab === tab.id,
                      "bg-white text-ink2 border-black/10 hover:bg-black/5": selectedGkTab !== tab.id
                    })}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Fact Bank Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {filteredGkFacts.map((fact) => (
                  <Link
                    key={fact.id}
                    to={`/category/${fact.slug}`}
                    className="bg-white rounded-2xl border border-black/10 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col group"
                  >
                    <div className={cn("h-24 flex items-center justify-center text-4xl", fact.thumbBg)}>
                      <span>{fact.emoji}</span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#1A56DB] font-mono">
                          {fact.topic}
                        </div>
                        <h4 className="font-serif font-bold text-sm text-ink group-hover:text-[#1A56DB] transition-colors leading-snug line-clamp-2">
                          {fact.title}
                        </h4>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-black/5">
                        <div className="flex flex-wrap gap-1">
                          {fact.exams.map((ex, exI) => (
                            <span key={exI} className="text-[9px] font-bold bg-[#F7F3E8] text-ink2 px-1.5 py-0.5 rounded border border-black/5">
                              {ex}
                            </span>
                          ))}
                        </div>
                        <div className="text-[10px] text-ink3 font-mono flex items-center justify-between">
                          <span>{fact.readTime}</span>
                          <span>{fact.views}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* 3. FEATURED EXAM ANGLE CASE STUDY */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 rounded-3xl border-2 border-amber-300 p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-[#09142A] flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                  🎯
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-900">
                    Featured Deep Dive Exam Angle
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif font-black text-[#09142A]">
                    Alexander Fleming’s Penicillin — How Questions Appear Across Exams
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-ink leading-relaxed pt-2">
                <div className="bg-white/80 p-4 rounded-2xl border border-amber-200 space-y-1">
                  <strong className="text-amber-950 font-bold block text-sm">UPSC Prelims Question Pattern:</strong>
                  <p className="text-ink2">
                    Appeared in Match-the-Following: "Scientist vs Discovery". <em>Trick:</em> Fleming discovered the mould in 1928, but did <strong>NOT</strong> purify it. Howard Florey and Ernst Chain purified it in 1941. All three shared the 1945 Nobel Prize.
                  </p>
                </div>

                <div className="bg-white/80 p-4 rounded-2xl border border-amber-200 space-y-1">
                  <strong className="text-amber-950 font-bold block text-sm">SSC CGL & Railway RRB Pattern:</strong>
                  <p className="text-ink2">
                    Tests year (1928), organism name (<em>Penicillium notatum</em> fungus), category (antibiotic). Very common 1-mark question in General Science section across Tier-1 exams.
                  </p>
                </div>

                <div className="bg-white/80 p-4 rounded-2xl border border-amber-200 space-y-1">
                  <strong className="text-amber-950 font-bold block text-sm">TNPSC Group 1 & 2 Focus:</strong>
                  <p className="text-ink2">
                    Tests the antibacterial mechanism (inhibiting bacterial cell wall synthesis / peptidoglycan cross-linking). Does not affect human cells because animal cells lack cell walls.
                  </p>
                </div>

                <div className="bg-white/80 p-4 rounded-2xl border border-amber-200 space-y-1">
                  <strong className="text-amber-950 font-bold block text-sm">Banking General Awareness:</strong>
                  <p className="text-ink2">
                    Questions on Nobel Laureates and milestone discovery centenaries. Penicillin discovery marks its 100th anniversary in 2028.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. ON THIS DAY IN HISTORY (EXAM EDITION) */}
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#09142A] pb-3">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#09142A]">
                    On This Day in History — Exam Milestones
                  </h2>
                  <p className="text-xs text-ink3 mt-0.5">Historical events mapped to standard Indian government exam questions</p>
                </div>
                <Link to="/birthdays" className="text-xs font-bold text-[#1A56DB] hover:underline flex items-center gap-1">
                  <span>View today’s famous birthdays</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              <div className="space-y-4">
                {HISTORY_EVENTS_DATA.map((event, evIdx) => (
                  <div 
                    key={evIdx}
                    className="bg-white rounded-2xl border border-black/10 p-5 sm:p-6 shadow-sm hover:border-amber-400 transition-all flex flex-col sm:flex-row items-start gap-5"
                  >
                    <div className="font-serif text-3xl font-black text-amber-500 min-w-[70px] flex-shrink-0 pt-0.5">
                      {event.year}
                    </div>

                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A56DB]">
                          {event.cat}
                        </span>
                        <div className="flex gap-1.5">
                          {event.exams.map((ex, exI) => (
                            <span key={exI} className={cn("text-[9px] font-bold px-2 py-0.5 rounded-md", ex.tagClass)}>
                              {ex.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <h4 className="font-serif font-bold text-base sm:text-lg text-ink">
                        {event.title}
                      </h4>

                      <p className="text-xs text-ink2 leading-relaxed bg-[#F7F3E8] p-3 rounded-xl border border-black/5 font-medium">
                        💡 <strong>Exam Insight:</strong> {event.examNote}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. INTERACTIVE WEEKLY GK QUIZ */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b-2 border-[#09142A] pb-3">
                <div>
                  <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#1A56DB]">
                    ⚡ Real-time Mock Test
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#09142A]">
                    Weekly GK & Current Affairs Quiz
                  </h2>
                </div>
                <div className="text-xs font-mono font-bold bg-[#F7F3E8] text-ink px-3 py-1.5 rounded-xl border border-black/10">
                  Week #1 Edition
                </div>
              </div>

              <div className="bg-[#09142A] text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-white/10">
                {!isQuizComplete ? (
                  <>
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="space-y-1">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-300">
                          {QUIZ_QUESTIONS[activeQuestionIndex].cat}
                        </span>
                        <div className="text-xs text-white/60">
                          Question {activeQuestionIndex + 1} of {QUIZ_QUESTIONS.length}
                        </div>
                      </div>

                      {/* Progress Dots */}
                      <div className="flex items-center gap-1.5">
                        {QUIZ_QUESTIONS.map((_, dotIdx) => (
                          <div 
                            key={dotIdx}
                            className={cn("w-2.5 h-2.5 rounded-full transition-all", {
                              "bg-amber-400 scale-125": dotIdx === activeQuestionIndex,
                              "bg-emerald-400": dotIdx < activeQuestionIndex,
                              "bg-white/20": dotIdx > activeQuestionIndex
                            })}
                          />
                        ))}
                      </div>
                    </div>

                    <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-relaxed">
                      {QUIZ_QUESTIONS[activeQuestionIndex].q}
                    </h3>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {QUIZ_QUESTIONS[activeQuestionIndex].opts.map((opt, optIdx) => {
                        const isSelected = selectedOption === optIdx;
                        const isCorrect = optIdx === QUIZ_QUESTIONS[activeQuestionIndex].ans;
                        
                        let btnStyle = "bg-white/5 hover:bg-white/15 border-white/10 text-white/90";
                        if (isAnswered) {
                          if (isCorrect) {
                            btnStyle = "bg-emerald-600/90 border-emerald-400 text-white font-bold";
                          } else if (isSelected) {
                            btnStyle = "bg-rose-600/90 border-rose-400 text-white font-bold";
                          } else {
                            btnStyle = "bg-white/5 border-white/5 text-white/40 opacity-60";
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={isAnswered}
                            onClick={() => handleSelectOption(optIdx)}
                            className={cn("p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center gap-3", btnStyle)}
                          >
                            <span className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation Box */}
                    {isAnswered && (
                      <div className="p-4 bg-white/10 border border-white/15 rounded-2xl text-xs sm:text-sm text-white/90 leading-relaxed space-y-1 animate-in fade-in">
                        <strong className="text-amber-300 font-bold block">💡 Explanation & Exam Note:</strong>
                        <p>{QUIZ_QUESTIONS[activeQuestionIndex].exp}</p>
                      </div>
                    )}

                    {/* Next / Action Button */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs font-mono text-white/50">
                        Score: <strong className="text-amber-300">{score}</strong> / {QUIZ_QUESTIONS.length}
                      </div>

                      {isAnswered && (
                        <button
                          onClick={handleNextQuestion}
                          className="bg-amber-400 hover:bg-amber-300 text-[#09142A] font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2"
                        >
                          <span>{activeQuestionIndex === QUIZ_QUESTIONS.length - 1 ? 'View Final Results' : 'Next Question'}</span>
                          <ChevronRight size={15} />
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  /* Quiz Result Screen */
                  <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-3xl mx-auto">
                      🏆
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-amber-400">
                      You Scored {score} / {QUIZ_QUESTIONS.length}!
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto leading-relaxed">
                      {score === 5 
                        ? 'Outstanding performance! You have exceptional mastery over current affairs and static GK.' 
                        : score >= 3 
                          ? 'Great effort! Review the detailed explanation notes to lock down potential exam traps.' 
                          : 'Good practice! Consistent revision of FactHub daily articles will dramatically boost your score.'}
                    </p>
                    <div className="pt-3 flex items-center justify-center gap-4">
                      <button
                        onClick={handleRestartQuiz}
                        className="bg-amber-400 hover:bg-amber-300 text-[#09142A] font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-lg"
                      >
                        Try Again
                      </button>
                      <Link
                        to="/quiz"
                        className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all border border-white/10"
                      >
                        Take Daily Live Quiz
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </section>

          </div>

          {/* ═════════ RIGHT SIDEBAR (4 COLS) ═════════ */}
          <aside className="lg:col-span-4 space-y-8">

            {/* Quick Search */}
            <div className="bg-white rounded-3xl border border-black/10 p-6 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-ink flex items-center gap-2">
                <Search size={18} className="text-[#1A56DB]" />
                <span>Search Exam Topics</span>
              </h3>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. penicillin, ISRO, Curzon..."
                  className="w-full bg-[#F7F3E8] border border-black/10 rounded-xl p-3 text-xs text-ink placeholder:text-ink3 focus:outline-none focus:border-[#1A56DB] transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-xs text-ink3 hover:text-ink"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink3">Popular Quick Filters:</div>
                <div className="flex flex-wrap gap-1.5">
                  {['Nobel Prize', 'ISRO Missions', 'First in India', 'Important Days', 'Bharat Ratna'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="text-[11px] bg-[#F7F3E8] hover:bg-amber-100 hover:text-amber-900 px-2.5 py-1 rounded-lg border border-black/5 font-medium transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Upcoming Exam Calendar Dates */}
            <div className="bg-white rounded-3xl border border-black/10 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg text-ink flex items-center gap-2">
                  <Calendar size={18} className="text-amber-600" />
                  <span>Upcoming Exam Dates</span>
                </h3>
                <span className="text-[10px] font-mono font-bold text-[#1A56DB] bg-blue-50 px-2 py-0.5 rounded">2026</span>
              </div>

              <div className="space-y-3 divide-y divide-black/5">
                {[
                  { date: 'Oct 18', title: 'IBPS PO Prelims 2026', exam: 'Banking', days: calculateDaysLeft('2026-10-18') },
                  { date: 'Oct 26', title: 'SSC CHSL Tier II Mains', exam: 'SSC', days: calculateDaysLeft('2026-10-26') },
                  { date: 'Nov 04', title: 'TNPSC Group 4 Notification', exam: 'TNPSC', days: calculateDaysLeft('2026-11-04') },
                  { date: 'Nov 15', title: 'RRB NTPC CBT-1 Registration', exam: 'Railway', days: calculateDaysLeft('2026-11-15') },
                  { date: 'Dec 01', title: 'UPSC Mains GS Examination', exam: 'UPSC', days: calculateDaysLeft('2026-12-01') }
                ].map((item, itemIdx) => (
                  <div key={itemIdx} className="pt-3 first:pt-0 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-ink">{item.title}</div>
                      <div className="text-[11px] text-ink3 font-mono">{item.exam}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-mono font-bold text-[#1A56DB] bg-blue-50 px-2 py-0.5 rounded text-[11px] block">
                        {item.date}
                      </span>
                      <span className="text-[10px] text-ink3 font-mono">{item.days} days left</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Free Study PDF Compilations */}
            <div className="bg-white rounded-3xl border border-black/10 p-6 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-ink flex items-center gap-2">
                <FileText size={18} className="text-emerald-700" />
                <span>Free Study PDFs</span>
              </h3>

              <div className="space-y-3">
                {[
                  { title: '500 Science Facts for SSC & Railway', size: '18 Pages · PDF', date: 'August 2026 Edition' },
                  { title: 'UPSC History Timeline (1857–1947)', size: '12 Pages · PDF', date: 'Modern India Focus' },
                  { title: '100 Inventions & Pioneers in GK', size: '8 Pages · PDF', date: 'High Yield GK' },
                  { title: 'TNPSC Science & Tamil Nadu GK', size: '10 Pages · PDF', date: 'State Board Aligned' }
                ].map((pdf, pIdx) => (
                  <div 
                    key={pIdx}
                    onClick={() => showToast(`📥 Downloading ${pdf.title}…`)}
                    className="p-3.5 bg-[#F7F3E8] hover:bg-emerald-50/60 rounded-2xl border border-black/5 hover:border-emerald-300 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="space-y-0.5 overflow-hidden">
                      <div className="font-bold text-xs text-ink group-hover:text-emerald-800 transition-colors truncate">
                        {pdf.title}
                      </div>
                      <div className="text-[10px] text-ink3 font-mono">{pdf.size}</div>
                    </div>
                    <span className="bg-[#09142A] group-hover:bg-emerald-700 text-white p-2 rounded-xl text-[10px] font-bold transition-colors flex-shrink-0">
                      <Download size={13} />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Newsletter Subscription */}
            <div className="bg-gradient-to-br from-[#09142A] to-[#0F2247] rounded-3xl p-6 text-white border border-white/10 shadow-lg space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300">
                  Weekly Digest
                </span>
                <h3 className="font-serif font-bold text-lg text-white">
                  FactHub Exam Weekly in Your Inbox
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  Get weekly current affairs capsule, top 10 exam-tested facts, and a 10-question mock test every Sunday morning for free.
                </p>
              </div>

              {!isSubscribed ? (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your email..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400 font-mono"
                  />
                  <button
                    type="submit"
                    className="w-full bg-amber-400 hover:bg-amber-300 text-[#09142A] font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Send size={13} />
                    <span>Subscribe Free</span>
                  </button>
                </form>
              ) : (
                <div className="bg-emerald-500/20 border border-emerald-400/40 p-4 rounded-2xl text-center space-y-1">
                  <div className="text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5">
                    <CheckCircle2 size={16} />
                    <span>Subscribed Successfully!</span>
                  </div>
                  <p className="text-[11px] text-white/70">Check your inbox this Sunday morning for the exam capsule.</p>
                </div>
              )}
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
};
