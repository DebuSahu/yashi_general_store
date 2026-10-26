import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Phone,
  MapPin,
  Navigation,
  Truck,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Clock,
  CreditCard,
  Banknote,
  QrCode,
  Tag
} from 'lucide-react';
import LocationPicker from './LocationPicker';
import { api } from '../api';
import confetti from 'canvas-confetti';

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  user,
  onUserVerified,
  shopSettings,
  appliedCoupon,
  onOrderPlacedSuccess,
  onShowToast
}) {
  if (!isOpen) return null;

  const items = Object.values(cart);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate discount from coupon if any
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'flat') {
      couponDiscount = appliedCoupon.value;
    } else if (appliedCoupon.type === 'percent') {
      couponDiscount = Math.min(
        appliedCoupon.maxDiscount || 100,
        Math.round((totalAmount * appliedCoupon.value) / 100)
      );
    }
  }

  const finalPayable = Math.max(0, totalAmount - couponDiscount);

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

  // Delivery slot selection
  const [deliverySlot, setDeliverySlot] = useState('express');
  const deliverySlots = [
    {
      id: 'express',
      title: '⚡ Lightning Express',
      time: 'Next 25 - 35 mins',
      highlight: true
    },
    {
      id: 'morning',
      title: '🌅 Morning Slot',
      time: '7:00 AM - 9:00 AM'
    },
    {
      id: 'afternoon',
      title: '☀️ Afternoon Slot',
      time: '12:30 PM - 2:30 PM'
    },
    {
      id: 'evening',
      title: '🌙 Evening Slot',
      time: '6:00 PM - 8:30 PM'
    }
  ];

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const paymentMethods = [
    {
      id: 'cod',
      title: 'Cash on Delivery (COD)',
      desc: 'Pay cash or UPI upon delivery',
      icon: Banknote
    },
    {
      id: 'upi',
      title: 'UPI / QR Code',
      desc: 'GPay, PhonePe, Paytm, BHIM',
      icon: QrCode
    },
    {
      id: 'card',
      title: 'Credit / Debit Cards & Netbanking',
      desc: 'Visa, RuPay, Mastercard',
      icon: CreditCard
    }
  ];

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
        setStep(2);
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
    if (finalPayable < minOrder) {
      setOrderError(
        `Minimum order value must be ₹${minOrder}. Your payable total is ₹${finalPayable}. Please add items worth at least ₹${minOrder - finalPayable} more.`
      );
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

      const selectedSlotObj = deliverySlots.find((s) => s.id === deliverySlot);
      const slotText = `${selectedSlotObj?.title || 'Express'} (${selectedSlotObj?.time || 'Immediate'})`;

      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: user?.phone || phone,
        address: fullAddress,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        items: items.map((i) => ({
          id: i.id,
          quantity: i.quantity,
          name: i.name,
          price: i.price,
          unit: i.unit
        })),
        notes: `[Slot: ${slotText}] [Payment: ${paymentMethod.toUpperCase()}] ${notes.trim()}`
      };

      const res = await api.submitOrder(orderPayload);
      if (res.success) {
        // Save to customer order history in localStorage
        try {
          const existingHistory = JSON.parse(localStorage.getItem('gs_order_history') || '[]');
          const newOrderWithExtra = {
            ...res.order,
            slot: slotText,
            paymentMethod,
            couponApplied: appliedCoupon?.code || null
          };
          localStorage.setItem('gs_order_history', JSON.stringify([newOrderWithExtra, ...existingHistory]));
        } catch (e) {}

        try {
          confetti({
            particleCount: 80,
            spread: 90,
            origin: { y: 0.5 }
          });
        } catch (e) {}

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
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-600 text-white p-4 sm:p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-xl bg-white/20">
                <Truck className="w-5 h-5 text-yellow-300" />
              </span>
              <h2 className="text-base sm:text-xl font-black">
                {step === 1 ? 'Verify Phone Number' : 'Checkout & Delivery Details'}
              </h2>
            </div>
            <p className="text-xs text-white/90 mt-1">
              Yashi General Store • 5 km Superfast Neighborhood Delivery
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
        <div className="bg-emerald-50 px-6 py-2.5 border-b border-emerald-100 flex items-center justify-between text-xs font-bold">
          <div className={`flex items-center gap-1.5 ${step === 1 ? 'text-emerald-800' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
              1
            </span>
            <span>Mobile Verification</span>
          </div>
          <div className="h-0.5 w-12 bg-slate-200" />
          <div className={`flex items-center gap-1.5 ${step === 2 ? 'text-emerald-800' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
              2
            </span>
            <span>Slot, Payment & Location</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* STEP 1: MOBILE OTP VERIFICATION */}
          {step === 1 && (
            <div className="space-y-4 max-w-md mx-auto py-2">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Enter mobile number to order
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  We use your phone number for live delivery status updates and delivery rider coordination.
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Your Full Name * (Required for delivery)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-black text-slate-500 pointer-events-none">
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
                    disabled={authLoading || !customerName.trim() || phone.length < 10}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    {authLoading ? 'Sending OTP...' : 'Send Verification OTP'}
                  </button>

                  {/* Fast 1-Tap Verification */}
                  <div className="relative flex py-0.5 items-center">
                    <div className="flex-grow border-t border-slate-200" />
                    <span className="flex-shrink mx-2 text-[10px] text-slate-400 font-bold uppercase">Or Instant</span>
                    <div className="flex-grow border-t border-slate-200" />
                  </div>

                  <button
                    type="button"
                    onClick={handleQuickVerify}
                    disabled={authLoading}
                    className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Instant Continue (No SMS Required)</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-900">Mobile: +91 {phone}</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                        Demo Mode
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-normal">
                      Your instant verification code is <strong className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-amber-300 text-emerald-800 font-black">{simulatedOtp}</strong> (auto-filled).
                    </p>
                  </div>

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
                      className="w-full px-4 py-2.5 text-center text-lg tracking-widest font-mono font-black bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading || (otp || '').length < 4}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    {authLoading ? 'Verifying...' : `Verify & Continue (Code: ${otp || simulatedOtp})`}
                  </button>

                  <div className="flex justify-between text-xs text-slate-500 pt-1">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="hover:text-emerald-700 underline font-bold"
                    >
                      Change Phone Number
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

          {/* STEP 2: ADDRESS, SLOTS, PAYMENT & MAP */}
          {step === 2 && (
            <form onSubmit={handleSubmitDelivery} className="space-y-4">
              
              {orderError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{orderError}</span>
                </div>
              )}

              {/* Customer Contact & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <div className="flex items-center px-3.5 py-2 text-xs sm:text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold justify-between">
                    <span>+91 {user?.phone || phone}</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-black">
                      Verified ✅
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Slots Selection */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Choose Delivery Slot *</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {deliverySlots.map((slot) => {
                    const isSelected = deliverySlot === slot.id;
                    return (
                      <div
                        key={slot.id}
                        onClick={() => setDeliverySlot(slot.id)}
                        className={`p-2.5 rounded-xl border text-center cursor-pointer transition select-none ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <p className="text-xs font-black">{slot.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                          {slot.time}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Address fields */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Complete House/Street Address *
                </label>
                <textarea
                  required
                  rows="2"
                  placeholder="e.g. House No. 24, Near Cantt Railway Crossing / Harris Ganj, Kanpur"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Nearby Landmark
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Opposite Water Tank"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Special Notes / Doorstep Instructions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ring bell twice, leave at door"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Select Payment Method *</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {paymentMethods.map((pm) => {
                    const Icon = pm.icon;
                    const isSelected = paymentMethod === pm.id;
                    return (
                      <div
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition select-none flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black leading-tight truncate">{pm.title}</p>
                          <p className="text-[10px] text-slate-500 leading-tight truncate mt-0.5">{pm.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* If UPI chosen, show demo QR code badge */}
                {paymentMethod === 'upi' && (
                  <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-800">Scan & Pay via any UPI App</span>
                      <p className="text-[11px] text-slate-500">Pay directly upon delivery or to Store UPI: <strong>yashistore@upi</strong></p>
                    </div>
                    <span className="px-2 py-1 bg-white border border-slate-300 rounded font-mono text-[10px] font-bold text-emerald-700">
                      QR READY
                    </span>
                  </div>
                )}
              </div>

              {/* Interactive Location Picker & Haversine Distance Check */}
              <div className="pt-2 border-t border-slate-100">
                <LocationPicker
                  shopLat={shopSettings?.latitude || 26.4519124}
                  shopLon={shopSettings?.longitude || 80.3537057}
                  maxRadiusKm={shopSettings?.maxDeliveryRadiusKm || 5}
                  initialUserLat={locationData?.latitude}
                  initialUserLon={locationData?.longitude}
                  onLocationSelected={(loc) => setLocationData(loc)}
                />
              </div>

              {/* Order Cost Breakdown in Checkout */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({items.length} items):</span>
                  <span className="font-bold text-slate-800">₹{totalAmount}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Coupon Discount ({appliedCoupon.code}):</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Local Delivery (≤ 5km):</span>
                  <span className="font-black text-emerald-700 uppercase">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>Payable Amount:</span>
                  <span className="text-emerald-700 text-base">₹{finalPayable}</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={submitting || !locationData || !locationData.isEligible}
                  className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm text-white shadow-lg flex items-center justify-center space-x-2 transition active:scale-[0.99] ${
                    locationData?.isEligible
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                      : 'bg-slate-400 cursor-not-allowed opacity-75'
                  }`}
                >
                  <Truck className="w-5 h-5 text-yellow-300" />
                  <span>
                    {submitting
                      ? 'Dispatching Delivery Request...'
                      : locationData?.isEligible
                      ? `Place Delivery Request (₹${finalPayable})`
                      : 'Delivery Blocked (> 5km from shop)'}
                  </span>
                </button>

                {!locationData?.isEligible && locationData && (
                  <p className="text-[11px] text-rose-600 font-bold text-center mt-2">
                    ⚠️ Delivery disabled: Your selected GPS coordinates are {locationData.distanceKm} km away. We strictly deliver up to 5 km of Yashi General Store!
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
