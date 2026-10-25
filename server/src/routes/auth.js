import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase, saveDatabase } from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'general-store-gs-secret-key-2026';

// Middleware to authenticate Admin
export function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin token required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access only' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// 1. Admin Login
router.post('/admin-login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const db = getDatabase();
  const settings = db.settings;

  // Verify username
  if (username !== settings.adminUsername) {
    return res.status(401).json({ error: 'Invalid admin username or password' });
  }

  // Verify password (supports hashed or fallback admin123)
  const isMatch = (password === 'admin123') || (await bcrypt.compare(password, settings.adminPasswordHash).catch(() => false));
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid admin username or password' });
  }

  const token = jwt.sign(
    { role: 'admin', username: settings.adminUsername },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    success: true,
    message: 'Admin authenticated successfully',
    token,
    user: {
      role: 'admin',
      username: settings.adminUsername
    }
  });
});

// 2. User Mobile - Send OTP
router.post('/send-otp', (req, res) => {
  const { phone } = req.body;
  const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');

  if (!cleanPhone || cleanPhone.length < 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
  }

  // Generate 6 digit OTP (for testing convenience, we use deterministic or random OTP and return it)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const db = getDatabase();
  db.otps = db.otps || {};
  db.otps[cleanPhone] = {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes expiry
  };
  saveDatabase(db);

  return res.json({
    success: true,
    message: `OTP sent to +91 ${cleanPhone}`,
    simulatedOtp: otp // Returned for easy testing and display in UI
  });
});

// 3. User Mobile - Verify OTP
router.post('/verify-otp', (req, res) => {
  const { phone, otp, name } = req.body;
  const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');

  if (!cleanPhone || !otp) {
    return res.status(400).json({ error: 'Phone number and OTP are required' });
  }

  const db = getDatabase();
  const recorded = db.otps?.[cleanPhone];

  // Accept valid recorded OTP or master testing OTP '123456'
  const isValid = (otp === '123456') || (recorded && recorded.otp === otp && recorded.expiresAt > Date.now());

  if (!isValid) {
    return res.status(400).json({ error: 'Invalid or expired OTP. Please try again.' });
  }

  // Clear used OTP
  if (recorded) {
    delete db.otps[cleanPhone];
    saveDatabase(db);
  }

  const token = jwt.sign(
    { role: 'user', phone: cleanPhone, name: name || 'Customer' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  return res.json({
    success: true,
    message: 'Mobile number verified successfully!',
    token,
    user: {
      role: 'user',
      phone: cleanPhone,
      name: name || 'Valued Customer',
      verified: true
    }
  });
});

export default router;

