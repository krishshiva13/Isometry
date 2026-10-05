import { QuizQuestion } from '../types';

export interface CachedQuizRecord {
  dateKey: string;
  displayDate: string;
  cachedAt: number;
  questionCount: number;
  categories: string[];
  questions: QuizQuestion[];
}

export interface QueuedLeaderboardSubmission {
  id: string;
  userId?: string;
  userName: string;
  userPhoto?: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeTakenSeconds: number;
  quizDate: string;
  category?: string;
  badge?: string;
  queuedAt: number;
}

const OFFLINE_QUIZZES_STORAGE_KEY = 'facthub_offline_quizzes_v1';
const OFFLINE_QUEUE_STORAGE_KEY = 'facthub_offline_leaderboard_queue_v1';

export const quizOfflineService = {
  /**
   * Save a set of quiz questions for offline availability
   */
  saveQuizForOffline(dateKey: string, questions: QuizQuestion[]): void {
    if (!questions || questions.length === 0) return;
    try {
      const existing = this.getAllCachedQuizzes();
      const categories = Array.from(new Set(questions.map(q => q.cat || 'General')));
      
      const record: CachedQuizRecord = {
        dateKey,
        displayDate: dateKey === 'all' ? 'All Questions Compendium' : `Date: ${dateKey}`,
        cachedAt: Date.now(),
        questionCount: questions.length,
        categories,
        questions
      };

      existing[dateKey] = record;
      localStorage.setItem(OFFLINE_QUIZZES_STORAGE_KEY, JSON.stringify(existing));
    } catch (e) {
      console.warn('[QuizOffline] Failed to save quiz to offline storage:', e);
    }
  },

  /**
   * Retrieve cached quiz questions for a date
   */
  getCachedQuiz(dateKey: string): QuizQuestion[] | null {
    try {
      const existing = this.getAllCachedQuizzes();
      if (existing[dateKey] && existing[dateKey].questions?.length > 0) {
        return existing[dateKey].questions;
      }
      // If 'all' is available and date matches some questions, filter them
      if (existing['all'] && existing['all'].questions) {
        if (dateKey === 'all') return existing['all'].questions;
        const filtered = existing['all'].questions.filter(q => q.date === dateKey);
        if (filtered.length > 0) return filtered;
      }
    } catch (e) {
      console.warn('[QuizOffline] Failed to load quiz from offline storage:', e);
    }
    return null;
  },

  /**
   * Get all cached quizzes dictionary
   */
  getAllCachedQuizzes(): Record<string, CachedQuizRecord> {
    try {
      const raw = localStorage.getItem(OFFLINE_QUIZZES_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[QuizOffline] Corrupted offline quiz storage:', e);
    }
    return {};
  },

  /**
   * List available offline quizzes with summaries
   */
  getAvailableOfflineQuizzes(): Array<{ dateKey: string; count: number; categories: string[]; cachedAt: number }> {
    const all = this.getAllCachedQuizzes();
    return Object.values(all).map((r: CachedQuizRecord) => ({
      dateKey: r.dateKey,
      count: r.questionCount,
      categories: r.categories,
      cachedAt: r.cachedAt
    }));
  },

  /**
   * Check if any quizzes are cached for offline practice
   */
  hasCachedQuizzes(): boolean {
    const all = this.getAllCachedQuizzes();
    return Object.keys(all).length > 0;
  },

  /**
   * Queue a leaderboard submission while offline
   */
  queueLeaderboardSubmission(sub: Omit<QueuedLeaderboardSubmission, 'id' | 'queuedAt'>): void {
    try {
      const queue = this.getQueuedSubmissions();
      const newEntry: QueuedLeaderboardSubmission = {
        ...sub,
        id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        queuedAt: Date.now()
      };
      queue.push(newEntry);
      localStorage.setItem(OFFLINE_QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.warn('[QuizOffline] Failed to queue submission:', e);
    }
  },

  /**
   * Get queued offline submissions
   */
  getQueuedSubmissions(): QueuedLeaderboardSubmission[] {
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('[QuizOffline] Error reading offline queue:', e);
    }
    return [];
  },

  /**
   * Clear queued submissions after syncing
   */
  clearQueuedSubmissions(): void {
    try {
      localStorage.removeItem(OFFLINE_QUEUE_STORAGE_KEY);
    } catch {}
  },

  /**
   * Check current network connectivity
   */
  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  },

  /**
   * Listen to online / offline network state changes
   */
  subscribeNetworkState(onChange: (online: boolean) => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const handleOnline = () => onChange(true);
    const handleOffline = () => onChange(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
};
