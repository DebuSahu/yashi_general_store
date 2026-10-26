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

  const items = Object.values(wishlist);

  const handleMoveAllToCart = () => {
    if (items.length === 0) return;
    items.forEach((item) => {
      onAddToCart(item);
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
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-screen sm:max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-rose-600 to-pink-600 text-white">
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

          {/* Action strip if items exist */}
          {items.length > 0 && (
            <div className="bg-rose-50 px-4 py-2 border-b border-rose-100 flex items-center justify-between text-xs">
              <span className="text-rose-900 font-semibold">
                Saved for quick purchase
              </span>
              <button
                onClick={onClearWishlist}
                className="text-rose-600 hover:text-rose-800 font-bold underline"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Wishlist Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mb-3">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-700">
                  Your wishlist is empty
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Tap the heart icon on any product to save it here for fast reordering and deals tracking!
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              items.map((item) => (
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
                      Unit: {item.unit}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-black text-emerald-700">
                        ₹{item.price}
                      </span>
                      {item.mrp && item.mrp > item.price && (
                        <span className="text-[10px] text-slate-400 line-through">
                          ₹{item.mrp}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart button */}
                  <button
                    onClick={() => {
                      onAddToCart(item);
                      onShowToast?.({
                        type: 'cart',
                        title: 'Added to Cart 🛒',
                        message: `${item.name} added to cart.`
                      });
                    }}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white transition shadow-2xs active:scale-95"
                    title="Add to Cart"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  {/* Remove from Wishlist button */}
                  <button
                    onClick={() => onRemoveFromWishlist(item.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 transition"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer & Move All Button */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 space-y-2.5">
              <button
                onClick={handleMoveAllToCart}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Move All ({items.length}) to Cart</span>
              </button>
              <p className="text-[10px] text-center text-slate-400">
                All items eligible for superfast 5km delivery from Yashi General Store
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

