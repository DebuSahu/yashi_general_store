import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  ShieldCheck,
  MessageCircle,
  Mail,
  ArrowRight,
  FileText
} from 'lucide-react';
import { api } from '../api';
import { GoogleGLogo } from './GoogleAuthModal';
import {
  buildStoreWhatsappMessage,
  buildClientWhatsappBillMessage
} from '../utils/orderReceiptHelper';
import { downloadInvoicePdf } from '../utils/pdfInvoiceGenerator';

export default function OrderTrackerModal({
  isOpen,
  onClose,
  user = null,
  targetOrder = null,
  onOpenGoogleAuth = null,
  shopSettings = null
}) {
  const [searchQuery, setSearchQuery] = useState(() => user?.email || '');
  const [orders, setOrders] = useState(targetOrder ? [targetOrder] : []);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(Boolean(targetOrder || user?.email));
  const [error, setError] = useState('');
  const [showManualSearch, setShowManualSearch] = useState(false);

  const storePhone = (shopSettings?.phone || '9876543210').replace(/[^0-9]/g, '').slice(-10);

  const fetchOrders = async (queryToSearch) => {
    const q = (queryToSearch || '').trim();
    if (!q) {
      setError('Please enter your Gmail address or Order ID');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.getOrders(q);
      const matched = res?.orders || (Array.isArray(res) ? res : []);
      setOrders(matched);
      setSearched(true);
    } catch (err) {
      // Fallback to local order history
      try {
        const local = JSON.parse(localStorage.getItem('gs_order_history') || '[]');
        const cleanQ = q.toLowerCase();
        const matched = local.filter((o) =>
          (o.customerEmail || '').toLowerCase() === cleanQ ||
          (o.id || '').toLowerCase().includes(cleanQ) ||
          (o.customerPhone || '').includes(cleanQ)
        );
        setOrders(matched);
        setSearched(true);
      } catch (e) {
        setError('Error loading orders: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-load orders whenever modal opens
  useEffect(() => {
    if (!isOpen) {
      setError('');
      setShowManualSearch(false);
      return;
    }

    if (targetOrder) {
      setOrders([targetOrder]);
      setSearched(true);
      return;
    }

    if (user?.email) {
      setSearchQuery(user.email);
      fetchOrders(user.email);
    } else {
      // Check local storage order history
      try {
        const local = JSON.parse(localStorage.getItem('gs_order_history') || '[]');
        if (local && local.length > 0) {
          setOrders(local);
          setSearched(true);
        } else {
          setOrders([]);
          setSearched(false);
        }
      } catch (e) {
        setOrders([]);
      }
    }
  }, [isOpen, targetOrder, user]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders(searchQuery);
  };

  const getStatusStep = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 1;
      case 'accepted':
      case 'confirmed':
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
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #0f172a; max-width: 550px; margin: auto; }
            .header { text-align: center; border-bottom: 2px dashed #94a3b8; padding-bottom: 16px; margin-bottom: 20px; }
            h1 { font-size: 20px; color: #047857; margin: 0; font-weight: 900; }
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
          <div class="info"><strong>Gmail:</strong> ${order.customerEmail || 'Guest'}</div>
          <div class="info"><strong>Delivery Address:</strong> ${order.address || ''}</div>
          <div class="info"><strong>Distance from Shop:</strong> ${order.distanceKm || '≤ 5.0'} km (Verified ≤5km)</div>

          <table>
            <thead>
              <tr><th>Item</th><th>Qty</th><th style="text-align: right;">Total</th></tr>
            </thead>
            <tbody>
              ${(order.items || []).map(i => `<tr><td>${i.name || i.id}</td><td>${i.quantity || 1}</td><td style="text-align: right;">₹${i.itemTotal || ((i.price || 0) * (i.quantity || 1)) || 0}</td></tr>`).join('')}
              <tr>
                <td colspan="2" style="font-weight: 800; padding-top: 12px;">Total Paid / Payable:</td>
                <td class="total" style="padding-top: 12px;">₹${order.totalAmount || 0}</td>
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

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col h-[100dvh] sm:h-auto sm:max-h-[92vh] border-t sm:border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 transition-colors overflow-hidden text-slate-900 dark:text-white">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-emerald-900/60">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Package className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight">Live Order Tracking</h3>
              <p className="text-[11px] text-emerald-300 mt-0.5">
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

        {/* User Identity / Search Bar */}
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 shrink-0 space-y-2.5">
          {user ? (
            /* USER IS ALREADY LOGGED IN: Auto-Track Directly without asking! */
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-2xs border border-emerald-200 dark:border-emerald-700">
                    <GoogleGLogo className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                      Auto-tracking for {user?.name || 'Customer'}
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowManualSearch(!showManualSearch)}
                  className="text-[11px] font-bold text-slate-500 hover:text-emerald-600 dark:text-slate-400 underline shrink-0 ml-2"
                >
                  {showManualSearch ? 'Hide Search' : 'Search by Order ID / Email'}
                </button>
              </div>

              {showManualSearch && (
                <form onSubmit={handleSearchSubmit} className="flex gap-2 animate-in fade-in duration-150">
                  <input
                    type="text"
                    placeholder="Enter Order ID (ORD-1234) or other Gmail"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={loading || !searchQuery.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs disabled:opacity-50"
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* USER NOT LOGGED IN: Provide 1-tap Google sign-in OR search by Gmail/Order ID */
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-black text-slate-900 dark:text-white">
                    Signed in with Google?
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Instantly load all orders linked to your Gmail account
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenGoogleAuth?.();
                  }}
                  className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-900 dark:text-emerald-300 font-black text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 flex items-center gap-1.5 shrink-0 shadow-2xs active:scale-95 transition"
                >
                  <GoogleGLogo className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Enter your Gmail address or Order ID (e.g. ORD-1234)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !searchQuery.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs transition disabled:opacity-50 active:scale-95"
                >
                  {loading ? 'Tracking...' : 'Track'}
                </button>
              </form>
            </div>
          )}

          {error && <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">{error}</p>}
        </div>

        {/* Orders list */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 pb-24 sm:pb-6 overscroll-contain">
          {loading ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm font-semibold animate-pulse">
              Fetching live delivery status from store...
            </div>
          ) : searched && orders.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
              <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="font-bold text-slate-800 dark:text-slate-200">No orders found for this account</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
                No orders match <strong>{searchQuery || 'this account'}</strong>. Place an order or check the Gmail address used.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Start Shopping Now
              </button>
            </div>
          ) : (
            orders.map((order) => {
              const currentStep = getStatusStep(order.status);
              const isCancelled = (order.status || '').toLowerCase() === 'cancelled';
              const isDelivered = (order.status || '').toLowerCase() === 'delivered';

              const storeWhatsapp = buildStoreWhatsappMessage({
                order,
                totalAmount: order.totalAmount,
                shopSettings
              });
              const clientWhatsapp = buildClientWhatsappBillMessage({
                order,
                totalAmount: order.totalAmount,
                shopSettings
              });

              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-600 transition space-y-4"
                >
                  {/* Top order metadata */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
                        #{order.id}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
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

                  {/* Visual Delivery Stepper */}
                  {!isCancelled && (
                    <div className="py-2 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Delivery Progress</span>
                        </span>
                        {!isDelivered && (
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            ⚡ ETA: ~15-30 mins
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

                      {/* Delivery Partner Assigned Card */}
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
                                Dispatched from Mirpur Cantt to your doorstep (≤ 5km)
                              </p>
                            </div>
                          </div>
                          <a
                            href={`tel:+91${storePhone}`}
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
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Delivery Address</span>
                      </p>
                      <p className="text-slate-700 dark:text-slate-300">{order?.address}</p>
                      {order?.customerPhone && (
                        <p className="text-slate-600 dark:text-slate-400 font-semibold">
                          Contact: +91 {order.customerPhone}
                        </p>
                      )}
                      {order?.customerEmail && (
                        <p className="text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1">
                          <Mail className="w-3 h-3 text-emerald-600" />
                          <span>{order.customerEmail}</span>
                        </p>
                      )}
                      {order?.distanceKm && (
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                          Perimeter Distance: {order.distanceKm} km (Verified ≤5km)
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">Order Items Summary</p>
                      <div className="mt-0.5 space-y-1 max-h-32 overflow-y-auto">
                        {(order?.items || []).map((item, idx) => (
                          <div key={idx} className="flex justify-between text-slate-700 dark:text-slate-300">
                            <span className="truncate pr-2">{item?.quantity || 1}x {item?.name || item?.id || 'Item'}</span>
                            <span className="font-bold text-slate-900 dark:text-white shrink-0">
                              ₹{item?.itemTotal || ((item?.price || 0) * (item?.quantity || 1)) || 0}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between font-black text-slate-900 dark:text-white pt-1.5 border-t border-slate-100 dark:border-slate-700 mt-1">
                        <span>Total Payable:</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-black text-sm">
                          ₹{order?.totalAmount || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: WhatsApp Bill, WhatsApp Store, Print Receipt */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {order.customerPhone && (
                        <a
                          href={clientWhatsapp.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-xl shadow-2xs transition active:scale-95"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-white" />
                          <span>Bill on WhatsApp</span>
                        </a>
                      )}

                      <a
                        href={storeWhatsapp.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Store WhatsApp</span>
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => downloadInvoicePdf({ order, shopSettings })}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:text-white hover:bg-emerald-600 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 px-2.5 py-1.5 rounded-xl transition shadow-2xs active:scale-95"
                        title="Download official PDF Tax Bill"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>PDF Bill</span>
                      </button>

                      <button
                        onClick={() => handlePrint(order)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </button>

                      <a
                        href={`tel:+91${storePhone}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl transition"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Call Store</span>
                      </a>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}
