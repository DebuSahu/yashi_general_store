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
  ArrowRight,
  Sun,
  Moon,
  Mail
} from 'lucide-react';
import YGSLogo from './YGSLogo';
import { GoogleGLogo } from './GoogleAuthModal';
import { getUserFirstName } from '../utils/userHelper';

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
  onOpenQuickView,
  theme = 'light',
  toggleTheme
}) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);

  const storePhone = shopSettings?.phone || '+91 98765 43210';
  const storeEmail = shopSettings?.email || 'contact@yashigeneralstore.com';
  const userFirstName = user ? getUserFirstName(user) : '';

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
  const autocompleteSuggestions = (searchTerm || '').trim().length >= 2
    ? (products || [])
        .filter((p) =>
          p && (
            (p?.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
            (p?.brand && p.brand.toLowerCase().includes((searchTerm || '').toLowerCase())) ||
            (p?.category || '').toLowerCase().includes((searchTerm || '').toLowerCase())
          )
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
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-200 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 w-full max-w-full">
        <div className="flex items-center justify-between min-h-[60px] sm:h-20 gap-2 sm:gap-4 py-2 sm:py-0 w-full">
          
          {/* Logo & Store Branding - Full Visibility on Mobile */}
          <div
            onClick={() => {
              setSearchTerm('');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer min-w-0 flex-1 sm:flex-initial"
          >
            <YGSLogo size="sm" className="sm:hidden shrink-0" />
            <YGSLogo size="md" className="hidden sm:inline-flex shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm xs:text-base sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  Yashi General Store
                </span>
                <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 text-[8px] sm:text-[11px] font-black px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full uppercase tracking-wider shrink-0 border border-emerald-300 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>5km Delivery</span>
                </span>
              </div>
              <p className="text-[9px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-medium truncate">
                <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
                <span className="truncate">Mirpur Cantt, Kanpur • <span className="hidden sm:inline">Call: {storePhone}</span><span className="sm:hidden">{storePhone}</span></span>
              </p>
            </div>
          </div>

          {/* Desktop Search Bar with Instant Autocomplete */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-md mx-3 relative">
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
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-750 transition font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Instant Search Suggestions Dropdown */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-2.5">
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
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-9 h-9 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                              onError={(e) => { e.currentTarget.src = './images/hero_banner.jpg'; }}
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {item.name}
                              </p>
                              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-black">
                                ₹{item.price} <span className="text-slate-400 dark:text-slate-500 font-normal">/ {item.unit}</span>
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart?.(item);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-600 hover:text-white text-emerald-800 dark:text-emerald-300 transition active:scale-95 shadow-2xs"
                            title="Add to cart"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : searchTerm.trim().length >= 2 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-2">
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
                          className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-800 dark:hover:text-emerald-300 px-2.5 py-1 rounded-xl text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
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

          {/* Action Buttons Toolbar */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
            
            {/* DARK THEME TOGGLE BUTTON */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 text-slate-600 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition active:scale-95"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>

            {/* ALWAYS-ACCESSIBLE STORE ADMIN PORTAL BUTTON */}
            <button
              onClick={onOpenAdmin}
              className={`flex items-center space-x-1 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-black rounded-xl shadow-xs transition active:scale-95 shrink-0 ${
                adminUser
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 hover:bg-purple-600 hover:text-white border border-purple-300 dark:border-purple-800'
              }`}
              title="Store Admin Portal (Manage Orders, Inventory & Store Settings)"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{adminUser ? 'Admin Portal' : 'Admin'}</span>
              <span className="sm:hidden font-extrabold text-[11px]">{adminUser ? 'Portal' : 'Admin'}</span>
            </button>

            {/* Desktop Only: Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="hidden sm:inline-flex relative p-1.5 sm:p-2 text-slate-700 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition active:scale-95"
              title="My Wishlist"
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-black text-[9px] sm:text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Desktop Only: Past Orders History Button */}
            <button
              onClick={onOpenOrderHistory}
              className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
              title="View past order history & 1-click reorder"
            >
              <History className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span>Past Orders</span>
            </button>

            {/* Desktop Only: Track Orders Button */}
            <button
              onClick={onOpenOrders}
              className="hidden lg:flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-xl border border-emerald-200 dark:border-emerald-800 transition"
              title="Track existing delivery requests"
            >
              <PackageCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              <span>Track Orders</span>
            </button>

            {/* Customer Profile / Gmail Login - ONLY FIRST NAME ON TOP */}
            {user ? (
              <div className="flex items-center space-x-1.5 sm:space-x-2 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl shrink-0 shadow-2xs">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={userFirstName}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover shrink-0 border border-emerald-300 shadow-2xs"
                  />
                ) : (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-600 text-white text-[10px] sm:text-[11px] font-black flex items-center justify-center shrink-0 shadow-2xs">
                    {userFirstName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-left min-w-0">
                  <span
                    className="text-[11px] sm:text-xs font-black text-emerald-950 dark:text-emerald-200 leading-none block truncate max-w-[65px] sm:max-w-[105px]"
                    title={`Signed in as ${userFirstName} (${user?.email || ''})`}
                  >
                    {userFirstName}
                  </span>
                </div>
                <button
                  onClick={onLogoutUser}
                  className="text-[10px] text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 font-bold underline ml-0.5 sm:ml-1 shrink-0"
                  title="Sign out of account"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                {/* 1-Click Google Sign In */}
                <button
                  type="button"
                  onClick={onOpenGoogleAuth}
                  className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-black text-slate-800 dark:text-white bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition shadow-2xs hover:border-slate-300 active:scale-95 shrink-0"
                  title="Sign in instantly with Gmail (No password)"
                >
                  <GoogleGLogo className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden xs:inline">Gmail</span>
                </button>

                <button
                  onClick={onOpenAuth}
                  className="hidden sm:flex items-center space-x-1 px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-black text-emerald-900 dark:text-emerald-200 bg-emerald-100/90 dark:bg-emerald-950 hover:bg-emerald-200 rounded-xl transition shrink-0"
                >
                  <User className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>Login</span>
                </button>
              </div>
            )}

            {/* Desktop Only: Cart Button (Mobile has full cart bar in bottom floating nav) */}
            <button
              onClick={onOpenCart}
              className="hidden sm:flex relative items-center space-x-1 sm:space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl font-black text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition active:scale-95 shrink-0"
            >
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>₹{cartTotal}</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-slate-900 font-black text-[10px] w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-2 pt-0.5 w-full">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-3.5 w-3.5" />
            </div>
            <input
              type="text"
              placeholder="Search milk, vegetables, atta, stationery..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
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
