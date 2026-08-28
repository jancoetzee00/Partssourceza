import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  X, 
  CheckCircle2, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const AdminAuthModal: React.FC = () => {
  const { 
    isAdminAuthModalOpen, 
    setIsAdminAuthModalOpen, 
    authenticateAdmin,
    isAdminAuthenticated,
    setRole
  } = useApp();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdminAuthModalOpen) {
      setPassword('');
      setErrorMessage('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isAdminAuthModalOpen]);

  if (!isAdminAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage('Please enter the administrator password.');
      return;
    }

    setIsSubmitting(true);
    const success = authenticateAdmin(password);
    setIsSubmitting(false);

    if (success) {
      setPassword('');
      setErrorMessage('');
    } else {
      setErrorMessage('Incorrect password. Master administrator access denied.');
      setPassword('');
      inputRef.current?.focus();
    }
  };

  const handleClose = () => {
    setPassword('');
    setErrorMessage('');
    setIsAdminAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Background Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 flex-shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Restricted Access
              </span>
            </div>
            <h3 className="text-lg font-black text-white tracking-tight mt-0.5">
              Admin Hub Authorization
            </h3>
            <p className="text-xs text-slate-400">
              Part Source ZA Platform Master Control
            </p>
          </div>
        </div>

        {/* Security Warning Notice */}
        <div className="mb-6 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <p className="font-semibold text-white">Owner & Administrator Access Only</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Please enter the master password to access system banking details, scrap yard listings, supplier subscriptions, user accounts, and financial controls.
            </p>
          </div>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                Master Admin Password
              </span>
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Enter password to unlock..."
                className={`w-full pl-4 pr-11 py-3 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                  errorMessage
                    ? 'border-red-500/80 focus:ring-2 focus:ring-red-500/30'
                    : 'border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                }`}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errorMessage && (
              <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5 font-medium animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </p>
            )}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Admin Hub</span>
            </button>
          </div>
        </form>

        {/* Footer Security Badge */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            256-bit Encrypted Session
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            Auth Level: Super Admin
          </span>
        </div>
      </div>
    </div>
  );
};
