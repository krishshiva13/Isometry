import { collection, doc, getDocs, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Fact } from '../types';

export interface ReadLaterItem {
  id: string; // articleId
  articleId: string;
  title: string;
  excerpt: string;
  category: string;
  year?: number;
  emoji?: string;
  readStatus: 'unread' | 'read';
  savedAt: string;
}

const LOCAL_STORAGE_KEY = 'facthub_read_later_v1';

class ReadLaterService {
  private listeners: Set<() => void> = new Set();
  private cache: ReadLaterItem[] = [];
  private cacheLoaded = false;

  constructor() {
    this.loadFromLocal();
  }

  private loadFromLocal(): ReadLaterItem[] {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        this.cache = JSON.parse(raw);
        this.cacheLoaded = true;
        return this.cache;
      }
    } catch {}
    this.cache = [];
    this.cacheLoaded = true;
    return [];
  }

  private saveToLocal(items: ReadLaterItem[]) {
    this.cache = items;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch {}
    this.notify();
  }

  private notify() {
    this.listeners.forEach(l => {
      try { l(); } catch {}
    });
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  isReadLater(articleId: string): boolean {
    if (!this.cacheLoaded) this.loadFromLocal();
    return this.cache.some(item => item.articleId === articleId);
  }

  async getReadLaterList(): Promise<ReadLaterItem[]> {
    const local = this.loadFromLocal();
    const user = auth.currentUser;

    if (!user) {
      return local;
    }

    try {
      const colRef = collection(db, 'users', user.uid, 'read_later');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const firestoreItems: ReadLaterItem[] = snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            articleId: data.articleId || d.id,
            title: data.title || '',
            excerpt: data.excerpt || '',
            category: data.category || 'history',
            year: data.year,
            emoji: data.emoji,
            readStatus: data.readStatus || 'unread',
            savedAt: data.savedAt || new Date().toISOString()
          };
        });

        // Merge local and firestore
        const mergedMap = new Map<string, ReadLaterItem>();
        local.forEach(i => mergedMap.set(i.articleId, i));
        firestoreItems.forEach(i => mergedMap.set(i.articleId, i));

        const merged = Array.from(mergedMap.values());
        this.saveToLocal(merged);
        return merged;
      }
    } catch (err) {
      console.warn('[ReadLater] Firestore fetch notice, using local cache:', err);
    }

    return local;
  }

  async addToReadLater(fact: Fact): Promise<void> {
    const newItem: ReadLaterItem = {
      id: fact.id,
      articleId: fact.id,
      title: fact.title,
      excerpt: fact.excerpt,
      category: fact.cat,
      year: fact.year,
      emoji: fact.emoji,
      readStatus: 'unread',
      savedAt: new Date().toISOString()
    };

    const current = this.loadFromLocal().filter(i => i.articleId !== fact.id);
    const updated = [newItem, ...current];
    this.saveToLocal(updated);

    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'read_later', fact.id);
        await setDoc(docRef, {
          articleId: fact.id,
          title: fact.title,
          excerpt: fact.excerpt,
          category: fact.cat,
          year: fact.year,
          emoji: fact.emoji || '',
          readStatus: 'unread',
          savedAt: new Date().toISOString(),
          updatedAt: serverTimestamp()
        });
      } catch (e) {
        console.warn('[ReadLater] Failed to sync add to Firestore:', e);
      }
    }
  }

  async removeFromReadLater(articleId: string): Promise<void> {
    const current = this.loadFromLocal();
    const updated = current.filter(i => i.articleId !== articleId);
    this.saveToLocal(updated);

    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'read_later', articleId);
        await deleteDoc(docRef);
      } catch (e) {
        console.warn('[ReadLater] Failed to sync delete from Firestore:', e);
      }
    }
  }

  async toggleReadStatus(articleId: string): Promise<'unread' | 'read'> {
    const current = this.loadFromLocal();
    let newStatus: 'unread' | 'read' = 'read';

    const updated = current.map(item => {
      if (item.articleId === articleId) {
        newStatus = item.readStatus === 'read' ? 'unread' : 'read';
        return { ...item, readStatus: newStatus };
      }
      return item;
    });

    this.saveToLocal(updated);

    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'read_later', articleId);
        await setDoc(docRef, { readStatus: newStatus, updatedAt: serverTimestamp() }, { merge: true });
      } catch (e) {
        console.warn('[ReadLater] Failed to sync status update:', e);
      }
    }

    return newStatus;
  }
}

export const readLaterService = new ReadLaterService();
