import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Phone, MapPin, Navigation, Truck, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import LocationPicker from './LocationPicker';
import { api } from '../api';

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  user,
  onUserVerified,
  shopSettings,
  onOrderPlacedSuccess
}) {
  if (!isOpen) return null;

  const items = Object.values(cart);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Verification step state
  const [step, setStep] = useState(user?.verified ? 2 : 1);
  const [phone, setPhone] = useState(user?.phone || '');
  const [otp, setOtp] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [realSmsSent, setRealSmsSent] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Delivery details state
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [notes, setNotes] = useState('');

  // Location state
  const [locationData, setLocationData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');

  // 1. Send OTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setAuthError('');

    if (!customerName || !customerName.trim()) {
      setAuthError('Please enter your full name to continue with your order');
      return;
    }

    if (!phone || phone.replace(/[^0-9]/g, '').length < 10) {
      setAuthError('Please enter a valid 10-digit mobile number');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await api.sendOtp(phone);
      if (res && res.success) {
        const code = String(res.simulatedOtp || res.testOtp || '123456');
        setOtpSent(true);
        setRealSmsSent(Boolean(res.realSmsSent));
        setSimulatedOtp(code);
        setOtp(code); // Auto-fill for friction-free testing
      } else {
        setAuthError(res?.error || 'Failed to send OTP');
      }
    } catch (err) {
      setAuthError('Network error connecting to store server: ' + (err?.message || ''));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleQuickVerify = async () => {
    if (!customerName || !customerName.trim()) {
      setAuthError('Please enter your full name');
      return;
    }
    const clean = (phone || '').replace(/[^0-9]/g, '');
    const validPhone = clean.length === 10 ? clean : '9876543210';
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await api.verifyOtp(validPhone, '123456', customerName.trim());
      if (res && res.success) {
        onUserVerified?.(res.user, res.token);
        setStep(2); // Proceed to address and location step
      } else {
        setAuthError(res?.error || 'Verification failed');
      }
    } catch (err) {
      setAuthError('Quick verification failed: ' + (err?.message || ''));
    } finally {
      setAuthLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setAuthError('');

    if (!customerName || !customerName.trim()) {
      setAuthError('Please enter your full name');
      return;
    }

    const currentOtp = (otp || '').trim();
    if (!currentOtp) {
      setAuthError('Please enter the 6-digit OTP');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await api.verifyOtp(phone, currentOtp, customerName.trim());
      if (res && res.success) {
        onUserVerified?.(res.user, res.token);
        setStep(2); // Proceed to address and location step
      } else {
        setAuthError(res?.error || 'Invalid OTP');
      }
    } catch (err) {
      setAuthError('Error verifying OTP: ' + (err?.message || ''));
    } finally {
      setAuthLoading(false);
    }
  };

  // 3. Submit Delivery Request
  const handleSubmitDelivery = async (e) => {
    e?.preventDefault();
    setOrderError('');

    if (!customerName || !customerName.trim()) {
      setOrderError('Customer name is required for order delivery');
      return;
    }

    const minOrder = shopSettings?.minOrderAmount || 100;
    if (totalAmount < minOrder) {
      setOrderError(`Minimum order value must be ₹${minOrder}. Your cart total is ₹${totalAmount}. Please add items worth at least ₹${minOrder - totalAmount} more.`);
      return;
    }

    if (!address.trim()) {
      setOrderError('Please provide your complete house/street address');
      return;
    }

    if (!locationData) {
      setOrderError('Please set your delivery location on the map');
      return;
    }

    // STRICT 5KM CHECK IN CLIENT
    if (!locationData.isEligible) {
      setOrderError(
        `Cannot place order: Your location is ${locationData.distanceKm} km away. We strictly deliver up to ${shopSettings?.maxDeliveryRadiusKm || 5} km of Yashi General Store.`
      );
      return;
    }

    setSubmitting(true);
    try {
      const fullAddress = landmark
        ? `${address.trim()}, Landmark: ${landmark.trim()}`
        : address.trim();

      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: user?.phone || phone,
        address: fullAddress,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        items: items.map(i => ({ id: i.id, quantity: i.quantity, name: i.name })),
        notes: notes.trim()
      };

      const res = await api.submitOrder(orderPayload);
      if (res.success) {
        onOrderPlacedSuccess?.(res.order);
      } else {
        setOrderError(res.error || 'Failed to submit delivery request');
      }
    } catch (err) {
      setOrderError('Failed to place order. Check server connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-600 text-white p-4 sm:p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-white/20">
                <Truck className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-black">
                {step === 1 ? 'Verify Mobile Number' : 'Delivery Address & Location'}
              </h2>
            </div>
            <p className="text-xs text-white/90 mt-1">
              Yashi General Store • Strict 5 km radius delivery zone
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-emerald-50 px-6 py-2.5 border-b border-emerald-100 flex items-center justify-between text-xs font-semibold">
          <div className={`flex items-center gap-1.5 ${step === 1 ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
              1
            </span>
            <span>Mobile Verification</span>
          </div>
          <div className="h-0.5 w-12 bg-gray-200" />
          <div className={`flex items-center gap-1.5 ${step === 2 ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
              2
            </span>
            <span>Location & Address (≤5km)</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* STEP 1: MOBILE OTP VERIFICATION */}
          {step === 1 && (
            <div className="space-y-4 max-w-md mx-auto py-2">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  Enter your mobile number to verify
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  We verify your phone number to update you on delivery status and connect our delivery partner.
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Your Full Name * (Required for delivery)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Mobile Number *
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
                    disabled={authLoading || !customerName.trim() || phone.length < 10}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    {authLoading ? 'Sending OTP...' : 'Send Verification OTP'}
                  </button>

                  {/* Fast 1-Tap Verification */}
                  <div className="relative flex py-0.5 items-center">
                    <div className="flex-grow border-t border-gray-200" />
                    <span className="flex-shrink mx-2 text-[10px] text-gray-400 font-bold uppercase">Or Instant</span>
                    <div className="flex-grow border-t border-gray-200" />
                  </div>

                  <button
                    type="button"
                    onClick={handleQuickVerify}
                    disabled={authLoading}
                    className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Instant Continue (No SMS Required)</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  {realSmsSent ? (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Real SMS Dispatched to +91 {phone}</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 mt-1">
                        Please check your phone's SMS messages for the 6-digit verification code.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900">Mobile: +91 {phone}</span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                          Instant Demo Mode
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-normal">
                        No telecom SMS gateway is connected, so no SMS was sent to your phone.
                        Your instant verification code is <strong className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-amber-300 text-emerald-800 font-black">{simulatedOtp}</strong> (auto-filled below).
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
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
                      className="w-full px-4 py-2.5 text-center text-lg tracking-widest font-mono font-bold bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading || (otp || '').length < 4}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    {authLoading ? 'Verifying...' : `Verify & Continue (Code: ${otp || simulatedOtp})`}
                  </button>

                  <div className="flex justify-between text-xs text-gray-500 pt-1">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="hover:text-emerald-700 underline"
                    >
                      Change Phone Number
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

          {/* STEP 2: ADDRESS & 5KM LOCATION MAP */}
          {step === 2 && (
            <form onSubmit={handleSubmitDelivery} className="space-y-4">
              
              {orderError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{orderError}</span>
                </div>
              )}

              {/* Customer Contact & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Verified Mobile Number
                  </label>
                  <div className="flex items-center px-3.5 py-2 text-xs sm:text-sm bg-gray-100 border border-gray-200 rounded-xl text-gray-700 font-semibold justify-between">
                    <span>+91 {user?.phone || phone}</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">
                      Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Address fields */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Complete Delivery Address (House / Flat / Street) *
                </label>
                <textarea
                  required
                  rows="2"
                  placeholder="e.g. House No. 24, Near Cantt Railway Crossing / Harris Ganj, Kanpur"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nearby Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Opposite Water Tank / Near Station"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Delivery Instructions / Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Call before arrival"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Interactive Location Picker & Haversine Distance Check */}
              <div className="pt-2 border-t border-gray-100">
                <LocationPicker
                  shopLat={shopSettings?.latitude || 26.4519124}
                  shopLon={shopSettings?.longitude || 80.3537057}
                  maxRadiusKm={shopSettings?.maxDeliveryRadiusKm || 5}
                  initialUserLat={locationData?.latitude}
                  initialUserLon={locationData?.longitude}
                  onLocationSelected={(loc) => setLocationData(loc)}
                />
              </div>

              {/* Order Items Preview */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                <div className="flex justify-between font-bold text-gray-700 mb-1">
                  <span>Items to be delivered:</span>
                  <span>{items.length} products (₹{totalAmount})</span>
                </div>
                <p className="text-gray-500 line-clamp-1">
                  {items.map(i => `${i.name} (${i.quantity})`).join(', ')}
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || !locationData || !locationData.isEligible}
                  className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-sm text-white shadow-lg flex items-center justify-center space-x-2 transition ${
                    locationData?.isEligible
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                      : 'bg-gray-400 cursor-not-allowed opacity-75'
                  }`}
                >
                  <Truck className="w-5 h-5" />
                  <span>
                    {submitting
                      ? 'Sending Delivery Request...'
                      : locationData?.isEligible
                      ? `Send Delivery Request to Admin (₹${totalAmount})`
                      : 'Delivery Blocked (> 5km from shop)'}
                  </span>
                </button>

                {!locationData?.isEligible && locationData && (
                  <p className="text-[11px] text-red-600 font-bold text-center mt-2">
                    ⚠️ Order disabled because selected location is outside the 5km delivery radius!
                  </p>
                )}
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}

