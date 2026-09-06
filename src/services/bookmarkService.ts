import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Fact, UserBookmark } from '../types';

const LOCAL_BOOKMARKS_KEY = 'facthub_local_bookmarks';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Local storage fallback helpers
function getLocalBookmarks(): UserBookmark[] {
  try {
    const raw = localStorage.getItem(LOCAL_BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalBookmarks(bookmarks: UserBookmark[]) {
  try {
    localStorage.setItem(LOCAL_BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch (e) {
    console.warn("Failed saving bookmarks to localStorage:", e);
  }
}

export const bookmarkService = {
  // Get all bookmarks for user (from Firestore when signed in, otherwise localStorage)
  async getBookmarks(userId?: string | null): Promise<UserBookmark[]> {
    if (!userId) {
      return getLocalBookmarks();
    }

    const path = `users/${userId}/bookmarks`;
    try {
      const q = query(collection(db, path), orderBy('bookmarkedAt', 'desc'));
      const snapshot = await getDocs(q);
      const list: UserBookmark[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          userId,
          factId: data.factId || docSnap.id,
          factTitle: data.factTitle || '',
          factEmoji: data.factEmoji || '💡',
          factCat: data.factCat || 'history',
          factYear: data.factYear,
          factExcerpt: data.factExcerpt || '',
          factImageUrl: data.factImageUrl || '',
          bookmarkedAt: data.bookmarkedAt?.toDate ? data.bookmarkedAt.toDate().toISOString() : (data.bookmarkedAt || new Date().toISOString())
        });
      });

      // Update local storage cache for offline capability
      saveLocalBookmarks(list);
      return list;
    } catch (err: any) {
      console.warn(`Firestore getBookmarks failed for path ${path}, falling back to local storage:`, err);
      // Fall back to local storage gracefully if offline
      return getLocalBookmarks();
    }
  },

  // Check if a specific fact is bookmarked
  async isBookmarked(factId: string, userId?: string | null): Promise<boolean> {
    if (!factId) return false;

    // Check local storage cache first for instant UI response
    const local = getLocalBookmarks();
    const isLocallySaved = local.some(b => b.factId === factId);

    if (!userId) {
      return isLocallySaved;
    }

    const path = `users/${userId}/bookmarks/${factId}`;
    try {
      const snap = await getDoc(doc(db, 'users', userId, 'bookmarks', factId));
      return snap.exists();
    } catch {
      return isLocallySaved;
    }
  },

  // Add bookmark to Firestore and local storage
  async addBookmark(fact: Fact, userId?: string | null): Promise<UserBookmark> {
    const bookmarkData: UserBookmark = {
      id: fact.id,
      userId: userId || 'local_guest',
      factId: fact.id,
      factTitle: fact.title,
      factEmoji: fact.emoji || '💡',
      factCat: fact.cat,
      factYear: fact.year,
      factExcerpt: fact.excerpt || fact.full.substring(0, 180),
      factImageUrl: fact.imageUrl || '',
      bookmarkedAt: new Date().toISOString()
    };

    // 1. Update local storage immediately
    const local = getLocalBookmarks();
    const updatedLocal = [bookmarkData, ...local.filter(b => b.factId !== fact.id)];
    saveLocalBookmarks(updatedLocal);
    window.dispatchEvent(new Event('facthub_bookmarks_updated'));

    // 2. Persist to Firestore if user is authenticated
    if (userId) {
      const docPath = `users/${userId}/bookmarks/${fact.id}`;
      try {
        await setDoc(doc(db, 'users', userId, 'bookmarks', fact.id), {
          factId: fact.id,
          factTitle: fact.title,
          factEmoji: fact.emoji || '💡',
          factCat: fact.cat,
          factYear: fact.year ?? null,
          factExcerpt: fact.excerpt || fact.full.substring(0, 180),
          factImageUrl: fact.imageUrl || '',
          bookmarkedAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, docPath);
      }
    }

    return bookmarkData;
  },

  // Remove bookmark from Firestore and local storage
  async removeBookmark(factId: string, userId?: string | null): Promise<void> {
    // 1. Update local storage
    const local = getLocalBookmarks();
    const updatedLocal = local.filter(b => b.factId !== factId);
    saveLocalBookmarks(updatedLocal);
    window.dispatchEvent(new Event('facthub_bookmarks_updated'));

    // 2. Remove from Firestore if user is authenticated
    if (userId) {
      const docPath = `users/${userId}/bookmarks/${factId}`;
      try {
        await deleteDoc(doc(db, 'users', userId, 'bookmarks', factId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, docPath);
      }
    }
  },

  // Toggle bookmark convenience method
  async toggleBookmark(fact: Fact, userId?: string | null): Promise<boolean> {
    const currentlySaved = await this.isBookmarked(fact.id, userId);
    if (currentlySaved) {
      await this.removeBookmark(fact.id, userId);
      return false;
    } else {
      await this.addBookmark(fact, userId);
      return true;
    }
  }
};
