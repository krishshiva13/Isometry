import React, { useState, useEffect } from 'react';
import { X, Sparkles, BookOpen, Volume2, Check, BookA } from 'lucide-react';
import { VocabularyWord } from '../../types';
import { vocabularyService } from '../../services/vocabularyService';

interface InsertVocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (markdownSnippet: string, vocabObj?: VocabularyWord) => void;
  initialWord?: string;
}

export const InsertVocabularyModal: React.FC<InsertVocabularyModalProps> = ({
  isOpen,
  onClose,
  onInsert,
  initialWord = ''
}) => {
  const [word, setWord] = useState(initialWord);
  const [meaning, setMeaning] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState<string>('noun');
  const [hindiMeaning, setHindiMeaning] = useState('');
  const [exampleSentence, setExampleSentence] = useState('');
  const [synonyms, setSynonyms] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setWord(initialWord);
      if (initialWord) {
        handleAutoDefine(initialWord);
      }
    }
  }, [isOpen, initialWord]);

  const handleAutoDefine = async (targetWord: string = word) => {
    if (!targetWord.trim()) return;
    setIsLoadingAI(true);
    try {
      const res = await vocabularyService.defineWordWithAI(targetWord.trim());
      if (res) {
        setWord(res.word || targetWord);
        setMeaning(res.meaning || '');
        setPhonetic(res.phonetic || '');
        setPartOfSpeech(res.partOfSpeech || 'noun');
        setHindiMeaning(res.hindiMeaning || '');
        setExampleSentence(res.exampleSentence || '');
        setSynonyms((res.synonyms || []).join(', '));
      }
    } catch (err) {
      console.warn('Auto define error:', err);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handlePronounce = async () => {
    if (!word.trim()) return;
    setIsSpeaking(true);
    await vocabularyService.speakWord(word.trim());
    setIsSpeaking(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !meaning.trim()) return;

    const synArray = synonyms ? synonyms.split(',').map(s => s.trim()).filter(Boolean) : [];
    const cleanWord = word.trim();
    const cleanMeaning = meaning.trim().replace(/"/g, "'");
    const cleanPhonetic = phonetic.trim().replace(/"/g, "'");
    const cleanPos = partOfSpeech.trim();
    const cleanHindi = hindiMeaning.trim().replace(/"/g, "'");
    const cleanExample = exampleSentence.trim().replace(/"/g, "'");

    const attrs = [
      `meaning="${cleanMeaning}"`,
      cleanPhonetic ? `phonetic="${cleanPhonetic}"` : '',
      cleanPos ? `pos="${cleanPos}"` : '',
      cleanHindi ? `hindi="${cleanHindi}"` : '',
      cleanExample ? `example="${cleanExample}"` : '',
      synArray.length > 0 ? `synonyms="${synArray.join(',')}"` : ''
    ].filter(Boolean).join(' ');

    const snippet = `:::vocab[${cleanWord}]{${attrs}}:::`;

    const vocabObj: VocabularyWord = {
      word: cleanWord,
      meaning: cleanMeaning,
      phonetic: cleanPhonetic || undefined,
      partOfSpeech: cleanPos || undefined,
      hindiMeaning: cleanHindi || undefined,
      exampleSentence: cleanExample || undefined,
      synonyms: synArray.length > 0 ? synArray : undefined
    };

    onInsert(snippet, vocabObj);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-paper border border-black/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-black/10 bg-paper2/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-700 to-emerald-600 text-white flex items-center justify-center shadow-xs">
              <BookA size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-ink font-serif">
                Add English Vocabulary Word
              </h3>
              <p className="text-[11px] text-ink3">
                Embed an interactive definition popup with pronunciation in your story.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink3 hover:text-ink rounded-lg hover:bg-black/5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Word Input + AI Define Button */}
          <div>
            <label className="block text-ink font-bold mb-1.5">
              English Word / Term <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder="e.g. catalyst, profound, resilient..."
                  required
                  className="w-full px-3 py-2 bg-paper2 border border-black/10 focus:border-teal-500 rounded-xl text-ink font-serif text-sm font-semibold outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handlePronounce}
                disabled={isSpeaking || !word.trim()}
                title="Pronounce"
                className="px-3 py-2 bg-paper2 border border-black/10 text-ink hover:text-gold rounded-xl transition-colors"
              >
                <Volume2 size={16} className={isSpeaking ? 'animate-pulse text-gold' : ''} />
              </button>
              <button
                type="button"
                onClick={() => handleAutoDefine()}
                disabled={isLoadingAI || !word.trim()}
                className="px-3 py-2 bg-gradient-to-r from-gold/20 to-teal-500/20 text-ink border border-gold/40 hover:border-gold rounded-xl font-bold flex items-center gap-1 transition-all"
              >
                <Sparkles size={14} className="text-gold" />
                <span>{isLoadingAI ? 'Defining...' : 'AI Define'}</span>
              </button>
            </div>
          </div>

          {/* Part of speech + Phonetic */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-ink font-medium mb-1">Part of Speech</label>
              <select
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value)}
                className="w-full px-3 py-2 bg-paper2 border border-black/10 focus:border-teal-500 rounded-xl text-ink outline-none"
              >
                <option value="noun">Noun</option>
                <option value="verb">Verb</option>
                <option value="adjective">Adjective</option>
                <option value="adverb">Adverb</option>
                <option value="idiom">Idiom / Phrase</option>
                <option value="term">Scientific / Historical Term</option>
              </select>
            </div>

            <div>
              <label className="block text-ink font-medium mb-1">Phonetic Pronunciation</label>
              <input
                type="text"
                value={phonetic}
                onChange={(e) => setPhonetic(e.target.value)}
                placeholder="e.g. /ˈkæt.əl.ɪst/"
                className="w-full px-3 py-2 bg-paper2 border border-black/10 focus:border-teal-500 rounded-xl text-ink font-mono outline-none"
              />
            </div>
          </div>

          {/* Meaning / Definition */}
          <div>
            <label className="block text-ink font-bold mb-1">
              English Meaning / Definition <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="Clear, simple definition suitable for English learners..."
              required
              className="w-full px-3 py-2 bg-paper2 border border-black/10 focus:border-teal-500 rounded-xl text-ink outline-none resize-none"
            />
          </div>

          {/* Hindi Meaning */}
          <div>
            <label className="block text-ink font-medium mb-1">
              Hindi Translation / Meaning (Optional)
            </label>
            <input
              type="text"
              value={hindiMeaning}
              onChange={(e) => setHindiMeaning(e.target.value)}
              placeholder="e.g. उत्प्रेरक, परिवर्तन लाने वाला कारक"
              className="w-full px-3 py-2 bg-paper2 border border-black/10 focus:border-teal-500 rounded-xl text-ink outline-none"
            />
          </div>

          {/* Example Sentence */}
          <div>
            <label className="block text-ink font-medium mb-1">
              Example Sentence in Context (Optional)
            </label>
            <input
              type="text"
              value={exampleSentence}
              onChange={(e) => setExampleSentence(e.target.value)}
              placeholder="e.g. The invention acted as a catalyst for the Industrial Revolution."
              className="w-full px-3 py-2 bg-paper2 border border-black/10 focus:border-teal-500 rounded-xl text-ink outline-none italic"
            />
          </div>

          {/* Synonyms */}
          <div>
            <label className="block text-ink font-medium mb-1">
              Synonyms (Comma-separated, optional)
            </label>
            <input
              type="text"
              value={synonyms}
              onChange={(e) => setSynonyms(e.target.value)}
              placeholder="e.g. spark, trigger, accelerator"
              className="w-full px-3 py-2 bg-paper2 border border-black/10 focus:border-teal-500 rounded-xl text-ink outline-none"
            />
          </div>

          {/* Live Preview */}
          {word.trim() && meaning.trim() && (
            <div className="p-3 bg-paper2/70 rounded-2xl border border-black/5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider block">
                Preview In-Text Hover Card:
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-ink capitalize">{word}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 uppercase font-bold">
                  {partOfSpeech}
                </span>
                {phonetic && <span className="text-[11px] font-mono text-ink3">{phonetic}</span>}
              </div>
              <p className="text-xs text-ink">{meaning}</p>
              {hindiMeaning && <p className="text-[11px] text-coral font-medium">🇮🇳 {hindiMeaning}</p>}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-black/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-ink3 hover:text-ink font-medium hover:bg-black/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!word.trim() || !meaning.trim()}
              className="px-5 py-2 rounded-xl bg-teal-700 text-white font-bold hover:bg-teal-800 transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-2xs"
            >
              <Check size={14} />
              <span>Insert Word Directive</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
