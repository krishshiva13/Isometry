import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Printer, Download, BookOpen, CheckCircle, Sparkles, ArrowLeft, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { factService } from '../services/factService';
import { Fact } from '../types';
import { INITIAL_FACTS } from '../seed';
import { exportStudySheetToPdf } from '../lib/pdfExport';

export const DailyStudySheet: React.FC = () => {
  const [facts, setFacts] = useState<Fact[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    const loadFacts = async () => {
      try {
        const list = await factService.getFacts('all', false, 8);
        setFacts(list && list.length > 0 ? list : INITIAL_FACTS.slice(0, 6));
      } catch {
        setFacts(INITIAL_FACTS.slice(0, 6));
      }
    };
    loadFacts();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = () => {
    setIsExporting(true);
    try {
      exportStudySheetToPdf({
        dateString: todayFormatted,
        facts: facts.length > 0 ? facts : INITIAL_FACTS.slice(0, 6),
        vocabulary: [
          { english: 'Satyagraha', hindi: 'सत्याग्रह', context: 'Insistence on truth; non-violent resistance pioneered by Gandhi.' },
          { english: 'Diwani Rights', hindi: 'दीवानी अधिकार', context: 'Right to collect land revenue granted via Treaty of Allahabad (1765).' },
          { english: 'Cryogenic Engine', hindi: 'क्रायोजेनिक इंजन', context: 'Rocket engine utilizing liquid hydrogen (-253°C) and liquid oxygen.' }
        ],
        mcqs: [
          {
            question: 'Q1. In which year was Sir C.V. Raman awarded the Nobel Prize in Physics for his discovery of light scattering?',
            options: ['(A) 1928', '(B) 1930', '(C) 1935', '(D) 1942'],
            answer: 'B'
          },
          {
            question: 'Q2. Which Treaty concluded the Battle of Buxar (1764) and conferred Diwani Rights of Bengal to the East India Company?',
            options: ['(A) Treaty of Purandar', '(B) Treaty of Allahabad', '(C) Treaty of Salbai', '(D) Treaty of Madras'],
            answer: 'B'
          }
        ]
      });
    } catch (e) {
      console.error('PDF export failed', e);
    } finally {
      setTimeout(() => setIsExporting(false), 800);
    }
  };

  return (
    <div className="min-h-screen bg-paper py-8 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Daily 1-Click Printable PDF Study Sheet | FActHub</title>
        <meta name="description" content="Print or save as PDF today's curated Day in History study sheet, practice questions, and bilingual vocabulary table with facthub.in watermark." />
      </Helmet>

      {/* Screen-only top action bar */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs font-bold text-ink2 hover:text-ink transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="flex items-center gap-2 bg-ink hover:bg-black text-paper font-bold px-4 py-2.5 rounded-2xl text-xs transition-all shadow-md active:scale-98 disabled:opacity-50"
            title="Download formatted vector PDF document with official facthub.in watermark"
          >
            <Download size={15} className="text-gold" />
            <span>{isExporting ? 'Generating PDF...' : 'Download Formatted PDF'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-paper2 hover:bg-paper3 text-ink font-bold px-4 py-2.5 rounded-2xl text-xs transition-all border border-black/10 shadow-xs active:scale-98"
          >
            <Printer size={15} />
            <span>Browser Print</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-black/10 shadow-lg print:shadow-none print:border-none print:p-0 print:m-0 text-black">
        
        {/* Document Header */}
        <div className="border-b-2 border-black pb-4 mb-6 flex items-start justify-between">
          <div>
            <div className="text-2xl font-serif font-black tracking-tight">
              FACTHUB DAILY REVISION SHEET
            </div>
            <div className="text-xs text-neutral-600 font-mono mt-0.5">
              Verified Daily Educational Capsules & Competitive Exam Static GK
            </div>
          </div>

          <div className="text-right font-mono text-xs">
            <div className="font-bold text-neutral-800">{todayFormatted}</div>
            <div className="text-[11px] text-neutral-500">https://facthub.app</div>
          </div>
        </div>

        {/* Section 1: Today's High-Yield Milestones */}
        <div className="space-y-6 mb-8">
          <div className="font-mono text-xs font-bold uppercase tracking-wider bg-neutral-100 px-3 py-1 border border-neutral-300 inline-block">
            Section A: Core Historical & Scientific Milestones
          </div>

          {facts.slice(0, 4).map((fact, idx) => (
            <div key={fact.id} className="pb-4 border-b border-neutral-200 space-y-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-serif font-bold text-base text-neutral-900">
                  {idx + 1}. {fact.title}
                </h3>
                <span className="font-mono text-xs font-bold text-neutral-700 whitespace-nowrap">
                  [{fact.cat.toUpperCase()} • YEAR {fact.year || 'EVENT'}]
                </span>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed">
                {fact.excerpt}
              </p>
              {fact.examRelevance && (
                <div className="text-[11px] font-medium text-neutral-800 bg-neutral-50 p-2 rounded border border-neutral-200">
                  <span className="font-bold">Exam Target:</span> {fact.examRelevance}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Section 2: Bilingual Vocabulary & Terminology */}
        <div className="mb-8 space-y-3">
          <div className="font-mono text-xs font-bold uppercase tracking-wider bg-neutral-100 px-3 py-1 border border-neutral-300 inline-block">
            Section B: Bilingual Exam Terminology (English / हिन्दी)
          </div>

          <table className="w-full text-left text-xs border border-neutral-300 border-collapse">
            <thead>
              <tr className="bg-neutral-100 border-b border-neutral-300">
                <th className="p-2 border-r border-neutral-300 font-bold">English Concept</th>
                <th className="p-2 border-r border-neutral-300 font-bold">हिन्दी शब्दावली</th>
                <th className="p-2 font-bold">Brief Meaning / Context</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-neutral-200">
                <td className="p-2 border-r border-neutral-300 font-semibold">Satyagraha</td>
                <td className="p-2 border-r border-neutral-300 font-hindi">सत्याग्रह</td>
                <td className="p-2 text-neutral-700">Insistence on truth; non-violent resistance pioneered by Gandhi.</td>
              </tr>
              <tr className="border-b border-neutral-200">
                <td className="p-2 border-r border-neutral-300 font-semibold">Diwani Rights</td>
                <td className="p-2 border-r border-neutral-300 font-hindi">दीवानी अधिकार</td>
                <td className="p-2 text-neutral-700">Right to collect land revenue granted via Treaty of Allahabad (1765).</td>
              </tr>
              <tr className="border-b border-neutral-200">
                <td className="p-2 border-r border-neutral-300 font-semibold">Cryogenic Engine</td>
                <td className="p-2 border-r border-neutral-300 font-hindi">क्रायोजेनिक इंजन</td>
                <td className="p-2 text-neutral-700">Rocket engine utilizing liquid hydrogen (-253°C) and liquid oxygen.</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3: Daily Practice MCQs */}
        <div className="space-y-4">
          <div className="font-mono text-xs font-bold uppercase tracking-wider bg-neutral-100 px-3 py-1 border border-neutral-300 inline-block">
            Section C: Daily Practice Questions (Self-Assessment)
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <p className="font-semibold text-neutral-900 mb-1">
                Q1. In which year was Sir C.V. Raman awarded the Nobel Prize in Physics for his discovery of light scattering?
              </p>
              <div className="grid grid-cols-2 gap-1 text-neutral-700 pl-2">
                <div>(A) 1928</div>
                <div>(B) 1930</div>
                <div>(C) 1935</div>
                <div>(D) 1942</div>
              </div>
            </div>

            <div>
              <p className="font-semibold text-neutral-900 mb-1">
                Q2. Which Treaty concluded the Battle of Buxar (1764) and conferred Diwani Rights of Bengal to the East India Company?
              </p>
              <div className="grid grid-cols-2 gap-1 text-neutral-700 pl-2">
                <div>(A) Treaty of Purandar</div>
                <div>(B) Treaty of Allahabad</div>
                <div>(C) Treaty of Salbai</div>
                <div>(D) Treaty of Madras</div>
              </div>
            </div>
          </div>

          {/* Answer Key Footer */}
          <div className="mt-6 pt-3 border-t border-neutral-300 flex items-center justify-between text-[10px] font-mono text-neutral-600">
            <span>Answer Key: Q1-(B), Q2-(B)</span>
            <span>FactHub Daily Student Edition</span>
          </div>
        </div>

      </div>
    </div>
  );
};
