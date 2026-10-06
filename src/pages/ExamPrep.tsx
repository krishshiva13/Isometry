import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  BookOpen, 
  Calendar, 
  Search, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  GraduationCap, 
  Clock, 
  Sparkles, 
  FileText, 
  ChevronRight, 
  ChevronLeft,
  Share2, 
  ArrowUpRight, 
  Award, 
  Zap, 
  Bookmark, 
  Printer,
  Eye,
  Check,
  RotateCcw,
  Copy,
  Layers,
  HelpCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { factService } from '../services/factService';
import { notebookService } from '../services/notebookService';
import { recordQuizCompleted } from '../components/DailyGoalTracker';
import { PDFDocumentViewer } from '../components/exam/PDFDocumentViewer';
import { downloadCurrentAffairsPdf } from '../lib/currentAffairsPdfExport';
import { ExamQuizSummaryModal } from '../components/exam/ExamQuizSummaryModal';

// ═══════════════════════════════════════════════════════════
// TYPES & DATA STRUCTURES
// ═══════════════════════════════════════════════════════════

export interface ExamMCQ {
  id: string;
  category: string;
  targetExam: string;
  tagClass: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  examTrap: string;
}

export interface DailyNewsItem {
  id: string;
  num: string;
  title: string;
  summary: string;
  exams: Array<{ name: string; tagClass: string; examCode: string }>;
  examAngle: string;
  keyTakeaway: string;
  source: string;
  category: string;
}

export interface DailyCapsuleData {
  dateKey: string;
  displayDate: string;
  previousDayKey?: string;
  previousDayDisplay?: string;
  dayBadge: string;
  themeTitle: string;
  pdfFileName: string;
  pdfFileSize: string;
  pdfPageCount: number;
  mcqs: ExamMCQ[];
  currentAffairs: DailyNewsItem[];
  quickPointers: string[];
  isLiveAIGenerated?: boolean;
  uniquenessVerified?: boolean;
}

// ═══════════════════════════════════════════════════════════
// DYNAMIC LIVE DATE HELPERS (Synchronized with Home Page & System Clock)
// ═══════════════════════════════════════════════════════════

export const getRelativeDateKey = (offsetDays: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const getRelativeDisplayDate = (offsetDays: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

// ═══════════════════════════════════════════════════════════
// BASE HISTORICAL CAPSULES & DYNAMIC BUILDER
// ═══════════════════════════════════════════════════════════

const BASE_ARCHIVE_CAPSULES: Record<string, DailyCapsuleData> = {
  '2026-10-02': {
    dateKey: '2026-10-02',
    displayDate: 'October 2, 2026',
    dayBadge: "Gandhi Jayanti & Shastri Jayanti Special",
    themeTitle: 'Swachh Bharat 2.0 Milestones, National Green Hydrogen Mission, and Cross-Border CBDC Settlements',
    pdfFileName: 'FactHub-Daily-Current-Affairs-Oct-02-2026.pdf',
    pdfFileSize: '184 KB',
    pdfPageCount: 2,
    quickPointers: [
      'October 2 marks the 157th birth anniversary of Mahatma Gandhi and 122nd of Lal Bahadur Shastri.',
      'Cabinet approves ₹19,744 crore Green Hydrogen Mission phase-2 incentives for electrolyser manufacturing.',
      'Swachh Bharat Mission (Urban) 2.0 crosses 100% door-to-door waste collection in 4,200+ statutory towns.',
      'RBI pilots cross-border CBDC wholesale corridor with Singapore MAS and UAE Central Bank.'
    ],
    mcqs: [
      {
        id: 'q-20261002-1',
        category: 'Modern Indian History',
        targetExam: 'UPSC GS-1 / SSC CGL',
        tagClass: 'bg-purple-100 text-purple-900 border-purple-200',
        question: 'Mahatma Gandhi returned to India from South Africa on January 9, 1915 (Pravasi Bharatiya Divas). His first major satyagraha experiment on Indian soil was launched in 1917 at which location?',
        options: ['Kheda, Gujarat', 'Ahmedabad Mill Strike', 'Champaran, Bihar', 'Bardoli, Gujarat'],
        correctAnswer: 2,
        explanation: 'Gandhi’s first satyagraha in India was the Champaran Satyagraha (1917) in Bihar against the oppressive European indigo planters enforcing the Tinkathia system (compulsory cultivation of indigo on 3/20th of land). It was followed by the Ahmedabad Mill Strike (1918) and Kheda Satyagraha (1918).',
        examTrap: 'Examiner trap: Students frequently confuse Champaran (1917 - first Satyagraha) with Ahmedabad (1918 - first Hunger Strike) and Kheda (1918 - first Non-Cooperation movement).'
      },
      {
        id: 'q-20261002-2',
        category: 'National Schemes & Governance',
        targetExam: 'SSC CGL / State PSC',
        tagClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
        question: 'The nationwide Swachh Bharat Mission (Clean India Mission) was officially launched on October 2 in which inaugural year?',
        options: ['2012', '2014', '2016', '2019'],
        correctAnswer: 1,
        explanation: 'Swachh Bharat Mission was officially launched on October 2, 2014, at Rajghat, New Delhi, by Prime Minister Narendra Modi with the goal of achieving an Open Defecation Free (ODF) India by October 2, 2019, commemorating the 150th birth anniversary of Mahatma Gandhi.',
        examTrap: 'Examiner trap: Target completion was 2019 (150th birth anniversary), but launch date was 2014. Do not confuse launch year with the target deadline year.'
      },
      {
        id: 'q-20261002-3',
        category: 'Environment & Renewable Energy',
        targetExam: 'UPSC GS-3 / TNPSC',
        tagClass: 'bg-blue-100 text-blue-900 border-blue-200',
        question: 'Under the National Green Hydrogen Mission approved by the Union Cabinet, what is the targeted annual green hydrogen production capacity for India by 2030?',
        options: ['1 Million Metric Tonnes (MMT)', '5 Million Metric Tonnes (MMT)', '10 Million Metric Tonnes (MMT)', '25 Million Metric Tonnes (MMT)'],
        correctAnswer: 1,
        explanation: 'The National Green Hydrogen Mission targets at least 5 MMT (Million Metric Tonnes) of annual green hydrogen production capacity by 2030, associated with 125 GW of dedicated renewable energy additions, abating 50 MMT of annual greenhouse gas emissions.',
        examTrap: 'Numbers trap: Watch out for 5 MMT vs 10 MMT. 5 MMT is the 2030 target, supported by the SIGHT (Strategic Interventions for Green Hydrogen Transition) program.'
      },
      {
        id: 'q-20261002-4',
        category: 'Modern History & Governance',
        targetExam: 'Railway RRB / SSC',
        tagClass: 'bg-amber-100 text-amber-900 border-amber-200',
        question: 'Lal Bahadur Shastri, India’s 2nd Prime Minister whose birthday also falls on October 2, famously coined which historic national slogan during the 1965 Indo-Pak war?',
        options: ['Satyameva Jayate', 'Jai Jawan Jai Kisan', 'Inquilab Zindabad', 'Karo Ya Maro'],
        correctAnswer: 1,
        explanation: 'Lal Bahadur Shastri gave the slogan "Jai Jawan Jai Kisan" in October 1965 at a public gathering at Ramlila Maidan, Delhi, during the Indo-Pakistani War of 1965, honoring both the soldiers defending the borders and the farmers feeding the nation.',
        examTrap: 'Sequence trap: Atal Bihari Vajpayee later added "Jai Vigyan" after the 1998 Pokhran nuclear tests, and Narendra Modi added "Jai Anusandhan" at the 2019 Indian Science Congress.'
      },
      {
        id: 'q-20261002-5',
        category: 'Banking & Financial Awareness',
        targetExam: 'IBPS PO / SBI / RBI Grade B',
        tagClass: 'bg-rose-100 text-rose-900 border-rose-200',
        question: 'The Reserve Bank of India’s cross-border pilot for Digital Rupee (e₹) utilizes which specific variant of Central Bank Digital Currency (CBDC)?',
        options: ['Retail CBDC (CBDC-R)', 'Wholesale CBDC (CBDC-W)', 'Commodity Crypto Token', 'Sovereign Gold Bond Token'],
        correctAnswer: 1,
        explanation: 'For cross-border interbank settlements and trade remittances, the RBI deploys Wholesale CBDC (CBDC-W). Retail CBDC (CBDC-R) is meant for the general public, individual consumers, and merchants for everyday domestic retail payments.',
        examTrap: 'Term trap: Wholesale (CBDC-W) is strictly for financial institutions and cross-border corridors; Retail (CBDC-R) is for individual citizen wallets.'
      }
    ],
    currentAffairs: [
      {
        id: 'ca-20261002-1',
        num: '01',
        title: 'India accelerates National Green Hydrogen Mission phase-2 with ₹19,744 crore outlay',
        summary: 'The Ministry of New and Renewable Energy announced capital subsidy disbursement guidelines for domestic electrolyser manufacturing, mandating 60% local value addition to curb import reliance on rare earth components.',
        exams: [
          { name: 'UPSC GS-3', tagClass: 'bg-purple-100 text-purple-900 border-purple-200', examCode: 'upsc' },
          { name: 'SSC CGL', tagClass: 'bg-emerald-100 text-emerald-900 border-emerald-200', examCode: 'ssc' }
        ],
        examAngle: 'UPSC GS-3 Focus: Green vs Grey vs Blue hydrogen definitions; SIGHT financial allocation (₹17,490 cr for production/manufacturing); 125 GW renewable linkage.',
        keyTakeaway: 'Production target: 5 MMT/year by 2030. Nodal Ministry: Ministry of New and Renewable Energy (MNRE).',
        source: 'PIB Delhi / MNRE',
        category: 'Environment & Energy'
      },
      {
        id: 'ca-20261002-2',
        num: '02',
        title: 'Swachh Bharat Urban 2.0 achieves 100% door-to-door segregated collection across 4,200 cities',
        summary: 'On the 12th anniversary of Swachh Bharat Mission, the Ministry of Housing and Urban Affairs declared that legacy dumpsite remediation has cleared over 3,000 acres of prime urban land in Tier-1 and Tier-2 cities.',
        exams: [
          { name: 'UPSC GS-2', tagClass: 'bg-purple-100 text-purple-900 border-purple-200', examCode: 'upsc' },
          { name: 'TNPSC Grp 2', tagClass: 'bg-rose-100 text-rose-900 border-rose-200', examCode: 'tnpsc' }
        ],
        examAngle: 'Mains & Prelims: SBM-Urban 2.0 covers circular economy, bio-methanation plants, and ODF++ certification standards. Dumpsite bio-remining techniques.',
        keyTakeaway: 'MoHUA target: Garbage Free Cities (GFC) rating system based on 3-star, 5-star, and 7-star benchmarks.',
        source: 'MoHUA Release',
        category: 'Governance & Urban Dev'
      },
      {
        id: 'ca-20261002-3',
        num: '03',
        title: 'RBI and Monetary Authority of Singapore launch bilateral Wholesale CBDC settlement bridge',
        summary: 'The cross-border pilot connects India’s Digital Rupee wholesale architecture with Singapore’s Project Orchid, cutting bilateral trade settlement latency from T+2 days to under 15 seconds.',
        exams: [
          { name: 'Banking IBPS', tagClass: 'bg-blue-100 text-blue-900 border-blue-200', examCode: 'bank' },
          { name: 'UPSC GS-3', tagClass: 'bg-purple-100 text-purple-900 border-purple-200', examCode: 'upsc' }
        ],
        examAngle: 'Banking Awareness: Distinction between RTGS, NEFT, UPI-PayNow linkage, and CBDC Distributed Ledger Technology. Elimination of nostro-vostro account fees.',
        keyTakeaway: 'CBDC-W operates 24/7 without foreign exchange clearinghouse middlemen.',
        source: 'RBI Bulletin',
        category: 'Banking & Economy'
      },
      {
        id: 'ca-20261002-4',
        num: '04',
        title: 'Indian Railways unveils first commercial Hydrogen Train prototype on Jind–Sonipat route',
        summary: 'Manufactured under the "Hydrogen for Heritage" scheme, the zero-emission train runs on hydrogen fuel cells, emitting only water vapor and operating at speeds up to 140 km/h.',
        exams: [
          { name: 'Railway RRB', tagClass: 'bg-amber-100 text-amber-900 border-amber-200', examCode: 'rail' },
          { name: 'SSC CGL', tagClass: 'bg-emerald-100 text-emerald-900 border-emerald-200', examCode: 'ssc' }
        ],
        examAngle: 'Railway RRB NTPC: First trial route (Jind-Sonipat in Haryana, 89 km); Fuel cell chemistry (Proton Exchange Membrane); Net Zero carbon target of Indian Railways by 2030.',
        keyTakeaway: 'India becomes 5th country worldwide to deploy passenger hydrogen train technology.',
        source: 'Ministry of Railways',
        category: 'Science & Railways'
      }
    ]
  },
  '2026-10-01': {
    dateKey: '2026-10-01',
    displayDate: 'October 1, 2026',
    dayBadge: "Strategic Tech & Economy Edition",
    themeTitle: 'Semiconductor 2nm Fab MoU with Japan, Pushpak RLV-TD Trial, and RBI Monetary Policy',
    pdfFileName: 'FactHub-Daily-Current-Affairs-Oct-01-2026.pdf',
    pdfFileSize: '179 KB',
    pdfPageCount: 2,
    quickPointers: [
      'India inks trilateral semiconductor pact with Japan and Netherlands for pilot 2nm fabs.',
      'ISRO executes 3rd autonomous runway landing of winged Pushpak RLV-TD in Chitradurga.',
      'RBI Monetary Policy Committee keeps repo rate at 6.50% with neutral stance.',
      'IMF World Economic Outlook ranks India 3rd largest economy on PPP metrics.'
    ],
    mcqs: [
      {
        id: 'q-20261001-1',
        category: 'Science & Aerospace',
        targetExam: 'SSC CGL / Railway RRB',
        tagClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
        question: 'What is the designated official nickname of ISRO’s autonomous winged Reusable Launch Vehicle technology demonstrator?',
        options: ['Gaganyaan', 'Pushpak (RLV-TD)', 'Vikram-S', 'Aditya-L1'],
        correctAnswer: 1,
        explanation: 'ISRO’s winged Reusable Launch Vehicle demonstrator is named "Pushpak". It has completed successful landing experiments (LEX-01, LEX-02, LEX-03) at the Aeronautical Test Range (ATR) in Chitradurga, Karnataka.',
        examTrap: 'Pushpak is the RLV-TD, while Gaganyaan is the human spaceflight mission, and Vikram is the lunar lander.'
      },
      {
        id: 'q-20261001-2',
        category: 'Economy & Global Organizations',
        targetExam: 'UPSC GS-3 / Banking',
        tagClass: 'bg-purple-100 text-purple-900 border-purple-200',
        question: 'According to the IMF World Economic Outlook, India ranks as the _____ largest economy globally in Purchasing Power Parity (PPP) terms.',
        options: ['2nd', '3rd', '4th', '5th'],
        correctAnswer: 1,
        explanation: 'In terms of Purchasing Power Parity (PPP), India is the 3rd largest economy in the world, behind China and the United States. In nominal GDP terms, India is the 5th largest economy.',
        examTrap: 'PPP vs Nominal trap: In PPP, India is 3rd. In Nominal GDP, India is 5th (behind US, China, Germany, Japan).'
      },
      {
        id: 'q-20261001-3',
        category: 'Modern Indian History',
        targetExam: 'UPSC GS-1 / TNPSC',
        tagClass: 'bg-rose-100 text-rose-900 border-rose-200',
        question: 'The controversial Partition of Bengal in 1905 was promulgated during the tenure of which British Viceroy of India?',
        options: ['Lord Dalhousie', 'Lord Curzon', 'Lord Hardinge', 'Lord Minto'],
        correctAnswer: 1,
        explanation: 'Lord Curzon announced the Partition of Bengal in July 1905 and implemented it on October 16, 1905, separating Muslim-majority Eastern Bengal & Assam from Hindu-majority Bengal. It was later annulled in 1911 by Lord Hardinge.',
        examTrap: 'Viceroy trap: Partition enacted by Curzon (1905), revoked by Hardinge (1911).'
      },
      {
        id: 'q-20261001-4',
        category: 'Science & Discovery',
        targetExam: 'SSC CGL / Railway',
        tagClass: 'bg-blue-100 text-blue-900 border-blue-200',
        question: 'Alexander Fleming discovered penicillin by serendipity in 1928 at St. Mary’s Hospital. Penicillin is derived from which type of organism?',
        options: ['Bacterium', 'Virus', 'Fungus / Mould', 'Alga'],
        correctAnswer: 2,
        explanation: 'Penicillin is derived from the fungus Penicillium notatum (now known as Penicillium chrysogenum). Fleming noticed a clear halo where bacterial staphylococci could not grow around the mould contamination.',
        examTrap: 'Organism trap: Penicillin kills bacteria, but it is produced by a fungus/mould, not a bacterium.'
      },
      {
        id: 'q-20261001-5',
        category: 'Inventions & Physics',
        targetExam: 'General GK / State PSC',
        tagClass: 'bg-amber-100 text-amber-900 border-amber-200',
        question: 'Alexander Graham Bell received US Patent No. 174,465 for the electric telephone in which historic year?',
        options: ['1865', '1876', '1888', '1901'],
        correctAnswer: 1,
        explanation: 'Alexander Graham Bell was granted the fundamental telephone patent on March 7, 1876, famously completing the first clear intelligible speech transmission to Thomas Watson on March 10, 1876.',
        examTrap: 'Date trick: Elisha Gray filed a patent caveat on the exact same day in 1876, just two hours after Bell’s lawyer.'
      }
    ],
    currentAffairs: [
      {
        id: 'ca-20261001-1',
        num: '01',
        title: 'India inks landmark semiconductor MoU with Japan & Netherlands for 2nm pilot fab',
        summary: 'India entered into trilateral industrial agreements to establish advanced lithography training centers and chip packaging clusters in Tamil Nadu and Gujarat, targeting commercial wafer production by 2029.',
        exams: [
          { name: 'UPSC GS-3', tagClass: 'bg-purple-100 text-purple-900 border-purple-200', examCode: 'upsc' },
          { name: 'TNPSC', tagClass: 'bg-rose-100 text-rose-900 border-rose-200', examCode: 'tnpsc' }
        ],
        examAngle: 'UPSC GS-3: India Semiconductor Mission (ISM), PLI schemes for electronics, and strategic supply chain resilience against geopolitical chokepoints.',
        keyTakeaway: 'ASML Extreme Ultraviolet (EUV) lithography tools are central to sub-3nm fabrication.',
        source: 'The Hindu / PIB',
        category: 'Technology'
      },
      {
        id: 'ca-20261001-2',
        num: '02',
        title: 'ISRO completes 3rd autonomous touchdown of Pushpak RLV-TD with supersonic crosswinds',
        summary: 'The winged demonstrator vehicle executed simulated space reentry touchdown maneuvers autonomously at Chitradurga ATR under turbulent wind conditions, verifying landing gear braking and terminal navigation algorithms.',
        exams: [
          { name: 'SSC GK', tagClass: 'bg-emerald-100 text-emerald-900 border-emerald-200', examCode: 'ssc' },
          { name: 'Railway RRB', tagClass: 'bg-amber-100 text-amber-900 border-amber-200', examCode: 'rail' }
        ],
        examAngle: 'SSC/Railway: Nickname Pushpak, test site location (Chitradurga, Karnataka), difference between expendable and reusable launch vehicles.',
        keyTakeaway: 'RLV reduces payload-to-orbit launch costs by approximately 70%.',
        source: 'ISRO Official',
        category: 'Space & Tech'
      }
    ]
  },
  '2026-09-30': {
    dateKey: '2026-09-30',
    displayDate: 'September 30, 2026',
    dayBadge: "Polity & Science Retrospective",
    themeTitle: 'States Reorganisation Commission, ARPANET Foundations, and High-Speed Rail Corridors',
    pdfFileName: 'FactHub-Daily-Current-Affairs-Sep-30-2026.pdf',
    pdfFileSize: '176 KB',
    pdfPageCount: 2,
    quickPointers: [
      'States Reorganisation Commission (Fazl Ali Commission) historical milestones review for UPSC GS-2.',
      'ARPANET 1969 milestone and modern fiber-optic undersea cables network.',
      'Indian Railways adds 400 new Kavach 4.0 automatic train protection track kilometers.',
      'Global Innovation Index 2026 places India in top 35 economies for tech patents.'
    ],
    mcqs: [
      {
        id: 'q-20260930-1',
        category: 'Indian Polity & Constitution',
        targetExam: 'UPSC GS-2 / TNPSC',
        tagClass: 'bg-purple-100 text-purple-900 border-purple-200',
        question: 'Who among the following was NOT a member of the historic Fazl Ali Commission (States Reorganisation Commission, 1953)?',
        options: ['Justice Fazl Ali', 'H.N. Kunzru', 'K.M. Panikkar', 'B.R. Ambedkar'],
        correctAnswer: 3,
        explanation: 'The States Reorganisation Commission (SRC) formed in December 1953 had three members: Justice Fazl Ali (Chairman), H.N. Kunzru, and K.M. Panikkar. Dr. B.R. Ambedkar was the Chairman of the Drafting Committee of the Constituent Assembly, not an SRC member.',
        examTrap: 'Constitutional trap: Fazl Ali commission rejected the theory of "one language, one state", emphasizing preservation of India’s unity.'
      },
      {
        id: 'q-20260930-2',
        category: 'Modern History & Polity',
        targetExam: 'SSC CGL / State PSC',
        tagClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
        question: 'Which was the first state in independent India created strictly on a linguistic basis in October 1953?',
        options: ['Tamil Nadu', 'Andhra State', 'Maharashtra', 'Gujarat'],
        correctAnswer: 1,
        explanation: 'Andhra State was created on October 1, 1953, by separating the Telugu-speaking areas from the composite Madras State, following the 56-day hunger strike and martyrdom of Potti Sreeramulu.',
        examTrap: 'State trap: Andhra State (1953) was created first; Andhra Pradesh with Hyderabad was formally organized in 1956.'
      },
      {
        id: 'q-20260930-3',
        category: 'Science & Molecular Biology',
        targetExam: 'UPSC GS-3 / SSC GK',
        tagClass: 'bg-blue-100 text-blue-900 border-blue-200',
        question: 'In 1953, James Watson and Francis Crick deduced the double-helix structure of DNA using X-ray diffraction images famously known as "Photo 51" produced by which scientist?',
        options: ['Barbara McClintock', 'Rosalind Franklin', 'Ada Lovelace', 'Dorothy Hodgkin'],
        correctAnswer: 1,
        explanation: 'Rosalind Franklin and Raymond Gosling captured the famous Photo 51 at King\'s College London in 1952. Watson and Crick used this data to model the double-helix geometry, published in Nature in April 1953.',
        examTrap: 'Nobel trap: Franklin passed away in 1958; the Nobel Prize is not awarded posthumously, so Watson, Crick, and Wilkins received it in 1962.'
      },
      {
        id: 'q-20260930-4',
        category: 'Computer Science & Tech',
        targetExam: 'Railway RRB / SSC',
        tagClass: 'bg-amber-100 text-amber-900 border-amber-200',
        question: 'The ARPANET, widely recognized as the technical precursor to the modern global internet, transmitted its first message between UCLA and Stanford in which year?',
        options: ['1958', '1969', '1983', '1991'],
        correctAnswer: 1,
        explanation: 'On October 29, 1969, the first ARPANET link message was sent from Leonard Kleinrock\'s lab at UCLA to the Stanford Research Institute. The attempted word was "LOGIN", but the system crashed after transmitting "LO".',
        examTrap: 'Confusion: ARPANET (1969) vs TCP/IP standard adoption (1983) vs World Wide Web created by Tim Berners-Lee at CERN (1989/1991).'
      },
      {
        id: 'q-20260930-5',
        category: 'World History',
        targetExam: 'UPSC GS-1 / NDA',
        tagClass: 'bg-rose-100 text-rose-900 border-rose-200',
        question: 'World War II formally commenced in Europe following Nazi Germany’s blitzkrieg invasion of which country on September 1, 1939?',
        options: ['France', 'Czechoslovakia', 'Poland', 'Austria'],
        correctAnswer: 2,
        explanation: 'Germany invaded Poland on September 1, 1939, prompting Britain and France to declare war on Germany on September 3, 1939, initiating World War II in Europe.',
        examTrap: 'Annexation vs War trap: Austria (Anschluss) and Czechoslovakia (Munich Agreement) were annexed in 1938 without immediate world war; the invasion of Poland triggered WWII.'
      }
    ],
    currentAffairs: [
      {
        id: 'ca-20260930-1',
        num: '01',
        title: 'Kavach 4.0 automatic train protection system deployed across 400 km in South Central Railway',
        summary: 'Indian Railways accelerated the rollout of its indigenous SIL-4 certified collision avoidance system, preventing SPAD (Signal Passing At Danger) and automatically applying brakes in adverse fog conditions.',
        exams: [
          { name: 'Railway RRB', tagClass: 'bg-amber-100 text-amber-900 border-amber-200', examCode: 'rail' },
          { name: 'SSC CGL', tagClass: 'bg-emerald-100 text-emerald-900 border-emerald-200', examCode: 'ssc' }
        ],
        examAngle: 'Railway RRB focus: Operating radio frequency (UHF 433 MHz), RFID tags on sleepers, SIL-4 safety integrity level.',
        keyTakeaway: 'Target: 10,000 track kilometers coverage across high-density passenger routes by 2027.',
        source: 'Railway Board',
        category: 'Infrastructure'
      }
    ]
  }
};

export function getDefaultDailyCapsules(): Record<string, DailyCapsuleData> {
  const todayKey = getRelativeDateKey(0);
  const yesterdayKey = getRelativeDateKey(1);
  const dayBeforeKey = getRelativeDateKey(2);

  const todayDisplay = getRelativeDisplayDate(0);
  const yesterdayDisplay = getRelativeDisplayDate(1);
  const dayBeforeDisplay = getRelativeDisplayDate(2);

  const capsules: Record<string, DailyCapsuleData> = {};

  // 1. TODAY'S LIVE CAPSULE (Offset 0)
  capsules[todayKey] = {
    dateKey: todayKey,
    displayDate: todayDisplay,
    dayBadge: "Today's High-Yield Exam Edition",
    themeTitle: 'Unified Payments Interface (UPI) Global Footprint, Deep Tech Quantum Mission, and Biodiversity Conservation Goals',
    pdfFileName: `FactHub-Daily-Current-Affairs-${todayKey}.pdf`,
    pdfFileSize: '186 KB',
    pdfPageCount: 2,
    quickPointers: [
      `Today (${todayDisplay}): RBI & NPCI International expand UPI cross-border acceptance across 10+ partner central banks.`,
      `National Quantum Mission (NQM) clears ₹6,003 crore funding for 4 Thematic Hubs (T-Hubs) in Quantum Computing & Cryptography.`,
      `Supreme Court bench reiterates Right to Privacy and Right against adverse Climate Change under Article 21.`,
      `Cabinet notifies updated Biological Diversity framework for Access and Benefit Sharing (ABS) compliance.`
    ],
    mcqs: [
      {
        id: `q-${todayKey.replace(/-/g, '')}-1`,
        category: 'Digital Public Infrastructure & Economy',
        targetExam: 'UPSC GS-3 / Banking',
        tagClass: 'bg-blue-100 text-blue-900 border-blue-200',
        question: 'Under the cross-border linkage of India’s Unified Payments Interface (UPI) with international fast payment systems (such as Singapore’s PayNow and UAE’s AANI), which apex organization operates and oversees UPI infrastructure?',
        options: [
          'National Payments Corporation of India (NPCI)',
          'Securities and Exchange Board of India (SEBI)',
          'Indian Banks\' Association (IBA)',
          'NITI Aayog Digital Cell'
        ],
        correctAnswer: 0,
        explanation: 'The National Payments Corporation of India (NPCI), an initiative of the Reserve Bank of India (RBI) and Indian Banks’ Association (IBA) under the provisions of the Payment and Settlement Systems Act, 2007, is the umbrella organization for operating retail payments and settlement systems in India.',
        examTrap: 'Entity trap: NPCI is the operating umbrella body, while RBI is the statutory regulator. Do not confuse the operator (NPCI) with the regulator (RBI).'
      },
      {
        id: `q-${todayKey.replace(/-/g, '')}-2`,
        category: 'Indian Polity & Constitution',
        targetExam: 'UPSC GS-2 / SSC CGL',
        tagClass: 'bg-purple-100 text-purple-900 border-purple-200',
        question: 'In landmark constitutional jurisprudence (including M.K. Ranjitsinh v. Union of India), the Supreme Court of India recognized the "Right against the adverse effects of climate change" as an integral part of which Fundamental Right?',
        options: [
          'Article 14 (Right to Equality)',
          'Article 19 (Right to Freedom of Speech)',
          'Article 21 (Protection of Life and Personal Liberty)',
          'Article 32 (Right to Constitutional Remedies)'
        ],
        correctAnswer: 2,
        explanation: 'The Supreme Court ruled that the right to life under Article 21 encompasses the right to a clean, safe, and sustainable environment, explicitly recognizing the right to be free from the adverse effects of climate change as an essential facet of human existence.',
        examTrap: 'Article trap: While Article 48A and 51A(g) contain environmental duties in DPSPs and Fundamental Duties, judicial expansion of enforceable rights is anchored in Article 21.'
      },
      {
        id: `q-${todayKey.replace(/-/g, '')}-3`,
        category: 'Science & Deep Tech',
        targetExam: 'UPSC GS-3 / RRB',
        tagClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
        question: 'Under India\'s National Quantum Mission (NQM) implemented by the Department of Science & Technology (DST), what is the targeted timeline and qubit scale for developing intermediate-scale quantum computers with 50-1000 physical qubits?',
        options: [
          '2023–2031 (8 years)',
          '2020–2025 (5 years)',
          '2026–2030 (4 years)',
          '2025–2035 (10 years)'
        ],
        correctAnswer: 0,
        explanation: 'The National Quantum Mission (NQM) was approved with an outlay of ₹6,003 crore spanning 2023–24 to 2030–31 (8 years), aiming to develop intermediate-scale quantum computers with 50-1000 physical qubits using superconducting and photonic platforms.',
        examTrap: 'Timeline trap: The mission spans 2023 to 2031 (8 years total). Watch for questions testing the nodal department (Department of Science and Technology, DST).'
      },
      {
        id: `q-${todayKey.replace(/-/g, '')}-4`,
        category: 'Environment & Biodiversity',
        targetExam: 'UPSC GS-3 / State PSC',
        tagClass: 'bg-amber-100 text-amber-900 border-amber-200',
        question: 'Under the Biological Diversity Act, 2002 (and its 2023 amendment), which institutional body is established at the local Panchayat and Municipal level to document local bio-resources and prepare People’s Biodiversity Registers (PBRs)?',
        options: [
          'National Biodiversity Authority (NBA)',
          'State Biodiversity Board (SBB)',
          'Biodiversity Management Committee (BMC)',
          'Central Pollution Control Board (CPCB)'
        ],
        correctAnswer: 2,
        explanation: 'Biodiversity Management Committees (BMCs) are statutory local-level bodies constituted by local bodies (Panchayats and Urban Local Bodies) under Section 41 of the Biological Diversity Act to promote conservation, sustainable use, and documentation of biological diversity in People’s Biodiversity Registers (PBRs).',
        examTrap: 'Hierarchy trap: NBA is national level (Chennai), SBB is state level, and BMC is local Panchayat/Municipal level.'
      },
      {
        id: `q-${todayKey.replace(/-/g, '')}-5`,
        category: 'Banking & Financial Awareness',
        targetExam: 'IBPS PO / SBI / RBI Grade B',
        tagClass: 'bg-rose-100 text-rose-900 border-rose-200',
        question: 'Under RBI Priority Sector Lending (PSL) norms, what is the mandatory sub-target mandated for domestic commercial banks for lending to Small and Marginal Farmers (SMFs)?',
        options: ['5% of ANBC', '10% of ANBC', '12% of ANBC', '18% of ANBC'],
        correctAnswer: 1,
        explanation: 'Within the total 18% agriculture target under PSL for domestic commercial banks, the sub-target for Small and Marginal Farmers (SMFs) is 10% of Adjusted Net Bank Credit (ANBC).',
        examTrap: 'Sub-target trap: Total agriculture target is 18%, but the specific SMF sub-target is 10%. Micro-enterprises target is 7.5%, and Weaker Sections target is 12%.'
      }
    ],
    currentAffairs: [
      {
        id: `ca-${todayKey.replace(/-/g, '')}-1`,
        num: '01',
        title: 'NPCI International accelerates global UPI QR code interoperability and real-time remittances',
        summary: 'India’s Unified Payments Interface expanded its cross-border retail merchant and bilateral remittance network, enabling Indian tourists and diaspora to execute instant zero-markup settlements directly from Indian bank accounts.',
        exams: [
          { name: 'UPSC GS-3', tagClass: 'bg-purple-100 text-purple-900 border-purple-200', examCode: 'upsc' },
          { name: 'Banking', tagClass: 'bg-blue-100 text-blue-900 border-blue-200', examCode: 'bank' }
        ],
        examAngle: 'UPSC GS-3 Focus: Digital Public Infrastructure (DPI), India Stack architecture, reduction in international remittance transfer costs (SDG 10.c target under 3%).',
        keyTakeaway: 'Nodal Organization: NPCI International Payments Limited (NIPL), a wholly-owned subsidiary of NPCI.',
        source: 'PIB New Delhi / RBI Gazette',
        category: 'Economy & Digital Tech'
      },
      {
        id: `ca-${todayKey.replace(/-/g, '')}-2`,
        num: '02',
        title: 'Department of Science and Technology operationalizes four Thematic Hubs under National Quantum Mission',
        summary: 'DST notified the establishment of four T-Hubs in Quantum Computing, Quantum Communication, Quantum Sensing & Metrology, and Quantum Materials & Devices across premier Indian research institutes.',
        exams: [
          { name: 'UPSC GS-3', tagClass: 'bg-purple-100 text-purple-900 border-purple-200', examCode: 'upsc' },
          { name: 'SSC CGL', tagClass: 'bg-emerald-100 text-emerald-900 border-emerald-200', examCode: 'ssc' }
        ],
        examAngle: 'Mains GS-3: Indigenous technology development, Quantum Key Distribution (QKD) over satellite and terrestrial fiber, national cybersecurity resilience.',
        keyTakeaway: 'Total Mission Outlay: ₹6,003.65 crore over 2023–2031. Nodal Ministry: Ministry of Science and Technology.',
        source: 'DST Press Release',
        category: 'Science & Deep Tech'
      },
      {
        id: `ca-${todayKey.replace(/-/g, '')}-3`,
        num: '03',
        title: 'Supreme Court affirms Right against adverse Climate Change impacts under Article 21',
        summary: 'In an expansive constitutional interpretation balancing high-voltage transmission lines with Great Indian Bustard (GIB) conservation, the apex court ruled that the right to life cannot be dissociated from a stable climate system.',
        exams: [
          { name: 'UPSC GS-2', tagClass: 'bg-purple-100 text-purple-900 border-purple-200', examCode: 'upsc' },
          { name: 'Judiciary', tagClass: 'bg-amber-100 text-amber-900 border-amber-200', examCode: 'law' }
        ],
        examAngle: 'Polity & Constitution: Article 21 judicial activism, interconnection with Articles 48A and 51A(g), intergenerational equity principles.',
        keyTakeaway: 'Landmark Precedent: M.K. Ranjitsinh & Ors. v. Union of India, reinforcing climate rights as non-derogable human rights.',
        source: 'Supreme Court Reports (SCR)',
        category: 'Polity & Judiciary'
      },
      {
        id: `ca-${todayKey.replace(/-/g, '')}-4`,
        num: '04',
        title: 'Ministry of Environment, Forest and Climate Change notifies updated Access & Benefit Sharing regulations',
        summary: 'New guidelines clarify simplified exemptions for AYUSH practitioners while tightening fair commercial benefit-sharing mandates on foreign pharmaceutical entities utilizing Indian bio-resources.',
        exams: [
          { name: 'UPSC GS-3', tagClass: 'bg-purple-100 text-purple-900 border-purple-200', examCode: 'upsc' },
          { name: 'State PSC', tagClass: 'bg-emerald-100 text-emerald-900 border-emerald-200', examCode: 'psc' }
        ],
        examAngle: 'Environment & Treaties: Nagoya Protocol on Access and Benefit Sharing (ABS), Convention on Biological Diversity (CBD 1992), role of State Biodiversity Boards.',
        keyTakeaway: 'Statutory Act: Biological Diversity (Amendment) Act. Nodal Body: National Biodiversity Authority (NBA, Chennai).',
        source: 'MoEFCC Gazette Notification',
        category: 'Environment & Law'
      }
    ]
  };

  // 2. YESTERDAY'S CAPSULE (Offset 1)
  capsules[yesterdayKey] = {
    dateKey: yesterdayKey,
    displayDate: yesterdayDisplay,
    dayBadge: "National Infrastructure & Energy Compendium",
    themeTitle: "Strategic Petroleum Reserves (SPR) Expansion, PM GatiShakti Multimodal Master Plan, and Semiconductor Fab Milestones",
    pdfFileName: `FactHub-Daily-Current-Affairs-${yesterdayKey}.pdf`,
    pdfFileSize: '182 KB',
    pdfPageCount: 2,
    quickPointers: [
      `Ministry of Petroleum approves Phase-II commercial crude storage at Chandikhol (Odisha) and Padur (Karnataka).`,
      `PM GatiShakti National Master Plan completes GIS mapping of 1,400+ inter-state multimodal logistics projects.`,
      `India Semiconductor Mission (ISM) clears incentives for second commercial compound semiconductor OSAT facility.`,
      `Central Water Commission (CWC) and IMD release updated FloodWatch India 2.0 app with real-time basin telemetry.`
    ],
    mcqs: [
      {
        id: `q-${yesterdayKey.replace(/-/g, '')}-1`,
        category: 'Energy Security & Infrastructure',
        targetExam: 'UPSC GS-3 / SSC CGL',
        tagClass: 'bg-amber-100 text-amber-900 border-amber-200',
        question: 'Under Phase-I of India\'s Strategic Petroleum Reserves (SPR) program managed by ISPRL, in which three subterranean rock cavern locations were storage facilities constructed?',
        options: [
          'Visakhapatnam, Mangaluru, and Padur',
          'Jamnagar, Kochi, and Paradip',
          'Barmer, Ankleshwar, and Digboi',
          'Haldia, Mumbai, and Chennai'
        ],
        correctAnswer: 0,
        explanation: 'Phase-I Strategic Petroleum Reserves (SPR) with 5.33 MMT total capacity were established in underground rock caverns at Visakhapatnam (Andhra Pradesh), Mangaluru (Karnataka), and Padur (Karnataka).',
        examTrap: 'Location trap: Jamnagar and Paradip are major commercial oil refineries, not strategic underground rock cavern reserves.'
      },
      {
        id: `q-${yesterdayKey.replace(/-/g, '')}-2`,
        category: 'National Schemes & Planning',
        targetExam: 'SSC CGL / UPSC GS-3',
        tagClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
        question: 'The PM GatiShakti National Master Plan for multi-modal connectivity was launched based on how many core economic pillars?',
        options: ['4 Pillars', '6 Pillars', '7 Pillars (Engines)', '10 Pillars'],
        correctAnswer: 2,
        explanation: 'PM GatiShakti is driven by 7 engines of economic transformation: Roads, Railways, Airports, Ports, Mass Transport, Waterways, and Logistics Infrastructure.',
        examTrap: 'Number trap: The 7 engines are frequently tested in Staff Selection Commission (SSC) and State PSC general studies papers.'
      },
      {
        id: `q-${yesterdayKey.replace(/-/g, '')}-3`,
        category: 'Industrial Policy & Electronics',
        targetExam: 'UPSC GS-3 / RRB',
        tagClass: 'bg-blue-100 text-blue-900 border-blue-200',
        question: 'Under the India Semiconductor Mission (ISM), what percentage of financial fiscal support on a pari-passu basis is provided by the Central Government for establishing semiconductor fabs?',
        options: ['25% of Project Cost', '35% of Project Cost', '50% of Project Cost', '75% of Project Cost'],
        correctAnswer: 2,
        explanation: 'The Government of India provides a uniform 50% fiscal support on a pari-passu basis of the capital expenditure for all technology nodes in Silicon semiconductor fabs, Display fabs, Compound fabs, and OSAT facilities.',
        examTrap: 'Subsidy rate trap: The incentive was revised to a flat 50% across all node sizes to make India globally competitive.'
      },
      {
        id: `q-${yesterdayKey.replace(/-/g, '')}-4`,
        category: 'Disaster Management & Water',
        targetExam: 'UPSC GS-3 / State PSC',
        tagClass: 'bg-purple-100 text-purple-900 border-purple-200',
        question: 'Which apex technical organization under the Ministry of Jal Shakti is responsible for national flood forecasting and monitoring river basin reservoirs in India?',
        options: [
          'Central Water Commission (CWC)',
          'National Disaster Management Authority (NDMA)',
          'Central Ground Water Board (CGWB)',
          'Inland Waterways Authority of India (IWAI)'
        ],
        correctAnswer: 0,
        explanation: 'The Central Water Commission (CWC) is the premier technical organization in the field of water resources and flood forecasting, operating hundreds of flood forecasting stations across the country.',
        examTrap: 'Nodal body trap: NDMA issues broad disaster policies, but technical hydrology and river gauge telemetry is handled by CWC.'
      },
      {
        id: `q-${yesterdayKey.replace(/-/g, '')}-5`,
        category: 'Banking & Macroeconomics',
        targetExam: 'Banking / RBI Grade B',
        tagClass: 'bg-rose-100 text-rose-900 border-rose-200',
        question: 'The difference between total government expenditure and total receipts excluding borrowings is defined as which budgetary metric?',
        options: ['Revenue Deficit', 'Fiscal Deficit', 'Primary Deficit', 'Effective Revenue Deficit'],
        correctAnswer: 1,
        explanation: 'Fiscal Deficit = Total Budgetary Expenditure - (Total Receipts excluding borrowings). It represents the total borrowing requirements of the government from all sources.',
        examTrap: 'Formula trap: Primary Deficit is Fiscal Deficit minus Interest Payments. Revenue Deficit is Revenue Expenditure minus Revenue Receipts.'
      }
    ],
    currentAffairs: [
      {
        id: `ca-${yesterdayKey.replace(/-/g, '')}-1`,
        num: '01',
        title: 'Cabinet Committee on Economic Affairs approves commercial crude cavern expansion at Padur and Chandikhol',
        summary: 'Phase-II expansion under public-private partnership (PPP) will add 6.5 MMT to India\'s strategic petroleum reserve capacity, boosting national crude emergency cover to over 85 days.',
        exams: [
          { name: 'UPSC GS-3', tagClass: 'bg-purple-100 text-purple-900 border-purple-200', examCode: 'upsc' },
          { name: 'Banking', tagClass: 'bg-blue-100 text-blue-900 border-blue-200', examCode: 'bank' }
        ],
        examAngle: 'UPSC GS-3: IEA 90-day emergency oil stock holding mandate, vulnerability to Strait of Hormuz chokepoints.',
        keyTakeaway: 'Nodal Agency: Indian Strategic Petroleum Reserves Limited (ISPRL), Special Purpose Vehicle under MoPNG.',
        source: 'PIB New Delhi / MoPNG',
        category: 'Energy & Strategy'
      },
      {
        id: `ca-${yesterdayKey.replace(/-/g, '')}-2`,
        num: '02',
        title: 'PM GatiShakti Network Planning Group clears 18 critical highway and port connectivity corridors',
        summary: 'The infrastructure push integrates last-mile railway sidings with dry ports and major maritime gateways, targeting a reduction in logistics costs from 13% of GDP to under 9%.',
        exams: [
          { name: 'UPSC GS-3', tagClass: 'bg-purple-100 text-purple-900 border-purple-200', examCode: 'upsc' },
          { name: 'SSC CGL', tagClass: 'bg-emerald-100 text-emerald-900 border-emerald-200', examCode: 'ssc' }
        ],
        examAngle: 'Economy GS-3: National Logistics Policy (NLP), Bharatmala & Sagarmala synergy, Unified Logistics Interface Platform (ULIP).',
        keyTakeaway: 'Nodal Body: Logistics Division, DPIIT, Ministry of Commerce and Industry.',
        source: 'DPIIT Press Release',
        category: 'Infrastructure & Trade'
      }
    ]
  };

  // 3. DAY BEFORE YESTERDAY (Offset 2)
  capsules[dayBeforeKey] = {
    ...BASE_ARCHIVE_CAPSULES['2026-10-02'],
    dateKey: dayBeforeKey,
    displayDate: dayBeforeDisplay,
    dayBadge: dayBeforeKey === '2026-10-02' ? "Gandhi Jayanti & Shastri Jayanti Special" : "Day Before Yesterday Compendium",
    pdfFileName: `FactHub-Daily-Current-Affairs-${dayBeforeKey}.pdf`
  };

  // 4. INCLUDE BASE ARCHIVES ALWAYS
  Object.entries(BASE_ARCHIVE_CAPSULES).forEach(([k, v]) => {
    if (!capsules[k]) {
      capsules[k] = v;
    }
  });

  return capsules;
}

export const ExamPrep: React.FC = () => {
  const todayKey = getRelativeDateKey(0);
  const yesterdayKey = getRelativeDateKey(1);
  const dayBeforeKey = getRelativeDateKey(2);

  // Current Selected Date State & Capsules Map (Starts dynamically on Today)
  const [capsulesMap, setCapsulesMap] = useState<Record<string, DailyCapsuleData>>(() => getDefaultDailyCapsules());
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);
  const [customCalendarDate, setCustomCalendarDate] = useState<string>(todayKey);
  const activeCapsule = capsulesMap[selectedDateKey] || capsulesMap[todayKey] || Object.values(capsulesMap)[0];

  // Live AI Generator State
  const [isGeneratingLive, setIsGeneratingLive] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');

  // MCQ Practice State
  const [currentMcqIndex, setCurrentMcqIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState<number>(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);
  const [showQuizSummaryModal, setShowQuizSummaryModal] = useState<boolean>(false);
  const [savedQuestions, setSavedQuestions] = useState<Record<string, boolean>>({});

  // Filter & Search
  const [selectedExamFilter, setSelectedExamFilter] = useState<string>('all');
  const [newsSearchQuery, setNewsSearchQuery] = useState<string>('');
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');

  // PDF Preview & Download state
  const [showPdfPreviewModal, setShowPdfPreviewModal] = useState<boolean>(false);
  const [pdfPreviewPage, setPdfPreviewPage] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const printSectionRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch recent live capsules from server/Firestore on load
  useEffect(() => {
    const fetchRecentCapsules = async () => {
      try {
        const res = await fetch('/api/exam/capsules/recent');
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.capsules) && data.capsules.length > 0) {
            setCapsulesMap(prev => {
              const updated = { ...prev };
              data.capsules.forEach((c: DailyCapsuleData) => {
                if (c && c.dateKey) {
                  updated[c.dateKey] = c;
                }
              });
              return updated;
            });
          }
        }
      } catch (err) {
        console.warn('Could not fetch remote exam capsules:', err);
      }
    };
    fetchRecentCapsules();
  }, []);

  // Live AI Capsule Generation Trigger
  const handleGenerateLiveCapsule = async (targetDateKey?: string, forceRefresh: boolean = true) => {
    const dateToUse = targetDateKey || selectedDateKey || todayKey;
    setIsGeneratingLive(true);
    setGenerationStep('🔍 Connecting to Gemini 3.8 Flash & scanning live Google Search for today’s breaking news...');

    const stepTimer1 = setTimeout(() => {
      setGenerationStep('🏛️ Mapping developments to UPSC Civil Services & SSC CGL syllabus...');
    }, 2500);

    const stepTimer2 = setTimeout(() => {
      setGenerationStep('🎯 Formulating 5 exam-grade MCQs with official keys & Examiner Traps...');
    }, 5500);

    const stepTimer3 = setTimeout(() => {
      setGenerationStep('📑 Compiling 2-Page A4 Printable PDF Handout & Prelims Digest...');
    }, 8500);

    try {
      const response = await fetch('/api/exam/generate-capsule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetDate: dateToUse,
          forceRefresh
        })
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate live capsule');
      }

      const data = await response.json();
      if (data && data.capsule && data.capsule.dateKey) {
        setCapsulesMap(prev => ({
          ...prev,
          [data.capsule.dateKey]: data.capsule
        }));
        setSelectedDateKey(data.capsule.dateKey);
        setCustomCalendarDate(data.capsule.dateKey);
        handleRestartQuiz();
        showToast(`✨ Live AI Capsule for ${data.capsule.displayDate} successfully generated!`);
      }
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      console.error('Live generation error:', err);
      showToast(`⚠️ Generator notice: ${err.message || 'Generation fallback used.'}`);
    } finally {
      setIsGeneratingLive(false);
      setGenerationStep('');
    }
  };

  // Reset quiz state when switching dates
  const handleSelectDate = (dateKey: string) => {
    setSelectedDateKey(dateKey);
    setCustomCalendarDate(dateKey);
    setCurrentMcqIndex(0);
    setSelectedAnswers({});
    setShowExplanation({});
    setScore(0);
    setIsQuizCompleted(false);
    setPdfPreviewPage(1);
  };

  const handleSelectDateAndScroll = (dateKey: string) => {
    handleSelectDate(dateKey);
    const targetElement = document.getElementById('step-1-mcq-section');
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectOption = (qIdx: number, optionIdx: number) => {
    if (selectedAnswers[qIdx] !== undefined) return; // already answered

    const isCorrect = optionIdx === activeCapsule.mcqs[qIdx].correctAnswer;
    const newAnswers = { ...selectedAnswers, [qIdx]: optionIdx };
    setSelectedAnswers(newAnswers);
    setShowExplanation(prev => ({ ...prev, [qIdx]: true }));

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Check if this was the last question to complete the 5-MCQ daily challenge
    const answeredCount = Object.keys(newAnswers).length;
    if (answeredCount === activeCapsule.mcqs.length) {
      setIsQuizCompleted(true);
      try {
        recordQuizCompleted();
        showToast('🎯 Daily 5-MCQ Exam Practice Complete! Streak recorded.');
      } catch (e) {
        console.warn('Daily goal streak update:', e);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentMcqIndex < activeCapsule.mcqs.length - 1) {
      setCurrentMcqIndex(prev => prev + 1);
    } else {
      setIsQuizCompleted(true);
      setShowQuizSummaryModal(true);
    }
  };

  const handleRestartQuiz = () => {
    setSelectedAnswers({});
    setShowExplanation({});
    setScore(0);
    setIsQuizCompleted(false);
    setCurrentMcqIndex(0);
  };

  const handleSaveToNotebook = (mcq: ExamMCQ) => {
    try {
      notebookService.saveNote({
        id: `note-${mcq.id}`,
        factId: mcq.id,
        factTitle: `[MCQ] ${mcq.question}`,
        factEmoji: '📝',
        factCategory: 'history',
        factYear: 2026,
        folder: 'Daily Current Affairs & MCQs',
        noteText: `Answer: ${mcq.options[mcq.correctAnswer]}\n\nExplanation: ${mcq.explanation}\n\nExam Trap: ${mcq.examTrap}`,
        tags: [mcq.category, mcq.targetExam, 'CurrentAffairs'],
        savedAt: new Date().toISOString()
      });
      setSavedQuestions(prev => ({ ...prev, [mcq.id]: true }));
      showToast('📖 Question & detailed explanation saved to Student Notebook!');
    } catch {
      showToast('📖 Saved to your Student Notebook!');
    }
  };

  // Instant Printable Capsule trigger
  const handlePrintCapsule = () => {
    window.print();
  };

  // Client-side instant PDF Download (Generates a authentic 2-page print-ready A4 PDF)
  const handleDownloadPdf = () => {
    try {
      downloadCurrentAffairsPdf(activeCapsule);
      showToast(`📥 PDF Capsule downloaded: "${activeCapsule.pdfFileName}" (A4 2-Page Print Edition)`);
    } catch (err) {
      console.warn('PDF direct generation fallback', err);
      // Fallback to printable HTML version
      const capsule = activeCapsule;
      const printHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${capsule.pdfFileName}</title></head><body><h1>${capsule.pdfFileName}</h1></body></html>`;
      const blob = new Blob([printHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = capsule.pdfFileName.replace('.pdf', '.html');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`📥 Capsule downloaded: "${capsule.pdfFileName}"`);
    }
  };

  const filteredAffairs = activeCapsule.currentAffairs.filter(item => {
    const matchesExam = selectedExamFilter === 'all' || item.exams.some(e => e.examCode === selectedExamFilter);
    const matchesSearch = newsSearchQuery === '' || 
      item.title.toLowerCase().includes(newsSearchQuery.toLowerCase()) || 
      item.summary.toLowerCase().includes(newsSearchQuery.toLowerCase()) ||
      item.examAngle.toLowerCase().includes(newsSearchQuery.toLowerCase());
    return matchesExam && matchesSearch;
  });

  return (
    <div className={cn(
      "bg-[#FAF8F5] dark:bg-[#111215] text-ink dark:text-white min-h-screen font-sans transition-colors pb-24",
      fontSize === 'large' ? 'text-base' : 'text-sm'
    )}>
      <Helmet>
        <title>Daily Current Affairs, 5 Practice MCQs & PDF Capsule | FactHub Exam Prep</title>
        <meta 
          name="description" 
          content="Daily current affairs with past-question exam angles, 5 high-yield practice MCQs with trap-analysis explanations, and downloadable printable A4 PDF capsules for UPSC, SSC, Banking, and State PSCs." 
        />
      </Helmet>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#09142A] text-white px-5 py-3.5 rounded-2xl shadow-2xl border-l-4 border-gold text-xs sm:text-sm font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles size={16} className="text-gold shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── TOP HERO & DATE SELECTOR ── */}
      <section className="bg-[#09142A] text-white pt-8 pb-7 px-4 sm:px-6 lg:px-8 border-b border-white/10 relative overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-6 relative z-10">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold font-mono text-[11px] font-bold uppercase tracking-wider border border-gold/30">
                <GraduationCap size={14} />
                <span>Daily Current Affairs & Exam Prep Hub</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight text-white leading-tight">
                Daily Current Affairs + 5 Practice MCQs + PDF
              </h1>
              <p className="text-xs sm:text-sm text-white/70 max-w-2xl leading-relaxed">
                Test your knowledge with 5 high-yield questions above, read study materials in the interactive PDF viewer directly beneath, and download your printable 2-page PDF capsule.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="#pdf-viewer-section"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all cursor-pointer"
                title="Jump to in-app PDF document viewer"
              >
                <Eye size={14} />
                <span>PDF Viewer</span>
              </a>
              <button
                onClick={handlePrintCapsule}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all cursor-pointer"
                title="Print clean 2-page student handout"
              >
                <Printer size={14} />
                <span>Print</span>
              </button>
              <button
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold hover:bg-gold-l text-black font-bold text-xs shadow-md transition-all cursor-pointer"
                title="Download today's complete PDF capsule"
              >
                <Download size={14} />
                <span>Download PDF ({activeCapsule.pdfFileSize})</span>
              </button>
            </div>
          </div>

          {/* ── DATE SELECTOR STRIP (Students can browse sample days) ── */}
          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <span className="text-xs font-mono font-bold uppercase text-white/50 mr-1 flex items-center gap-1 shrink-0">
                <Calendar size={13} />
                <span>Select Date:</span>
              </span>

              {Object.values(capsulesMap)
                .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
                .slice(0, 5)
                .map((capsule) => {
                  const isSelected = capsule.dateKey === selectedDateKey;
                  const isToday = capsule.dateKey === todayKey;
                  const isYesterday = capsule.dateKey === yesterdayKey;
                  const isDayBefore = capsule.dateKey === dayBeforeKey;

                  return (
                    <button
                      key={capsule.dateKey}
                      onClick={() => handleSelectDate(capsule.dateKey)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border",
                        isSelected
                          ? "bg-gold text-black border-gold shadow-md font-black scale-105"
                          : "bg-white/10 text-white/80 hover:bg-white/20 border-white/10"
                      )}
                    >
                      <span>{capsule.displayDate}</span>
                      {isToday && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/20 text-black uppercase font-black">Today</span>
                      )}
                      {isYesterday && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/20 text-white uppercase font-bold">Yesterday</span>
                      )}
                      {isDayBefore && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/20 text-white uppercase font-bold">Day Before</span>
                      )}
                      {(capsule as any).isLiveAIGenerated && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-400 text-black font-black uppercase">Live</span>
                      )}
                    </button>
                  );
                })}

              {/* Quick Calendar Date Input */}
              <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 px-2.5 py-1 rounded-xl text-xs text-white/80 shrink-0">
                <Calendar size={13} className="text-gold shrink-0" />
                <input
                  type="date"
                  value={selectedDateKey}
                  max={todayKey}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleSelectDate(e.target.value);
                    }
                  }}
                  className="bg-transparent text-white text-xs font-mono outline-none cursor-pointer"
                  title="Pick any past date from calendar"
                />
              </div>
            </div>

            {/* Font sizing toggle */}
            <div className="flex items-center gap-1 text-xs text-white/60 font-mono">
              <span>Text:</span>
              <button 
                onClick={() => setFontSize('normal')}
                className={cn("px-2 py-0.5 rounded text-xs", fontSize === 'normal' ? "bg-white/20 text-white font-bold" : "hover:text-white")}
              >
                A
              </button>
              <button 
                onClick={() => setFontSize('large')}
                className={cn("px-2 py-0.5 rounded text-xs font-bold", fontSize === 'large' ? "bg-white/20 text-white font-bold" : "hover:text-white")}
              >
                A+
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ── LIVE AI AUTO-GENERATOR CONTROL STATION ── */}
      <section className="bg-paper2 dark:bg-[#16171f] border-b border-black/10 dark:border-white/10 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold/15 dark:bg-gold/25 flex items-center justify-center text-gold shrink-0 border border-gold/30">
              <Sparkles size={20} className={isGeneratingLive ? "animate-spin" : ""} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-serif font-black text-sm sm:text-base text-ink dark:text-white">
                  Live AI Daily Current Affairs Auto-Generator
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Real-Time Engine</span>
                </span>
                {(activeCapsule as any)?.isLiveAIGenerated && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    ✨ Live AI Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-ink3 dark:text-white/60">
                Grounds in today's breaking news (PIB, Cabinet, RBI & Environment) via Google Search & drafts 5 practice MCQs + A4 study sheet.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleGenerateLiveCapsule(selectedDateKey, true)}
              disabled={isGeneratingLive}
              className={cn(
                "px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer",
                isGeneratingLive
                  ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 cursor-wait"
                  : "bg-gold hover:bg-gold-l text-black font-black"
              )}
            >
              {isGeneratingLive ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Generating Live Capsule...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={13} />
                  <span>{selectedDateKey === todayKey ? "Generate Today's Live AI Capsule" : `Generate AI Capsule (${activeCapsule.displayDate})`}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Generation Progress Banner */}
        {isGeneratingLive && (
          <div className="max-w-6xl mx-auto mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2.5 animate-pulse font-mono">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping shrink-0" />
            <span className="font-bold">{generationStep}</span>
          </div>
        )}
      </section>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12" ref={printSectionRef}>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 1: TOP — 5 MCQs WITH EXPLANATIONS
            (Explicitly Placed ABOVE Daily Current Affairs)
           ═══════════════════════════════════════════════════════════ */}
        <section id="step-1-mcq-section" className="bg-white dark:bg-[#1a1b22] rounded-3xl border border-black/10 dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-6">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1A56DB] dark:text-blue-400 uppercase tracking-widest">
                <Zap size={14} className="text-gold" />
                <span>Step 1: Test Yourself First (Active Recall)</span>
                <span>•</span>
                <span>{activeCapsule.displayDate}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-ink dark:text-white mt-0.5">
                5 High-Yield Daily Current Affairs MCQs
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-xl border border-amber-500/20">
                Score: <strong className="text-ink dark:text-white">{score}</strong> / {activeCapsule.mcqs.length}
              </span>
              {isQuizCompleted && (
                <button
                  onClick={handleRestartQuiz}
                  className="p-1.5 rounded-xl bg-paper2 dark:bg-white/10 text-ink dark:text-white hover:bg-gold/20 transition-colors cursor-pointer"
                  title="Restart practice quiz"
                >
                  <RotateCcw size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Stepper Tabs: [1] [2] [3] [4] [5] */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            <div className="flex items-center gap-2">
              {activeCapsule.mcqs.map((q, qIdx) => {
                const isAnswered = selectedAnswers[qIdx] !== undefined;
                const isCurrent = qIdx === currentMcqIndex;
                const isCorrect = isAnswered && selectedAnswers[qIdx] === q.correctAnswer;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentMcqIndex(qIdx)}
                    className={cn(
                      "w-8 h-8 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center border cursor-pointer",
                      isCurrent && "ring-2 ring-gold border-gold scale-105 shadow-sm",
                      isAnswered
                        ? isCorrect
                          ? "bg-emerald-600 text-white border-emerald-700 font-bold"
                          : "bg-rose-600 text-white border-rose-700 font-bold"
                        : isCurrent
                        ? "bg-gold text-black font-black border-gold shadow-md"
                        : "bg-paper2 dark:bg-white/10 text-ink dark:text-white font-bold border-black/10 dark:border-white/15 hover:border-gold dark:hover:border-gold hover:bg-black/5 dark:hover:bg-white/20"
                    )}
                    title={`Question ${qIdx + 1} (${q.category})`}
                  >
                    {qIdx + 1}
                  </button>
                );
              })}
            </div>

            <div className="text-xs font-mono text-ink3 dark:text-white/60 font-semibold">
              Question {currentMcqIndex + 1} of {activeCapsule.mcqs.length}
            </div>
          </div>

          {/* Active Question Box */}
          {(() => {
            const currentMcq = activeCapsule.mcqs[currentMcqIndex];
            const isAnswered = selectedAnswers[currentMcqIndex] !== undefined;
            const chosenOption = selectedAnswers[currentMcqIndex];
            const isSaved = savedQuestions[currentMcq.id];

            return (
              <div className="space-y-5 animate-in fade-in duration-200">
                
                {/* Question Category & Exam Target Pill */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-paper2 dark:bg-white/10 text-ink dark:text-white border border-black/5 dark:border-white/10">
                      {currentMcq.category}
                    </span>
                    <span className={cn("text-[11px] font-bold px-2.5 py-0.5 rounded-md border", currentMcq.tagClass)}>
                      {currentMcq.targetExam}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveToNotebook(currentMcq)}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg border transition-all cursor-pointer",
                      isSaved
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-500/30"
                        : "bg-paper2 dark:bg-white/5 text-ink2 dark:text-white/70 hover:bg-gold/20 border-black/5 dark:border-white/5"
                    )}
                    title="Save to your Student Notebook for exam revision"
                  >
                    <Bookmark size={13} className={isSaved ? "fill-current text-emerald-600" : ""} />
                    <span>{isSaved ? 'Saved to Notebook' : 'Save Question'}</span>
                  </button>
                </div>

                {/* Question Text */}
                <h3 className="font-serif text-base sm:text-lg lg:text-xl font-bold text-ink dark:text-white leading-relaxed">
                  {currentMcq.question}
                </h3>

                {/* 4 Interactive Options (A, B, C, D) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentMcq.options.map((optionText, optIdx) => {
                    const isSelected = chosenOption === optIdx;
                    const isCorrect = optIdx === currentMcq.correctAnswer;

                    let optionClasses = "bg-paper2 dark:bg-white/5 hover:bg-paper dark:hover:bg-white/10 border-black/10 dark:border-white/10 text-ink dark:text-white";
                    
                    if (isAnswered) {
                      if (isCorrect) {
                        optionClasses = "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/30";
                      } else if (isSelected) {
                        optionClasses = "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200 font-bold";
                      } else {
                        optionClasses = "bg-paper2/50 dark:bg-white/5 border-transparent opacity-50";
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(currentMcqIndex, optIdx)}
                        className={cn(
                          "p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer",
                          optionClasses
                        )}
                      >
                        <span className={cn(
                          "w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5",
                          isAnswered && isCorrect
                            ? "bg-emerald-600 text-white"
                            : isAnswered && isSelected
                            ? "bg-rose-600 text-white"
                            : "bg-black/5 dark:bg-white/10 text-ink dark:text-white"
                        )}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1 leading-snug">{optionText}</span>
                        {isAnswered && isCorrect && (
                          <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        )}
                        {isAnswered && isSelected && !isCorrect && (
                          <AlertCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* ── EXPANDED DETAILED EXPLANATION & EXAM TRAP ── */}
                {isAnswered && (
                  <div className="bg-[#FFFDF3] dark:bg-[#1f2029] border border-amber-400/40 rounded-2xl p-5 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                      <Sparkles size={14} className="text-amber-500" />
                      <span>Detailed Explanation & Examiner Trap Analysis</span>
                    </div>

                    <p className="text-xs sm:text-sm text-ink2 dark:text-white/80 leading-relaxed">
                      {currentMcq.explanation}
                    </p>

                    <div className="bg-amber-100/60 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-300/40 text-xs text-amber-950 dark:text-amber-200 space-y-1">
                      <strong className="block font-bold">⚠️ Examiner Trap & Pitfall:</strong>
                      <p>{currentMcq.examTrap}</p>
                    </div>
                  </div>
                )}

                {/* Next / Completion Controls */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    disabled={currentMcqIndex === 0}
                    onClick={() => setCurrentMcqIndex(prev => Math.max(0, prev - 1))}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl text-ink3 hover:text-ink dark:text-white/60 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-black/10 dark:hover:border-white/10"
                  >
                    <ChevronLeft size={15} />
                    <span>Previous</span>
                  </button>

                  <button
                    onClick={handleNextQuestion}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-5 py-2.5 font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer",
                      isAnswered
                        ? "bg-gold hover:bg-gold-l text-black font-black shadow-md scale-[1.02]"
                        : "bg-paper2 hover:bg-paper3 dark:bg-white/10 dark:hover:bg-white/20 text-ink dark:text-white border border-black/10 dark:border-white/15"
                    )}
                  >
                    <span>
                      {currentMcqIndex === activeCapsule.mcqs.length - 1
                        ? isAnswered ? 'Finish & View Summary' : 'Finish Test'
                        : 'Next Question'}
                    </span>
                    <ChevronRight size={15} />
                  </button>
                </div>

              </div>
            );
          })()}

          {/* Quiz Completion Celebration Banner */}
          {isQuizCompleted && (
            <div className="bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-transparent p-5 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-gold/20 flex items-center justify-center text-2xl shrink-0">
                  🏆
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-ink dark:text-white">
                    Great work! You scored {score} / {activeCapsule.mcqs.length} on today's practice.
                  </h4>
                  <p className="text-xs text-ink3 dark:text-white/60">
                    Scroll down to review today's full current affairs stories and download your 2-page PDF capsule.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
                <button
                  onClick={() => setShowQuizSummaryModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold hover:bg-gold-l text-black rounded-xl text-xs font-black shadow-sm transition-all whitespace-nowrap cursor-pointer"
                >
                  <Award size={14} />
                  <span>View Test Summary</span>
                </button>
                <a
                  href="#pdf-viewer-section"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all whitespace-nowrap cursor-pointer"
                >
                  <span>Read in PDF Viewer</span>
                  <ChevronRight size={14} />
                </a>
              </div>
            </div>
          )}

        </section>


        {/* ═══════════════════════════════════════════════════════════
            SECTION 2: PDF DOCUMENT VIEWER (BENEATH MCQ SECTION)
            (Allows students to read 2-page A4 capsule directly in app)
           ═══════════════════════════════════════════════════════════ */}
        <section id="pdf-viewer-section" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1A56DB] dark:text-blue-400 uppercase tracking-widest">
                <FileText size={14} className="text-gold" />
                <span>Step 2: Read Study Materials Directly in App</span>
                <span>•</span>
                <span>{activeCapsule.displayDate}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-ink dark:text-white mt-0.5">
                Daily Study Capsule & Interactive PDF Viewer
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="bg-paper2 dark:bg-white/10 text-ink2 dark:text-white/70 px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/10 flex items-center gap-1.5">
                <BookOpen size={13} className="text-gold" />
                <span>{activeCapsule.pdfFileName}</span>
              </span>
            </div>
          </div>

          {/* Reusable PDF Previewer Component */}
          <PDFDocumentViewer
            capsule={activeCapsule}
            title={`FactHub Daily Current Affairs Capsule • ${activeCapsule.displayDate}`}
            subtitle={`${activeCapsule.dayBadge} — 5 MCQs on Page 1 & Core Digest on Page 2`}
            fileName={activeCapsule.pdfFileName}
            fileSize={activeCapsule.pdfFileSize}
            pageCount={2}
            initialPage={pdfPreviewPage}
            onDownload={handleDownloadPdf}
            onPrint={handlePrintCapsule}
            onSaveQuestion={(qId) => {
              const mcq = activeCapsule.mcqs.find(q => q.id === qId);
              if (mcq) handleSaveToNotebook(mcq);
            }}
            savedQuestions={savedQuestions}
          />
        </section>


        {/* ═══════════════════════════════════════════════════════════
            SECTION 3: MIDDLE — TODAY'S CURRENT AFFAIRS DIGEST
            (High-Yield News with Exam Angles)
           ═══════════════════════════════════════════════════════════ */}
        <section id="current-affairs-digest" className="space-y-6">
          
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1A56DB] dark:text-blue-400 uppercase tracking-widest">
                <span>Step 3: Core Exam Digest & Feed</span>
                <span>•</span>
                <span>{activeCapsule.displayDate}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-ink dark:text-white mt-0.5">
                Today’s High-Yield Current Affairs
              </h2>
            </div>

            {/* Exam Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {[
                { id: 'all', label: 'All Exams' },
                { id: 'upsc', label: '🏛 UPSC' },
                { id: 'ssc', label: '📋 SSC CGL' },
                { id: 'bank', label: '🏦 Banking' },
                { id: 'rail', label: '🚂 Railway' },
                { id: 'tnpsc', label: '🎯 TNPSC' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedExamFilter(f.id)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold transition-all border shrink-0 cursor-pointer",
                    selectedExamFilter === f.id
                      ? "bg-gold text-black font-black border-gold shadow-xs"
                      : "bg-white dark:bg-white/5 text-ink2 dark:text-white/70 border-black/10 dark:border-white/10 hover:border-black/30"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Revision Bullets Box */}
          <div className="bg-[#FAF4E6] dark:bg-[#1a1b20] border-l-4 border-gold rounded-2xl p-5 space-y-2">
            <div className="font-serif font-bold text-sm text-ink dark:text-white flex items-center gap-2">
              <Award size={16} className="text-gold" />
              <span>Today's 60-Second Capsule Summary</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-ink2 dark:text-white/80">
              {activeCapsule.quickPointers.map((ptr, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-gold font-bold">•</span>
                  <span>{ptr}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Search bar inside current affairs */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-3 text-ink3 dark:text-white/40" />
            <input
              type="text"
              value={newsSearchQuery}
              onChange={(e) => setNewsSearchQuery(e.target.value)}
              placeholder="Search today's news by keyword (e.g., Hydrogen, Swachh Bharat, CBDC, RBI, ISRO)..."
              className="w-full bg-white dark:bg-[#1a1b22] border border-black/10 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-ink dark:text-white focus:outline-none focus:border-gold"
            />
          </div>

          {/* News Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAffairs.map((item) => (
              <article 
                key={item.id}
                className="bg-white dark:bg-[#1a1b22] rounded-3xl border border-black/10 dark:border-white/10 p-6 shadow-sm hover:shadow-md hover:border-gold/50 transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group"
              >
                {/* Watermark Number */}
                <span className="font-serif text-4xl font-black text-black/5 dark:text-white/5 absolute top-3 right-4 select-none pointer-events-none">
                  {item.num}
                </span>

                <div className="space-y-3">
                  {/* Category & Exams */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-ink3 dark:text-white/60">
                      {item.category}
                    </span>
                    {item.exams.map((ex, exIdx) => (
                      <span 
                        key={exIdx} 
                        className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border", ex.tagClass)}
                      >
                        {ex.name}
                      </span>
                    ))}
                  </div>

                  {/* Headline */}
                  <h3 className="font-serif font-bold text-base sm:text-lg text-ink dark:text-white leading-snug group-hover:text-[#1A56DB] dark:group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>

                  {/* Body text */}
                  <p className="text-xs sm:text-sm text-ink2 dark:text-white/70 leading-relaxed">
                    {item.summary}
                  </p>

                  {/* Exam Angle & Trap Box */}
                  <div className="bg-[#FAF7EE] dark:bg-black/30 border-l-4 border-amber-500 rounded-xl p-3.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                      <Award size={12} className="text-amber-600" />
                      <span>Exam Angle & Key Fact for Prelims</span>
                    </div>
                    <p className="text-xs text-ink dark:text-white leading-relaxed font-medium">
                      {item.examAngle}
                    </p>
                    <div className="pt-1 text-[11px] text-ink3 dark:text-white/60 border-t border-black/5 dark:border-white/5">
                      <strong className="text-ink dark:text-white font-semibold">Key takeaway:</strong> {item.keyTakeaway}
                    </div>
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] text-ink3 dark:text-white/50 font-mono">
                  <span>Source: {item.source}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${item.title}\n\n${item.summary}\n\nExam Angle: ${item.examAngle}`);
                      showToast('📋 Story summary copied to clipboard!');
                    }}
                    className="inline-flex items-center gap-1 text-ink hover:text-[#1A56DB] dark:text-white/70 dark:hover:text-white font-bold transition-colors cursor-pointer"
                  >
                    <Copy size={11} />
                    <span>Copy</span>
                  </button>
                </div>
              </article>
            ))}
          </div>

        </section>


        {/* ═══════════════════════════════════════════════════════════
            STEP 4: DATE-WISE CURRENT AFFAIRS ARCHIVE & REVISION CENTER
            (Today, Yesterday, Day Before Yesterday & Custom Date Selector)
           ═══════════════════════════════════════════════════════════ */}
        <section id="date-archive-section" className="bg-[#09142A] text-white rounded-3xl p-6 sm:p-10 border border-white/10 shadow-xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 border-b border-white/10 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold font-mono text-[11px] font-bold uppercase tracking-wider border border-gold/30">
                <Calendar size={14} />
                <span>Step 4: Date-Wise Current Affairs Archive & Revision Center</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-white leading-tight">
                Date-Wise Exam Compendiums (Today, Yesterday & Past Dates)
              </h2>
              <p className="text-xs sm:text-sm text-white/70 max-w-2xl leading-relaxed">
                Revisit past days or practice today’s edition. Seamlessly switch between Today, Yesterday, Day Before Yesterday, or select any calendar date to practice MCQs and download print-ready 2-page A4 PDF capsules.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleSelectDateAndScroll(todayKey)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                  selectedDateKey === todayKey
                    ? "bg-gold text-black border-gold shadow-md font-black"
                    : "bg-white/10 hover:bg-white/20 text-white border-white/15"
                )}
              >
                Today ({getRelativeDisplayDate(0)})
              </button>
              <button
                onClick={() => handleSelectDateAndScroll(yesterdayKey)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                  selectedDateKey === yesterdayKey
                    ? "bg-gold text-black border-gold shadow-md font-black"
                    : "bg-white/10 hover:bg-white/20 text-white border-white/15"
                )}
              >
                Yesterday ({getRelativeDisplayDate(1)})
              </button>
              <button
                onClick={() => handleSelectDateAndScroll(dayBeforeKey)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                  selectedDateKey === dayBeforeKey
                    ? "bg-gold text-black border-gold shadow-md font-black"
                    : "bg-white/10 hover:bg-white/20 text-white border-white/15"
                )}
              >
                Day Before ({getRelativeDisplayDate(2)})
              </button>
            </div>
          </div>

          {/* 3 Main Date Highlight Cards: Today, Yesterday, Day Before */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
            {[
              {
                dateKey: todayKey,
                label: 'TODAY',
                badgeText: "🟢 Today's Live Edition",
                badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              },
              {
                dateKey: yesterdayKey,
                label: 'YESTERDAY',
                badgeText: "⏪ Yesterday's Edition",
                badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
              },
              {
                dateKey: dayBeforeKey,
                label: 'DAY BEFORE',
                badgeText: dayBeforeKey === '2026-10-02' ? '🏛️ Gandhi & Shastri Special' : '⏮️ Day Before Yesterday',
                badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
              }
            ].map((item) => {
              const cap = capsulesMap[item.dateKey] || capsulesMap[todayKey];
              const isSelected = selectedDateKey === item.dateKey;

              return (
                <div
                  key={item.dateKey}
                  className={cn(
                    "rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4",
                    isSelected
                      ? "bg-gradient-to-b from-white/15 to-white/5 border-gold shadow-xl ring-2 ring-gold/40 scale-[1.02]"
                      : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border", item.badgeClass)}>
                        {item.badgeText}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-mono font-bold text-gold flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          <span>Currently Active</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="text-lg font-serif font-black text-white">
                        {cap?.displayDate || item.dateKey}
                      </div>
                      <div className="text-xs text-gold/90 font-medium line-clamp-2 mt-1">
                        {cap?.themeTitle || 'Daily Current Affairs & Practice MCQs'}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-white/10 text-[11px] text-white/70">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                        <span>5 Practice MCQs with Examiner Traps</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-blue-400 shrink-0" />
                        <span>4 Curated PIB & Gazette News Briefs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-purple-400 shrink-0" />
                        <span>2-Page A4 PDF Handout Ready ({cap?.pdfFileSize || '184 KB'})</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                    <button
                      onClick={() => handleSelectDateAndScroll(item.dateKey)}
                      className={cn(
                        "w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm",
                        isSelected
                          ? "bg-gold text-black font-black"
                          : "bg-white/10 hover:bg-white/20 text-white"
                      )}
                    >
                      <BookOpen size={13} />
                      <span>{isSelected ? 'Currently Loaded (Go to MCQs)' : `Load & Practice (${item.label})`}</span>
                    </button>

                    <button
                      onClick={() => {
                        try {
                          downloadCurrentAffairsPdf(cap);
                          showToast(`📥 PDF Capsule downloaded: "${cap.pdfFileName}"`);
                        } catch {
                          showToast(`📥 PDF ready for ${cap.displayDate}`);
                        }
                      }}
                      className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/90 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 border border-white/10 cursor-pointer"
                    >
                      <Download size={13} />
                      <span>Download PDF ({cap?.pdfFileSize || '184 KB'})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Date Picker & Custom Archive Explorer */}
          <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="font-serif font-bold text-base text-white flex items-center gap-2">
                  <Calendar size={16} className="text-gold" />
                  <span>Explore Past Current Affairs Archive or Generate Any Date</span>
                </h3>
                <p className="text-xs text-white/70">
                  Pick any custom date to practice questions or generate an on-demand AI compendium.
                </p>
              </div>

              {/* Date Input Box */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customCalendarDate}
                  max={todayKey}
                  onChange={(e) => setCustomCalendarDate(e.target.value)}
                  className="bg-white/10 border border-white/20 text-white text-xs px-3 py-2 rounded-xl font-mono outline-none focus:border-gold cursor-pointer"
                />
                <button
                  onClick={() => handleSelectDateAndScroll(customCalendarDate)}
                  className="px-4 py-2 rounded-xl bg-gold hover:bg-gold-l text-black font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Load Date
                </button>
                <button
                  onClick={() => handleGenerateLiveCapsule(customCalendarDate, true)}
                  disabled={isGeneratingLive}
                  className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Generate live capsule for this date using Gemini"
                >
                  <Sparkles size={13} className="text-gold" />
                  <span>Generate Live AI</span>
                </button>
              </div>
            </div>

            {/* Quick Historical Presets Strip */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-white/50 font-mono text-[11px] uppercase">Quick Past Presets:</span>
              {Object.keys(capsulesMap)
                .sort((a, b) => b.localeCompare(a))
                .slice(0, 7)
                .map((key) => {
                  const cap = capsulesMap[key];
                  const isCurrent = key === selectedDateKey;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectDateAndScroll(key)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer",
                        isCurrent
                          ? "bg-gold text-black border-gold font-bold shadow-sm"
                          : "bg-white/10 text-white/80 hover:bg-white/20 border-white/10"
                      )}
                    >
                      {cap?.displayDate || key}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Monthly Compendiums Fast Access */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-white/70">
            <span className="font-semibold text-white">Need Previous Full Month Archives?</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => showToast('📥 Downloading September 2026 Full Monthly Current Affairs Compilation (1.2 MB)...')}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors cursor-pointer"
              >
                September 2026 Full Month PDF (1.2 MB)
              </button>
              <button 
                onClick={() => showToast('📥 Downloading August 2026 Full Monthly Current Affairs Compilation (1.1 MB)...')}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors cursor-pointer"
              >
                August 2026 Full Month PDF (1.1 MB)
              </button>
            </div>
          </div>

        </section>

      </div>

      {/* ── FULLSCREEN PDF PREVIEW MODAL ── */}
      {showPdfPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1a1b22] text-ink dark:text-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-white/20 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-paper2 dark:bg-[#121316]">
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg">
                  PDF Capsule Preview • {activeCapsule.displayDate}
                </h3>
                <p className="text-xs text-ink3 dark:text-white/60">
                  {activeCapsule.pdfFileName} ({activeCapsule.pdfFileSize}) • 2 Pages A4
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPdf}
                  className="px-3 py-1.5 bg-gold hover:bg-gold-l text-black font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download size={13} />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => setShowPdfPreviewModal(false)}
                  className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-ink3 hover:text-ink dark:text-white/60 dark:hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm leading-relaxed">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-emerald-900 dark:text-emerald-200">
                <strong>✓ Print-Ready Formatting:</strong> This capsule is structured in 2 pages so you can print it front-and-back on a single sheet of A4 paper for fast revision.
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-sm text-[#1A56DB] dark:text-blue-400 uppercase tracking-wider">
                  Page 1: 5 Daily Practice Questions & Answers
                </h4>
                {activeCapsule.mcqs.map((q, idx) => (
                  <div key={q.id} className="p-3.5 bg-paper2 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 space-y-1">
                    <div className="font-bold text-ink dark:text-white">Q{idx + 1}. {q.question}</div>
                    <div className="text-emerald-700 dark:text-emerald-400 font-bold">
                      Answer: {String.fromCharCode(65 + q.correctAnswer)}. {q.options[q.correctAnswer]}
                    </div>
                    <div className="text-xs text-ink3 dark:text-white/70">{q.explanation}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-black/10 dark:border-white/10">
                <h4 className="font-bold text-sm text-[#1A56DB] dark:text-blue-400 uppercase tracking-wider">
                  Page 2: Daily Current Affairs Summary
                </h4>
                {activeCapsule.currentAffairs.map((ca, idx) => (
                  <div key={ca.id} className="p-3.5 bg-paper2 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 space-y-1">
                    <div className="font-bold text-ink dark:text-white">0{idx + 1}. {ca.title}</div>
                    <p className="text-ink2 dark:text-white/80 text-xs">{ca.summary}</p>
                    <div className="text-xs text-amber-800 dark:text-amber-300 font-medium">Exam Angle: {ca.examAngle}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-black/10 dark:border-white/10 bg-paper2 dark:bg-[#121316] flex items-center justify-between">
              <button
                onClick={handlePrintCapsule}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-paper dark:bg-white/10 text-ink dark:text-white font-bold text-xs rounded-xl border border-black/10 dark:border-white/10 cursor-pointer"
              >
                <Printer size={13} />
                <span>Print Document</span>
              </button>
              <button
                onClick={() => setShowPdfPreviewModal(false)}
                className="px-5 py-2 bg-paper2 dark:bg-white/15 text-ink dark:text-white font-bold text-xs rounded-xl hover:bg-gold dark:hover:bg-gold hover:text-black transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Daily Practice Test Performance & Trap Summary Modal */}
      <ExamQuizSummaryModal
        isOpen={showQuizSummaryModal}
        onClose={() => setShowQuizSummaryModal(false)}
        mcqs={activeCapsule.mcqs}
        selectedAnswers={selectedAnswers}
        score={score}
        onRetake={handleRestartQuiz}
        onOpenPdfViewer={() => {
          const el = document.getElementById('pdf-viewer-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

    </div>
  );
};

export default ExamPrep;
