export type Category = 'history' | 'science' | 'inventions' | 'discoveries' | 'birthdays';

export interface AffiliateProduct {
  title: string;
  authorOrBrand?: string;
  url: string;
  imageUrl?: string;
  badge?: string;
  note?: string;
  price?: string;
  platform?: string;
}

export interface QuizMCQ {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  examCategory?: string;
}

export interface BilingualTerm {
  termEn: string;
  termHi: string;
  meaning: string;
}

export type TopicPillar = 'day_in_history' | 'science_discovery' | 'science' | 'national_important_day' | 'national_days' | 'exam_gk' | 'current_affairs' | 'all_round' | string;

export interface Fact {
  id: string;
  cat: Category;
  emoji: string;
  title: string;
  year: number;
  excerpt: string;
  full: string;
  featured: boolean;
  createdAt?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageCredit?: string;
  eventMonth?: number;
  eventDay?: number;
  publishAt?: string;
  topicType?: TopicPillar;
  examRelevance?: string;
  pyqTags?: string[];
  quizMCQs?: QuizMCQ[];
  bilingualTerms?: BilingualTerm[];
  socialPostDigest?: string;
  searchKeywords?: string[];
  targetKeyword?: string;
  affiliateProducts?: AffiliateProduct[];
  factCheckSummary?: string;
  verificationStatus?: string;
  trustedSources?: Array<{ title: string; uri: string }>;
}

export interface SavedFactNote {
  id: string;
  factId: string;
  factTitle: string;
  factEmoji: string;
  factCategory: Category;
  factYear: number;
  folder: string;
  noteText?: string;
  tags?: string[];
  savedAt: string;
}

export interface UserStreakData {
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string; // YYYY-MM-DD
  totalQuizzesTaken: number;
  totalCorrectAnswers: number;
  badges: string[];
  recentScores: Array<{ date: string; score: number; total: number }>;
}

export interface CommunityFactSubmission {
  id: string;
  title: string;
  category: Category;
  topicType: string;
  year: number;
  eventMonth?: number;
  eventDay?: number;
  excerpt: string;
  fullStory: string;
  sources: string;
  examSignificance?: string;
  submittedBy: string;
  submitterEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface HistoricalTimelineEvent {
  id: string;
  year: number;
  displayDate?: string;
  title: string;
  category: Category;
  era: 'Ancient & Classical' | 'Medieval Era' | 'Modern History & Freedom' | 'Scientific Revolution' | 'Space & Digital Age';
  description: string;
  factId?: string;
  imageUrl?: string;
  keyLeadersOrMinds?: string[];
  examSignificance?: string;
}

export interface Birthday {
  id: string;
  name: string;
  year: number;
  field: string;
  date: string;
  color: string;
  init: string;
  createdAt?: string;
}

export interface QuizQuestion {
  id: string;
  q: string;
  opts: string[];
  correct: number;
  cat: string;
  explanation?: string;
  date?: string;
  createdAt?: string;
}

export interface Subscriber {
  email: string;
  subscribedAt: string;
}

export interface MagazineIssue {
  id: string;
  month: string;
  monthKey: string;
  weekNumber: number;
  issueNumber: number;
  releaseDate: string;
  title: string;
  tagline: string;
  coverImage: string;
  category: string;
  badge?: string;
  featuredStory: {
    title: string;
    excerpt: string;
    fullContent: string;
    author: string;
    readTime: string;
    tags: string[];
  };
  curatedFacts: Array<{
    category: string;
    emoji: string;
    title: string;
    summary: string;
    factId?: string;
  }>;
  examCapsule: Array<{
    topic: string;
    keyTakeaway: string;
    examTarget: string;
  }>;
  brainTeaser: {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
  };
  pdfPages?: number;
  pdfSize?: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  sentAt: string;
}

export interface AIDraft {
  id: string;
  title: string;
  cat: Category;
  emoji: string;
  year: number;
  excerpt: string;
  full: string;
  topicType?: TopicPillar;
  sourceTrend?: string;
  verificationStatus: 'verified' | 'unverified' | 'high_confidence';
  trustedSources: Array<{
    title: string;
    uri: string;
  }>;
  factCheckSummary: string;
  examRelevance: string;
  status: 'pending' | 'approved' | 'rejected' | 'published';
  imageUrl?: string;
  imageAlt?: string;
  imageCredit?: string;
  eventMonth?: number;
  eventDay?: number;
  quizMCQs?: QuizMCQ[];
  bilingualTerms?: BilingualTerm[];
  socialPostDigest?: string;
  searchKeywords?: string[];
  targetKeyword?: string;
  createdAt: string;
  affiliateProducts?: AffiliateProduct[];
}

export interface AIScannerStatus {
  lastScanTime: string | null;
  nextScanTime: string | null;
  scanIntervalHours: number;
  foundItemsCount: number;
  statusMessage: string;
  isRunning: boolean;
  cooldownRemainingMs?: number;
  lastScanTopic?: string;
}

