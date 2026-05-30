import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Check for standard Google Analytics 4 Measurement ID
    // Look in import.meta.env for VITE_GA_MEASUREMENT_ID
    const measurementId = (import.meta as any).env?.VITE_GA_MEASUREMENT_ID;

    if (!measurementId || measurementId.trim() === '' || measurementId === 'G-XXXXXXXXXX') {
      return;
    }

    // Load gtag script dynamically if not already loaded in head
    const scriptId = 'google-analytics-gtag';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);

      const inlineScript = document.createElement('script');
      inlineScript.id = 'google-analytics-inline';
      inlineScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', '${measurementId}', { 'send_page_view': false });
      `;
      document.head.appendChild(inlineScript);
    }

    // Trigger page_view event on route change
    // Using a micro-timeout ensures the title of the document is correctly updated
    // by libraries like react-helmet-async before we trigger the page_view.
    const timer = setTimeout(() => {
      if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'page_view', {
          page_path: location.pathname + location.search,
          page_location: window.location.href,
          page_title: document.title,
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  return null;
}
