import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Truck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Tag,
  Check,
  Percent,
  Gift
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  onAddToCart,
  onProceedCheckout,
  shopSettings,
  appliedCoupon,
  setAppliedCoupon,
  allProducts = [],
  onShowToast
}) {
  if (!isOpen) return null;

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const items = Object.values(cart);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalMrp = items.reduce((sum, item) => {
    const mrp = item.mrp || Math.round(item.price * 1.15);
    return sum + mrp * item.quantity;
  }, 0);
  const totalProductSavings = Math.max(0, totalMrp - totalAmount);

  // Available coupons
  const availableCoupons = [
    {
      code: 'YASHI50',
      description: 'Flat ₹50 OFF on orders above ₹299',
      minOrder: 299,
      type: 'flat',
      value: 50
    },
    {
      code: 'WELCOME10',
      description: '10% OFF up to ₹100 on all orders',
      minOrder: 150,
      type: 'percent',
      value: 10,
      maxDiscount: 100
    },
    {
      code: 'FREEDEL',
      description: 'Free Express Priority Delivery Guaranteed',
      minOrder: 100,
      type: 'flat',
      value: 20
    }
  ];

  // Calculate discount from coupon
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
  const grandSavings = totalProductSavings + couponDiscount;

  const handleApplyCoupon = (coupon) => {
    setCouponError('');
    if (totalAmount < (coupon.minOrder || 100)) {
      setCouponError(`Min order value for ${coupon.code} is ₹${coupon.minOrder}.`);
      return;
    }

    setAppliedCoupon(coupon);
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    onShowToast?.({
      type: 'coupon',
      title: 'Coupon Applied! 🎉',
      message: `${coupon.code} applied successfully.`
    });
  };

  const handleApplyCustomCode = (e) => {
    e.preventDefault();
    setCouponError('');
    const clean = couponInput.trim().toUpperCase();
    if (!clean) return;

    const matched = availableCoupons.find((c) => c.code === clean);
    if (!matched) {
      setCouponError('Invalid coupon code. Try YASHI50 or WELCOME10');
      return;
    }

    handleApplyCoupon(matched);
    setCouponInput('');
  };

  // Cross-sell companion recommendations (items not in cart)
  const cartIds = new Set(items.map((i) => i.id));
  const suggestedItems = allProducts.filter((p) => !cartIds.has(p.id)).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-screen sm:max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-emerald-700 flex items-center justify-between bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5" />
              <h2 className="text-base sm:text-lg font-black">Your Delivery Basket</h2>
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {items.reduce((acc, i) => acc + i.quantity, 0)} items
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 5km Radius Notice */}
          <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 flex items-center gap-2 text-xs text-amber-950 font-medium">
            <Truck className="w-4 h-4 text-amber-700 shrink-0" />
            <p>
              <strong>Notice:</strong> Fast local delivery strictly within <strong>5 km</strong> of Yashi General Store.
            </p>
          </div>

          {/* Total Savings Ribbon if customer saved anything */}
          {grandSavings > 0 && items.length > 0 && (
            <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-200 flex items-center justify-between text-xs text-emerald-950 font-black">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Total Savings on this order:</span>
              </span>
              <span className="text-emerald-700 text-sm">
                ₹{grandSavings} 🎉
              </span>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <ShoppingBag className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-slate-700">Your basket is empty</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Add fresh milk, vegetables, grocery essentials, and ice creams to request 5km home delivery!
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-600/20"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {items.map((item) => {
                  const mrp = item.mrp || Math.round(item.price * 1.15);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center space-x-3 p-3 rounded-2xl border border-slate-100 hover:border-slate-200 transition bg-white shadow-2xs group"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-xl bg-slate-50 shrink-0 border border-slate-100"
                        onError={(e) => { e.currentTarget.src = './images/hero_banner.jpg'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          ₹{item.price} per {item.unit}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-black text-emerald-700">
                            ₹{item.price * item.quantity}
                          </span>
                          {mrp > item.price && (
                            <span className="text-[10px] text-slate-400 line-through">
                              ₹{mrp * item.quantity}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1 shrink-0">
                        <button
                          onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-white text-slate-700 hover:bg-slate-100 shadow-2xs text-xs font-black"
                          title="Decrease"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-black text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs text-xs font-black"
                          title="Increase"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-500 transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}

                {/* Frequently Bought Together / Cross-Sell in Cart */}
                {suggestedItems.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Add Everyday Essentials</span>
                      </span>
                    </div>

                    <div className="space-y-2">
                      {suggestedItems.map((sug) => (
                        <div
                          key={sug.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={sug.image}
                              alt={sug.name}
                              className="w-9 h-9 rounded-lg object-cover bg-white shrink-0 border border-slate-200"
                              onError={(e) => { e.currentTarget.src = './images/hero_banner.jpg'; }}
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">
                                {sug.name}
                              </p>
                              <p className="text-[10px] text-emerald-700 font-extrabold">
                                ₹{sug.price}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              onAddToCart(sug);
                              onShowToast?.({
                                type: 'cart',
                                title: 'Added to Cart 🛒',
                                message: `${sug.name} added.`
                              });
                            }}
                            className="shrink-0 px-2.5 py-1 bg-white hover:bg-emerald-600 hover:text-white text-emerald-800 border border-emerald-300 font-black text-xs rounded-lg transition active:scale-95 shadow-2xs flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Coupons & Promo Codes Section */}
                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Apply Store Coupons</span>
                  </span>

                  {/* Custom coupon input */}
                  <form onSubmit={handleApplyCustomCode} className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Enter promo code (e.g. YASHI50)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-1 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl transition shrink-0"
                    >
                      Apply
                    </button>
                  </form>

                  {couponError && (
                    <p className="text-[11px] text-rose-600 font-bold">{couponError}</p>
                  )}

                  {/* Preset Coupons List */}
                  <div className="space-y-1.5">
                    {availableCoupons.map((c) => {
                      const isApplied = appliedCoupon?.code === c.code;
                      const isEligible = totalAmount >= c.minOrder;

                      return (
                        <div
                          key={c.code}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition ${
                            isApplied
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                              : 'bg-white border-slate-200 hover:border-emerald-300'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                {c.code}
                              </span>
                              <span className="text-[11px] font-bold text-slate-700 truncate">
                                {c.description}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Min order: ₹{c.minOrder}
                            </span>
                          </div>

                          {isApplied ? (
                            <button
                              onClick={() => setAppliedCoupon(null)}
                              className="text-[11px] font-bold text-rose-600 hover:text-rose-800 underline shrink-0"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApplyCoupon(c)}
                              disabled={!isEligible}
                              className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-black transition active:scale-95 ${
                                isEligible
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer & Checkout Button */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Items MRP Total</span>
                  <span className="font-semibold text-slate-700">₹{totalMrp}</span>
                </div>

                {totalProductSavings > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Store Discount</span>
                    <span>-₹{totalProductSavings}</span>
                  </div>
                )}

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>Coupon ({appliedCoupon.code})</span>
                    </span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery Charges (within 5km)</span>
                  <span className="font-bold text-emerald-600 uppercase">FREE</span>
                </div>

                <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Final Payable</span>
                  <span className="text-emerald-700 text-lg">₹{finalPayable}</span>
                </div>
              </div>

              {/* Minimum Order Value Status */}
              {(() => {
                const minOrder = shopSettings?.minOrderAmount || 100;
                const isBelowMin = finalPayable < minOrder;
                const needed = minOrder - finalPayable;

                return (
                  <div className="space-y-2">
                    {isBelowMin ? (
                      <div className="bg-amber-50 border border-amber-300 rounded-xl p-2.5 flex items-center gap-2 text-xs text-amber-900 font-bold">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          Min order value is <strong>₹{minOrder}</strong>. Add <strong>₹{needed}</strong> more to checkout!
                        </span>
                      </div>
                    ) : (
                      <div className="bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-emerald-900 font-bold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Minimum order met (₹{minOrder})</span>
                        </span>
                        <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-black">
                          Ready ✅
                        </span>
                      </div>
                    )}

                    {isBelowMin ? (
                      <button
                        disabled
                        className="w-full py-3 px-4 bg-slate-200 text-slate-500 font-extrabold text-xs sm:text-sm rounded-xl cursor-not-allowed flex items-center justify-center space-x-1.5 border border-slate-300"
                      >
                        <span>Add ₹{needed} more to Order (Min ₹{minOrder})</span>
                      </button>
                    ) : (
                      <button
                        onClick={onProceedCheckout}
                        className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 transition"
                      >
                        <span>Request Home Delivery (₹{finalPayable})</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })()}

              <p className="text-[10px] text-center text-slate-400">
                100% Free delivery within 5 km of Yashi General Store, Mirpur Cantt
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
