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

  const getTypeStyles = () => {
    switch (toast?.type) {
      case 'wishlist':
        return {
          card: 'border-rose-400 dark:border-rose-700 bg-white dark:bg-slate-900 shadow-2xl text-slate-900 dark:text-white',
          iconBg: 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800'
        };
      case 'coupon':
        return {
          card: 'border-amber-400 dark:border-amber-700 bg-white dark:bg-slate-900 shadow-2xl text-slate-900 dark:text-white',
          iconBg: 'bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800'
        };
      case 'error':
        return {
          card: 'border-rose-500 dark:border-rose-600 bg-white dark:bg-slate-900 shadow-2xl text-slate-900 dark:text-white',
          iconBg: 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800'
        };
      case 'cart':
        return {
          card: 'border-emerald-500 dark:border-emerald-600 bg-white dark:bg-slate-900 shadow-2xl text-slate-900 dark:text-white',
          iconBg: 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800'
        };
      case 'success':
      default:
        return {
          card: 'border-emerald-500 dark:border-emerald-600 bg-white dark:bg-slate-900 shadow-2xl text-slate-900 dark:text-white',
          iconBg: 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed top-16 sm:top-20 inset-x-3 sm:inset-x-auto sm:right-4 z-[9999] sm:max-w-sm pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
      <div
        className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl backdrop-blur-md border ${styles.card}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`shrink-0 p-1.5 rounded-xl border shadow-xs ${styles.iconBg}`}>
            {getIcon()}
          </div>
          <div className="min-w-0">
            {toast?.title && (
              <p className="text-xs font-black tracking-tight leading-tight truncate text-slate-900 dark:text-white">
                {toast.title}
              </p>
            )}
            <p className="text-xs font-semibold leading-tight mt-0.5 text-slate-700 dark:text-slate-300">
              {toast?.message}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 p-1 text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

