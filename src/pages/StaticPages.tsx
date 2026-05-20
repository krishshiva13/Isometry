import React, { useState } from 'react';
import { factService } from '../services/factService';
import { Mail, Clock, Globe, ArrowRight } from 'lucide-react';

export const About = () => (
  <div className="bg-paper min-h-screen">
    <section className="bg-ink py-24 px-4 text-center">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-white text-4xl sm:text-6xl font-serif font-black">We Make Facts <span className="text-gold italic">Fascinating</span></h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">FActHub is your daily destination for the world's most amazing facts — from ancient history to cutting-edge science.</p>
      </div>
    </section>
    <section className="py-24 px-4 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
           <h2 className="text-3xl font-serif font-bold text-ink">Our Mission</h2>
           <p className="text-ink2 leading-relaxed text-lg">FActHub was built on a simple belief: <span className="font-bold">curiosity should be celebrated.</span> Every day, billions of people scroll through endless content — but how often do you stop and learn something that genuinely amazes you?</p>
           <p className="text-ink2 leading-relaxed text-lg">We curate, verify, and present facts about history, science, inventions, discoveries, and the brilliant minds who shaped our world — in a way that is clear, engaging, and always accurate.</p>
        </div>
        <div className="bg-paper2 rounded-fact border border-black/5 p-12 space-y-8 shadow-fact">
           <div className="grid grid-cols-2 gap-8">
              <div><div className="text-4xl font-serif font-bold text-gold">5,000+</div><div className="text-xs font-bold uppercase text-ink3 mt-1">Facts</div></div>
              <div><div className="text-4xl font-serif font-bold text-gold">365</div><div className="text-xs font-bold uppercase text-ink3 mt-1">Daily Pages</div></div>
              <div><div className="text-4xl font-serif font-bold text-gold">10K+</div><div className="text-xs font-bold uppercase text-ink3 mt-1">Profiles</div></div>
              <div><div className="text-4xl font-serif font-bold text-gold">Daily</div><div className="text-xs font-bold uppercase text-ink3 mt-1">Updates</div></div>
           </div>
        </div>
      </div>
    </section>
  </div>
);

export const Contact = () => {
    const [status, setStatus] = useState("");
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("✅ Message sent! We'll get back to you soon.");
    };

    return (
        <div className="bg-paper min-h-screen">
            <section className="bg-indigo py-24 px-4 text-center">
                <div className="max-w-4xl mx-auto space-y-6">
                    <h1 className="text-white text-4xl sm:text-6xl font-serif font-black">We'd Love to <span className="text-gold-l italic">Hear From You</span></h1>
                    <p className="text-white/60 text-lg">Got a fact correction, content suggestion, or partnership inquiry?</p>
                </div>
            </section>
            <section className="py-24 px-4 max-w-7xl mx-auto grid lg:grid-cols-3 gap-16">
                <div className="lg:col-span-2 space-y-12">
                    <h2 className="text-3xl font-serif font-bold text-ink">Send Us a Message</h2>
                    <form className="grid gap-6" onSubmit={handleSubmit}>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <input className="bg-white border border-black/10 rounded-xl p-4 outline-none focus:border-indigo" placeholder="Your Name" required />
                            <input className="bg-white border border-black/10 rounded-xl p-4 outline-none focus:border-indigo" type="email" placeholder="Your Email" required />
                        </div>
                        <input className="bg-white border border-black/10 rounded-xl p-4 outline-none focus:border-indigo" placeholder="Subject" required />
                        <textarea className="bg-white border border-black/10 rounded-xl p-4 outline-none focus:border-indigo min-h-[160px]" placeholder="Your Message" required />
                        <button className="bg-indigo text-white px-12 py-4 rounded-full font-bold hover:bg-ink transition-all w-fit">Send Message <ArrowRight className="inline ml-2" size={18} /></button>
                        {status && <div className="p-4 bg-sage-l/20 text-sage font-bold rounded-xl">{status}</div>}
                    </form>
                </div>
                <div className="space-y-12">
                    <div className="bg-white border border-black/10 rounded-fact p-8 shadow-fact space-y-8">
                        <div className="flex gap-4">
                            <Mail className="text-gold" />
                            <div><div className="text-[0.7rem] uppercase font-bold text-ink3">Email</div><div className="font-bold">admin@facthub.in</div></div>
                        </div>
                        <div className="flex gap-4">
                            <Clock className="text-gold" />
                            <div><div className="text-[0.7rem] uppercase font-bold text-ink3">Response Time</div><div className="font-bold">24-48 Hours</div></div>
                        </div>
                        <div className="flex gap-4">
                            <Globe className="text-gold" />
                            <div><div className="text-[0.7rem] uppercase font-bold text-ink3">Location</div><div className="font-bold">India 🇮🇳</div></div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
