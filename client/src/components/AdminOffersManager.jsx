import React, { useState } from 'react';
import {
  Tag,
  Sparkles,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  AlertTriangle,
  Gift,
  Percent,
  Search,
  Check,
  X,
  Copy,
  Flame,
  PartyPopper,
  CheckSquare,
  Square,
  Package,
  Layers,
  ArrowRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { api } from '../api';

export const FESTIVAL_PRESETS = [
  {
    id: 'preset-diwali',
    name: '🪔 Diwali 20% Off Storewide',
    title: 'Diwali Maha Bumper Sale 🪔',
    tagline: 'Celebrate Diwali with 20% flat discount on all festival orders above ₹249!',
    code: 'DIWALI20',
    type: 'percent',
    discountValue: 20,
    scope: 'all',
    targetCategory: 'all',
    targetProductIds: [],
    minOrderAmount: 249,
    maxDiscount: 150,
    badgeText: '🪔 DIWALI 20% OFF',
    bannerTheme: 'festival',
    showInAnnouncement: true,
    showHeroBanner: true,
    isActive: true
  },
  {
    id: 'preset-bogo',
    name: '🎁 Buy 1 Get 1 Free (BOGO)',
    title: 'Buy 1 Get 1 Free Mega Deal 🎁',
    tagline: 'Special BOGO Deal! Buy 1 pack of eligible items and get 1 completely FREE!',
    code: 'BOGO',
    type: 'bogo',
    discountValue: 100,
    bogoBuyQty: 1,
    bogoGetQty: 1,
    scope: 'product',
    targetCategory: 'dairy',
    targetProductIds: ['dairy-amul-4'], // Amul Malai Paneer by default
    minOrderAmount: 0,
    maxDiscount: 100,
    badgeText: '🎁 BUY 1 GET 1 FREE',
    bannerTheme: 'bogo',
    showInAnnouncement: true,
    showHeroBanner: true,
    isActive: true
  },
  {
    id: 'preset-veggie',
    name: '🥦 30% Fresh Veggies Discount',
    title: 'Farm Fresh Green Veggies 30% OFF 🥦',
    tagline: 'Fresh morning harvest! 30% instant discount on all seasonal vegetables.',
    code: 'VEGGIE30',
    type: 'percent',
    discountValue: 30,
    scope: 'category',
    targetCategory: 'vegetables',
    targetProductIds: [],
    minOrderAmount: 150,
    maxDiscount: 100,
    badgeText: '🥦 30% VEGGIE SPECIAL',
    bannerTheme: 'festival',
    showInAnnouncement: true,
    showHeroBanner: false,
    isActive: true
  },
  {
    id: 'preset-holi',
    name: '🎨 Holi Dhamaka Flat ₹50 Off',
    title: 'Holi Colors & Snacks Dhamaka 🎨',
    tagline: 'Celebrate Holi with flat ₹50 savings on your festive grocery basket above ₹299.',
    code: 'HOLI50',
    type: 'flat',
    discountValue: 50,
    scope: 'all',
    targetCategory: 'all',
    targetProductIds: [],
    minOrderAmount: 299,
    maxDiscount: 50,
    badgeText: '🎨 HOLI FLAT ₹50 OFF',
    bannerTheme: 'holi',
    showInAnnouncement: true,
    showHeroBanner: true,
    isActive: true
  },
  {
    id: 'preset-flash',
    name: '⚡ Flash Sale 50% Off',
    title: 'Lightning Flash Sale - 50% OFF ⚡',
    tagline: 'Massive 50% flash discount for limited hours! Grab your daily essentials now.',
    code: 'FLASH50',
    type: 'percent',
    discountValue: 50,
    scope: 'all',
    targetCategory: 'all',
    targetProductIds: [],
    minOrderAmount: 199,
    maxDiscount: 200,
    badgeText: '⚡ FLASH 50% OFF',
    bannerTheme: 'flash',
    showInAnnouncement: true,
    showHeroBanner: true,
    isActive: true
  }
];

export const BANNER_THEMES = [
  { id: 'festival', label: '🪔 Festival Gold (Diwali / Navratri)', gradient: 'from-amber-600 via-yellow-500 to-amber-700' },
  { id: 'bogo', label: '🎁 Emerald BOGO (Green & Fresh)', gradient: 'from-emerald-700 via-teal-600 to-green-700' },
  { id: 'holi', label: '🎨 Holi Rainbow (Festive Colors)', gradient: 'from-pink-600 via-purple-600 to-indigo-700' },
  { id: 'mega', label: '👑 Royal Mega Sale (Purple & Violet)', gradient: 'from-purple-700 via-indigo-600 to-purple-900' },
  { id: 'flash', label: '🔥 Crimson Flash Sale (Red & Orange)', gradient: 'from-rose-600 via-red-600 to-amber-600' }
];

export default function AdminOffersManager({
  offers = [],
  loadingOffers = false,
  products = [],
  token,
  onOffersUpdated
}) {
  const [filter, setFilter] = useState('all'); // all, live, paused, bogo, festival
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Form State
  const [form, setForm] = useState({
    title: '',
    tagline: '',
    code: '',
    type: 'percent', // percent, flat, bogo, free_delivery
    discountValue: 20,
    bogoBuyQty: 1,
    bogoGetQty: 1,
    scope: 'all', // all, category, product
    targetCategory: 'all',
    targetProductIds: [],
    minOrderAmount: 0,
    maxDiscount: '',
    badgeText: '',
    bannerTheme: 'festival',
    showInAnnouncement: true,
    showHeroBanner: true,
    isActive: true
  });

  const liveOffers = offers.filter(o => o.isActive);
  const pausedOffers = offers.filter(o => !o.isActive);
  const bogoOffers = offers.filter(o => o.type === 'bogo');

  // Filtered List
  const filteredOffers = offers.filter(o => {
    if (filter === 'live') return o.isActive;
    if (filter === 'paused') return !o.isActive;
    if (filter === 'bogo') return o.type === 'bogo';
    if (filter === 'festival') return o.bannerTheme === 'festival' || o.bannerTheme === 'holi' || o.showHeroBanner;
    return true;
  });

  // Copy code helper
  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  // 1-Click Toggle Live/Pause
  const handleToggleLive = async (offerId) => {
    try {
      const res = await api.toggleOfferLive(offerId, token);
      if (res?.success) {
        const updated = offers.map(o => o.id === offerId ? { ...o, isActive: res.isActive } : o);
        onOffersUpdated?.(updated);
        setActionMsg({
          type: 'success',
          text: res.message || 'Offer status updated'
        });
        setTimeout(() => setActionMsg({ type: '', text: '' }), 4000);
      }
    } catch (err) {
      alert('Failed to update offer: ' + err.message);
    }
  };

  // Delete Offer
  const handleDeleteOffer = async (offerId) => {
    const target = offers.find(o => o.id === offerId);
    if (!window.confirm(`Are you sure you want to delete the offer "${target?.title || 'this deal'}"?`)) return;
    try {
      const res = await api.deleteOffer(offerId, token);
      if (res?.success) {
        const updated = offers.filter(o => o.id !== offerId);
        onOffersUpdated?.(updated);
        setActionMsg({
          type: 'success',
          text: 'Offer deleted successfully'
        });
        setTimeout(() => setActionMsg({ type: '', text: '' }), 4000);
      }
    } catch (err) {
      alert('Failed to delete offer: ' + err.message);
    }
  };

  // Open Create Modal
  const openCreateModal = (preset = null) => {
    setEditingOffer(null);
    setProductSearch('');
    setFormError('');

    if (preset) {
      setForm({
        title: preset.title || '',
        tagline: preset.tagline || '',
        code: preset.code || '',
        type: preset.type || 'percent',
        discountValue: preset.discountValue ?? 20,
        bogoBuyQty: preset.bogoBuyQty || 1,
        bogoGetQty: preset.bogoGetQty || 1,
        scope: preset.scope || 'all',
        targetCategory: preset.targetCategory || 'all',
        targetProductIds: preset.targetProductIds || [],
        minOrderAmount: preset.minOrderAmount || 0,
        maxDiscount: preset.maxDiscount || '',
        badgeText: preset.badgeText || '',
        bannerTheme: preset.bannerTheme || 'festival',
        showInAnnouncement: preset.showInAnnouncement ?? true,
        showHeroBanner: preset.showHeroBanner ?? true,
        isActive: preset.isActive ?? true
      });
    } else {
      setForm({
        title: '',
        tagline: '',
        code: '',
        type: 'percent',
        discountValue: 20,
        bogoBuyQty: 1,
        bogoGetQty: 1,
        scope: 'all',
        targetCategory: 'all',
        targetProductIds: [],
        minOrderAmount: 0,
        maxDiscount: '',
        badgeText: '',
        bannerTheme: 'festival',
        showInAnnouncement: true,
        showHeroBanner: true,
        isActive: true
      });
    }
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (offer) => {
    setEditingOffer(offer);
    setProductSearch('');
    setFormError('');
    setForm({
      title: offer.title || '',
      tagline: offer.tagline || '',
      code: offer.code || '',
      type: offer.type || 'percent',
      discountValue: offer.discountValue ?? 0,
      bogoBuyQty: offer.bogoBuyQty || 1,
      bogoGetQty: offer.bogoGetQty || 1,
      scope: offer.scope || 'all',
      targetCategory: offer.targetCategory || 'all',
      targetProductIds: offer.targetProductIds || [],
      minOrderAmount: offer.minOrderAmount || 0,
      maxDiscount: offer.maxDiscount ?? '',
      badgeText: offer.badgeText || '',
      bannerTheme: offer.bannerTheme || 'festival',
      showInAnnouncement: offer.showInAnnouncement ?? true,
      showHeroBanner: offer.showHeroBanner ?? true,
      isActive: offer.isActive ?? true
    });
    setModalOpen(true);
  };

  // Toggle product selection in scope
  const toggleProductSelect = (id) => {
    setForm(prev => {
      const exists = prev.targetProductIds.includes(id);
      return {
        ...prev,
        targetProductIds: exists
          ? prev.targetProductIds.filter(item => item !== id)
          : [...prev.targetProductIds, id]
      };
    });
  };

  // Filter products for the multi-select picker
  const filteredProducts = products.filter(p => {
    if (!productSearch) return true;
    const q = productSearch.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q)
    );
  });

  // Handle Save
  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.title.trim()) {
      setFormError('Please enter a title for the offer / festival deal');
      return;
    }

    if (form.scope === 'product' && form.targetProductIds.length === 0) {
      setFormError('Please select at least 1 product for product-specific deal');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        tagline: form.tagline.trim(),
        code: form.code.trim().toUpperCase(),
        discountValue: Number(form.discountValue) || 0,
        bogoBuyQty: Number(form.bogoBuyQty) || 1,
        bogoGetQty: Number(form.bogoGetQty) || 1,
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscount: form.maxDiscount !== '' && form.maxDiscount !== null ? Number(form.maxDiscount) : null,
        badgeText: form.badgeText.trim()
      };

      if (editingOffer) {
        const res = await api.updateOffer(editingOffer.id, payload, token);
        if (res?.success) {
          const updated = offers.map(o => o.id === editingOffer.id ? res.offer : o);
          onOffersUpdated?.(updated);
          setModalOpen(false);
          setActionMsg({ type: 'success', text: `Offer "${payload.title}" updated successfully!` });
          setTimeout(() => setActionMsg({ type: '', text: '' }), 4000);
        } else {
          setFormError(res?.error || 'Failed to update offer');
        }
      } else {
        const res = await api.createOffer(payload, token);
        if (res?.success) {
          const updated = [res.offer, ...offers];
          onOffersUpdated?.(updated);
          setModalOpen(false);
          setActionMsg({ type: 'success', text: `Offer "${payload.title}" created & Live!` });
          setTimeout(() => setActionMsg({ type: '', text: '' }), 4000);
        } else {
          setFormError(res?.error || 'Failed to create offer');
        }
      }
    } catch (err) {
      setFormError('Error saving offer: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Action Notification Banner */}
      {actionMsg.text && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 animate-in fade-in ${
            actionMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            )}
            <span>{actionMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionMsg({ type: '', text: '' })}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header and Summary Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                <Sparkles className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Offers & Festival Deals Control Center
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Create, customize, and make LIVE any offer: BOGO (Buy 1 Get 1 Free), 20%/30% discount, festival banners, on specific products or overall store.
            </p>
          </div>

          <button
            type="button"
            onClick={() => openCreateModal()}
            className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Offer / Deal</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Deals</span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">{offers.length}</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Live Now</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-0.5">{liveOffers.length}</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">BOGO Deals</span>
            <p className="text-xl sm:text-2xl font-black text-amber-800 dark:text-amber-300 mt-0.5">{bogoOffers.length}</p>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-800 dark:text-purple-300">Hero Banners</span>
            <p className="text-xl sm:text-2xl font-black text-purple-800 dark:text-purple-300 mt-0.5">{offers.filter(o => o.isActive && o.showHeroBanner).length}</p>
          </div>
        </div>
      </div>

      {/* 1-Click Festival Presets */}
      <div className="bg-gradient-to-r from-purple-50 via-amber-50 to-emerald-50 dark:from-purple-950/40 dark:via-amber-950/30 dark:to-emerald-950/40 rounded-3xl p-4 sm:p-5 border border-purple-200 dark:border-purple-900/60 space-y-3">
        <div className="flex items-center gap-2">
          <PartyPopper className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
            Instant Festival & Promo Templates (1-Click Launch)
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {FESTIVAL_PRESETS.map(preset => (
            <button
              key={preset.id}
              type="button"
              onClick={() => openCreateModal(preset)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-2xs transition active:scale-95 flex items-center gap-1.5"
            >
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filter === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            All Offers ({offers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('live')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1 ${
              filter === 'live'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Live Now ({liveOffers.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('paused')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filter === 'paused'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            Paused ({pausedOffers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('bogo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filter === 'bogo'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            🎁 BOGO Deals ({bogoOffers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('festival')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filter === 'festival'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            🪔 Festival Sales
          </button>
        </div>
      </div>

      {/* Offers Cards Grid */}
      {filteredOffers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
            <Tag className="w-7 h-7" />
          </div>
          <h4 className="text-base font-black text-slate-900 dark:text-white">
            {filter === 'all' ? 'No offers created yet' : `No ${filter} offers found`}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Click the button below to launch a customized festival discount, BOGO offer, or store-wide sale in 1 click!
          </p>
          <button
            type="button"
            onClick={() => openCreateModal()}
            className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            Create Offer Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOffers.map((offer) => {
            const isLive = offer.isActive;
            const themeObj = BANNER_THEMES.find(t => t.id === offer.bannerTheme) || BANNER_THEMES[0];

            return (
              <div
                key={offer.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border transition-all duration-200 shadow-xs flex flex-col justify-between ${
                  isLive
                    ? 'border-emerald-300 dark:border-emerald-800 shadow-emerald-500/5'
                    : 'border-slate-200 dark:border-slate-800 opacity-80'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Top Badge & Live Toggle */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white bg-gradient-to-r ${themeObj.gradient} shadow-xs`}>
                      {themeObj.label.split(' ')[0]} {offer.type.toUpperCase()}
                    </span>

                    {/* Quick Live Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleLive(offer.id)}
                      className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 transition active:scale-95 ${
                        isLive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-2xs'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                      }`}
                      title={isLive ? 'Click to Pause this deal' : 'Click to Make this deal LIVE on website'}
                    >
                      <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      <span>{isLive ? 'LIVE NOW' : 'PAUSED'}</span>
                    </button>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                      {offer.title}
                    </h3>
                    {offer.tagline && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        {offer.tagline}
                      </p>
                    )}
                  </div>

                  {/* Coupon Code Chip */}
                  <div className="flex items-center gap-2">
                    {offer.code ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800">
                        <span className="text-[10px] font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                          CODE:
                        </span>
                        <strong className="text-xs font-black text-purple-900 dark:text-purple-200 font-mono">
                          {offer.code}
                        </strong>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(offer.code)}
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-900"
                          title="Copy promo code"
                        >
                          {copiedCode === offer.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        ⚡ Instant Deal (Auto-applied in cart)
                      </span>
                    )}

                    {offer.badgeText && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-yellow-100 text-yellow-900 dark:bg-yellow-950/70 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700">
                        Badge: {offer.badgeText}
                      </span>
                    )}
                  </div>

                  {/* Details Matrix */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Benefit</span>
                      <span className="font-black text-slate-800 dark:text-white">
                        {offer.type === 'percent' && `${offer.discountValue}% OFF`}
                        {offer.type === 'flat' && `Flat ₹${offer.discountValue} OFF`}
                        {offer.type === 'bogo' && `Buy ${offer.bogoBuyQty || 1} Get ${offer.bogoGetQty || 1} FREE`}
                        {offer.type === 'free_delivery' && 'Free Express Delivery'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Min Order</span>
                      <span className="font-black text-slate-800 dark:text-white">
                        {offer.minOrderAmount > 0 ? `₹${offer.minOrderAmount}` : 'No Minimum'}
                      </span>
                    </div>

                    <div className="col-span-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Applicable On</span>
                      <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5 mt-0.5">
                        {offer.scope === 'all' && (
                          <span>🌐 All Products in Store (Overall Basket)</span>
                        )}
                        {offer.scope === 'category' && (
                          <span>📂 Category: <strong className="capitalize text-purple-700 dark:text-purple-300">{offer.targetCategory}</strong></span>
                        )}
                        {offer.scope === 'product' && (
                          <span className="truncate">
                            🎯 Specific Items ({offer.targetProductIds?.length || 0}):{' '}
                            <strong className="text-purple-700 dark:text-purple-300">
                              {offer.targetProductIds?.map(id => products.find(p => p.id === id)?.name || id).slice(0, 2).join(', ')}
                              {offer.targetProductIds?.length > 2 ? ` +${offer.targetProductIds.length - 2} more` : ''}
                            </strong>
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Badges / Visibility indicators */}
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {offer.showInAnnouncement && (
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        📢 In Scrolling Ticker
                      </span>
                    )}
                    {offer.showHeroBanner && (
                      <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md font-black">
                        🌟 Homepage Hero Banner
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleToggleLive(offer.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition active:scale-95 ${
                      isLive
                        ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100'
                        : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100'
                    }`}
                  >
                    {isLive ? 'Pause Deal ⏸️' : 'Make Live 🚀'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(offer)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteOffer(offer.id)}
                      className="p-1.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition"
                      title="Delete Offer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT OFFER MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 text-slate-900 dark:text-white">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 text-white">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-white/20">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-black">
                    {editingOffer ? 'Edit Offer / Festival Deal' : 'Create New Offer / Festival Deal'}
                  </h3>
                  <p className="text-[11px] text-white/80">
                    Configure discounts, BOGO rules, product applicability & live banners
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form id="admin-offer-form" onSubmit={handleSave} className="space-y-4">
                
                {/* 1. Offer Title & Tagline */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                      Offer / Festival Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Diwali Maha Bumper Sale 🪔"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold focus:ring-2 focus:ring-purple-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                      Tagline / Customer Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Celebrate with 20% OFF on all sweets & provisions above ₹249!"
                      value={form.tagline}
                      onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-600 dark:text-white"
                    />
                  </div>
                </div>

                {/* 2. Offer Type Selection */}
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-purple-600" />
                    <span>Offer Type *</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'percent', title: 'Percentage OFF (%)', icon: Percent, desc: 'e.g. 20% / 30% discount' },
                      { id: 'bogo', title: 'Buy 1 Get 1 Free', icon: Gift, desc: 'BOGO item freebie' },
                      { id: 'flat', title: 'Flat ₹ Discount', icon: Flame, desc: 'e.g. Flat ₹50 / ₹100 off' },
                      { id: 'free_delivery', title: 'Free Delivery', icon: Package, desc: '100% Free Shipping' }
                    ].map(typeItem => {
                      const Icon = typeItem.icon;
                      const isSelected = form.type === typeItem.id;
                      return (
                        <div
                          key={typeItem.id}
                          onClick={() => setForm({ ...form, type: typeItem.id })}
                          className={`p-2.5 rounded-2xl border cursor-pointer select-none transition ${
                            isSelected
                              ? 'bg-purple-50 dark:bg-purple-950/70 border-purple-500 text-purple-950 dark:text-purple-200 shadow-2xs'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg w-max mb-1.5 ${isSelected ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <p className="text-xs font-black leading-tight">{typeItem.title}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{typeItem.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Offer Values depending on Type */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                  {form.type === 'percent' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                          Discount Percentage (%) *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            max="99"
                            required
                            placeholder="e.g. 20"
                            value={form.discountValue}
                            onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                            className="w-full pl-3 pr-8 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-bold dark:text-white"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                          Max Discount Cap (₹) (Optional)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                          <input
                            type="number"
                            min="1"
                            placeholder="e.g. 150 (Leave blank for no limit)"
                            value={form.maxDiscount}
                            onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                            className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-bold dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {form.type === 'flat' && (
                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                        Flat Discount Amount (₹) *
                      </label>
                      <div className="relative max-w-xs">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          min="1"
                          required
                          placeholder="e.g. 50"
                          value={form.discountValue}
                          onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                          className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-bold dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  {form.type === 'bogo' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                          Buy Quantity *
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={form.bogoBuyQty}
                          onChange={(e) => setForm({ ...form, bogoBuyQty: e.target.value })}
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-bold dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                          Get Free Quantity *
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={form.bogoGetQty}
                          onChange={(e) => setForm({ ...form, bogoGetQty: e.target.value })}
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-bold dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* Coupon Code & Min Order */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                        <span>Coupon Code (Optional)</span>
                        <span className="text-[10px] text-slate-400 font-normal">Blank = Auto-applied</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. DIWALI20"
                        value={form.code}
                        onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-mono font-bold dark:text-white uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                        Minimum Order Value (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 199 (0 for no min)"
                          value={form.minOrderAmount}
                          onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                          className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-bold dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. SCOPE / APPLICABILITY SELECTION (CORE CUSTOMIZATION) */}
                <div className="space-y-3">
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    <span>Choose Where This Offer is Valid (Scope) *</span>
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'all', label: '🌐 All Products', sub: 'Entire store basket' },
                      { id: 'category', label: '📂 Specific Category', sub: 'e.g. Dairy or Veggies' },
                      { id: 'product', label: '🎯 Specific Product(s)', sub: 'Admin picks items' }
                    ].map(scopeItem => (
                      <div
                        key={scopeItem.id}
                        onClick={() => setForm({ ...form, scope: scopeItem.id })}
                        className={`p-2.5 rounded-2xl border text-center cursor-pointer select-none transition ${
                          form.scope === scopeItem.id
                            ? 'bg-purple-50 dark:bg-purple-950/70 border-purple-500 text-purple-950 dark:text-purple-200 shadow-2xs'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                        }`}
                      >
                        <p className="text-xs font-black">{scopeItem.label}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{scopeItem.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Scope: Category Dropdown */}
                  {form.scope === 'category' && (
                    <div className="p-3 bg-purple-50/50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 space-y-1.5 animate-in fade-in">
                      <label className="block text-xs font-black text-purple-900 dark:text-purple-200">
                        Select Target Category
                      </label>
                      <select
                        value={form.targetCategory}
                        onChange={(e) => setForm({ ...form, targetCategory: e.target.value })}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold dark:text-white capitalize"
                      >
                        <option value="dairy">Dairy & Fresh Milk (Amul, Namaste India)</option>
                        <option value="vegetables">Fresh Farm Vegetables</option>
                        <option value="grocery">Flour, Rice, Dal & Cooking Oil</option>
                        <option value="stationery">Stationery & Notebooks</option>
                        <option value="icecream">Ice Cream & Desserts</option>
                        <option value="general store">General Household Provisions</option>
                      </select>
                    </div>
                  )}

                  {/* Scope: Searchable Product Picker */}
                  {form.scope === 'product' && (
                    <div className="p-3 bg-purple-50/50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 space-y-2.5 animate-in fade-in">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-black text-purple-900 dark:text-purple-200">
                          Select Eligible Products ({form.targetProductIds.length} Selected)
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, targetProductIds: products.map(p => p.id) })}
                            className="text-[10px] font-black text-purple-700 dark:text-purple-300 hover:underline"
                          >
                            Select All
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, targetProductIds: [] })}
                            className="text-[10px] font-black text-red-600 dark:text-red-400 hover:underline"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>

                      {/* Product Search Box */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search product by name, brand, or category..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl dark:text-white"
                        />
                      </div>

                      {/* Scrollable Product Items List */}
                      <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
                        {filteredProducts.map(prod => {
                          const isSelected = form.targetProductIds.includes(prod.id);
                          return (
                            <div
                              key={prod.id}
                              onClick={() => toggleProductSelect(prod.id)}
                              className={`p-2 rounded-xl border flex items-center justify-between gap-2.5 cursor-pointer transition select-none ${
                                isSelected
                                  ? 'bg-purple-100/70 dark:bg-purple-900/60 border-purple-500 shadow-2xs'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-300'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-purple-700 dark:text-purple-300 shrink-0" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                                )}
                                <img
                                  src={prod.image || './images/cleaning_showcase.jpg'}
                                  alt={prod.name}
                                  className="w-8 h-8 rounded-lg object-cover shrink-0"
                                  onError={(e) => { e.target.src = './images/cleaning_showcase.jpg'; }}
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-black text-slate-800 dark:text-white truncate">
                                    {prod.name}
                                  </p>
                                  <p className="text-[10px] text-slate-400 truncate">
                                    {prod.unit} • <span className="capitalize">{prod.category}</span>
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 shrink-0">
                                ₹{prod.price}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Product Badge Text & Festival Theme */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                      Product Card Badge Text
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 🪔 DIWALI 20% OFF or 🎁 BOGO FREE"
                      value={form.badgeText}
                      onChange={(e) => setForm({ ...form, badgeText: e.target.value })}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                      Festival Banner Theme
                    </label>
                    <select
                      value={form.bannerTheme}
                      onChange={(e) => setForm({ ...form, bannerTheme: e.target.value })}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold dark:text-white"
                    >
                      {BANNER_THEMES.map(theme => (
                        <option key={theme.id} value={theme.id}>
                          {theme.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 6. Display Options & Live Toggle */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.showInAnnouncement}
                      onChange={(e) => setForm({ ...form, showInAnnouncement: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      📢 Feature in Top Scrolling Announcement Ticker
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.showHeroBanner}
                      onChange={(e) => setForm({ ...form, showHeroBanner: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      🌟 Display Festival Hero Banner on Customer Homepage
                    </span>
                  </label>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block">
                        Make Offer LIVE on Website Immediately
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        When enabled, customers can instantly enjoy this deal.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* 7. Live Real-Time Banner Preview */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Live Customer Preview
                  </span>
                  <div className={`p-3.5 rounded-2xl text-white bg-gradient-to-r ${(BANNER_THEMES.find(t => t.id === form.bannerTheme) || BANNER_THEMES[0]).gradient} shadow-md flex items-center justify-between gap-3`}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                        <h4 className="text-xs sm:text-sm font-black truncate">{form.title || 'Special Festival Offer'}</h4>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-white/90 truncate mt-0.5">
                        {form.tagline || 'Limited time deal for neighborhood doorstep delivery!'}
                      </p>
                    </div>
                    {form.code && (
                      <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-[10px] font-mono font-black shrink-0 border border-white/30">
                        {form.code}
                      </span>
                    )}
                  </div>
                </div>

              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0 bg-slate-50 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="admin-offer-form"
                disabled={saving}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{saving ? 'Publishing Deal...' : editingOffer ? 'Update & Save Deal' : 'Launch Offer / Deal 🚀'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
