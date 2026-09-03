import React, { useState, useEffect } from 'react';
import { Bell, BellRing, CheckCircle, AlertCircle, Sparkles, X, Shield, Clock } from 'lucide-react';
import { notificationService, NotificationSettings } from '../../services/notificationService';

interface NotificationReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationReminderModal: React.FC<NotificationReminderModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(notificationService.getSettings());
  const [permission, setPermission] = useState<NotificationPermission>(notificationService.getPermission());
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSettings(notificationService.getSettings());
      setPermission(notificationService.getPermission());
      setStatusMessage(null);
      setTestSent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleEnable = async () => {
    if (!settings.enabled) {
      setIsSubscribing(true);
      setStatusMessage(null);
      const res = await notificationService.requestPermissionAndSubscribe();
      setIsSubscribing(false);
      setPermission(notificationService.getPermission());
      if (res.success) {
        setSettings(notificationService.getSettings());
        setStatusMessage('Push reminders enabled successfully!');
      } else {
        setStatusMessage(res.error || 'Permission not granted.');
      }
    } else {
      const updated = { ...settings, enabled: false };
      setSettings(updated);
      notificationService.saveSettings(updated);
      setStatusMessage('Study reminders turned off.');
    }
  };

  const handleToggleTopic = (topic: 'studySheetReminder' | 'quizReminder') => {
    const updated = { ...settings, [topic]: !settings[topic] };
    setSettings(updated);
    notificationService.saveSettings(updated);
  };

  const handleSendTest = async () => {
    setTestSent(true);
    await notificationService.sendTestNotification();
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-3xl max-w-md w-full shadow-2xl p-6 relative overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-gold/10 dark:bg-gold/5 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold/15 dark:bg-gold/20 text-gold flex items-center justify-center">
              <BellRing size={20} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-ink dark:text-white">Daily Study Reminders</h3>
              <p className="text-xs text-ink3 dark:text-neutral-400">Firebase Cloud Messaging web-push</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-ink3 dark:text-neutral-400 hover:bg-paper2 dark:hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Master Toggle */}
        <div className="bg-paper dark:bg-[#222] border border-black/5 dark:border-white/5 rounded-2xl p-4 mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-ink dark:text-white">Push Notifications</div>
            <div className="text-xs text-ink3 dark:text-neutral-400">
              {permission === 'granted' 
                ? 'Browser notifications authorized' 
                : 'Receive prompts on this device'}
            </div>
          </div>
          <button
            onClick={handleToggleEnable}
            disabled={isSubscribing}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              settings.enabled && permission === 'granted'
                ? 'bg-sage text-white hover:bg-sage/90 shadow-xs'
                : 'bg-gold text-ink font-bold hover:bg-gold/90 shadow-xs'
            }`}
          >
            {isSubscribing ? (
              <span>Requesting...</span>
            ) : settings.enabled && permission === 'granted' ? (
              <>
                <CheckCircle size={14} />
                <span>Active</span>
              </>
            ) : (
              <>
                <Bell size={14} />
                <span>Enable Push</span>
              </>
            )}
          </button>
        </div>

        {/* Topics Customization */}
        <div className="space-y-3 mb-5">
          <div className="text-xs font-mono uppercase tracking-wider text-ink3 dark:text-neutral-400 font-bold">
            Reminder Schedules
          </div>

          <label className="flex items-center justify-between p-3 rounded-xl border border-black/5 dark:border-white/5 bg-paper2/50 dark:bg-neutral-800/40 cursor-pointer hover:border-gold/50 transition-colors">
            <div className="flex items-center gap-2.5">
              <Clock size={16} className="text-gold" />
              <div>
                <div className="text-xs font-bold text-ink dark:text-white">Daily Study Sheet (8:00 AM)</div>
                <div className="text-[11px] text-ink3 dark:text-neutral-400">Morning milestone capsules & vocabulary</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.studySheetReminder}
              onChange={() => handleToggleTopic('studySheetReminder')}
              className="accent-gold w-4 h-4 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-black/5 dark:border-white/5 bg-paper2/50 dark:bg-neutral-800/40 cursor-pointer hover:border-gold/50 transition-colors">
            <div className="flex items-center gap-2.5">
              <Sparkles size={16} className="text-coral" />
              <div>
                <div className="text-xs font-bold text-ink dark:text-white">Daily Streak Quiz (7:00 PM)</div>
                <div className="text-[11px] text-ink3 dark:text-neutral-400">Evening 5-question test & streak preservation</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.quizReminder}
              onChange={() => handleToggleTopic('quizReminder')}
              className="accent-gold w-4 h-4 rounded"
            />
          </label>
        </div>

        {statusMessage && (
          <div className="mb-4 text-xs p-2.5 rounded-xl bg-gold/10 dark:bg-gold/20 text-ink dark:text-neutral-200 border border-gold/20 flex items-center gap-2">
            <AlertCircle size={14} className="text-gold shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
          <button
            onClick={handleSendTest}
            className="text-xs font-bold text-ink3 dark:text-neutral-400 hover:text-gold transition-colors flex items-center gap-1.5"
          >
            <Bell size={13} />
            <span>{testSent ? 'Notification Sent! 🔔' : 'Send Test Notification'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-ink text-paper dark:bg-white dark:text-black rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
