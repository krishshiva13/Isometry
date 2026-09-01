import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  BookOpen, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Save, 
  Send, 
  Plus, 
  Layers, 
  Eye, 
  ArrowLeft,
  Calendar,
  Share2,
  HelpCircle,
  Languages,
  Copy,
  Check,
  Zap,
  Tag,
  GraduationCap,
  Search,
  SlidersHorizontal,
  Globe,
  Terminal
} from 'lucide-react';
import { AIDraft, Category, Fact, AIScannerStatus, QuizMCQ, BilingualTerm } from '../types';
import { factService } from '../services/factService';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/firebase';
import ReactMarkdown from 'react-markdown';
import { ImageUploadField } from '../components/common/ImageUploadField';
import { MarkdownToolbar } from '../components/common/MarkdownToolbar';
import { normalizeImageUrl } from '../lib/imageUtils';
import { AdminDebugConsole } from '../components/admin/AdminDebugConsole';
import { AIGenerationSkeleton } from '../components/admin/AIGenerationSkeleton';
import { AIGenerationErrorState } from '../components/admin/AIGenerationErrorState';
import { adminLogService } from '../services/adminLogService';
import { fetchWithExponentialBackoff, RetryProgress } from '../lib/apiRetry';

const COLOR_OPTIONS = [
  { name: 'gold', label: 'Gold', bg: 'bg-[#d9ad42]', text: 'text-[#d9ad42]' },
  { name: 'coral', label: 'Coral', bg: 'bg-[#ff6b6b]', text: 'text-[#ff6b6b]' },
  { name: 'teal', label: 'Teal', bg: 'bg-[#2ec4b6]', text: 'text-[#2ec4b6]' },
  { name: 'indigo', label: 'Indigo', bg: 'bg-[#4f46e5]', text: 'text-[#4f46e5]' },
  { name: 'red', label: 'Red', bg: 'bg-rose-600', text: 'text-rose-600' },
  { name: 'green', label: 'Green', bg: 'bg-emerald-600', text: 'text-emerald-600' },
  { name: 'blue', label: 'Blue', bg: 'bg-blue-600', text: 'text-blue-600' },
  { name: 'slate', label: 'Slate', bg: 'bg-slate-600', text: 'text-slate-600' }
];

export const GOOGLE_SCAN_KEYWORDS = [
  { id: "History", label: "History", emoji: "📜", category: "history", desc: "Ancient, Modern & World History, Treaties & Freedom Movement" },
  { id: "Science", label: "Science", emoji: "🔬", category: "science", desc: "Physics, Chemistry, Biology, Quantum, Astronomy & Natural Sciences" },
  { id: "Technology", label: "Technology", emoji: "💻", category: "science", desc: "AI, Semiconductors, Computing, Clean Energy & Digital Tech" },
  { id: "UPSC", label: "UPSC", emoji: "🏛️", category: "history", desc: "Civil Services Prelims & Mains GS Syllabus, Polity, Environment & Economy" },
  { id: "ISRO", label: "ISRO", emoji: "🚀", category: "science", desc: "Indian Space Missions, Chandrayaan, Gaganyaan, Aditya-L1 & Satellites" },
  { id: "DRDO", label: "DRDO", emoji: "🛡️", category: "science", desc: "Indigenous Defense Systems, Agni/BrahMos Missiles, Radars & Defense Tech" },
  { id: "NASA", label: "NASA", emoji: "🌌", category: "science", desc: "Deep Space Exploration, Artemis Moon Mission, Mars Rovers & Telescopes" },
  { id: "Indian Government", label: "Indian Government", emoji: "🇮🇳", category: "history", desc: "Official PIB Releases, Cabinet Acts, National Schemes & Constitutional Policy" },
  { id: "SSC", label: "SSC", emoji: "📚", category: "history", desc: "Staff Selection Commission CGL, CHSL, MTS General Awareness & Static GK" },
  { id: "Railways", label: "Railways", emoji: "🚆", category: "inventions", desc: "Indian Railways Infrastructure, Vande Bharat, Freight Corridors & Rail Tech" },
  { id: "RRB", label: "RRB", emoji: "🎯", category: "science", desc: "Railway Recruitment Board NTPC, Group D, ALP General Science & Static GK" },
  { id: "Inventions", label: "Inventions", emoji: "💡", category: "inventions", desc: "Groundbreaking Inventions, Patents, Technological Breakthroughs & Tools" },
  { id: "Important Days", label: "Important Days", emoji: "📅", category: "history", desc: "National & UN Observance Days, Global Themes & Historical Commemorations" },
  { id: "Famous Birthdays", label: "Famous Birthdays", emoji: "🎂", category: "birthdays", desc: "Birth Anniversaries of Historic Pioneers, Freedom Fighters & Visionaries" },
  { id: "Scientists", label: "Scientists", emoji: "👨‍🔬", category: "science", desc: "Nobel Laureates, Great Indian & World Scientists, Discoveries & Legacies" },
];

const TOPIC_TYPES = [
  { id: 'all_round', label: '🌐 All 5 Pillars (Full Scan)', desc: 'Covers history, science, days, exam GK & current affairs' },
  { id: 'day_in_history', label: '📅 Day in History', desc: 'Historic events, milestones, & anniversaries on this calendar date' },
  { id: 'national_days', label: '🎖️ National & Important Days', desc: 'National observances, UN commemorative days, & themes' },
  { id: 'science', label: '🔬 Science & Discovery', desc: 'Space missions (ISRO/NASA), quantum, physics, & innovations' },
  { id: 'exam_gk', label: '🏛️ Government Exam GK', desc: 'High-yield static & dynamic GK for UPSC, SSC CGL & State PSCs' },
  { id: 'current_affairs', label: '📰 Current Affairs News', desc: 'Verified educational news, policies, & government schemes' }
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

export const AdminAIPanel = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();

  const [drafts, setDrafts] = useState<AIDraft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<AIDraft | null>(null);
  const [activeTab, setActiveTab] = useState<'keyword_creator' | 'queue' | 'scan_hub' | 'custom_generate' | 'scanner_info' | 'debug_console'>('keyword_creator');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTopic, setFilterTopic] = useState<string>('all');
  const [filterKeyword, setFilterKeyword] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [keywordScanning, setKeywordScanning] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [retryProgress, setRetryProgress] = useState<RetryProgress | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [copiedDigest, setCopiedDigest] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Scanner status & 2-Hour Cooldown Timer
  const [scannerStatus, setScannerStatus] = useState<AIScannerStatus>({
    lastScanTime: null,
    nextScanTime: null,
    scanIntervalHours: 2,
    foundItemsCount: 0,
    statusMessage: 'Ready',
    isRunning: false,
    cooldownRemainingMs: 0,
    lastScanTopic: 'all_round'
  });

  const [remainingCooldownMs, setRemainingCooldownMs] = useState<number>(0);

  // Selected scan topic & date
  const [scanTopicType, setScanTopicType] = useState<string>('all_round');
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number>(() => new Date().getDate());

  // Keyword AI Creator State (15 Core Google Keywords)
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([
    'UPSC', 'ISRO', 'DRDO', 'Science', 'Technology'
  ]);
  const [customKeywordInput, setCustomKeywordInput] = useState('');
  const [keywordQuery, setKeywordQuery] = useState('');
  const [keywordTargetExam, setKeywordTargetExam] = useState('UPSC Civil Services GS I/II/III, SSC CGL & Competitive Exams');
  const [keywordTopicType, setKeywordTopicType] = useState('exam_gk');

  // Custom single generator input
  const [customTopic, setCustomTopic] = useState('');
  const [customCategory, setCustomCategory] = useState<Category>('science');
  const [customTopicType, setCustomTopicType] = useState<string>('day_in_history');
  const [customFocus, setCustomFocus] = useState('UPSC Civil Services & State PSC Exam Relevance');

  // Edit draft form state
  const [editForm, setEditForm] = useState<Partial<AIDraft>>({});
  const [publishType, setPublishType] = useState<'immediate' | 'schedule'>('immediate');
  const [scheduleTime, setScheduleTime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 2);
    return d.toISOString().substring(0, 16);
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cooldown countdown interval (1 second ticks)
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingCooldownMs((prev) => {
        if (prev <= 1000) return 0;
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadDrafts();
      fetchScannerStatus();
    }
  }, [isAdmin]);

  const loadDrafts = async () => {
    setLoading(true);
    try {
      const items = await factService.getAIDrafts();
      setDrafts(items);
      if (items.length > 0 && !selectedDraft) {
        selectDraftForEditing(items[0]);
      }
    } catch (err) {
      console.error("Failed to load drafts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchScannerStatus = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/admin/ai/status', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setScannerStatus(data);
        if (data.cooldownRemainingMs !== undefined) {
          setRemainingCooldownMs(data.cooldownRemainingMs);
        } else if (data.lastScanTime) {
          const elapsed = Date.now() - new Date(data.lastScanTime).getTime();
          const remaining = Math.max(0, 2 * 60 * 60 * 1000 - elapsed);
          setRemainingCooldownMs(remaining);
        }
      }
    } catch (err) {
      console.error("Failed to fetch scanner status", err);
    }
  };

  // Helper to format remaining milliseconds as HH:MM:SS
  const formatCooldown = (ms: number) => {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTriggerScan = async (force: boolean = false) => {
    if (remainingCooldownMs > 0 && !force) {
      setNotification({
        type: 'info',
        message: `2-Hour Cooldown is active (${formatCooldown(remainingCooldownMs)} remaining). Scanner runs every 2 hours automatically.`
      });
      return;
    }

    setScanning(true);
    setNotification(null);
    try {
      if (!auth.currentUser && auth.authStateReady) {
        await auth.authStateReady();
      }
      const currentUser = auth.currentUser;
      const token = currentUser ? await currentUser.getIdToken() : null;

      const res = await fetch('/api/admin/ai/scan', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          topicType: scanTopicType,
          targetMonth: selectedMonth,
          targetDay: selectedDay,
          force
        })
      });

      let data: any = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(res.status === 401 || res.status === 403 
          ? 'Admin authorization required. Please make sure you are signed in as an administrator.' 
          : `Server communication error (${res.status}). Please try again in a few moments.`);
      }

      if (res.ok && data.success) {
        if (data.drafts && Array.isArray(data.drafts) && data.drafts.length > 0) {
          await factService.saveScannedDrafts(data.drafts);
          setDrafts(prev => {
            const map = new Map<string, AIDraft>();
            for (const d of data.drafts) map.set(d.id, d);
            for (const d of prev) if (!map.has(d.id)) map.set(d.id, d);
            return Array.from(map.values());
          });
          selectDraftForEditing(data.drafts[0]);
        }
        setNotification({
          type: 'success',
          message: data.count > 0 
            ? `Successfully scanned Google & verified sources! Created ${data.count} educational draft(s). 2-Hour Cooldown started.`
            : `Scan complete: Verified knowledge checked. No low-yield items found. Next 2-hour window opened.`
        });
        setRemainingCooldownMs(2 * 60 * 60 * 1000);
        await loadDrafts();
        fetchScannerStatus();
      } else if (data.quotaLimited) {
        setNotification({
          type: 'info',
          message: data.message || 'Gemini API temporary quota limit was reached. System entered 2-hour cooldown.'
        });
        setRemainingCooldownMs(2 * 60 * 60 * 1000);
        fetchScannerStatus();
      } else if (data.cooldown) {
        setNotification({
          type: 'info',
          message: data.message || `2-Hour cooldown is in progress (${formatCooldown(data.cooldownRemainingMs)} remaining).`
        });
        if (data.cooldownRemainingMs) {
          setRemainingCooldownMs(data.cooldownRemainingMs);
        }
      } else {
        throw new Error(data.error || 'Failed scan');
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `Scan failed: ${err.message || 'Check server connection'}`
      });
    } finally {
      setScanning(false);
    }
  };

  const handleTriggerKeywordScan = async (force: boolean = false) => {
    if (selectedKeywords.length === 0) {
      setNotification({
        type: 'error',
        message: 'Please select at least 1 keyword to scan.'
      });
      return;
    }

    setKeywordScanning(true);
    setRetryProgress(null);
    setNotification({
      type: 'info',
      message: `Scanning Google news & factual databases for keywords: ${selectedKeywords.slice(0, 4).join(', ')}${selectedKeywords.length > 4 ? ` +${selectedKeywords.length - 4} more` : ''}...`
    });

    adminLogService.log('info', 'AI_SCAN_KEYWORDS', `Initiating autonomous keyword scan for: ${selectedKeywords.join(', ')}`, {
      keywords: selectedKeywords,
      targetExam: keywordTargetExam,
      topicType: keywordTopicType,
      force
    }, '/api/admin/ai/scan-keywords');

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetchWithExponentialBackoff(
        '/api/admin/ai/scan-keywords',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            keywords: selectedKeywords,
            query: keywordQuery.trim() || undefined,
            targetExam: keywordTargetExam,
            topicType: keywordTopicType,
            eventMonth: selectedMonth,
            eventDay: selectedDay,
            force
          })
        },
        {
          maxRetries: 3,
          initialDelayMs: 2000,
          onRetryProgress: (progress) => {
            setRetryProgress(progress);
            adminLogService.log('warn', 'AI_RETRY', `Retry ${progress.attempt}/${progress.maxRetries} during keyword scan (${progress.statusMessage})`, progress, '/api/admin/ai/scan-keywords');
          }
        }
      );

      let data: any = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(res.status === 401 || res.status === 403 
          ? 'Admin authorization required. Please make sure you are signed in as an administrator.' 
          : `Server returned unexpected response (${res.status}): ${text.substring(0, 80)}...`);
      }
      if (res.ok && data.success) {
        if (data.drafts && Array.isArray(data.drafts) && data.drafts.length > 0) {
          await factService.saveScannedDrafts(data.drafts);
          setDrafts(prev => {
            const map = new Map<string, AIDraft>();
            for (const d of data.drafts) map.set(d.id, d);
            for (const d of prev) if (!map.has(d.id)) map.set(d.id, d);
            return Array.from(map.values());
          });
          selectDraftForEditing(data.drafts[0]);
        }

        adminLogService.log('success', 'AI_SCAN_KEYWORDS', `Keyword scan completed with ${data.drafts?.length || 0} drafts`, {
          count: data.drafts?.length || 0,
          quotaLimited: data.quotaLimited
        }, '/api/admin/ai/scan-keywords', res.status);

        setNotification({
          type: 'success',
          message: data.message || `Keyword scan finished! ${data.newDraftsCount || data.count} verified drafts generated and ready for your review.`
        });
        await loadDrafts();
        fetchScannerStatus();
        setActiveTab('queue');
      } else if (data.quotaLimited) {
        adminLogService.log('warn', 'AI_QUOTA', `Gemini API temporary quota reached during keyword scan`, data, '/api/admin/ai/scan-keywords');
        setNotification({
          type: 'info',
          message: data.message || 'Gemini API temporary quota reached. Please retry in a few moments.'
        });
        setRemainingCooldownMs(2 * 60 * 60 * 1000);
        fetchScannerStatus();
      } else if (data.cooldown) {
        setNotification({
          type: 'info',
          message: data.message || `2-Hour cooldown is in progress (${formatCooldown(data.cooldownRemainingMs)} remaining).`
        });
        if (data.cooldownRemainingMs) {
          setRemainingCooldownMs(data.cooldownRemainingMs);
        }
      } else {
        throw new Error(data.error || 'Failed keyword scan');
      }
    } catch (err: any) {
      const errMsg = err.message || 'Check network connection';
      adminLogService.log('error', 'AI_SCAN_KEYWORDS', `Keyword scan failed: ${errMsg}`, {
        error: err.toString(),
        stack: err.stack
      }, '/api/admin/ai/scan-keywords');

      setNotification({
        type: 'error',
        message: `Keyword scan failed: ${errMsg}`
      });
    } finally {
      setKeywordScanning(false);
      setRetryProgress(null);
    }
  };

  const toggleKeyword = (kw: string) => {
    setSelectedKeywords(prev => 
      prev.includes(kw) ? prev.filter(k => k !== kw) : [...prev, kw]
    );
  };

  const selectAllKeywords = () => {
    setSelectedKeywords(GOOGLE_SCAN_KEYWORDS.map(k => k.id));
  };

  const clearAllKeywords = () => {
    setSelectedKeywords([]);
  };

  const selectKeywordPreset = (presetName: 'space_defense' | 'exams' | 'history_inventions' | 'all') => {
    if (presetName === 'all') {
      selectAllKeywords();
    } else if (presetName === 'space_defense') {
      setSelectedKeywords(['ISRO', 'DRDO', 'NASA', 'Technology', 'Science', 'Scientists']);
    } else if (presetName === 'exams') {
      setSelectedKeywords(['UPSC', 'SSC', 'Railways', 'RRB', 'Indian Government', 'History']);
    } else if (presetName === 'history_inventions') {
      setSelectedKeywords(['History', 'Inventions', 'Important Days', 'Famous Birthdays', 'Scientists']);
    }
  };

  const handleAddCustomKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customKeywordInput.trim();
    if (!clean) return;
    if (!selectedKeywords.includes(clean)) {
      setSelectedKeywords(prev => [...prev, clean]);
    }
    setCustomKeywordInput('');
  };

  const handleGenerateCustom = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customTopic.trim()) return;

    setGenerating(true);
    setGenerationError(null);
    setRetryProgress(null);
    setNotification(null);

    adminLogService.log('info', 'AI_GENERATE', `Starting single draft generation for topic: "${customTopic}"`, {
      topic: customTopic,
      category: customCategory,
      topicType: customTopicType,
      focus: customFocus
    }, '/api/admin/ai/generate-single');

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetchWithExponentialBackoff(
        '/api/admin/ai/generate-single',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            topic: customTopic,
            category: customCategory,
            topicType: customTopicType,
            focus: customFocus,
            eventMonth: selectedMonth,
            eventDay: selectedDay
          })
        },
        {
          maxRetries: 3,
          initialDelayMs: 1500,
          onRetryProgress: (progress) => {
            setRetryProgress(progress);
            adminLogService.log('warn', 'AI_RETRY', `Retry attempt ${progress.attempt}/${progress.maxRetries} for: "${customTopic}" (${progress.statusMessage})`, progress, '/api/admin/ai/generate-single');
          }
        }
      );

      let responseData: any = null;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        responseData = await res.json();
      } else {
        const text = await res.text();
        throw new Error(res.status === 401 || res.status === 403 
          ? 'Admin authorization required. Please make sure you are signed in as an administrator.' 
          : `Server error (${res.status}): ${text.substring(0, 80)}`);
      }

      if (!res.ok) {
        throw new Error(responseData?.error || responseData?.message || 'Failed to generate draft');
      }

      const newDraft: AIDraft = responseData;
      await factService.createAIDraft(newDraft);
      setDrafts(prev => [newDraft, ...prev.filter(d => d.id !== newDraft.id)]);
      selectDraftForEditing(newDraft);

      adminLogService.log('success', 'AI_GENERATE', `Successfully generated draft: "${newDraft.title}"`, {
        id: newDraft.id,
        category: newDraft.cat,
        mcqsCount: newDraft.quizMCQs?.length || 0
      }, '/api/admin/ai/generate-single', res.status);

      setNotification({
        type: 'success',
        message: `Verified draft created for: "${newDraft.title}" with MCQs & glossary!`
      });
      setCustomTopic('');
      await loadDrafts();
      setActiveTab('queue');
    } catch (err: any) {
      const errMsg = err.message || 'Unknown generation error';
      setGenerationError(errMsg);
      adminLogService.log('error', 'AI_GENERATE', `Generation failed for: "${customTopic}" - ${errMsg}`, {
        error: err.toString(),
        stack: err.stack
      }, '/api/admin/ai/generate-single');

      setNotification({
        type: 'error',
        message: `Generation error: ${errMsg}`
      });
    } finally {
      setGenerating(false);
      setRetryProgress(null);
    }
  };

  const selectDraftForEditing = (draft: AIDraft) => {
    setSelectedDraft(draft);
    setEditForm({
      ...draft,
      cat: draft.cat || 'science',
      topicType: draft.topicType || 'day_in_history',
      year: draft.year || new Date().getFullYear(),
      emoji: draft.emoji || '📝',
      quizMCQs: draft.quizMCQs || [],
      bilingualTerms: draft.bilingualTerms || []
    });
    setPreviewMode(false);
  };

  const handleInsertColor = (colorName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = editForm.full || '';
    const selectedText = currentText.substring(start, end);
    const replacement = `[${colorName}]${selectedText || 'important concept'}[/${colorName}]`;

    const newValue = currentText.substring(0, start) + replacement + currentText.substring(end);
    setEditForm({ ...editForm, full: newValue });

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + replacement.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const handleCopyDigest = () => {
    if (!editForm.socialPostDigest) return;
    navigator.clipboard.writeText(editForm.socialPostDigest);
    setCopiedDigest(true);
    setTimeout(() => setCopiedDigest(false), 2500);
  };

  const handleSaveDraftChanges = async () => {
    if (!selectedDraft) return;
    setLoading(true);
    try {
      await factService.updateAIDraft(selectedDraft.id, {
        title: editForm.title || '',
        cat: editForm.cat || 'science',
        topicType: editForm.topicType || 'day_in_history',
        emoji: editForm.emoji || '📝',
        year: editForm.year || new Date().getFullYear(),
        excerpt: editForm.excerpt || '',
        full: editForm.full || '',
        imageUrl: editForm.imageUrl || '',
        imageAlt: editForm.imageAlt || '',
        imageCredit: editForm.imageCredit || '',
        factCheckSummary: editForm.factCheckSummary || '',
        examRelevance: editForm.examRelevance || '',
        quizMCQs: editForm.quizMCQs || [],
        bilingualTerms: editForm.bilingualTerms || [],
        socialPostDigest: editForm.socialPostDigest || '',
        affiliateProducts: editForm.affiliateProducts || [],
        trustedSources: editForm.trustedSources || []
      });

      setNotification({
        type: 'success',
        message: "Draft changes & MCQs saved successfully!"
      });
      await loadDrafts();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `Failed to save changes: ${err.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePublishFact = async () => {
    if (!selectedDraft) return;
    if (!editForm.title || !editForm.full) {
      alert("Please ensure the title and full article text are not empty.");
      return;
    }

    setLoading(true);
    try {
      const cleanId = (editForm.title || 'fact')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .substring(0, 90) || `fact-${Date.now()}`;

      const finalFact: Fact = {
        id: cleanId,
        cat: (editForm.cat || 'science') as Category,
        topicType: editForm.topicType || 'day_in_history',
        emoji: editForm.emoji || '💡',
        title: editForm.title || '',
        year: editForm.year || new Date().getFullYear(),
        excerpt: editForm.excerpt || '',
        full: editForm.full || '',
        featured: false,
        imageUrl: editForm.imageUrl || '',
        imageAlt: editForm.imageAlt || '',
        imageCredit: editForm.imageCredit || 'Verified Educational News Service',
        eventMonth: editForm.eventMonth || selectedMonth,
        eventDay: editForm.eventDay || selectedDay,
        quizMCQs: editForm.quizMCQs || [],
        bilingualTerms: editForm.bilingualTerms || [],
        socialPostDigest: editForm.socialPostDigest || '',
        affiliateProducts: editForm.affiliateProducts || [],
        examRelevance: editForm.examRelevance || '',
        factCheckSummary: editForm.factCheckSummary || '',
        trustedSources: editForm.trustedSources || []
      };

      if (publishType === 'schedule') {
        finalFact.publishAt = scheduleTime;
      }

      await factService.createFact(finalFact);

      await factService.updateAIDraft(selectedDraft.id, {
        status: 'published'
      });

      setNotification({
        type: 'success',
        message: `Published live to FactHub & Exam Prep! Link: /article/${finalFact.id}`
      });

      await loadDrafts();
    } catch (err: any) {
      console.error("Publish error:", err);
      setNotification({
        type: 'error',
        message: `Failed to publish: ${err.message || 'Error occurred'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDraft = async (id: string) => {
    if (!confirm("Are you sure you want to discard this draft?")) return;
    try {
      await factService.deleteAIDraft(id);
      if (selectedDraft?.id === id) {
        setSelectedDraft(null);
      }
      setNotification({
        type: 'success',
        message: 'Draft removed from queue.'
      });
      await loadDrafts();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-serif font-black text-ink">Access Restricted</h2>
        <p className="text-sm text-ink3">
          This AI Content Creator suite is strictly restricted to verified FactHub administrators.
        </p>
        <Link to="/" className="inline-block px-6 py-2.5 bg-ink text-white font-bold rounded-xl text-sm hover:bg-gold hover:text-ink transition-all">
          Return to FactHub Home
        </Link>
      </div>
    );
  }

  const filteredDrafts = drafts.filter(d => {
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    const matchTopic = filterTopic === 'all' || d.topicType === filterTopic;
    const matchKeyword = filterKeyword === 'all' || 
      (d.searchKeywords && d.searchKeywords.includes(filterKeyword)) ||
      d.targetKeyword === filterKeyword;
    return matchStatus && matchTopic && matchKeyword;
  });

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Top Banner */}
      <div className="bg-ink text-white py-4 px-6 border-b border-black/10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/80 hover:text-white">
              <ArrowLeft size={20} />
            </Link>
            <div className="w-10 h-10 rounded-xl bg-gold/20 text-gold flex items-center justify-center border border-gold/30">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-serif font-black tracking-tight text-white">
                  FActHub AI Content Creator
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Admin: krish02shiva@gmail.com
                </span>
              </div>
              <p className="text-xs text-white/70 flex items-center gap-2">
                <span>Day in History • Science • National Days • Exam GK • Current Affairs</span>
              </p>
            </div>
          </div>

          {/* 2-Hour Timer Display & Action */}
          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
            <div className="text-right">
              <div className="text-[10px] uppercase font-mono text-white/60">2-Hour Cooldown Timer</div>
              <div className="text-sm font-mono font-black text-gold flex items-center gap-1.5 justify-end">
                <Clock size={14} className={remainingCooldownMs > 0 ? "animate-pulse text-amber-400" : "text-emerald-400"} />
                <span>{remainingCooldownMs > 0 ? formatCooldown(remainingCooldownMs) : "00:00:00 (Ready)"}</span>
              </div>
            </div>

            <button
              onClick={() => handleTriggerScan(false)}
              disabled={scanning || remainingCooldownMs > 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-gold hover:bg-amber-400 text-ink font-bold text-xs rounded-xl transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              title={remainingCooldownMs > 0 ? `Cooldown active: ${formatCooldown(remainingCooldownMs)} left` : "Click to scan"}
            >
              <RefreshCw size={14} className={scanning ? "animate-spin" : ""} />
              <span>
                {scanning 
                  ? "Scanning Google…" 
                  : remainingCooldownMs > 0 
                    ? `Wait 2h (${formatCooldown(remainingCooldownMs)})` 
                    : "Scan Google Now"}
              </span>
            </button>

            {remainingCooldownMs > 0 && (
              <button
                onClick={() => {
                  if (confirm("Cooldown is active. Do you want to force an emergency scan now?")) {
                    handleTriggerScan(true);
                  }
                }}
                className="px-2.5 py-2 text-[10px] font-mono text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                title="Bypass cooldown for testing"
              >
                Force
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation & Topic Control Sub-bar */}
      <div className="bg-white border-b border-black/10 px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1 bg-paper2 p-1 rounded-xl border border-black/5 flex-wrap">
            <button
              onClick={() => setActiveTab('keyword_creator')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'keyword_creator' ? 'bg-white shadow-sm text-ink text-gold' : 'text-ink3 hover:text-ink'
              }`}
            >
              <Search size={14} className="text-gold" />
              <span>Google Keywords Creator</span>
              <span className="bg-gold/20 text-ink text-[10px] px-1.5 py-0.2 rounded-md font-mono">15</span>
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'queue' ? 'bg-white shadow-sm text-ink' : 'text-ink3 hover:text-ink'
              }`}
            >
              <Layers size={14} />
              <span>Review Queue ({drafts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('scan_hub')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'scan_hub' ? 'bg-white shadow-sm text-ink' : 'text-ink3 hover:text-ink'
              }`}
            >
              <Zap size={14} />
              <span>5-Pillar Hub</span>
            </button>
            <button
              onClick={() => setActiveTab('custom_generate')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'custom_generate' ? 'bg-white shadow-sm text-ink' : 'text-ink3 hover:text-ink'
              }`}
            >
              <Plus size={14} />
              <span>Single Topic</span>
            </button>
            <button
              onClick={() => setActiveTab('scanner_info')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'scanner_info' ? 'bg-white shadow-sm text-ink' : 'text-ink3 hover:text-ink'
              }`}
            >
              <ShieldCheck size={14} />
              <span>Anti-Noise Rules</span>
            </button>
            <button
              onClick={() => setActiveTab('debug_console')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'debug_console' ? 'bg-white shadow-sm text-ink text-rose-600' : 'text-ink3 hover:text-ink'
              }`}
            >
              <Terminal size={14} className="text-rose-500" />
              <span>Debug Console</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-ink3 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 bg-paper2 px-3 py-1 rounded-lg border border-black/5">
              <Calendar size={12} className="text-gold" />
              <span>Day Target: <strong>{MONTHS[selectedMonth - 1]} {selectedDay}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-gold" />
              <span>Next Auto Run: {scannerStatus.nextScanTime ? new Date(scannerStatus.nextScanTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Every 2 Hours'}</span>
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <div className={`px-6 py-3 text-xs flex items-center justify-between ${
          notification.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border-b border-emerald-200' 
            : notification.type === 'info'
              ? 'bg-blue-50 text-blue-900 border-b border-blue-200'
              : 'bg-rose-50 text-rose-900 border-b border-rose-200'
        }`}>
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              {notification.type === 'success' && <CheckCircle2 size={16} className="text-emerald-600" />}
              {notification.type === 'info' && <Clock size={16} className="text-blue-600" />}
              {notification.type === 'error' && <AlertCircle size={16} className="text-rose-600" />}
              <span className="font-medium">{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-xs opacity-70 hover:opacity-100 font-bold">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col md:flex-row gap-6">

        {/* Tab 0: Google Keywords AI Content Creator */}
        {activeTab === 'keyword_creator' && (
          <div className="flex-1 max-w-5xl mx-auto py-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/10 shadow-sm space-y-6">
              
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/5 pb-5">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-gold/15 text-gold border border-gold/30">
                      <Search size={20} />
                    </div>
                    <h2 className="text-xl font-serif font-black text-ink">
                      Google Keywords AI Content Creator
                    </h2>
                    <span className="bg-gold/20 text-ink text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border border-gold/40">
                      Live Search Grounding
                    </span>
                  </div>
                  <p className="text-xs text-ink3 leading-relaxed">
                    AI scans Google News, PIB India, ISRO, DRDO, NASA and official gazettes using your selected keywords as search terms. It checks facts, extracts key news, formulates high-yield study notes with 3-5 MCQs, and delivers drafts directly into your Review Queue for admin approval, editing, and publishing.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-paper2 px-3 py-1.5 rounded-xl border border-black/5 text-right font-mono text-[11px]">
                    <div className="text-ink3 text-[9px] uppercase font-bold">Selected Terms</div>
                    <div className="font-bold text-ink text-xs">{selectedKeywords.length} of {GOOGLE_SCAN_KEYWORDS.length} active</div>
                  </div>
                </div>
              </div>

              {/* Keyword Quick Presets Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                    <SlidersHorizontal size={14} className="text-gold" />
                    <span>Keyword Categories & 15 Preset Search Terms</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllKeywords}
                      className="text-[11px] font-bold text-gold hover:underline"
                    >
                      Select All 15
                    </button>
                    <span className="text-black/20">•</span>
                    <button
                      type="button"
                      onClick={clearAllKeywords}
                      className="text-[11px] font-bold text-ink3 hover:text-ink hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-2 pt-1 pb-2">
                  <button
                    type="button"
                    onClick={() => selectKeywordPreset('space_defense')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-paper2 hover:bg-gold/20 border border-black/5 hover:border-gold/40 text-ink transition-all flex items-center gap-1.5"
                  >
                    <span>🚀 Space & Defense (ISRO, DRDO, NASA, Tech, Science)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => selectKeywordPreset('exams')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-paper2 hover:bg-gold/20 border border-black/5 hover:border-gold/40 text-ink transition-all flex items-center gap-1.5"
                  >
                    <span>🏛️ Exam & Govt (UPSC, SSC, Railways, RRB, Indian Govt)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => selectKeywordPreset('history_inventions')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-paper2 hover:bg-gold/20 border border-black/5 hover:border-gold/40 text-ink transition-all flex items-center gap-1.5"
                  >
                    <span>📜 History & Pioneers (History, Inventions, Days, Birthdays, Scientists)</span>
                  </button>
                </div>

                {/* 15 Interactive Keyword Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {GOOGLE_SCAN_KEYWORDS.map((item) => {
                    const isChecked = selectedKeywords.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleKeyword(item.id)}
                        className={`p-3 rounded-2xl cursor-pointer border transition-all flex flex-col justify-between select-none ${
                          isChecked
                            ? 'bg-gold/15 border-gold shadow-sm ring-1 ring-gold/40'
                            : 'bg-paper2 border-black/5 hover:border-black/20 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-xl">{item.emoji}</span>
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                            isChecked ? 'bg-gold border-gold text-ink' : 'border-black/20 bg-white'
                          }`}>
                            {isChecked && <Check size={12} className="stroke-[3]" />}
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="text-xs font-bold text-ink leading-tight">{item.label}</div>
                          <p className="text-[10px] text-ink3 line-clamp-2 mt-0.5 leading-snug">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Custom Term Input */}
              <form onSubmit={handleAddCustomKeyword} className="flex gap-2 items-center bg-paper2 p-3 rounded-2xl border border-black/5">
                <Tag size={16} className="text-gold flex-shrink-0 ml-1" />
                <input
                  type="text"
                  value={customKeywordInput}
                  onChange={(e) => setCustomKeywordInput(e.target.value)}
                  placeholder="Add custom keyword search term (e.g. Semiconductor, Chandrayaan, GST Council, Gaganyaan)..."
                  className="flex-1 bg-transparent text-xs text-ink placeholder:text-ink3/70 outline-none font-medium"
                />
                <button
                  type="submit"
                  disabled={!customKeywordInput.trim()}
                  className="px-3.5 py-1.5 bg-ink text-white rounded-xl text-xs font-bold hover:bg-gold hover:text-ink disabled:opacity-30 transition-all flex items-center gap-1"
                >
                  <Plus size={12} />
                  <span>Add Term</span>
                </button>
              </form>

              {/* Custom Search Angle & Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Specific News Search Term */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-ink3 flex items-center gap-1.5">
                    <Search size={12} className="text-gold" />
                    <span>Specific News Search / Event Angle (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={keywordQuery}
                    onChange={(e) => setKeywordQuery(e.target.value)}
                    placeholder="e.g. Latest breakthrough on ISRO Gaganyaan mission test or UPSC GS3 tech..."
                    className="w-full bg-paper2 border border-black/10 rounded-xl p-3 text-xs font-medium text-ink outline-none focus:border-gold"
                  />
                  <p className="text-[10px] text-ink3">Leave empty for broad scan across all selected keywords.</p>
                </div>

                {/* Target Syllabus / Exam Focus */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-ink3 flex items-center gap-1.5">
                    <GraduationCap size={12} className="text-gold" />
                    <span>Target Exam & Content Depth</span>
                  </label>
                  <select
                    value={keywordTargetExam}
                    onChange={(e) => setKeywordTargetExam(e.target.value)}
                    className="w-full bg-paper2 border border-black/10 rounded-xl p-3 text-xs font-bold text-ink outline-none focus:border-gold"
                  >
                    <option value="UPSC Civil Services GS I/II/III, SSC CGL & Competitive Exams">UPSC Prelims/Mains + SSC CGL & State PSCs (Comprehensive)</option>
                    <option value="UPSC Civil Services Examination (GS Paper I, II, III)">UPSC Civil Services Pure Analytical Focus</option>
                    <option value="SSC CGL, CHSL, MTS & Railways RRB NTPC">SSC CGL, CHSL & Railway RRB (High-Yield Static & Dynamic GK)</option>
                    <option value="ISRO, DRDO & Defense NDA / CDS / AFCAT Exams">Defense & Space Science Focus (NDA, CDS, AFCAT, ISRO)</option>
                    <option value="General Public & Daily Science Literacy">General Reader & Science Explorer Digest</option>
                  </select>
                </div>
              </div>

              {/* Date & Pillar Focus Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-paper2 rounded-2xl border border-black/5 text-xs">
                <div>
                  <label className="text-[10px] font-mono text-ink3 uppercase font-bold">Month Focus</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full mt-1 bg-white border border-black/10 rounded-xl p-2 font-bold text-ink outline-none focus:border-gold"
                  >
                    {MONTHS.map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-ink3 uppercase font-bold">Day Focus</label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                    className="w-full mt-1 bg-white border border-black/10 rounded-xl p-2 font-bold text-ink outline-none focus:border-gold"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-ink3 uppercase font-bold">Pillar Mode</label>
                  <select
                    value={keywordTopicType}
                    onChange={(e) => setKeywordTopicType(e.target.value)}
                    className="w-full mt-1 bg-white border border-black/10 rounded-xl p-2 font-bold text-ink outline-none focus:border-gold"
                  >
                    <option value="exam_gk">🏛️ Exam & Current Affairs GK</option>
                    <option value="science">🔬 Science & Inventions</option>
                    <option value="day_in_history">📅 Day in History & Birthdays</option>
                    <option value="national_days">🎖️ National & Important Days</option>
                    <option value="all_round">🌐 All 5 Pillars Combined</option>
                  </select>
                </div>
              </div>

              {/* Action Banner with Primary Scan Button */}
              <div className="p-6 bg-gradient-to-r from-ink via-ink2 to-ink text-white rounded-3xl space-y-4 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-gold flex items-center gap-2">
                      <Sparkles size={16} />
                      <span>Autonomous Google Search Grounding & Fact-Checker</span>
                    </div>
                    <p className="text-xs text-white/80 max-w-xl leading-relaxed">
                      AI will scan Google with <strong className="text-white">{selectedKeywords.length} active keywords</strong>, fact-check against trusted institutional sources, and draft high-yield articles with 3-5 MCQs for your approval.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleTriggerKeywordScan(false)}
                      disabled={keywordScanning || selectedKeywords.length === 0}
                      className="px-6 py-3.5 bg-gold hover:bg-amber-400 text-ink font-bold text-sm rounded-2xl transition-all shadow-md flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <RefreshCw size={16} className={keywordScanning ? "animate-spin" : ""} />
                      <span>
                        {keywordScanning
                          ? "Scanning Google News & Creating Drafts…"
                          : `Scan Google Keywords (${selectedKeywords.length})`}
                      </span>
                    </button>

                    {remainingCooldownMs > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Cooldown is active. Force scan keywords immediately?")) {
                            handleTriggerKeywordScan(true);
                          }
                        }}
                        className="px-3 py-3 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs font-mono rounded-xl transition-all"
                        title="Force scan without cooldown waiting"
                      >
                        Force Scan
                      </button>
                    )}
                  </div>
                </div>

                {/* Workflow Steps Indicator */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10 text-[11px] text-white/70">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-gold/30 text-gold flex items-center justify-center font-bold text-[10px]">1</span>
                    <span>Scan Google Keywords</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-[10px]">2</span>
                    <span>Fact-Check & Verify</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-[10px]">3</span>
                    <span>Draft MCQs & Article</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-coral/30 text-coral flex items-center justify-center font-bold text-[10px]">4</span>
                    <span>Admin Review & Publish</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 1: Topic Scanner & Date Hub */}
        {activeTab === 'scan_hub' && (
          <div className="flex-1 max-w-4xl mx-auto py-4 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/10 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-black/5 pb-4">
                <div>
                  <h3 className="text-xl font-serif font-black text-ink flex items-center gap-2">
                    <Zap className="text-gold" />
                    Autonomous 5-Pillar Topic Scanner
                  </h3>
                  <p className="text-xs text-ink3 mt-1">
                    Select a topic pillar and calendar date. AI verifies Google news, institutional releases (PIB, ISRO, DRDO, Nature), and drafts exam-ready study articles.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-ink3">Status</span>
                  <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    2-Hour Cycle Active
                  </div>
                </div>
              </div>

              {/* Date Selector for Day in History & National Days */}
              <div className="bg-paper2 p-5 rounded-2xl border border-black/5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                    <Calendar size={14} className="text-gold" />
                    <span>Select Calendar Date for "Day in History" & "National Days" Scan</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      setSelectedMonth(now.getMonth() + 1);
                      setSelectedDay(now.getDate());
                    }}
                    className="text-[11px] font-bold text-gold hover:underline"
                  >
                    Reset to Today ({MONTHS[new Date().getMonth()]} {new Date().getDate()})
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono text-ink3 uppercase">Month</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className="w-full bg-white border border-black/10 rounded-xl p-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
                    >
                      {MONTHS.map((m, i) => (
                        <option key={i} value={i + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-ink3 uppercase">Day of Month</label>
                    <select
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                      className="w-full bg-white border border-black/10 rounded-xl p-2.5 text-xs font-bold text-ink outline-none focus:border-gold"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Pillar Selection Cards */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-ink3">
                  Choose Topic Pillar to Scan:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TOPIC_TYPES.map((topic) => {
                    const isSelected = scanTopicType === topic.id;
                    return (
                      <div
                        key={topic.id}
                        onClick={() => setScanTopicType(topic.id)}
                        className={`p-4 rounded-2xl cursor-pointer border transition-all text-left space-y-1 ${
                          isSelected
                            ? 'bg-gold/15 border-gold/50 shadow-sm'
                            : 'bg-paper2 border-black/5 hover:border-black/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-ink">{topic.label}</h4>
                          <span className={`w-3 h-3 rounded-full border ${isSelected ? 'bg-gold border-gold' : 'border-black/20'}`} />
                        </div>
                        <p className="text-[11px] text-ink3 leading-snug">{topic.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timer & Scan Trigger Section */}
              <div className="p-5 bg-gradient-to-r from-ink to-ink2 text-white rounded-2xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-gold flex items-center gap-1.5">
                      <Clock size={14} />
                      <span>2-Hour Automatic Cycle & Anti-Flood Protection</span>
                    </div>
                    <p className="text-xs text-white/70">
                      Once triggered, the scanner creates fact-checked drafts and engages the 2-hour cooldown timer.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-white/50">Cooldown Remaining</span>
                    <div className="text-lg font-mono font-black text-amber-300">
                      {formatCooldown(remainingCooldownMs)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleTriggerScan(false)}
                    disabled={scanning || remainingCooldownMs > 0}
                    className="flex-1 py-3 bg-gold hover:bg-amber-400 text-ink font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <RefreshCw size={15} className={scanning ? "animate-spin" : ""} />
                    <span>
                      {scanning 
                        ? "Scanning Google News & Institutional Sources…" 
                        : remainingCooldownMs > 0 
                          ? `Locked for 2 Hours (${formatCooldown(remainingCooldownMs)} left)` 
                          : `Execute ${TOPIC_TYPES.find(t => t.id === scanTopicType)?.label} Scan Now`}
                    </span>
                  </button>
                  {remainingCooldownMs > 0 && (
                    <button
                      onClick={() => {
                        if (confirm("Bypass 2-hour cooldown and scan now?")) {
                          handleTriggerScan(true);
                        }
                      }}
                      className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all"
                    >
                      Force Scan
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Custom Single Topic Generator */}
        {activeTab === 'custom_generate' && (
          <div className="flex-1 max-w-2xl mx-auto py-4 space-y-6">
            
            {generating ? (
              <AIGenerationSkeleton
                topic={customTopic}
                category={customCategory}
                retryProgress={retryProgress}
              />
            ) : generationError ? (
              <AIGenerationErrorState
                error={generationError}
                topic={customTopic}
                onRetry={() => handleGenerateCustom()}
                onOpenDebugLogs={() => setActiveTab('debug_console')}
                onCancel={() => setGenerationError(null)}
                isRetrying={generating}
              />
            ) : (
              <>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-gold/15 text-gold rounded-2xl flex items-center justify-center mx-auto mb-2 font-serif font-bold text-xl">
                    ⚡
                  </div>
                  <h3 className="text-2xl font-serif font-black text-ink">Generate Custom Educational Topic</h3>
                  <p className="text-xs text-ink3 max-w-md mx-auto">
                    Type any exam syllabus topic, historical anniversary, or science breakthrough. AI will verify facts and write a complete draft with 3-5 MCQs and bilingual terms.
                  </p>
                </div>

                <form onSubmit={handleGenerateCustom} className="space-y-4 bg-white p-6 rounded-2xl border border-black/10 shadow-sm">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-ink3">Topic or Event Headline *</label>
                    <input
                      type="text"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="e.g., Battle of Plassey 1757, James Webb Space Telescope Findings, or Article 370 Supreme Court Verdict..."
                      className="w-full bg-paper2 border border-black/10 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none font-medium text-ink"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-widest text-ink3">Topic Pillar Type</label>
                      <select
                        value={customTopicType}
                        onChange={(e) => setCustomTopicType(e.target.value)}
                        className="w-full bg-paper2 border border-black/10 rounded-xl px-3 py-2.5 text-xs font-medium focus:border-gold outline-none text-ink"
                      >
                        <option value="day_in_history">📅 Day in History</option>
                        <option value="national_days">🎖️ National & Important Days</option>
                        <option value="science">🔬 Science & Discovery</option>
                        <option value="exam_gk">🏛️ Government Exam GK</option>
                        <option value="current_affairs">📰 Current Affairs News</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-widest text-ink3">Category Tag</label>
                      <select
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value as Category)}
                        className="w-full bg-paper2 border border-black/10 rounded-xl px-3 py-2.5 text-xs font-medium focus:border-gold outline-none text-ink"
                      >
                        <option value="history">HISTORY</option>
                        <option value="science">SCIENCE</option>
                        <option value="inventions">INVENTIONS</option>
                        <option value="discoveries">DISCOVERIES</option>
                        <option value="birthdays">BIRTHDAYS</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-ink3">Exam Focus Target</label>
                    <select
                      value={customFocus}
                      onChange={(e) => setCustomFocus(e.target.value)}
                      className="w-full bg-paper2 border border-black/10 rounded-xl px-3 py-2.5 text-xs font-medium focus:border-gold outline-none text-ink"
                    >
                      <option value="UPSC Civil Services (GS-I/II/III)">UPSC Civil Services (GS-I / II / III)</option>
                      <option value="SSC CGL, CHSL & Railways (Static GK)">SSC CGL / CHSL & Railways (Static & Dynamic GK)</option>
                      <option value="State PSCs & Defense (NDA/CDS)">State PSCs (BPSC, UPPSC, MPSC, TNPSC) & Defense</option>
                      <option value="General Science & World History">General Science & World History</option>
                    </select>
                  </div>

                  <div className="p-3.5 bg-amber-50 border border-gold/30 rounded-xl text-xs text-ink2 flex items-start gap-2.5">
                    <ShieldCheck size={16} className="text-gold flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Strict Veracity Engine:</strong> AI cross-references trusted channels (PIB, ISRO, DRDO, Nature, The Hindu) and writes 3-5 Practice MCQs + Bilingual definitions automatically.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={generating || !customTopic.trim()}
                    className="w-full py-3 bg-ink text-white rounded-xl font-bold text-sm hover:bg-gold hover:text-ink transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                  >
                    <Sparkles size={16} className="text-gold" />
                    <span>Generate & Add to Review Queue</span>
                  </button>
                </form>
              </>
            )}

          </div>
        )}

        {/* Tab 5: Real-Time Debug Console & Error Logging */}
        {activeTab === 'debug_console' && (
          <div className="flex-1 max-w-5xl mx-auto py-2">
            <AdminDebugConsole />
          </div>
        )}

        {/* Tab 3: Anti-Noise Rules & Safeguards */}
        {activeTab === 'scanner_info' && (
          <div className="flex-1 max-w-3xl mx-auto py-4 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-black/10 space-y-6 shadow-sm">
              <h3 className="text-xl font-serif font-bold text-ink flex items-center gap-2">
                <ShieldCheck className="text-emerald-600" />
                Autonomous 2-Hour Educational Safeguards & Fact-Check Engine
              </h3>
              <p className="text-sm text-ink3 leading-relaxed">
                FactHub runs a dedicated background scanner every 2 hours that inspects trending educational topics, competitive exam notifications, and scientific breakthroughs. It adheres to strict content integrity rules:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-paper2 rounded-2xl border border-black/5 space-y-2">
                  <div className="text-sm font-bold text-ink flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    1. Anti-Noise Filtering
                  </div>
                  <p className="text-xs text-ink3 leading-normal">
                    Strictly eliminates clickbait, celebrity gossip, unverified social media rumors, and viral political noise.
                  </p>
                </div>

                <div className="p-4 bg-paper2 rounded-2xl border border-black/5 space-y-2">
                  <div className="text-sm font-bold text-ink flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-gold"></span>
                    2. Institutional Verification
                  </div>
                  <p className="text-xs text-ink3 leading-normal">
                    Cross-verifies claims against PIB India, The Hindu, BBC, Nature, ISRO, DRDO, and verified official releases.
                  </p>
                </div>

                <div className="p-4 bg-paper2 rounded-2xl border border-black/5 space-y-2">
                  <div className="text-sm font-bold text-ink flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                    3. Core Meaning Preservation
                  </div>
                  <p className="text-xs text-ink3 leading-normal">
                    Ensures the authentic scientific and historical truth of the event is kept intact without distortion.
                  </p>
                </div>

                <div className="p-4 bg-paper2 rounded-2xl border border-black/5 space-y-2">
                  <div className="text-sm font-bold text-ink flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-coral"></span>
                    4. Admin Approval Gate
                  </div>
                  <p className="text-xs text-ink3 leading-normal">
                    Drafts are never published directly to readers. Only you (<code className="font-mono text-xs">krish02shiva@gmail.com</code>) have posting rights.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                <div className="text-xs text-ink3">
                  <strong>Current Status:</strong> {scannerStatus.statusMessage}
                </div>
                <button
                  onClick={() => setActiveTab('scan_hub')}
                  className="px-5 py-2.5 bg-ink text-white text-xs font-bold rounded-xl hover:bg-gold hover:text-ink transition-all"
                >
                  Go to Scanner Hub
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Draft Queue & Rich Studio Workspace */}
        {activeTab === 'queue' && (
          <>
            {/* Left Queue Panel */}
            <div className="w-full md:w-80 bg-white rounded-2xl border border-black/10 flex flex-col flex-shrink-0 h-[700px] overflow-hidden shadow-sm">
              <div className="p-3.5 border-b border-black/5 bg-paper2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink3">
                    Draft Queue ({filteredDrafts.length})
                  </span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="text-[11px] bg-white border border-black/10 rounded-lg px-2 py-1 outline-none text-ink font-medium"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                {/* Filter by Topic Pillar */}
                <select
                  value={filterTopic}
                  onChange={(e) => setFilterTopic(e.target.value)}
                  className="w-full text-[11px] bg-white border border-black/10 rounded-lg px-2 py-1 outline-none text-ink font-medium"
                >
                  <option value="all">All Topic Pillars</option>
                  <option value="day_in_history">📅 Day in History</option>
                  <option value="national_days">🎖️ National Days</option>
                  <option value="science">🔬 Science</option>
                  <option value="exam_gk">🏛️ Exam GK</option>
                  <option value="current_affairs">📰 Current Affairs</option>
                </select>

                {/* Filter by Google Keyword */}
                <select
                  value={filterKeyword}
                  onChange={(e) => setFilterKeyword(e.target.value)}
                  className="w-full text-[11px] bg-white border border-black/10 rounded-lg px-2 py-1 outline-none text-ink font-medium"
                >
                  <option value="all">All Keywords (15+)</option>
                  {GOOGLE_SCAN_KEYWORDS.map(k => (
                    <option key={k.id} value={k.id}>{k.emoji} {k.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y divide-black/5">
                {loading && drafts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-ink3">Loading drafts...</div>
                ) : filteredDrafts.length === 0 ? (
                  <div className="p-6 text-center space-y-3 py-12">
                    <p className="text-xs text-ink3">No drafts matching filter.</p>
                    <button
                      onClick={() => setActiveTab('scan_hub')}
                      className="px-4 py-2 bg-gold/15 text-ink font-bold text-xs rounded-xl hover:bg-gold/30 transition-all"
                    >
                      Open Topic Scanner
                    </button>
                  </div>
                ) : (
                  filteredDrafts.map((draft) => {
                    const isSelected = selectedDraft?.id === draft.id;
                    const topicLabel = TOPIC_TYPES.find(t => t.id === draft.topicType)?.label || draft.topicType || 'Educational';
                    return (
                      <div
                        key={draft.id}
                        onClick={() => selectDraftForEditing(draft)}
                        className={`p-3 rounded-xl cursor-pointer transition-all text-left space-y-1.5 ${
                          isSelected
                            ? 'bg-gold/15 border border-gold/40 shadow-sm'
                            : 'hover:bg-paper2 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="uppercase text-gold font-bold">{draft.cat}</span>
                          <span className={`px-2 py-0.5 rounded-full font-bold ${
                            draft.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {draft.status || 'pending'}
                          </span>
                        </div>
                        <h4 className="text-xs font-serif font-bold text-ink line-clamp-2 leading-snug">
                          {draft.emoji} {draft.title}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] text-ink3">
                          <span className="truncate max-w-[140px]">{topicLabel}</span>
                          {draft.quizMCQs && draft.quizMCQs.length > 0 && (
                            <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[9px] font-bold">
                              {draft.quizMCQs.length} MCQs
                            </span>
                          )}
                        </div>
                        {((draft.searchKeywords && draft.searchKeywords.length > 0) || draft.targetKeyword) && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {(draft.searchKeywords || [draft.targetKeyword]).filter(Boolean).slice(0, 3).map((kw, i) => (
                              <span key={i} className="bg-gold/15 text-ink text-[9px] font-bold px-1.5 py-0.2 rounded">
                                #{kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Editor / Studio Workspace */}
            <div className="flex-1 bg-white rounded-2xl border border-black/10 flex flex-col overflow-hidden shadow-sm h-[700px]">
              {selectedDraft ? (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  {/* Top Bar for Selected Draft */}
                  <div className="p-4 border-b border-black/10 bg-paper2 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{editForm.emoji || '📝'}</span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono text-ink3 uppercase">
                            Verification: <strong className="text-emerald-700 font-bold">{editForm.verificationStatus || 'Verified'}</strong>
                          </span>
                          {editForm.topicType && (
                            <span className="text-[10px] font-bold bg-gold/20 text-ink px-2 py-0.5 rounded-full">
                              {TOPIC_TYPES.find(t => t.id === editForm.topicType)?.label || editForm.topicType}
                            </span>
                          )}
                          {((editForm.searchKeywords && editForm.searchKeywords.length > 0) || editForm.targetKeyword) && (
                            <span className="text-[10px] font-bold bg-ink text-gold px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                              <Search size={10} />
                              {(editForm.searchKeywords || [editForm.targetKeyword]).filter(Boolean).join(', ')}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-ink truncate max-w-md">
                          {editForm.title || 'Untitled Draft'}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewMode(!previewMode)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          previewMode
                            ? 'bg-ink text-white border-ink'
                            : 'bg-white text-ink border-black/10 hover:bg-black/5'
                        }`}
                      >
                        {previewMode ? <Edit3 size={13} /> : <Eye size={13} />}
                        <span>{previewMode ? "Editor View" : "Live Preview"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteDraft(selectedDraft.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Discard draft"
                      >
                        <Trash2 size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveDraftChanges}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-gold/20 text-xs font-bold text-ink rounded-xl border border-black/10 transition-all"
                      >
                        <Save size={13} />
                        <span>Save Edits</span>
                      </button>

                      <button
                        type="button"
                        onClick={handlePublishFact}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-5 py-1.5 bg-ink hover:bg-gold text-white hover:text-ink text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
                      >
                        <Send size={13} />
                        <span>Approve & Publish to Live FactHub</span>
                      </button>
                    </div>
                  </div>

                  {/* Fact-Check Veracity Ribbon */}
                  <div className="px-6 py-2 bg-emerald-50 border-b border-emerald-200/60 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-950">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-emerald-700 flex-shrink-0" />
                      <span>
                        <strong>Fact Verification:</strong> {editForm.factCheckSummary || 'Cross-verified with official reports & institutions.'}
                      </span>
                    </div>
                    {editForm.trustedSources && editForm.trustedSources.length > 0 && (
                      <div className="flex items-center gap-2 overflow-x-auto">
                        <span className="font-bold text-[10px] uppercase text-emerald-800">Trusted Sources:</span>
                        {editForm.trustedSources.map((src, i) => (
                          <a
                            key={i}
                            href={src.uri}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/80 border border-emerald-200 rounded text-[10px] text-emerald-900 hover:text-gold font-medium"
                          >
                            <span>{src.title}</span>
                            <ExternalLink size={10} />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Body Editor / Preview */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {previewMode ? (
                      <div className="max-w-3xl mx-auto bg-paper p-8 rounded-3xl border border-black/10 shadow-sm space-y-6">
                        <div className="space-y-2 border-b border-black/5 pb-4">
                          <div className="flex items-center gap-2 text-xs font-mono text-gold uppercase font-bold">
                            <span>{editForm.cat}</span>
                            <span>•</span>
                            <span>Year: {editForm.year}</span>
                            {editForm.examRelevance && (
                              <>
                                <span>•</span>
                                <span className="text-ink2 font-sans">Exam Angle: {editForm.examRelevance}</span>
                              </>
                            )}
                          </div>
                          <h1 className="text-3xl font-serif font-black text-ink">
                            {editForm.emoji} {editForm.title}
                          </h1>
                          <p className="text-sm text-ink2 italic font-serif">
                            {editForm.excerpt}
                          </p>
                        </div>

                        {editForm.imageUrl && (
                          <div className="rounded-2xl overflow-hidden border border-black/10 relative bg-paper2">
                            <img 
                              src={normalizeImageUrl(editForm.imageUrl)} 
                              alt={editForm.imageAlt || editForm.title} 
                              className="w-full h-64 object-cover" 
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                if (target.src.includes('?width=')) {
                                  target.src = target.src.split('?')[0];
                                }
                              }}
                            />
                            {editForm.imageCredit && (
                              <div className="p-2 text-[10px] text-ink3 text-right bg-paper2 font-mono">
                                Photo Credit: {editForm.imageCredit}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="prose prose-sm max-w-none text-ink leading-relaxed font-serif">
                          <ReactMarkdown>{editForm.full || ''}</ReactMarkdown>
                        </div>

                        {/* Preview Practice MCQs */}
                        {editForm.quizMCQs && editForm.quizMCQs.length > 0 && (
                          <div className="mt-8 pt-6 border-t border-black/10 space-y-4">
                            <h3 className="text-lg font-serif font-bold text-ink flex items-center gap-2">
                              <GraduationCap className="text-gold" />
                              Exam Practice MCQs ({editForm.quizMCQs.length} Questions)
                            </h3>
                            <div className="space-y-4">
                              {editForm.quizMCQs.map((mcq, idx) => (
                                <div key={idx} className="p-4 bg-paper2 rounded-2xl border border-black/5 space-y-2 text-xs">
                                  <div className="font-bold text-ink">Q{idx + 1}. {mcq.question}</div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                    {mcq.options.map((opt, oIdx) => (
                                      <div 
                                        key={oIdx}
                                        className={`p-2 rounded-xl border ${
                                          oIdx === mcq.answer 
                                            ? 'bg-emerald-100 border-emerald-300 text-emerald-950 font-bold' 
                                            : 'bg-white border-black/5 text-ink2'
                                        }`}
                                      >
                                        <span className="font-mono mr-1.5">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                                        {oIdx === mcq.answer && <span className="ml-2 text-emerald-700 text-[10px]">✓ Correct</span>}
                                      </div>
                                    ))}
                                  </div>
                                  <div className="p-2.5 bg-white rounded-xl border border-black/5 text-[11px] text-ink3">
                                    <strong>Explanation:</strong> {mcq.explanation}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Preview Bilingual Glossary */}
                        {editForm.bilingualTerms && editForm.bilingualTerms.length > 0 && (
                          <div className="mt-6 pt-6 border-t border-black/10 space-y-3">
                            <h3 className="text-base font-serif font-bold text-ink flex items-center gap-2">
                              <Languages className="text-indigo-600" />
                              Bilingual Terminology (English & Hindi)
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {editForm.bilingualTerms.map((term, tIdx) => (
                                <div key={tIdx} className="p-3 bg-paper2 rounded-xl border border-black/5 space-y-1">
                                  <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-ink">{term.termEn}</span>
                                    <span className="text-gold font-serif">{term.termHi}</span>
                                  </div>
                                  <p className="text-[11px] text-ink3">{term.meaning}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6 max-w-4xl mx-auto">
                        {/* Meta Attributes */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-paper2 p-4 rounded-2xl border border-black/5">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">Category</label>
                            <select
                              value={editForm.cat}
                              onChange={(e) => setEditForm({ ...editForm, cat: e.target.value as Category })}
                              className="w-full bg-white border border-black/10 rounded-xl p-2.5 text-xs font-medium focus:border-gold outline-none text-ink"
                            >
                              <option value="history">HISTORY</option>
                              <option value="science">SCIENCE</option>
                              <option value="inventions">INVENTIONS</option>
                              <option value="discoveries">DISCOVERIES</option>
                              <option value="birthdays">BIRTHDAYS</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">Topic Pillar</label>
                            <select
                              value={editForm.topicType || 'day_in_history'}
                              onChange={(e) => setEditForm({ ...editForm, topicType: e.target.value })}
                              className="w-full bg-white border border-black/10 rounded-xl p-2.5 text-xs font-medium focus:border-gold outline-none text-ink"
                            >
                              <option value="day_in_history">📅 Day in History</option>
                              <option value="national_days">🎖️ National Days</option>
                              <option value="science">🔬 Science</option>
                              <option value="exam_gk">🏛️ Exam GK</option>
                              <option value="current_affairs">📰 Current Affairs</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">Year</label>
                            <input
                              type="number"
                              value={editForm.year || new Date().getFullYear()}
                              onChange={(e) => setEditForm({ ...editForm, year: parseInt(e.target.value) || new Date().getFullYear() })}
                              className="w-full bg-white border border-black/10 rounded-xl p-2.5 text-xs font-medium focus:border-gold outline-none text-ink"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">Emoji</label>
                            <input
                              type="text"
                              value={editForm.emoji || '📝'}
                              onChange={(e) => setEditForm({ ...editForm, emoji: e.target.value })}
                              className="w-full bg-white border border-black/10 rounded-xl p-2.5 text-xs font-medium text-center focus:border-gold outline-none text-base"
                            />
                          </div>
                        </div>

                        {/* Title & Excerpt */}
                        <div className="space-y-3 bg-paper2 p-4 rounded-2xl border border-black/5">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">Title *</label>
                            <input
                              type="text"
                              value={editForm.title || ''}
                              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                              className="w-full bg-white border border-black/10 rounded-xl p-3 text-sm font-serif font-bold text-ink focus:border-gold outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">Excerpt *</label>
                            <textarea
                              value={editForm.excerpt || ''}
                              onChange={(e) => setEditForm({ ...editForm, excerpt: e.target.value })}
                              className="w-full bg-white border border-black/10 rounded-xl p-3 text-xs text-ink h-16 resize-none focus:border-gold outline-none font-serif leading-relaxed"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">Exam Relevance Focus</label>
                            <input
                              type="text"
                              value={editForm.examRelevance || ''}
                              onChange={(e) => setEditForm({ ...editForm, examRelevance: e.target.value })}
                              placeholder="e.g. UPSC GS-I / SSC CGL Static GK"
                              className="w-full bg-white border border-black/10 rounded-xl p-2.5 text-xs font-medium focus:border-gold outline-none text-ink"
                            />
                          </div>
                        </div>

                        {/* Markdown Content Editor */}
                        <div className="space-y-3 bg-paper2 p-5 rounded-2xl border border-black/5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">
                              Full Article Content (Markdown) *
                            </label>
                            <div className="text-[11px] text-ink3">
                              Supports headings, bold text, bullet points & in-between images with credits
                            </div>
                          </div>

                          {/* Markdown Toolbar with In-Article Image Inserter */}
                          <MarkdownToolbar
                            textareaRef={textareaRef}
                            value={editForm.full || ''}
                            onChange={(val) => setEditForm({ ...editForm, full: val })}
                          />

                          {/* Color Palette */}
                          <div className="p-3 bg-white rounded-xl border border-black/5 space-y-2">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-ink3">
                              🎨 Click to highlight selected word or heading:
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {COLOR_OPTIONS.map((c) => (
                                <button
                                  key={c.name}
                                  type="button"
                                  onClick={() => handleInsertColor(c.name)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-black/5 hover:border-black/10 bg-paper2 text-[11px] font-bold cursor-pointer"
                                >
                                  <span className={`w-2.5 h-2.5 rounded-full ${c.bg}`} />
                                  <span className={c.text}>{c.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <textarea
                            ref={textareaRef}
                            value={editForm.full || ''}
                            onChange={(e) => setEditForm({ ...editForm, full: e.target.value })}
                            className="w-full bg-white border border-black/10 rounded-xl p-4 text-xs font-serif leading-relaxed text-ink h-80 focus:border-gold outline-none"
                          />
                        </div>

                        {/* Practice Quiz MCQs Management */}
                        <div className="space-y-3 bg-paper2 p-5 rounded-2xl border border-black/5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                              <GraduationCap size={15} className="text-gold" />
                              <span>Practice Quiz MCQs ({editForm.quizMCQs?.length || 0} Questions)</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const newMCQ: QuizMCQ = {
                                  question: "New Practice Question...",
                                  options: ["Option A", "Option B", "Option C", "Option D"],
                                  answer: 0,
                                  explanation: "Explanation...",
                                  examCategory: "UPSC / SSC CGL"
                                };
                                setEditForm({
                                  ...editForm,
                                  quizMCQs: [...(editForm.quizMCQs || []), newMCQ]
                                });
                              }}
                              className="text-[11px] font-bold text-gold hover:underline flex items-center gap-1"
                            >
                              <Plus size={12} /> Add Question
                            </button>
                          </div>

                          {editForm.quizMCQs && editForm.quizMCQs.length > 0 ? (
                            <div className="space-y-3">
                              {editForm.quizMCQs.map((mcq, mIdx) => (
                                <div key={mIdx} className="bg-white p-4 rounded-xl border border-black/10 space-y-3 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-ink">Question {mIdx + 1}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = editForm.quizMCQs?.filter((_, i) => i !== mIdx);
                                        setEditForm({ ...editForm, quizMCQs: updated });
                                      }}
                                      className="text-rose-600 text-[10px] hover:underline"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    value={mcq.question}
                                    onChange={(e) => {
                                      const updated = [...(editForm.quizMCQs || [])];
                                      updated[mIdx].question = e.target.value;
                                      setEditForm({ ...editForm, quizMCQs: updated });
                                    }}
                                    className="w-full bg-paper2 border border-black/10 rounded-lg p-2 text-xs font-bold text-ink"
                                    placeholder="Question..."
                                  />
                                  <div className="grid grid-cols-2 gap-2">
                                    {mcq.options.map((opt, oIdx) => (
                                      <div key={oIdx} className="flex items-center gap-2">
                                        <input
                                          type="radio"
                                          name={`correct-${mIdx}`}
                                          checked={mcq.answer === oIdx}
                                          onChange={() => {
                                            const updated = [...(editForm.quizMCQs || [])];
                                            updated[mIdx].answer = oIdx;
                                            setEditForm({ ...editForm, quizMCQs: updated });
                                          }}
                                          className="accent-gold"
                                        />
                                        <input
                                          type="text"
                                          value={opt}
                                          onChange={(e) => {
                                            const updated = [...(editForm.quizMCQs || [])];
                                            updated[mIdx].options[oIdx] = e.target.value;
                                            setEditForm({ ...editForm, quizMCQs: updated });
                                          }}
                                          className="flex-1 bg-paper2 border border-black/10 rounded-lg p-1.5 text-xs text-ink"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                  <input
                                    type="text"
                                    value={mcq.explanation}
                                    onChange={(e) => {
                                      const updated = [...(editForm.quizMCQs || [])];
                                      updated[mIdx].explanation = e.target.value;
                                      setEditForm({ ...editForm, quizMCQs: updated });
                                    }}
                                    placeholder="Explanation for aspirants..."
                                    className="w-full bg-paper2 border border-black/10 rounded-lg p-2 text-[11px] text-ink3"
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-ink3 italic">No MCQs added. Click "+ Add Question" to include practice quizzes.</p>
                          )}
                        </div>

                        {/* Bilingual Terminology Management */}
                        <div className="space-y-3 bg-paper2 p-5 rounded-2xl border border-black/5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                              <Languages size={15} className="text-indigo-600" />
                              <span>Bilingual Vocabulary (English & Hindi)</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const newTerm: BilingualTerm = {
                                  termEn: "Term",
                                  termHi: "शब्द",
                                  meaning: "Meaning for exams..."
                                };
                                setEditForm({
                                  ...editForm,
                                  bilingualTerms: [...(editForm.bilingualTerms || []), newTerm]
                                });
                              }}
                              className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                            >
                              <Plus size={12} /> Add Term
                            </button>
                          </div>

                          {editForm.bilingualTerms && editForm.bilingualTerms.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {editForm.bilingualTerms.map((term, tIdx) => (
                                <div key={tIdx} className="bg-white p-3 rounded-xl border border-black/10 space-y-2 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-ink">Term {tIdx + 1}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = editForm.bilingualTerms?.filter((_, i) => i !== tIdx);
                                        setEditForm({ ...editForm, bilingualTerms: updated });
                                      }}
                                      className="text-rose-600 text-[10px] hover:underline"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <input
                                      type="text"
                                      value={term.termEn}
                                      onChange={(e) => {
                                        const updated = [...(editForm.bilingualTerms || [])];
                                        updated[tIdx].termEn = e.target.value;
                                        setEditForm({ ...editForm, bilingualTerms: updated });
                                      }}
                                      placeholder="English Term"
                                      className="bg-paper2 border border-black/10 rounded-lg p-1.5 text-xs font-bold text-ink"
                                    />
                                    <input
                                      type="text"
                                      value={term.termHi}
                                      onChange={(e) => {
                                        const updated = [...(editForm.bilingualTerms || [])];
                                        updated[tIdx].termHi = e.target.value;
                                        setEditForm({ ...editForm, bilingualTerms: updated });
                                      }}
                                      placeholder="हिंदी अनुवाद"
                                      className="bg-paper2 border border-black/10 rounded-lg p-1.5 text-xs font-serif text-gold"
                                    />
                                  </div>
                                  <input
                                    type="text"
                                    value={term.meaning}
                                    onChange={(e) => {
                                      const updated = [...(editForm.bilingualTerms || [])];
                                      updated[tIdx].meaning = e.target.value;
                                      setEditForm({ ...editForm, bilingualTerms: updated });
                                    }}
                                    placeholder="Concise exam definition..."
                                    className="w-full bg-paper2 border border-black/10 rounded-lg p-1.5 text-[11px] text-ink3"
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-ink3 italic">No bilingual terms specified.</p>
                          )}
                        </div>

                        {/* Telegram & WhatsApp Study Capsule */}
                        {editForm.socialPostDigest && (
                          <div className="space-y-3 bg-paper2 p-5 rounded-2xl border border-black/5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                                <Share2 size={15} className="text-emerald-600" />
                                <span>1-Click WhatsApp & Telegram Capsule</span>
                              </label>
                              <button
                                type="button"
                                onClick={handleCopyDigest}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                              >
                                {copiedDigest ? <Check size={13} /> : <Copy size={13} />}
                                <span>{copiedDigest ? "Copied Capsule!" : "Copy Capsule"}</span>
                              </button>
                            </div>
                            <textarea
                              value={editForm.socialPostDigest}
                              onChange={(e) => setEditForm({ ...editForm, socialPostDigest: e.target.value })}
                              className="w-full bg-white border border-black/10 rounded-xl p-3 text-xs font-mono text-ink h-28 resize-none focus:border-gold outline-none"
                            />
                          </div>
                        )}

                        {/* Cover Image & Publication Schedule */}
                        <div className="space-y-4">
                          <div className="bg-paper2 p-4 rounded-2xl border border-black/5">
                            <ImageUploadField
                              label="Cover Image (Upload File or Paste Link)"
                              imageUrl={editForm.imageUrl || ''}
                              imageAlt={editForm.imageAlt || editForm.title}
                              imageCredit={editForm.imageCredit || ''}
                              onChange={(media) => {
                                setEditForm({
                                  ...editForm,
                                  imageUrl: media.imageUrl,
                                  imageAlt: media.imageAlt !== undefined ? media.imageAlt : editForm.imageAlt,
                                  imageCredit: media.imageCredit !== undefined ? media.imageCredit : editForm.imageCredit
                                });
                              }}
                            />
                          </div>

                          <div className="bg-paper2 p-4 rounded-2xl border border-black/5 space-y-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-ink">Publication Schedule</span>
                            <div className="flex items-center gap-4 text-xs">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="publishType"
                                  value="immediate"
                                  checked={publishType === 'immediate'}
                                  onChange={() => setPublishType('immediate')}
                                  className="accent-gold"
                                />
                                <span>Publish Immediately</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="publishType"
                                  value="schedule"
                                  checked={publishType === 'schedule'}
                                  onChange={() => setPublishType('schedule')}
                                  className="accent-gold"
                                />
                                <span>Schedule Later</span>
                              </label>
                            </div>

                            {publishType === 'schedule' && (
                              <input
                                type="datetime-local"
                                value={scheduleTime}
                                onChange={(e) => setScheduleTime(e.target.value)}
                                className="w-full bg-white border border-black/10 rounded-xl p-2.5 text-xs text-ink focus:border-gold outline-none"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gold/10 text-gold flex items-center justify-center text-3xl font-serif">
                    📖
                  </div>
                  <h3 className="text-xl font-serif font-bold text-ink">No Draft Selected</h3>
                  <p className="text-xs text-ink3 max-w-sm">
                    Select a verified educational draft from the left queue to review, or open the Topic Scanner to generate fresh content.
                  </p>
                  <button
                    onClick={() => setActiveTab('scan_hub')}
                    className="px-6 py-2.5 bg-ink text-white hover:bg-gold hover:text-ink text-xs font-bold rounded-xl transition-all shadow-sm"
                  >
                    Open Topic Scanner & Date Hub
                  </button>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};
