import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Copy, Check, Sparkles, Image, RefreshCw, Palette, Layers, Share2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  year?: number;
  category: string;
  excerpt: string;
  emoji?: string;
  authorOrDate?: string;
}

type AspectRatio = '1:1' | '9:16' | '16:9';
type CardTheme = 'dark-gold' | 'emerald-science' | 'coral-history' | 'sapphire-tech' | 'clean-paper';

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  title,
  year,
  category,
  excerpt,
  emoji = '💡',
  authorOrDate
}) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [theme, setTheme] = useState<CardTheme>('dark-gold');
  const [customSubtitle, setCustomSubtitle] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw card on canvas
  const renderCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set dimensions
    let width = 1080;
    let height = 1080;
    if (aspectRatio === '9:16') {
      width = 1080;
      height = 1920;
    } else if (aspectRatio === '16:9') {
      width = 1920;
      height = 1080;
    }

    canvas.width = width;
    canvas.height = height;

    // Color definitions
    let bgGradStart = '#111827';
    let bgGradEnd = '#030712';
    let accentColor = '#eab308';
    let textColor = '#ffffff';
    let subTextColor = '#9ca3af';
    let cardBg = 'rgba(255, 255, 255, 0.05)';
    let cardBorder = 'rgba(234, 179, 8, 0.2)';

    if (theme === 'emerald-science') {
      bgGradStart = '#064e3b';
      bgGradEnd = '#022c22';
      accentColor = '#34d399';
      textColor = '#ffffff';
      subTextColor = '#a7f3d0';
      cardBorder = 'rgba(52, 211, 153, 0.3)';
    } else if (theme === 'coral-history') {
      bgGradStart = '#7c2d12';
      bgGradEnd = '#431407';
      accentColor = '#fb923c';
      textColor = '#ffffff';
      subTextColor = '#fed7aa';
      cardBorder = 'rgba(251, 146, 60, 0.3)';
    } else if (theme === 'sapphire-tech') {
      bgGradStart = '#1e1b4b';
      bgGradEnd = '#0f172a';
      accentColor = '#38bdf8';
      textColor = '#ffffff';
      subTextColor = '#bae6fd';
      cardBorder = 'rgba(56, 189, 248, 0.3)';
    } else if (theme === 'clean-paper') {
      bgGradStart = '#fbf9f4';
      bgGradEnd = '#f1ecdf';
      accentColor = '#b45309';
      textColor = '#18181b';
      subTextColor = '#71717a';
      cardBg = 'rgba(255, 255, 255, 0.8)';
      cardBorder = 'rgba(0, 0, 0, 0.1)';
    }

    // 1. Draw Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, bgGradStart);
    gradient.addColorStop(1, bgGradEnd);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle background mesh/circles
    ctx.save();
    ctx.fillStyle = accentColor;
    ctx.globalAlpha = 0.08;
    ctx.beginPath();
    ctx.arc(width * 0.85, height * 0.15, width * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width * 0.1, height * 0.85, width * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Outer Border Frame
    ctx.strokeStyle = cardBorder;
    ctx.lineWidth = width * 0.01;
    ctx.strokeRect(width * 0.04, height * 0.04, width * 0.92, height * 0.92);

    // 3. Header Branding: "FACTHUB • DAILY VERIFIED KNOWLEDGE"
    ctx.textAlign = 'left';
    ctx.fillStyle = accentColor;
    ctx.font = `bold ${Math.round(width * 0.032)}px sans-serif`;
    ctx.fillText(`FACTHUB • ${category.toUpperCase()}`, width * 0.08, height * 0.11);

    if (year) {
      ctx.textAlign = 'right';
      ctx.fillStyle = subTextColor;
      ctx.font = `bold ${Math.round(width * 0.03)}px monospace`;
      ctx.fillText(`YEAR ${year}`, width * 0.92, height * 0.11);
    }

    // Divider
    ctx.strokeStyle = cardBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width * 0.08, height * 0.14);
    ctx.lineTo(width * 0.92, height * 0.14);
    ctx.stroke();

    // 4. Center Main Fact Box
    const boxX = width * 0.08;
    const boxY = height * 0.18;
    const boxW = width * 0.84;
    const boxH = height * (aspectRatio === '9:16' ? 0.65 : 0.62);

    ctx.fillStyle = cardBg;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 24);
    ctx.fill();
    ctx.strokeStyle = cardBorder;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Emoji icon badge
    ctx.font = `${Math.round(width * 0.07)}px sans-serif`;
    ctx.fillText(emoji, boxX + 40, boxY + 70);

    // Category Pill
    ctx.fillStyle = accentColor;
    ctx.font = `bold ${Math.round(width * 0.024)}px sans-serif`;
    ctx.fillText(`VERIFIED HISTORICAL RECORD`, boxX + 40 + width * 0.09, boxY + 55);

    // 5. Title Text (Auto-wrapping)
    ctx.textAlign = 'left';
    ctx.fillStyle = textColor;
    const titleFontSize = Math.round(width * (aspectRatio === '9:16' ? 0.052 : 0.046));
    ctx.font = `bold ${titleFontSize}px serif`;

    const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines = 4) => {
      const words = text.split(' ');
      let line = '';
      let currentY = y;
      let lineCount = 0;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
          lineCount++;
          if (lineCount >= maxLines - 1 && n < words.length - 1) {
            line += '...';
            break;
          }
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, currentY);
      return currentY + lineHeight;
    };

    let nextY = wrapText(title, boxX + 40, boxY + 140, boxW - 80, titleFontSize * 1.3, 4);

    // 6. Excerpt / Summary Text
    ctx.fillStyle = subTextColor;
    const excerptFontSize = Math.round(width * (aspectRatio === '9:16' ? 0.032 : 0.028));
    ctx.font = `${excerptFontSize}px sans-serif`;

    const cleanExcerpt = (customSubtitle || excerpt || '')
      .replace(/\[(gold|coral|teal|indigo|red|green|blue|slate|purple)\]/gi, '')
      .replace(/\[\/(gold|coral|teal|indigo|red|green|blue|slate|purple)\]/gi, '')
      .replace(/#{1,6}\s+/g, '');

    wrapText(cleanExcerpt, boxX + 40, nextY + 30, boxW - 80, excerptFontSize * 1.5, aspectRatio === '9:16' ? 8 : 4);

    // 7. Footer Watermark & Call To Action
    ctx.textAlign = 'left';
    ctx.fillStyle = accentColor;
    ctx.font = `bold ${Math.round(width * 0.032)}px sans-serif`;
    ctx.fillText(`⚡ FActHub.app`, width * 0.08, height * 0.92);

    ctx.textAlign = 'right';
    ctx.fillStyle = subTextColor;
    ctx.font = `${Math.round(width * 0.024)}px sans-serif`;
    ctx.fillText(`Discover Today in History & Science`, width * 0.92, height * 0.92);
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        renderCard();
      }, 100);
    }
  }, [isOpen, aspectRatio, theme, customSubtitle, title, year, excerpt]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `FactHub-${category}-${year || 'card'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } catch (e) {
      console.warn("Clipboard copy not supported in this browser context", e);
      handleDownload();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-paper border border-black/10 rounded-3xl max-w-4xl w-full p-6 shadow-2xl relative my-auto animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gold/15 text-gold flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg font-serif font-black text-ink">Social Media Share Card Generator</h3>
              <p className="text-xs text-ink3">Export ultra-high-resolution graphics ready for Instagram, X, LinkedIn & Stories</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 text-ink3 hover:text-ink transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: Controls & Canvas Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
          
          {/* Controls Sidebar */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Aspect Ratio */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink3 mb-2 flex items-center gap-1.5">
                <Layers size={14} /> Aspect Ratio
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '1:1', label: '1:1 Square', sub: 'Instagram / Feed' },
                  { id: '9:16', label: '9:16 Story', sub: 'Reels / Status' },
                  { id: '16:9', label: '16:9 Wide', sub: 'X / LinkedIn' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setAspectRatio(item.id as AspectRatio)}
                    className={cn(
                      "p-2.5 rounded-2xl border text-left transition-all",
                      aspectRatio === item.id 
                        ? "border-gold bg-gold/10 font-bold text-ink shadow-xs" 
                        : "border-black/10 hover:border-black/20 text-ink2 bg-paper2"
                    )}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-ink3">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Themes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink3 mb-2 flex items-center gap-1.5">
                <Palette size={14} /> Color Palette & Theme
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'dark-gold', label: 'Dark Gold', color: '#eab308' },
                  { id: 'emerald-science', label: 'Emerald', color: '#10b981' },
                  { id: 'coral-history', label: 'Coral', color: '#f97316' },
                  { id: 'sapphire-tech', label: 'Sapphire', color: '#38bdf8' },
                  { id: 'clean-paper', label: 'Clean Paper', color: '#78350f' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as CardTheme)}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-xl border text-xs font-bold transition-all",
                      theme === t.id
                        ? "border-gold bg-gold/15 text-ink shadow-xs"
                        : "border-black/10 hover:border-black/20 text-ink2 bg-paper2"
                    )}
                  >
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: t.color }} />
                    <span className="truncate">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Subtitle / Caption */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink3 mb-1.5">
                Custom Highlight Text (Optional)
              </label>
              <textarea
                value={customSubtitle}
                onChange={(e) => setCustomSubtitle(e.target.value)}
                placeholder="Override default excerpt with your own customized study note or hook..."
                rows={2}
                className="w-full text-xs p-3 rounded-2xl bg-paper2 border border-black/10 focus:border-gold outline-none resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold/90 text-ink font-bold py-3 px-4 rounded-2xl transition-all shadow-md active:scale-98 text-sm"
              >
                <Download size={16} />
                <span>Download PNG Image (1080p)</span>
              </button>

              <button
                onClick={handleCopyImage}
                className="w-full flex items-center justify-center gap-2 bg-paper2 hover:bg-paper3 text-ink font-bold py-2.5 px-4 rounded-2xl border border-black/10 transition-all text-xs"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Image to Clipboard'}</span>
              </button>
            </div>

          </div>

          {/* Live Canvas Preview */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-black/5 rounded-2xl p-4 border border-black/10 overflow-hidden min-h-[380px]">
            <div className="w-full flex items-center justify-between pb-2 px-1 text-xs text-ink3">
              <span className="font-bold flex items-center gap-1">
                <Image size={14} /> Live Canvas Preview
              </span>
              <span className="font-mono text-[10px]">Ready to export</span>
            </div>

            <div className="max-h-[460px] max-w-full flex items-center justify-center overflow-auto p-2">
              <canvas
                ref={canvasRef}
                className="rounded-xl shadow-lg border border-black/20 max-w-full max-h-[420px] object-contain transition-all"
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
