import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  X, 
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
  Search, 
  Filter, 
  Eye, 
  Flame, 
  HelpCircle,
  Calendar,
  ShoppingBag,
  ArrowRight,
  Maximize2,
  Minimize2,
  Zap
} from 'lucide-react';
import { AIDraft, Category, Fact, AIScannerStatus, AffiliateProduct } from '../../types';
import { factService } from '../../services/factService';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../lib/firebase';
import ReactMarkdown from 'react-markdown';
import { ImageUploadField } from '../common/ImageUploadField';
import { MarkdownToolbar } from '../common/MarkdownToolbar';
import { normalizeImageUrl } from '../../lib/imageUtils';

const COLOR_OPTIONS = [
  { name: 'gold', label: 'Gold', bg: 'bg-[#d9ad42]', text: 'text-[#d9ad42]' },
  { name: 'coral', label: 'Coral', bg: 'bg-[#ff6b6b]', text: 'text-[#ff6b6b]' },
  { name: 'teal', label: 'Teal', bg: 'bg-[#2ec4b6]', text: 'text-[#2ec4b6]' },
  { name: 'indigo', label: 'Indigo', bg: 'bg-[#4f46e5]', text: 'text-[#4f46e5]' },
  { name: 'red', label: 'Red', bg: 'bg-rose-600', text: 'text-rose-600' },
  { name: 'green', label: 'Green', bg: 'bg-emerald-600', text: 'text-emerald-600' },
  { name: 'blue', label: 'Blue', bg: 'bg-blue-600', text: 'text-blue-600' },
  { name: 'slate', label: 'Slate', bg: 'bg-slate-600', text: 'text-slate-600' },
  { name: 'purple', label: 'Purple', bg: 'bg-purple-600', text: 'text-purple-600' }
];

interface AIContentCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFactPublished?: (newFact: Fact) => void;
}

export const AIContentCreatorModal: React.FC<AIContentCreatorModalProps> = ({ isOpen, onClose, onFactPublished }) => {
  const { isAdmin, user } = useAuth();
  
  const [drafts, setDrafts] = useState<AIDraft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<AIDraft | null>(null);
  const [activeTab, setActiveTab] = useState<'queue' | 'custom_generate' | 'scanner_info'>('queue');
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Scanner status
  const [scannerStatus, setScannerStatus] = useState<AIScannerStatus>({
    lastScanTime: null,
    nextScanTime: null,
    scanIntervalHours: 2,
    foundItemsCount: 0,
    statusMessage: 'Ready',
    isRunning: false
  });

  // Custom single generator input
  const [customTopic, setCustomTopic] = useState('');
  const [customCategory, setCustomCategory] = useState<Category>('science');
  const [customFocus, setCustomFocus] = useState('UPSC & State PSC Exam Relevance');

  // Edit draft form state
  const [editForm, setEditForm] = useState<Partial<AIDraft>>({});
  const [publishType, setPublishType] = useState<'immediate' | 'schedule'>('immediate');
  const [scheduleTime, setScheduleTime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 2);
    return d.toISOString().substring(0, 16);
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && isAdmin) {
      loadDrafts();
      fetchScannerStatus();
    }
  }, [isOpen, isAdmin]);

  // Keyboard shortcut: Escape to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setScannerStatus(data);
      }
    } catch (err) {
      console.warn("Scanner status sync note:", err);
    }
  };

  const handleTriggerScan = async (force: boolean = false) => {
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
          topicType: 'all_round',
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
          ? 'Admin authorization required. Please ensure you are logged in as an administrator.' 
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
            ? `Successfully scanned Google Trends! Created ${data.count} verified educational draft(s).`
            : `Scan complete: Verified trends checked. No noisy or unverified items were added.`
        });
        await loadDrafts();
        fetchScannerStatus();
      } else if (data.cooldown || res.status === 429) {
        setNotification({
          type: 'info',
          message: data.message || '2-Hour cooldown is currently active. Scanner runs every 2 hours.'
        });
      } else if (data.quotaLimited) {
        setNotification({
          type: 'info',
          message: data.message || 'Gemini API temporary quota reached. Please retry in a few moments.'
        });
      } else {
        throw new Error(data.error || data.message || 'Failed scan');
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `${err.message || 'Failed to complete scan. Please try again.'}`
      });
    } finally {
      setScanning(false);
    }
  };

  const handleGenerateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;

    setGenerating(true);
    setNotification(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/admin/ai/generate-single', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          topic: customTopic,
          category: customCategory,
          focus: customFocus
        })
      });

      let responseData: any = null;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        responseData = await res.json();
      } else {
        const text = await res.text();
        throw new Error(res.status === 401 || res.status === 403 
          ? 'Admin authorization required.' 
          : `Server error (${res.status}): ${text.substring(0, 60)}`);
      }

      if (!res.ok) {
        let errMessage = responseData?.error || responseData?.message || 'Failed to generate draft';
        if (typeof errMessage === 'object') {
          errMessage = errMessage?.message || JSON.stringify(errMessage);
        }
        throw new Error(errMessage);
      }

      const newDraft: AIDraft = responseData;
      await factService.createAIDraft(newDraft);
      setDrafts(prev => [newDraft, ...prev.filter(d => d.id !== newDraft.id)]);
      selectDraftForEditing(newDraft);
      setNotification({
        type: 'success',
        message: `Verified draft created for: "${newDraft.title}"!`
      });
      setCustomTopic('');
      await loadDrafts();
      setActiveTab('queue');
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `Generation error: ${err.message}`
      });
    } finally {
      setGenerating(false);
    }
  };

  const selectDraftForEditing = (draft: AIDraft) => {
    setSelectedDraft(draft);
    setEditForm({
      ...draft,
      cat: draft.cat || 'science',
      year: draft.year || new Date().getFullYear(),
      emoji: draft.emoji || '📝'
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
        message: "Draft changes saved successfully!"
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
        eventMonth: editForm.eventMonth || new Date().getMonth() + 1,
        eventDay: editForm.eventDay || new Date().getDate(),
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

      // 1. Create the live Fact
      await factService.createFact(finalFact);

      // 2. Mark draft as published in Firestore
      await factService.updateAIDraft(selectedDraft.id, {
        status: 'published'
      });

      setNotification({
        type: 'success',
        message: `Fact published successfully! ID: /article/${finalFact.id}`
      });

      if (onFactPublished) {
        onFactPublished(finalFact);
      }

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
        message: 'Draft removed.'
      });
      await loadDrafts();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-3xl max-w-md text-center space-y-4 border border-black/10">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-ink">Access Restricted</h2>
          <p className="text-sm text-ink3">
            The AI Content Creator is strictly restricted to verified FactHub administrators.
          </p>
          <button 
            onClick={onClose}
            className="w-full py-2.5 bg-ink text-white rounded-xl font-bold hover:bg-gold transition-all"
          >
            Close Panel
          </button>
        </div>
      </div>
    );
  }

  const pendingCount = drafts.filter(d => (d.status || 'pending') === 'pending').length;
  const publishedCount = drafts.filter(d => d.status === 'published').length;

  const filteredDrafts = drafts.filter(d => {
    const status = d.status || 'pending';
    if (filterStatus !== 'all' && status !== filterStatus) return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = d.title?.toLowerCase().includes(q);
      const catMatch = d.cat?.toLowerCase().includes(q);
      const trendMatch = d.sourceTrend?.toLowerCase().includes(q);
      const fullMatch = d.full?.toLowerCase().includes(q);
      return Boolean(titleMatch || catMatch || trendMatch || fullMatch);
    }
    return true;
  });

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-[250] ${isFullscreen ? 'p-0 bg-ink' : 'flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md'}`}>
        <motion.div
          initial={{ opacity: 0, scale: isFullscreen ? 1 : 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: isFullscreen ? 1 : 0.96, y: 15 }}
          className={`bg-paper w-full ${isFullscreen ? 'h-screen rounded-none' : 'max-w-7xl h-[94vh] rounded-3xl shadow-2xl border border-black/10'} overflow-hidden flex flex-col`}
        >
          {/* Header */}
          <div className="px-5 sm:px-6 py-3.5 border-b border-black/10 bg-paper2 flex items-center justify-between flex-shrink-0 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gold/30 to-amber-500/20 text-gold flex items-center justify-center border border-gold/30 shadow-sm flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-serif font-black text-ink tracking-tight">
                    AI Content Creator & Verification Studio
                  </h2>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    Admin Exclusive
                  </span>
                </div>
                <p className="text-xs text-ink3 hidden sm:block">
                  Autonomous 2-Hour Google Trends & Exam Updates Scanner with Veracity Checks
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleTriggerScan(false)}
                disabled={scanning}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-gold/15 hover:bg-gold/25 text-ink font-bold text-xs rounded-xl border border-gold/30 transition-all shadow-sm disabled:opacity-50"
                title="Scan Google Trends for new educational topics"
              >
                <RefreshCw size={14} className={scanning ? "animate-spin text-gold" : "text-gold"} />
                <span>{scanning ? "Scanning..." : "Scan Trends"}</span>
              </button>

              <button
                onClick={() => handleTriggerScan(true)}
                disabled={scanning}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-all shadow-sm disabled:opacity-50"
                title="Bypass 2-hour cooldown and force an immediate scan"
              >
                <Zap size={14} className={scanning ? "animate-spin" : ""} />
                <span>Force Scan</span>
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-black/5 rounded-xl text-ink2 hover:text-ink transition-all border border-black/5"
                title={isFullscreen ? "Exit Fullscreen" : "Full Screen Studio"}
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>

              <button
                onClick={onClose}
                className="p-2 bg-black/5 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-ink transition-all"
                title="Close Studio (Esc)"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Top Info / Navigation Bar */}
          <div className="px-5 sm:px-6 py-2.5 bg-white border-b border-black/5 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
            <div className="flex items-center gap-1 bg-paper2 p-1 rounded-xl border border-black/5">
              <button
                onClick={() => setActiveTab('queue')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'queue' ? 'bg-white shadow-sm text-ink' : 'text-ink3 hover:text-ink'
                }`}
              >
                <Layers size={14} />
                <span>Review Queue ({drafts.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('custom_generate')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'custom_generate' ? 'bg-white shadow-sm text-ink' : 'text-ink3 hover:text-ink'
                }`}
              >
                <Plus size={14} />
                <span>Custom Topic Generator</span>
              </button>
              <button
                onClick={() => setActiveTab('scanner_info')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'scanner_info' ? 'bg-white shadow-sm text-ink' : 'text-ink3 hover:text-ink'
                }`}
              >
                <ShieldCheck size={14} />
                <span>2-Hour Anti-Noise Rules</span>
              </button>
            </div>

            {/* 2-Hour Timer Indicator */}
            <div className="flex items-center gap-2 text-ink3 font-mono text-[11px]">
              <Clock size={13} className="text-gold" />
              <span>
                Schedule: <strong>Every 2 Hours</strong> • Next Auto-Scan:{' '}
                {scannerStatus.nextScanTime 
                  ? new Date(scannerStatus.nextScanTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Pending'}
              </span>
            </div>
          </div>

          {/* Notification Alert */}
          {notification && (
            <div className={`px-6 py-2.5 text-xs flex items-center justify-between gap-4 ${
              notification.type === 'success' 
                ? 'bg-emerald-50 text-emerald-900 border-b border-emerald-200' 
                : notification.type === 'info'
                ? 'bg-amber-50 text-amber-900 border-b border-amber-200'
                : 'bg-rose-50 text-rose-900 border-b border-rose-200'
            }`}>
              <div className="flex items-center gap-2 flex-1">
                {notification.type === 'success' ? (
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                ) : notification.type === 'info' ? (
                  <Clock size={16} className="text-amber-600 flex-shrink-0" />
                ) : (
                  <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
                )}
                <span>{notification.message}</span>
              </div>
              <div className="flex items-center gap-2">
                {notification.type === 'info' && (
                  <button 
                    onClick={() => handleTriggerScan(true)}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                  >
                    ⚡ Force Scan Now
                  </button>
                )}
                <button onClick={() => setNotification(null)} className="text-xs opacity-70 hover:opacity-100 font-bold">
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Main Body */}
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            
            {activeTab === 'custom_generate' && (
              <div className="flex-1 p-8 overflow-y-auto max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-gold/15 text-gold rounded-2xl flex items-center justify-center mx-auto mb-2 font-serif font-bold text-xl">
                    ⚡
                  </div>
                  <h3 className="text-xl font-serif font-black text-ink">Generate Grounded Educational Draft</h3>
                  <p className="text-xs text-ink3 max-w-md mx-auto">
                    Type any current affair, recent government announcement, or exam topic. AI will search Google, verify facts against credible institutions, and write a full draft for your review.
                  </p>
                </div>

                <form onSubmit={handleGenerateCustom} className="space-y-4 bg-white p-6 rounded-2xl border border-black/10 shadow-sm">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-ink3">Topic or Trend Headline *</label>
                    <input
                      type="text"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="e.g., ISRO Proba-3 Coronagraph or UPSC Economy Inflation Basket..."
                      className="w-full bg-paper2 border border-black/10 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none font-medium"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-widest text-ink3">Category</label>
                      <select
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value as Category)}
                        className="w-full bg-paper2 border border-black/10 rounded-xl px-3 py-2.5 text-xs font-medium focus:border-gold outline-none"
                      >
                        <option value="science">SCIENCE</option>
                        <option value="history">HISTORY</option>
                        <option value="inventions">INVENTIONS</option>
                        <option value="discoveries">DISCOVERIES</option>
                        <option value="birthdays">BIRTHDAYS</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-widest text-ink3">Exam Focus Target</label>
                      <select
                        value={customFocus}
                        onChange={(e) => setCustomFocus(e.target.value)}
                        className="w-full bg-paper2 border border-black/10 rounded-xl px-3 py-2.5 text-xs font-medium focus:border-gold outline-none"
                      >
                        <option value="UPSC Civil Services & GS Papers">UPSC Civil Services (GS-I/II/III)</option>
                        <option value="SSC CGL, CHSL & Railways">SSC CGL / CHSL & Railways</option>
                        <option value="State PSC & Defense (NDA/CDS)">State PSCs & Defense</option>
                        <option value="Static GK & General Knowledge">General Science & Static GK</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-gold/30 rounded-xl text-xs text-ink2 flex items-start gap-2">
                    <ShieldCheck size={16} className="text-gold flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Veracity Filter Active:</strong> AI will check trusted news channels (PIB, The Hindu, Nature, ISRO) and automatically include fact-check verification details.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={generating || !customTopic.trim()}
                    className="w-full py-3 bg-ink text-white rounded-xl font-bold text-sm hover:bg-gold hover:text-ink transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <RefreshCw size={16} className="animate-spin text-gold" />
                        <span>Verifying Facts & Generating Draft…</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} className="text-gold" />
                        <span>Generate & Add to Review Queue</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'scanner_info' && (
              <div className="flex-1 p-8 overflow-y-auto max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
                <div className="bg-white p-6 rounded-2xl border border-black/10 space-y-4">
                  <h3 className="text-lg font-serif font-bold text-ink flex items-center gap-2">
                    <ShieldCheck className="text-emerald-600" />
                    Autonomous 2-Hour Educational Safeguards & Fact-Check Engine
                  </h3>
                  <p className="text-xs text-ink3 leading-relaxed">
                    FactHub runs a dedicated background scanner every 2 hours that inspects trending educational topics, competitive exam notifications, and scientific breakthroughs. It adheres to strict content integrity rules:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 bg-paper2 rounded-xl border border-black/5 space-y-1">
                      <div className="text-xs font-bold text-ink flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        1. Anti-Noise Filtering
                      </div>
                      <p className="text-[11px] text-ink3 leading-normal">
                        Strictly eliminates clickbait, celebrity gossip, unverified social media rumors, and viral political noise.
                      </p>
                    </div>

                    <div className="p-3.5 bg-paper2 rounded-xl border border-black/5 space-y-1">
                      <div className="text-xs font-bold text-ink flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-gold"></span>
                        2. Institutional Verification
                      </div>
                      <p className="text-[11px] text-ink3 leading-normal">
                        Cross-verifies claims against PIB India, The Hindu, BBC, Nature, ISRO, DRDO, and verified official releases.
                      </p>
                    </div>

                    <div className="p-3.5 bg-paper2 rounded-xl border border-black/5 space-y-1">
                      <div className="text-xs font-bold text-ink flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        3. Core Meaning Preservation
                      </div>
                      <p className="text-[11px] text-ink3 leading-normal">
                        Ensures the authentic scientific and historical truth of the event is kept intact without distortion.
                      </p>
                    </div>

                    <div className="p-3.5 bg-paper2 rounded-xl border border-black/5 space-y-1">
                      <div className="text-xs font-bold text-ink flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-coral"></span>
                        4. Admin Approval Gate
                      </div>
                      <p className="text-[11px] text-ink3 leading-normal">
                        Drafts are never published directly to readers. Only you (<code className="font-mono text-[10px]">krish02shiva@gmail.com</code>) have posting rights.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                    <div className="text-xs text-ink3">
                      <strong>Current Status:</strong> {scannerStatus.statusMessage}
                    </div>
                    <button
                      onClick={() => handleTriggerScan(false)}
                      disabled={scanning}
                      className="px-4 py-2 bg-ink text-white text-xs font-bold rounded-xl hover:bg-gold hover:text-ink transition-all"
                    >
                      {scanning ? "Scanning…" : "Test Scan Now"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'queue' && (
              <>
                {/* Left Sidebar: Drafts List */}
                <div className="w-full md:w-88 border-r border-black/10 bg-white flex flex-col flex-shrink-0 h-[320px] md:h-auto overflow-hidden">
                  <div className="p-3 border-b border-black/5 bg-paper2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-ink3">
                        Drafts Queue ({filteredDrafts.length})
                      </span>
                      <button
                        onClick={() => handleTriggerScan(false)}
                        disabled={scanning}
                        className="text-[11px] font-bold text-gold hover:underline flex items-center gap-1"
                        title="Scan new trends"
                      >
                        <RefreshCw size={11} className={scanning ? "animate-spin" : ""} />
                        <span>Scan</span>
                      </button>
                    </div>

                    {/* Search Box */}
                    <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink3" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search drafts by title, keyword…"
                        className="w-full bg-white border border-black/10 rounded-xl pl-8 pr-7 py-1.5 text-xs text-ink placeholder:text-ink3/60 outline-none focus:border-gold"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-ink3 hover:text-ink"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    {/* Filter Segmented Buttons */}
                    <div className="grid grid-cols-3 gap-1 bg-paper p-1 rounded-xl border border-black/5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setFilterStatus('pending')}
                        className={`py-1 rounded-lg font-bold transition-all ${
                          filterStatus === 'pending'
                            ? 'bg-amber-100 text-amber-900 shadow-xs'
                            : 'text-ink3 hover:text-ink'
                        }`}
                      >
                        Pending ({pendingCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterStatus('published')}
                        className={`py-1 rounded-lg font-bold transition-all ${
                          filterStatus === 'published'
                            ? 'bg-emerald-100 text-emerald-900 shadow-xs'
                            : 'text-ink3 hover:text-ink'
                        }`}
                      >
                        Live ({publishedCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterStatus('all')}
                        className={`py-1 rounded-lg font-bold transition-all ${
                          filterStatus === 'all'
                            ? 'bg-white text-ink shadow-xs'
                            : 'text-ink3 hover:text-ink'
                        }`}
                      >
                        All ({drafts.length})
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y divide-black/5">
                    {loading && drafts.length === 0 ? (
                      <div className="p-6 text-center text-xs text-ink3">Loading drafts...</div>
                    ) : filteredDrafts.length === 0 ? (
                      <div className="p-6 text-center space-y-2">
                        <p className="text-xs text-ink3">
                          {searchQuery ? `No drafts matching "${searchQuery}".` : `No ${filterStatus} drafts found.`}
                        </p>
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setFilterStatus('all');
                          }}
                          className="text-xs font-bold text-gold hover:underline block mx-auto"
                        >
                          Clear Filters
                        </button>
                      </div>
                    ) : (
                      filteredDrafts.map((draft) => {
                        const isSelected = selectedDraft?.id === draft.id;
                        return (
                          <div
                            key={draft.id}
                            onClick={() => selectDraftForEditing(draft)}
                            className={`p-3 rounded-xl cursor-pointer transition-all text-left space-y-1 ${
                              isSelected
                                ? 'bg-gold/15 border border-gold/40 shadow-sm'
                                : 'hover:bg-paper2 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="uppercase text-gold font-bold">{draft.cat}</span>
                              <span className={`px-1.5 py-0.2 rounded font-bold ${
                                draft.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                              }`}>
                                {draft.status === 'published' ? 'Published' : 'Pending Review'}
                              </span>
                            </div>
                            <h4 className="text-xs font-serif font-bold text-ink line-clamp-2 leading-snug">
                              {draft.emoji} {draft.title}
                            </h4>
                            <div className="text-[10px] text-ink3 truncate">
                              {draft.sourceTrend ? `Trend: ${draft.sourceTrend}` : 'Verified Educational Event'}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right Area: Draft Editor / Review Studio */}
                <div className="flex-1 bg-paper flex flex-col overflow-hidden">
                  {selectedDraft ? (
                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                      {/* Top Bar for Selected Draft */}
                      <div className="p-4 bg-white border-b border-black/10 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{editForm.emoji || '📝'}</span>
                          <div>
                            <span className="text-[10px] font-mono text-ink3 uppercase">
                              Verification Status: <strong className="text-emerald-700 font-bold">{editForm.verificationStatus || 'Verified'}</strong>
                            </span>
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
                                : 'bg-paper2 text-ink border-black/10 hover:bg-black/5'
                            }`}
                          >
                            {previewMode ? <Edit3 size={13} /> : <Eye size={13} />}
                            <span>{previewMode ? "Editor View" : "Preview"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteDraft(selectedDraft.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Discard draft"
                          >
                            <Trash2 size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={handleSaveDraftChanges}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-paper2 hover:bg-gold/20 text-xs font-bold text-ink rounded-xl border border-black/10 transition-all"
                          >
                            <Save size={13} />
                            <span>Save Edits</span>
                          </button>

                          <button
                            type="button"
                            onClick={handlePublishFact}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-ink hover:bg-gold text-white hover:text-ink text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
                          >
                            <Send size={13} />
                            <span>Approve & Post</span>
                          </button>
                        </div>
                      </div>

                      {/* Fact Verification Card */}
                      <div className="px-6 py-3 bg-emerald-50/70 border-b border-emerald-200/60 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-950 flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={16} className="text-emerald-700 flex-shrink-0" />
                          <span>
                            <strong>Fact-Check Summary:</strong> {editForm.factCheckSummary || 'Verified with official news bulletins.'}
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

                      {/* Editor / Preview Content Body */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {previewMode ? (
                          <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl border border-black/10 shadow-sm space-y-6">
                            <div className="space-y-2 border-b border-black/5 pb-4">
                              <div className="flex items-center gap-2 text-xs font-mono text-gold uppercase font-bold">
                                <span>{editForm.cat}</span>
                                <span>•</span>
                                <span>Year: {editForm.year}</span>
                                {editForm.examRelevance && (
                                  <>
                                    <span>•</span>
                                    <span className="text-ink2 font-sans">Exam Relevance: {editForm.examRelevance}</span>
                                  </>
                                )}
                              </div>
                              <h1 className="text-2xl sm:text-3xl font-serif font-black text-ink">
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
                          </div>
                        ) : (
                          <div className="space-y-6 max-w-4xl mx-auto">
                            {/* Metadata Inputs */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-black/10">
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">Category</label>
                                <select
                                  value={editForm.cat}
                                  onChange={(e) => setEditForm({ ...editForm, cat: e.target.value as Category })}
                                  className="w-full bg-paper2 border border-black/10 rounded-xl p-2.5 text-xs font-medium focus:border-gold outline-none"
                                >
                                  <option value="history">HISTORY</option>
                                  <option value="science">SCIENCE</option>
                                  <option value="inventions">INVENTIONS</option>
                                  <option value="discoveries">DISCOVERIES</option>
                                  <option value="birthdays">BIRTHDAYS</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">Year</label>
                                <input
                                  type="number"
                                  value={editForm.year || new Date().getFullYear()}
                                  onChange={(e) => setEditForm({ ...editForm, year: parseInt(e.target.value) || new Date().getFullYear() })}
                                  className="w-full bg-paper2 border border-black/10 rounded-xl p-2.5 text-xs font-medium focus:border-gold outline-none"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">Emoji</label>
                                <input
                                  type="text"
                                  value={editForm.emoji || '📝'}
                                  onChange={(e) => setEditForm({ ...editForm, emoji: e.target.value })}
                                  className="w-full bg-paper2 border border-black/10 rounded-xl p-2.5 text-xs font-medium text-center focus:border-gold outline-none text-base"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">Exam Relevance</label>
                                <input
                                  type="text"
                                  value={editForm.examRelevance || ''}
                                  onChange={(e) => setEditForm({ ...editForm, examRelevance: e.target.value })}
                                  placeholder="e.g. UPSC GS-III / SSC CGL"
                                  className="w-full bg-paper2 border border-black/10 rounded-xl p-2.5 text-xs font-medium focus:border-gold outline-none"
                                />
                              </div>
                            </div>

                            {/* Title & Excerpt */}
                            <div className="space-y-3 bg-white p-4 rounded-2xl border border-black/10">
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">Title *</label>
                                <input
                                  type="text"
                                  value={editForm.title || ''}
                                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                  className="w-full bg-paper2 border border-black/10 rounded-xl p-3 text-sm font-serif font-bold text-ink focus:border-gold outline-none"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">Excerpt (Short Hook Summary) *</label>
                                <textarea
                                  value={editForm.excerpt || ''}
                                  onChange={(e) => setEditForm({ ...editForm, excerpt: e.target.value })}
                                  className="w-full bg-paper2 border border-black/10 rounded-xl p-3 text-xs text-ink h-20 resize-none focus:border-gold outline-none font-serif leading-relaxed"
                                />
                              </div>
                            </div>

                            {/* Full Article Content Editor */}
                            <div className="space-y-3 bg-white p-5 rounded-2xl border border-black/10">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-ink3">
                                  Full Article Content (Markdown & Lists) *
                                </label>
                                <div className="text-[11px] text-ink3">
                                  Use toolbar below for bullet points, numbered lists, headings & styling
                                </div>
                              </div>

                              {/* Markdown Formatting Toolbar with Bullet & Numbered List Buttons */}
                              <MarkdownToolbar
                                textareaRef={textareaRef}
                                value={editForm.full || ''}
                                onChange={(val) => setEditForm({ ...editForm, full: val })}
                              />

                              {/* Highlight Color Picker */}
                              <div className="p-3 bg-paper2 rounded-xl border border-black/5 space-y-2">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-ink3">
                                  🎨 Quick Text Highlight Palette:
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {COLOR_OPTIONS.map((c) => (
                                    <button
                                      key={c.name}
                                      type="button"
                                      onClick={() => handleInsertColor(c.name)}
                                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-black/5 hover:border-black/10 bg-white text-[11px] font-bold cursor-pointer"
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
                                placeholder="Type or format your article here using bullet points, numbered lists, headers, etc."
                                className="w-full bg-paper2 border border-black/10 rounded-xl p-4 text-xs font-serif leading-relaxed text-ink h-80 focus:border-gold outline-none"
                              />
                            </div>

                            {/* Images & Publishing Schedule */}
                            <div className="space-y-4">
                              <div className="bg-white p-4 rounded-2xl border border-black/10">
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

                              <div className="bg-white p-4 rounded-2xl border border-black/10 space-y-3">
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
                                    <span>Schedule For Later</span>
                                  </label>
                                </div>

                                {publishType === 'schedule' && (
                                  <input
                                    type="datetime-local"
                                    value={scheduleTime}
                                    onChange={(e) => setScheduleTime(e.target.value)}
                                    className="w-full bg-paper2 border border-black/10 rounded-xl p-2.5 text-xs text-ink focus:border-gold outline-none"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="p-4 bg-white border-t border-black/10 flex items-center justify-between flex-shrink-0">
                        <div className="text-xs text-ink3">
                          Logged in as Admin: <span className="font-mono text-ink font-bold">{user?.email}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={handleSaveDraftChanges}
                            disabled={loading}
                            className="px-4 py-2 bg-paper2 hover:bg-black/5 text-ink text-xs font-bold rounded-xl border border-black/10 transition-all"
                          >
                            Save Draft
                          </button>

                          <button
                            type="button"
                            onClick={handlePublishFact}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-ink text-white hover:bg-gold hover:text-ink text-xs font-bold rounded-xl transition-all shadow-md"
                          >
                            <CheckCircle2 size={15} />
                            <span>Approve & Publish to FactHub</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-gold/10 text-gold flex items-center justify-center text-2xl font-serif">
                        📖
                      </div>
                      <h3 className="text-lg font-serif font-bold text-ink">Select or Generate a Draft</h3>
                      <p className="text-xs text-ink3 max-w-sm">
                        Choose a draft from the left queue to review and edit, or click "Scan Trends Now" to fetch live verified news.
                      </p>
                      <button
                        onClick={() => handleTriggerScan(false)}
                        disabled={scanning}
                        className="px-5 py-2.5 bg-ink text-white hover:bg-gold hover:text-ink text-xs font-bold rounded-xl transition-all shadow-sm"
                      >
                        {scanning ? "Scanning…" : "Scan Google Trends"}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
