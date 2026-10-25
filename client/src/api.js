const API_BASE = import.meta.env.VITE_API_BASE || 
  (typeof window !== 'undefined' && window.location.port === '5173' 
    ? 'http://localhost:5000/api' 
    : '/api');

export const api = {
  // Store Settings & 5km Radius check
  getSettings: async (lat, lon) => {
    let url = `${API_BASE}/settings`;
    if (lat && lon) {
      url += `?lat=${lat}&lon=${lon}`;
    }
    const res = await fetch(url);
    return res.json();
  },

  updateSettings: async (settingsData, token) => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(settingsData)
    });
    return res.json();
  },

  // Products
  getProducts: async (category = 'all', search = '') => {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/products?${params.toString()}`);
    return res.json();
  },

  addProduct: async (productData, token) => {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
    return res.json();
  },

  updateProduct: async (id, productData, token) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
    return res.json();
  },

  deleteProduct: async (id, token) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.json();
  },

  // Upload local photo
  uploadImage: async (imageBase64, filename, token) => {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ image: imageBase64, filename })
    });
    return res.json();
  },

  // User Mobile OTP
  sendOtp: async (phone) => {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    return res.json();
  },

  verifyOtp: async (phone, otp, name) => {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, name })
    });
    return res.json();
  },

  // Admin Login
  adminLogin: async (username, password) => {
    const res = await fetch(`${API_BASE}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  },

  // Orders & Delivery Requests
  submitOrder: async (orderData) => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    return res.json();
  },

  getOrders: async (phone = '', status = 'all', token = null) => {
    const params = new URLSearchParams();
    if (phone) params.append('phone', phone);
    if (status && status !== 'all') params.append('status', status);

    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/orders?${params.toString()}`, { headers });
    return res.json();
  },

  updateOrderStatus: async (id, status, token, note = '') => {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status, note })
    });
    return res.json();
  }
};

