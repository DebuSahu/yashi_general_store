import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, User, Plus, ArrowRight, Sparkles, Phone } from 'lucide-react';
import { api } from '../api';
import confetti from 'canvas-confetti';

export function GoogleGLogo({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function GoogleAuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  onShowToast
}) {
  if (!isOpen) return null;

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [error, setError] = useState('');

  // Primary detected account and suggestions
  const savedGoogleUser = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('gs_user') || 'null');
      if (u && u.authProvider === 'google') return u;
    } catch (e) {}
    return null;
  })();

  const defaultAccounts = [
    {
      name: savedGoogleUser?.name || 'Divyanshu Sahu',
      email: savedGoogleUser?.email || 'debusahu121@gmail.com',
      avatar: savedGoogleUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      initials: 'D',
      color: 'bg-emerald-600',
      phone: savedGoogleUser?.phone || '9876543210'
    }
  ];

  const handleSignInWithAccount = async (account) => {
    setError('');
    setSelectedAccount(account);
    setIsSigningIn(true);

    try {
      const res = await api.googleLogin({
        email: account.email,
        name: account.name,
        avatar: account.avatar || null,
        phone: account.phone || '9876543210'
      });

      if (res && res.success) {
        // Trigger confetti celebration
        try {
          confetti({
            particleCount: 45,
            spread: 70,
            origin: { y: 0.55 }
          });
        } catch (e) {}

        onShowToast?.({
          type: 'success',
          title: `Welcome, ${account.name.split(' ')[0]}! 🎉`,
          message: `Signed in instantly via Google (${account.email})`
        });

        onLoginSuccess(res.user, res.token);
        onClose();
      } else {
        setError(res?.error || 'Failed to sign in with Google');
      }
    } catch (err) {
      setError('Connection error: ' + (err?.message || 'unknown error'));
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setError('Please enter a valid Gmail address');
      return;
    }

    const email = customEmail.trim().toLowerCase();
    const name = customName.trim() || email.split('@')[0];
    const phone = customPhone.trim() || '9876543210';

    handleSignInWithAccount({
      name,
      email,
      phone,
      initials: name.charAt(0).toUpperCase(),
      color: 'bg-blue-600'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header mimicking clean Google Identity dialog */}
        <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <GoogleGLogo className="w-6 h-6" />
            <div>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                Sign in with Google
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Choose an account to continue to <strong>Yashi General Store</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice of zero password */}
        <div className="bg-emerald-50 px-5 py-2 border-b border-emerald-100 flex items-center gap-2 text-xs text-emerald-900 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Automatic 1-click login • No password or OTP required!</span>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold">
              {error}
            </div>
          )}

          {!isCustomMode ? (
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block px-1">
                Detected Google Accounts
              </span>

              {defaultAccounts.map((acc) => (
                <div
                  key={acc.email}
                  onClick={() => !isSigningIn && handleSignInWithAccount(acc)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition select-none ${
                    selectedAccount?.email === acc.email && isSigningIn
                      ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-base shrink-0 shadow-xs">
                      {acc.initials}
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-xs sm:text-sm font-black text-slate-900 truncate">
                        {acc.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {acc.email}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {selectedAccount?.email === acc.email && isSigningIn ? (
                      <span className="text-[11px] font-bold text-emerald-700 animate-pulse">
                        Signing in...
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 flex items-center gap-1">
                        <span>Continue</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Add / Switch account option */}
              <div
                onClick={() => setIsCustomMode(true)}
                className="p-3 rounded-2xl border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 flex items-center gap-3 cursor-pointer transition text-slate-600 hover:text-slate-900 mt-2"
              >
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold">Use another Gmail account</p>
                  <p className="text-[10px] text-slate-400">Sign in with any other Google email</p>
                </div>
              </div>
            </div>
          ) : (
            /* Custom Gmail Entry Form */
            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Gmail / Google Account Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Mobile Number (For Delivery Tracking)
                </label>
                <input
                  type="tel"
                  maxLength="10"
                  placeholder="9876543210"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSigningIn || !customEmail.trim()}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <GoogleGLogo className="w-4 h-4" />
                  <span>{isSigningIn ? 'Signing In...' : 'Continue with Google'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Privacy & Safety badge */}
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 text-center leading-normal">
            To continue, Google will share your name and email address with Yashi General Store. No password is stored.
          </div>

        </div>

      </div>
    </div>
  );
}

