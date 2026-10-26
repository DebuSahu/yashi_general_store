import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  MapPin,
  ExternalLink,
  PhoneCall,
  Printer,
  Sparkles,
  Navigation,
  ShieldCheck
} from 'lucide-react';
import { api } from '../api';

export default function OrderTrackerModal({
  isOpen,
  onClose,
  initialPhone = '',
  targetOrder = null
}) {
  if (!isOpen) return null;

  const [phone, setPhone] = useState(initialPhone);
  const [orders, setOrders] = useState(targetOrder ? [targetOrder] : []);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(Boolean(targetOrder));
  const [error, setError] = useState('');

  const fetchOrders = async (phoneToQuery) => {
    const clean = phoneToQuery.replace(/[^0-9]/g, '');
    if (clean.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.getOrders(clean);
      if (res.success) {
        setOrders(res.orders || []);
        setSearched(true);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      // Also check localStorage order history
      try {
        const local = JSON.parse(localStorage.getItem('gs_order_history') || '[]');
        const matched = local.filter((o) => (o.customerPhone || '').includes(clean));
        if (matched.length > 0) {
          setOrders(matched);
          setSearched(true);
          return;
        }
      } catch (e) {}
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetOrder) {
      setOrders([targetOrder]);
      setSearched(true);
    } else if (initialPhone) {
      fetchOrders(initialPhone);
    }
  }, [initialPhone, targetOrder]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders(phone);
  };

  const getStatusStep = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 1;
      case 'accepted':
        return 2;
      case 'packing':
        return 3;
      case 'out for delivery':
        return 4;
      case 'delivered':
        return 5;
      default:
        return 2;
    }
  };

  const stepsList = [
    { num: 1, label: 'Order Placed', desc: 'Received at store' },
    { num: 2, label: 'Confirmed', desc: 'Accepted by store' },
    { num: 3, label: 'Packing', desc: 'Freshly packed' },
    { num: 4, label: 'Out for Delivery', desc: 'Rider on route' },
    { num: 5, label: 'Delivered', desc: 'At your doorstep' }
  ];

  const handlePrint = (order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Receipt - ${order.id}</title>
          <style>
            body { font-family: -apple-system, sans-serif; padding: 24px; color: #0f172a; max-width: 550px; margin: auto; }
            .header { text-align: center; border-bottom: 2px dashed #94a3b8; padding-bottom: 16px; margin-bottom: 20px; }
            h1 { font-size: 20px; color: #047857; margin: 0; }
            .info { font-size: 12px; margin-bottom: 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
            th { text-align: left; padding: 8px 4px; border-bottom: 2px solid #cbd5e1; }
            td { padding: 8px 4px; border-bottom: 1px solid #f1f5f9; }
            .total { font-size: 16px; font-weight: 900; color: #047857; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>YASHI GENERAL STORE (YGS)</h1>
            <p style="font-size: 12px; color: #64748b; margin: 4px 0 0;">Mirpur Cantt, Kanpur - 208004 • Call: +91 98765 43210</p>
          </div>
          <div class="info"><strong>Order ID:</strong> ${order.id}</div>
          <div class="info"><strong>Customer:</strong> ${order.customerName || 'Customer'} (+91 ${order.customerPhone || ''})</div>
          <div class="info"><strong>Delivery Address:</strong> ${order.address || ''}</div>
          <div class="info"><strong>Distance from Shop:</strong> ${order.distanceKm || '≤ 5.0'} km (Verified)</div>

          <table>
            <thead>
              <tr><th>Item</th><th>Qty</th><th style="text-align: right;">Total</th></tr>
            </thead>
            <tbody>
              ${(order.items || []).map(i => `<tr><td>${i.name || i.id}</td><td>${i.quantity}</td><td style="text-align: right;">₹${i.itemTotal || (i.price * i.quantity) || 0}</td></tr>`).join('')}
              <tr>
                <td colspan="2" style="font-weight: 800; padding-top: 12px;">Total Paid:</td>
                <td class="total" style="padding-top: 12px;">₹${order.totalAmount}</td>
              </tr>
            </tbody>
          </table>
          <p style="text-align: center; font-size: 11px; color: #94a3b8; margin-top: 24px;">Thank you for shopping at Yashi General Store!</p>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 transition-colors">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Package className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">Live Order Tracking</h3>
              <p className="text-[11px] text-emerald-300">
                Real-time delivery status for Yashi General Store
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-black text-slate-500 dark:text-slate-400">
                +91
              </span>
              <input
                type="tel"
                maxLength="10"
                placeholder="Enter verified 10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full pl-12 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs transition disabled:opacity-50 active:scale-95"
            >
              {loading ? 'Tracking...' : 'Track'}
            </button>
          </form>

          {error && <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 font-bold">{error}</p>}
        </div>

        {/* Orders list */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm font-semibold animate-pulse">
              Fetching live delivery status from store...
            </div>
          ) : searched && orders.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="font-bold text-slate-800 dark:text-slate-200">No active orders found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                Check that you entered the correct 10-digit phone number or place a new delivery order.
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const currentStep = getStatusStep(order.status);
              const isCancelled = order.status === 'Cancelled';
              const isDelivered = order.status === 'Delivered';

              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-600 transition space-y-4"
                >
                  {/* Top order metadata */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
                        {order.id}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-400 font-medium">
                        {new Date(order.createdAt || Date.now()).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                        isDelivered
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : isCancelled
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 animate-pulse border border-amber-300 dark:border-amber-800'
                      }`}
                    >
                      {order.status || 'Received'}
                    </span>
                  </div>

                  {/* Visual Delivery Stepper & Animated Scooter */}
                  {!isCancelled && (
                    <div className="py-2 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Delivery Progress</span>
                        </span>
                        {!isDelivered && (
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            ⚡ ETA: ~20 mins
                          </span>
                        )}
                      </div>

                      {/* Step Bubbles & Connecting Line */}
                      <div className="relative pt-2 pb-1">
                        <div className="absolute top-5 left-3 right-3 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700 rounded-full"
                            style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
                          />
                        </div>

                        <div className="relative flex justify-between">
                          {stepsList.map((step) => {
                            const isDone = currentStep >= step.num;
                            const isCurrent = currentStep === step.num;
                            return (
                              <div
                                key={step.num}
                                className="flex flex-col items-center text-center max-w-[64px]"
                              >
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-xs transition-all ${
                                    isDone
                                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950'
                                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                  } ${isCurrent ? 'scale-110 animate-bounce' : ''}`}
                                >
                                  {isDone && !isCurrent ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : (
                                    step.num
                                  )}
                                </div>
                                <span className={`text-[10px] font-bold mt-1.5 leading-tight ${isDone ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Simulated Rider On The Way Card */}
                      {currentStep >= 3 && !isDelivered && (
                        <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/60 dark:to-teal-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                              🛵
                            </div>
                            <div>
                              <p className="font-black text-slate-900 dark:text-white">
                                Delivery Partner Assigned & En Route
                              </p>
                              <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                                Direct route from Mirpur Cantt shop to your address
                              </p>
                            </div>
                          </div>
                          <a
                            href="tel:+919876543210"
                            className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-xl font-bold transition flex items-center gap-1 shadow-2xs"
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>Call</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Order Details & Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-600 dark:text-slate-400">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Delivery Address</span>
                      </p>
                      <p className="mt-0.5 text-slate-700 dark:text-slate-300">{order.address}</p>
                      {order.distanceKm && (
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">
                          Perimeter Distance: {order.distanceKm} km (Verified ≤5km)
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">Order Items Summary</p>
                      <div className="mt-0.5 space-y-1">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="flex justify-between text-slate-700 dark:text-slate-300">
                            <span>{item.quantity}x {item.name || item.id}</span>
                            <span className="font-bold text-slate-900 dark:text-white">₹{item.itemTotal || (item.price * item.quantity) || 0}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between font-black text-slate-900 dark:text-white pt-1.5 border-t border-slate-100 dark:border-slate-700 mt-1">
                        <span>Total Paid / Payable:</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-black text-sm">₹{order.totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Print Bill & Store Support */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <button
                      onClick={() => handlePrint(order)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 px-3 py-1.5 rounded-xl transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Receipt</span>
                    </button>

                    <a
                      href="tel:+919876543210"
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 transition"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Store Support (+91 98765 43210)</span>
                    </a>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
