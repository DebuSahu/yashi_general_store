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
  ArrowRight
} from 'lucide-react';
import { api } from '../api';

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  onAdminLoginSuccess,
  initialTab = 'user'
}) {
  if (!isOpen) return null;

  const [loginType, setLoginType] = useState(initialTab || 'user');

  // Customer state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
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
      if (res.success) {
        setOtpSent(true);
        setSimulatedOtp(res.simulatedOtp);
        setOtp(res.simulatedOtp); // Auto-fill for convenience
      } else {
        setError(res.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifyOtp(phone, otp, name.trim());
      if (res.success) {
        onLoginSuccess(res.user, res.token);
        onClose();
      } else {
        setError(res.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Error verifying OTP');
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 p-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              loginType === 'admin' 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              {loginType === 'admin' ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {loginType === 'admin' ? 'Store Admin Portal' : 'Customer Sign In'}
              </h3>
              <p className="text-xs text-gray-500">
                {loginType === 'admin' 
                  ? 'Manage catalog, orders & delivery' 
                  : 'Fast mobile OTP verification'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unified Tab Switcher */}
        <div className="flex p-1 bg-gray-100 rounded-2xl mb-4">
          <button
            type="button"
            onClick={() => { setLoginType('user'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition ${
              loginType === 'user' 
                ? 'bg-white text-emerald-800 shadow-xs' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>👤 Customer</span>
          </button>
          <button
            type="button"
            onClick={() => { setLoginType('admin'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition ${
              loginType === 'admin' 
                ? 'bg-white text-purple-800 shadow-xs' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>🛡️ Store Admin</span>
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: CUSTOMER MOBILE OTP LOGIN */}
        {loginType === 'user' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Enter Mobile Number *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-gray-500 pointer-events-none">
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
                      className="w-full pl-12 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !name.trim() || phone.length < 10}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'Sending OTP...' : 'Send OTP & Login'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                  <p className="font-semibold">Name: <strong>{name}</strong> | Phone: +91 {phone}</p>
                  {simulatedOtp && (
                    <p className="mt-1 text-emerald-700 text-[11px]">
                      Testing OTP: <strong className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-emerald-300">{simulatedOtp}</strong>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Enter 6-Digit OTP
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full px-4 py-2 text-center text-lg tracking-widest font-mono font-bold bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length < 4}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify Mobile & Login'}
                </button>

                <div className="flex justify-between text-xs text-gray-500 pt-1">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="hover:text-emerald-700 underline"
                  >
                    Change Phone
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="hover:text-emerald-700 underline"
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
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Admin Username *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Enter admin username"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-semibold"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Admin Password *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                  <Lock className="w-4 h-4 text-purple-600" />
                </span>
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter secure password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-[11px] text-gray-600 bg-purple-50/70 p-2.5 rounded-xl border border-purple-100 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-purple-700 shrink-0" />
              <span>Restricted to authorized store personnel only. Login attempts are monitored.</span>
            </div>

            <button
              type="submit"
              disabled={adminLoading || !adminUsername.trim() || !adminPassword}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-purple-600/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{adminLoading ? 'Authenticating Admin...' : 'Sign In as Store Admin'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
