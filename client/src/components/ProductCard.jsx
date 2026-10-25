import React from 'react';
import { Plus, Minus, ShoppingCart, Carrot, ShoppingBag, Package, Milk, IceCream, BookOpen } from 'lucide-react';

export default function ProductCard({
  product,
  cartQty,
  onAddToCart,
  onUpdateQty,
  isAdmin = false,
  onToggleStock
}) {
  const isOutOfStock = product.inStock === false || product.stock === 0;
  const [imgSrc, setImgSrc] = React.useState(product.image);

  React.useEffect(() => {
    setImgSrc(product.image);
  }, [product.image]);

  const handleImageError = () => {
    // Fall back gracefully to category showcase image if specific packshot fails
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
          <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-900 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider">
            <Milk className="w-3 h-3 text-sky-700" /> Dairy
          </span>
        );
      case 'icecream':
      case 'ice':
        return (
          <span className="inline-flex items-center gap-1 bg-pink-100 text-pink-900 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider">
            <IceCream className="w-3 h-3 text-pink-700" /> Ice Cream
          </span>
        );
      case 'vegetables':
      case 'vegetable':
        return (
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider">
            <Carrot className="w-3 h-3 text-green-700" /> Vegetables
          </span>
        );
      case 'grocery':
      case 'groceries':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider">
            <ShoppingBag className="w-3 h-3 text-amber-700" /> Grocery
          </span>
        );
      case 'stationery':
      case 'stationary':
        return (
          <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-900 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider">
            <BookOpen className="w-3 h-3 text-indigo-700" /> Stationery
          </span>
        );
      case 'generalstore':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-900 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider">
            <Package className="w-3 h-3 text-purple-700" /> General Store
          </span>
        );
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
      
      {/* Product Image & Badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        <img
          src={imgSrc}
          alt={product.name}
          onError={handleImageError}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            isOutOfStock ? 'grayscale opacity-60' : ''
          }`}
          loading="lazy"
        />

        {/* Top Badges (Category + Brand) */}
        <div className="absolute top-1.5 left-1.5 right-1.5 sm:top-2 sm:left-2 sm:right-2 flex items-center justify-between gap-1 flex-wrap pointer-events-none">
          <div>{getCategoryBadge(product.category)}</div>

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

        {isOutOfStock ? (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-2 text-center">
            <span className="bg-red-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg">
              Out of Stock
            </span>
          </div>
        ) : product.stock <= 5 ? (
          <span className="absolute bottom-2 left-2 bg-amber-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md shadow-sm">
            Only {product.stock} left
          </span>
        ) : null}
      </div>

      {/* Product Details */}
      <div className="p-2 sm:p-4 flex-1 flex flex-col justify-between min-w-0">
        <div className="min-w-0">
          <h3
            className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition line-clamp-2 leading-snug mb-1"
            title={product.name}
          >
            {product.name}
          </h3>

          <p className="text-[10px] sm:text-[11px] text-gray-500 mb-1 sm:mb-2 truncate">
            Unit: <span className="font-semibold text-gray-700">{product.unit}</span>
          </p>

          {product.description && (
            <p className="hidden sm:line-clamp-2 text-[11px] text-gray-400 mb-2">
              {product.description}
            </p>
          )}
        </div>

        {/* Pricing and Cart Stepper */}
        <div className="pt-1.5 sm:pt-2 border-t border-gray-50 flex items-center justify-between gap-1 mt-auto min-w-0">
          <div className="min-w-0">
            <span className="text-sm sm:text-lg font-black text-emerald-700">
              ₹{product.price}
            </span>
            <span className="hidden sm:inline-block text-[10px] text-gray-400 font-medium ml-1">
              /{product.unit.split(' ')[0]}
            </span>
          </div>

          {/* Cart Controls */}
          {isOutOfStock ? (
            <span className="px-1.5 py-0.5 text-[9px] sm:text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg shrink-0">
              Out of stock
            </span>
          ) : cartQty > 0 ? (
            <div className="flex items-center space-x-1 sm:space-x-1.5 bg-emerald-50 border border-emerald-300 rounded-xl p-0.5 sm:p-1 shrink-0">
              <button
                onClick={() => onUpdateQty(product.id, cartQty - 1)}
                className="w-5 h-5 sm:w-7 sm:h-7 rounded-lg bg-white text-emerald-800 flex items-center justify-center hover:bg-emerald-100 active:scale-90 shadow-2xs transition"
                title="Decrease quantity"
              >
                <Minus className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
              </button>
              <span className="w-4 sm:w-5 text-center text-xs font-black text-emerald-900">
                {cartQty}
              </span>
              <button
                onClick={() => onUpdateQty(product.id, cartQty + 1)}
                className="w-5 h-5 sm:w-7 sm:h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 active:scale-90 shadow-2xs transition"
                title="Increase quantity"
              >
                <Plus className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(product)}
              className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-2 rounded-xl shadow-xs hover:shadow active:scale-95 transition shrink-0"
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
