import React, { useState, useEffect } from 'react';
import { 
  BookA, 
  Volume2, 
  Bookmark, 
  RotateCw, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Search, 
  ArrowRight, 
  ArrowLeft, 
  GraduationCap, 
  BookOpen,
  Check,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { VocabularyWord, BilingualTerm } from '../../types';
import { VocabularyWordCard } from './VocabularyWordCard';
import { vocabularyService, SavedVocabularyItem } from '../../services/vocabularyService';

interface ArticleVocabularySectionProps {
  vocabulary?: VocabularyWord[];
  bilingualTerms?: BilingualTerm[];
  articleTitle: string;
  articleId?: string;
}

export const ArticleVocabularySection: React.FC<ArticleVocabularySectionProps> = ({
  vocabulary = [],
  bilingualTerms = [],
  articleTitle,
  articleId
}) => {
  // Combine custom vocabulary words and bilingual terms if vocabulary list is sparse
  const initialWords: VocabularyWord[] = React.useMemo(() => {
    const list: VocabularyWord[] = [...(vocabulary || [])];
    
    // Convert bilingual terms to vocabulary words if not already present
    if (bilingualTerms && bilingualTerms.length > 0) {
      for (const term of bilingualTerms) {
        if (!list.some(w => w.word.toLowerCase() === term.termEn.toLowerCase())) {
          list.push({
            word: term.termEn,
            meaning: term.meaning,
            hindiMeaning: term.termHi,
            partOfSpeech: 'term'
          });
        }
      }
    }
    return list;
  }, [vocabulary, bilingualTerms]);

  const [activeTab, setActiveTab] = useState<'list' | 'flashcards' | 'lookup' | 'mybank'>('list');
  const [words, setWords] = useState<VocabularyWord[]>(initialWords);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Word lookup state
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<VocabularyWord | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState('');

  // My saved word bank state
  const [savedBank, setSavedBank] = useState<SavedVocabularyItem[]>(() => vocabularyService.getSavedWordBank());

  useEffect(() => {
    setWords(initialWords);
  }, [initialWords]);

  useEffect(() => {
    const handleUpdate = () => {
      setSavedBank(vocabularyService.getSavedWordBank());
    };
    window.addEventListener('facthub:vocab_updated', handleUpdate);
    return () => window.removeEventListener('facthub:vocab_updated', handleUpdate);
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;

    setIsLookingUp(true);
    setLookupError('');
    setLookupResult(null);

    // Check if word already exists in current list
    const foundInList = words.find(w => w.word.toLowerCase() === lookupQuery.trim().toLowerCase());
    if (foundInList) {
      setLookupResult(foundInList);
      setIsLookingUp(false);
      return;
    }

    try {
      const res = await vocabularyService.defineWordWithAI(lookupQuery.trim());
      if (res) {
        setLookupResult(res);
      } else {
        setLookupError(`Could not find a definition for "${lookupQuery}". Try another English word.`);
      }
    } catch {
      setLookupError('Lookup service temporarily unavailable. Please try again.');
    } finally {
      setIsLookingUp(false);
    }
  };

  const currentCard = words[currentFlashcardIndex];

  const handleSpeakCard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentCard) return;
    setIsSpeaking(true);
    await vocabularyService.speakWord(currentCard.word);
    setIsSpeaking(false);
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentFlashcardIndex((prev) => (prev + 1) % words.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentFlashcardIndex((prev) => (prev - 1 + words.length) % words.length);
  };

  if (words.length === 0 && savedBank.length === 0) {
    return null;
  }

  return (
    <section className="my-10 rounded-3xl bg-gradient-to-br from-paper via-paper2/50 to-teal-500/5 border border-black/10 shadow-sm overflow-hidden font-sans">
      {/* Header Bar */}
      <div className="p-5 sm:p-6 border-b border-black/5 bg-paper/60 backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-700 to-emerald-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
            <GraduationCap size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-lg sm:text-xl text-ink font-serif tracking-tight">
                Daily English Vocabulary Builder
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                {words.length} Words in this Story
              </span>
            </div>
            <p className="text-xs text-ink3 mt-0.5">
              Learn new English words every day with pronunciation, definitions, Hindi meanings, and flashcards.
            </p>
          </div>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center gap-1 bg-paper2 p-1 rounded-xl border border-black/5 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => { setActiveTab('list'); setIsCollapsed(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'list' && !isCollapsed
                ? 'bg-paper text-ink shadow-2xs'
                : 'text-ink3 hover:text-ink'
            }`}
          >
            <BookA size={14} className="text-teal-700" />
            <span>Word List</span>
          </button>

          {words.length > 0 && (
            <button
              onClick={() => { setActiveTab('flashcards'); setIsCollapsed(false); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'flashcards' && !isCollapsed
                  ? 'bg-paper text-ink shadow-2xs'
                  : 'text-ink3 hover:text-ink'
              }`}
            >
              <Layers size={14} className="text-gold" />
              <span>Flashcards</span>
            </button>
          )}

          <button
            onClick={() => { setActiveTab('lookup'); setIsCollapsed(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'lookup' && !isCollapsed
                ? 'bg-paper text-ink shadow-2xs'
                : 'text-ink3 hover:text-ink'
            }`}
          >
            <Search size={14} className="text-blue-600" />
            <span>Look Up</span>
          </button>

          <button
            onClick={() => { setActiveTab('mybank'); setIsCollapsed(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'mybank' && !isCollapsed
                ? 'bg-paper text-ink shadow-2xs'
                : 'text-ink3 hover:text-ink'
            }`}
          >
            <Bookmark size={14} className="text-emerald-600" />
            <span>My Vocab Bank ({savedBank.length})</span>
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand section" : "Collapse section"}
            className="p-1.5 text-ink3 hover:text-ink rounded-lg ml-1"
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {!isCollapsed && (
        <div className="p-5 sm:p-6">
          {/* TAB 1: WORD LIST */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {words.map((w, idx) => (
                  <VocabularyWordCard
                    key={`${w.word}-${idx}`}
                    vocab={w}
                    sourceArticleTitle={articleTitle}
                    sourceArticleId={articleId}
                  />
                ))}
              </div>

              {words.length > 0 && (
                <div className="p-3.5 bg-paper rounded-xl border border-black/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-gold flex-shrink-0" />
                    <span>
                      <strong>Daily Goal:</strong> Learn and review these {words.length} vocabulary words today to boost your reading and exam comprehension.
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('flashcards')}
                    className="px-3.5 py-1.5 rounded-lg bg-teal-700 text-white font-bold hover:bg-teal-800 transition-all flex items-center gap-1.5 flex-shrink-0 shadow-2xs"
                  >
                    <span>Practice Flashcards</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INTERACTIVE FLASHCARDS */}
          {activeTab === 'flashcards' && currentCard && (
            <div className="max-w-xl mx-auto space-y-5">
              <div className="flex items-center justify-between text-xs text-ink3 font-medium">
                <span>Card {currentFlashcardIndex + 1} of {words.length}</span>
                <span className="text-teal-700 font-bold">Tap Card to Flip & Reveal Meaning</span>
              </div>

              {/* Flip Flashcard Box */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className={`w-full min-h-[260px] p-6 sm:p-8 rounded-3xl border-2 transition-all duration-300 cursor-pointer shadow-md flex flex-col justify-between select-none relative group ${
                  isFlipped 
                    ? 'bg-paper text-ink border-teal-500/40 shadow-teal-500/10' 
                    : 'bg-gradient-to-br from-paper2 to-paper border-black/10 hover:border-gold/60'
                }`}
              >
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button
                    onClick={handleSpeakCard}
                    title="Pronounce"
                    className={`p-2 rounded-xl bg-paper border border-black/5 text-ink hover:text-gold transition-all ${
                      isSpeaking ? 'text-gold animate-pulse bg-gold/10' : ''
                    }`}
                  >
                    <Volume2 size={18} />
                  </button>
                  <span className="text-[11px] font-bold text-ink3 px-2 py-1 rounded-lg bg-paper border border-black/5 flex items-center gap-1">
                    <RotateCw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                    {isFlipped ? 'Answer' : 'Prompt'}
                  </span>
                </div>

                {!isFlipped ? (
                  // Front of Card
                  <div className="my-auto text-center space-y-3">
                    <span className="text-[11px] uppercase tracking-widest font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                      {currentCard.partOfSpeech || 'Word'}
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-serif font-bold text-ink tracking-tight capitalize">
                      {currentCard.word}
                    </h2>
                    {currentCard.phonetic && (
                      <p className="text-sm font-mono text-ink3">{currentCard.phonetic}</p>
                    )}
                    <p className="text-xs text-ink3 italic pt-2">
                      (Tap anywhere to reveal definition, Hindi meaning & example)
                    </p>
                  </div>
                ) : (
                  // Back of Card
                  <div className="my-auto space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-serif font-bold text-ink capitalize">
                        {currentCard.word}
                      </h3>
                      {currentCard.partOfSpeech && (
                        <span className="text-[10px] uppercase font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {currentCard.partOfSpeech}
                        </span>
                      )}
                    </div>

                    <p className="text-base text-ink leading-relaxed font-sans font-medium">
                      {currentCard.meaning}
                    </p>

                    {currentCard.hindiMeaning && (
                      <p className="text-sm text-coral font-semibold">
                        🇮🇳 हिन्दी: {currentCard.hindiMeaning}
                      </p>
                    )}

                    {currentCard.exampleSentence && (
                      <div className="p-3 bg-paper2 rounded-xl border-l-2 border-gold text-xs text-ink2 italic font-serif">
                        "{currentCard.exampleSentence}"
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t border-black/5 flex items-center justify-between text-xs text-ink3">
                  <span>💡 Tip: Say the word aloud 3 times</span>
                  <span className="font-semibold text-teal-700">Flip ↻</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={handlePrevCard}
                  className="px-4 py-2 rounded-xl bg-paper border border-black/10 hover:border-black/20 text-ink font-semibold text-xs flex items-center gap-1.5 shadow-2xs"
                >
                  <ArrowLeft size={14} />
                  <span>Previous</span>
                </button>

                <button
                  onClick={() => {
                    vocabularyService.saveWordToBank(currentCard, articleTitle, articleId);
                    handleNextCard();
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs hover:bg-emerald-800 transition-all"
                >
                  <Check size={14} />
                  <span>Mark Mastered & Next</span>
                </button>

                <button
                  onClick={handleNextCard}
                  className="px-4 py-2 rounded-xl bg-paper border border-black/10 hover:border-black/20 text-ink font-semibold text-xs flex items-center gap-1.5 shadow-2xs"
                >
                  <span>Next</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: INSTANT WORD LOOKUP */}
          {activeTab === 'lookup' && (
            <div className="max-w-xl mx-auto space-y-5">
              <form onSubmit={handleLookup} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink3" />
                  <input
                    type="text"
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    placeholder="Type any English word from the article (e.g. catalyst, resilient)..."
                    className="w-full pl-9 pr-4 py-2.5 bg-paper border border-black/10 focus:border-teal-500 rounded-xl text-xs sm:text-sm text-ink outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLookingUp || !lookupQuery.trim()}
                  className="px-4 py-2.5 bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm hover:bg-teal-800 disabled:opacity-50 transition-all shadow-2xs"
                >
                  {isLookingUp ? 'Searching...' : 'Define'}
                </button>
              </form>

              {lookupError && (
                <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs border border-rose-200">
                  {lookupError}
                </div>
              )}

              {lookupResult && (
                <div className="animate-in fade-in duration-200">
                  <VocabularyWordCard
                    vocab={lookupResult}
                    sourceArticleTitle={articleTitle}
                    sourceArticleId={articleId}
                  />
                </div>
              )}

              <div className="p-4 bg-paper rounded-2xl border border-black/5 text-xs text-ink3 space-y-1.5">
                <span className="font-bold text-ink block">🔍 Reading Assist Tip:</span>
                <p>
                  Found an unfamiliar word in this article? Type it above to instantly get its phonetic pronunciation, definition, Hindi translation, and add it to your daily vocabulary notebook!
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: MY SAVED WORD BANK */}
          {activeTab === 'mybank' && (
            <div className="space-y-4">
              {savedBank.length === 0 ? (
                <div className="p-8 text-center bg-paper rounded-2xl border border-dashed border-black/10 space-y-2">
                  <Bookmark size={28} className="mx-auto text-ink3 opacity-40" />
                  <h4 className="font-bold text-ink text-sm">Your Word Bank is Empty</h4>
                  <p className="text-xs text-ink3 max-w-sm mx-auto">
                    Click the bookmark icon on any vocabulary word to save it here for daily revision.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-ink3 font-medium">
                    <span>{savedBank.length} word(s) saved in your personal notebook</span>
                    <button
                      onClick={() => {
                        if (window.confirm('Clear all saved words from your vocabulary bank?')) {
                          localStorage.removeItem('facthub_saved_vocabulary');
                          setSavedBank([]);
                        }
                      }}
                      className="text-rose-600 hover:underline"
                    >
                      Clear Bank
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {savedBank.map((item, idx) => (
                      <div key={idx} className="relative">
                        <VocabularyWordCard vocab={item} compact={true} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
