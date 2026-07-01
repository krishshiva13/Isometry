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
import { Fact, Birthday, QuizQuestion, Subscriber, ContactMessage } from "../types";

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
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async createFact(fact: Fact) {
    const path = `facts/${fact.id}`;
    try {
      const docRef = doc(db, "facts", fact.id);
      await setDoc(docRef, {
        ...fact,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
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

  async getQuizQuestions() {
    const path = "quiz_questions";
    try {
      const q = query(collection(db, path), orderBy("createdAt", "desc"), limit(10));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as QuizQuestion));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async updateQuiz(questions: Omit<QuizQuestion, 'id'>[]) {
    try {
      // 1. Get old questions to delete (clean up)
      const q = query(collection(db, "quiz_questions"));
      const snapshot = await getDocs(q);
      for (const d of snapshot.docs) {
        await deleteDoc(doc(db, "quiz_questions", d.id));
      }
      
      // 2. Add new ones
      for (const question of questions) {
        await addDoc(collection(db, "quiz_questions"), {
          ...question,
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
