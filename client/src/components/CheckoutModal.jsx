import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Phone,
  MapPin,
  Truck,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Clock,
  CreditCard,
  User,
  Mail
} from 'lucide-react';
import LocationPicker from './LocationPicker';
import { api } from '../api';
import confetti from 'canvas-confetti';
import GoogleAuthModal, { GoogleGLogo } from './GoogleAuthModal';

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

  // If user is already logged in, go straight to Step 2
  const [step, setStep] = useState(user ? 2 : 1);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [authError, setAuthError] = useState('');
  const [guestName, setGuestName] = useState('');

  // Delivery details state
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [deliveryPhone, setDeliveryPhone] = useState(user?.phone || '');
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
      id: 'slot-1',
      title: '🌅 Morning Slot',
      time: '08:00 AM - 11:30 AM'
    },
    {
      id: 'slot-2',
      title: '☀️ Afternoon Slot',
      time: '12:00 PM - 04:00 PM'
    },
    {
      id: 'slot-3',
      title: '🌆 Evening Slot',
      time: '05:00 PM - 08:30 PM'
    }
  ];

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const paymentMethods = [
    {
      id: 'cod',
      title: 'Cash on Delivery (COD)',
      desc: 'Pay cash directly at doorstep',
      icon: Truck
    },
    {
      id: 'upi',
      title: 'UPI / QR on Delivery',
      desc: 'Google Pay, PhonePe, Paytm, BHIM',
      icon: CreditCard
    }
  ];

  // Location / Haversine Distance
  const [locationData, setLocationData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');

  if (!isOpen) return null;

  const handleGoogleSuccess = (userData, token) => {
    onUserVerified?.(userData, token);
    if (!customerName) {
      setCustomerName(userData.name || '');
    }
    setStep(2);
    setGoogleModalOpen(false);
  };

  const handleContinueAsGuest = (e) => {
    e?.preventDefault();
    if (!guestName.trim()) {
      setAuthError('Please enter your full name');
      return;
    }
    setCustomerName(guestName.trim());
    setStep(2);
  };

  // Submit Delivery Request
  const handleSubmitDelivery = async (e) => {
    e?.preventDefault();
    setOrderError('');

    if (!customerName || !customerName.trim()) {
      setOrderError('Customer name is required for order delivery');
      return;
    }

    const cleanPhone = (deliveryPhone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setOrderError('Please enter a valid 10-digit mobile number so our delivery boy can contact you at doorstep');
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

    // STRICT 5KM CHECK
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
        customerPhone: cleanPhone,
        customerEmail: user?.email || null,
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
        try {
          const existingHistory = JSON.parse(localStorage.getItem('gs_order_history') || '[]');
          const newOrderWithExtra = {
            ...res.order,
            items: items.map((i) => ({
              id: i.id,
              name: i.name,
              price: i.price,
              quantity: i.quantity,
              unit: i.unit,
              image: i.image
            })),
            totalAmount: finalPayable,
            placedAt: new Date().toISOString(),
            status: 'pending'
          };
          localStorage.setItem('gs_order_history', JSON.stringify([newOrderWithExtra, ...existingHistory]));
        } catch (e) {}

        try {
          confetti({
            particleCount: 60,
            spread: 80,
            origin: { y: 0.5 }
          });
        } catch (e) {}

        onOrderPlacedSuccess?.(res.order);
      } else {
        setOrderError(res.error || 'Failed to place order');
      }
    } catch (err) {
      setOrderError('Failed to place order. Check server connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 transition-colors">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-600 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded-xl bg-white/20">
                  <Truck className="w-5 h-5 text-yellow-300" />
                </span>
                <h2 className="text-base sm:text-xl font-black">
                  {step === 1 ? 'Customer Identification' : 'Checkout & Delivery Details'}
                </h2>
              </div>
              <p className="text-xs text-white/90 mt-1">
                Yashi General Store • 5 km Neighborhood Doorstep Delivery
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
          <div className="bg-emerald-50 dark:bg-emerald-950/40 px-4 sm:px-6 py-2.5 border-b border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between text-xs font-bold shrink-0">
            <div className={`flex items-center gap-1.5 ${step === 1 ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-400 dark:text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'}`}>
                1
              </span>
              <span>1. Sign In (Gmail)</span>
            </div>
            <div className="h-0.5 w-12 bg-slate-200 dark:bg-slate-700" />
            <div className={`flex items-center gap-1.5 ${step === 2 ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-400 dark:text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'}`}>
                2
              </span>
              <span>2. Mobile & Delivery Details</span>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            
            {/* STEP 1: GMAIL SIGN IN / GUEST (NO MOBILE/OTP REQUIRED AT LOGIN) */}
            {step === 1 && (
              <div className="space-y-4 max-w-md mx-auto py-2">
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <GoogleGLogo className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Sign in with Gmail to Complete Delivery
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Automatic 1-click passwordless login. Mobile number is only needed in the next step when confirming your address.
                  </p>
                </div>

                {authError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Primary Google Sign-in Button */}
                <button
                  type="button"
                  onClick={() => setGoogleModalOpen(true)}
                  className="w-full py-3 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-black text-xs sm:text-sm rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 shadow-sm flex items-center justify-center gap-3 transition active:scale-98 group"
                >
                  <GoogleGLogo className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
                  <span>Continue with Google / Gmail (No Password)</span>
                </button>

                <div className="relative flex py-0.5 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
                  <span className="flex-shrink mx-3 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                    Or Quick Guest Checkout
                  </span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
                </div>

                <form onSubmit={handleContinueAsGuest} className="space-y-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold dark:text-white"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!guestName.trim()}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    Proceed to Address & Delivery Details →
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: ADDRESS, MOBILE NUMBER (FOR DELIVERY ONLY), SLOTS, PAYMENT & MAP */}
            {step === 2 && (
              <form onSubmit={handleSubmitDelivery} className="space-y-4">
                
                {orderError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{orderError}</span>
                  </div>
                )}

                {/* Customer Contact & Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold dark:text-white"
                    />
                  </div>

                  {/* MOBILE NUMBER: Only asked here when placing the order! */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                      Mobile Number for Delivery Call *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-slate-500 pointer-events-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength="10"
                        placeholder="98765 43210"
                        value={deliveryPhone}
                        onChange={(e) => setDeliveryPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full pl-12 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Account info pill */}
                {user?.email && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Logged in as: <strong className="text-slate-900 dark:text-white">{user.email}</strong></span>
                  </div>
                )}

                {/* Delivery Slots Selection */}
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
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
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-200 shadow-2xs'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                          }`}
                        >
                          <p className="text-xs font-black">{slot.title}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                            {slot.time}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery Address fields */}
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                    Complete House/Street Address *
                  </label>
                  <textarea
                    required
                    rows="2"
                    placeholder="e.g. House No. 24, Near Cantt Railway Crossing / Harris Ganj, Kanpur"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                      Nearby Landmark
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Opposite Water Tank"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                      Special Notes / Doorstep Instructions
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ring bell twice, leave at door"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:text-white"
                    />
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Select Payment Method *</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {paymentMethods.map((pm) => {
                      const Icon = pm.icon;
                      const isSelected = paymentMethod === pm.id;
                      return (
                        <div
                          key={pm.id}
                          onClick={() => setPaymentMethod(pm.id)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition select-none flex items-center gap-2.5 ${
                            isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-200 shadow-2xs'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black leading-tight truncate">{pm.title}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate mt-0.5">{pm.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {paymentMethod === 'upi' && (
                    <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 dark:text-white">Scan & Pay via any UPI App</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Pay directly upon delivery or to Store UPI: <strong>yashistore@upi</strong></p>
                      </div>
                      <span className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                        QR READY
                      </span>
                    </div>
                  )}
                </div>

                {/* Interactive Location Picker & Haversine Distance Check */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
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
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal ({items.length} items):</span>
                    <span className="font-bold text-slate-800 dark:text-white">₹{totalAmount}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                      <span>Coupon Discount ({appliedCoupon.code}):</span>
                      <span>-₹{couponDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Local Delivery (≤ 5km):</span>
                    <span className="font-black text-emerald-700 dark:text-emerald-400 uppercase">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-slate-700">
                    <span>Payable Amount:</span>
                    <span className="text-emerald-700 dark:text-emerald-400 text-base">₹{finalPayable}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={submitting || !locationData || !locationData.isEligible || (deliveryPhone || '').replace(/[^0-9]/g, '').length < 10}
                    className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm text-white shadow-lg flex items-center justify-center space-x-2 transition active:scale-[0.99] ${
                      locationData?.isEligible && (deliveryPhone || '').replace(/[^0-9]/g, '').length >= 10
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                        : 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-75'
                    }`}
                  >
                    <Truck className="w-5 h-5 text-yellow-300" />
                    <span>
                      {submitting
                        ? 'Dispatching Delivery Request...'
                        : (deliveryPhone || '').replace(/[^0-9]/g, '').length < 10
                        ? 'Enter 10-digit mobile number above'
                        : locationData?.isEligible
                        ? `Place Delivery Request (₹${finalPayable})`
                        : 'Delivery Blocked (> 5km from shop)'}
                    </span>
                  </button>

                  {!locationData?.isEligible && locationData && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold text-center mt-2">
                      ⚠️ Delivery disabled: Your selected GPS coordinates are {locationData?.distanceKm} km away. We strictly deliver up to 5 km of Yashi General Store!
                    </p>
                  )}
                </div>

              </form>
            )}

          </div>

        </div>
      </div>

      {/* Google Sign-in Modal */}
      <GoogleAuthModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        onLoginSuccess={handleGoogleSuccess}
        onShowToast={onShowToast}
      />
    </>
  );
}
