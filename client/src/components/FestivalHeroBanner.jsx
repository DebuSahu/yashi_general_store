import React, { useState } from 'react';
import { Sparkles, Copy, Check, ArrowRight, X, Flame, Gift, Tag, PartyPopper } from 'lucide-react';

const THEME_STYLES = {
  festival: {
    bg: 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700',
    border: 'border-yellow-300/40',
    pill: 'bg-yellow-950/40 border-yellow-300/40 text-yellow-100',
    button: 'bg-yellow-300 hover:bg-yellow-200 text-slate-950 font-black',
    accentText: 'text-yellow-200'
  },
  bogo: {
    bg: 'bg-gradient-to-r from-emerald-700 via-teal-600 to-green-700',
    border: 'border-emerald-300/40',
    pill: 'bg-emerald-950/40 border-emerald-300/40 text-emerald-100',
    button: 'bg-white hover:bg-emerald-50 text-emerald-900 font-black',
    accentText: 'text-emerald-200'
  },
  holi: {
    bg: 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-700',
    border: 'border-pink-300/40',
    pill: 'bg-purple-950/40 border-pink-300/40 text-pink-100',
    button: 'bg-yellow-300 hover:bg-yellow-200 text-slate-950 font-black',
    accentText: 'text-pink-200'
  },
  mega: {
    bg: 'bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-900',
    border: 'border-purple-300/40',
    pill: 'bg-indigo-950/40 border-purple-300/40 text-purple-100',
    button: 'bg-amber-300 hover:bg-amber-200 text-slate-950 font-black',
    accentText: 'text-purple-200'
  },
  flash: {
    bg: 'bg-gradient-to-r from-rose-600 via-red-600 to-amber-600',
    border: 'border-rose-300/40',
    pill: 'bg-rose-950/40 border-rose-300/40 text-rose-100',
    button: 'bg-yellow-300 hover:bg-yellow-200 text-slate-950 font-black',
    accentText: 'text-yellow-200'
  }
};

export default function FestivalHeroBanner({ offer, onClaimOffer, onDismiss }) {
  const [copied, setCopied] = useState(false);

  if (!offer || !offer.isActive) return null;

  const style = THEME_STYLES[offer.bannerTheme] || THEME_STYLES.festival;

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!offer.code) return;
    try {
      navigator.clipboard.writeText(offer.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <aside 
      aria-label="Promotional Announcement"
      className={`relative w-full ${style.bg} text-white py-3 sm:py-3.5 px-3 sm:px-6 shadow-lg border-b ${style.border} overflow-hidden select-none animate-in fade-in duration-300`}
    >
      {/* Decorative background glow and shapes */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-2xl animate-pulse" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-300 rounded-full blur-2xl animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 relative z-10">
        
        {/* Left: Badge, Title & Tagline */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 text-center md:text-left min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 shadow-xs animate-bounce">
            {offer.type === 'bogo' ? (
              <Gift className="w-5 h-5 text-white" />
            ) : offer.bannerTheme === 'flash' ? (
              <Flame className="w-5 h-5 text-yellow-300" />
            ) : (
              <PartyPopper className="w-5 h-5 text-yellow-200" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center justify-center md:justify-start gap-1.5 flex-wrap">
              {offer.badgeText && (
                <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider bg-black/30 backdrop-blur-xs border border-white/20 text-yellow-200 shadow-xs">
                  {offer.badgeText}
                </span>
              )}
              <h2 className="text-sm sm:text-base font-black tracking-tight truncate drop-shadow-xs">
                {offer.title}
              </h2>
            </div>
            {offer.tagline && (
              <p className="text-[11px] sm:text-xs text-white/90 line-clamp-1 mt-0.5">
                {offer.tagline}
              </p>
            )}
          </div>
        </div>

        {/* Right: Code Pill & Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {offer.code ? (
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${style.pill} text-xs font-black backdrop-blur-md shadow-xs hover:scale-105 transition active:scale-95`}
              title="Click to copy promo code"
            >
              <Tag className="w-3.5 h-3.5 text-yellow-300" />
              <span>CODE: <strong className="underline decoration-dashed">{offer.code}</strong></span>
              {copied ? (
                <span className="flex items-center gap-0.5 text-emerald-300 text-[10px] ml-1">
                  <Check className="w-3 h-3" /> Copied!
                </span>
              ) : (
                <Copy className="w-3 h-3 opacity-75 ml-0.5" />
              )}
            </button>
          ) : (
            <span className="px-3 py-1 rounded-xl bg-black/25 text-[11px] font-black uppercase text-yellow-200 border border-white/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Auto-Applied at Checkout
            </span>
          )}

          <button
            type="button"
            onClick={() => onClaimOffer?.(offer)}
            className={`px-3.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-xs shadow-md flex items-center gap-1.5 transition active:scale-95 ${style.button}`}
          >
            <span>{offer.code ? 'Claim & Apply' : 'Shop Deal'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-black/20 transition ml-0.5"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </aside>
  );
}
