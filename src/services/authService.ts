import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export const authService = {
  async syncProfile(user: any) {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName || 'Curious Reader',
        email: user.email || null,
        phoneNumber: user.phoneNumber || null,
        photoURL: user.photoURL || null,
        role: user.email === 'krish02shiva@gmail.com' ? 'admin' : 'user',
        createdAt: serverTimestamp()
      });
    }
  },

  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await this.syncProfile(result.user);
    return result.user;
  },

  async signUpWithEmail(email: string, pass: string, name: string) {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    await setDoc(doc(db, 'users', result.user.uid), {
      uid: result.user.uid,
      name,
      email,
      phoneNumber: null,
      photoURL: null,
      role: 'user',
      createdAt: serverTimestamp()
    });
    return result.user;
  },

  async signInWithEmail(email: string, pass: string) {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    await this.syncProfile(result.user);
    return result.user;
  },

  async logout() {
    await signOut(auth);
  },

  setupRecaptcha(containerId: string) {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
    return (window as any).recaptchaVerifier;
  },

  async sendOtp(phoneNumber: string, verifier: any): Promise<ConfirmationResult> {
    return await signInWithPhoneNumber(auth, phoneNumber, verifier);
  },

  async verifyOtp(confirmationResult: ConfirmationResult, code: string) {
    const result = await confirmationResult.confirm(code);
    await this.syncProfile(result.user);
    return result.user;
  }
};
