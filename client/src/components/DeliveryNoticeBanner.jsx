import React, { useState } from 'react';
import { Truck, MapPin, AlertCircle, CheckCircle2, ChevronRight, X } from 'lucide-react';

export default function DeliveryNoticeBanner({ onOpenLocationChecker }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 text-white shadow-md w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 py-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm font-medium">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <span className="flex p-1 rounded-full bg-white/20 animate-pulse shrink-0">
              <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            </span>
            <p className="tracking-wide text-[11px] sm:text-xs min-w-0">
              <strong className="font-bold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] mr-1 inline-block">
                Notice
              </strong>
              Deliveries strictly ≤<span className="underline decoration-yellow-300 font-extrabold text-yellow-200">5 km radius</span> • <strong className="text-yellow-300">Min: ₹100</strong>
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={onOpenLocationChecker}
              className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-white text-emerald-800 hover:bg-emerald-50 transition shadow-sm"
            >
              <MapPin className="h-3 w-3 mr-1 text-emerald-600" />
              <span>Check Eligibility</span>
              <ChevronRight className="h-3 w-3 ml-0.5" />
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-white/80 hover:text-white p-0.5"
              aria-label="Dismiss banner"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

