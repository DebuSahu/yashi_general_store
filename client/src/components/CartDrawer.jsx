import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  onProceedCheckout,
  shopSettings
}) {
  if (!isOpen) return null;

  const items = Object.values(cart);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-screen sm:max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-emerald-600 text-white">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5" />
              <h2 className="text-base sm:text-lg font-bold">Your Delivery Cart</h2>
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

          {/* 5km Radius Reminder Notice */}
          <div className="bg-amber-50 px-4 py-2.5 border-b border-amber-200 flex items-center gap-2 text-xs text-amber-900">
            <Truck className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <p>
              <strong>Notice:</strong> We only deliver up to <strong>5km</strong> from Yashi General Store. Free delivery applied!
            </p>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <ShoppingBag className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-base font-bold text-gray-700">Your cart is empty</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  Add fresh vegetables, grocery essentials, and daily provisions to send a delivery request!
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition bg-white shadow-2xs"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-lg bg-gray-50 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      ₹{item.price} per {item.unit}
                    </p>
                    <p className="text-xs font-black text-emerald-700 mt-0.5">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center space-x-1.5 bg-gray-50 border border-gray-200 rounded-lg p-1">
                    <button
                      onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center rounded bg-white text-gray-700 hover:bg-gray-100 shadow-2xs text-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-gray-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center rounded bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs text-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Button */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50 space-y-3">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges (within 5km)</span>
                  <span className="font-bold text-emerald-600 uppercase">FREE</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total Amount</span>
                  <span className="text-emerald-700">₹{totalAmount}</span>
                </div>
              </div>

              {/* Minimum Order Value Status */}
              {(() => {
                const minOrder = shopSettings?.minOrderAmount || 100;
                const isBelowMin = totalAmount < minOrder;
                const needed = minOrder - totalAmount;

                return (
                  <div className="space-y-2.5">
                    {isBelowMin ? (
                      <div className="bg-amber-50 border border-amber-300 rounded-xl p-2.5 flex items-center gap-2 text-xs text-amber-900 font-bold">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>
                          Min order value is <strong>₹{minOrder}</strong>. Add <strong>₹{needed}</strong> more to checkout!
                        </span>
                      </div>
                    ) : (
                      <div className="bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-emerald-900 font-bold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Minimum order value met (₹{minOrder})</span>
                        </span>
                        <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-black">
                          Ready ✅
                        </span>
                      </div>
                    )}

                    {isBelowMin ? (
                      <button
                        disabled
                        className="w-full py-3 px-4 bg-gray-200 text-gray-500 font-extrabold text-xs sm:text-sm rounded-xl cursor-not-allowed flex items-center justify-center space-x-1.5 shadow-2xs border border-gray-300"
                      >
                        <span>Add ₹{needed} more to Order (Min ₹{minOrder})</span>
                      </button>
                    ) : (
                      <button
                        onClick={onProceedCheckout}
                        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 transition"
                      >
                        <span>Request Home Delivery</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })()}
              
              <p className="text-[11px] text-center text-gray-400">
                Deliveries up to 5km • Free delivery • Min order ₹{shopSettings?.minOrderAmount || 100}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

