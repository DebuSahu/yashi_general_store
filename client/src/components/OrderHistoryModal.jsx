import React, { useState } from 'react';
import {
  X,
  Package,
  Calendar,
  CheckCircle2,
  Clock,
  RotateCcw,
  Printer,
  ChevronDown,
  ChevronUp,
  MapPin,
  Truck,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OrderHistoryModal({
  isOpen,
  onClose,
  onReorder,
  onTrackOrder,
  onShowToast
}) {
  if (!isOpen) return null;

  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Load orders from localStorage
  const savedOrders = (() => {
    try {
      const stored = localStorage.getItem('gs_order_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  })();

  const toggleExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const handleReorderClick = (order) => {
    if (!order.items || order.items.length === 0) return;
    onReorder(order.items);
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}
    onShowToast?.({
      type: 'cart',
      title: 'Items Reordered! 🛒',
      message: `${order.items.length} items added back to your cart.`
    });
    onClose();
  };

  const handlePrintReceipt = (order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${order.id} | Yashi General Store</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: auto; }
            .header { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 16px; margin-bottom: 20px; }
            .title { font-size: 20px; font-weight: 900; color: #047857; margin: 0; }
            .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
            .meta { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
            th { text-align: left; padding: 8px 4px; border-bottom: 1px solid #cbd5e1; font-weight: 800; font-size: 11px; text-transform: uppercase; }
            td { padding: 8px 4px; border-bottom: 1px solid #f1f5f9; }
            .total-row { font-size: 16px; font-weight: 900; border-top: 2px solid #0f172a; }
            .footer { text-align: center; margin-top: 28px; font-size: 11px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">YASHI GENERAL STORE (YGS)</h1>
            <p class="subtitle">510, Elliot Lane, Mirpur Cantonment, Kanpur - 208004</p>
            <p class="subtitle">Phone: +91 98765 43210 • Delivery strictly up to 5km</p>
          </div>
          <div class="meta"><strong>Order ID:</strong> <span>${order.id}</span></div>
          <div class="meta"><strong>Date:</strong> <span>${new Date(order.createdAt || Date.now()).toLocaleString()}</span></div>
          <div class="meta"><strong>Customer:</strong> <span>${order.customerName || 'Customer'} (+91 ${order.customerPhone || ''})</span></div>
          <div class="meta"><strong>Address:</strong> <span>${order.address || ''}</span></div>
          <div class="meta"><strong>Distance:</strong> <span>${order.distanceKm || '≤ 5.0'} km (Delivery Radius Approved)</span></div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || []).map(item => `
                <tr>
                  <td>${item.name || item.id}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price || Math.round((item.itemTotal || 0) / (item.quantity || 1))}</td>
                  <td style="text-align: right;">₹${item.itemTotal || (item.price * item.quantity) || 0}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3" style="padding-top: 12px;">Total Paid</td>
                <td style="text-align: right; padding-top: 12px; color: #047857;">₹${order.totalAmount}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>Thank you for shopping at Yashi General Store!</p>
            <p>100% Genuine Branded Groceries & Farm Fresh Produce.</p>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 transition-colors">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base sm:text-lg font-black text-white">My Order History</h3>
            <span className="bg-white/10 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {savedOrders.length} {savedOrders.length === 1 ? 'order' : 'orders'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {savedOrders.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h4 className="text-base font-bold text-slate-700 dark:text-slate-200">No Past Orders Found</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                Your completed delivery requests will appear here so you can easily track or reorder them in 1-click!
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
              >
                Start Shopping Now
              </button>
            </div>
          ) : (
            savedOrders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              const dateStr = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Recent Order';

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 overflow-hidden shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  {/* Order summary bar */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/60">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-slate-900 dark:text-white text-sm">
                          {order.id}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            (order.status || '').toLowerCase() === 'delivered'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          }`}
                        >
                          {order.status || 'Received'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span>{(order.items || []).length} items</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center">
                      <span className="text-base font-black text-emerald-700 dark:text-emerald-400 mr-2">
                        ₹{order.totalAmount}
                      </span>

                      {/* Reorder Button */}
                      <button
                        onClick={() => handleReorderClick(order)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1 active:scale-95"
                        title="Reorder all items in this order"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reorder</span>
                      </button>

                      {/* Details expand */}
                      <button
                        onClick={() => toggleExpand(order.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Items & Actions */}
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
                      <div className="space-y-2">
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                          Ordered Items:
                        </span>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {(order.items || []).map((it, idx) => (
                            <div
                              key={idx}
                              className="py-1.5 flex justify-between items-center text-xs"
                            >
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {it.quantity}x {it.name || it.id}
                              </span>
                              <span className="font-bold text-slate-600 dark:text-slate-400">
                                ₹{it.itemTotal || (it.price * it.quantity) || 0}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                        <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Delivered to: {order.address}</span>
                        </div>
                        {order.distanceKm && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Distance from Yashi General Store: <strong>{order.distanceKm} km</strong>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={() => handlePrintReceipt(order)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Bill / Receipt</span>
                        </button>

                        <button
                          onClick={() => {
                            onClose();
                            onTrackOrder(order);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 underline"
                        >
                          <span>Live Track This Order &rarr;</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="p-3.5 px-6 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold text-xs rounded-xl transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
