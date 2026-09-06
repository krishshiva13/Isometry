import React, { useState } from 'react';
import { Twitter, Linkedin, Share2, Copy, Check, Send, Sparkles } from 'lucide-react';

interface SocialShareToolbarProps {
  title: string;
  excerpt?: string;
  category?: string;
  url?: string;
  tags?: string[];
}

export const SocialShareToolbar: React.FC<SocialShareToolbarProps> = ({
  title,
  excerpt = '',
  category = 'Knowledge',
  url = typeof window !== 'undefined' ? window.location.href : '',
  tags = []
}) => {
  const [copied, setCopied] = useState(false);

  const cleanUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const cleanTitle = title || 'Check out this fascinating fact on FActHub';
  const cleanExcerpt = excerpt ? `${excerpt.substring(0, 140)}...` : '';
  const hashTagList = ['FActHub', category.replace(/[^a-zA-Z0-9]/g, ''), ...(tags.slice(0, 2).map(t => t.replace(/[^a-zA-Z0-9]/g, '')))].filter(Boolean).join(',');

  const handleShareTwitter = () => {
    const tweetText = `💡 "${cleanTitle}"\n\n${cleanExcerpt}\n\nExplore on @FActHubApp:`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(cleanUrl)}&hashtags=${encodeURIComponent(hashTagList)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=450');
  };

  const handleShareLinkedIn = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(cleanUrl)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=550');
  };

  const handleShareWhatsApp = () => {
    const waText = `💡 *${cleanTitle}*\n\n${cleanExcerpt}\n\nRead more on FActHub: ${cleanUrl}`;
    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cleanUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: cleanTitle,
          text: cleanExcerpt,
          url: cleanUrl
        });
      } catch {
        // User dismissed share dialog
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="mt-12 bg-white rounded-3xl border border-black/10 p-6 sm:p-8 shadow-xs not-prose space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-ink3 flex items-center gap-1.5">
              <Share2 size={15} className="text-gold" />
              Spread the Knowledge
            </span>
            <span className="text-[10px] font-mono font-bold bg-amber-50 text-gold px-2 py-0.5 rounded-full border border-amber-200">
              One-Click Share
            </span>
          </div>
          <h3 className="font-serif font-black text-lg text-ink mt-1">
            Share this story with fellow learners & aspirants
          </h3>
        </div>

        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="self-start sm:self-auto text-xs font-bold text-ink bg-paper2 hover:bg-gold/15 px-3 py-1.5 rounded-xl border border-black/5 transition-colors flex items-center gap-1.5"
            title="Open device native sharing"
          >
            <Sparkles size={13} className="text-gold" />
            <span>More Apps</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* WhatsApp */}
        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#25D366] text-white font-bold text-xs sm:text-sm hover:opacity-95 active:scale-[0.98] transition-all shadow-xs"
          title="Share to WhatsApp status or chat"
        >
          <Send size={16} fill="white" className="shrink-0" />
          <span>WhatsApp</span>
        </button>

        {/* Twitter / X */}
        <button
          type="button"
          onClick={handleShareTwitter}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-black text-white font-bold text-xs sm:text-sm hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-xs"
          title="Share post on Twitter / X"
        >
          <Twitter size={16} fill="white" className="shrink-0" />
          <span>Twitter / X</span>
        </button>

        {/* LinkedIn */}
        <button
          type="button"
          onClick={handleShareLinkedIn}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#0A66C2] text-white font-bold text-xs sm:text-sm hover:opacity-95 active:scale-[0.98] transition-all shadow-xs"
          title="Share article on LinkedIn"
        >
          <Linkedin size={16} fill="white" className="shrink-0" />
          <span>LinkedIn</span>
        </button>

        {/* Copy Link */}
        <button
          type="button"
          onClick={handleCopyLink}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all border shadow-xs ${
            copied
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-paper2 text-ink hover:bg-paper3 border-black/10'
          }`}
          title="Copy article link to clipboard"
        >
          {copied ? (
            <>
              <Check size={16} className="text-emerald-600 shrink-0" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={16} className="text-ink3 shrink-0" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>

      <p className="text-[11px] text-ink3 text-center sm:text-left">
        Tip: Sharing verified facts helps curb misinformation and elevates static GK preparation for competitive exams.
      </p>
    </div>
  );
};
