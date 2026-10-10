import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore, doc, getDocFromServer, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Set log level to avoid repetitive offline status warnings while maintaining critical logging
try {
  setLogLevel('error');
} catch {}

// Initialize Firestore with experimentalForceLongPolling to eliminate 10s backend connection timeout in browser and preview environments
export const db = (() => {
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
    }, firebaseConfig.firestoreDatabaseId || "(default)");
  } catch {
    return getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
  }
})();

export const auth = getAuth(app);

// Test connection on boot as prescribed by Firebase Integration Skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore operating in offline cache mode:', error.message);
    }
  }
}
testConnection();
