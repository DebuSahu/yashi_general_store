import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase, saveDatabase, calculateDistance } from '../db.js';
import { authenticateAdmin } from './auth.js';

const router = express.Router();

// 1. Submit a Delivery Request (User)
router.post('/', (req, res) => {
  const {
    customerName,
    customerPhone,
    customerEmail,
    address,
    latitude,
    longitude,
    items,
    notes
  } = req.body;

  if (!customerName || !customerName.trim()) {
    return res.status(400).json({ error: 'Customer name is required for placing a delivery order.' });
  }

  if (!customerPhone || !address || !items || !items.length) {
    return res.status(400).json({
      error: 'Please provide customer name, customer phone, delivery address, and at least one item.'
    });
  }

  const cleanPhone = String(customerPhone).replace(/[^0-9]/g, '');
  if (cleanPhone.length < 10) {
    return res.status(400).json({ error: 'Please provide a valid 10-digit mobile number' });
  }

  // Check Location and validate 5km radius
  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({
      error: 'Delivery location coordinates (GPS) are required to verify delivery eligibility.'
    });
  }

  const userLat = parseFloat(latitude);
  const userLon = parseFloat(longitude);

  if (isNaN(userLat) || isNaN(userLon)) {
    return res.status(400).json({ error: 'Invalid GPS coordinates provided.' });
  }

  const db = getDatabase();
  const settings = db.settings;
  const shopLat = settings.latitude;
  const shopLon = settings.longitude;
  const maxRadius = settings.maxDeliveryRadiusKm || 5;

  // Calculate distance using Haversine formula
  const distanceKm = calculateDistance(shopLat, shopLon, userLat, userLon);

  // STRICT 5KM RESTRICTION CHECK
  if (distanceKm > maxRadius) {
    return res.status(400).json({
      error: `Delivery Not Available: Your delivery location is ${distanceKm} km away. Yashi General Store only delivers within a ${maxRadius} km radius of our shop location.`,
      distanceKm,
      maxAllowedKm: maxRadius,
      eligible: false
    });
  }

  // Calculate total and verify stock
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = (db.products || []).find(p => String(p.id) === String(item.id || item.productId));
    const price = product ? product.price : (Number(item.price) || 0);
    const name = product ? product.name : (item.name || 'Store Product');
    const unit = product ? product.unit : (item.unit || 'piece');
    const qty = Number(item.quantity) || 1;
    totalAmount += price * qty;

    orderItems.push({
      id: item.id || item.productId,
      name,
      category: product?.category || 'General',
      price,
      unit,
      quantity: qty,
      itemTotal: price * qty
    });
  }

  // MINIMUM ORDER VALUE ENFORCEMENT (Must be at least ₹100)
  const minOrder = settings.minOrderAmount || 100;
  if (totalAmount < minOrder) {
    return res.status(400).json({
      error: `Minimum order value must be ₹${minOrder}. Your current order total is ₹${totalAmount}. Please add items worth at least ₹${minOrder - totalAmount} more to proceed.`,
      minOrderAmount: minOrder,
      currentTotal: totalAmount
    });
  }

  // Deduct stock after order validation passes
  for (const item of items) {
    const product = (db.products || []).find(p => String(p.id) === String(item.id || item.productId));
    if (product && product.stock !== undefined) {
      const qty = Number(item.quantity) || 1;
      product.stock = Math.max(0, product.stock - qty);
      if (product.stock === 0) product.inStock = false;
    }
  }

  const now = new Date().toISOString();
  const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder = {
    id: orderId,
    customerName: customerName?.trim() || 'Customer',
    customerPhone: cleanPhone,
    customerEmail: (customerEmail || '').trim().toLowerCase() || null,
    address: address.trim(),
    latitude: userLat,
    longitude: userLon,
    distanceKm,
    items: orderItems,
    totalAmount,
    notes: notes?.trim() || '',
    status: 'Pending',
    createdAt: now,
    statusHistory: [
      { status: 'Pending', timestamp: now, note: 'Delivery request received by store' }
    ]
  };

  db.orders = db.orders || [];
  db.orders.unshift(newOrder);
  saveDatabase(db);

  return res.status(201).json({
    success: true,
    message: 'Delivery request sent successfully to Yashi General Store!',
    order: newOrder
  });
});

// 2. Get Orders (Admin sees all, or User filters by email, phone, or orderId)
router.get('/', (req, res) => {
  const { phone, email, query, status } = req.query;
  const db = getDatabase();
  let orders = db.orders || [];

  const q = (query || email || '').trim().toLowerCase();
  if (q) {
    if (q.includes('@')) {
      orders = orders.filter(o => (o.customerEmail || '').toLowerCase() === q);
    } else {
      orders = orders.filter(o =>
        (o.id || '').toLowerCase().includes(q) ||
        (o.customerEmail || '').toLowerCase().includes(q)
      );
    }
  }

  if (phone) {
    const cleanPhone = String(phone).replace(/[^0-9]/g, '');
    orders = orders.filter(o => (o.customerPhone || '').replace(/[^0-9]/g, '').includes(cleanPhone));
  }

  if (status && status !== 'all') {
    orders = orders.filter(o => (o.status || '').toLowerCase() === status.toLowerCase());
  }

  return res.json({
    success: true,
    count: orders.length,
    orders
  });
});

// 3. Get single order details
router.get('/:id', (req, res) => {
  const db = getDatabase();
  const order = (db.orders || []).find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  return res.json({ success: true, order });
});

// 4. Update order status (Admin)
router.patch('/:id/status', authenticateAdmin, (req, res) => {
  const { status, note } = req.body;
  const validStatuses = ['Pending', 'Accepted', 'Packing', 'Out for Delivery', 'Delivered', 'Cancelled'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  const db = getDatabase();
  const order = (db.orders || []).find(o => o.id === req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const now = new Date().toISOString();
  order.status = status;
  order.statusHistory = order.statusHistory || [];
  order.statusHistory.push({
    status,
    timestamp: now,
    note: note || `Order marked as ${status}`
  });

  saveDatabase(db);

  return res.json({
    success: true,
    message: `Order status updated to ${status}`,
    order
  });
});

export default router;

