import React from 'react';
import { Zap, Sparkles, Tag, Truck, ShieldCheck, Heart } from 'lucide-react';

export default function AnnouncementTicker() {
  const announcements = [
    {
      icon: Zap,
      text: "⚡ 15-30 MINS SUPERFAST DELIVERY",
      sub: "Strictly within 5 km of Mirpur Cantt, Kanpur",
      color: "text-amber-300"
    },
    {
      icon: Sparkles,
      text: "🎉 USE COUPON: YASHI50",
      sub: "Flat ₹50 OFF on orders above ₹299",
      color: "text-emerald-300"
    },
    {
      icon: Tag,
      text: "🥛 DAILY FRESH AMUL & NAMASTE INDIA",
      sub: "Morning & Evening Fresh Milk, Paneer & Dahi Restock",
      color: "text-sky-300"
    },
    {
      icon: Truck,
      text: "🚚 100% FREE DELIVERY APPLIED",
      sub: "Delivered straight to your doorstep within 5km",
      color: "text-yellow-300"
    },
    {
      icon: ShieldCheck,
      text: "🥬 100% FARM FRESH & HYGIENIC",
      sub: "Hand-picked vegetables & authentic branded groceries",
      color: "text-green-300"
    },
    {
      icon: Heart,
      text: "⭐ 4.9★ RATED LOCAL STORE",
      sub: "Serving 1,500+ happy neighborhood families",
      color: "text-pink-300"
    }
  ];

  return (
    <div className="bg-slate-950 text-white text-[11px] font-bold py-2 overflow-hidden border-b border-white/10 relative z-30 select-none">
      <div className="animate-marquee items-center gap-8">
        {/* Doubled list for seamless infinite loop */}
        {[...announcements, ...announcements].map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-center gap-2 shrink-0 px-2 group cursor-default">
              <Icon className={`w-3.5 h-3.5 ${item.color} shrink-0 animate-pulse`} />
              <span className="font-black uppercase tracking-wider text-white">
                {item.text}
              </span>
              <span className="text-slate-400 font-medium text-[10px]">
                ({item.sub})
              </span>
              <span className="text-slate-600 ml-4">•</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

