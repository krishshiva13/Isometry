import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, FastForward, Globe, Sparkles, Settings2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface AudioNarrationPlayerProps {
  title: string;
  excerpt?: string;
  content: string;
  category?: string;
  hindiSummary?: string;
  examRelevance?: string;
}

export const AudioNarrationPlayer: React.FC<AudioNarrationPlayerProps> = ({
  title,
  excerpt,
  content,
  category,
  hindiSummary,
  examRelevance,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState<number>(1.0);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [isSupported, setIsSupported] = useState(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSentence, setCurrentSentence] = useState<string>('');

  const sentencesRef = useRef<string[]>([]);
  const currentSentenceIdxRef = useRef<number>(0);
  const keepAliveIntervalRef = useRef<any>(null);

  // Initialize SpeechSynthesis support & voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      // Find preferred natural voice
      if (!selectedVoice && voices.length > 0) {
        const langVoices = voices.filter(v => language === 'hi' ? v.lang.startsWith('hi') : v.lang.startsWith('en'));
        const preferred = langVoices.find(v => 
          v.name.includes('Google') || 
          v.name.includes('Natural') || 
          v.name.includes('Samantha') || 
          v.name.includes('Daniel') ||
          v.default
        ) || langVoices[0] || voices[0];

        setSelectedVoice(preferred);
      }
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (keepAliveIntervalRef.current) clearInterval(keepAliveIntervalRef.current);
    };
  }, [language]);

  // Clean Markdown & format text into manageable sentences for SpeechSynthesis
  const prepareSentences = (): string[] => {
    let rawText = '';
    if (language === 'hi' && hindiSummary) {
      rawText = `${title}। ${hindiSummary}`;
    } else {
      const cleanBody = content
        .replace(/\[(gold|coral|teal|indigo|red|green|blue|slate|purple)\]/gi, '')
        .replace(/\[\/(gold|coral|teal|indigo|red|green|blue|slate|purple)\]/gi, '')
        .replace(/#{1,6}\s+/g, '')
        .replace(/(\*\*|\*|__|_)/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/`{1,3}[^`]*`{1,3}/g, '')
        .replace(/<[^>]*>/g, '');

      rawText = `${title}. ${excerpt || ''}. ${cleanBody}`;
      if (examRelevance) {
        rawText += ` Key exam highlight: ${examRelevance}`;
      }
    }

    // Split by sentence boundaries (. ? ! । \n)
    const rawSentences = rawText
      .split(/(?<=[.?!।\n])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('http'));

    return rawSentences.length > 0 ? rawSentences : [title];
  };

  // Speak next chunk in sequence
  const speakSentence = (index: number) => {
    if (index >= sentencesRef.current.length) {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      setCurrentSentence('');
      if (keepAliveIntervalRef.current) clearInterval(keepAliveIntervalRef.current);
      return;
    }

    currentSentenceIdxRef.current = index;
    const text = sentencesRef.current[index];
    setCurrentSentence(text);
    setProgress(Math.round((index / sentencesRef.current.length) * 100));

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.0;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    }

    utterance.onend = () => {
      // Small pause between sentences
      setTimeout(() => {
        if (currentSentenceIdxRef.current === index) {
          speakSentence(index + 1);
        }
      }, 120);
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis segment warning:', e);
      // Auto advance on non-fatal error
      if (index + 1 < sentencesRef.current.length) {
        speakSentence(index + 1);
      } else {
        setIsPlaying(false);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePlay = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    sentencesRef.current = prepareSentences();
    currentSentenceIdxRef.current = 0;
    setIsPlaying(true);
    setIsPaused(false);

    // Chrome long-speech pause workaround: ping resume every 10s
    if (keepAliveIntervalRef.current) clearInterval(keepAliveIntervalRef.current);
    keepAliveIntervalRef.current = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);

    speakSentence(0);
  };

  const handlePause = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setCurrentSentence('');
    currentSentenceIdxRef.current = 0;
    if (keepAliveIntervalRef.current) clearInterval(keepAliveIntervalRef.current);
  };

  const toggleRate = () => {
    const rates = [0.85, 1.0, 1.25, 1.5];
    const nextIdx = (rates.indexOf(rate) + 1) % rates.length;
    const newRate = rates[nextIdx];
    setRate(newRate);

    if (isPlaying) {
      const currentIdx = currentSentenceIdxRef.current;
      window.speechSynthesis.cancel();
      setTimeout(() => {
        speakSentence(currentIdx);
      }, 50);
    }
  };

  const toggleLanguage = (lang: 'en' | 'hi') => {
    if (language === lang) return;
    handleStop();
    setLanguage(lang);
  };

  if (!isSupported) {
    return null;
  }

  const filteredVoices = availableVoices.filter(v => 
    language === 'hi' ? v.lang.startsWith('hi') : v.lang.startsWith('en')
  );

  return (
    <div 
      id="audio-narration-player" 
      className="bg-paper2 dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-sm my-6 transition-all"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-black/5 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
            isPlaying 
              ? "bg-gold text-ink shadow-md animate-pulse" 
              : "bg-gold/15 dark:bg-gold/20 text-gold"
          )}>
            <Volume2 size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-ink dark:text-white">Audio Narration (TTS)</h4>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gold/15 text-gold">
                SpeechSynthesis API
              </span>
            </div>
            <p className="text-xs text-ink3 dark:text-neutral-400">
              Listen to full verified facts and exam notes hands-free
            </p>
          </div>
        </div>

        {/* Language selector & Speed & Voice Settings */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center bg-paper3 dark:bg-[#252525] rounded-lg p-0.5 border border-black/5 dark:border-white/10">
            <button
              onClick={() => toggleLanguage('en')}
              className={cn(
                "px-2 py-1 rounded text-xs font-bold transition-all",
                language === 'en' 
                  ? "bg-white dark:bg-[#121212] text-ink dark:text-white shadow-2xs" 
                  : "text-ink3 dark:text-neutral-400 hover:text-ink dark:hover:text-white"
              )}
            >
              EN
            </button>
            <button
              onClick={() => toggleLanguage('hi')}
              className={cn(
                "px-2 py-1 rounded text-xs font-bold transition-all",
                language === 'hi' 
                  ? "bg-white dark:bg-[#121212] text-ink dark:text-white shadow-2xs" 
                  : "text-ink3 dark:text-neutral-400 hover:text-ink dark:hover:text-white"
              )}
            >
              हिन्दी
            </button>
          </div>

          <button
            onClick={toggleRate}
            className="px-2.5 py-1 rounded-lg bg-paper3 dark:bg-[#252525] hover:bg-black/5 dark:hover:bg-white/5 text-xs font-mono font-bold text-ink dark:text-white border border-black/5 dark:border-white/10 transition-all"
            title="Change Narration Speed"
          >
            {rate}x
          </button>

          {filteredVoices.length > 1 && (
            <button
              onClick={() => setShowVoicePicker(!showVoicePicker)}
              className="p-1.5 rounded-lg bg-paper3 dark:bg-[#252525] text-ink3 dark:text-neutral-400 hover:text-ink dark:hover:text-white border border-black/5 dark:border-white/10 transition-all"
              title="Select Voice"
            >
              <Settings2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Voice Picker Dropdown */}
      {showVoicePicker && filteredVoices.length > 0 && (
        <div className="py-2 border-b border-black/5 dark:border-white/10 mb-3 animate-in fade-in duration-150">
          <label className="text-[11px] font-bold text-ink3 dark:text-neutral-400 block mb-1">
            Select Browser Voice:
          </label>
          <select
            value={selectedVoice?.name || ''}
            onChange={(e) => {
              const v = availableVoices.find(voice => voice.name === e.target.value);
              if (v) setSelectedVoice(v);
            }}
            className="w-full text-xs p-1.5 bg-paper dark:bg-[#202020] border border-black/10 dark:border-white/10 rounded-lg text-ink dark:text-white"
          >
            {filteredVoices.map(voice => (
              <option key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Spoken sentence display */}
      {currentSentence && (
        <div className="my-2 p-2 bg-paper dark:bg-[#222] rounded-xl border border-black/5 dark:border-white/5 text-xs font-serif italic text-ink2 dark:text-neutral-300">
          "{currentSentence}"
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full bg-black/5 dark:bg-white/10 h-1.5 rounded-full overflow-hidden my-3">
        <div 
          className="bg-gold h-full transition-all duration-300 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Play Controls & Wave Animation */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <button
              onClick={handlePause}
              className="flex items-center gap-1.5 bg-ink text-paper dark:bg-white dark:text-black px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-sm"
            >
              <Pause size={14} />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={handlePlay}
              className="flex items-center gap-1.5 bg-gold text-ink px-4 py-2 rounded-xl text-xs font-bold hover:bg-gold/90 transition-all shadow-sm"
            >
              <Play size={14} fill="currentColor" />
              <span>{isPaused ? 'Resume' : 'Listen Now'}</span>
            </button>
          )}

          {(isPlaying || isPaused || progress > 0) && (
            <button
              onClick={handleStop}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-ink3 dark:text-neutral-400 hover:text-ink dark:hover:text-white transition-all"
              title="Stop & Reset"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>

        {/* Live Audio Visualizer Waves */}
        {isPlaying ? (
          <div className="flex items-center gap-1">
            <span className="w-1 h-3 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="w-1 h-6 bg-gold rounded-full animate-bounce" style={{ animationDelay: '75ms' }} />
            <span className="w-1 h-4 bg-gold rounded-full animate-bounce" style={{ animationDelay: '225ms' }} />
          </div>
        ) : (
          <span className="text-[11px] text-ink3 dark:text-neutral-400 font-medium">
            {language === 'hi' ? 'द्विभाषी अध्ययन विवरण' : 'Exam-Ready High-Yield Audio'}
          </span>
        )}
      </div>
    </div>
  );
};
