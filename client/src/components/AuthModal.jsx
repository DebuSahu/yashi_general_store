import React, { useState, useEffect } from 'react';
import {
  X,
  AlertCircle,
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { api } from '../api';
import GoogleAuthModal, { GoogleGLogo } from './GoogleAuthModal';
import confetti from 'canvas-confetti';

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  onAdminLoginSuccess,
  initialTab = 'user'
}) {

  const [loginType, setLoginType] = useState(initialTab || 'user');
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [signingInGoogle, setSigningInGoogle] = useState(false);

  // Admin state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  // Error feedback
  const [error, setError] = useState('');

  // Sync initial tab when opened
  useEffect(() => {
    if (isOpen) {
      setLoginType(initialTab || 'user');
      setError('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Detected default Google account for fast 1-click login
  const defaultAccount = {
    name: 'Divyanshu Sahu',
    email: 'debusahu121@gmail.com',
    initials: 'D'
  };

  const handleInstantGoogleSignIn = async (account) => {
    setError('');
    setSigningInGoogle(true);
    try {
      const res = await api.googleLogin({
        email: account.email,
        name: account.name,
        phone: null
      });

      if (res && res.success) {
        try {
          confetti({
            particleCount: 35,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch (e) {}

        onLoginSuccess(res.user, res.token);
        onClose();
      } else {
        setError(res?.error || 'Failed to sign in with Google');
      }
    } catch (err) {
      setError('Connection error: ' + (err?.message || 'unknown error'));
    } finally {
      setSigningInGoogle(false);
    }
  };

  // Admin Login Handler
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!adminUsername.trim() || !adminPassword) {
      setError('Please enter both admin username and password');
      return;
    }

    setAdminLoading(true);
    try {
      const res = await api.adminLogin(adminUsername.trim(), adminPassword);
      if (res.success && res.token) {
        if (onAdminLoginSuccess) {
          onAdminLoginSuccess(res.user || { username: adminUsername.trim(), role: 'admin' }, res.token);
        }
        onClose();
      } else {
        setError(res.error || 'Invalid admin username or password');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 p-5 sm:p-6 animate-in fade-in zoom-in-95 duration-150 transition-colors">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors shadow-2xs ${
                  loginType === 'admin'
                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {loginType === 'admin' ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {loginType === 'admin' ? 'Store Admin Portal' : 'Customer Account'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {loginType === 'admin'
                    ? 'Manage inventory, radius & deliveries'
                    : '100% Passwordless Gmail Sign In'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Unified Tab Switcher */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4">
            <button
              type="button"
              onClick={() => {
                setLoginType('user');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition ${
                loginType === 'user'
                  ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>👤 Customer (Gmail)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType('admin');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition ${
                loginType === 'admin'
                  ? 'bg-white dark:bg-slate-900 text-purple-800 dark:text-purple-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>🛡️ Store Admin</span>
            </button>
          </div>

          {/* Error Notification */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: CUSTOMER LOGIN (STRICTLY GMAIL ONLY - NO MOBILE/OTP) */}
          {loginType === 'user' && (
            <div className="space-y-4">
              
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-950 dark:text-emerald-200 space-y-1">
                <p className="font-extrabold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant 1-Click Login via Gmail</span>
                </p>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300/80 leading-relaxed">
                  No password or mobile OTP needed to browse and manage your account. (Mobile number is only asked later when placing your home delivery order).
                </p>
              </div>

              {/* 1-Click Detected Account Button */}
              <div
                onClick={() => !signingInGoogle && handleInstantGoogleSignIn(defaultAccount)}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center justify-between gap-3 cursor-pointer transition select-none shadow-xs group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                    {defaultAccount.initials}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                      {defaultAccount.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {defaultAccount.email}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {signingInGoogle ? (
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 animate-pulse">
                      Signing in...
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 group-hover:bg-emerald-600 group-hover:text-white transition">
                      <span>Sign In</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>

              {/* Choose Another Gmail Account Button */}
              <button
                type="button"
                onClick={() => setGoogleModalOpen(true)}
                className="w-full py-3 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-black text-xs sm:text-sm rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 shadow-sm flex items-center justify-center gap-3 transition active:scale-98 group"
              >
                <GoogleGLogo className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
                <span>Use another Gmail Account</span>
              </button>

              <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center pt-1">
                Zero friction • Automatic Google verification • No password needed
              </p>
            </div>
          )}

          {/* TAB 2: STORE ADMIN LOGIN */}
          {loginType === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              
              {/* Quick 1-Click Demo Fill Banner */}
              <div className="flex items-center justify-between text-[11px] bg-purple-50 dark:bg-purple-950/40 p-2.5 rounded-2xl border border-purple-200 dark:border-purple-800/80">
                <div className="flex items-center gap-1.5 text-purple-900 dark:text-purple-300">
                  <Lock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span>Admin: <strong>admin</strong> / <strong>admin123</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAdminUsername('admin');
                    setAdminPassword('admin123');
                  }}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-black text-[10px] rounded-xl transition active:scale-95 shadow-2xs"
                >
                  Quick Fill
                </button>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                  Admin Username *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Enter admin username (admin)"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 font-semibold text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                  Admin Password *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter secure password (admin123)"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 font-semibold text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={adminLoading || !adminUsername.trim() || !adminPassword}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-purple-600/20 transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{adminLoading ? 'Authenticating Admin...' : 'Sign In as Store Admin'}</span>
              </button>
            </form>
          )}

        </div>
      </div>

      {/* Google Sign-in Account Selector Modal */}
      <GoogleAuthModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        onLoginSuccess={(userData, token) => {
          onLoginSuccess(userData, token);
          onClose();
        }}
      />
    </>
  );
}
