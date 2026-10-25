import React, { useState, useEffect } from 'react';
import { X, Search, Package, Clock, CheckCircle2, Truck, AlertCircle, MapPin, ExternalLink } from 'lucide-react';
import { api } from '../api';

export default function OrderTrackerModal({ isOpen, onClose, initialPhone = '' }) {
  if (!isOpen) return null;

  const [phone, setPhone] = useState(initialPhone);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
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
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPhone) {
      fetchOrders(initialPhone);
    }
  }, [initialPhone]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders(phone);
  };

  const getStatusStep = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 1;
      case 'accepted':
      case 'packing': return 2;
      case 'out for delivery': return 3;
      case 'delivered': return 4;
      default: return 1;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-emerald-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <h3 className="text-lg font-bold">Track Your Delivery Requests</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-gray-500">
                +91
              </span>
              <input
                type="tel"
                maxLength="10"
                placeholder="Enter verified mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full pl-12 pr-4 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>

          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>

        {/* Orders list */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              Loading your delivery requests...
            </div>
          ) : searched && orders.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="font-bold">No orders found for this mobile number</p>
              <p className="text-xs text-gray-400 mt-1">Make sure you entered the same 10-digit number used at checkout.</p>
            </div>
          ) : (
            orders.map((order) => {
              const currentStep = getStatusStep(order.status);
              const isCancelled = order.status === 'Cancelled';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:border-emerald-300 transition"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-gray-100">
                    <div>
                      <span className="text-xs font-black text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md">
                        {order.id}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        {new Date(order.createdAt).toLocaleDateString()} at{' '}
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        order.status === 'Delivered'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Delivery Status Stepper */}
                  {!isCancelled && (
                    <div className="py-4">
                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-600 mb-2">
                        <span className={currentStep >= 1 ? 'text-emerald-700' : ''}>Requested</span>
                        <span className={currentStep >= 2 ? 'text-emerald-700' : ''}>Accepted</span>
                        <span className={currentStep >= 3 ? 'text-emerald-700' : ''}>Out for Delivery</span>
                        <span className={currentStep >= 4 ? 'text-emerald-700' : ''}>Delivered</span>
                      </div>

                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden flex">
                        <div
                          className="bg-emerald-600 h-full transition-all duration-500 rounded-full"
                          style={{ width: `${(currentStep / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Address & Items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-gray-600">
                    <div>
                      <p className="font-bold text-gray-800 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Delivery Address
                      </p>
                      <p className="mt-0.5">{order.address}</p>
                      <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                        Distance from shop: {order.distanceKm} km (≤ 5km verified)
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-gray-800">Order Summary</p>
                      <ul className="mt-0.5 space-y-0.5">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between">
                            <span>{item.quantity}x {item.name}</span>
                            <span className="font-semibold">₹{item.price * item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex justify-between font-extrabold text-gray-900 pt-1.5 border-t border-gray-100 mt-1">
                        <span>Total Paid / Payable:</span>
                        <span className="text-emerald-700 font-black">₹{order.totalAmount}</span>
                      </div>
                    </div>
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

