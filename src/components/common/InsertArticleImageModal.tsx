import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  Loader2, 
  HelpCircle, 
  AlignLeft, 
  AlignCenter, 
  ArrowDownToLine, 
  Compass, 
  History, 
  Atom, 
  Globe2 
} from 'lucide-react';
import { normalizeImageUrl, resolveDirectImageUrl, compressAndReadImageFile } from '../../lib/imageUtils';

interface InsertArticleImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (markdownImageTag: string, placement: 'cursor' | 'after_intro' | 'middle' | 'end') => void;
  initialSelectedText?: string;
}

const PRESET_SAMPLE_IMAGES = [
  {
    category: 'Space & Astronomy',
    title: 'James Webb Deep Field Universe',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
    credit: 'NASA / ESA / CSA / STScI (Public Domain)',
    icon: Atom
  },
  {
    category: 'History & Artifacts',
    title: 'Ancient Manuscript & Historical Parchment',
    url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=1200',
    credit: 'British Library / Public Domain via Wikimedia',
    icon: History
  },
  {
    category: 'Science & Discovery',
    title: 'Microbiology & Laboratory Research',
    url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1200',
    credit: 'National Science Foundation / Unsplash',
    icon: Sparkles
  },
  {
    category: 'Heritage & Geography',
    title: 'Ancient World Monument & Architecture',
    url: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&q=80&w=1200',
    credit: 'Wikimedia Commons / CC BY-SA 4.0',
    icon: Globe2
  }
];

export const InsertArticleImageModal: React.FC<InsertArticleImageModalProps> = ({
  isOpen,
  onClose,
  onInsert,
  initialSelectedText = ''
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState(initialSelectedText || '');
  const [credit, setCredit] = useState('');
  const [placement, setPlacement] = useState<'cursor' | 'after_intro' | 'middle' | 'end'>('cursor');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WebP, etc.).');
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Compressing and preparing image...');

    try {
      const result = await compressAndReadImageFile(file);
      setImageUrl(result.dataUrl);

      // Auto-suggest alt text from filename if empty
      if (!altText.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setAltText(cleanName);
      }
      if (!credit.trim()) {
        setCredit('Author Uploaded Media');
      }

      setStatusMessage(`✓ Image optimized (${result.sizeKb} KB)`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      alert(`Image processing failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUrlChange = async (rawUrl: string) => {
    setImageUrl(rawUrl);
    if (!rawUrl.trim()) return;

    setIsProcessing(true);
    try {
      const normalized = normalizeImageUrl(rawUrl);
      const resolved = await resolveDirectImageUrl(normalized);
      setImageUrl(resolved);

      // Auto-suggest credit if Wikimedia/Wikipedia
      if (!credit.trim() && (rawUrl.includes('wikimedia.org') || rawUrl.includes('wikipedia.org'))) {
        setCredit('Public Domain / Wikimedia Commons');
      }
      setStatusMessage('✓ Valid image link');
      setTimeout(() => setStatusMessage(null), 2000);
    } catch {
      // Keep as-is
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_SAMPLE_IMAGES[0]) => {
    setImageUrl(preset.url);
    if (!altText.trim()) setAltText(preset.title);
    setCredit(preset.credit);
    setStatusMessage(`✓ Loaded sample: ${preset.title}`);
    setTimeout(() => setStatusMessage(null), 2000);
  };

  const handleConfirmInsert = () => {
    if (!imageUrl.trim()) {
      alert('Please upload an image or paste a valid image URL first.');
      return;
    }

    const cleanAlt = altText.trim() || 'Article illustration';
    const cleanCredit = credit.trim();
    
    // Markdown Tag with format: ![Alt Text | Credit: Name](URL)
    const altWithCredit = cleanCredit 
      ? `${cleanAlt} | Credit: ${cleanCredit}` 
      : cleanAlt;

    const markdownTag = `\n\n![${altWithCredit}](${imageUrl.trim()})\n\n`;

    onInsert(markdownTag, placement);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[300] bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-paper w-full max-w-2xl rounded-3xl shadow-2xl border border-black/10 overflow-hidden flex flex-col my-auto max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-paper2 border-b border-black/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gold/20 text-gold flex items-center justify-center">
              <ImageIcon size={20} />
            </div>
            <div>
              <h3 className="font-serif font-black text-lg text-ink">
                Insert In-Article Image with Photo Credit
              </h3>
              <p className="text-xs text-ink3">
                Place illustrations, maps, or archival photos seamlessly between paragraphs
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/5 text-ink3 hover:text-ink transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-ink">
          
          {/* Method Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-paper2 p-1 rounded-2xl border border-black/5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'upload' ? 'bg-white shadow-xs text-ink text-gold' : 'text-ink3 hover:text-ink'
              }`}
            >
              <Upload size={14} />
              <span>Upload File</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'url' ? 'bg-white shadow-xs text-ink text-gold' : 'text-ink3 hover:text-ink'
              }`}
            >
              <LinkIcon size={14} />
              <span>Paste Image Link</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'presets' ? 'bg-white shadow-xs text-ink text-gold' : 'text-ink3 hover:text-ink'
              }`}
            >
              <Sparkles size={14} />
              <span>Free Stock Samples</span>
            </button>
          </div>

          {/* 1. Upload Tab */}
          {activeTab === 'upload' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                isDragOver ? 'border-gold bg-gold/5' : 'border-black/15 hover:border-gold/50 bg-paper2/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-black/5 flex items-center justify-center text-ink2">
                  {isProcessing ? (
                    <Loader2 size={24} className="animate-spin text-gold" />
                  ) : (
                    <Upload size={24} className="text-gold" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-ink flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-coral hover:underline font-bold"
                    >
                      Choose image file from computer
                    </button>
                    <span className="text-ink3 font-normal">or drag & drop</span>
                  </div>
                  <p className="text-[11px] text-ink3">
                    Supports JPG, PNG, WebP, GIF. Automatically optimized for fast loading.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. URL Tab */}
          {activeTab === 'url' && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-ink3 block">
                Direct Image or Wikimedia / Wikipedia Link
              </label>
              <div className="relative">
                <LinkIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink3" />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://commons.wikimedia.org/wiki/File:Apollo_11.jpg or https://..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-black/10 rounded-xl text-xs text-ink focus:border-gold outline-none"
                />
              </div>
              <p className="text-[11px] text-ink3 leading-relaxed">
                Paste any Wikipedia / Wikimedia Commons file page, Unsplash, ImgBB, or Google Drive link. We'll automatically resolve it to a direct image.
              </p>
            </div>
          )}

          {/* 3. Presets Tab */}
          {activeTab === 'presets' && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-ink3 block">
                Select a Royalty-Free Educational Stock Image
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRESET_SAMPLE_IMAGES.map((preset, idx) => {
                  const Icon = preset.icon;
                  const isSelected = imageUrl === preset.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                        isSelected 
                          ? 'border-gold bg-gold/10 ring-2 ring-gold/20' 
                          : 'border-black/10 bg-white hover:bg-paper2'
                      }`}
                    >
                      <img 
                        src={preset.url} 
                        alt={preset.title} 
                        className="w-12 h-12 object-cover rounded-xl border border-black/5 flex-shrink-0"
                      />
                      <div className="truncate flex-1">
                        <div className="text-xs font-bold text-ink truncate">{preset.title}</div>
                        <div className="text-[10px] text-ink3 flex items-center gap-1 mt-0.5">
                          <Icon size={11} className="text-gold" />
                          <span>{preset.category}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Alt Text & Source Credit Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-black/10">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-ink flex items-center justify-between">
                <span>Alt Text & Caption *</span>
                <span className="text-[10px] text-ink3 font-normal">Shown to readers</span>
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="e.g., ISRO Chandrayaan-3 Pragyan Rover"
                className="w-full p-2.5 text-xs bg-paper2 rounded-xl border border-black/10 focus:border-gold outline-none text-ink font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-ink flex items-center justify-between">
                <span>Photo Credit / Attribution</span>
                <span className="text-[10px] text-ink3 font-normal">Source citation</span>
              </label>
              <input
                type="text"
                value={credit}
                onChange={(e) => setCredit(e.target.value)}
                placeholder="e.g., ISRO / Indian Space Research Org"
                className="w-full p-2.5 text-xs bg-paper2 rounded-xl border border-black/10 focus:border-gold outline-none text-ink font-medium"
              />
            </div>
          </div>

          {/* Placement Options */}
          <div className="space-y-2 bg-paper2 p-4 rounded-2xl border border-black/5">
            <label className="text-xs font-bold uppercase tracking-wider text-ink block">
              Where to place this image in the article?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPlacement('cursor')}
                className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                  placement === 'cursor' 
                    ? 'bg-ink text-white border-ink shadow-xs' 
                    : 'bg-white text-ink2 border-black/10 hover:bg-paper3'
                }`}
              >
                <span className="block text-sm mb-0.5">📍</span>
                <span>At Cursor</span>
              </button>

              <button
                type="button"
                onClick={() => setPlacement('after_intro')}
                className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                  placement === 'after_intro' 
                    ? 'bg-ink text-white border-ink shadow-xs' 
                    : 'bg-white text-ink2 border-black/10 hover:bg-paper3'
                }`}
              >
                <span className="block text-sm mb-0.5">📌</span>
                <span>After Intro</span>
              </button>

              <button
                type="button"
                onClick={() => setPlacement('middle')}
                className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                  placement === 'middle' 
                    ? 'bg-ink text-white border-ink shadow-xs' 
                    : 'bg-white text-ink2 border-black/10 hover:bg-paper3'
                }`}
              >
                <span className="block text-sm mb-0.5">⚖️</span>
                <span>Article Middle</span>
              </button>

              <button
                type="button"
                onClick={() => setPlacement('end')}
                className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                  placement === 'end' 
                    ? 'bg-ink text-white border-ink shadow-xs' 
                    : 'bg-white text-ink2 border-black/10 hover:bg-paper3'
                }`}
              >
                <span className="block text-sm mb-0.5">🏁</span>
                <span>At End</span>
              </button>
            </div>
          </div>

          {/* Live Preview of In-Between Image */}
          {imageUrl && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-ink3 flex items-center justify-between">
                <span>Article Layout Live Preview</span>
                {statusMessage && <span className="text-teal font-medium">{statusMessage}</span>}
              </div>
              <div className="bg-white p-4 rounded-2xl border border-black/10 space-y-2">
                <div className="rounded-xl overflow-hidden border border-black/5 bg-paper2 max-h-48 flex items-center justify-center">
                  <img
                    src={normalizeImageUrl(imageUrl)}
                    alt={altText || 'Preview'}
                    className="w-full h-auto object-cover max-h-48"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      if (target.src.includes('?width=')) {
                        target.src = target.src.split('?')[0];
                      }
                    }}
                  />
                </div>
                {(altText || credit) && (
                  <div className="text-center text-xs text-ink3 px-2">
                    {altText && <span className="text-ink font-semibold">{altText}</span>}
                    {altText && credit && <span className="mx-1.5 opacity-30">|</span>}
                    {credit && <span className="italic text-ink3">Credit: {credit}</span>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Markdown Format Explanation */}
          <div className="p-3 bg-amber-50 rounded-xl border border-gold/30 text-[11px] text-ink2 leading-relaxed flex items-start gap-2">
            <HelpCircle size={15} className="text-gold flex-shrink-0 mt-0.5" />
            <div>
              <strong>Markdown Syntax Note:</strong> Images with credits are formatted as: <code className="bg-white px-1.5 py-0.5 rounded border border-black/10 font-mono text-[10px] text-coral font-bold">![Caption | Credit: Source](URL)</code>. The reader displays the image beautifully centered with the caption and citation beneath it.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-paper2 border-t border-black/10 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-ink3 hover:text-ink transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleConfirmInsert}
            disabled={!imageUrl.trim() || isProcessing}
            className="px-6 py-2.5 bg-ink hover:bg-gold text-white hover:text-ink text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check size={14} />
            <span>Insert Image into Article</span>
          </button>
        </div>
      </div>
    </div>
  );
};
