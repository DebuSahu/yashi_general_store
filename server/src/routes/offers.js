import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase, saveDatabase } from '../db.js';
import { authenticateAdmin } from './auth.js';

const router = express.Router();

// 1. GET /api/offers (Public - for customer storefront & admin)
router.get('/', (req, res) => {
  const { activeOnly } = req.query;
  const db = getDatabase();
  let offers = db.offers || [];

  if (activeOnly === 'true') {
    offers = offers.filter(o => o.isActive);
  }

  return res.json({
    success: true,
    count: offers.length,
    offers
  });
});

// 2. GET /api/offers/:id
router.get('/:id', (req, res) => {
  const db = getDatabase();
  const offer = (db.offers || []).find(o => o.id === req.params.id);
  if (!offer) {
    return res.status(404).json({ error: 'Offer not found' });
  }
  return res.json({ success: true, offer });
});

// 3. POST /api/offers (Admin only - Create new offer / festival deal)
router.post('/', authenticateAdmin, (req, res) => {
  const {
    title,
    tagline,
    code,
    type = 'percent', // percent, flat, bogo, free_delivery
    discountValue = 0,
    bogoBuyQty = 1,
    bogoGetQty = 1,
    scope = 'all', // all, category, product
    targetCategory = 'all',
    targetProductIds = [],
    minOrderAmount = 0,
    maxDiscount = null,
    badgeText = '',
    bannerTheme = 'festival', // festival, diwali, holi, bogo, mega, flash
    showInAnnouncement = true,
    showHeroBanner = true,
    isActive = true,
    startDate = null,
    endDate = null
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Offer title is required' });
  }

  const db = getDatabase();
  if (!db.offers) db.offers = [];

  const newOffer = {
    id: `offer-${Date.now().toString(36)}-${uuidv4().slice(0, 4)}`,
    title: title.trim(),
    tagline: (tagline || '').trim(),
    code: (code || '').trim().toUpperCase(),
    type: ['percent', 'flat', 'bogo', 'free_delivery'].includes(type) ? type : 'percent',
    discountValue: Number(discountValue) || 0,
    bogoBuyQty: Math.max(1, Number(bogoBuyQty) || 1),
    bogoGetQty: Math.max(1, Number(bogoGetQty) || 1),
    scope: ['all', 'category', 'product'].includes(scope) ? scope : 'all',
    targetCategory: targetCategory || 'all',
    targetProductIds: Array.isArray(targetProductIds) ? targetProductIds : [],
    minOrderAmount: Math.max(0, Number(minOrderAmount) || 0),
    maxDiscount: maxDiscount !== null && maxDiscount !== undefined && maxDiscount !== '' ? Number(maxDiscount) : null,
    badgeText: (badgeText || '').trim(),
    bannerTheme: bannerTheme || 'festival',
    showInAnnouncement: Boolean(showInAnnouncement),
    showHeroBanner: Boolean(showHeroBanner),
    isActive: Boolean(isActive),
    startDate: startDate || null,
    endDate: endDate || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.offers.unshift(newOffer);
  saveDatabase(db);

  return res.status(201).json({
    success: true,
    message: `Offer "${newOffer.title}" created successfully!`,
    offer: newOffer
  });
});

// 4. PUT /api/offers/:id (Admin only - Update offer)
router.put('/:id', authenticateAdmin, (req, res) => {
  const db = getDatabase();
  const index = (db.offers || []).findIndex(o => o.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Offer not found' });
  }

  const existing = db.offers[index];
  const payload = req.body;

  const updatedOffer = {
    ...existing,
    ...payload,
    id: existing.id,
    title: payload.title !== undefined ? payload.title.trim() : existing.title,
    tagline: payload.tagline !== undefined ? payload.tagline.trim() : existing.tagline,
    code: payload.code !== undefined ? (payload.code || '').trim().toUpperCase() : existing.code,
    type: payload.type || existing.type,
    discountValue: payload.discountValue !== undefined ? Number(payload.discountValue) : existing.discountValue,
    bogoBuyQty: payload.bogoBuyQty !== undefined ? Math.max(1, Number(payload.bogoBuyQty)) : existing.bogoBuyQty,
    bogoGetQty: payload.bogoGetQty !== undefined ? Math.max(1, Number(payload.bogoGetQty)) : existing.bogoGetQty,
    scope: payload.scope || existing.scope,
    targetCategory: payload.targetCategory !== undefined ? payload.targetCategory : existing.targetCategory,
    targetProductIds: Array.isArray(payload.targetProductIds) ? payload.targetProductIds : existing.targetProductIds,
    minOrderAmount: payload.minOrderAmount !== undefined ? Math.max(0, Number(payload.minOrderAmount)) : existing.minOrderAmount,
    maxDiscount: payload.maxDiscount !== undefined ? (payload.maxDiscount === '' || payload.maxDiscount === null ? null : Number(payload.maxDiscount)) : existing.maxDiscount,
    badgeText: payload.badgeText !== undefined ? payload.badgeText.trim() : existing.badgeText,
    bannerTheme: payload.bannerTheme || existing.bannerTheme,
    showInAnnouncement: payload.showInAnnouncement !== undefined ? Boolean(payload.showInAnnouncement) : existing.showInAnnouncement,
    showHeroBanner: payload.showHeroBanner !== undefined ? Boolean(payload.showHeroBanner) : existing.showHeroBanner,
    isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : existing.isActive,
    updatedAt: new Date().toISOString()
  };

  db.offers[index] = updatedOffer;
  saveDatabase(db);

  return res.json({
    success: true,
    message: `Offer "${updatedOffer.title}" updated successfully!`,
    offer: updatedOffer
  });
});

// 5. PATCH /api/offers/:id/toggle-live (Admin only - 1-click toggle Live/Pause)
router.patch('/:id/toggle-live', authenticateAdmin, (req, res) => {
  const db = getDatabase();
  const offer = (db.offers || []).find(o => o.id === req.params.id);

  if (!offer) {
    return res.status(404).json({ error: 'Offer not found' });
  }

  offer.isActive = !offer.isActive;
  offer.updatedAt = new Date().toISOString();
  saveDatabase(db);

  return res.json({
    success: true,
    message: offer.isActive ? `Offer "${offer.title}" is now LIVE! 🎉` : `Offer "${offer.title}" is now PAUSED.`,
    isActive: offer.isActive,
    offer
  });
});

// 6. DELETE /api/offers/:id (Admin only)
router.delete('/:id', authenticateAdmin, (req, res) => {
  const db = getDatabase();
  const index = (db.offers || []).findIndex(o => o.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Offer not found' });
  }

  const removed = db.offers.splice(index, 1)[0];
  saveDatabase(db);

  return res.json({
    success: true,
    message: `Offer "${removed.title}" deleted successfully.`,
    offer: removed
  });
});

export default router;
