import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, User, Plus, ArrowRight, Sparkles, Lock, Eye, EyeOff } from 'lucide-react';
import { api } from '../api';
import confetti from 'canvas-confetti';
import { getUserFirstName, extractFullNameFromEmail } from '../utils/userHelper';

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
  // Detected previously authenticated account strictly from local session
  const savedGoogleUser = (() => {
    try {
      const stored = sessionStorage.getItem('gs_user') || localStorage.getItem('gs_user');
      const u = JSON.parse(stored || 'null');
      if (u && u.authProvider === 'google' && u.email) return u;
    } catch (e) {}
    return null;
  })();

  const defaultAccounts = savedGoogleUser ? [
    {
      name: savedGoogleUser.name || 'Customer',
      email: savedGoogleUser.email,
      avatar: savedGoogleUser.avatar || null,
      initials: (savedGoogleUser.name || savedGoogleUser.email || 'U').charAt(0).toUpperCase(),
      color: 'bg-emerald-600',
      phone: savedGoogleUser.phone || null
    }
  ] : [];

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isCustomMode, setIsCustomMode] = useState(!savedGoogleUser);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPasswordEye, setShowPasswordEye] = useState(false);
  const [requiresAdminPassword, setRequiresAdminPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const isEmailAdmin = (emailStr) => {
    if (!emailStr) return false;
    const clean = String(emailStr).trim().toLowerCase();
    return clean === 'debusahu121@gmail.com' || api.isAuthorizedAdminEmail(clean);
  };

  const handleSignInWithAccount = async (account, passwordToVerify = '') => {
    setError('');
    setSelectedAccount(account);
    setIsSigningIn(true);

    try {
      const res = await api.googleLogin({
        email: account.email,
        name: account.name,
        avatar: account.avatar || null,
        phone: account.phone || null,
        adminPassword: passwordToVerify || adminPassword
      });

      if (res && res.requiresAdminPassword) {
        setRequiresAdminPassword(true);
        setIsCustomMode(true);
        setCustomEmail(account.email);
        if (account.name) setCustomName(account.name);
        setError(res.error || 'Admin verification required: Enter your Admin Password to unlock Admin Portal.');
        setIsSigningIn(false);
        return;
      }

      if (res && res.success) {
        try {
          confetti({
            particleCount: 45,
            spread: 70,
            origin: { y: 0.55 }
          });
        } catch (e) {}

        const userFirstName = getUserFirstName(account);
        onShowToast?.({
          type: 'success',
          title: `Welcome, ${userFirstName}! 🎉`,
          message: res.isAdmin 
            ? `Store Owner Verified • Admin Portal unlocked` 
            : `Signed in instantly via Google (${account?.email || ''})`
        });

        onLoginSuccess(res.user, res.token, res);
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
    const fullName = customName.trim() || extractFullNameFromEmail(email);

    // If admin email and password is empty, prompt for it
    if (isEmailAdmin(email) && !adminPassword.trim()) {
      setRequiresAdminPassword(true);
      setError('Admin verification required: Please enter your Admin Password.');
      return;
    }

    handleSignInWithAccount({
      name: fullName,
      email,
      phone: null,
      initials: (fullName.charAt(0) || 'G').toUpperCase(),
      color: 'bg-emerald-600'
    }, adminPassword);
  };

  const showAdminPasswordField = requiresAdminPassword || isEmailAdmin(customEmail);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col animate-in zoom-in-95 duration-200 transition-colors">
        
        {/* Header mimicking clean Google Identity dialog */}
        <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <GoogleGLogo className="w-6 h-6 shrink-0" />
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                Sign in with Google
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Continue directly to <strong>Yashi General Store</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 border-b border-emerald-100 dark:border-emerald-900/60 flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-300 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Instant Gmail login • Enter your Google Account to continue</span>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 space-y-4">
          
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-bold leading-relaxed">
              {error}
            </div>
          )}

          {!isCustomMode && defaultAccounts.length > 0 ? (
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block px-1">
                Previously used account on this device
              </span>

              {defaultAccounts.map((acc) => (
                <div
                  key={acc.email}
                  onClick={() => !isSigningIn && handleSignInWithAccount(acc)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition select-none ${
                    selectedAccount?.email === acc.email && isSigningIn
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 ring-2 ring-emerald-200 dark:ring-emerald-800'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-base shrink-0 shadow-xs">
                      {acc.initials}
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                        {acc.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {acc.email}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {selectedAccount?.email === acc.email && isSigningIn ? (
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 animate-pulse">
                        Signing in...
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <span>Continue</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Add / Switch account option */}
              <div
                onClick={() => {
                  setIsCustomMode(true);
                  setError('');
                }}
                className="p-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-3 cursor-pointer transition text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white mt-2"
              >
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold">Use another Gmail account</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Sign in with any other Google email</p>
                </div>
              </div>
            </div>
          ) : (
            /* Custom Gmail Entry Form */
            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                  Your Full Name <span className="font-normal text-slate-400">(Optional - auto-detected from Gmail if blank)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar (or leave blank)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                  Gmail / Google Account Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={customEmail}
                  onChange={(e) => {
                    setCustomEmail(e.target.value);
                    if (isEmailAdmin(e.target.value)) {
                      setRequiresAdminPassword(true);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-900 dark:text-white"
                />
              </div>

              {/* Admin Verification Password Input (Shows ONLY when an admin/owner email is entered) */}
              {showAdminPasswordField && (
                <div className="p-3 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-2xl space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 text-xs font-black text-purple-900 dark:text-purple-300">
                    <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span>Store Owner / Admin Verification</span>
                  </div>
                  <p className="text-[11px] text-purple-700 dark:text-purple-300 leading-tight">
                    This Gmail has Store Admin privileges. Enter your Admin Password to verify ownership and unlock the Admin Portal:
                  </p>
                  <div className="relative">
                    <input
                      type={showPasswordEye ? "text" : "password"}
                      required
                      placeholder="Enter Store Admin Password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 rounded-xl focus:ring-2 focus:ring-purple-500 font-bold text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordEye(!showPasswordEye)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPasswordEye ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                {defaultAccounts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomMode(false);
                      setError('');
                    }}
                    className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSigningIn || !customEmail.trim()}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <GoogleGLogo className="w-4 h-4" />
                  <span>{isSigningIn ? 'Verifying...' : (showAdminPasswordField ? 'Verify & Unlock Admin' : 'Continue with Google')}</span>
                </button>
              </div>
            </form>
          )}

          {/* Privacy & Safety badge */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 text-center leading-normal">
            Each user signs in with their own Gmail account. Store owner credentials are never shared with other devices.
          </div>

        </div>

      </div>
    </div>
  );
}
