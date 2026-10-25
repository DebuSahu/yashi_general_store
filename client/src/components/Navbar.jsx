import React from 'react';
import { ShoppingCart, Store, ShieldCheck, User, Search, PackageCheck, PhoneCall, MapPin } from 'lucide-react';
import YGSLogo from './YGSLogo';

export default function Navbar({
  searchTerm,
  setSearchTerm,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenAuth,
  onOpenOrders,
  onOpenAdmin,
  user,
  onLogoutUser,
  adminUser,
  onLogoutAdmin,
  shopSettings
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Store Branding */}
          <div className="flex items-center space-x-3 cursor-pointer">
            <YGSLogo size="md" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
                  Yashi General Store
                </span>
                <span className="hidden sm:inline-block bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  5km Local Delivery
                </span>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 text-emerald-600" />
                <span>{shopSettings?.address ? shopSettings.address.substring(0, 36) + '...' : 'Main Market • Delivery ≤ 5km'}</span>
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Search vegetables, atta, dal, soap, notebooks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Track Orders Button */}
            <button
              onClick={onOpenOrders}
              className="hidden lg:flex items-center space-x-1 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
              title="Track existing orders"
            >
              <PackageCheck className="h-4 w-4 text-emerald-600" />
              <span>Track Orders</span>
            </button>

            {/* Customer Login / Profile Badge */}
            {user ? (
              <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                <User className="h-4 w-4 text-emerald-700" />
                <div className="text-left hidden sm:block">
                  <p className="text-[11px] font-bold text-emerald-900 leading-tight">
                    {user.name || 'Customer'}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-medium">+91 {user.phone}</p>
                </div>
                <button
                  onClick={onLogoutUser}
                  className="text-[11px] text-gray-500 hover:text-red-600 ml-1 font-semibold underline"
                >
                  Logout
                </button>
              </div>
            ) : !adminUser ? (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 rounded-xl transition"
              >
                <User className="h-4 w-4" />
                <span>Login</span>
              </button>
            ) : null}

            {/* Admin Portal Section: Visible ONLY when admin is logged in! */}
            {adminUser && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenAdmin}
                  className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-600/20 transition active:scale-95"
                  title="Open Admin Portal"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin Portal</span>
                </button>

                <div className="hidden sm:flex items-center space-x-2 bg-purple-50 border border-purple-200 px-2.5 py-1.5 rounded-xl">
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-purple-900 leading-tight flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                      {adminUser.username || 'Admin'}
                    </p>
                  </div>
                  <button
                    onClick={onLogoutAdmin}
                    className="text-[10px] text-gray-500 hover:text-red-600 ml-1 font-semibold underline"
                    title="Logout Store Admin"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition active:scale-95"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">₹{cartTotal}</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-gray-900 font-extrabold text-[11px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search vegetables, grocery, store items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

      </div>
    </header>
  );
}
