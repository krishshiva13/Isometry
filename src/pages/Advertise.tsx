import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Megaphone, Target, BarChart3, Users } from 'lucide-react';

export const Advertise = () => {
  return (
    <div className="bg-paper min-h-screen pb-16 fade-in">
      <div className="py-12 border-b border-black/5 mb-12">
        <div className="max-w-7xl mx-auto px-4">
          <Link to="/" className="flex items-center gap-2 text-ink3 hover:text-ink transition-colors mb-6 group w-fit">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg bg-gold text-white">
              <Megaphone size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-serif font-black text-ink">Advertise with Us</h1>
              <p className="text-ink3">Reach millions of curious minds worldwide</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <h2 className="text-3xl font-serif font-bold text-ink">Why Choose FActHub?</h2>
            <p className="text-ink2 leading-relaxed text-lg">
              FActHub is one of the fastest-growing educational platforms. Our readers are engaged, educated, and always looking to learn something new. By advertising with us, you place your brand in front of a highly receptive audience.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-fact">
                <Users className="text-gold mb-3" size={24} />
                <div className="text-2xl font-black text-ink">50K+</div>
                <div className="text-xs font-bold text-ink3 uppercase">Monthly Visitors</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-fact">
                <BarChart3 className="text-gold mb-3" size={24} />
                <div className="text-2xl font-black text-ink">3.5m</div>
                <div className="text-xs font-bold text-ink3 uppercase">Avg Session</div>
              </div>
            </div>
          </div>
          <div className="bg-ink rounded-3xl p-8 text-white space-y-6">
             <Target className="text-gold-l" size={32} />
             <h3 className="text-2xl font-serif font-bold">Target Audience</h3>
             <ul className="space-y-3 text-white/70">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gold-l" /> Students & Educators</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gold-l" /> Competitive Exam Aspirants</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gold-l" /> History & Science Enthusiasts</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gold-l" /> Lifelong Learners (Age 18-45)</li>
             </ul>
          </div>
        </div>

        <h2 className="text-3xl font-serif font-bold text-ink mb-8 text-center">Advertising Options</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-16">
           {[
             { title: 'Display Ads', desc: 'Direct placements via Google AdSense auto-optimized for your campaign.', color: 'bg-coral' },
             { title: 'Sponsored Articles', desc: 'In-depth educational content written by our staff or yours.', color: 'bg-teal' },
             { title: 'Newsletter', desc: 'Direct inbox reach with 5k+ active daily subscribers.', color: 'bg-indigo' }
           ].map(opt => (
             <div key={opt.title} className="bg-white border border-black/10 rounded-2xl p-8 shadow-fact flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-xl mb-6 ${opt.color} flex items-center justify-center text-white font-bold`}>
                  {opt.title[0]}
                </div>
                <h4 className="font-serif font-bold text-lg mb-3">{opt.title}</h4>
                <p className="text-sm text-ink3 leading-relaxed">{opt.desc}</p>
             </div>
           ))}
        </div>

        <div className="bg-gold p-12 rounded-[40px] text-center space-y-6">
           <h2 className="text-3xl font-serif font-black text-ink">Ready to start?</h2>
           <p className="text-ink/70 text-lg">Contact our media team today for a custom rate card.</p>
           <a href="mailto:admin@facthub.in" className="inline-block bg-ink text-white px-12 py-4 rounded-full font-bold hover:bg-ink2 transition-all">
             Contact Sales →
           </a>
        </div>
      </div>
    </div>
  );
};
