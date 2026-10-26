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
  const admins = db.admins || [];
  
  // Find matching admin (case-insensitive)
  const targetAdmin = admins.find(a => a.username.toLowerCase() === username.trim().toLowerCase()) 
    || (db.settings?.adminUsername?.toLowerCase() === username.trim().toLowerCase() 
        ? { username: db.settings.adminUsername, passwordHash: db.settings.adminPasswordHash, id: 'admin-primary', name: 'Store Owner' }
        : null);

  if (!targetAdmin) {
    return res.status(401).json({ error: 'Invalid admin username or password' });
  }

  // Verify password (supports hashed or fallback admin123)
  const isMatch = (password === 'admin123' && targetAdmin.username === 'admin') 
    || (targetAdmin.passwordHash ? await bcrypt.compare(password, targetAdmin.passwordHash).catch(() => false) : false);

  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid admin username or password' });
  }

  const token = jwt.sign(
    { role: 'admin', username: targetAdmin.username, id: targetAdmin.id },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    success: true,
    message: 'Admin authenticated successfully',
    token,
    user: {
      role: 'admin',
      id: targetAdmin.id,
      username: targetAdmin.username,
      name: targetAdmin.name || targetAdmin.username
    }
  });
});

// 2. Admin Accounts Management
// GET /api/auth/admins - List all admin accounts (NEVER returns passwords or hashes)
router.get('/admins', authenticateAdmin, (req, res) => {
  const db = getDatabase();
  const safeAdmins = (db.admins || []).map(a => ({
    id: a.id,
    username: a.username,
    name: a.name || a.username,
    role: a.role || 'admin',
    createdAt: a.createdAt
  }));
  return res.json({ success: true, admins: safeAdmins });
});

// POST /api/auth/admins - Add a new admin user
router.post('/admins', authenticateAdmin, async (req, res) => {
  try {
    const { username, password, name, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const cleanUsername = username.trim();
    if (cleanUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }

    const db = getDatabase();
    db.admins = db.admins || [];

    // Check duplicate
    if (db.admins.some(a => a.username.toLowerCase() === cleanUsername.toLowerCase())) {
      return res.status(400).json({ error: 'An admin user with this username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newAdmin = {
      id: `admin-${Date.now()}`,
      username: cleanUsername,
      name: (name || cleanUsername).trim(),
      role: role === 'superadmin' ? 'superadmin' : 'admin',
      passwordHash,
      createdAt: new Date().toISOString()
    };

    db.admins.push(newAdmin);
    saveDatabase(db);

    return res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      admin: {
        id: newAdmin.id,
        username: newAdmin.username,
        name: newAdmin.name,
        role: newAdmin.role,
        createdAt: newAdmin.createdAt
      }
    });
  } catch (err) {
    console.error('Error creating admin:', err);
    return res.status(500).json({ error: 'Failed to create admin user' });
  }
});

// PUT /api/auth/admins/:id/password - Reset an admin user's password
router.put('/admins/:id/password', authenticateAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ error: 'New password must be at least 4 characters' });
    }

    const db = getDatabase();
    db.admins = db.admins || [];
    const targetAdmin = db.admins.find(a => a.id === req.params.id);

    if (!targetAdmin) {
      return res.status(404).json({ error: 'Admin account not found' });
    }

    targetAdmin.passwordHash = await bcrypt.hash(newPassword, 10);
    targetAdmin.updatedAt = new Date().toISOString();
    saveDatabase(db);

    return res.json({
      success: true,
      message: `Password for admin '${targetAdmin.username}' updated successfully`
    });
  } catch (err) {
    console.error('Error updating admin password:', err);
    return res.status(500).json({ error: 'Failed to update admin password' });
  }
});

// PUT /api/auth/change-password - Change self account password
router.put('/change-password', authenticateAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    if (newPassword.length < 4) {
      return res.status(400).json({ error: 'New password must be at least 4 characters' });
    }

    const db = getDatabase();
    db.admins = db.admins || [];
    const currentUsername = req.user.username;
    const currentAdmin = db.admins.find(a => a.username.toLowerCase() === currentUsername?.toLowerCase());

    if (!currentAdmin) {
      return res.status(404).json({ error: 'Logged in admin account not found' });
    }

    // Verify current password
    const isMatch = (currentPassword === 'admin123' && currentAdmin.username === 'admin')
      || (currentAdmin.passwordHash ? await bcrypt.compare(currentPassword, currentAdmin.passwordHash).catch(() => false) : false);

    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    currentAdmin.passwordHash = await bcrypt.hash(newPassword, 10);
    currentAdmin.updatedAt = new Date().toISOString();
    saveDatabase(db);

    return res.json({
      success: true,
      message: 'Your password has been changed successfully'
    });
  } catch (err) {
    console.error('Error changing self password:', err);
    return res.status(500).json({ error: 'Failed to change password' });
  }
});

// DELETE /api/auth/admins/:id - Delete admin account
router.delete('/admins/:id', authenticateAdmin, (req, res) => {
  const db = getDatabase();
  db.admins = db.admins || [];

  if (db.admins.length <= 1) {
    return res.status(400).json({ error: 'Cannot delete the only remaining admin account' });
  }

  const targetIndex = db.admins.findIndex(a => a.id === req.params.id);
  if (targetIndex === -1) {
    return res.status(404).json({ error: 'Admin account not found' });
  }

  const target = db.admins[targetIndex];
  if (target.username.toLowerCase() === req.user.username?.toLowerCase()) {
    return res.status(400).json({ error: 'You cannot delete your own active admin account' });
  }

  db.admins.splice(targetIndex, 1);
  saveDatabase(db);

  return res.json({
    success: true,
    message: `Admin '${target.username}' deleted successfully`
  });
});

// Helper: Dispatch real SMS if an SMS gateway (Fast2SMS or Twilio) is configured
async function dispatchRealSms(phone, otp, settings = {}) {
  const tenDigit = String(phone).replace(/[^0-9]/g, '').slice(-10);
  const fast2smsKey = process.env.FAST2SMS_API_KEY || settings?.fast2smsApiKey;
  const twilioSid = process.env.TWILIO_ACCOUNT_SID || settings?.twilioAccountSid;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN || settings?.twilioAuthToken;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER || settings?.twilioPhoneNumber;

  // 1. Try Fast2SMS (Preferred Indian SMS gateway for Quick OTP)
  if (fast2smsKey) {
    try {
      const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(fast2smsKey)}&variables_values=${encodeURIComponent(otp)}&route=otp&numbers=${tenDigit}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'cache-control': 'no-cache' }
      });
      const data = await response.json();
      if (data && data.return) {
        console.log(`✅ [Fast2SMS] Real SMS dispatched to +91 ${tenDigit}`);
        return { sent: true, provider: 'Fast2SMS', message: `SMS sent to +91 ${tenDigit}` };
      } else {
        console.warn(`⚠️ [Fast2SMS] Error response:`, data?.message || data);
      }
    } catch (err) {
      console.error(`❌ [Fast2SMS] Network failed:`, err.message);
    }
  }

  // 2. Try Twilio
  if (twilioSid && twilioAuth && twilioFrom) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const basic = Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', `+91${tenDigit}`);
      params.append('From', twilioFrom);
      params.append('Body', `Your Yashi General Store OTP is ${otp}. Valid for 10 minutes.`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basic}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });
      const data = await response.json();
      if (response.ok && data.sid) {
        console.log(`✅ [Twilio] Real SMS dispatched to +91 ${tenDigit}`);
        return { sent: true, provider: 'Twilio', message: `SMS sent to +91 ${tenDigit}` };
      } else {
        console.warn(`⚠️ [Twilio] Error response:`, data?.message || data);
      }
    } catch (err) {
      console.error(`❌ [Twilio] Network failed:`, err.message);
    }
  }

  return { sent: false, provider: 'demo', message: 'No SMS gateway configured' };
}

// 2. User Mobile - Send OTP
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');

  if (!cleanPhone || cleanPhone.length < 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
  }

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const db = getDatabase();
  db.otps = db.otps || {};
  db.otps[cleanPhone] = {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes expiry
  };
  saveDatabase(db);

  // Attempt real telecom SMS delivery if gateway credentials are provided
  const smsResult = await dispatchRealSms(cleanPhone, otp, db.settings);

  return res.json({
    success: true,
    realSmsSent: smsResult.sent,
    provider: smsResult.provider,
    message: smsResult.sent
      ? `Real SMS sent to +91 ${cleanPhone.slice(-10)} via ${smsResult.provider}`
      : `Demo mode: No SMS gateway configured. Use instant OTP ${otp}`,
    simulatedOtp: otp,
    testOtp: otp,
    phone: cleanPhone
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

// 4. User Passwordless Google / Gmail Login
router.post('/google', (req, res) => {
  const { email, name, avatar, phone } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid Gmail/email address is required' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const customerName = name?.trim() || cleanEmail.split('@')[0];
  const customerPhone = phone ? String(phone).replace(/[^0-9]/g, '') : '9876543210';

  const token = jwt.sign(
    { role: 'user', email: cleanEmail, name: customerName, authProvider: 'google' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  return res.json({
    success: true,
    message: 'Signed in successfully via Google (Passwordless)',
    token,
    user: {
      role: 'user',
      email: cleanEmail,
      name: customerName,
      phone: customerPhone,
      avatar: avatar || null,
      authProvider: 'google',
      verified: true
    }
  });
});

export default router;

