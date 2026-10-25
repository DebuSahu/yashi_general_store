import React, { useState } from 'react';
import { X, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../api';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 p-6">
        
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">User Login</h3>
              <p className="text-xs text-gray-500">Verify via Mobile OTP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

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
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
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
    </div>
  );
}

