import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-ink text-white/50 py-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
        <div className="space-y-4 col-span-1 sm:col-span-2 lg:col-span-1 border-b border-white/5 pb-8 lg:border-0 lg:pb-0">
          <Link to="/" className="text-2xl font-serif font-black text-white tracking-tight">
            F<span className="text-gold">A</span>ctHub
          </Link>
          <p className="text-sm leading-relaxed max-w-sm">
            Your daily source for amazing facts about history, science, inventions, discoveries, and famous people. Learn something new every day.
          </p>
          <div className="text-xs pt-2 italic">🇮🇳 Made with ❤️ for curious minds worldwide</div>
        </div>

        <div className="space-y-6">
          <h4 className="text-white font-bold text-xs uppercase tracking-widest">Categories</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/category/history" className="hover:text-gold-l transition-colors">⏳ History</Link></li>
            <li><Link to="/category/science" className="hover:text-gold-l transition-colors">🔬 Science</Link></li>
            <li><Link to="/category/inventions" className="hover:text-gold-l transition-colors">💡 Inventions</Link></li>
            <li><Link to="/category/discoveries" className="hover:text-gold-l transition-colors">🔭 Discoveries</Link></li>
            <li><Link to="/birthdays" className="hover:text-gold-l transition-colors">🎂 Birthdays</Link></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="text-white font-bold text-xs uppercase tracking-widest">Explore</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/category/history" className="hover:text-gold-l transition-colors">This Day in History</Link></li>
            <li><Link to="/birthdays" className="hover:text-gold-l transition-colors">Today's Birthdays</Link></li>
            <li><Link to="/quiz" className="hover:text-gold-l transition-colors">Daily Quiz</Link></li>
            <li><Link to="/" className="hover:text-gold-l transition-colors">Fact of the Day</Link></li>
            <li><Link to="/category/science" className="hover:text-gold-l transition-colors">Random Fact</Link></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="text-white font-bold text-xs uppercase tracking-widest">About</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/about" className="hover:text-gold-l transition-colors">About FActHub</Link></li>
            <li><Link to="/contact" className="hover:text-gold-l transition-colors">Contact Us</Link></li>
            <li><Link to="/privacy" className="hover:text-gold-l transition-colors">Privacy Policy</Link></li>
            <li><Link to="/advertise" className="hover:text-gold-l transition-colors">Advertise</Link></li>
            <li><Link to="/sitemap" className="hover:text-gold-l transition-colors">Sitemap</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
        <div>© 2025 FActHub. All rights reserved.</div>
        <div className="flex gap-6">
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          <Link to="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
        </div>
        <div className="text-white/20">Facts verified — updated daily</div>
      </div>
    </footer>
  );
};
