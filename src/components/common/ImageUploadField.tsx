import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, Check, Loader2, Sparkles } from 'lucide-react';
import { normalizeImageUrl, resolveDirectImageUrl, compressAndReadImageFile } from '../../lib/imageUtils';

interface ImageUploadFieldProps {
  label?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageCredit?: string;
  onChange: (data: { imageUrl: string; imageAlt?: string; imageCredit?: string }) => void;
  className?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label = 'Article Media / Cover Image',
  imageUrl = '',
  imageAlt = '',
  imageCredit = '',
  onChange,
  className = ''
}) => {
  const [inputUrl, setInputUrl] = useState(imageUrl);
  const [alt, setAlt] = useState(imageAlt);
  const [credit, setCredit] = useState(imageCredit);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep internal input in sync if prop changes from external source
  React.useEffect(() => {
    setInputUrl(imageUrl || '');
  }, [imageUrl]);

  React.useEffect(() => {
    setAlt(imageAlt || '');
  }, [imageAlt]);

  React.useEffect(() => {
    setCredit(imageCredit || '');
  }, [imageCredit]);

  const handleUrlBlurOrPaste = async (rawUrl: string) => {
    if (!rawUrl.trim()) {
      onChange({ imageUrl: '', imageAlt: alt, imageCredit: credit });
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Checking & formatting image URL...');

    try {
      const normalized = normalizeImageUrl(rawUrl);
      const resolved = await resolveDirectImageUrl(normalized);
      setInputUrl(resolved);

      // Auto-extract credit suggestion if Wikimedia or Wikipedia
      let suggestedCredit = credit;
      if (rawUrl.includes('wikimedia.org') || rawUrl.includes('wikipedia.org')) {
        if (!credit) suggestedCredit = 'Public Domain / Wikimedia Commons';
      }

      onChange({
        imageUrl: resolved,
        imageAlt: alt,
        imageCredit: suggestedCredit
      });
      setStatusMessage('✓ Direct image link active');
      setTimeout(() => setStatusMessage(null), 2500);
    } catch {
      onChange({ imageUrl: rawUrl, imageAlt: alt, imageCredit: credit });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WebP, etc.).');
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Compressing and optimizing image...');

    try {
      const result = await compressAndReadImageFile(file);
      setInputUrl(result.dataUrl);

      // Auto-fill Alt text if empty
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      const newAlt = alt || cleanName;
      const newCredit = credit || 'Uploaded Media';

      setAlt(newAlt);
      setCredit(newCredit);

      onChange({
        imageUrl: result.dataUrl,
        imageAlt: newAlt,
        imageCredit: newCredit
      });

      setStatusMessage(`✓ Image uploaded & optimized (${result.sizeKb} KB)`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      alert(`Image processing failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setInputUrl('');
    onChange({ imageUrl: '', imageAlt: alt, imageCredit: credit });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
          <ImageIcon size={14} className="text-gold" />
          {label}
        </label>
        {statusMessage && (
          <span className="text-[11px] font-medium text-teal flex items-center gap-1 animate-fade-in">
            {statusMessage}
          </span>
        )}
      </div>

      {imageUrl ? (
        /* Preview Card with Image */
        <div className="relative rounded-2xl overflow-hidden border border-black/10 bg-paper3 shadow-xs group">
          <div className="aspect-video w-full max-h-56 relative bg-black/5 overflow-hidden flex items-center justify-center">
            <img
              src={normalizeImageUrl(imageUrl)}
              alt={alt || 'Uploaded Media Preview'}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                // If it fails, try without query string or fallback
                if (target.src.includes('?width=')) {
                  target.src = target.src.split('?')[0];
                }
              }}
            />
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1">
              <Check size={12} className="text-teal" />
              Active Media
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-3 right-3 bg-black/70 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors shadow-md"
              title="Remove image"
            >
              <X size={14} />
            </button>
          </div>

          <div className="p-3 bg-white/80 border-t border-black/5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-ink2 truncate max-w-[240px] sm:max-w-xs">
              <span className="font-medium text-ink truncate">{alt || 'Cover Image'}</span>
              {credit && <span className="text-ink3 italic text-[11px]">({credit})</span>}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-paper2 hover:bg-paper3 text-ink border border-black/10 transition-colors"
              >
                Replace File
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Upload & URL Input Area */
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 transition-all text-center ${
            isDragOver ? 'border-gold bg-gold/5 scale-[1.01]' : 'border-black/10 hover:border-gold/50 bg-paper2/50'
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
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-black/5 flex items-center justify-center text-ink2 group-hover:text-gold transition-colors">
              {isProcessing ? (
                <Loader2 size={22} className="animate-spin text-gold" />
              ) : (
                <Upload size={22} className="text-ink2" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-ink">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-coral hover:underline font-bold"
                >
                  Choose an image file
                </button>
                <span className="text-ink3 font-normal">or drag & drop here</span>
              </div>
              <p className="text-[11px] text-ink3">
                Supports JPG, PNG, WebP, Wikimedia files, Wikipedia URLs, ImgBB, and Google Drive links.
              </p>
            </div>

            <div className="w-full max-w-md flex items-center gap-2 pt-2 border-t border-black/5">
              <div className="relative flex-1">
                <LinkIcon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink3" />
                <input
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  onBlur={(e) => handleUrlBlurOrPaste(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleUrlBlurOrPaste(inputUrl);
                    }
                  }}
                  placeholder="Or paste any image or Wikimedia/Wikipedia link..."
                  className="w-full pl-8 pr-3 py-2 text-xs bg-white rounded-xl border border-black/10 focus:border-gold outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => handleUrlBlurOrPaste(inputUrl)}
                disabled={!inputUrl.trim() || isProcessing}
                className="px-3 py-2 text-xs font-bold rounded-xl bg-ink hover:bg-black text-paper disabled:opacity-40 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alt Text and Source Credit Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="text-[11px] font-bold text-ink3 uppercase tracking-wider block mb-1">
            Alt Text (SEO & Accessibility)
          </label>
          <input
            type="text"
            value={alt}
            onChange={(e) => {
              setAlt(e.target.value);
              onChange({ imageUrl: inputUrl, imageAlt: e.target.value, imageCredit: credit });
            }}
            placeholder="e.g., Signing of the Treaty of Nanking painting"
            className="w-full p-2.5 text-xs bg-white rounded-xl border border-black/10 focus:border-gold outline-none text-ink"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-ink3 uppercase tracking-wider block mb-1">
            Photo Credit / Source
          </label>
          <input
            type="text"
            value={credit}
            onChange={(e) => {
              setCredit(e.target.value);
              onChange({ imageUrl: inputUrl, imageAlt: alt, imageCredit: e.target.value });
            }}
            placeholder="e.g., Captain John Platt, Public Domain via Wikimedia"
            className="w-full p-2.5 text-xs bg-white rounded-xl border border-black/10 focus:border-gold outline-none text-ink"
          />
        </div>
      </div>
    </div>
  );
};
