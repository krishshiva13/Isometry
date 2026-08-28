import { SavedFactNote, UserStreakData } from '../types';

const NOTEBOOK_STORAGE_KEY = 'facthub_student_notebook';
const STREAK_STORAGE_KEY = 'facthub_user_streak_data';

export const notebookService = {
  // Get all saved notes
  getSavedNotes(): SavedFactNote[] {
    try {
      const data = localStorage.getItem(NOTEBOOK_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // Save or update note
  saveNote(note: SavedFactNote): SavedFactNote[] {
    const notes = this.getSavedNotes();
    const existingIndex = notes.findIndex(n => n.factId === note.factId);
    let updated: SavedFactNote[];

    if (existingIndex >= 0) {
      updated = [...notes];
      updated[existingIndex] = { ...updated[existingIndex], ...note };
    } else {
      updated = [note, ...notes];
    }

    try {
      localStorage.setItem(NOTEBOOK_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Local storage save failed", e);
    }
    return updated;
  },

  // Remove note
  deleteNote(factId: string): SavedFactNote[] {
    const notes = this.getSavedNotes();
    const updated = notes.filter(n => n.factId !== factId);
    try {
      localStorage.setItem(NOTEBOOK_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Local storage delete failed", e);
    }
    return updated;
  },

  // Check if fact is saved
  isFactSaved(factId: string): boolean {
    const notes = this.getSavedNotes();
    return notes.some(n => n.factId === factId);
  },

  // Get note for a fact
  getNoteForFact(factId: string): SavedFactNote | undefined {
    const notes = this.getSavedNotes();
    return notes.find(n => n.factId === factId);
  },

  // Get list of all distinct folders
  getAllFolders(): string[] {
    const notes = this.getSavedNotes();
    const defaultFolders: string[] = ['General Revision', 'Modern Indian History', 'ISRO & Space', 'Science & Inventions', 'UPSC Static GK'];
    const customFolders = Array.from(new Set(notes.map(n => n.folder).filter((f): f is string => Boolean(f))));
    return Array.from(new Set([...defaultFolders, ...customFolders])) as string[];
  },

  // STREAK SERVICE METHODS
  getUserStreak(): UserStreakData {
    try {
      const data = localStorage.getItem(STREAK_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {}

    return {
      currentStreak: 0,
      longestStreak: 0,
      lastPlayedDate: '',
      totalQuizzesTaken: 0,
      totalCorrectAnswers: 0,
      badges: [],
      recentScores: []
    };
  },

  recordQuizAttempt(score: number, total: number): UserStreakData {
    const streak = this.getUserStreak();
    const today = new Date().toISOString().split('T')[0];
    
    // Check if played yesterday to maintain streak
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let newCurrentStreak = streak.currentStreak;

    if (streak.lastPlayedDate === today) {
      // Already played today, streak remains
    } else if (streak.lastPlayedDate === yesterday) {
      // Played yesterday! Streak increments
      newCurrentStreak += 1;
    } else {
      // Streak reset or started fresh
      newCurrentStreak = 1;
    }

    const newLongestStreak = Math.max(streak.longestStreak, newCurrentStreak);
    const newTotalQuizzes = streak.totalQuizzesTaken + 1;
    const newTotalCorrect = streak.totalCorrectAnswers + score;

    // Badges calculation
    const badges = new Set(streak.badges);
    if (newCurrentStreak >= 1) badges.add('Novice Learner 🎯');
    if (newCurrentStreak >= 3) badges.add('3-Day Streak Master 🔥');
    if (newCurrentStreak >= 7) badges.add('Week Warrior ⚡');
    if (newCurrentStreak >= 14) badges.add('Two-Week Titan 🏆');
    if (score === total && total >= 5) badges.add('Flawless 5/5 Ace ⭐');
    if (newTotalCorrect >= 50) badges.add('Century Mind 🧠');

    const updatedData: UserStreakData = {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastPlayedDate: today,
      totalQuizzesTaken: newTotalQuizzes,
      totalCorrectAnswers: newTotalCorrect,
      badges: Array.from(badges) as string[],
      recentScores: [
        { date: today, score, total },
        ...(streak.recentScores || []).slice(0, 14)
      ]
    };

    try {
      localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(updatedData));
    } catch {}

    return updatedData;
  }
};
