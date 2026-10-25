import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Package,
  Truck,
  Plus,
  Trash2,
  Edit,
  MapPin,
  ExternalLink,
  Phone,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  LogOut,
  Sliders,
  Carrot,
  ShoppingBag,
  Store,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Camera,
  X,
  Check
} from 'lucide-react';
import YGSLogo from '../components/YGSLogo';
import { api } from '../api';

export default function AdminDashboard({ onBackToStore, shopSettings, onSettingsUpdated }) {
  const [token, setToken] = useState(localStorage.getItem('gs_admin_token') || '');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Tabs: 'orders', 'products', 'settings'
  const [activeTab, setActiveTab] = useState('orders');

  // Data states
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [orderFilter, setOrderFilter] = useState('all');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  // Add/Edit Product Modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'vegetables',
    price: '',
    unit: '1 kg',
    stock: 50,
    image: '',
    description: '',
    inStock: true
  });
  const [productFormError, setProductFormError] = useState('');

  // Local Photo Browse states
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageMode, setImageMode] = useState('browse'); // 'browse' | 'url'
  const fileInputRef = useRef(null);

  // Shop Settings form
  const [settingsForm, setSettingsForm] = useState({
    storeName: shopSettings?.storeName || 'Yashi General Store',
    phone: shopSettings?.phone || '',
    address: shopSettings?.address || '',
    latitude: shopSettings?.latitude || 21.2514,
    longitude: shopSettings?.longitude || 81.6296,
    maxDeliveryRadiusKm: shopSettings?.maxDeliveryRadiusKm || 5,
    minOrderAmount: shopSettings?.minOrderAmount || 100
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Handle Admin Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await api.adminLogin(username, password);
      if (res.success && res.token) {
        localStorage.setItem('gs_admin_token', res.token);
        setToken(res.token);
      } else {
        setLoginError(res.error || 'Invalid credentials');
      }
    } catch (err) {
      setLoginError('Error connecting to server');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gs_admin_token');
    setToken('');
  };

  // Fetch Orders
  const loadOrders = async () => {
    if (!token) return;
    setLoadingOrders(true);
    try {
      const res = await api.getOrders('', orderFilter, token);
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch Products
  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await api.getProducts(productCategoryFilter, '');
      if (res.success) {
        setProducts(res.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadOrders();
      loadProducts();
    }
  }, [token, orderFilter, productCategoryFilter]);

  // Update Order Status
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus, token);
      if (res.success) {
        loadOrders();
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // Open Product Modal (New or Edit)
  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'dairy',
      price: '',
      unit: '1 kg',
      stock: 50,
      image: '',
      description: '',
      inStock: true
    });
    setSelectedFile(null);
    setImagePreview('');
    setImageMode('browse');
    setProductFormError('');
    setProductModalOpen(true);
  };

  const openEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      unit: prod.unit,
      stock: prod.stock,
      image: prod.image,
      description: prod.description || '',
      inStock: prod.inStock
    });
    setSelectedFile(null);
    setImagePreview(prod.image || '');
    setImageMode(prod.image && prod.image.startsWith('http') ? 'url' : 'browse');
    setProductFormError('');
    setProductModalOpen(true);
  };

  // Local file selection from device
  const handleLocalFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProductFormError('Please select a valid image file (JPEG, PNG, WEBP, GIF, etc.)');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setProductFormError('Image size exceeds 15 MB limit. Please select a smaller photo.');
      return;
    }

    setProductFormError('');
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected local image
  const handleRemoveSelectedImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    setProductForm((prev) => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setProductFormError('');
    if (!productForm.name || !productForm.price || !productForm.unit) {
      setProductFormError('Please fill item name, price and unit');
      return;
    }

    let finalImageUrl = productForm.image;

    // If admin picked a local photo from device, upload it first
    if (selectedFile && imagePreview && imagePreview.startsWith('data:image')) {
      setUploadingImage(true);
      try {
        const uploadRes = await api.uploadImage(imagePreview, selectedFile.name, token);
        if (uploadRes.success && uploadRes.url) {
          finalImageUrl = uploadRes.url;
        } else {
          setProductFormError(uploadRes.error || 'Failed to upload photo from your local device');
          setUploadingImage(false);
          return;
        }
      } catch (err) {
        setProductFormError('Server error while uploading photo');
        setUploadingImage(false);
        return;
      } finally {
        setUploadingImage(false);
      }
    } else if (imageMode === 'url' && productForm.image) {
      finalImageUrl = productForm.image.trim();
    } else if (!finalImageUrl && imagePreview) {
      finalImageUrl = imagePreview;
    }

    if (!finalImageUrl) {
      setProductFormError('Please browse a local photo or provide an image URL');
      return;
    }

    const payload = {
      ...productForm,
      image: finalImageUrl
    };

    try {
      if (editingProduct) {
        const res = await api.updateProduct(editingProduct.id, payload, token);
        if (res.success) {
          setProductModalOpen(false);
          loadProducts();
        } else {
          setProductFormError(res.error || 'Failed to update product');
        }
      } else {
        const res = await api.addProduct(payload, token);
        if (res.success) {
          setProductModalOpen(false);
          loadProducts();
        } else {
          setProductFormError(res.error || 'Failed to add product');
        }
      }
    } catch (err) {
      setProductFormError('Server error while saving product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to remove this product from catalog?')) return;
    try {
      const res = await api.deleteProduct(id, token);
      if (res.success) {
        loadProducts();
      }
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateSettings(settingsForm, token);
      if (res.success) {
        setSettingsSaved(true);
        onSettingsUpdated?.(res.settings);
        setTimeout(() => setSettingsSaved(false), 3000);
      }
    } catch (err) {
      alert('Failed to update store settings');
    }
  };

  // If not logged in as Admin, show login screen
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="flex justify-center mb-3">
            <YGSLogo size="lg" />
          </div>
          <h2 className="text-center text-2xl font-black text-gray-900">
            Yashi General Store Admin
          </h2>
          <p className="mt-1 text-center text-xs text-gray-500">
            Sign in to manage catalog (Vegetables, Grocery, Store items) and dispatch deliveries (≤5km)
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
          <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-gray-200">
            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Admin Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Admin Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                Default Credentials: Username: <strong className="text-purple-700">admin</strong> / Password: <strong className="text-purple-700">admin123</strong>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50"
              >
                {loginLoading ? 'Signing in...' : 'Sign In as Store Admin'}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <button
                onClick={onBackToStore}
                className="text-xs text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-16">
      
      {/* Admin Top Navbar */}
      <header className="sticky top-0 z-30 bg-purple-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <YGSLogo size="sm" />
              <div>
                <h1 className="text-base font-extrabold leading-tight">
                  Yashi General Store • Admin Portal
                </h1>
                <p className="text-[11px] text-purple-200">
                  Shop Delivery Radius: <strong>{shopSettings?.maxDeliveryRadiusKm || 5} km</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={onBackToStore}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition flex items-center gap-1"
              >
                <Store className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View Store</span>
              </button>
              <button
                onClick={handleLogout}
                className="p-1.5 sm:px-3 sm:py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition flex items-center gap-1"
                title="Logout Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Requests</span>
            <p className="text-2xl font-black text-gray-900 mt-1">{orders.length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs bg-amber-50/30">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending Delivery</span>
            <p className="text-2xl font-black text-amber-800 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs bg-emerald-50/30">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Delivered</span>
            <p className="text-2xl font-black text-emerald-800 mt-1">{deliveredCount}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-2xs bg-purple-50/30">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Total Products</span>
            <p className="text-2xl font-black text-purple-800 mt-1">{products.length}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6 bg-white rounded-2xl p-1.5 shadow-2xs">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'orders'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-purple-700'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Delivery Requests ({pendingCount} pending)</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'products'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-purple-700'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Inventory Catalog (Veg, Grocery, Store)</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'settings'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-purple-700'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Shop GPS & 5km Radius</span>
          </button>
        </div>

        {/* TAB 1: DELIVERY REQUESTS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            
            {/* Filter and Refresh */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-gray-500">Filter Status:</span>
                {['all', 'Pending', 'Accepted', 'Out for Delivery', 'Delivered'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition ${
                      orderFilter === st
                        ? 'bg-purple-700 text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <button
                onClick={loadOrders}
                className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
                <span>Refresh Requests</span>
              </button>
            </div>

            {/* Orders Cards List */}
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-gray-400 border border-gray-200">
                <Truck className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="font-bold text-base text-gray-600">No delivery requests found</p>
                <p className="text-xs text-gray-400 mt-1">
                  Incoming user delivery requests with GPS location will appear here in real time.
                </p>
              </div>
            ) : (
              orders.map((order) => {
                const mapUrl = `https://www.google.com/maps?q=${order.latitude},${order.longitude}`;
                const waUrl = `https://wa.me/91${order.customerPhone}?text=Hello%20${encodeURIComponent(order.customerName)},%20regarding%20your%20Yashi%20General%20Store%20YGS%20order%20${order.id}`;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:border-purple-300 transition"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-purple-900 bg-purple-100 px-3 py-0.5 rounded-md">
                            {order.id}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            📍 {order.distanceKm} km from shop (≤5km verified)
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-gray-900 mt-2">
                          Customer: {order.customerName}
                        </h3>
                      </div>

                      {/* Status Update Dropdown */}
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-gray-500">Update Status:</span>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-xs font-black px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-600 ${
                            order.status === 'Pending'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : order.status === 'Delivered'
                              ? 'bg-green-100 text-green-900 border-green-300'
                              : order.status === 'Out for Delivery'
                              ? 'bg-blue-100 text-blue-900 border-blue-300'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Packing">Packing</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Customer Contact & Address info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
                      
                      {/* Customer Contact Actions */}
                      <div className="space-y-1.5">
                        <p className="font-bold text-gray-700 uppercase tracking-wider text-[11px]">
                          Customer Contact
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          +91 {order.customerPhone}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold text-xs transition"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600" /> Call
                          </a>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-800 rounded-lg font-bold text-xs transition border border-green-200"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-green-600" /> WhatsApp
                          </a>
                        </div>
                      </div>

                      {/* Location & GPS Map */}
                      <div className="space-y-1.5">
                        <p className="font-bold text-gray-700 uppercase tracking-wider text-[11px]">
                          Delivery Location
                        </p>
                        <p className="text-gray-900 font-medium">
                          {order.address}
                        </p>
                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold underline text-xs pt-1"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Open in Google Maps ({order.latitude.toFixed(4)}, {order.longitude.toFixed(4)})</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {/* Items & Total */}
                      <div className="space-y-1.5 bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <div className="flex justify-between font-bold text-gray-700 uppercase tracking-wider text-[11px]">
                          <span>Ordered Items</span>
                          <span>₹{order.totalAmount}</span>
                        </div>
                        <ul className="space-y-1 text-gray-600 text-[11px]">
                          {order.items.map((i, idx) => (
                            <li key={idx} className="flex justify-between">
                              <span>{i.quantity}x {i.name} ({i.unit})</span>
                              <span className="font-semibold text-gray-900">₹{i.price * i.quantity}</span>
                            </li>
                          ))}
                        </ul>
                        {order.notes && (
                          <p className="text-[10px] text-gray-500 italic pt-1 border-t border-gray-200">
                            Note: "{order.notes}"
                          </p>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })
            )}

          </div>
        )}

        {/* TAB 2: INVENTORY & CATALOG MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            
            {/* Header controls */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
                <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Category:</span>
                {[
                  { id: 'all', label: 'All Items' },
                  { id: 'dairy', label: 'Dairy Products' },
                  { id: 'icecream', label: 'Ice Cream' },
                  { id: 'vegetables', label: 'Vegetables' },
                  { id: 'grocery', label: 'Grocery' },
                  { id: 'stationery', label: 'Stationery' },
                  { id: 'general store', label: 'General Store' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setProductCategoryFilter(cat.id)}
                    className={`flex-shrink-0 px-3 py-1 rounded-lg text-xs font-bold transition ${
                      productCategoryFilter === cat.id
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <button
                onClick={openAddProduct}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-1.5 transition flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Item</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Price & Unit</th>
                      <th className="p-3.5">Stock</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-gray-50/80 transition">
                        <td className="p-3.5 flex items-center space-x-3">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-10 h-10 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                          />
                          <div>
                            <span className="font-bold text-gray-900 text-sm block">
                              {prod.name}
                            </span>
                            <span className="text-[11px] text-gray-400 line-clamp-1">
                              {prod.description}
                            </span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              prod.category === 'dairy'
                                ? 'bg-sky-100 text-sky-800'
                                : prod.category === 'icecream'
                                ? 'bg-pink-100 text-pink-800'
                                : prod.category === 'vegetables'
                                ? 'bg-green-100 text-green-800'
                                : prod.category === 'grocery'
                                ? 'bg-amber-100 text-amber-800'
                                : prod.category === 'stationery'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {prod.category === 'dairy' ? 'Dairy Products' : prod.category === 'icecream' ? 'Ice Cream' : prod.category}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className="font-black text-emerald-700 text-sm">
                            ₹{prod.price}
                          </span>
                          <span className="text-gray-400 ml-1">/ {prod.unit}</span>
                        </td>

                        <td className="p-3.5">
                          <span className="font-bold">{prod.stock}</span>
                        </td>

                        <td className="p-3.5">
                          {prod.inStock ? (
                            <span className="text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-md text-[11px]">
                              In Stock
                            </span>
                          ) : (
                            <span className="text-red-700 bg-red-100 font-bold px-2 py-0.5 rounded-md text-[11px]">
                              Out of Stock
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => openEditProduct(prod)}
                            className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: STORE GPS & 5KM RADIUS SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 max-w-2xl shadow-sm">
            <h3 className="text-base font-extrabold text-gray-900 mb-1">
              Shop Location & Delivery Zone Settings
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              The 5km delivery radius restriction is dynamically calculated based on the Shop GPS Coordinates set below.
            </p>

            {settingsSaved && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Store coordinates and delivery settings updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  value={settingsForm.storeName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Shop Physical Address
                </label>
                <input
                  type="text"
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Shop GPS Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={settingsForm.latitude}
                    onChange={(e) => setSettingsForm({ ...settingsForm, latitude: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Shop GPS Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={settingsForm.longitude}
                    onChange={(e) => setSettingsForm({ ...settingsForm, longitude: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Strict Max Delivery Radius (in Kilometers)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="50"
                    value={settingsForm.maxDeliveryRadiusKm}
                    onChange={(e) => setSettingsForm({ ...settingsForm, maxDeliveryRadiusKm: e.target.value })}
                    className="w-32 px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl font-bold"
                  />
                  <span className="text-xs text-gray-500 font-semibold">
                    km (Default requirement: 5 km)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Minimum Order Value (₹)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="5"
                    min="1"
                    value={settingsForm.minOrderAmount || 100}
                    onChange={(e) => setSettingsForm({ ...settingsForm, minOrderAmount: Number(e.target.value) })}
                    className="w-32 px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl font-bold"
                  />
                  <span className="text-xs text-gray-500 font-semibold">
                    ₹ (Required: Min ₹100 order value for delivery)
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition"
                >
                  Save Store Settings
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200 p-6">
            <h3 className="text-base font-extrabold text-gray-900 mb-4">
              {editingProduct ? 'Edit Catalog Item' : 'Add New Item to Catalog'}
            </h3>

            {productFormError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {productFormError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Tomatoes / Royal Basmati Rice"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl capitalize font-semibold"
                  >
                    <option value="dairy">Dairy Products</option>
                    <option value="icecream">Ice Cream</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="grocery">Grocery</option>
                    <option value="stationery">Stationery</option>
                    <option value="general store">General Store</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="35"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Unit (e.g. 1 kg / pack) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="1 kg, 500g, 1 pc, pack"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Product Photo: Browse from Local or Web URL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-700">
                    Product Photo *
                  </label>
                  <div className="flex items-center space-x-1 bg-gray-100 p-0.5 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageMode('browse')}
                      className={`px-2 py-0.5 rounded-md font-bold transition ${
                        imageMode === 'browse'
                          ? 'bg-white text-purple-700 shadow-2xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      📁 Browse Local Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      className={`px-2 py-0.5 rounded-md font-bold transition ${
                        imageMode === 'url'
                          ? 'bg-white text-purple-700 shadow-2xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      🔗 Web URL
                    </button>
                  </div>
                </div>

                {/* Hidden File Input for Local Browse */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  onChange={handleLocalFileSelect}
                  className="hidden"
                />

                {imageMode === 'browse' ? (
                  imagePreview ? (
                    <div className="relative border border-emerald-200 bg-emerald-50/50 rounded-2xl p-3 flex items-center gap-3">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-20 h-20 rounded-xl object-cover border border-emerald-300 shadow-xs flex-shrink-0 bg-white"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full mb-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          {selectedFile ? 'Local Photo Selected' : 'Product Photo'}
                        </span>
                        <p className="text-xs font-bold text-gray-800 truncate">
                          {selectedFile ? selectedFile.name : 'Image loaded'}
                        </p>
                        {selectedFile && (
                          <p className="text-[10px] text-gray-500">
                            Size: {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition"
                          >
                            Browse Another Photo
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveSelectedImage}
                            className="px-2 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleLocalFileSelect({ target: { files: e.dataTransfer.files } });
                        }
                      }}
                      className="border-2 border-dashed border-gray-300 hover:border-purple-500 rounded-2xl p-4 sm:p-5 text-center cursor-pointer bg-gray-50/70 hover:bg-purple-50/40 transition group"
                    >
                      <div className="w-11 h-11 mx-auto rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-extrabold text-gray-800 mb-0.5">
                        Click to Browse Photo from Local Storage / Device
                      </p>
                      <p className="text-[11px] text-gray-500 mb-2.5">
                        Supports PNG, JPG, JPEG, WEBP up to 15 MB
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Browse Photo File</span>
                      </button>
                    </div>
                  )
                ) : (
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={productForm.image}
                      onChange={(e) => {
                        setProductForm({ ...productForm, image: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl"
                    />
                    {productForm.image && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200">
                        <img
                          src={productForm.image}
                          alt="Preview"
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <span className="text-[11px] text-gray-500 truncate flex-1">
                          {productForm.image}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  placeholder="Short details about quality or origin..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="inStockCheck"
                  checked={productForm.inStock}
                  onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="inStockCheck" className="text-xs font-bold text-gray-700 cursor-pointer">
                  Mark as Available in Stock
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {uploadingImage && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {uploadingImage
                      ? 'Uploading Photo...'
                      : editingProduct
                      ? 'Update Product'
                      : 'Add to Catalog'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

