import express from 'express';
import { getDatabase, saveDatabase, calculateDistance } from '../db.js';
import { authenticateAdmin } from './auth.js';

const router = express.Router();

// 1. Get Store Settings & Delivery Eligibility
router.get('/', (req, res) => {
  const db = getDatabase();
  const settings = { ...db.settings };
  delete settings.adminPasswordHash;
  delete settings.adminUsername;
  delete settings.admins;

  const { lat, lon } = req.query;
  let eligibility = null;

  if (lat && lon) {
    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);
    if (!isNaN(userLat) && !isNaN(userLon)) {
      const distance = calculateDistance(settings.latitude, settings.longitude, userLat, userLon);
      eligibility = {
        distanceKm: distance,
        maxRadiusKm: settings.maxDeliveryRadiusKm || 5,
        isEligible: distance <= (settings.maxDeliveryRadiusKm || 5)
      };
    }
  }

  return res.json({
    success: true,
    settings,
    eligibility
  });
});

// 2. Admin: Update Store Settings (Coordinates, Delivery Radius, Contact)
router.put('/', authenticateAdmin, (req, res) => {
  const {
    storeName,
    tagline,
    phone,
    email,
    address,
    latitude,
    longitude,
    mapsUrl,
    maxDeliveryRadiusKm,
    minOrderAmount
  } = req.body;

  const db = getDatabase();
  const existing = db.settings;

  db.settings = {
    ...existing,
    storeName: storeName !== undefined ? storeName.trim() : existing.storeName,
    tagline: tagline !== undefined ? tagline.trim() : existing.tagline,
    phone: phone !== undefined ? phone.trim() : existing.phone,
    email: email !== undefined ? email.trim() : existing.email,
    address: address !== undefined ? address.trim() : existing.address,
    latitude: latitude !== undefined ? parseFloat(latitude) : existing.latitude,
    longitude: longitude !== undefined ? parseFloat(longitude) : existing.longitude,
    mapsUrl: mapsUrl !== undefined ? mapsUrl.trim() : (existing.mapsUrl || 'https://maps.app.goo.gl/36DwR1dGU2bfv7KD9'),
    maxDeliveryRadiusKm: maxDeliveryRadiusKm !== undefined ? parseFloat(maxDeliveryRadiusKm) : existing.maxDeliveryRadiusKm,
    minOrderAmount: minOrderAmount !== undefined ? parseFloat(minOrderAmount) : existing.minOrderAmount
  };

  saveDatabase(db);

  const safeSettings = { ...db.settings };
  delete safeSettings.adminPasswordHash;

  return res.json({
    success: true,
    message: 'Store settings updated successfully',
    settings: safeSettings
  });
});

export default router;

