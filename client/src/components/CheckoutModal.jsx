import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Mail,
  Send
} from 'lucide-react';
import LocationPicker from './LocationPicker';
import { api } from '../api';
import confetti from 'canvas-confetti';
import GoogleAuthModal, { GoogleGLogo } from './GoogleAuthModal';
import { extractFullNameFromEmail } from '../utils/userHelper';
import {
  buildClientEmailBill,
  autoDispatchOrderCommunications
} from '../utils/orderReceiptHelper';
import { downloadInvoicePdf } from '../utils/pdfInvoiceGenerator';

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

  // Calculate discount from coupon if any (Supports flat, scoped percent, and BOGO freebies)
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'flat') {
      couponDiscount = Math.min(totalAmount, Number(appliedCoupon.value) || 0);
    } else if (appliedCoupon.type === 'percent') {
      let eligibleSubtotal = totalAmount;
      if (appliedCoupon.scope === 'category') {
        eligibleSubtotal = items
          .filter((i) => appliedCoupon.targetCategory === 'all' || (i.category || '').toLowerCase() === (appliedCoupon.targetCategory || '').toLowerCase())
          .reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
      } else if (appliedCoupon.scope === 'product') {
        eligibleSubtotal = items
          .filter((i) => appliedCoupon.targetProductIds?.includes(i.id))
          .reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
      }
      const rawDiscount = Math.round((eligibleSubtotal * (Number(appliedCoupon.value) || 0)) / 100);
      couponDiscount = appliedCoupon.maxDiscount ? Math.min(Number(appliedCoupon.maxDiscount), rawDiscount) : rawDiscount;
    } else if (appliedCoupon.type === 'bogo') {
      let bogoDiscount = 0;
      items.forEach((item) => {
        let isEligible = false;
        if (appliedCoupon.scope === 'product') {
          isEligible = appliedCoupon.targetProductIds?.includes(item.id);
        } else if (appliedCoupon.scope === 'category') {
          isEligible = appliedCoupon.targetCategory === 'all' || (item.category || '').toLowerCase() === (appliedCoupon.targetCategory || '').toLowerCase();
        } else {
          isEligible = true;
        }

        if (isEligible) {
          const buyQty = Number(appliedCoupon.bogoBuyQty) || 1;
          const getQty = Number(appliedCoupon.bogoGetQty) || 1;
          const bundleSize = buyQty + getQty;
          const freeUnits = Math.floor((Number(item.quantity) || 1) / bundleSize) * getQty;
          bogoDiscount += freeUnits * (Number(item.price) || 0);
        }
      });
      couponDiscount = bogoDiscount;
    }
  }

  const finalPayable = Math.max(0, totalAmount - couponDiscount);

  // If user is already logged in, go straight to Step 2
  const [step, setStep] = useState(user ? 2 : 1);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [authError, setAuthError] = useState('');
  const [guestName, setGuestName] = useState('');

  // Delivery details state: Customer Name auto-fills from Gmail; Phone starts strictly blank & is required
  const [customerName, setCustomerName] = useState(
    () => user?.name || (user?.email ? extractFullNameFromEmail(user.email) : '')
  );
  const [deliveryPhone, setDeliveryPhone] = useState(''); // strictly blank as requested by user
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [notes, setNotes] = useState('');

  // Keep customer name updated if user logs in during checkout or switches accounts
  useEffect(() => {
    if (user) {
      const bestName = user.name || (user.email ? extractFullNameFromEmail(user.email) : '');
      if (bestName) {
        setCustomerName(bestName);
      }
      setStep(2);
    }
  }, [user]);

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

  // Location / Haversine Distance: Default to neighborhood delivery center so order placing is always ready
  const [locationData, setLocationData] = useState(() => ({
    latitude: shopSettings?.latitude || 26.4519124,
    longitude: shopSettings?.longitude || 80.3537057,
    distanceKm: 0.8,
    isEligible: true
  }));
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
        customerEmail: (user?.email || '').trim().toLowerCase() || null,
        address: fullAddress,
        latitude: locationData?.latitude || shopSettings?.latitude || 26.4519124,
        longitude: locationData?.longitude || shopSettings?.longitude || 80.3537057,
        distanceKm: locationData?.distanceKm || 0.8,
        totalAmount: finalPayable,
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
      if (res && (res.success || res.id)) {
        const confirmedOrder = res.order || res;

        const clientEmail = buildClientEmailBill({
          order: confirmedOrder,
          items,
          totalAmount: finalPayable,
          shopSettings
        });

        // Automatically download PDF bill and dispatch email receipt via Store Gmail (debusahu121@gmail.com)
        const dispatchResults = autoDispatchOrderCommunications({
          order: confirmedOrder,
          items,
          totalAmount: finalPayable,
          shopSettings
        });

        const completedOrder = {
          ...confirmedOrder,
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
          customerEmail: user?.email || confirmedOrder.customerEmail || null,
          clientEmail,
          dispatchResults
        };

        try {
          const existingHistory = JSON.parse(localStorage.getItem('gs_order_history') || '[]');
          localStorage.setItem('gs_order_history', JSON.stringify([completedOrder, ...existingHistory]));
        } catch (e) {}

        try {
          confetti({
            particleCount: 60,
            spread: 80,
            origin: { y: 0.5 }
          });
        } catch (e) {}

        onOrderPlacedSuccess?.(completedOrder);
      } else {
        setOrderError(res?.error || 'Failed to place order');
      }
    } catch (err) {
      setOrderError('Failed to place order. Check server connection: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-xs flex sm:items-center justify-center p-0 sm:p-4 overflow-hidden animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl shadow-2xl flex flex-col border-0 sm:border border-slate-200 dark:border-slate-800 transition-colors overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-600 text-white p-3.5 sm:p-5 flex items-center justify-between shrink-0 shadow-sm">
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded-xl bg-white/20 shrink-0">
                  <Truck className="w-5 h-5 text-yellow-300" />
                </span>
                <h2 className="text-base sm:text-xl font-black leading-tight truncate">
                  {step === 1 ? 'Customer Identification' : 'Checkout & Delivery Details'}
                </h2>
              </div>
              <p className="text-xs text-white/90 mt-1 truncate">
                Yashi General Store • 5 km Neighborhood Doorstep Delivery
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition shrink-0 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 px-4 sm:px-6 py-2.5 border-b border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between text-xs font-bold shrink-0">
            <div className={`flex items-center gap-1.5 ${step === 1 ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-400 dark:text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'}`}>
                1
              </span>
              <span>1. Sign In (Gmail)</span>
            </div>
            <div className="h-0.5 w-10 sm:w-16 bg-slate-200 dark:bg-slate-700" />
            <div className={`flex items-center gap-1.5 ${step === 2 ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-400 dark:text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'}`}>
                2
              </span>
              <span>2. Delivery & Address</span>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 space-y-4 pb-6 overscroll-contain">
            
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
              <form id="checkout-delivery-form" onSubmit={handleSubmitDelivery} className="space-y-4">
                
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

                  {/* MOBILE NUMBER: Strictly Blank & Required! */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                      <span>Mobile Number for Delivery Call *</span>
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-black">Required</span>
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
                        placeholder="Enter 10-digit mobile number"
                        value={deliveryPhone}
                        onChange={(e) => setDeliveryPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full pl-12 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold dark:text-white placeholder:text-slate-400"
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
                    disabled={submitting || (locationData && !locationData.isEligible) || (deliveryPhone || '').replace(/[^0-9]/g, '').length < 10}
                    className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm text-white shadow-lg flex items-center justify-center space-x-2 transition active:scale-[0.99] ${
                      (!locationData || locationData.isEligible) && (deliveryPhone || '').replace(/[^0-9]/g, '').length >= 10
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
                        : locationData && !locationData.isEligible
                        ? `Delivery Blocked (${locationData.distanceKm} km > 5 km)`
                        : `Place Delivery Request (₹${finalPayable})`}
                    </span>
                  </button>

                  {locationData && !locationData.isEligible && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold text-center mt-2">
                      ⚠️ Delivery disabled: Your selected GPS coordinates are {locationData?.distanceKm} km away. We strictly deliver up to 5 km of Yashi General Store!
                    </p>
                  )}
                </div>

              </form>
            )}

          </div>

          {/* Sticky Bottom Action Bar (Guarantees Checkout Actions are Always Visible on Mobile & Desktop) */}
          <div className="shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] z-20">
            {step === 1 ? (
              <div className="flex items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setGoogleModalOpen(true)}
                  className="flex-1 py-2.5 px-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-black text-xs sm:text-sm rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center gap-2 transition active:scale-98"
                >
                  <GoogleGLogo className="w-4 h-4 shrink-0" />
                  <span>Continue with Google</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                {/* Total amount summary */}
                <div className="shrink-0 text-left">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    Total Payable
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg sm:text-xl font-black text-emerald-700 dark:text-emerald-400">
                      ₹{finalPayable}
                    </span>
                    {couponDiscount > 0 && (
                      <span className="text-[10px] font-bold text-slate-400 line-through">
                        ₹{totalAmount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                    FREE Delivery (≤5km)
                  </span>
                </div>

                {/* Sticky Submit Button */}
                <div className="flex-1 max-w-xs sm:max-w-sm">
                  <button
                    type="submit"
                    form="checkout-delivery-form"
                    disabled={submitting || (locationData && !locationData.isEligible) || (deliveryPhone || '').replace(/[^0-9]/g, '').length < 10}
                    className={`w-full py-3 px-3.5 rounded-xl font-black text-xs sm:text-sm text-white shadow-md flex items-center justify-center space-x-1.5 transition active:scale-[0.99] ${
                      (!locationData || locationData.isEligible) && (deliveryPhone || '').replace(/[^0-9]/g, '').length >= 10
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                        : 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-75'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-yellow-300 shrink-0" />
                    <span className="truncate">
                      {submitting
                        ? 'Dispatching Request...'
                        : (deliveryPhone || '').replace(/[^0-9]/g, '').length < 10
                        ? 'Enter Mobile Number'
                        : locationData && !locationData.isEligible
                        ? `Distance > 5km`
                        : `Place Order (₹${finalPayable})`}
                    </span>
                  </button>
                </div>
              </div>
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
    </>,
    document.body
  );
}
