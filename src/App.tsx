import React, { Suspense, lazy, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import { AnalyticsTracker } from './components/AnalyticsTracker';
import { OfflineToast } from './components/OfflineToast';
import { notificationService } from './services/notificationService';
import { AdminRoute } from './components/auth/AdminRoute';
import { RefreshCw, Home as HomeIcon, AlertCircle } from 'lucide-react';

/**
 * Resilient lazy loader that auto-recovers from dynamic import errors caused by stale build chunks
 */
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T } | any>,
  componentName: string
) {
  return lazy(async () => {
    try {
      const module: any = await factory();
      if (module && module.default) {
        return { default: module.default };
      }
      if (module && module[componentName]) {
        return { default: module[componentName] };
      }
      return { default: module };
    } catch (error: any) {
      console.warn(`Dynamic chunk loading failed for ${componentName}:`, error);
      const retryKey = `retry_import_${componentName}`;
      const hasRetried = window.sessionStorage.getItem(retryKey);
      if (!hasRetried) {
        window.sessionStorage.setItem(retryKey, 'true');
        window.location.reload();
        return new Promise(() => {}); // Wait for reload
      }
      window.sessionStorage.removeItem(retryKey);
      throw error;
    }
  });
}

/**
 * Global ErrorBoundary to catch dynamic import chunk errors or render failures
 */
class RouteErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; isChunkError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, isChunkError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    const isChunk = Boolean(
      error?.message &&
      (error.message.includes('Failed to fetch dynamically imported module') ||
       error.message.includes('dynamically imported module') ||
       error.message.includes('Loading chunk') ||
       error.message.includes('Importing a module script failed'))
    );
    return { hasError: true, isChunkError: isChunk, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Route error caught by RouteErrorBoundary:', error, info);
    // If it's a chunk fetch failure, trigger a one-time clean reload
    if (this.state.isChunkError) {
      const reloadKey = 'route_chunk_error_reload';
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem(reloadKey, now.toString());
        window.location.reload();
      }
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-serif font-bold text-ink dark:text-white mb-2">
            {this.state.isChunkError ? 'New Update Available' : 'Something went wrong'}
          </h2>
          <p className="text-xs text-ink3 dark:text-white/60 max-w-md mb-6">
            {this.state.isChunkError
              ? 'A fresh version of FActHub was loaded. Please refresh the page to update the application assets.'
              : 'An unexpected error occurred while loading this view. You can refresh or head back home.'}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReload}
              className="flex items-center gap-2 px-5 py-2.5 bg-gold hover:bg-gold-l text-black font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Refresh Page</span>
            </button>
            <Link
              to="/"
              onClick={() => this.setState({ hasError: false, isChunkError: false, error: null })}
              className="flex items-center gap-2 px-5 py-2.5 bg-paper2 dark:bg-white/10 hover:bg-black/5 dark:hover:bg-white/20 text-ink dark:text-white font-bold text-xs rounded-xl border border-black/10 dark:border-white/10 transition-all"
            >
              <HomeIcon size={14} />
              <span>Back Home</span>
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Home = lazyWithRetry(() => import('./pages/Home').then(m => ({ default: m.Home })), 'Home');
const Article = lazyWithRetry(() => import('./pages/Article').then(m => ({ default: m.Article })), 'Article');
const Section = lazyWithRetry(() => import('./pages/Section').then(m => ({ default: m.Section })), 'Section');
const Quiz = lazyWithRetry(() => import('./pages/Quiz').then(m => ({ default: m.Quiz })), 'Quiz');
const Birthdays = lazyWithRetry(() => import('./pages/Birthdays').then(m => ({ default: m.Birthdays })), 'Birthdays');
const About = lazyWithRetry(() => import('./pages/StaticPages').then(m => ({ default: m.About })), 'About');
const Contact = lazyWithRetry(() => import('./pages/StaticPages').then(m => ({ default: m.Contact })), 'Contact');
const Privacy = lazyWithRetry(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })), 'Privacy');
const Advertise = lazyWithRetry(() => import('./pages/Advertise').then(m => ({ default: m.Advertise })), 'Advertise');
const Sitemap = lazyWithRetry(() => import('./pages/Sitemap').then(m => ({ default: m.Sitemap })), 'Sitemap');
const ExamPrep = lazyWithRetry(() => import('./pages/ExamPrep').then(m => ({ default: m.ExamPrep || m.default })), 'ExamPrep');
const Magazine = lazyWithRetry(() => import('./pages/Magazine').then(m => ({ default: m.Magazine })), 'Magazine');
const AdminAIPanel = lazyWithRetry(() => import('./pages/AdminAIPanel').then(m => ({ default: m.AdminAIPanel })), 'AdminAIPanel');
const DailyStreakChallenge = lazyWithRetry(() => import('./pages/DailyStreakChallenge').then(m => ({ default: m.DailyStreakChallenge })), 'DailyStreakChallenge');
const StudentNotebook = lazyWithRetry(() => import('./pages/StudentNotebook').then(m => ({ default: m.StudentNotebook })), 'StudentNotebook');
const Bookmarks = lazyWithRetry(() => import('./pages/Bookmarks').then(m => ({ default: m.Bookmarks })), 'Bookmarks');
const Flashcards = lazyWithRetry(() => import('./pages/Flashcards').then(m => ({ default: m.Flashcards })), 'Flashcards');
const CalendarExplorer = lazyWithRetry(() => import('./pages/CalendarExplorer').then(m => ({ default: m.CalendarExplorer })), 'CalendarExplorer');
const InteractiveTimeline = lazyWithRetry(() => import('./pages/InteractiveTimeline').then(m => ({ default: m.InteractiveTimeline })), 'InteractiveTimeline');
const TopicComparison = lazyWithRetry(() => import('./pages/TopicComparison').then(m => ({ default: m.TopicComparison })), 'TopicComparison');
const DailyStudySheet = lazyWithRetry(() => import('./pages/DailyStudySheet').then(m => ({ default: m.DailyStudySheet })), 'DailyStudySheet');
const CommunitySubmit = lazyWithRetry(() => import('./pages/CommunitySubmit').then(m => ({ default: m.CommunitySubmit })), 'CommunitySubmit');
const SEOToolkit = lazyWithRetry(() => import('./pages/SEOToolkit').then(m => ({ default: m.SEOToolkit })), 'SEOToolkit');

const LoadingSpinner = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  useEffect(() => {
    // 1. Initialize Theme from localStorage
    try {
      const savedTheme = localStorage.getItem('facthub_theme');
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // fallback
    }

    // 2. Check scheduled notifications if enabled
    notificationService.checkAndTriggerScheduledReminders();
    const interval = setInterval(() => {
      notificationService.checkAndTriggerScheduledReminders();
    }, 1000 * 60 * 30); // check every 30 mins

    return () => clearInterval(interval);
  }, []);

  return (
    <HelmetProvider>
      <Router>
        <AnalyticsTracker />
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <RouteErrorBoundary>
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/article/:id" element={<Article />} />
                    <Route path="/category/:cat" element={<Section />} />
                    <Route path="/quiz" element={<Quiz />} />
                    <Route path="/birthdays" element={<Birthdays />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/advertise" element={<Advertise />} />
                    <Route path="/sitemap" element={<Sitemap />} />
                    <Route path="/exam-prep" element={<ExamPrep />} />
                    <Route path="/magazine" element={<AdminRoute><Magazine /></AdminRoute>} />
                    <Route path="/admin/ai-creator" element={<AdminRoute><AdminAIPanel /></AdminRoute>} />
                    <Route path="/daily-streak" element={<DailyStreakChallenge />} />
                    <Route path="/notebook" element={<StudentNotebook />} />
                    <Route path="/bookmarks" element={<Bookmarks />} />
                    <Route path="/flashcards" element={<Flashcards />} />
                    <Route path="/calendar" element={<CalendarExplorer />} />
                    <Route path="/timeline" element={<InteractiveTimeline />} />
                    <Route path="/compare" element={<TopicComparison />} />
                    <Route path="/daily-study-sheet" element={<DailyStudySheet />} />
                    <Route path="/submit-fact" element={<CommunitySubmit />} />
                    <Route path="/seo-toolkit" element={<SEOToolkit />} />
                  </Routes>
                </Suspense>
              </RouteErrorBoundary>
            </main>
            <Footer />
            <OfflineToast />
          </div>
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
}
