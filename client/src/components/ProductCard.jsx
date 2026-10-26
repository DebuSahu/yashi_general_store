import React, { useState } from 'react';
import {
  Plus,
  Minus,
  ShoppingCart,
  Carrot,
  ShoppingBag,
  Package,
  Milk,
  IceCream,
  BookOpen,
  Heart,
  Eye,
  Star,
  Sparkles,
  Zap,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProductCard({
  product,
  cartQty = 0,
  onAddToCart,
  onUpdateQty,
  isAdmin = false,
  onToggleStock,
  isWishlisted = false,
  onToggleWishlist,
  onOpenQuickView,
  onShowToast
}) {
  const isOutOfStock = product.inStock === false || product.stock === 0;
  const [imgSrc, setImgSrc] = useState(product.image);
  const [isHovered, setIsHovered] = useState(false);

  React.useEffect(() => {
    setImgSrc(product.image);
  }, [product.image]);

  const handleImageError = () => {
    const cat = (product.category || '').toLowerCase().replace(/\s+/g, '');
    if (cat.includes('dairy')) {
      setImgSrc('./images/dairy_showcase.jpg');
    } else if (cat.includes('ice')) {
      setImgSrc('./images/icecream_showcase.jpg');
    } else if (cat.includes('veg')) {
      setImgSrc('./images/vegetables_showcase.jpg');
    } else if (cat.includes('groc')) {
      setImgSrc('./images/grocery_showcase.jpg');
    } else if (cat.includes('stat')) {
      setImgSrc('./images/stationery_showcase.jpg');
    } else {
      setImgSrc('./images/cleaning_showcase.jpg');
    }
  };

  const getCategoryBadge = (category) => {
    switch (category?.toLowerCase()?.replace(/\s+/g, '')) {
      case 'dairy':
      case 'dairyproducts':
        return (
          <span className="inline-flex items-center gap-1 bg-sky-100/90 text-sky-900 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-xs">
            <Milk className="w-3 h-3 text-sky-700" /> Dairy
          </span>
        );
      case 'icecream':
      case 'ice':
        return (
          <span className="inline-flex items-center gap-1 bg-pink-100/90 text-pink-900 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-xs">
            <IceCream className="w-3 h-3 text-pink-700" /> Ice Cream
          </span>
        );
      case 'vegetables':
      case 'vegetable':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100/90 text-emerald-800 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-xs">
            <Carrot className="w-3 h-3 text-emerald-700" /> Vegetables
          </span>
        );
      case 'grocery':
      case 'groceries':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100/90 text-amber-900 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-xs">
            <ShoppingBag className="w-3 h-3 text-amber-700" /> Grocery
          </span>
        );
      case 'stationery':
      case 'stationary':
        return (
          <span className="inline-flex items-center gap-1 bg-indigo-100/90 text-indigo-900 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-xs">
            <BookOpen className="w-3 h-3 text-indigo-700" /> Stationery
          </span>
        );
      case 'generalstore':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-purple-100/90 text-purple-900 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-xs">
            <Package className="w-3 h-3 text-purple-700" /> Essentials
          </span>
        );
    }
  };

  const mrp = product.mrp || Math.round(product.price * 1.15);
  const discount = Math.round(((mrp - product.price) / mrp) * 100);
  const savings = mrp - product.price;

  const handleAddToCartWithCelebration = (e) => {
    e.stopPropagation();
    onAddToCart(product);
    try {
      confetti({
        particleCount: 22,
        spread: 45,
        origin: { y: 0.7 }
      });
    } catch (err) {}
    onShowToast?.({
      type: 'cart',
      title: 'Added to Basket! 🛒',
      message: `${product.name} (₹${product.price})`
    });
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full min-w-0 max-w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group relative"
    >
      {/* Product Image & Overlays */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
        <img
          src={imgSrc}
          alt={product.name}
          onError={handleImageError}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out cursor-pointer ${
            isOutOfStock ? 'grayscale opacity-60' : ''
          }`}
          loading="lazy"
          onClick={() => onOpenQuickView?.(product)}
        />

        {/* Top Badges Bar: Category on left, Wishlist on right */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
          <div className="flex items-center gap-1 flex-wrap pointer-events-auto">
            {getCategoryBadge(product.category)}

            {product.brand && (
              <span
                className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs ${
                  product.brand.toLowerCase() === 'amul'
                    ? 'bg-blue-600 text-white'
                    : 'bg-red-600 text-white'
                }`}
              >
                {product.brand}
              </span>
            )}
          </div>

          {/* Wishlist Heart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist?.(product);
            }}
            className="pointer-events-auto p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-400 hover:text-rose-500 shadow-md backdrop-blur-xs transition-transform active:scale-125"
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                isWishlisted
                  ? 'text-rose-500 fill-rose-500 animate-heartbeat'
                  : 'text-slate-400 hover:text-rose-500'
              }`}
            />
          </button>
        </div>

        {/* Savings Ribbon / Badge */}
        {discount > 0 && !isOutOfStock && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-md tracking-wider">
              {discount}% OFF
            </span>
          </div>
        )}

        {/* Quick View Eye Button (Appears on hover) */}
        <button
          onClick={() => onOpenQuickView?.(product)}
          className={`absolute inset-x-4 bottom-3 py-1.5 bg-white/95 hover:bg-white text-slate-800 text-[11px] font-black rounded-xl shadow-lg border border-slate-200 backdrop-blur-xs flex items-center justify-center gap-1.5 transition-all duration-200 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-emerald-600" />
          <span>Quick View</span>
        </button>

        {/* Out of Stock Overlay */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center p-2 text-center pointer-events-none">
            <span className="bg-rose-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
              Out of Stock
            </span>
          </div>
        ) : product.stock <= 5 ? (
          <span className="absolute top-10 left-2 bg-amber-500 text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
            <Zap className="w-2.5 h-2.5" />
            <span>Only {product.stock} left</span>
          </span>
        ) : null}
      </div>

      {/* Product Details */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between min-w-0">
        <div className="min-w-0">
          
          {/* Rating & Pure Veg indicator */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <div className="inline-flex items-center gap-0.5 text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded font-black text-[10px] border border-emerald-200/80">
              <Star className="w-2.5 h-2.5 fill-current text-emerald-600" />
              <span>{product.rating || 4.8}</span>
              <span className="text-slate-400 font-normal">({product.reviewCount || 42})</span>
            </div>

            {/* Pure Veg Pill Indicator */}
            <span
              className="inline-flex items-center gap-0.5 text-[9px] font-black text-emerald-700 bg-emerald-50/80 px-1.5 py-0.2 rounded border border-emerald-300"
              title="100% Pure Vegetarian"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>Veg</span>
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onOpenQuickView?.(product)}
            className="text-xs sm:text-sm font-extrabold text-slate-900 hover:text-emerald-700 transition line-clamp-2 leading-snug mb-1 cursor-pointer"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Unit */}
          <p className="text-[10px] sm:text-[11px] text-slate-500 mb-1.5 truncate">
            Unit: <span className="font-bold text-slate-700">{product.unit}</span>
          </p>
        </div>

        {/* Pricing and Cart Stepper */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 mt-auto min-w-0">
          
          {/* Price + Strikethrough MRP */}
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-lg font-black text-emerald-700">
                ₹{product.price}
              </span>
              {mrp > product.price && (
                <span className="text-[10px] sm:text-xs text-slate-400 font-bold line-through">
                  ₹{mrp}
                </span>
              )}
            </div>
            {savings > 0 && (
              <p className="text-[9px] sm:text-[10px] font-extrabold text-emerald-700 truncate">
                Save ₹{savings}
              </p>
            )}
          </div>

          {/* Cart Stepper Controls */}
          {isOutOfStock ? (
            <span className="px-2 py-1 text-[9px] sm:text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl shrink-0">
              Out
            </span>
          ) : cartQty > 0 ? (
            <div className="flex items-center space-x-1 sm:space-x-1.5 bg-emerald-50 border border-emerald-400 rounded-xl p-0.5 sm:p-1 shrink-0 shadow-2xs">
              <button
                onClick={() => onUpdateQty(product.id, cartQty - 1)}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white text-emerald-800 flex items-center justify-center hover:bg-emerald-100 active:scale-90 shadow-2xs transition font-black"
                title="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-4 sm:w-5 text-center text-xs font-black text-emerald-900">
                {cartQty}
              </span>
              <button
                onClick={() => onUpdateQty(product.id, cartQty + 1)}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 active:scale-90 shadow-2xs transition font-black"
                title="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCartWithCelebration}
              className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[10px] sm:text-xs font-black px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition shrink-0"
            >
              <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Add</span>
            </button>
          )}
        </div>

        {/* Direct Admin In-Stock / Out of Stock Control */}
        {isAdmin && (
          <div className="mt-2 pt-1.5 border-t border-dashed border-purple-200 flex flex-col items-stretch gap-1 bg-purple-50/70 p-1.5 rounded-xl min-w-0 w-full">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-purple-700">
                Stock:
              </span>
              <span className={`text-[9px] font-extrabold ${!isOutOfStock ? 'text-emerald-700' : 'text-red-600'}`}>
                {!isOutOfStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 w-full bg-white p-0.5 border border-purple-200 rounded-lg shadow-2xs">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStock?.(product.id, true);
                }}
                className={`w-full py-1 rounded text-[9px] sm:text-[10px] font-extrabold transition text-center ${
                  !isOutOfStock
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-500 hover:text-emerald-700 bg-gray-50'
                }`}
                title="Directly mark In Stock"
              >
                ✓ In Stock
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStock?.(product.id, false);
                }}
                className={`w-full py-1 rounded text-[9px] sm:text-[10px] font-extrabold transition text-center ${
                  isOutOfStock
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-gray-500 hover:text-red-700 bg-gray-50'
                }`}
                title="Directly mark Out of Stock"
              >
                ✕ Out
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
