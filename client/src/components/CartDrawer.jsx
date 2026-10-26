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
    if (totalAmount < coupon.minOrder) {
      setCouponError(`Min order of ₹${coupon.minOrder} required for ${coupon.code}`);
      return;
    }
    setAppliedCoupon(coupon);
    try {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}
    onShowToast?.({
      type: 'coupon',
      title: 'Coupon Applied! 🎉',
      message: `${coupon.code} applied successfully.`
    });
  };

  const handleManualCouponSubmit = (e) => {
    e.preventDefault();
    setCouponError('');
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    const matched = availableCoupons.find((c) => c.code === code);
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
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-screen sm:max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col transition-colors duration-200">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-emerald-700 flex items-center justify-between bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white shrink-0">
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
          <div className="bg-amber-50 dark:bg-amber-950/40 px-4 py-2 border-b border-amber-200 dark:border-amber-900/60 flex items-center gap-2 text-xs text-amber-950 dark:text-amber-300 font-medium shrink-0">
            <Truck className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
            <p>
              <strong>Notice:</strong> Local delivery strictly within <strong>5 km</strong> of Yashi General Store.
            </p>
          </div>

          {/* Total Savings Ribbon if customer saved anything */}
          {grandSavings > 0 && items.length > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-950/50 px-4 py-2 border-b border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-950 dark:text-emerald-200 font-black shrink-0">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Total Savings on this order:</span>
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 text-sm">
                ₹{grandSavings} 🎉
              </span>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <ShoppingBag className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Your basket is empty</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
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
                      className="flex items-center space-x-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition bg-white dark:bg-slate-850 shadow-2xs group"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                        onError={(e) => {
                          e.currentTarget.src = './images/hero_banner.jpg';
                        }}
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                          {item.name}
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                          {item.unit}
                        </p>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-400">
                            ₹{item.price * item.quantity}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            (₹{item.price} each)
                          </span>
                          {mrp > item.price && (
                            <span className="text-[10px] text-slate-400 line-through">
                              ₹{mrp * item.quantity}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center space-x-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shrink-0">
                        <button
                          onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 transition font-bold"
                          title="Decrease"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-black text-slate-800 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition font-bold"
                          title="Increase"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 p-1 transition"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}

                {/* You Might Also Like */}
                {suggestedItems.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2 px-1">
                      Frequently Bought Together
                    </span>
                    <div className="space-y-2">
                      {suggestedItems.map((sug) => (
                        <div
                          key={sug.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={sug.image}
                              alt={sug.name}
                              className="w-8 h-8 rounded-lg object-cover bg-slate-200 dark:bg-slate-700 shrink-0"
                              onError={(e) => {
                                e.currentTarget.src = './images/hero_banner.jpg';
                              }}
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{sug.name}</p>
                              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-black">₹{sug.price} / {sug.unit}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => onAddToCart(sug)}
                            className="px-2 py-1 text-[11px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white rounded-lg transition shrink-0"
                          >
                            + Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Coupons Section */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Apply Store Coupon</span>
                    </span>
                    {appliedCoupon && (
                      <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        {appliedCoupon.code} Active (-₹{couponDiscount})
                      </span>
                    )}
                  </div>

                  {/* Manual Coupon Input */}
                  <form onSubmit={handleManualCouponSubmit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo code (e.g. YASHI50)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={!couponInput.trim()}
                      className="px-3.5 py-1.5 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition disabled:opacity-40"
                    >
                      Apply
                    </button>
                  </form>

                  {couponError && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold px-1">
                      {couponError}
                    </p>
                  )}

                  {/* Available Coupons list */}
                  <div className="space-y-1.5 pt-1">
                    {availableCoupons.map((c) => {
                      const isApplied = appliedCoupon?.code === c.code;
                      const isEligible = totalAmount >= c.minOrder;

                      return (
                        <div
                          key={c.code}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition ${
                            isApplied
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                              : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                {c.code}
                              </span>
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                                {c.description}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                              Min order: ₹{c.minOrder}
                            </span>
                          </div>

                          {isApplied ? (
                            <button
                              onClick={() => setAppliedCoupon(null)}
                              className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-800 underline shrink-0"
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
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
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
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3 shrink-0">
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Items MRP Total</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">₹{totalMrp}</span>
                </div>

                {totalProductSavings > 0 && (
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                    <span>Store Discount</span>
                    <span>-₹{totalProductSavings}</span>
                  </div>
                )}

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>Coupon ({appliedCoupon.code})</span>
                    </span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery Charges (within 5km)</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">FREE</span>
                </div>

                <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Final Payable</span>
                  <span className="text-emerald-700 dark:text-emerald-400 text-lg">₹{finalPayable}</span>
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
                      <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-900 rounded-xl p-2.5 flex items-center gap-2 text-xs text-amber-900 dark:text-amber-300 font-bold">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          Min order value is <strong>₹{minOrder}</strong>. Add <strong>₹{needed}</strong> more to checkout!
                        </span>
                      </div>
                    ) : (
                      <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-300 font-bold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
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
                        className="w-full py-3 px-4 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold text-xs sm:text-sm rounded-xl cursor-not-allowed flex items-center justify-center space-x-1.5 border border-slate-300 dark:border-slate-700"
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

              <p className="text-[10px] text-center text-slate-400 dark:text-slate-500">
                100% Free delivery within 5 km of Yashi General Store, Mirpur Cantt
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
