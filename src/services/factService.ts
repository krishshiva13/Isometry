import { 
  collection, 
  getDocs, 
  setDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  Timestamp,
  serverTimestamp,
  getDoc
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { Fact, Birthday, QuizQuestion, Subscriber, ContactMessage, AIDraft } from "../types";

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
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function cleanForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(data)) {
    return data
      .filter(item => item !== undefined)
      .map(item => cleanForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object') {
    // If it's a Firestore Timestamp or serverTimestamp FieldValue or special object
    if (data.constructor && data.constructor.name !== 'Object') {
      return data;
    }
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) {
        cleaned[key] = cleanForFirestore(val);
      }
    }
    return cleaned as T;
  }
  return data;
}

export const factService = {
  async getFacts(cat?: string, featuredOnly: boolean = false, limitCount: number = 20, isAdmin: boolean = false) {
    const path = "facts";
    try {
      // Fetch list ordered by createdAt. Filter in memory to avoid requiring complex composite indexes in Firestore.
      let q = query(collection(db, path), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      let list = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Fact));
      
      if (cat && cat !== 'all') {
        list = list.filter(f => f.cat === cat);
      }
      
      if (featuredOnly) {
        list = list.filter(f => f.featured === true);
      }

      if (!isAdmin) {
        const nowISO = new Date().toISOString();
        list = list.filter(f => !f.publishAt || f.publishAt <= nowISO);
      }
      return list.slice(0, limitCount);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getFactCount(cat?: string, isAdmin: boolean = false) {
    try {
      let q = query(collection(db, "facts"));
      const snapshot = await getDocs(q);
      let list = snapshot.docs.map(doc => doc.data() as Fact);
      if (cat && cat !== 'all') {
        list = list.filter(f => f.cat === cat);
      }
      if (!isAdmin) {
        const nowISO = new Date().toISOString();
        list = list.filter(f => !f.publishAt || f.publishAt <= nowISO);
      }
      return list.length;
    } catch (error) {
      console.error("Failed to get count", error);
      return 0;
    }
  },

  async getFactsPaginated(cat: string | undefined, page: number, pageSize: number = 9, isAdmin: boolean = false) {
    try {
      let q = query(
        collection(db, "facts"), 
        orderBy("createdAt", "desc")
      );
      
      const snapshot = await getDocs(q);
      let allFacts = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Fact));
      
      if (cat && cat !== 'all') {
        allFacts = allFacts.filter(f => f.cat === cat);
      }
      
      if (!isAdmin) {
        const nowISO = new Date().toISOString();
        allFacts = allFacts.filter(f => !f.publishAt || f.publishAt <= nowISO);
      }
      
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      
      return {
        facts: allFacts.slice(start, end),
        totalPages: Math.ceil(allFacts.length / pageSize)
      };
    } catch (error) {
      console.error("Pagination failed", error);
      throw error;
    }
  },

  async getFactById(id: string) {
    const path = `facts/${id}`;
    try {
      const docRef = doc(db, "facts", id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { ...snapshot.data(), id: snapshot.id } as Fact;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async updateFact(id: string, updates: Partial<Fact>) {
    const path = `facts/${id}`;
    try {
      const docRef = doc(db, "facts", id);
      const cleaned = cleanForFirestore({
        ...updates,
        updatedAt: serverTimestamp()
      });
      await updateDoc(docRef, cleaned);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async createFact(fact: Fact) {
    const path = `facts/${fact.id}`;
    try {
      const docRef = doc(db, "facts", fact.id);
      const cleaned = cleanForFirestore({
        ...fact,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      await setDoc(docRef, cleaned);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async deleteFact(id: string) {
    const path = `facts/${id}`;
    try {
      const docRef = doc(db, "facts", id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async getBirthdays(limitCount: number = 20) {
    const path = "birthdays";
    try {
      const q = query(collection(db, path), limit(limitCount));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Birthday));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getQuizQuestions(selectedDate?: string) {
    const path = "quiz_questions";
    try {
      const q = query(collection(db, path), orderBy("createdAt", "desc"), limit(100));
      const snapshot = await getDocs(q);
      const allQuestions = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as QuizQuestion));
      
      if (selectedDate && selectedDate !== 'all') {
        const dateFiltered = allQuestions.filter(q => q.date === selectedDate);
        return dateFiltered;
      }
      return allQuestions;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async createQuizQuestion(question: Omit<QuizQuestion, 'id'>) {
    const path = "quiz_questions";
    try {
      const cleanData: any = {
        q: question.q,
        opts: question.opts,
        correct: Number(question.correct),
        cat: question.cat || 'General',
        createdAt: serverTimestamp()
      };
      if (question.explanation && question.explanation.trim()) {
        cleanData.explanation = question.explanation.trim();
      }
      if (question.date && question.date.trim()) {
        cleanData.date = question.date.trim();
      }

      const docRef = await addDoc(collection(db, path), cleanData);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateQuizQuestion(id: string, updates: Partial<QuizQuestion>) {
    const path = `quiz_questions/${id}`;
    try {
      const docRef = doc(db, "quiz_questions", id);
      const cleanUpdates: any = {
        updatedAt: serverTimestamp()
      };
      if (updates.q !== undefined) cleanUpdates.q = updates.q;
      if (updates.opts !== undefined) cleanUpdates.opts = updates.opts;
      if (updates.correct !== undefined) cleanUpdates.correct = Number(updates.correct);
      if (updates.cat !== undefined) cleanUpdates.cat = updates.cat;
      if (updates.explanation !== undefined) cleanUpdates.explanation = updates.explanation.trim();
      if (updates.date !== undefined) cleanUpdates.date = updates.date.trim();

      await updateDoc(docRef, cleanUpdates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteQuizQuestion(id: string) {
    const path = `quiz_questions/${id}`;
    try {
      const docRef = doc(db, "quiz_questions", id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async updateQuiz(questions: Omit<QuizQuestion, 'id'>[], targetDate?: string) {
    try {
      if (targetDate) {
        // Only delete existing questions for that specific date
        const q = query(collection(db, "quiz_questions"));
        const snapshot = await getDocs(q);
        for (const d of snapshot.docs) {
          const data = d.data();
          if (data.date === targetDate) {
            await deleteDoc(doc(db, "quiz_questions", d.id));
          }
        }
      } else {
        // Clean up all old questions if no date specified
        const q = query(collection(db, "quiz_questions"));
        const snapshot = await getDocs(q);
        for (const d of snapshot.docs) {
          await deleteDoc(doc(db, "quiz_questions", d.id));
        }
      }
      
      // Add new ones
      for (const question of questions) {
        await addDoc(collection(db, "quiz_questions"), {
          ...question,
          date: targetDate || question.date || '',
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
       console.error("Failed to update quiz", error);
       throw error;
    }
  },

  async subscribe(email: string) {
    const path = "subscribers";
    try {
      await addDoc(collection(db, path), {
        email,
        subscribedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async sendContactMessage(msg: Omit<ContactMessage, 'sentAt'>) {
    const path = "contact_messages";
    try {
      await addDoc(collection(db, path), {
        ...msg,
        sentAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async getAIDrafts() {
    const path = "ai_drafts";
    let firestoreDrafts: AIDraft[] = [];
    try {
      const q = query(collection(db, path), orderBy("createdAt", "desc"), limit(50));
      const snapshot = await getDocs(q);
      firestoreDrafts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString())
        } as AIDraft;
      });
    } catch (error: any) {
      // Permission denied is expected for guests / non-admins before login
      if (error?.code !== 'permission-denied') {
        console.warn("Could not fetch AI drafts from firestore, using server store:", error);
      }
    }

    // Also fetch server-side memory store drafts so newly scanned items are immediately available
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/admin/ai/drafts', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const serverDrafts: AIDraft[] = await res.json();
        if (Array.isArray(serverDrafts) && serverDrafts.length > 0) {
          const map = new Map<string, AIDraft>();
          for (const d of firestoreDrafts) {
            map.set(d.id, d);
          }
          for (const d of serverDrafts) {
            if (!map.has(d.id)) {
              map.set(d.id, d);
            }
          }
          return Array.from(map.values()).sort((a, b) => 
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
        }
      }
    } catch (e) {
      // Ignored fallback
    }

    return firestoreDrafts;
  },

  async saveScannedDrafts(drafts: AIDraft[]) {
    if (!drafts || !Array.isArray(drafts) || drafts.length === 0) return;
    for (const draft of drafts) {
      if (!draft.id) continue;
      try {
        await this.createAIDraft(draft);
      } catch (err) {
        // Silently handled
      }
    }
  },

  async createAIDraft(draft: Partial<AIDraft>) {
    const path = "ai_drafts";
    const id = draft.id || `draft-${Date.now()}`;
    const cleaned = cleanForFirestore({
      ...draft,
      id,
      status: draft.status || 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // 1. Save to server backend
    try {
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        await fetch('/api/admin/ai/drafts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(cleaned)
        });
      }
    } catch (apiErr) {
      // Server fallback error
    }

    // 2. Save to Firestore if admin
    try {
      const docRef = doc(db, path, id);
      await setDoc(docRef, cleaned, { merge: true });
    } catch (error: any) {
      if (error?.code !== 'permission-denied') {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    }
    return id;
  },

  async updateAIDraft(id: string, updates: Partial<AIDraft>) {
    const path = `ai_drafts/${id}`;
    const cleaned = cleanForFirestore({
      ...updates,
      updatedAt: serverTimestamp()
    });

    // 1. Update on server backend
    try {
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        await fetch(`/api/admin/ai/drafts/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(cleaned)
        });
      }
    } catch (e) {
      // Server fallback
    }

    // 2. Update in Firestore if admin
    try {
      const docRef = doc(db, "ai_drafts", id);
      await updateDoc(docRef, cleaned);
    } catch (error: any) {
      if (error?.code !== 'permission-denied') {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    }
  },

  async deleteAIDraft(id: string) {
    const path = `ai_drafts/${id}`;
    // 1. Delete on server backend
    try {
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        await fetch(`/api/admin/ai/drafts/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (e) {
      // Server fallback
    }

    // 2. Delete in Firestore
    try {
      const docRef = doc(db, "ai_drafts", id);
      await deleteDoc(docRef);
    } catch (error: any) {
      if (error?.code !== 'permission-denied') {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }
  },

  // Admin seeding (to be used once or for updates)
  async seedData(facts: Fact[], birthdays: Birthday[], quiz: QuizQuestion[]) {
    try {
      // 1. Facts
      const factsSnapshot = await getDocs(collection(db, "facts"));
      const existingFactIds = new Set(factsSnapshot.docs.map(d => d.id));
      
      for (const f of facts) {
        if (!existingFactIds.has(f.id)) {
          await setDoc(doc(db, "facts", f.id), { ...f, createdAt: serverTimestamp() });
          console.log(`Seeded fact: ${f.title}`);
        }
      }

      // 2. Birthdays
      const bSnapshot = await getDocs(collection(db, "birthdays"));
      const existingBIds = new Set(bSnapshot.docs.map(d => d.id));
      for (const b of birthdays) {
        if (!existingBIds.has(b.id)) {
          await setDoc(doc(db, "birthdays", b.id), { ...b, createdAt: serverTimestamp() });
        }
      }

      // 3. Quiz
      const qSnapshot = await getDocs(collection(db, "quiz_questions"));
      const existingQIds = new Set(qSnapshot.docs.map(d => d.id));
      for (const q of quiz) {
        if (!existingQIds.has(q.id)) {
          await setDoc(doc(db, "quiz_questions", q.id), { ...q, createdAt: serverTimestamp() });
        }
      }
    } catch (error: any) {
      // Suppress permission errors during background seeding (likely guest visitors)
      if (error?.code === 'permission-denied') return;
      console.error("Seeding failed", error);
    }
  }
};
