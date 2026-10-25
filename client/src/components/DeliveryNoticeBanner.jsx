import React, { useState } from 'react';
import { Truck, MapPin, AlertCircle, CheckCircle2, ChevronRight, X } from 'lucide-react';

export default function DeliveryNoticeBanner({ onOpenLocationChecker }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm font-medium">
          <div className="flex items-center space-x-2.5">
            <span className="flex p-1 rounded-full bg-white/20 animate-pulse">
              <Truck className="h-4 w-4 text-white" />
            </span>
            <p className="tracking-wide">
              <strong className="font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-[11px] mr-1.5">
                Delivery Notice
              </strong>
              We deliver strictly up to <span className="underline decoration-yellow-300 font-extrabold text-yellow-200">5 km radius</span> of Yashi General Store • <strong className="text-yellow-300">Min Order: ₹100</strong>!
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenLocationChecker}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white text-emerald-800 hover:bg-emerald-50 transition shadow-sm"
            >
              <MapPin className="h-3 w-3 mr-1 text-emerald-600" />
              Check Eligibility
              <ChevronRight className="h-3 w-3 ml-0.5" />
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-white/80 hover:text-white p-0.5"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

