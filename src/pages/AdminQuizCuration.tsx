import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  FileText, 
  RefreshCw, 
  Edit3, 
  Wand2, 
  Save, 
  Check, 
  ArrowRight, 
  Printer, 
  Download, 
  Layers, 
  BookOpen, 
  Eye, 
  HelpCircle,
  Clock,
  ChevronRight,
  Flame,
  CheckSquare,
  Square,
  Undo2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';
import { PrintableA4HandoutModal } from '../components/exam/PrintableA4HandoutModal';
import { DailyCapsuleData, downloadCurrentAffairsPdf } from '../lib/currentAffairsPdfExport';

interface CandidateMCQ {
  id: string;
  category: string;
  targetExam: string;
  tagClass: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  examTrap: string;
  adminCorrected?: boolean;
  correctedAt?: string;
}

interface AdminQuizDraft {
  targetDateKey: string;
  displayDate: string;
  previousDayKey: string;
  previousDayDisplay: string;
  themeTitle: string;
  candidates: CandidateMCQ[];
  selectedQuestionIds: string[];
  status: 'draft' | 'published';
  updatedAt: string;
  publishedAt?: string;
}

export const AdminQuizCuration: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();

  // Date selection state (defaulting to tomorrow for next-day daily quiz planning)
  const getTomorrowKey = () => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const getTodayKey = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [targetDateKey, setTargetDateKey] = useState<string>(getTomorrowKey());
  const [draft, setDraft] = useState<AdminQuizDraft | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [customFocus, setCustomFocus] = useState<string>('');
  const [showFocusModal, setShowFocusModal] = useState<boolean>(false);

  // Per-card correction state
  const [activeCorrectionIndex, setActiveCorrectionIndex] = useState<number | null>(null);
  const [correctionPrompt, setCorrectionPrompt] = useState<string>('');
  const [correctingIndex, setCorrectingIndex] = useState<number | null>(null);

  // Per-card manual edit state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<CandidateMCQ | null>(null);

  // A4 Handout preview modal
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [previewCapsule, setPreviewCapsule] = useState<DailyCapsuleData | null>(null);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Helper to fetch authorization header
  const getAuthHeader = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      return token ? { 'Authorization': `Bearer ${token}` } : {};
    } catch {
      return {};
    }
  };

  // Fetch or initialize candidates for target date
  const loadCandidates = async (dateKey: string) => {
    setLoading(true);
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`/api/admin/daily-quiz/candidates?targetDate=${dateKey}`, {
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });
      const data = await res.json();
      if (data.success && data.draft) {
        setDraft(data.draft);
      } else {
        showToast(data.error || 'Failed to load candidate questions');
      }
    } catch (err: any) {
      console.error('Failed to load candidate questions:', err);
      showToast('Error loading candidate questions from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates(targetDateKey);
  }, [targetDateKey]);

  // Handle question selection toggle
  const toggleQuestionSelection = async (questionId: string) => {
    if (!draft) return;
    const currentSelected = [...(draft.selectedQuestionIds || [])];
    const index = currentSelected.indexOf(questionId);

    let updatedSelected: string[];
    if (index > -1) {
      updatedSelected = currentSelected.filter(id => id !== questionId);
    } else {
      if (currentSelected.length >= 5) {
        showToast('⚠️ Exactly 5 questions are needed. Deselect one first to choose this.');
        return;
      }
      updatedSelected = [...currentSelected, questionId];
    }

    const updatedDraft = { ...draft, selectedQuestionIds: updatedSelected };
    setDraft(updatedDraft);

    // Save selection state silently
    try {
      const headers = await getAuthHeader();
      await fetch('/api/admin/daily-quiz/update-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          targetDate: draft.targetDateKey,
          selectedQuestionIds: updatedSelected
        })
      });
    } catch (e) {
      console.warn('Could not autosave selection:', e);
    }
  };

  // Generate 10 fresh candidates
  const handleGenerateFreshCandidates = async () => {
    setGenerating(true);
    try {
      const headers = await getAuthHeader();
      const res = await fetch('/api/admin/daily-quiz/generate-candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          targetDate: targetDateKey,
          customFocus: customFocus.trim() || undefined
        })
      });
      const data = await res.json();
      if (data.success && data.draft) {
        setDraft(data.draft);
        setShowFocusModal(false);
        showToast(`✨ Generated 10 candidate questions for ${data.draft.displayDate} (Grounded in ${data.draft.previousDayDisplay})!`);
      } else {
        showToast(data.error || 'Failed to generate candidates');
      }
    } catch (err: any) {
      console.error('Candidate generation failed:', err);
      showToast('Candidate generation request failed');
    } finally {
      setGenerating(false);
    }
  };

  // Fact-Check and AI-Correct a specific question
  const handleApplyAICorrection = async (index: number) => {
    if (!draft || !draft.candidates[index] || !correctionPrompt.trim()) return;
    setCorrectingIndex(index);
    try {
      const headers = await getAuthHeader();
      const res = await fetch('/api/admin/daily-quiz/correct-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          targetDate: draft.targetDateKey,
          questionIndex: index,
          question: draft.candidates[index],
          correctionInstruction: correctionPrompt.trim()
        })
      });
      const data = await res.json();
      if (data.success && data.updatedQuestion) {
        const updatedCandidates = [...draft.candidates];
        updatedCandidates[index] = data.updatedQuestion;
        setDraft({ ...draft, candidates: updatedCandidates });
        setActiveCorrectionIndex(null);
        setCorrectionPrompt('');
        showToast(`✅ Candidate #${index + 1} fact-checked & corrected!`);
      } else {
        showToast(data.error || 'AI correction failed');
      }
    } catch (err: any) {
      console.error('Correction request failed:', err);
      showToast('Failed to apply AI correction');
    } finally {
      setCorrectingIndex(null);
    }
  };

  // Save manual edit
  const handleSaveManualEdit = async () => {
    if (!draft || editingIndex === null || !editFormData) return;
    const updatedCandidates = [...draft.candidates];
    updatedCandidates[editingIndex] = editFormData;
    const updatedDraft = { ...draft, candidates: updatedCandidates };
    setDraft(updatedDraft);
    setEditingIndex(null);
    setEditFormData(null);

    try {
      const headers = await getAuthHeader();
      await fetch('/api/admin/daily-quiz/update-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          targetDate: draft.targetDateKey,
          candidates: updatedCandidates,
          selectedQuestionIds: draft.selectedQuestionIds
        })
      });
      showToast('💾 Candidate question changes saved!');
    } catch (e) {
      console.warn('Failed to save manual edit:', e);
    }
  };

  // Publish exactly 5 questions
  const handlePublishDailyQuiz = async () => {
    if (!draft) return;
    if (draft.selectedQuestionIds.length !== 5) {
      showToast(`⚠️ Please select exactly 5 questions (currently ${draft.selectedQuestionIds.length} selected).`);
      return;
    }

    setPublishing(true);
    try {
      const headers = await getAuthHeader();
      const selectedQuestions = draft.candidates.filter(c => draft.selectedQuestionIds.includes(c.id));

      const res = await fetch('/api/admin/daily-quiz/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          targetDate: draft.targetDateKey,
          selectedQuestions,
          selectedQuestionIds: draft.selectedQuestionIds,
          customThemeTitle: draft.themeTitle
        })
      });

      const data = await res.json();
      if (data.success && data.capsule) {
        setDraft({ ...draft, status: 'published', publishedAt: new Date().toISOString() });
        showToast(`🎉 Published! ${draft.displayDate} Daily Quiz and A4 Handout are now LIVE for all users!`);
      } else {
        showToast(data.error || 'Failed to publish daily quiz');
      }
    } catch (err: any) {
      console.error('Publish request failed:', err);
      showToast('Publish request failed');
    } finally {
      setPublishing(false);
    }
  };

  // Open A4 Handout Preview
  const handleOpenHandoutPreview = () => {
    if (!draft) return;
    const selected = draft.candidates.filter(c => draft.selectedQuestionIds.includes(c.id));
    const cleanId = draft.targetDateKey.replace(/-/g, '');

    const previewData: DailyCapsuleData = {
      dateKey: draft.targetDateKey,
      displayDate: draft.displayDate,
      previousDayKey: draft.previousDayKey,
      previousDayDisplay: draft.previousDayDisplay,
      dayBadge: `Edition: ${draft.displayDate} • Grounded in ${draft.previousDayDisplay}`,
      themeTitle: draft.themeTitle,
      pdfFileName: `FactHub-Daily-Current-Affairs-${draft.targetDateKey}.pdf`,
      pdfFileSize: '1.4 MB',
      pdfPageCount: 2,
      quickPointers: selected.slice(0, 4).map(q => `${q.question.slice(0, 75)}… — ${q.options[q.correctAnswer]}`),
      mcqs: selected.map((q, i) => ({
        id: `q-${cleanId}-${i + 1}`,
        category: q.category,
        targetExam: q.targetExam,
        tagClass: q.tagClass,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        examTrap: q.examTrap
      })),
      currentAffairs: selected.slice(0, 4).map((q, i) => ({
        id: `ca-${cleanId}-${i + 1}`,
        num: `0${i + 1}`,
        title: q.question.slice(0, 95) + '…',
        summary: q.explanation.slice(0, 220) + '…',
        category: q.category.replace(/\(.*?\)/g, '').trim(),
        examAngle: `${q.targetExam}: Core concepts and statutory background.`,
        keyTakeaway: `Key Fact: ${q.options[q.correctAnswer]}`,
        source: `Verified Live Editorial (${draft.previousDayDisplay} Event)`,
        exams: [{ 
          name: q.targetExam.split('/')[0].trim(), 
          tagClass: q.tagClass,
          examCode: q.targetExam.split('/')[0].trim().toUpperCase()
        }]
      }))
    };

    setPreviewCapsule(previewData);
    setIsPreviewModalOpen(true);
  };

  const selectedCount = draft?.selectedQuestionIds?.length || 0;
  const isReadyToPublish = selectedCount === 5;

  return (
    <div className="min-h-screen bg-paper dark:bg-[#0f1015] text-ink dark:text-white pb-24 transition-colors">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[300] bg-ink text-white dark:bg-white dark:text-black px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-gold/40 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles size={16} className="text-gold shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Editorial Identity */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white border-b border-gold/30 pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-full bg-gold/20 text-gold border border-gold/40 font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={12} />
                  ADMIN ONLY EDITORIAL WORKBENCH
                </span>
                <span className="text-white/60 text-xs">
                  Reviewer: <span className="text-gold font-mono font-bold">{user?.email || 'krish02shiva@gmail.com'}</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight text-white">
                Daily Quiz Curation & Fact-Check Studio
              </h1>
              <p className="text-xs sm:text-sm text-white/70 max-w-3xl mt-1.5 leading-relaxed">
                Review 10 candidate questions generated every day. Fact-check accuracy and request AI corrections in real-time. Select the top 5 questions to publish on tomorrow's Daily Quiz with the 2-page A4 Handout.
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex items-center gap-2">
              <Link
                to="/quiz"
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Eye size={13} />
                <span>View Live Quiz</span>
              </Link>
              <Link
                to="/exam-prep"
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <BookOpen size={13} />
                <span>Exam Prep Hub</span>
              </Link>
            </div>
          </div>

          {/* Date Selector Strip */}
          <div className="mt-8 bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-white/70 uppercase tracking-wider font-mono mr-2">
                Target Publication Date:
              </span>
              <button
                onClick={() => setTargetDateKey(getTomorrowKey())}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                  targetDateKey === getTomorrowKey()
                    ? "bg-gold text-black shadow-md font-black"
                    : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                <Flame size={12} className={targetDateKey === getTomorrowKey() ? "text-black" : "text-amber-400"} />
                <span>Tomorrow (Next Day)</span>
              </button>
              <button
                onClick={() => setTargetDateKey(getTodayKey())}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  targetDateKey === getTodayKey()
                    ? "bg-gold text-black shadow-md font-black"
                    : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                <span>Today</span>
              </button>

              <div className="flex items-center gap-1.5 ml-2">
                <Calendar size={14} className="text-white/60" />
                <input
                  type="date"
                  value={targetDateKey}
                  onChange={(e) => e.target.value && setTargetDateKey(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-xl px-2.5 py-1 text-xs text-white font-mono focus:outline-hidden focus:border-gold"
                />
              </div>
            </div>

            {/* Publication Status Badge */}
            {draft && (
              <div className="flex items-center gap-3">
                <div className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border",
                  draft.status === 'published'
                    ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                    : "bg-amber-950/80 text-amber-300 border-amber-500/40"
                )}>
                  {draft.status === 'published' ? (
                    <>
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      <span>Published & Live for Students</span>
                    </>
                  ) : (
                    <>
                      <Clock size={13} className="text-amber-400" />
                      <span>Draft: 10 Candidates In Review</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Workbench Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw size={32} className="animate-spin text-gold mx-auto mb-4" />
            <h3 className="text-lg font-bold font-serif">Loading 10 candidate questions for {targetDateKey}...</h3>
            <p className="text-xs text-ink3 dark:text-white/60 mt-1">Grounding questions in the verified events of the preceding day.</p>
          </div>
        ) : !draft ? (
          <div className="py-16 text-center">
            <AlertCircle size={32} className="text-coral mx-auto mb-3" />
            <p className="text-sm">Unable to load candidate draft. Please refresh or generate candidates.</p>
          </div>
        ) : (
          <>
            {/* Grounding Context Banner */}
            <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/25 rounded-2xl p-4 sm:p-5 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-mono font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                  Mandatory Date Grounding Verification
                </div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-ink dark:text-white mt-0.5">
                  Publishing For: <span className="text-gold">{draft.displayDate}</span> • Based on Live Events of: <span className="underline decoration-gold/60">{draft.previousDayDisplay}</span>
                </h3>
                <p className="text-xs text-ink3 dark:text-white/70 mt-1">
                  Theme: <span className="font-semibold">{draft.themeTitle}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFocusModal(true)}
                  disabled={generating}
                  className="px-3.5 py-2 rounded-xl bg-paper2 dark:bg-white/10 hover:bg-gold/20 text-ink dark:text-white border border-black/10 dark:border-white/15 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles size={13} className="text-gold" />
                  <span>Generate 10 Fresh AI Candidates</span>
                </button>
              </div>
            </div>

            {/* STICKY SELECTION & PUBLISH BAR */}
            <div className="sticky top-20 z-40 bg-white/95 dark:bg-[#151720]/95 backdrop-blur-md rounded-2xl p-4 border border-black/10 dark:border-white/15 shadow-xl mb-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink3 dark:text-white/60">
                      Selection Progress:
                    </span>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-mono font-black",
                      selectedCount === 5 
                        ? "bg-emerald-500 text-white" 
                        : "bg-gold/20 text-amber-800 dark:text-amber-300"
                    )}>
                      {selectedCount} of 5 Questions Selected
                    </span>
                  </div>
                  <p className="text-[11px] text-ink3 dark:text-white/60 mt-0.5">
                    {selectedCount === 5 
                      ? "✓ Target reached! You can now publish to the live Daily Quiz and A4 Handout."
                      : selectedCount < 5 
                        ? `Select ${5 - selectedCount} more candidate(s) below to reach the required 5 questions.`
                        : `Please deselect ${selectedCount - 5} question(s) to publish exactly 5.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleOpenHandoutPreview}
                  disabled={selectedCount !== 5}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border",
                    selectedCount === 5
                      ? "bg-paper2 dark:bg-white/10 hover:bg-gold/20 text-ink dark:text-white border-black/15 dark:border-white/15"
                      : "opacity-40 cursor-not-allowed bg-black/5 dark:bg-white/5 border-transparent text-ink3 dark:text-white/40"
                  )}
                  title={selectedCount === 5 ? "Preview A4 Handout" : "Select 5 questions to enable preview"}
                >
                  <Printer size={14} className="text-gold" />
                  <span>Preview 2-Page A4 Handout</span>
                </button>

                <button
                  onClick={handlePublishDailyQuiz}
                  disabled={!isReadyToPublish || publishing}
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer",
                    isReadyToPublish && !publishing
                      ? "bg-gold hover:bg-gold-l text-black font-black animate-pulse shadow-gold/20"
                      : "opacity-50 cursor-not-allowed bg-black/10 dark:bg-white/10 text-ink3 dark:text-white/40"
                  )}
                >
                  {publishing ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Publishing Live...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />
                      <span>Publish 5 Questions & A4 Handout</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* CANDIDATE QUESTIONS LIST (10 CARDS) */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif font-black flex items-center gap-2">
                  <span>Candidate Review Bank</span>
                  <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-ink3 dark:text-white/60">
                    10 Questions Grounded in {draft.previousDayDisplay}
                  </span>
                </h2>
                <span className="text-xs text-ink3 dark:text-white/60">
                  Select checkbox to include in tomorrow's edition
                </span>
              </div>

              {draft.candidates.map((mcq, idx) => {
                const isSelected = draft.selectedQuestionIds.includes(mcq.id);
                const isCorrecting = correctingIndex === idx;
                const isCorrectionOpen = activeCorrectionIndex === idx;
                const isEditing = editingIndex === idx;

                return (
                  <div
                    key={mcq.id || idx}
                    className={cn(
                      "bg-white dark:bg-[#151720] rounded-3xl border transition-all shadow-sm overflow-hidden",
                      isSelected
                        ? "border-gold/80 dark:border-gold/70 ring-2 ring-gold/20"
                        : "border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20"
                    )}
                  >
                    {/* Card Header Bar */}
                    <div className={cn(
                      "p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b",
                      isSelected 
                        ? "bg-amber-500/10 dark:bg-amber-500/15 border-gold/30" 
                        : "bg-paper2 dark:bg-[#121316] border-black/5 dark:border-white/10"
                    )}>
                      <div className="flex items-center gap-3">
                        {/* Selection Checkbox Button */}
                        <button
                          onClick={() => toggleQuestionSelection(mcq.id)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer",
                            isSelected
                              ? "bg-gold text-black shadow-xs font-black"
                              : "bg-paper3 dark:bg-white/10 text-ink3 dark:text-white/70 hover:text-ink hover:bg-gold/20"
                          )}
                        >
                          {isSelected ? (
                            <>
                              <CheckSquare size={15} className="text-black" />
                              <span>Selected for Quiz</span>
                            </>
                          ) : (
                            <>
                              <Square size={15} />
                              <span>Select Question</span>
                            </>
                          )}
                        </button>

                        <span className="font-mono text-xs font-bold text-ink3 dark:text-white/60">
                          Candidate #{idx + 1}
                        </span>

                        <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border font-mono", mcq.tagClass)}>
                          {mcq.targetExam}
                        </span>

                        <span className="text-[11px] font-bold text-ink2 dark:text-white/80 hidden sm:inline">
                          {mcq.category}
                        </span>

                        {mcq.adminCorrected && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold flex items-center gap-1">
                            <Sparkles size={10} />
                            <span>Fact-Checked & Corrected</span>
                          </span>
                        )}
                      </div>

                      {/* Card Action Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (isCorrectionOpen) {
                              setActiveCorrectionIndex(null);
                            } else {
                              setActiveCorrectionIndex(idx);
                              setCorrectionPrompt('');
                              setEditingIndex(null);
                            }
                          }}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                            isCorrectionOpen
                              ? "bg-gold text-black"
                              : "bg-paper2 dark:bg-white/10 text-ink dark:text-white hover:bg-gold/20 border border-black/10 dark:border-white/10"
                          )}
                        >
                          <Wand2 size={13} className={isCorrectionOpen ? "text-black" : "text-gold"} />
                          <span>AI Fact-Check & Fix</span>
                        </button>

                        <button
                          onClick={() => {
                            if (isEditing) {
                              setEditingIndex(null);
                              setEditFormData(null);
                            } else {
                              setEditingIndex(idx);
                              setEditFormData({ ...mcq });
                              setActiveCorrectionIndex(null);
                            }
                          }}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                            isEditing
                              ? "bg-ink text-white dark:bg-white dark:text-black"
                              : "bg-paper2 dark:bg-white/10 text-ink dark:text-white hover:bg-black/10 dark:hover:bg-white/20 border border-black/10 dark:border-white/10"
                          )}
                        >
                          <Edit3 size={13} />
                          <span>{isEditing ? 'Cancel Edit' : 'Edit Manually'}</span>
                        </button>
                      </div>
                    </div>

                    {/* AI CORRECTION EXPANDABLE DRAWER */}
                    {isCorrectionOpen && (
                      <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-gold/30">
                        <div className="flex items-start gap-2.5 mb-3">
                          <Wand2 size={16} className="text-gold shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-400 font-mono">
                              AI Fact-Check & In-App Question Correction
                            </h4>
                            <p className="text-xs text-ink3 dark:text-white/70">
                              Tell the AI exactly what needs correction (e.g. <em>"This is from 2024, replace with yesterday's actual RBI announcement"</em> or <em>"Option C is inaccurate, update it"</em>). The AI will verify live facts and rewrite this question.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2.5">
                          <input
                            type="text"
                            value={correctionPrompt}
                            onChange={(e) => setCorrectionPrompt(e.target.value)}
                            placeholder="e.g. The 2nd question also 2024 based incident. Replace with an actual event that happened yesterday..."
                            className="flex-1 bg-white dark:bg-black/40 border border-gold/50 rounded-xl px-3.5 py-2 text-xs text-ink dark:text-white focus:outline-hidden focus:ring-2 focus:ring-gold"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleApplyAICorrection(idx);
                            }}
                          />
                          <button
                            onClick={() => handleApplyAICorrection(idx)}
                            disabled={!correctionPrompt.trim() || isCorrecting}
                            className="px-4 py-2 bg-gold hover:bg-gold-l text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shrink-0 shadow-md cursor-pointer disabled:opacity-50"
                          >
                            {isCorrecting ? (
                              <>
                                <RefreshCw size={13} className="animate-spin" />
                                <span>Verifying Facts...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles size={13} />
                                <span>Apply AI Correction</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* MANUAL EDIT FORM */}
                    {isEditing && editFormData && (
                      <div className="p-4 sm:p-6 bg-paper2 dark:bg-[#121316] border-b border-black/10 dark:border-white/10 space-y-4">
                        <div>
                          <label className="block text-[11px] font-mono font-bold text-ink3 dark:text-white/60 uppercase mb-1">
                            Question Text
                          </label>
                          <textarea
                            rows={3}
                            value={editFormData.question}
                            onChange={(e) => setEditFormData({ ...editFormData, question: e.target.value })}
                            className="w-full bg-white dark:bg-black/40 border border-black/15 dark:border-white/20 rounded-xl p-3 text-xs text-ink dark:text-white focus:outline-hidden focus:border-gold font-serif"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {editFormData.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${idx}`}
                                checked={editFormData.correctAnswer === optIdx}
                                onChange={() => setEditFormData({ ...editFormData, correctAnswer: optIdx })}
                                className="text-gold focus:ring-gold"
                                title="Mark as correct answer"
                              />
                              <span className="font-mono text-xs font-bold text-ink3 dark:text-white/60">
                                {['A', 'B', 'C', 'D'][optIdx]}:
                              </span>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const newOpts = [...editFormData.options];
                                  newOpts[optIdx] = e.target.value;
                                  setEditFormData({ ...editFormData, options: newOpts });
                                }}
                                className="flex-1 bg-white dark:bg-black/40 border border-black/15 dark:border-white/20 rounded-xl px-2.5 py-1.5 text-xs text-ink dark:text-white focus:outline-hidden focus:border-gold"
                              />
                            </div>
                          ))}
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono font-bold text-ink3 dark:text-white/60 uppercase mb-1">
                            Fact-Checked Explanation
                          </label>
                          <textarea
                            rows={3}
                            value={editFormData.explanation}
                            onChange={(e) => setEditFormData({ ...editFormData, explanation: e.target.value })}
                            className="w-full bg-white dark:bg-black/40 border border-black/15 dark:border-white/20 rounded-xl p-3 text-xs text-ink dark:text-white focus:outline-hidden focus:border-gold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono font-bold text-ink3 dark:text-white/60 uppercase mb-1">
                            Examiner Trap Warning
                          </label>
                          <input
                            type="text"
                            value={editFormData.examTrap}
                            onChange={(e) => setEditFormData({ ...editFormData, examTrap: e.target.value })}
                            className="w-full bg-white dark:bg-black/40 border border-black/15 dark:border-white/20 rounded-xl px-3 py-1.5 text-xs text-ink dark:text-white focus:outline-hidden focus:border-gold"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            onClick={() => {
                              setEditingIndex(null);
                              setEditFormData(null);
                            }}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-paper3 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-ink dark:text-white cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveManualEdit}
                            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gold hover:bg-gold-l text-black flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Save size={13} />
                            <span>Save Changes</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* QUESTION CONTENT DISPLAY */}
                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Question Text */}
                      <p className="text-base sm:text-lg font-serif font-bold text-ink dark:text-white leading-relaxed">
                        {mcq.question}
                      </p>

                      {/* 4 Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {mcq.options.map((opt, optIdx) => {
                          const isCorrect = mcq.correctAnswer === optIdx;
                          return (
                            <div
                              key={optIdx}
                              className={cn(
                                "p-3 rounded-2xl border text-xs flex items-start gap-2.5 transition-all",
                                isCorrect
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/50 text-emerald-950 dark:text-emerald-200 font-semibold"
                                  : "bg-paper dark:bg-white/5 border-black/5 dark:border-white/5 text-ink dark:text-white/80"
                              )}
                            >
                              <span className={cn(
                                "w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0",
                                isCorrect
                                  ? "bg-emerald-600 text-white"
                                  : "bg-black/10 dark:bg-white/10 text-ink3 dark:text-white/60"
                              )}>
                                {['A', 'B', 'C', 'D'][optIdx]}
                              </span>
                              <span className="flex-1 leading-normal">{opt}</span>
                              {isCorrect && (
                                <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-mono font-bold uppercase shrink-0">
                                  Correct
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Fact-Checked Explanation */}
                      <div className="p-3.5 rounded-2xl bg-paper2 dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs text-ink3 dark:text-white/70 space-y-1.5">
                        <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-gold" />
                          <span>Verified Explanation & Syllabus Mapping</span>
                        </div>
                        <p className="leading-relaxed">{mcq.explanation}</p>
                        {mcq.examTrap && (
                          <div className="pt-1.5 text-[11px] text-amber-800 dark:text-amber-400 font-medium">
                            <span className="font-bold">⚠️ Examiner Trap: </span>
                            {mcq.examTrap}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Fresh Generation Custom Focus Modal */}
      {showFocusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1a1b22] text-ink dark:text-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gold/15 text-gold flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg">Generate 10 Candidate Questions</h3>
                <p className="text-xs text-ink3 dark:text-white/60">Grounded in events of {draft?.previousDayDisplay || 'preceding day'}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <label className="block text-xs font-mono font-bold text-ink3 dark:text-white/70 uppercase">
                Optional Topic Focus / Specific Syllabus Angle
              </label>
              <textarea
                rows={3}
                value={customFocus}
                onChange={(e) => setCustomFocus(e.target.value)}
                placeholder="e.g. Prioritize Supreme Court landmark verdicts, Nobel Prize, and RBI monetary policy directives..."
                className="w-full bg-paper2 dark:bg-black/40 border border-black/15 dark:border-white/20 rounded-xl p-3 text-xs text-ink dark:text-white focus:outline-hidden focus:border-gold"
              />
              <p className="text-[11px] text-ink3 dark:text-white/60">
                Leave empty for a balanced scan across all 8 syllabus pillars (Science, Economy, Polity, Environment, Defense, etc.).
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowFocusModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-paper2 dark:bg-white/10 hover:bg-black/5 dark:hover:bg-white/20 text-ink dark:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateFreshCandidates}
                disabled={generating}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gold hover:bg-gold-l text-black flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Searching & Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    <span>Generate 10 Questions</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2-Page A4 Handout Printable Modal */}
      {previewCapsule && (
        <PrintableA4HandoutModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          capsule={previewCapsule}
        />
      )}
    </div>
  );
};

export default AdminQuizCuration;
