import React from 'react';

export default function YGSLogo({ size = 'md', className = '', showSubtitle = false }) {
  // Dimension presets
  const sizeMap = {
    sm: { box: 'w-9 h-9', font: 'text-sm', badge: 'text-[7px]' },
    md: { box: 'w-11 h-11', font: 'text-base', badge: 'text-[8px]' },
    lg: { box: 'w-14 h-14', font: 'text-xl', badge: 'text-[9px]' },
    xl: { box: 'w-20 h-20', font: 'text-3xl', badge: 'text-[11px]' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Visual Logo Emblem for YGS */}
      <div
        className={`relative ${currentSize.box} rounded-2xl bg-gradient-to-tr from-emerald-800 via-emerald-600 to-green-500 flex flex-col items-center justify-center text-white shadow-md shadow-emerald-700/25 border-2 border-emerald-400/40 select-none group transform hover:scale-105 transition-transform duration-300`}
      >
        {/* Subtle decorative leaf accent */}
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-yellow-400 flex items-center justify-center shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-800" />
        </div>

        {/* Monogram Acronym YGS */}
        <span className={`font-black tracking-tighter leading-none font-sans drop-shadow-sm ${currentSize.font}`}>
          <span className="text-white">Y</span>
          <span className="text-yellow-300">G</span>
          <span className="text-emerald-100">S</span>
        </span>

        {/* Micro subtitle inside large sizes */}
        {size === 'xl' && (
          <span className="text-[7px] uppercase tracking-widest font-extrabold text-emerald-200 mt-0.5">
            Store
          </span>
        )}
      </div>

      {showSubtitle && (
        <div className="flex flex-col text-left">
          <span className="text-lg sm:text-xl font-black text-gray-900 leading-tight tracking-tight">
            Yashi General Store
          </span>
          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Fresh Grocery & Veg • 5km Local Delivery
          </span>
        </div>
      )}
    </div>
  );
}

