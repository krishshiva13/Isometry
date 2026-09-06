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

export interface VocabularyWord {
  word: string;
  phonetic?: string; // e.g. "/prəˈfaʊnd/"
  partOfSpeech?: 'noun' | 'verb' | 'adjective' | 'adverb' | 'idiom' | string;
  meaning: string;
  hindiMeaning?: string;
  synonyms?: string[];
  exampleSentence?: string;
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
  vocabulary?: VocabularyWord[];
  socialPostDigest?: string;
  searchKeywords?: string[];
  targetKeyword?: string;
  affiliateProducts?: AffiliateProduct[];
  factCheckSummary?: string;
  verificationStatus?: string;
  trustedSources?: Array<{ title: string; uri: string }>;
  // Rich SEO & Google Page 1 Ranking Metadata
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  focusKeyword?: string;
  secondaryKeywords?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  searchIntent?: 'Informational' | 'Educational' | 'Commercial' | 'Exam Prep' | string;
  seoScore?: number;
  estimatedReadTimeMinutes?: number;
}

export interface SEOKeywordResearchResult {
  topic: string;
  focusKeyword: string;
  searchIntent: 'Informational' | 'Educational' | 'Commercial' | 'Exam Prep' | string;
  searchVolumeTier: 'Very High (100k+)' | 'High (50k-100k)' | 'Medium (10k-50k)' | 'Emerging Trend (<10k)';
  competitionLevel: 'Low' | 'Medium' | 'High';
  difficultyScore: number; // 0 - 100
  secondaryKeywords: string[];
  longTailKeywords: string[];
  peopleAlsoAsk: Array<{ question: string; snippetAnswer: string; targetHeading: 'H2' | 'H3' }>;
  titleTagIdeas: Array<{ title: string; characterCount: number; clickHook: string }>;
  metaDescription: string;
  suggestedTags: string[];
  faqSchema: Array<{ question: string; answer: string }>;
  contentOutline: Array<{ headingLevel: 'H1' | 'H2' | 'H3'; text: string; rationale: string }>;
  rankingTips: string[];
}

export interface SEOAuditCheckItem {
  id: string;
  label: string;
  status: 'pass' | 'warning' | 'fail';
  scoreImpact: number;
  currentValue?: string | number;
  recommendedValue: string;
  explanation: string;
}

export interface SEOAuditReport {
  overallScore: number; // 0 - 100
  rating: 'Poor' | 'Average' | 'Good' | 'Excellent (Page 1 Ready)';
  checks: SEOAuditCheckItem[];
  criticalFixes: string[];
  recommendedImprovements: string[];
  wordCount: number;
  readingTimeMinutes: number;
  keywordDensity: number;
  headingsCount: { h1: number; h2: number; h3: number };
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
  faqs?: Array<{ question: string; answer: string }>;
  bilingualTerms?: BilingualTerm[];
  vocabulary?: VocabularyWord[];
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

export interface UserBookmark {
  id: string;
  userId: string;
  factId: string;
  factTitle: string;
  factEmoji?: string;
  factCat: string;
  factYear?: number;
  factExcerpt?: string;
  factImageUrl?: string;
  bookmarkedAt: string;
}


