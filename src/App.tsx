import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import { AnalyticsTracker } from './components/AnalyticsTracker';

const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Article = lazy(() => import('./pages/Article').then(m => ({ default: m.Article })));
const Section = lazy(() => import('./pages/Section').then(m => ({ default: m.Section })));
const Quiz = lazy(() => import('./pages/Quiz').then(m => ({ default: m.Quiz })));
const Birthdays = lazy(() => import('./pages/Birthdays').then(m => ({ default: m.Birthdays })));
const About = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.About })));
const Contact = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.Contact })));
const Privacy = lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })));
const Advertise = lazy(() => import('./pages/Advertise').then(m => ({ default: m.Advertise })));
const Sitemap = lazy(() => import('./pages/Sitemap').then(m => ({ default: m.Sitemap })));
const ExamPrep = lazy(() => import('./pages/ExamPrep').then(m => ({ default: m.ExamPrep })));
const Magazine = lazy(() => import('./pages/Magazine').then(m => ({ default: m.Magazine })));
const AdminAIPanel = lazy(() => import('./pages/AdminAIPanel').then(m => ({ default: m.AdminAIPanel })));
const DailyStreakChallenge = lazy(() => import('./pages/DailyStreakChallenge').then(m => ({ default: m.DailyStreakChallenge })));
const StudentNotebook = lazy(() => import('./pages/StudentNotebook').then(m => ({ default: m.StudentNotebook })));
const Flashcards = lazy(() => import('./pages/Flashcards').then(m => ({ default: m.Flashcards })));
const CalendarExplorer = lazy(() => import('./pages/CalendarExplorer').then(m => ({ default: m.CalendarExplorer })));
const InteractiveTimeline = lazy(() => import('./pages/InteractiveTimeline').then(m => ({ default: m.InteractiveTimeline })));
const TopicComparison = lazy(() => import('./pages/TopicComparison').then(m => ({ default: m.TopicComparison })));
const DailyStudySheet = lazy(() => import('./pages/DailyStudySheet').then(m => ({ default: m.DailyStudySheet })));
const CommunitySubmit = lazy(() => import('./pages/CommunitySubmit').then(m => ({ default: m.CommunitySubmit })));

const LoadingSpinner = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <AnalyticsTracker />
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
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
                  <Route path="/magazine" element={<Magazine />} />
                  <Route path="/admin/ai-creator" element={<AdminAIPanel />} />
                  <Route path="/daily-streak" element={<DailyStreakChallenge />} />
                  <Route path="/notebook" element={<StudentNotebook />} />
                  <Route path="/flashcards" element={<Flashcards />} />
                  <Route path="/calendar" element={<CalendarExplorer />} />
                  <Route path="/timeline" element={<InteractiveTimeline />} />
                  <Route path="/compare" element={<TopicComparison />} />
                  <Route path="/daily-study-sheet" element={<DailyStudySheet />} />
                  <Route path="/submit-fact" element={<CommunitySubmit />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
}
