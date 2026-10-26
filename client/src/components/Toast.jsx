import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Heart, ShoppingBag, Sparkles, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, toast?.duration || 3200);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast?.type) {
      case 'cart':
        return <ShoppingBag className="w-5 h-5 text-emerald-500 animate-bounce" />;
      case 'wishlist':
        return <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />;
      case 'coupon':
        return <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'success':
      default:
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    }
  };

  const getBorderColor = () => {
    switch (toast?.type) {
      case 'wishlist': return 'border-rose-200 bg-rose-50/95 text-rose-950';
      case 'coupon': return 'border-amber-200 bg-amber-50/95 text-amber-950';
      case 'error': return 'border-red-200 bg-red-50/95 text-red-950';
      case 'cart': return 'border-emerald-200 bg-emerald-50/95 text-emerald-950';
      default: return 'border-slate-200 bg-white/95 text-slate-900';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm w-full pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
      <div
        className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl shadow-xl backdrop-blur-md border ${getBorderColor()}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 p-1.5 rounded-xl bg-white shadow-xs">
            {getIcon()}
          </div>
          <div className="min-w-0">
            {toast?.title && (
              <p className="text-xs font-black tracking-tight leading-tight truncate">
                {toast.title}
              </p>
            )}
            <p className="text-xs font-semibold opacity-90 leading-tight mt-0.5">
              {toast?.message}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 p-1 text-slate-400 hover:text-slate-700 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

