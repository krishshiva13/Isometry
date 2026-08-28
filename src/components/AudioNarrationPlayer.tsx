import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, FastForward, Globe, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface AudioNarrationPlayerProps {
  title: string;
  excerpt?: string;
  content: string;
  category?: string;
  hindiSummary?: string;
}

export const AudioNarrationPlayer: React.FC<AudioNarrationPlayerProps> = ({
  title,
  excerpt,
  content,
  category,
  hindiSummary
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState<number>(1.0);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [isSupported, setIsSupported] = useState(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [progress, setProgress] = useState(0);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressIntervalRef = useRef<any>(null);

  // Check speech synthesis support & load voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Auto-select preferred voice for chosen language
      const match = voices.find(v => language === 'hi' ? v.lang.startsWith('hi') : (v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.default)));
      if (match) setSelectedVoice(match);
      else if (voices.length > 0) setSelectedVoice(voices[0]);
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [language]);

  // Clean content of markdown tags for spoken audio
  const getSpokenText = () => {
    if (language === 'hi' && hindiSummary) {
      return `${title}। ${hindiSummary}`;
    }

    const cleanBody = content
      .replace(/\[(gold|coral|teal|indigo|red|green|blue|slate|purple)\]/gi, '')
      .replace(/\[\/(gold|coral|teal|indigo|red|green|blue|slate|purple)\]/gi, '')
      .replace(/#{1,6}\s+/g, '')
      .replace(/(\*\*|\*|__|_)/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .slice(0, 1800); // Speak first rich ~300 words smoothly

    return `${title}. ${excerpt || ''}. ${cleanBody}`;
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

    const textToSpeak = getSpokenText();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    utterance.rate = rate;
    utterance.pitch = 1.0;
    
    // Choose appropriate voice
    const voiceToUse = availableVoices.find(v => 
      language === 'hi' ? v.lang.startsWith('hi') : v.lang.startsWith('en')
    ) || selectedVoice;

    if (voiceToUse) {
      utterance.voice = voiceToUse;
      utterance.lang = voiceToUse.lang;
    } else {
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setProgress(0);
      
      const estimatedDurationSec = (textToSpeak.split(' ').length / (150 * rate)) * 60;
      const stepMs = 500;
      const stepPercent = (stepMs / (estimatedDurationSec * 1000)) * 100;
      
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => (prev < 95 ? prev + stepPercent : 95));
      }, stepMs);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis error", e);
      setIsPlaying(false);
      setIsPaused(false);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  const handleStop = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  const toggleRate = () => {
    const rates = [0.85, 1.0, 1.25, 1.5];
    const nextIdx = (rates.indexOf(rate) + 1) % rates.length;
    const newRate = rates[nextIdx];
    setRate(newRate);
    
    // If actively playing, restart with new rate
    if (isPlaying) {
      handleStop();
      setTimeout(() => {
        handlePlay();
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

  return (
    <div id="audio-narration-player" className="bg-gradient-to-r from-paper2 via-paper to-paper2 border border-black/10 rounded-2xl p-4 sm:p-5 shadow-sm my-6 transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
            isPlaying ? "bg-gold text-ink shadow-md animate-pulse" : "bg-gold/15 text-gold"
          )}>
            <Volume2 size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-ink">Audio Voiceover</h4>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gold/15 text-ink">AI Narrator</span>
            </div>
            <p className="text-xs text-ink3">Listen to this study capsule hands-free</p>
          </div>
        </div>

        {/* Language selector & Speed */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center bg-paper3 rounded-lg p-0.5 border border-black/5">
            <button
              onClick={() => toggleLanguage('en')}
              className={cn(
                "px-2 py-1 rounded text-xs font-bold transition-all",
                language === 'en' ? "bg-white text-ink shadow-xs" : "text-ink3 hover:text-ink"
              )}
            >
              EN
            </button>
            <button
              onClick={() => toggleLanguage('hi')}
              className={cn(
                "px-2 py-1 rounded text-xs font-bold transition-all",
                language === 'hi' ? "bg-white text-ink shadow-xs" : "text-ink3 hover:text-ink"
              )}
            >
              हिन्दी
            </button>
          </div>

          <button
            onClick={toggleRate}
            className="px-2.5 py-1 rounded-lg bg-paper3 hover:bg-black/5 text-xs font-mono font-bold text-ink border border-black/5 transition-all"
            title="Change Narration Speed"
          >
            {rate}x
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden my-3">
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
              className="flex items-center gap-1.5 bg-ink text-paper px-4 py-2 rounded-xl text-xs font-bold hover:bg-black transition-all shadow-sm"
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
              className="p-2 rounded-xl hover:bg-black/5 text-ink3 hover:text-ink transition-all"
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
          <span className="text-[11px] text-ink3 font-medium">
            {language === 'hi' ? 'द्विभाषी अध्ययन विवरण' : 'Exam-Ready High-Yield Audio'}
          </span>
        )}
      </div>
    </div>
  );
};
