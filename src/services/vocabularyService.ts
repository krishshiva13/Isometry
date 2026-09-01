import { VocabularyWord } from '../types';

export interface SavedVocabularyItem extends VocabularyWord {
  savedAt: string;
  sourceArticleId?: string;
  sourceArticleTitle?: string;
  mastered?: boolean;
}

const VOCAB_STORAGE_KEY = 'facthub_saved_vocabulary';

export const vocabularyService = {
  // Text-to-speech pronunciation
  speakWord: (word: string, lang: string = 'en-US'): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported on this browser.');
        resolve(false);
        return;
      }

      try {
        window.speechSynthesis.cancel(); // Stop any pending speech
        const cleanWord = word.replace(/[^a-zA-Z\s-]/g, '').trim();
        const utterance = new SpeechSynthesisUtterance(cleanWord);
        utterance.lang = lang;
        utterance.rate = 0.85; // Slightly slower for clear educational pronunciation
        utterance.pitch = 1.0;

        // Try to pick a natural English voice if available
        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find(v => (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')))) || voices.find(v => v.lang.startsWith('en'));
        if (enVoice) {
          utterance.voice = enVoice;
        }

        utterance.onend = () => resolve(true);
        utterance.onerror = () => resolve(false);
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error('Speech error:', e);
        resolve(false);
      }
    });
  },

  // Saved vocabulary bank management
  getSavedWordBank: (): SavedVocabularyItem[] => {
    try {
      const raw = localStorage.getItem(VOCAB_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveWordToBank: (wordObj: VocabularyWord, sourceArticleTitle?: string, sourceArticleId?: string): SavedVocabularyItem[] => {
    try {
      const bank = vocabularyService.getSavedWordBank();
      const existingIdx = bank.findIndex(i => i.word.toLowerCase() === wordObj.word.toLowerCase());
      
      const newItem: SavedVocabularyItem = {
        ...wordObj,
        savedAt: new Date().toISOString(),
        sourceArticleId: sourceArticleId || undefined,
        sourceArticleTitle: sourceArticleTitle || undefined,
        mastered: false
      };

      let updated: SavedVocabularyItem[];
      if (existingIdx !== -1) {
        updated = [...bank];
        updated[existingIdx] = { ...bank[existingIdx], ...newItem };
      } else {
        updated = [newItem, ...bank];
      }

      localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('facthub:vocab_updated', { detail: updated }));
      return updated;
    } catch (err) {
      console.error('Failed to save word to bank:', err);
      return [];
    }
  },

  removeWordFromBank: (word: string): SavedVocabularyItem[] => {
    try {
      const bank = vocabularyService.getSavedWordBank();
      const updated = bank.filter(i => i.word.toLowerCase() !== word.toLowerCase());
      localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('facthub:vocab_updated', { detail: updated }));
      return updated;
    } catch {
      return [];
    }
  },

  isWordSaved: (word: string): boolean => {
    const bank = vocabularyService.getSavedWordBank();
    return bank.some(i => i.word.toLowerCase() === word.toLowerCase());
  },

  toggleMastered: (word: string): SavedVocabularyItem[] => {
    try {
      const bank = vocabularyService.getSavedWordBank();
      const updated = bank.map(i => {
        if (i.word.toLowerCase() === word.toLowerCase()) {
          return { ...i, mastered: !i.mastered };
        }
        return i;
      });
      localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('facthub:vocab_updated', { detail: updated }));
      return updated;
    } catch {
      return [];
    }
  },

  // AI-powered dynamic word definition or article vocabulary extraction
  defineWordWithAI: async (word: string, contextSentence?: string): Promise<VocabularyWord | null> => {
    try {
      const res = await fetch('/api/vocabulary/define', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, contextSentence })
      });
      if (res.ok) {
        const data = await res.json();
        return data.vocabularyWord || null;
      }
    } catch (err) {
      console.warn('AI definition lookup error:', err);
    }
    return null;
  },

  extractArticleVocabularyWithAI: async (articleText: string, title?: string): Promise<VocabularyWord[]> => {
    try {
      const res = await fetch('/api/vocabulary/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleText, title })
      });
      if (res.ok) {
        const data = await res.json();
        return data.words || [];
      }
    } catch (err) {
      console.warn('AI vocabulary extraction error:', err);
    }
    return [];
  }
};
