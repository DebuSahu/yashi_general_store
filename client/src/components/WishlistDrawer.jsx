import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight, Plus, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function WishlistDrawer({
  isOpen,
  onClose,
  wishlist = {},
  onRemoveFromWishlist,
  onClearWishlist,
  onAddToCart,
  onShowToast
}) {
  if (!isOpen) return null;

  const items = Object.values(wishlist || {}).filter(Boolean);

  const handleMoveAllToCart = () => {
    if (items.length === 0) return;
    items.forEach((item) => {
      if (item) onAddToCart(item);
    });
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.5 }
      });
    } catch (e) {}
    onShowToast?.({
      type: 'cart',
      title: 'Moved to Cart! 🛒',
      message: `Added all ${items.length} wishlist items to your basket.`
    });
  };

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
          <div className="p-4 sm:p-5 border-b border-rose-500 flex items-center justify-between bg-gradient-to-r from-rose-600 to-pink-600 text-white shrink-0">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 fill-white" />
              <h2 className="text-base sm:text-lg font-black">My Wishlist</h2>
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
                <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center mb-3">
                  <Heart className="w-8 h-8 text-rose-400" />
                </div>
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Your wishlist is empty</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  Tap the heart icon on any product to save it to your favorites for quick ordering later.
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-rose-600/20"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Saved Products ({items.length})
                  </span>
                  <button
                    onClick={onClearWishlist}
                    className="text-[11px] font-bold text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition"
                  >
                    Clear All
                  </button>
                </div>

                {items.map((item) => (
                  <div
                    key={item?.id}
                    className="flex items-center space-x-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition bg-white dark:bg-slate-850 shadow-2xs group"
                  >
                    <img
                      src={item?.image}
                      alt={item?.name || 'Item'}
                      className="w-14 h-14 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                      onError={(e) => {
                        e.currentTarget.src = './images/hero_banner.jpg';
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                        {item?.name}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                        {item?.unit}
                      </p>
                      <p className="text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                        ₹{item?.price}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        onClick={() => {
                          onAddToCart(item);
                          onShowToast?.({
                            type: 'cart',
                            title: 'Added to Basket! 🛒',
                            message: `${item?.name || 'Item'} added.`
                          });
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition active:scale-95 shadow-2xs flex items-center gap-1"
                        title="Add to cart"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>

                      <button
                        onClick={() => onRemoveFromWishlist(item?.id)}
                        className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2 shrink-0">
              <button
                onClick={handleMoveAllToCart}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition active:scale-98"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Move All to Delivery Basket</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-center text-slate-400 dark:text-slate-500">
                100% Free doorstep delivery on orders within 5km of Yashi General Store
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
