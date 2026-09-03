import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { getApps, initializeApp } from 'firebase/app';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import firebaseConfig from '../../firebase-applet-config.json';

export interface NotificationSettings {
  enabled: boolean;
  studySheetReminder: boolean; // Morning reminder at ~8:00 AM
  quizReminder: boolean;       // Evening streak reminder at ~7:00 PM
  lastToken?: string;
  updatedAt?: string;
}

const SETTINGS_KEY = 'facthub_notification_settings';
const LAST_STUDY_REMINDER_DATE_KEY = 'facthub_last_study_notif_date';
const LAST_QUIZ_REMINDER_DATE_KEY = 'facthub_last_quiz_notif_date';

// Public VAPID key or default fallback for web push
const FCM_VAPID_KEY = 'BCP8p-0Vz4l40-sample-facthub-vapid-key';

export const notificationService = {
  // Get stored notification settings
  getSettings(): NotificationSettings {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      enabled: false,
      studySheetReminder: true,
      quizReminder: true,
    };
  },

  // Save notification settings
  saveSettings(settings: NotificationSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
  },

  // Check if Web Push / Messaging is supported in current browser environment
  async checkSupport(): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
        return false;
      }
      return await isSupported();
    } catch {
      return false;
    }
  },

  // Get current browser permission status
  getPermission(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  },

  // Request push notification permissions & register with Firebase Cloud Messaging
  async requestPermissionAndSubscribe(): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        return { success: false, error: 'Push notifications are not supported in this browser.' };
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        const settings = this.getSettings();
        settings.enabled = false;
        this.saveSettings(settings);
        return { success: false, error: 'Notification permission was not granted.' };
      }

      // Register the service worker for background push
      let registration: ServiceWorkerRegistration | undefined;
      try {
        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      } catch (swErr) {
        console.warn('Service worker registration fallback:', swErr);
      }

      let token: string | undefined;

      const supported = await this.checkSupport();
      if (supported) {
        try {
          const app = getApps()[0] || initializeApp(firebaseConfig);
          const messaging = getMessaging(app);

          // Get FCM token
          token = await getToken(messaging, {
            serviceWorkerRegistration: registration,
            vapidKey: FCM_VAPID_KEY,
          }).catch((fcmErr) => {
            console.warn('FCM getToken fallback (using browser push):', fcmErr);
            return `local-browser-token-${Date.now()}`;
          });

          // Set up foreground message listener
          onMessage(messaging, (payload) => {
            console.log('[FCM] Foreground notification received:', payload);
            this.showLocalNotification(
              payload.notification?.title || 'FActHub Daily Study Reminder',
              payload.notification?.body || 'Check today\'s revision sheet & daily challenge!',
              payload.data?.url || '/daily-study-sheet'
            );
          });
        } catch (fcmInitErr) {
          console.warn('FCM initialisation handled gracefully:', fcmInitErr);
          token = `local-browser-token-${Date.now()}`;
        }
      } else {
        token = `local-browser-token-${Date.now()}`;
      }

      // Save settings locally
      const updatedSettings: NotificationSettings = {
        ...this.getSettings(),
        enabled: true,
        lastToken: token,
        updatedAt: new Date().toISOString(),
      };
      this.saveSettings(updatedSettings);

      // If user is logged in, sync token to user profile or notification subscriptions
      if (auth.currentUser && token) {
        try {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          await setDoc(userRef, {
            fcmTokens: [token],
            notificationsEnabled: true,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        } catch (dbErr) {
          console.warn('Syncing token to Firestore profile (safe to ignore if offline/rules):', dbErr);
        }
      }

      return { success: true, token };
    } catch (err: any) {
      console.error('Error requesting notification permission:', err);
      return { success: false, error: err?.message || 'Failed to enable notifications.' };
    }
  },

  // Display a local browser notification
  showLocalNotification(title: string, body: string, targetUrl: string = '/daily-study-sheet'): void {
    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    try {
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            body,
            icon: '/favicon.jpg',
            badge: '/favicon.jpg',
            data: { url: targetUrl },
          });
        });
      } else {
        const notif = new Notification(title, {
          body,
          icon: '/favicon.jpg',
        });
        notif.onclick = () => {
          window.focus();
          window.location.href = targetUrl;
        };
      }
    } catch (err) {
      console.warn('Could not display local notification:', err);
    }
  },

  // Trigger a test notification immediately so users can test on their device
  async sendTestNotification(): Promise<boolean> {
    const permission = this.getPermission();
    if (permission !== 'granted') {
      const res = await this.requestPermissionAndSubscribe();
      if (!res.success) return false;
    }

    this.showLocalNotification(
      '🎯 FActHub Study Reminder',
      'Great job! Your study notifications are active. We will remind you each day to review your study sheet and take your quiz.',
      '/daily-study-sheet'
    );
    return true;
  },

  // Check and fire reminders based on time of day
  checkAndTriggerScheduledReminders(): void {
    const settings = this.getSettings();
    if (!settings.enabled || this.getPermission() !== 'granted') return;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const hour = now.getHours();

    // Morning Study Sheet Reminder (after 8:00 AM)
    if (settings.studySheetReminder && hour >= 8 && hour < 14) {
      const lastSent = localStorage.getItem(LAST_STUDY_REMINDER_DATE_KEY);
      if (lastSent !== todayStr) {
        this.showLocalNotification(
          '📜 Today\'s 1-Click Study Sheet is Ready!',
          'Review curated historical milestones, bilingual exam vocabulary, and practice questions for today.',
          '/daily-study-sheet'
        );
        localStorage.setItem(LAST_STUDY_REMINDER_DATE_KEY, todayStr);
      }
    }

    // Evening Quiz & Streak Reminder (after 18:00 / 6 PM)
    if (settings.quizReminder && hour >= 18) {
      const lastSent = localStorage.getItem(LAST_QUIZ_REMINDER_DATE_KEY);
      if (lastSent !== todayStr) {
        this.showLocalNotification(
          '🔥 Keep Your Learning Streak Alive!',
          'Test your knowledge with today\'s Daily Streak Challenge quiz and earn study badges.',
          '/daily-streak'
        );
        localStorage.setItem(LAST_QUIZ_REMINDER_DATE_KEY, todayStr);
      }
    }
  }
};
