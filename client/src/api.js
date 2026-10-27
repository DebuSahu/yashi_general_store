import defaultData from './defaultData.json';

// Dynamic API Base URL
// On GitHub Pages (github.io), defaults to local browser fallback unless VITE_API_BASE is set
const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
const API_BASE = import.meta.env.VITE_API_BASE || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? (window.location.port === '5173' || window.location.port === '3000' ? 'http://localhost:5000/api' : '/api')
    : (isGitHubPages ? null : '/api'));

// Haversine formula for 5km delivery radius calculation
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

// LocalStorage helpers for standalone GitHub Pages mode
function getLocalStore(key, defaultValue) {
  try {
    const val = localStorage.getItem(`ygs_${key}`);
    return val ? JSON.parse(val) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function setLocalStore(key, value) {
  try {
    localStorage.setItem(`ygs_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

const CURRENT_CATALOG_VERSION = 'v5_73_ai_products';
const CURRENT_SETTINGS_VERSION = 'v3_debusahu_store_gmail';

// Initialize local mock data
function initLocalData() {
  const currentVersion = getLocalStore('catalog_version', null);
  const existingProducts = getLocalStore('products', null);

  // Auto-upgrade catalog if version changed or missing
  if (currentVersion !== CURRENT_CATALOG_VERSION || !existingProducts || !Array.isArray(existingProducts) || existingProducts.length < (defaultData.products || []).length) {
    setLocalStore('products', defaultData.products || []);
    setLocalStore('catalog_version', CURRENT_CATALOG_VERSION);
  }

  // Auto-upgrade settings with updated store location & Google Maps link & store Gmail
  const currentSettingsVersion = getLocalStore('settings_version', null);
  const existingSettings = getLocalStore('settings', null);
  if (
    currentSettingsVersion !== CURRENT_SETTINGS_VERSION ||
    !existingSettings ||
    !existingSettings.latitude ||
    existingSettings.latitude < 25 ||
    !existingSettings.email ||
    existingSettings.email === 'contact@yashigeneralstore.com'
  ) {
    setLocalStore('settings', {
      ...(defaultData.settings || {}),
      ...(existingSettings || {}),
      email: (existingSettings && existingSettings.email && existingSettings.email !== 'contact@yashigeneralstore.com')
        ? existingSettings.email
        : 'debusahu121@gmail.com'
    });
    setLocalStore('settings_version', CURRENT_SETTINGS_VERSION);
  }
  if (!getLocalStore('orders', null)) {
    setLocalStore('orders', []);
  }
  const primaryOwnerEmail = 'debusahu121@gmail.com';
  let admins = getLocalStore('admins', null);
  if (!admins || !Array.isArray(admins) || admins.length === 0) {
    admins = [
      {
        id: 'admin-owner',
        username: primaryOwnerEmail,
        email: primaryOwnerEmail,
        name: 'Debu Sahu (Store Owner)',
        role: 'superadmin',
        createdAt: new Date().toISOString()
      }
    ];
    setLocalStore('admins', admins);
  } else {
    // Ensure primary owner is always present in admins list
    const hasOwner = admins.some(a => 
      (a.email && a.email.toLowerCase() === primaryOwnerEmail) || 
      (a.username && a.username.toLowerCase() === primaryOwnerEmail)
    );
    if (!hasOwner) {
      admins.unshift({
        id: 'admin-owner',
        username: primaryOwnerEmail,
        email: primaryOwnerEmail,
        name: 'Debu Sahu (Store Owner)',
        role: 'superadmin',
        createdAt: new Date().toISOString()
      });
      setLocalStore('admins', admins);
    }
  }
}
initLocalData();

export const api = {
  // Check if an email is an authorized store admin
  isAuthorizedAdminEmail: (email) => {
    if (!email) return false;
    const clean = String(email).trim().toLowerCase();
    if (clean === 'debusahu121@gmail.com') return true;
    const admins = getLocalStore('admins', []);
    return admins.some(a => 
      (a.email && a.email.toLowerCase() === clean) || 
      (a.username && a.username.toLowerCase() === clean)
    );
  },
  // Store Settings & 5km Radius check
  getSettings: async (lat, lon) => {
    if (API_BASE) {
      try {
        let url = `${API_BASE}/settings`;
        if (lat && lon) url += `?lat=${lat}&lon=${lon}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          return {
            success: true,
            settings: data.settings || data
          };
        }
      } catch (err) {
        console.warn('Falling back to local store settings:', err.message);
      }
    }

    const settings = getLocalStore('settings', defaultData.settings || {});
    let distanceKm = null;
    let withinDeliveryRadius = true;

    if (lat && lon && settings.latitude && settings.longitude) {
      distanceKm = calculateDistanceKm(
        parseFloat(settings.latitude),
        parseFloat(settings.longitude),
        parseFloat(lat),
        parseFloat(lon)
      );
      withinDeliveryRadius = distanceKm <= (settings.maxDeliveryRadiusKm || 5);
    }

    const normalizedSettings = {
      storeName: settings.storeName || 'Yashi General Store',
      acronym: settings.acronym || 'YGS',
      tagline: settings.tagline || 'Your Daily Grocery, Fresh Vegetables, Amul & Namaste India Dairy & Household Essentials',
      phone: settings.phone || '+91 98765 43210',
      email: settings.email || 'contact@yashigeneralstore.com',
      address: settings.address || '510, Elliot Lane, Near Water Tank, Mirpur Cantonment, Kanpur, Uttar Pradesh - 208004',
      latitude: settings.latitude || 26.4519124,
      longitude: settings.longitude || 80.3537057,
      mapsUrl: settings.mapsUrl || 'https://maps.app.goo.gl/36DwR1dGU2bfv7KD9',
      maxDeliveryRadiusKm: settings.maxDeliveryRadiusKm || 5,
      minOrderAmount: settings.minOrderAmount || 100,
      deliveryFee: settings.deliveryFee || 0,
      userLocation: lat && lon ? { latitude: parseFloat(lat), longitude: parseFloat(lon) } : null,
      distanceKm,
      withinDeliveryRadius
    };

    return {
      success: true,
      settings: normalizedSettings
    };
  },

  updateSettings: async (settingsData, token) => {
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/settings`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(settingsData)
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Falling back to local settings update:', err.message);
      }
    }

    const current = getLocalStore('settings', defaultData.settings);
    const updated = { ...current, ...settingsData };
    setLocalStore('settings', updated);
    return { success: true, message: 'Store settings updated successfully', settings: updated };
  },

  // Products
  getProducts: async (category = 'all', search = '') => {
    if (API_BASE) {
      try {
        const params = new URLSearchParams();
        if (category && category !== 'all') params.append('category', category);
        if (search) params.append('search', search);
        const res = await fetch(`${API_BASE}/products?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          return {
            success: true,
            products: Array.isArray(data) ? data : (data.products || [])
          };
        }
      } catch (err) {
        console.warn('Falling back to local products data:', err.message);
      }
    }

    let products = getLocalStore('products', defaultData.products || []);
    if (!products || !Array.isArray(products) || products.length === 0) {
      products = defaultData.products || [];
      setLocalStore('products', products);
    }

    if (category && category !== 'all') {
      const catClean = category.toLowerCase().replace(/[\s-_]+/g, '');
      products = products.filter(p => (p.category || '').toLowerCase().replace(/[\s-_]+/g, '') === catClean);
    }
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }
    return {
      success: true,
      products: products
    };
  },

  addProduct: async (productData, token) => {
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(productData)
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Falling back to local product creation:', err.message);
      }
    }

    const products = getLocalStore('products', defaultData.products || []);
    const newProduct = {
      ...productData,
      id: `prod-${Date.now()}`,
      inStock: productData.inStock !== false
    };
    products.unshift(newProduct);
    setLocalStore('products', products);
    return newProduct;
  },

  updateProduct: async (id, productData, token) => {
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/products/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(productData)
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Falling back to local product update:', err.message);
      }
    }

    const products = getLocalStore('products', defaultData.products || []);
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...productData };
      setLocalStore('products', products);
      return products[index];
    }
    return productData;
  },

  deleteProduct: async (id, token) => {
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/products/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Falling back to local product deletion:', err.message);
      }
    }

    let products = getLocalStore('products', defaultData.products || []);
    products = products.filter(p => p.id !== id);
    setLocalStore('products', products);
    return { success: true, message: 'Product removed' };
  },

  // Upload local photo
  uploadImage: async (imageBase64, filename, token) => {
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ image: imageBase64, filename })
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Falling back to base64 image representation:', err.message);
      }
    }

    return {
      success: true,
      message: 'Photo uploaded to local storage successfully',
      url: imageBase64
    };
  },

  // User Mobile OTP
  sendOtp: async (phone) => {
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/auth/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone })
        });
        if (res.ok) {
          const data = await res.json();
          const otpVal = data.simulatedOtp || data.testOtp || '123456';
          return {
            ...data,
            realSmsSent: Boolean(data.realSmsSent),
            simulatedOtp: otpVal,
            testOtp: otpVal
          };
        }
      } catch (err) {
        console.warn('Falling back to simulated OTP:', err.message);
      }
    }

    return {
      success: true,
      realSmsSent: false,
      message: 'Demo mode: instant verification OTP generated',
      simulatedOtp: '123456',
      testOtp: '123456',
      phone
    };
  },

  verifyOtp: async (phone, otp, name) => {
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, otp, name })
        });
        if (res.ok) {
          const data = await res.json();
          return {
            ...data,
            success: true,
            user: {
              ...(data.user || {}),
              phone,
              name: (data.user && data.user.name) || name || 'Customer',
              verified: true
            }
          };
        }
      } catch (err) {
        console.warn('Falling back to simulated OTP verification:', err.message);
      }
    }

    return {
      success: true,
      token: 'demo-user-token-' + Date.now(),
      user: { phone, name: name || 'Valued Customer', verified: true }
    };
  },

  // Google / Gmail Passwordless Login (Requires Admin Password for Admin/Owner emails)
  googleLogin: async ({ email, name, avatar, phone, adminPassword }) => {
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, avatar, phone, adminPassword })
        });
        const data = await res.json();
        if (res.ok) {
          return data;
        } else if (data && data.requiresAdminPassword) {
          return data;
        } else if (data && data.error) {
          return { success: false, error: data.error };
        }
      } catch (err) {
        console.warn('Falling back to local Google login:', err.message);
      }
    }

    const cleanEmail = String(email || 'customer@gmail.com').trim().toLowerCase();
    let customerName = name?.trim();
    if (!customerName || customerName === cleanEmail || customerName.includes('@')) {
      const local = cleanEmail.split('@')[0];
      if (local.toLowerCase().startsWith('debu')) {
        customerName = 'Debu Sahu';
      } else {
        const cleaned = local.replace(/[._\-+]/g, ' ').replace(/\d+/g, '').trim();
        customerName = cleaned
          ? cleaned.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
          : 'Customer';
      }
    }
    const customerPhone = phone ? String(phone).replace(/[^0-9]/g, '') : '9876543210';
    const isOwner = cleanEmail === 'debusahu121@gmail.com';
    const isAuthorizedAdmin = isOwner || api.isAuthorizedAdminEmail(cleanEmail);

    // SECURITY CHECK: If this email belongs to an Admin/Owner, verify the admin password!
    let isAdmin = false;
    let adminToken = null;
    let role = 'user';

    if (isAuthorizedAdmin) {
      const admins = getLocalStore('admins', []);
      const match = admins.find(a => 
        (a.email && a.email.toLowerCase() === cleanEmail) || 
        (a.username && a.username.toLowerCase() === cleanEmail)
      );

      const expectedPassword = match?.password || 'admin123';

      if (!adminPassword) {
        return {
          success: false,
          requiresAdminPassword: true,
          error: 'Admin verification required: Enter your Admin Password to unlock Admin Portal.'
        };
      }

      if (adminPassword !== expectedPassword && adminPassword !== 'admin123') {
        return {
          success: false,
          error: 'Incorrect Admin Password. Access denied.'
        };
      }

      // Admin password verified!
      isAdmin = true;
      adminToken = 'admin-jwt-token-' + Date.now();
      role = isOwner ? 'superadmin' : (match?.role || 'admin');
    }

    return {
      success: true,
      token: 'google-token-' + Date.now(),
      isAdmin,
      adminToken,
      user: {
        role,
        email: cleanEmail,
        name: customerName,
        phone: customerPhone,
        avatar: avatar || null,
        authProvider: 'google',
        verified: true,
        isAdmin
      }
    };
  },

  // Admin Login
  adminLogin: async (username, password) => {
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/auth/admin-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Falling back to local admin verification:', err.message);
      }
    }

    const admins = getLocalStore('admins', []);
    const match = admins.find(a => a.username.toLowerCase() === username.trim().toLowerCase());
    if (match && (match.password === password || (username === 'admin' && password === 'admin123'))) {
      return {
        success: true,
        token: 'admin-jwt-token-' + Date.now(),
        user: {
          role: 'admin',
          id: match.id,
          username: match.username,
          name: match.name || match.username
        }
      };
    }
    return { error: 'Invalid admin username or password' };
  },

  // Admin Accounts & Password Management
  getAdmins: async (token) => {
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/auth/admins`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Falling back to local admins list:', err.message);
      }
    }

    const admins = getLocalStore('admins', []);
    const safeAdmins = admins.map(a => ({
      id: a.id,
      username: a.username || a.email,
      email: a.email || a.username,
      name: a.name || a.username,
      role: a.role || 'admin',
      createdAt: a.createdAt
    }));
    return { success: true, admins: safeAdmins };
  },

  addAdmin: async (adminData, token) => {
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/auth/admins`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(adminData)
        });
        if (res.ok) return await res.json();
        const errData = await res.json().catch(() => ({}));
        if (errData.error) return errData;
      } catch (err) {
        console.warn('Falling back to local addAdmin:', err.message);
      }
    }

    const email = (adminData.email || adminData.username || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return { error: 'Please enter a valid Gmail address for the admin' };
    }

    const admins = getLocalStore('admins', []);
    if (admins.some(a => (a.email && a.email.toLowerCase() === email) || (a.username && a.username.toLowerCase() === email))) {
      return { error: `Admin with Gmail '${email}' already exists` };
    }

    const newAdmin = {
      id: `admin-${Date.now()}`,
      username: email,
      email: email,
      name: (adminData.name || email.split('@')[0]).trim(),
      role: adminData.role || 'admin',
      createdAt: new Date().toISOString()
    };
    admins.push(newAdmin);
    setLocalStore('admins', admins);

    return {
      success: true,
      message: `Admin access granted to ${email}`,
      admin: {
        id: newAdmin.id,
        username: newAdmin.username,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role,
        createdAt: newAdmin.createdAt
      }
    };
  },

  updateAdminPassword: async (id, newPassword, token) => {
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/auth/admins/${id}/password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ newPassword })
        });
        if (res.ok) return await res.json();
        const errData = await res.json().catch(() => ({}));
        if (errData.error) return errData;
      } catch (err) {
        console.warn('Falling back to local updateAdminPassword:', err.message);
      }
    }

    const admins = getLocalStore('admins', []);
    const target = admins.find(a => a.id === id);
    if (!target) return { error: 'Admin account not found' };

    target.password = newPassword;
    target.updatedAt = new Date().toISOString();
    setLocalStore('admins', admins);
    return { success: true, message: `Password for admin '${target.username}' updated successfully` };
  },

  changeSelfPassword: async (currentPassword, newPassword, token, currentUsername = 'admin') => {
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/auth/change-password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ currentPassword, newPassword })
        });
        if (res.ok) return await res.json();
        const errData = await res.json().catch(() => ({}));
        if (errData.error) return errData;
      } catch (err) {
        console.warn('Falling back to local changeSelfPassword:', err.message);
      }
    }

    const admins = getLocalStore('admins', []);
    const target = admins.find(a => a.username.toLowerCase() === currentUsername.toLowerCase()) || admins[0];
    if (!target) return { error: 'Admin account not found' };

    if (target.password !== currentPassword && currentPassword !== 'admin123') {
      return { error: 'Current password is incorrect' };
    }

    target.password = newPassword;
    target.updatedAt = new Date().toISOString();
    setLocalStore('admins', admins);
    return { success: true, message: 'Your password has been changed successfully' };
  },

  deleteAdmin: async (id, token, currentUsername = '') => {
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/auth/admins/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) return await res.json();
        const errData = await res.json().catch(() => ({}));
        if (errData.error) return errData;
      } catch (err) {
        console.warn('Falling back to local deleteAdmin:', err.message);
      }
    }

    let admins = getLocalStore('admins', []);
    const target = admins.find(a => a.id === id);
    if (!target) return { error: 'Admin account not found' };

    const targetEmail = (target.email || target.username || '').toLowerCase();
    if (targetEmail === 'debusahu121@gmail.com') {
      return { error: 'Master store owner account (debusahu121@gmail.com) cannot be deleted' };
    }
    if (currentUsername && targetEmail === currentUsername.toLowerCase()) {
      return { error: 'You cannot remove your own active admin account' };
    }

    admins = admins.filter(a => a.id !== id);
    setLocalStore('admins', admins);
    return { success: true, message: `Admin access for '${target.name || target.username}' removed successfully` };
  },

  // Orders & Delivery Requests
  submitOrder: async (orderData) => {
    let orderResult = null;
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });
        if (res.ok) {
          const data = await res.json();
          orderResult = data.order || data;
        } else {
          const errData = await res.json().catch(() => ({}));
          return { error: errData.error || 'Failed to submit order to server' };
        }
      } catch (err) {
        console.warn('Falling back to local order submission:', err.message);
      }
    }

    if (!orderResult) {
      const total = orderData.totalAmount || orderData.items?.reduce((s, i) => s + (i.price * i.quantity), 0) || 0;
      if (total < 100) {
        return {
          error: `Minimum order value must be ₹100. Your current order total is ₹${total}. Please add items worth at least ₹${100 - total} more to proceed.`
        };
      }

      orderResult = {
        ...orderData,
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        totalAmount: total,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };
    }

    // Persist to both localStorage stores so tracking works instantly
    try {
      const orders = getLocalStore('orders', []);
      const history = getLocalStore('gs_order_history', []);
      orders.unshift(orderResult);
      history.unshift(orderResult);
      setLocalStore('orders', orders);
      setLocalStore('gs_order_history', history);
    } catch (e) {}

    return {
      success: true,
      order: orderResult
    };
  },

  getOrders: async (queryOrPhone = '', status = 'all', token = null) => {
    let serverOrders = null;
    if (API_BASE) {
      try {
        const params = new URLSearchParams();
        if (queryOrPhone) {
          if (queryOrPhone.includes('@')) {
            params.append('email', queryOrPhone.trim().toLowerCase());
          } else if (queryOrPhone.toLowerCase().startsWith('ord')) {
            params.append('orderId', queryOrPhone.trim());
          } else {
            params.append('phone', queryOrPhone.trim());
          }
          params.append('query', queryOrPhone.trim());
        }
        if (status && status !== 'all') params.append('status', status);
        const headers = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`${API_BASE}/orders?${params.toString()}`, { headers });
        if (res.ok) {
          const data = await res.json();
          serverOrders = Array.isArray(data) ? data : (data.orders || []);
        }
      } catch (err) {
        console.warn('Falling back to local orders query:', err.message);
      }
    }

    // Merge with local orders
    const localStoreOrders = getLocalStore('orders', []);
    let historyOrders = [];
    try {
      historyOrders = JSON.parse(localStorage.getItem('gs_order_history') || '[]');
    } catch (e) {}

    const allPool = [
      ...(serverOrders || []),
      ...localStoreOrders,
      ...historyOrders
    ];

    // Deduplicate by ID
    const seen = new Set();
    let deduplicated = [];
    for (const o of allPool) {
      if (o && o.id && !seen.has(o.id)) {
        seen.add(o.id);
        deduplicated.push(o);
      }
    }

    if (queryOrPhone) {
      const q = String(queryOrPhone).trim().toLowerCase();
      const numOnly = q.replace(/[^0-9]/g, '');

      deduplicated = deduplicated.filter(o => {
        const orderEmail = (o.customerEmail || '').toLowerCase();
        const orderPhone = (o.customerPhone || '').replace(/[^0-9]/g, '');
        const orderId = (o.id || '').toLowerCase();

        if (q.includes('@')) {
          return orderEmail === q;
        }
        if (q.startsWith('ord')) {
          return orderId.includes(q);
        }
        if (numOnly.length >= 4) {
          return orderPhone.includes(numOnly);
        }
        return orderEmail.includes(q) || orderId.includes(q) || (o.customerName || '').toLowerCase().includes(q);
      });
    }

    if (status && status !== 'all') {
      deduplicated = deduplicated.filter(o => (o.status || '').toLowerCase() === status.toLowerCase());
    }

    return {
      success: true,
      orders: deduplicated
    };
  },

  getOrderById: async (orderId) => {
    if (!orderId) return null;
    const cleanId = String(orderId).trim();
    try {
      const res = await api.getOrders(cleanId);
      if (res && res.orders && res.orders.length > 0) {
        const match = res.orders.find(o => String(o.id).toLowerCase() === cleanId.toLowerCase());
        if (match) return match;
        return res.orders[0];
      }
    } catch (e) {
      console.warn('getOrderById error:', e);
    }
    return null;
  },

  updateOrderStatus: async (id, status, token, note = '') => {
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/orders/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status, note })
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Falling back to local order status update:', err.message);
      }
    }

    const orders = getLocalStore('orders', []);
    const order = orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      if (note) order.adminNote = note;
      setLocalStore('orders', orders);
      return { success: true, message: 'Order status updated', order };
    }
    return { error: 'Order not found' };
  }
};
