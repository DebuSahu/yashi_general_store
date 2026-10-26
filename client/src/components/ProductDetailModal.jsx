import React, { useState } from 'react';
import {
  X,
  Star,
  Heart,
  Share2,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Plus,
  Minus,
  ShoppingCart,
  Sparkles,
  MessageSquare,
  Package
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  cartQty = 0,
  onAddToCart,
  onUpdateQty,
  isWishlisted = false,
  onToggleWishlist,
  onShowToast,
  allProducts = []
}) {

  const [userRating, setUserRating] = useState(5);
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewsList, setReviewsList] = useState(() => {
    return [
      {
        id: 1,
        author: 'Priya Sharma (Mirpur Cantt)',
        rating: 5,
        date: 'Yesterday',
        verified: true,
        text: 'Super fresh quality! Delivered in just 20 minutes to our home near Water Tank. Highly recommended local store.'
      },
      {
        id: 2,
        author: 'Amitabh Verma',
        rating: 5,
        date: '3 days ago',
        verified: true,
        text: 'Original seal intact. Best pricing in the cantonment area with free doorstep delivery.'
      },
      {
        id: 3,
        author: 'Suman Gupta',
        rating: 4,
        date: 'Last week',
        verified: true,
        text: 'Very satisfied. Packaging was clean and prompt delivery.'
      }
    ];
  });

  const mrp = product.mrp || Math.round(product.price * 1.15);
  const discount = Math.round(((mrp - product.price) / mrp) * 100);
  const savings = mrp - product.price;
  const isOutOfStock = product.inStock === false || product.stock === 0;

  // Cross-sell items from same or other category
  const companionProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 2);

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    const newRev = {
      id: Date.now(),
      author: reviewName.trim() || 'Verified Customer',
      rating: userRating,
      date: 'Just now',
      verified: true,
      text: reviewComment.trim()
    };

    setReviewsList([newRev, ...reviewsList]);
    setReviewComment('');
    setReviewName('');
    onShowToast?.({
      type: 'success',
      title: 'Review Submitted! ⭐',
      message: 'Thank you for your rating on Yashi General Store.'
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Buy ${product.name} at Yashi General Store (₹${product.price}) with 5km delivery!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      onShowToast?.({
        type: 'info',
        title: 'Link Copied 📋',
        message: 'Product link copied to your clipboard!'
      });
    }
  };

  const handleTriggerAddToCart = () => {
    onAddToCart(product);
    try {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 }
      });
    } catch (e) {}
    onShowToast?.({
      type: 'cart',
      title: 'Added to Cart 🛒',
      message: `${product.name} added to your basket!`
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 transition-colors">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {product.category}
            </span>
            {product.brand && (
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 dark:bg-slate-700 text-white">
                {product.brand}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>100% Veg</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              title="Share product"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleWishlist(product)}
              className="p-2 rounded-xl transition hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Save to Wishlist"
            >
              <Heart
                className={`w-5 h-5 transition-transform active:scale-125 ${
                  isWishlisted
                    ? 'text-rose-500 fill-rose-500'
                    : 'text-slate-400 hover:text-rose-500'
                }`}
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Left: Product Image & Badges */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 shadow-inner group">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = './images/hero_banner.jpg';
                  }}
                />
                {discount > 0 && (
                  <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-md uppercase tracking-wide">
                    {discount}% OFF
                  </span>
                )}
                {product.badge && (
                  <span className="absolute top-3 right-3 bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{product.badge}</span>
                  </span>
                )}
              </div>

              {/* Delivery Promise Highlights */}
              <div className="w-full mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                  <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Superfast 15-30 Min Delivery within 5 km</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>100% Genuine Daily Fresh Batch</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                  <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Clean & Hygienic Neighborhood Packing</span>
                </div>
              </div>
            </div>

            {/* Right: Product Details, Pricing, & Action */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                  {product.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Unit: <span className="font-bold text-slate-800 dark:text-slate-200">{product.unit}</span>
                </p>

                {/* Rating Bar */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="inline-flex items-center gap-1 bg-emerald-600 text-white text-xs font-black px-2 py-0.5 rounded-lg">
                    <span>{product.rating || 4.8}</span>
                    <Star className="w-3 h-3 fill-current" />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    ({product.reviewCount || 92} Customer Ratings & Reviews)
                  </span>
                </div>
              </div>

              {/* Pricing Box */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 flex items-baseline justify-between">
                <div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-800 dark:text-emerald-300">
                      ₹{product.price}
                    </span>
                    {mrp > product.price && (
                      <span className="text-sm font-bold text-slate-400 line-through">
                        MRP ₹{mrp}
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-700">
                        Save ₹{savings} ({discount}% OFF)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                    Inclusive of all taxes • 100% Free delivery within 5 km
                  </p>
                </div>

                {/* Stock meter */}
                <div className="text-right">
                  {isOutOfStock ? (
                    <span className="px-2.5 py-1 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-black text-xs">
                      Out of Stock
                    </span>
                  ) : product.stock <= 5 ? (
                    <span className="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold text-[11px] animate-pulse">
                      Only {product.stock} left!
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                      In Stock ({product.stock} units)
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                  Product Description
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {product.description ||
                    `Premium quality ${product.name} sourced directly for Yashi General Store. Fresh, authentic, and inspected for absolute hygiene and customer satisfaction.`}
                </p>
              </div>

              {/* Cart Action Buttons */}
              <div className="pt-2">
                {isOutOfStock ? (
                  <button
                    disabled
                    className="w-full py-3 bg-slate-200 dark:bg-slate-800 text-slate-400 font-black text-sm rounded-2xl cursor-not-allowed"
                  >
                    Currently Out of Stock
                  </button>
                ) : cartQty > 0 ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 rounded-2xl p-1.5 px-4 shadow-sm">
                      <button
                        onClick={() => onUpdateQty(product.id, cartQty - 1)}
                        className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-emerald-900 dark:text-emerald-200 flex items-center justify-center font-black shadow-xs hover:bg-emerald-100 active:scale-90 transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-base font-black text-emerald-900 dark:text-emerald-200 w-8 text-center">
                        {cartQty}
                      </span>
                      <button
                        onClick={() => onUpdateQty(product.id, cartQty + 1)}
                        className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs hover:bg-emerald-700 active:scale-90 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 text-xs font-bold text-slate-600 dark:text-slate-400">
                      Total in Cart: <strong className="text-emerald-700 dark:text-emerald-400">₹{cartQty * product.price}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2.5">
                    <button
                      onClick={handleTriggerAddToCart}
                      className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart (₹{product.price})</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Frequently Bought Together Cross-Sell */}
          {companionProducts.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Frequently Bought Together</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {companionProducts.map((comp) => (
                  <div
                    key={comp.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100/70 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={comp.image}
                        alt={comp.name}
                        className="w-11 h-11 rounded-xl object-cover bg-white dark:bg-slate-900 shrink-0 border border-slate-200 dark:border-slate-700"
                        onError={(e) => { e.currentTarget.src = './images/hero_banner.jpg'; }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {comp.name}
                        </p>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-black">
                          ₹{comp.price} <span className="text-slate-400 font-normal">/ {comp.unit}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onAddToCart(comp);
                        onShowToast?.({
                          type: 'cart',
                          title: 'Item Added!',
                          message: `${comp.name} added to cart.`
                        });
                      }}
                      className="shrink-0 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-emerald-600 hover:text-white text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-black text-xs rounded-xl transition shadow-2xs active:scale-95 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Reviews & Ratings Section */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Customer Feedback & Reviews
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {reviewsList.length} Verified Reviews
              </span>
            </div>

            {/* Write a Review Box */}
            <form onSubmit={handleAddReview} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-4 space-y-2.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Leave a Verified Review:
              </span>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setUserRating(star)}
                      className="p-0.5 focus:outline-none"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= userRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300 ml-1">
                    {userRating} / 5 Stars
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Your Name (e.g. Rahul K.)"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none flex-1 min-w-[140px] dark:text-white"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Share your experience (e.g. Fresh milk, quick delivery!)..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none flex-1 dark:text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition shrink-0"
                >
                  Post Review
                </button>
              </div>
            </form>

            {/* List of Reviews */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {reviewsList.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-2xs space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-slate-800 dark:text-slate-200">{rev.author}</span>
                      {rev.verified && (
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{rev.date}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200 dark:text-slate-700'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                    {rev.text}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 px-6 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span>Yashi General Store • 5km Delivery Perimeter</span>
          <button
            onClick={onClose}
            className="font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
}
