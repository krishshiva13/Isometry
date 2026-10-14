import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Clean cache-busting reload helper that runs at most once per 60 seconds
async function handleStaleChunkError() {
  const reloadKey = 'facthub_chunk_reload_ts';
  const lastReload = sessionStorage.getItem(reloadKey);
  const now = Date.now();

  // Guard against reload loops: allow at most 1 reload per 45s
  if (lastReload && now - parseInt(lastReload, 10) < 45000) {
    console.warn('[Chunk Loader] Suppressing secondary reload loop.');
    return;
  }

  sessionStorage.setItem(reloadKey, now.toString());

  // Purge any stale service worker caches before reloading
  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.update()));
    }
  } catch (e) {
    console.warn('[Chunk Loader] Cache purge error:', e);
  }

  // Reload with cache-busting parameter
  const url = new URL(window.location.href);
  url.searchParams.set('_v', now.toString());
  window.location.replace(url.toString());
}

// Handle dynamic module chunk loading failures (e.g. new deployment with new hash)
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  handleStaleChunkError();
});

// Catch uncaught script chunk loading failures
window.addEventListener('error', (event) => {
  if (
    event.message &&
    (event.message.includes('Failed to fetch dynamically imported module') ||
     event.message.includes('Importing a module script failed') ||
     event.message.includes('error loading dynamically imported module'))
  ) {
    handleStaleChunkError();
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
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        // Automatically check for service worker updates on page load
        registration.update().catch(() => {});
      })
      .catch((err) => {
        console.warn('[SW] Service worker registration skipped:', err);
      });
  });
}
