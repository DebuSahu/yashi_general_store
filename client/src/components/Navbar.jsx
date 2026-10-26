import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingCart,
  Store,
  ShieldCheck,
  User,
  Search,
  PackageCheck,
  PhoneCall,
  MapPin,
  Heart,
  History,
  Sparkles,
  Plus,
  ArrowRight
} from 'lucide-react';
import YGSLogo from './YGSLogo';
import { GoogleGLogo } from './GoogleAuthModal';

export default function Navbar({
  searchTerm,
  setSearchTerm,
  cartCount = 0,
  cartTotal = 0,
  wishlistCount = 0,
  onOpenCart,
  onOpenWishlist,
  onOpenOrderHistory,
  onOpenAuth,
  onOpenGoogleAuth,
  onOpenOrders,
  onOpenAdmin,
  user,
  onLogoutUser,
  adminUser,
  onLogoutAdmin,
  shopSettings,
  products = [],
  onAddToCart,
  onOpenQuickView
}) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products for autocomplete dropdown
  const autocompleteSuggestions = searchTerm.trim().length >= 2
    ? products
        .filter((p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
          p.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const trendingTags = [
    'Amul Gold Milk',
    'Malai Paneer',
    'Amul Butter',
    'Fresh Potato',
    'Aashirvaad Atta',
    'Kulfi Ice Cream'
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo & Store Branding */}
          <div
            onClick={() => {
              setSearchTerm('');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer min-w-0 shrink-0"
          >
            <YGSLogo size="sm" className="sm:hidden" />
            <YGSLogo size="md" className="hidden sm:inline-flex" />
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="text-base sm:text-2xl font-black tracking-tight text-slate-900 truncate">
                  Yashi General Store
                </span>
                <span className="hidden md:inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>5km Delivery</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate font-medium">
                <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
                <span className="truncate">Mirpur Cantt, Kanpur • Superfast Local Order</span>
              </p>
            </div>
          </div>

          {/* Desktop Search Bar with Instant Autocomplete */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Search milk, paneer, veggies, atta, stationery..."
                value={searchTerm}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsSearchFocused(true);
                }}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition font-medium"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Instant Search Suggestions Dropdown */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-2.5">
                {autocompleteSuggestions.length > 0 ? (
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1 block mb-1.5">
                      Matching Products ({autocompleteSuggestions.length})
                    </span>
                    <div className="space-y-1">
                      {autocompleteSuggestions.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            onOpenQuickView?.(item);
                            setIsSearchFocused(false);
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-9 h-9 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                              onError={(e) => { e.currentTarget.src = './images/hero_banner.jpg'; }}
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {item.name}
                              </p>
                              <p className="text-[10px] text-emerald-700 font-black">
                                ₹{item.price} <span className="text-slate-400 font-normal">/ {item.unit}</span>
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart?.(item);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 transition active:scale-95 shadow-2xs"
                            title="Add to cart"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : searchTerm.trim().length >= 2 ? (
                  <p className="text-xs text-slate-500 text-center py-2">
                    No products found for "{searchTerm}"
                  </p>
                ) : (
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1 mb-1.5">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Trending Searches</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {trendingTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            setSearchTerm(tag);
                            setIsSearchFocused(false);
                          }}
                          className="text-[11px] font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 px-2.5 py-1 rounded-xl text-slate-700 border border-slate-200 transition"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons: Wishlist, Orders, User, Cart */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            
            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition active:scale-95"
              title="My Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Past Orders History Button */}
            <button
              onClick={onOpenOrderHistory}
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              title="View past order history & 1-click reorder"
            >
              <History className="h-4 w-4 text-slate-600" />
              <span>Past Orders</span>
            </button>

            {/* Track Orders Button */}
            <button
              onClick={onOpenOrders}
              className="hidden lg:flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition"
              title="Track existing delivery requests"
            >
              <PackageCheck className="h-4 w-4 text-emerald-700" />
              <span>Track Orders</span>
            </button>

            {/* Customer Profile / Login Badge */}
            {user ? (
              <div className="flex items-center space-x-1.5 sm:space-x-2 bg-emerald-50 border border-emerald-200 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-5 h-5 rounded-full object-cover shrink-0 border border-emerald-300"
                  />
                ) : user.authProvider === 'google' ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                    {(user.name || 'G').charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <User className="h-3.5 w-3.5 text-emerald-700" />
                )}
                <div className="text-left hidden sm:block">
                  <p className="text-[11px] font-black text-emerald-950 leading-tight">
                    {user.name || 'Customer'}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-bold truncate max-w-[120px]">
                    {user.email || `+91 ${user.phone}`}
                  </p>
                </div>
                <button
                  onClick={onLogoutUser}
                  className="text-[10px] text-slate-400 hover:text-rose-600 font-bold underline ml-1"
                >
                  Logout
                </button>
              </div>
            ) : !adminUser ? (
              <div className="flex items-center gap-1.5">
                {/* 1-Click Google Sign In */}
                <button
                  type="button"
                  onClick={onOpenGoogleAuth}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-2xs hover:border-slate-300 active:scale-95"
                  title="Sign in instantly with Gmail (No password)"
                >
                  <GoogleGLogo className="w-3.5 h-3.5" />
                  <span>Google</span>
                </button>

                <button
                  onClick={onOpenAuth}
                  className="flex items-center space-x-1 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-black text-emerald-900 bg-emerald-100/90 hover:bg-emerald-200 rounded-xl transition"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Login</span>
                </button>
              </div>
            ) : null}

            {/* Admin Portal Section: Visible when admin is logged in */}
            {adminUser && (
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <button
                  onClick={onOpenAdmin}
                  className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-black text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-600/20 transition active:scale-95"
                  title="Open Admin Portal"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>
                    <span className="inline sm:hidden">Admin</span>
                    <span className="hidden sm:inline">Admin Portal</span>
                  </span>
                </button>

                <button
                  onClick={onLogoutAdmin}
                  className="text-[10px] text-slate-400 hover:text-rose-600 font-bold underline px-1"
                  title="Logout Store Admin"
                >
                  Exit
                </button>
              </div>
            )}

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl font-black text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition active:scale-95 shrink-0"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>₹{cartTotal}</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-slate-900 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-2.5 pt-0.5">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-3.5 w-3.5" />
            </div>
            <input
              type="text"
              placeholder="Search milk, vegetables, atta, stationery..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
