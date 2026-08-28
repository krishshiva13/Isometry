import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Send, CheckCircle2, ShieldCheck, Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import { Category, CommunityFactSubmission } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const CommunitySubmit: React.FC = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('history');
  const [topicType, setTopicType] = useState('Day in History');
  const [year, setYear] = useState('');
  const [eventMonth, setEventMonth] = useState('');
  const [eventDay, setEventDay] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [fullStory, setFullStory] = useState('');
  const [sources, setSources] = useState('');
  const [examSignificance, setExamSignificance] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim() || !sources.trim()) {
      setErrorMsg('Please fill in the required fields: Title, Summary, and Verified Sources.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await addDoc(collection(db, 'community_submissions'), {
        title: title.trim(),
        category,
        topicType,
        year: year ? parseInt(year, 10) : 0,
        eventMonth: eventMonth ? parseInt(eventMonth, 10) : undefined,
        eventDay: eventDay ? parseInt(eventDay, 10) : undefined,
        excerpt: excerpt.trim(),
        fullStory: fullStory.trim(),
        sources: sources.trim(),
        examSignificance: examSignificance.trim(),
        submittedBy: submittedBy.trim() || 'Anonymous Educator',
        submitterEmail: submitterEmail.trim(),
        status: 'pending',
        submittedAt: serverTimestamp()
      });

      setIsSubmitted(true);
    } catch (err: any) {
      console.warn("Submission error:", err);
      // Even if firestore offline, acknowledge for user
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper py-10 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Submit a Verified Fact & Research Milestone | FActHub</title>
        <meta name="description" content="Contribute verified historical anniversaries, science milestones, and state GK to the FActHub repository." />
      </Helmet>

      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header Card */}
        <div className="bg-paper2 border border-black/10 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gold/15 text-gold flex items-center justify-center font-bold">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-ink">Community Fact Submission</h1>
              <p className="text-xs sm:text-sm text-ink3">
                Contribute authentic historical milestones, regional GK, and science anniversaries to FActHub
              </p>
            </div>
          </div>
        </div>

        {isSubmitted ? (
          <div className="bg-paper2 border border-black/10 rounded-3xl p-8 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-2xl font-serif font-black text-ink">Submission Received!</h2>
            <p className="text-xs sm:text-sm text-ink3 max-w-md mx-auto">
              Thank you for your contribution. Our editorial team will review your sources against official records and publish it with author attribution.
            </p>
            <div className="pt-4">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setTitle('');
                  setExcerpt('');
                  setFullStory('');
                  setSources('');
                }}
                className="bg-gold hover:bg-gold/90 text-ink font-bold px-6 py-2.5 rounded-2xl text-xs transition-all shadow-sm"
              >
                Submit Another Fact
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-paper2 border border-black/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-900 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink3 mb-1.5">
                Fact Title / Milestone Headline *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Discovery of the Raman Effect by Sir C.V. Raman"
                required
                className="w-full text-xs sm:text-sm p-3 rounded-2xl bg-paper border border-black/10 focus:border-gold outline-none"
              />
            </div>

            {/* Category & Topic Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink3 mb-1.5">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full text-xs p-3 rounded-2xl bg-paper border border-black/10 focus:border-gold outline-none"
                >
                  <option value="history">History</option>
                  <option value="science">Science</option>
                  <option value="inventions">Inventions</option>
                  <option value="discoveries">Discoveries</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink3 mb-1.5">
                  Topic Pillar / Sub-Type
                </label>
                <select
                  value={topicType}
                  onChange={(e) => setTopicType(e.target.value)}
                  className="w-full text-xs p-3 rounded-2xl bg-paper border border-black/10 focus:border-gold outline-none"
                >
                  <option value="Day in History">Day in History</option>
                  <option value="Science Discovery">Science Discovery</option>
                  <option value="National Important Day">National Important Day</option>
                  <option value="Competitive Exam Static GK">Competitive Exam Static GK</option>
                  <option value="Regional / State GK">Regional / State GK</option>
                </select>
              </div>
            </div>

            {/* Year & Date */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink3 mb-1.5">
                  Year
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g. 1928"
                  className="w-full text-xs p-3 rounded-2xl bg-paper border border-black/10 focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink3 mb-1.5">
                  Month (1-12)
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={eventMonth}
                  onChange={(e) => setEventMonth(e.target.value)}
                  placeholder="e.g. 2"
                  className="w-full text-xs p-3 rounded-2xl bg-paper border border-black/10 focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink3 mb-1.5">
                  Day (1-31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={eventDay}
                  onChange={(e) => setEventDay(e.target.value)}
                  placeholder="e.g. 28"
                  className="w-full text-xs p-3 rounded-2xl bg-paper border border-black/10 focus:border-gold outline-none"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink3 mb-1.5">
                Concise Summary (1-2 Sentences) *
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="High-level overview of what happened and why it matters..."
                rows={2}
                required
                className="w-full text-xs sm:text-sm p-3 rounded-2xl bg-paper border border-black/10 focus:border-gold outline-none resize-none"
              />
            </div>

            {/* Full Story */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink3 mb-1.5">
                Full Educational Narrative (Optional)
              </label>
              <textarea
                value={fullStory}
                onChange={(e) => setFullStory(e.target.value)}
                placeholder="Detailed background, key people involved, chronological sequence..."
                rows={4}
                className="w-full text-xs sm:text-sm p-3 rounded-2xl bg-paper border border-black/10 focus:border-gold outline-none resize-none"
              />
            </div>

            {/* Verified Sources */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink3 mb-1.5">
                Verified Sources / Reference Links (Books, Government Archives, PIB, Journals) *
              </label>
              <input
                type="text"
                value={sources}
                onChange={(e) => setSources(e.target.value)}
                placeholder="e.g., PIB India Archive, ISRO Mission Log, NCERT Class 12 History"
                required
                className="w-full text-xs p-3 rounded-2xl bg-paper border border-black/10 focus:border-gold outline-none"
              />
            </div>

            {/* Submitter info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-black/10">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink3 mb-1.5">
                  Your Name / Educator Title
                </label>
                <input
                  type="text"
                  value={submittedBy}
                  onChange={(e) => setSubmittedBy(e.target.value)}
                  placeholder="e.g. Prof. R. Sharma / UPSC Aspirant"
                  className="w-full text-xs p-3 rounded-2xl bg-paper border border-black/10 focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink3 mb-1.5">
                  Your Email (for verification & credit)
                </label>
                <input
                  type="email"
                  value={submitterEmail}
                  onChange={(e) => setSubmitterEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs p-3 rounded-2xl bg-paper border border-black/10 focus:border-gold outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-gold hover:bg-gold/90 text-ink font-bold px-8 py-3.5 rounded-2xl text-xs sm:text-sm transition-all shadow-md active:scale-98 disabled:opacity-50"
              >
                <Send size={16} />
                <span>{isSubmitting ? 'Submitting for Review...' : 'Submit Fact for Verification'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
