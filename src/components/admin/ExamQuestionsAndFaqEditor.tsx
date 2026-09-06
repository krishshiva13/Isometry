import React, { useState } from 'react';
import { 
  GraduationCap, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Sparkles, 
  Check, 
  AlertCircle,
  Lightbulb,
  Layers
} from 'lucide-react';
import { QuizMCQ } from '../../types';
import { cn } from '../../lib/utils';

interface ExamQuestionsAndFaqEditorProps {
  quizMCQs: QuizMCQ[];
  onChangeQuizMCQs: (mcqs: QuizMCQ[]) => void;
  faqs: Array<{ question: string; answer: string }>;
  onChangeFaqs: (faqs: Array<{ question: string; answer: string }>) => void;
  topicTitle?: string;
  category?: string;
}

export const ExamQuestionsAndFaqEditor: React.FC<ExamQuestionsAndFaqEditorProps> = ({
  quizMCQs = [],
  onChangeQuizMCQs,
  faqs = [],
  onChangeFaqs,
  topicTitle = '',
  category = 'history'
}) => {
  const [activeTab, setActiveTab] = useState<'mcqs' | 'faqs'>('mcqs');

  // --- MCQ Handlers ---
  const handleAddMCQ = () => {
    const newMCQ: QuizMCQ = {
      question: '',
      options: ['', '', '', ''],
      answer: 0,
      explanation: '',
      examCategory: 'UPSC / SSC CGL'
    };
    onChangeQuizMCQs([...quizMCQs, newMCQ]);
  };

  const handleRemoveMCQ = (index: number) => {
    onChangeQuizMCQs(quizMCQs.filter((_, i) => i !== index));
  };

  const handleUpdateMCQ = (index: number, updates: Partial<QuizMCQ>) => {
    const updated = [...quizMCQs];
    updated[index] = { ...updated[index], ...updates };
    onChangeQuizMCQs(updated);
  };

  const handleUpdateOption = (mcqIndex: number, optionIndex: number, value: string) => {
    const updated = [...quizMCQs];
    const newOptions = [...updated[mcqIndex].options];
    newOptions[optionIndex] = value;
    updated[mcqIndex] = { ...updated[mcqIndex], options: newOptions };
    onChangeQuizMCQs(updated);
  };

  const handleAutoGenerateSampleMCQs = () => {
    const title = topicTitle.trim() || 'This Historical Milestone';
    const sampleMCQs: QuizMCQ[] = [
      {
        question: `With reference to ${title}, which of the following statements is correct?`,
        options: [
          `It is a primary landmark recorded in the field of ${category}`,
          `It occurred during the early 18th century exclusively in Europe`,
          `It had no documented impact on modern scientific records`,
          `It was officially repealed within 5 years of establishment`
        ],
        answer: 0,
        explanation: `${title} stands as a pivotal milestone in ${category}, verified across historical archives and educational curricula for its lasting impact.`,
        examCategory: 'UPSC Prelims'
      },
      {
        question: `Consider the following key aspects regarding ${title}: In which category/domain does it hold primary historical relevance?`,
        options: [
          category.charAt(0).toUpperCase() + category.slice(1),
          'Maritime Logistics',
          'Modern Urban Planning',
          'Medieval Currency Exchange'
        ],
        answer: 0,
        explanation: `${title} is classified under ${category}, holding core relevance for static GK and general awareness papers.`,
        examCategory: 'SSC CGL'
      }
    ];

    onChangeQuizMCQs([...quizMCQs, ...sampleMCQs]);
  };

  // --- FAQ Handlers ---
  const handleAddFAQ = () => {
    const newFAQ = { question: '', answer: '' };
    onChangeFaqs([...faqs, newFAQ]);
  };

  const handleRemoveFAQ = (index: number) => {
    onChangeFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleUpdateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    onChangeFaqs(updated);
  };

  const handleAutoGenerateSampleFAQs = () => {
    const title = topicTitle.trim() || 'this topic';
    const sampleFAQs = [
      {
        question: `What is the significance of ${title}?`,
        answer: `${title} represents a critical milestone in ${category}, widely documented for its cultural, scientific, and educational impact.`
      },
      {
        question: `Why is ${title} frequently asked in competitive exams (UPSC, SSC, State PSCs)?`,
        answer: `Questions on ${title} evaluate candidates' grasp of chronology, verified historical/scientific context, and static general awareness in prelims and mains.`
      },
      {
        question: `Where are the authentic sources and facts about ${title} documented?`,
        answer: `All records on FActHub are cross-checked against official educational archives, peer-reviewed journals, and encyclopedic standards.`
      }
    ];

    onChangeFaqs([...faqs, ...sampleFAQs]);
  };

  return (
    <div className="space-y-4 bg-paper rounded-2xl border border-black/10 p-4 sm:p-5">
      {/* Tab Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('mcqs')}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all",
              activeTab === 'mcqs'
                ? "bg-ink text-white shadow-sm"
                : "bg-paper2 hover:bg-paper3 text-ink2"
            )}
          >
            <GraduationCap size={15} className={activeTab === 'mcqs' ? 'text-gold' : 'text-ink3'} />
            <span>Exam View: Practice Q&A ({quizMCQs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('faqs')}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all",
              activeTab === 'faqs'
                ? "bg-ink text-white shadow-sm"
                : "bg-paper2 hover:bg-paper3 text-ink2"
            )}
          >
            <HelpCircle size={15} className={activeTab === 'faqs' ? 'text-gold' : 'text-ink3'} />
            <span>Blog FAQ Section ({faqs.length})</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {activeTab === 'mcqs' ? (
            <>
              <button
                type="button"
                onClick={handleAutoGenerateSampleMCQs}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/15 hover:bg-gold/25 text-ink font-bold text-xs rounded-xl border border-gold/30 transition-all"
                title="Generate starter exam questions based on title"
              >
                <Sparkles size={13} className="text-gold" />
                <span className="hidden sm:inline">Auto-Generate</span> MCQs
              </button>
              <button
                type="button"
                onClick={handleAddMCQ}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-ink text-white hover:bg-gold hover:text-black font-bold text-xs rounded-xl transition-all shadow-xs"
              >
                <Plus size={13} />
                <span>Add Question</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleAutoGenerateSampleFAQs}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/15 hover:bg-gold/25 text-ink font-bold text-xs rounded-xl border border-gold/30 transition-all"
                title="Generate starter FAQs based on title"
              >
                <Sparkles size={13} className="text-gold" />
                <span className="hidden sm:inline">Auto-Generate</span> FAQs
              </button>
              <button
                type="button"
                onClick={handleAddFAQ}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-ink text-white hover:bg-gold hover:text-black font-bold text-xs rounded-xl transition-all shadow-xs"
              >
                <Plus size={13} />
                <span>Add FAQ</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* --- TAB 1: EXAM VIEW MCQS --- */}
      {activeTab === 'mcqs' && (
        <div className="space-y-4">
          <div className="p-3 bg-paper2 rounded-xl border border-black/5 text-xs text-ink3 flex items-start gap-2">
            <Lightbulb size={16} className="text-gold shrink-0 mt-0.5" />
            <span>
              <strong>Exam View Q&A:</strong> These multiple-choice questions render as interactive practice cards with instant option verification, score tracking, and detailed explanations for UPSC / SSC aspirants.
            </span>
          </div>

          {quizMCQs.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-black/10 rounded-2xl p-6 bg-paper2/50 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gold/15 text-gold mx-auto flex items-center justify-center">
                <GraduationCap size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-ink">No Exam Questions Added Yet</h4>
                <p className="text-xs text-ink3 max-w-md mx-auto">
                  Add multiple-choice practice questions so students can test their knowledge directly on this blog article.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAddMCQ}
                  className="px-4 py-2 bg-ink text-white rounded-xl text-xs font-bold hover:bg-gold hover:text-black transition-all"
                >
                  + Add Question Manually
                </button>
                <button
                  type="button"
                  onClick={handleAutoGenerateSampleMCQs}
                  className="px-4 py-2 bg-paper border border-black/10 text-ink rounded-xl text-xs font-bold hover:bg-gold/20 transition-all flex items-center gap-1.5"
                >
                  <Sparkles size={13} className="text-gold" /> Auto-Generate Starter Questions
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {quizMCQs.map((mcq, mIdx) => {
                const currentAnswer = (mcq as any).correctIndex ?? mcq.answer ?? 0;

                return (
                  <div 
                    key={mIdx}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-black/10 shadow-2xs space-y-3"
                  >
                    {/* Card Top */}
                    <div className="flex items-center justify-between gap-2 border-b border-black/5 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-ink text-white font-mono font-bold text-xs flex items-center justify-center">
                          {mIdx + 1}
                        </span>
                        <span className="text-xs font-bold text-ink">Exam Question</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={mcq.examCategory || ''}
                          onChange={(e) => handleUpdateMCQ(mIdx, { examCategory: e.target.value })}
                          placeholder="Exam Badge (e.g. UPSC Prelims)"
                          className="bg-paper2 border border-black/10 rounded-lg px-2 py-1 text-[11px] font-mono text-ink w-36 sm:w-44 focus:border-gold outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveMCQ(mIdx)}
                          className="text-rose-600 hover:text-rose-800 p-1 rounded-md hover:bg-rose-50 transition-colors"
                          title="Remove question"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Question Statement */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">
                        Question Statement *
                      </label>
                      <input
                        type="text"
                        value={mcq.question}
                        onChange={(e) => handleUpdateMCQ(mIdx, { question: e.target.value })}
                        placeholder="e.g. Which of the following statements is correct regarding...?"
                        className="w-full bg-paper2 border border-black/10 rounded-xl p-2.5 text-xs sm:text-sm font-medium text-ink focus:border-gold outline-none"
                      />
                    </div>

                    {/* 4 Options Grid */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">
                          Options (Select the correct radio button):
                        </label>
                        <span className="text-[10px] text-emerald-700 font-medium">
                          Option {['A', 'B', 'C', 'D'][currentAnswer]} is currently marked correct
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {['A', 'B', 'C', 'D'].map((letter, optIdx) => {
                          const isCorrect = currentAnswer === optIdx;
                          return (
                            <div 
                              key={optIdx} 
                              className={cn(
                                "flex items-center gap-2 p-2 rounded-xl border transition-all",
                                isCorrect 
                                  ? "bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-300" 
                                  : "bg-paper2 border-black/5"
                              )}
                            >
                              <label 
                                className="cursor-pointer flex items-center gap-1.5 shrink-0" 
                                title={`Mark Option ${letter} as Correct`}
                              >
                                <input
                                  type="radio"
                                  name={`correct-answer-${mIdx}`}
                                  checked={isCorrect}
                                  onChange={() => handleUpdateMCQ(mIdx, { answer: optIdx })}
                                  className="w-4 h-4 accent-emerald-600 cursor-pointer"
                                />
                                <span className={cn(
                                  "w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold text-[11px]",
                                  isCorrect ? "bg-emerald-600 text-white" : "bg-paper text-ink3 border border-black/10"
                                )}>
                                  {letter}
                                </span>
                              </label>
                              <input
                                type="text"
                                value={mcq.options[optIdx] || ''}
                                onChange={(e) => handleUpdateOption(mIdx, optIdx, e.target.value)}
                                placeholder={`Option ${letter} text...`}
                                className="w-full bg-white border border-black/10 rounded-lg p-1.5 text-xs text-ink focus:border-gold outline-none"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">
                        Explanation & Key Concept Takeaways *
                      </label>
                      <textarea
                        rows={2}
                        value={mcq.explanation || ''}
                        onChange={(e) => handleUpdateMCQ(mIdx, { explanation: e.target.value })}
                        placeholder="Explain why the answer is correct for competitive exam aspirants..."
                        className="w-full bg-paper2 border border-black/10 rounded-xl p-2 text-xs text-ink focus:border-gold outline-none leading-relaxed"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: FAQ SECTION --- */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          <div className="p-3 bg-paper2 rounded-xl border border-black/5 text-xs text-ink3 flex items-start gap-2">
            <Lightbulb size={16} className="text-gold shrink-0 mt-0.5" />
            <span>
              <strong>Google Rich FAQ Section:</strong> Every blog post displays these FAQs in an accordion at the end and automatically injects Schema.org <code className="bg-white px-1 py-0.5 rounded font-mono text-[10px]">FAQPage</code> structured data for Google search snippets.
            </span>
          </div>

          {faqs.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-black/10 rounded-2xl p-6 bg-paper2/50 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gold/15 text-gold mx-auto flex items-center justify-center">
                <HelpCircle size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-ink">No Custom FAQs Added Yet</h4>
                <p className="text-xs text-ink3 max-w-md mx-auto">
                  Add custom Q&As to display in the FAQ section at the end of this blog post. If empty, the system will automatically synthesize 4 verified FAQs for the reader.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAddFAQ}
                  className="px-4 py-2 bg-ink text-white rounded-xl text-xs font-bold hover:bg-gold hover:text-black transition-all"
                >
                  + Add FAQ Manually
                </button>
                <button
                  type="button"
                  onClick={handleAutoGenerateSampleFAQs}
                  className="px-4 py-2 bg-paper border border-black/10 text-ink rounded-xl text-xs font-bold hover:bg-gold/20 transition-all flex items-center gap-1.5"
                >
                  <Sparkles size={13} className="text-gold" /> Auto-Generate FAQs
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {faqs.map((faq, fIdx) => (
                <div 
                  key={fIdx}
                  className="p-4 rounded-2xl bg-white border border-black/10 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                      <HelpCircle size={14} className="text-gold" /> FAQ #{fIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFAQ(fIdx)}
                      className="text-rose-600 hover:text-rose-800 p-1 rounded-md hover:bg-rose-50 transition-colors"
                      title="Remove FAQ"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">
                      Search Question *
                    </label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => handleUpdateFAQ(fIdx, 'question', e.target.value)}
                      placeholder="e.g. What is the historical background of...?"
                      className="w-full bg-paper2 border border-black/10 rounded-xl p-2.5 text-xs font-bold text-ink focus:border-gold outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">
                      Verified Answer *
                    </label>
                    <textarea
                      rows={2}
                      value={faq.answer}
                      onChange={(e) => handleUpdateFAQ(fIdx, 'answer', e.target.value)}
                      placeholder="Provide a clear, fact-checked answer..."
                      className="w-full bg-paper2 border border-black/10 rounded-xl p-2 text-xs text-ink2 focus:border-gold outline-none leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
