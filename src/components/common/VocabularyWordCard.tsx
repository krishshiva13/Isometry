import React, { useState } from 'react';
import { Volume2, Bookmark, Check, BookOpen, Sparkles, Copy } from 'lucide-react';
import { VocabularyWord } from '../../types';
import { vocabularyService } from '../../services/vocabularyService';

interface VocabularyWordCardProps {
  vocab: VocabularyWord;
  sourceArticleTitle?: string;
  sourceArticleId?: string;
  onSavedChange?: (isSaved: boolean) => void;
  compact?: boolean;
}

export const VocabularyWordCard: React.FC<VocabularyWordCardProps> = ({
  vocab,
  sourceArticleTitle,
  sourceArticleId,
  onSavedChange,
  compact = false
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSaved, setIsSaved] = useState(() => vocabularyService.isWordSaved(vocab.word));
  const [copied, setCopied] = useState(false);

  const handleSpeak = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSpeaking(true);
    await vocabularyService.speakWord(vocab.word);
    setIsSpeaking(false);
  };

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      vocabularyService.removeWordFromBank(vocab.word);
      setIsSaved(false);
      onSavedChange?.(false);
    } else {
      vocabularyService.saveWordToBank(vocab, sourceArticleTitle, sourceArticleId);
      setIsSaved(true);
      onSavedChange?.(true);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `📖 Word: ${vocab.word} ${vocab.phonetic || ''} [${vocab.partOfSpeech || 'term'}]\n💡 Meaning: ${vocab.meaning}${vocab.hindiMeaning ? `\n🇮🇳 Hindi: ${vocab.hindiMeaning}` : ''}${vocab.exampleSentence ? `\n📝 Example: "${vocab.exampleSentence}"` : ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPosBadgeColor = (pos?: string) => {
    const p = (pos || '').toLowerCase();
    if (p.includes('noun')) return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/50';
    if (p.includes('verb')) return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50';
    if (p.includes('adj')) return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700/50';
    if (p.includes('adv')) return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50';
    if (p.includes('idiom') || p.includes('phrase')) return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700/50';
    return 'bg-paper3 text-ink2 border-black/10';
  };

  if (compact) {
    return (
      <div className="p-3.5 bg-paper rounded-xl border border-black/8 hover:border-gold/50 transition-all shadow-2xs group flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-ink text-base tracking-tight capitalize font-sans">{vocab.word}</span>
              {vocab.partOfSpeech && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getPosBadgeColor(vocab.partOfSpeech)}`}>
                  {vocab.partOfSpeech}
                </span>
              )}
            </div>
            <button
              onClick={handleSpeak}
              disabled={isSpeaking}
              title="Pronounce Word"
              className={`p-1.5 rounded-lg text-ink3 hover:text-gold hover:bg-gold/10 transition-colors ${isSpeaking ? 'text-gold animate-pulse bg-gold/10' : ''}`}
            >
              <Volume2 size={15} />
            </button>
          </div>

          {vocab.phonetic && (
            <p className="text-[11px] font-mono text-ink3 mb-1.5">{vocab.phonetic}</p>
          )}

          <p className="text-xs text-ink leading-relaxed font-sans line-clamp-2">{vocab.meaning}</p>
          {vocab.hindiMeaning && (
            <p className="text-[11px] text-coral font-medium mt-1">🇮🇳 {vocab.hindiMeaning}</p>
          )}
        </div>

        <div className="mt-3 pt-2.5 border-t border-black/5 flex items-center justify-between">
          <button
            onClick={handleToggleSave}
            className={`text-[11px] font-medium flex items-center gap-1 transition-colors ${
              isSaved ? 'text-emerald-700 font-bold' : 'text-ink3 hover:text-ink'
            }`}
          >
            <Bookmark size={13} className={isSaved ? 'fill-emerald-700 text-emerald-700' : ''} />
            <span>{isSaved ? 'Saved' : 'Save to Vocab Bank'}</span>
          </button>
          <button
            onClick={handleCopy}
            title="Copy Word Card"
            className="text-[11px] text-ink3 hover:text-gold flex items-center gap-1"
          >
            {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 bg-paper rounded-2xl border border-black/8 hover:border-gold/50 transition-all shadow-xs hover:shadow-md flex flex-col justify-between relative overflow-hidden group">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gold/10 via-teal-500/5 to-transparent rounded-bl-full pointer-events-none" />

      <div>
        {/* Header row: Word, Phonetic, Part of Speech, Action buttons */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-lg sm:text-xl text-ink tracking-tight font-serif capitalize">
                {vocab.word}
              </h4>
              {vocab.partOfSpeech && (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider font-sans ${getPosBadgeColor(vocab.partOfSpeech)}`}>
                  {vocab.partOfSpeech}
                </span>
              )}
            </div>
            {vocab.phonetic && (
              <p className="text-xs font-mono text-ink3 flex items-center gap-1">
                <span>{vocab.phonetic}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 bg-paper2/80 p-1 rounded-xl border border-black/5">
            <button
              onClick={handleSpeak}
              disabled={isSpeaking}
              title="Pronounce Word"
              className={`p-2 rounded-lg text-ink2 hover:text-gold hover:bg-paper transition-all ${
                isSpeaking ? 'text-gold bg-gold/15 animate-pulse scale-105' : ''
              }`}
            >
              <Volume2 size={16} />
            </button>
            <button
              onClick={handleToggleSave}
              title={isSaved ? 'Saved to Your Word Bank' : 'Save to Vocab Bank'}
              className={`p-2 rounded-lg transition-all ${
                isSaved ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : 'text-ink3 hover:text-ink hover:bg-paper'
              }`}
            >
              <Bookmark size={16} className={isSaved ? 'fill-emerald-600 text-emerald-600' : ''} />
            </button>
            <button
              onClick={handleCopy}
              title="Copy Word & Definition"
              className="p-2 rounded-lg text-ink3 hover:text-gold hover:bg-paper transition-all"
            >
              {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {/* Meaning section */}
        <div className="space-y-2 mb-3">
          <p className="text-sm sm:text-base text-ink leading-relaxed font-sans">
            <span className="font-medium text-ink2">Meaning: </span>
            {vocab.meaning}
          </p>

          {vocab.hindiMeaning && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-coral/10 text-coral border border-coral/20 text-xs font-medium font-sans">
              <span>🇮🇳 हिन्दी अर्थ:</span>
              <span className="font-bold">{vocab.hindiMeaning}</span>
            </div>
          )}
        </div>

        {/* Synonyms if provided */}
        {vocab.synonyms && vocab.synonyms.length > 0 && (
          <div className="mb-3 flex items-center gap-1.5 flex-wrap text-xs text-ink3 font-sans">
            <span className="font-medium text-ink2 flex items-center gap-1">
              <Sparkles size={12} className="text-gold" /> Synonyms:
            </span>
            {vocab.synonyms.map((syn, i) => (
              <span key={i} className="px-2 py-0.5 bg-paper2 rounded-md border border-black/5 text-ink text-xs">
                {syn}
              </span>
            ))}
          </div>
        )}

        {/* Example sentence */}
        {vocab.exampleSentence && (
          <div className="p-3 bg-paper2/90 rounded-xl border-l-2 border-gold text-xs sm:text-sm text-ink2 font-serif italic mb-2">
            <span className="not-italic font-sans text-[11px] font-bold uppercase text-ink3 tracking-wider block mb-0.5">
              In Context:
            </span>
            "{vocab.exampleSentence}"
          </div>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-black/5 flex items-center justify-between text-[11px] text-ink3 font-sans">
        <span className="flex items-center gap-1">
          <BookOpen size={12} className="text-teal-700" /> Daily English Builder
        </span>
        <span className={isSaved ? 'text-emerald-700 font-bold' : 'text-ink3'}>
          {isSaved ? '✓ Saved to your bank' : 'Click bookmark to save'}
        </span>
      </div>
    </div>
  );
};
