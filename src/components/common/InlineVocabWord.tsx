import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Bookmark, X, BookOpen, ExternalLink } from 'lucide-react';
import { VocabularyWord } from '../../types';
import { vocabularyService } from '../../services/vocabularyService';

interface InlineVocabWordProps {
  word: string;
  meaning?: string;
  phonetic?: string;
  pos?: string;
  hindi?: string;
  example?: string;
  synonyms?: string[];
  children?: React.ReactNode;
}

export const InlineVocabWord: React.FC<InlineVocabWordProps> = ({
  word,
  meaning,
  phonetic,
  pos,
  hindi,
  example,
  synonyms,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSaved, setIsSaved] = useState(() => vocabularyService.isWordSaved(word));
  const [dynamicVocab, setDynamicVocab] = useState<VocabularyWord | null>(null);
  const [isLoadingDefine, setIsLoadingDefine] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  const handleOpen = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState && !meaning && !dynamicVocab && !isLoadingDefine) {
      setIsLoadingDefine(true);
      const res = await vocabularyService.defineWordWithAI(word);
      if (res) {
        setDynamicVocab(res);
      }
      setIsLoadingDefine(false);
    }
  };

  const handleSpeak = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSpeaking(true);
    await vocabularyService.speakWord(word);
    setIsSpeaking(false);
  };

  const activeMeaning = meaning || dynamicVocab?.meaning || 'Click definition to learn meaning.';
  const activePhonetic = phonetic || dynamicVocab?.phonetic;
  const activePos = pos || dynamicVocab?.partOfSpeech;
  const activeHindi = hindi || dynamicVocab?.hindiMeaning;
  const activeExample = example || dynamicVocab?.exampleSentence;
  const activeSynonyms = synonyms || dynamicVocab?.synonyms;

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const vocabObj: VocabularyWord = {
      word,
      meaning: activeMeaning,
      phonetic: activePhonetic,
      partOfSpeech: activePos,
      hindiMeaning: activeHindi,
      exampleSentence: activeExample,
      synonyms: activeSynonyms
    };

    if (isSaved) {
      vocabularyService.removeWordFromBank(word);
      setIsSaved(false);
    } else {
      vocabularyService.saveWordToBank(vocabObj);
      setIsSaved(true);
    }
  };

  return (
    <span className="relative inline-block not-prose">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        title={`Learn English definition of "${word}"`}
        className={`inline-flex items-center gap-0.5 px-1 py-0.2 -my-0.5 rounded transition-all font-medium cursor-pointer ${
          isOpen
            ? 'bg-gold/25 text-ink ring-2 ring-gold/40'
            : 'text-ink border-b-2 border-dashed border-teal-500 hover:bg-teal-500/10 hover:text-teal-900'
        }`}
      >
        <span>{children || word}</span>
        <span className="text-[10px] text-teal-700 font-bold opacity-75 select-none ml-0.5">🔤</span>
      </button>

      {/* Floating Definition Card */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 p-4 bg-paper text-ink rounded-2xl shadow-xl border border-black/10 animate-in fade-in zoom-in-95 duration-150 text-left font-sans text-xs"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-black/5">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-base capitalize text-ink font-serif">{word}</span>
                {activePos && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    {activePos}
                  </span>
                )}
              </div>
              {activePhonetic && (
                <span className="text-[11px] font-mono text-ink3">{activePhonetic}</span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleSpeak}
                disabled={isSpeaking}
                title="Pronounce"
                className={`p-1.5 rounded-lg text-ink2 hover:text-gold hover:bg-paper2 transition-colors ${
                  isSpeaking ? 'text-gold animate-pulse bg-gold/10' : ''
                }`}
              >
                <Volume2 size={15} />
              </button>
              <button
                onClick={handleToggleSave}
                title={isSaved ? 'Saved to Vocab Bank' : 'Save to Vocab Bank'}
                className={`p-1.5 rounded-lg transition-colors ${
                  isSaved ? 'text-emerald-700 bg-emerald-50' : 'text-ink3 hover:text-ink hover:bg-paper2'
                }`}
              >
                <Bookmark size={15} className={isSaved ? 'fill-emerald-600 text-emerald-600' : ''} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-ink3 hover:text-ink hover:bg-paper2"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Body */}
          {isLoadingDefine ? (
            <div className="py-3 text-center text-ink3 space-y-1">
              <div className="inline-block w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              <p className="text-[11px]">Looking up definition...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs leading-relaxed text-ink font-normal">
                <strong className="text-ink font-medium">Definition: </strong>
                {activeMeaning}
              </p>

              {activeHindi && (
                <div className="p-1.5 px-2 bg-coral/10 text-coral rounded-lg font-medium text-[11px]">
                  🇮🇳 हिन्दी: {activeHindi}
                </div>
              )}

              {activeExample && (
                <p className="p-2 bg-paper2 rounded-lg italic text-[11px] text-ink2 border-l border-gold">
                  "{activeExample}"
                </p>
              )}

              {activeSynonyms && activeSynonyms.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap text-[10px] text-ink3">
                  <span>Synonyms:</span>
                  {activeSynonyms.map((s, idx) => (
                    <span key={idx} className="bg-paper2 px-1.5 py-0.5 rounded border border-black/5 text-ink">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between text-[10px] text-ink3">
            <span className="flex items-center gap-1">
              <BookOpen size={11} className="text-teal-700" /> English Daily Builder
            </span>
            <span className={isSaved ? 'text-emerald-700 font-semibold' : ''}>
              {isSaved ? '✓ Saved to Notebook' : 'Tap bookmark to save'}
            </span>
          </div>

          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-3 h-3 bg-paper border-r border-b border-black/10 rotate-45" />
        </div>
      )}
    </span>
  );
};
