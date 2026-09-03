// Firebase Cloud Messaging Service Worker for FActHub
// Listens for push notifications and background study reminders

importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
const firebaseConfig = {
  projectId: "isometric-xerocopy-7mvz5",
  appId: "1:573394848883:web:070158a30b520d267cae06",
  apiKey: "AIzaSyDV4TRa7RCgGRO4ucKZdZFogcCUBvfCKJk",
  messagingSenderId: "573394848883"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background push message:', payload);
    const notificationTitle = payload.notification?.title || payload.data?.title || 'FActHub Daily Revision Reminder';
    const notificationOptions = {
      body: payload.notification?.body || payload.data?.body || 'Complete today\'s daily study sheet or challenge yourself with the quiz!',
      icon: payload.notification?.icon || '/favicon.jpg',
      badge: '/favicon.jpg',
      tag: payload.data?.tag || 'facthub-daily-study',
      data: {
        url: payload.data?.url || '/daily-study-sheet'
      }
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (err) {
  console.warn('[firebase-messaging-sw.js] Messaging init warning:', err);
}

// Notification click handler - routes user directly to Study Sheet or Quiz
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/daily-study-sheet';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
