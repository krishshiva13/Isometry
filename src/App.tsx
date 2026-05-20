import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';
import { HelmetProvider } from 'react-helmet-async';

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

const LoadingSpinner = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <HelmetProvider>
      <Router>
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
