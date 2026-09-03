import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore cleanly and safely
export const db = (() => {
  try {
    return getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
  } catch {
    return initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId || "(default)");
  }
})();

export const auth = getAuth(app);
