import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Heart, ShoppingBag, Sparkles, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, toast?.duration || 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast?.type) {
      case 'cart':
        return <ShoppingBag className="w-5 h-5 text-emerald-400 animate-bounce" />;
      case 'wishlist':
        return <Heart className="w-5 h-5 text-rose-400 fill-rose-400 animate-pulse" />;
      case 'coupon':
        return <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'success':
      default:
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getBorderColor = () => {
    switch (toast?.type) {
      case 'wishlist':
        return 'border-rose-500/60 shadow-rose-950/40';
      case 'coupon':
        return 'border-amber-500/60 shadow-amber-950/40';
      case 'error':
        return 'border-red-500/60 shadow-red-950/40';
      case 'cart':
      case 'success':
      default:
        return 'border-emerald-500/60 shadow-emerald-950/40';
    }
  };

  return (
    <div className="fixed top-16 sm:top-20 inset-x-3 sm:inset-x-auto sm:right-4 z-[99999] sm:max-w-sm pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
      <div
        className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950 text-white border-2 shadow-2xl backdrop-blur-xl ${getBorderColor()}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 p-1.5 rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
            {getIcon()}
          </div>
          <div className="min-w-0">
            {toast?.title && (
              <p className="text-xs font-black tracking-tight leading-tight truncate text-white">
                {toast.title}
              </p>
            )}
            <p className="text-xs font-semibold leading-tight mt-0.5 text-slate-200 break-words">
              {toast?.message}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 p-1.5 text-slate-400 hover:text-white rounded-lg transition bg-white/10 hover:bg-white/20 active:scale-95"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
