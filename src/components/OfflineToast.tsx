import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const OfflineToast: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showRestored, setShowRestored] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setDismissed(false);
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setDismissed(false);
      setShowRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleCheckConnection = async () => {
    setIsChecking(true);
    try {
      // Ping health check or small endpoint with cache buster
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`/api/health?t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        setIsOnline(true);
        setShowRestored(true);
        setTimeout(() => setShowRestored(false), 3500);
      } else {
        setIsOnline(false);
      }
    } catch (e) {
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[999] max-w-md w-[calc(100vw-2.5rem)] pointer-events-none flex flex-col gap-2">
      <AnimatePresence>
        {/* Offline Warning Notification Toast */}
        {!isOnline && !dismissed && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="pointer-events-auto bg-ink text-white p-4 rounded-2xl border border-amber-500/40 shadow-2xl shadow-black/40 flex items-start gap-3 relative overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <WifiOff size={18} />
            </div>

            <div className="flex-1 space-y-1 pr-6">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <AlertTriangle size={13} />
                <span>Offline Mode Active</span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed font-sans">
                You’ve lost internet access. You can still browse cached facts, quizzes, and saved notebook entries offline.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCheckConnection}
                  disabled={isChecking}
                  className="px-3 py-1 bg-white/15 hover:bg-white/25 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <RefreshCw size={12} className={isChecking ? "animate-spin" : ""} />
                  <span>{isChecking ? "Checking..." : "Retry Connection"}</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="absolute top-3 right-3 p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              title="Dismiss warning"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}

        {/* Back Online Toast */}
        {showRestored && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="pointer-events-auto bg-emerald-950 text-white p-4 rounded-2xl border border-emerald-500/50 shadow-2xl shadow-emerald-950/40 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-emerald-400">Back Online</h4>
              <p className="text-xs text-emerald-100/80">Internet connection restored. Live features and syncing are active.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowRestored(false)}
              className="p-1 rounded-lg text-emerald-400/60 hover:text-emerald-300 hover:bg-emerald-800/30 transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
