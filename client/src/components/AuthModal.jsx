import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { api } from '../api';
import GoogleAuthModal, { GoogleGLogo } from './GoogleAuthModal';

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  onAdminLoginSuccess,
  initialTab = 'user'
}) {
  if (!isOpen) return null;

  const [loginType, setLoginType] = useState(initialTab || 'user');
  const [googleModalOpen, setGoogleModalOpen] = useState(false);

  // Customer state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [realSmsSent, setRealSmsSent] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Admin state - empty by default for security
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

  // Customer Handlers
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !name.trim()) {
      setError('Please enter your full name');
      return;
    }

    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendOtp(clean);
      if (res && res.success) {
        const code = String(res.simulatedOtp || res.testOtp || '123456');
        setOtpSent(true);
        setRealSmsSent(Boolean(res.realSmsSent));
        setSimulatedOtp(code);
        setOtp(code);
      } else {
        setError(res?.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Failed to connect to server: ' + (err?.message || 'unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickGuestLogin = async () => {
    const guestName = (name && name.trim()) || 'Guest Customer';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const guestPhone = cleanPhone.length === 10 ? cleanPhone : '9876543210';
    setLoading(true);
    setError('');
    try {
      const res = await api.verifyOtp(guestPhone, '123456', guestName);
      if (res && res.success) {
        onLoginSuccess(res.user, res.token);
        onClose();
      } else {
        setError(res?.error || 'Failed to login');
      }
    } catch (err) {
      setError('Quick login failed: ' + (err?.message || 'unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    const currentOtp = (otp || '').trim();
    if (!currentOtp) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifyOtp(phone, currentOtp, (name || '').trim());
      if (res && res.success) {
        onLoginSuccess(res.user, res.token);
        onClose();
      } else {
        setError(res?.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Error verifying OTP: ' + (err?.message || 'unknown error'));
    } finally {
      setLoading(false);
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
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 p-6 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors shadow-2xs ${
                  loginType === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {loginType === 'admin' ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {loginType === 'admin' ? 'Store Admin Portal' : 'Customer Account'}
                </h3>
                <p className="text-xs text-slate-500">
                  {loginType === 'admin'
                    ? 'Manage inventory, radius & deliveries'
                    : 'Instant passwordless sign-in'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Unified Tab Switcher */}
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-4">
            <button
              type="button"
              onClick={() => {
                setLoginType('user');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition ${
                loginType === 'user'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>👤 Customer</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType('admin');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition ${
                loginType === 'admin'
                  ? 'bg-white text-purple-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>🛡️ Store Admin</span>
            </button>
          </div>

          {/* Error Notification */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: CUSTOMER LOGIN (GOOGLE GMAIL + MOBILE OTP) */}
          {loginType === 'user' && (
            <div className="space-y-4">
              
              {/* Primary 1-Click Google Sign-In (Passwordless) */}
              <button
                type="button"
                onClick={() => setGoogleModalOpen(true)}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-black text-xs sm:text-sm rounded-2xl border-2 border-slate-200 hover:border-slate-300 shadow-sm flex items-center justify-center gap-3 transition active:scale-98 group"
              >
                <GoogleGLogo className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
                <span>Continue with Google / Gmail (No Password)</span>
              </button>

              <div className="relative flex py-0.5 items-center">
                <div className="flex-grow border-t border-slate-200" />
                <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase">
                  Or Sign in with Mobile Phone
                </span>
                <div className="flex-grow border-t border-slate-200" />
              </div>

              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Enter Mobile Number *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-slate-500 pointer-events-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength="10"
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full pl-12 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !name.trim() || phone.length < 10}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Sending OTP...' : 'Send OTP & Login'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickGuestLogin}
                    disabled={loading}
                    className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Instant Guest Access (No SMS Needed)</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  {realSmsSent ? (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Real SMS Dispatched to +91 {phone}</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 mt-1">
                        An SMS with your 6-digit OTP was sent to your phone.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900">Mobile: +91 {phone}</span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                          Demo OTP
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-normal">
                        Your verification code is <strong className="font-mono text-sm bg-white px-2 py-0.5 rounded-lg border border-amber-300 text-emerald-800 font-black">{simulatedOtp}</strong> (auto-filled below).
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Enter 6-Digit OTP
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength="6"
                      value={otp || ''}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full px-4 py-2 text-center text-lg tracking-widest font-mono font-black bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || (otp || '').length < 4}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : `Verify Mobile & Login (Code: ${otp || simulatedOtp})`}
                  </button>

                  <div className="flex justify-between text-xs text-slate-500 pt-1">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="hover:text-emerald-700 underline font-bold"
                    >
                      Change Phone
                    </button>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="hover:text-emerald-700 underline font-bold"
                    >
                      Resend OTP
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: STORE ADMIN CREDENTIALS LOGIN */}
          {loginType === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Admin Username *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Enter admin username"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-semibold"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Admin Password *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4 text-purple-600" />
                  </span>
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter secure password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 bg-purple-50/70 p-2.5 rounded-xl border border-purple-100 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                <span>Restricted to authorized store personnel only. Login attempts are monitored.</span>
              </div>

              <button
                type="submit"
                disabled={adminLoading || !adminUsername.trim() || !adminPassword}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-purple-600/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
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
