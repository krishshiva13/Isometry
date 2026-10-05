import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Handle dynamic module chunk loading failures (e.g., stale deployment asset hashes)
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  const reloadKey = 'facthub_chunk_reload_ts';
  const lastReload = sessionStorage.getItem(reloadKey);
  const now = Date.now();
  if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
    sessionStorage.setItem(reloadKey, now.toString());
    window.location.reload();
  }
});

// Also catch uncaught chunk errors in global error handler
window.addEventListener('error', (event) => {
  if (
    event.message &&
    (event.message.includes('Failed to fetch dynamically imported module') ||
     event.message.includes('Importing a module script failed') ||
     event.message.includes('error loading dynamically imported module') ||
     event.message.includes('Cannot read properties of undefined') && event.message.includes('ExamPrep'))
  ) {
    const reloadKey = 'facthub_chunk_reload_ts';
    const lastReload = sessionStorage.getItem(reloadKey);
    const now = Date.now();
    if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
      sessionStorage.setItem(reloadKey, now.toString());
      window.location.reload();
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Progressive Web App Service Worker for offline quiz caching & assets
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[SW] Service worker registration skipped:', err);
    });
  });
}

