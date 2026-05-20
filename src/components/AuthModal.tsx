import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Phone, Lock, User, ArrowRight, ShieldCheck, Github } from 'lucide-react';
import { authService } from '../services/authService';
import { cn } from '../lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'signup' | 'phone';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) {
      setError('');
      setConfirmationResult(null);
      setOtp('');
    }
  }, [isOpen]);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await authService.signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await authService.signInWithEmail(email, password);
      } else {
        await authService.signUpWithEmail(email, password, name);
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone.startsWith('+')) {
      setError('Please include country code (e.g. +91)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const verifier = authService.setupRecaptcha('recaptcha-container');
      const result = await authService.sendOtp(phone, verifier);
      setConfirmationResult(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');
    try {
      await authService.verifyOtp(confirmationResult, otp);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-paper rounded-[32px] shadow-2xl overflow-hidden"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-ink3 hover:text-ink transition-colors z-10"
            >
              <X size={24} />
            </button>

            <div className="p-8 lg:p-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gold/10 text-gold mb-4">
                  <ShieldCheck size={28} />
                </div>
                <h2 className="text-2xl font-serif font-black text-ink">
                  {mode === 'login' ? 'Welcome Back' : mode === 'phone' ? 'Phone Verification' : 'Create Account'}
                </h2>
                <p className="text-sm text-ink3 mt-2">
                  {mode === 'login' ? 'Ready for your daily dose of facts?' : 'Join our community of curious minds.'}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-coral/10 text-coral text-xs font-bold rounded-xl border border-coral/20">
                  {error}
                </div>
              )}

              <div id="recaptcha-container"></div>

              {mode === 'phone' ? (
                <div className="space-y-4">
                  {!confirmationResult ? (
                    <>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-ink3" size={18} />
                        <input 
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full bg-white border border-black/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-gold transition-all"
                        />
                      </div>
                      <button 
                        onClick={handleSendOtp}
                        disabled={loading}
                        className="w-full bg-ink text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gold transition-all disabled:opacity-50"
                      >
                        {loading ? 'Sending OTP...' : 'Send OTP'} <ArrowRight size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink3" size={18} />
                        <input 
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter 6-digit OTP"
                          className="w-full bg-white border border-black/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-gold transition-all"
                        />
                      </div>
                      <button 
                        onClick={handleVerifyOtp}
                        disabled={loading || otp.length < 6}
                        className="w-full bg-gold text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gold/90 transition-all disabled:opacity-50"
                      >
                        {loading ? 'Verifying...' : 'Verify & Continue'}
                      </button>
                      <button 
                        onClick={() => setConfirmationResult(null)}
                        className="w-full text-xs font-bold text-ink3 hover:text-ink transition-colors"
                      >
                        Change Phone Number
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'signup' && (
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-ink3" size={18} />
                      <input 
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full bg-white border border-black/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-gold transition-all font-medium"
                      />
                    </div>
                  )}
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink3" size={18} />
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full bg-white border border-black/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-gold transition-all font-medium"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink3" size={18} />
                    <input 
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-white border border-black/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-gold transition-all font-medium"
                    />
                  </div>
                  <button 
                    disabled={loading}
                    className="w-full bg-ink text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gold transition-all disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
                  </button>
                </form>
              )}

              <div className="mt-8">
                <div className="relative flex items-center justify-center mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-black/5"></div>
                  </div>
                  <span className="relative px-4 bg-paper text-[10px] font-bold text-ink3 uppercase tracking-widest">Or continue with</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={handleGoogle}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-black/10 rounded-xl text-sm font-bold hover:bg-paper2 transition-colors"
                  >
                     <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                     Google
                  </button>
                  <button 
                    onClick={() => setMode(mode === 'phone' ? 'login' : 'phone')}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-black/10 rounded-xl text-sm font-bold hover:bg-paper2 transition-colors"
                  >
                    <Phone size={16} />
                    Phone
                  </button>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-ink3">
                  {mode === 'signup' ? 'Already have an account?' : 'New to FActHub?'}
                  <button 
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="ml-2 font-bold text-gold hover:underline"
                  >
                    {mode === 'login' ? 'Create one now' : 'Sign in here'}
                  </button>
                </p>
              </div>
              
              <p className="mt-8 text-[10px] text-ink3 leading-relaxed">
                By continuing, you agree to FActHub's <Link to="/privacy" className="underline">Privacy Policy</Link> and <Link to="/" className="underline">Terms of Service</Link>. We follow Google data policy and International Laws regarding user data security.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
