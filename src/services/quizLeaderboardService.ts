import { collection, getDocs, addDoc, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { quizOfflineService } from './quizOfflineService';

export interface QuizLeaderboardEntry {
  id: string;
  userId?: string;
  userName: string;
  userPhoto?: string;
  score: number;
  totalQuestions: number;
  accuracy: number; // 0 - 100 percentage
  timeTakenSeconds: number; // e.g. 35s
  quizDate: string; // e.g. '2026-08-05' or 'all'
  category?: string;
  badge?: string;
  createdAt?: any;
}

const LEADERBOARD_CACHE_KEY = 'facthub_quiz_leaderboard_cache_v1';

// Vibrant realistic seed entries to foster competitive spirit
const SEED_LEADERBOARD_ENTRIES: QuizLeaderboardEntry[] = [
  {
    id: 'seed-1',
    userName: 'Aarav Swaminathan',
    userPhoto: '',
    score: 5,
    totalQuestions: 5,
    accuracy: 100,
    timeTakenSeconds: 32,
    quizDate: '2026-08-05',
    category: 'History',
    badge: '👑 Grandmaster',
    createdAt: '2026-08-05T08:14:00.000Z'
  },
  {
    id: 'seed-2',
    userName: 'Meera Deshmukh (UPSC 2026)',
    userPhoto: '',
    score: 5,
    totalQuestions: 5,
    accuracy: 100,
    timeTakenSeconds: 39,
    quizDate: '2026-08-05',
    category: 'Science',
    badge: '⚡ Speed Ace',
    createdAt: '2026-08-05T09:30:00.000Z'
  },
  {
    id: 'seed-3',
    userName: 'Devanand K. Iyer',
    userPhoto: '',
    score: 5,
    totalQuestions: 5,
    accuracy: 100,
    timeTakenSeconds: 46,
    quizDate: '2026-08-05',
    category: 'Inventions',
    badge: '🎯 Sharp Shooter',
    createdAt: '2026-08-05T10:12:00.000Z'
  },
  {
    id: 'seed-4',
    userName: 'Priya Sen',
    userPhoto: '',
    score: 4,
    totalQuestions: 5,
    accuracy: 80,
    timeTakenSeconds: 41,
    quizDate: '2026-08-05',
    category: 'Discoveries',
    badge: '🔥 Top 5%',
    createdAt: '2026-08-05T11:05:00.000Z'
  },
  {
    id: 'seed-5',
    userName: 'Karthik Raja',
    userPhoto: '',
    score: 4,
    totalQuestions: 5,
    accuracy: 80,
    timeTakenSeconds: 52,
    quizDate: '2026-08-05',
    category: 'History',
    badge: '⭐ Scholar',
    createdAt: '2026-08-05T11:45:00.000Z'
  },
  {
    id: 'seed-6',
    userName: 'Ananya Roy',
    userPhoto: '',
    score: 4,
    totalQuestions: 5,
    accuracy: 80,
    timeTakenSeconds: 58,
    quizDate: 'all',
    category: 'General',
    badge: '⭐ Scholar',
    createdAt: '2026-08-05T12:20:00.000Z'
  },
  {
    id: 'seed-7',
    userName: 'Vikram Malhotra',
    userPhoto: '',
    score: 3,
    totalQuestions: 5,
    accuracy: 60,
    timeTakenSeconds: 64,
    quizDate: 'all',
    category: 'Science',
    badge: '📚 Learner',
    createdAt: '2026-08-05T13:00:00.000Z'
  }
];

export const quizLeaderboardService = {
  /**
   * Load leaderboard entries filtered by date or all-time
   */
  async getLeaderboard(quizDate?: string, period: 'date' | 'all' = 'date'): Promise<QuizLeaderboardEntry[]> {
    let entries: QuizLeaderboardEntry[] = [];

    // 1. Try fetching from Firestore if online
    if (quizOfflineService.isOnline()) {
      try {
        const lbRef = collection(db, 'quiz_leaderboard');
        // Fetch top recent entries
        const q = query(lbRef, orderBy('score', 'desc'), limit(100));
        const snapshot = await getDocs(q);
        
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          entries.push({
            id: docSnap.id,
            userId: data.userId,
            userName: data.userName || 'Anonymous Scholar',
            userPhoto: data.userPhoto || '',
            score: Number(data.score) || 0,
            totalQuestions: Number(data.totalQuestions) || 5,
            accuracy: Number(data.accuracy) || 0,
            timeTakenSeconds: Number(data.timeTakenSeconds) || 60,
            quizDate: data.quizDate || 'all',
            category: data.category || 'General',
            badge: data.badge || '',
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
          });
        });

        if (entries.length > 0) {
          // Cache successful Firestore fetch locally
          this.saveCache(entries);
        }
      } catch (err) {
        console.warn('[QuizLeaderboard] Firestore fetch notice, using cached leaderboard:', err);
      }
    }

    // 2. Fall back to local storage cache if offline or Firestore query was empty
    if (entries.length === 0) {
      entries = this.getCache();
    }

    // 3. Fall back to seed entries if cache is also empty
    if (entries.length === 0) {
      entries = [...SEED_LEADERBOARD_ENTRIES];
      this.saveCache(entries);
    }

    // 4. Merge any local offline queued submissions so user sees their own score immediately
    const queued = quizOfflineService.getQueuedSubmissions();
    queued.forEach(q => {
      if (!entries.some(e => e.id === q.id)) {
        entries.push({
          id: q.id,
          userId: q.userId,
          userName: `${q.userName} (Syncing...)`,
          userPhoto: q.userPhoto,
          score: q.score,
          totalQuestions: q.totalQuestions,
          accuracy: q.accuracy,
          timeTakenSeconds: q.timeTakenSeconds,
          quizDate: q.quizDate,
          category: q.category,
          badge: q.badge,
          createdAt: new Date(q.queuedAt).toISOString()
        });
      }
    });

    // 5. Apply date/category filter
    let filtered = entries;
    if (period === 'date' && quizDate && quizDate !== 'all') {
      const dateMatches = entries.filter(e => e.quizDate === quizDate);
      if (dateMatches.length > 0) {
        filtered = dateMatches;
      }
    }

    // 6. Sort by: Score DESC, then Time ASC (faster is better)
    filtered.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return (a.timeTakenSeconds || 60) - (b.timeTakenSeconds || 60);
    });

    return filtered;
  },

  /**
   * Submit a new score to the leaderboard
   */
  async submitScore(entry: Omit<QuizLeaderboardEntry, 'id' | 'createdAt'>): Promise<{ success: boolean; id: string }> {
    // Generate appropriate badge
    let badge = '⭐ Scholar';
    if (entry.accuracy === 100) {
      badge = entry.timeTakenSeconds <= 35 ? '⚡ Speed Ace' : '👑 Grandmaster';
    } else if (entry.accuracy >= 80) {
      badge = '🎯 Sharp Shooter';
    } else if (entry.accuracy >= 60) {
      badge = '🔥 Top Performer';
    }

    const payload = {
      ...entry,
      badge
    };

    // If offline, queue for sync
    if (!quizOfflineService.isOnline()) {
      quizOfflineService.queueLeaderboardSubmission(payload);
      return { success: true, id: `offline-${Date.now()}` };
    }

    // Attempt online Firestore submission
    try {
      const docRef = await addDoc(collection(db, 'quiz_leaderboard'), {
        ...payload,
        createdAt: serverTimestamp()
      });

      // Update local cache
      const cached = this.getCache();
      cached.unshift({
        ...payload,
        id: docRef.id,
        createdAt: new Date().toISOString()
      });
      this.saveCache(cached);

      return { success: true, id: docRef.id };
    } catch (err) {
      console.warn('[QuizLeaderboard] Submission to Firestore failed, saving to offline queue:', err);
      quizOfflineService.queueLeaderboardSubmission(payload);
      return { success: true, id: `queued-${Date.now()}` };
    }
  },

  /**
   * Sync any pending queued offline submissions
   */
  async syncOfflineSubmissions(): Promise<number> {
    if (!quizOfflineService.isOnline()) return 0;
    const queue = quizOfflineService.getQueuedSubmissions();
    if (queue.length === 0) return 0;

    let synced = 0;
    for (const item of queue) {
      try {
        await addDoc(collection(db, 'quiz_leaderboard'), {
          userName: item.userName,
          userId: item.userId || null,
          userPhoto: item.userPhoto || null,
          score: item.score,
          totalQuestions: item.totalQuestions,
          accuracy: item.accuracy,
          timeTakenSeconds: item.timeTakenSeconds,
          quizDate: item.quizDate,
          category: item.category || 'General',
          badge: item.badge || '⭐ Scholar',
          createdAt: serverTimestamp()
        });
        synced++;
      } catch (e) {
        console.warn('[QuizLeaderboard] Error syncing queued score:', e);
      }
    }

    if (synced === queue.length) {
      quizOfflineService.clearQueuedSubmissions();
    }
    return synced;
  },

  getCache(): QuizLeaderboardEntry[] {
    try {
      const raw = localStorage.getItem(LEADERBOARD_CACHE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  },

  saveCache(entries: QuizLeaderboardEntry[]): void {
    try {
      localStorage.setItem(LEADERBOARD_CACHE_KEY, JSON.stringify(entries.slice(0, 100)));
    } catch {}
  }
};
