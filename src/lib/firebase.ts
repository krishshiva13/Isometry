import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Firestore cleanly to ensure high-performance and compatibility in iframe/sandboxed previews
export const db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId || "(default)");

export const auth = getAuth(app);
