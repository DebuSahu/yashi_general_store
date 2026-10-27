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
  Check,
  Shield,
  KeyRound,
  UserPlus,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  Users,
  XCircle,
  Minus,
  Sun,
  Moon
} from 'lucide-react';
import YGSLogo from '../components/YGSLogo';
import { api } from '../api';

export default function AdminDashboard({ onBackToStore, shopSettings, onSettingsUpdated, onLogoutAdmin, adminUser, theme, toggleTheme }) {
  const [token, setToken] = useState(() => {
    try {
      return adminUser?.token || sessionStorage.getItem('gs_admin_token') || localStorage.getItem('gs_admin_token') || '';
    } catch {
      return '';
    }
  });
  const [currentAdminUser, setCurrentAdminUser] = useState(() => {
    try {
      return adminUser?.username || adminUser?.email || sessionStorage.getItem('gs_admin_user') || localStorage.getItem('gs_admin_user') || '';
    } catch {
      return '';
    }
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Tabs: 'orders', 'products', 'settings', 'admins'
  const [activeTab, setActiveTab] = useState('orders');

  // Admin Accounts states
  const [adminsList, setAdminsList] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [adminActionMsg, setAdminActionMsg] = useState({ type: '', text: '' });

  // Self password change form
  const [selfPwdForm, setSelfPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showSelfCurrent, setShowSelfCurrent] = useState(false);
  const [showSelfNew, setShowSelfNew] = useState(false);
  const [showSelfConfirm, setShowSelfConfirm] = useState(false);
  const [selfPwdLoading, setSelfPwdLoading] = useState(false);
  const [selfPwdMsg, setSelfPwdMsg] = useState({ type: '', text: '' });

  // Add new admin modal (Passwordless via Gmail)
  const [addAdminModalOpen, setAddAdminModalOpen] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({ email: '', name: '', role: 'admin' });
  const [addAdminLoading, setAddAdminLoading] = useState(false);
  const [addAdminError, setAddAdminError] = useState('');

  // Reset another admin password modal
  const [resetPwdModalOpen, setResetPwdModalOpen] = useState(false);
  const [targetAdminToReset, setTargetAdminToReset] = useState(null);
  const [resetPwdForm, setResetPwdForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showResetPwd, setShowResetPwd] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetPwdLoading, setResetPwdLoading] = useState(false);
  const [resetPwdError, setResetPwdError] = useState('');

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
    phone: shopSettings?.phone || '+91 98765 43210',
    email: shopSettings?.email || 'debusahu121@gmail.com',
    address: shopSettings?.address || '510, Elliot Lane, Near Water Tank, Mirpur Cantonment, Kanpur, Uttar Pradesh - 208004',
    latitude: shopSettings?.latitude || 26.4519124,
    longitude: shopSettings?.longitude || 80.3537057,
    mapsUrl: shopSettings?.mapsUrl || 'https://maps.app.goo.gl/36DwR1dGU2bfv7KD9',
    maxDeliveryRadiusKm: shopSettings?.maxDeliveryRadiusKm || 5,
    minOrderAmount: shopSettings?.minOrderAmount || 100,
    fast2smsApiKey: shopSettings?.fast2smsApiKey || '',
    twilioAccountSid: shopSettings?.twilioAccountSid || '',
    twilioAuthToken: shopSettings?.twilioAuthToken || '',
    twilioPhoneNumber: shopSettings?.twilioPhoneNumber || '',
    googleClientId: shopSettings?.googleClientId || localStorage.getItem('ygs_google_client_id') || ''
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
        const loggedUser = res.user?.username || res.admin?.username || username;
        localStorage.setItem('gs_admin_user', loggedUser);
        setCurrentAdminUser(loggedUser);
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
    localStorage.removeItem('gs_admin_user');
    setToken('');
    if (onLogoutAdmin) {
      onLogoutAdmin();
    } else {
      onBackToStore?.();
    }
  };

  // Fetch Admins
  const loadAdmins = async () => {
    if (!token) return;
    setLoadingAdmins(true);
    try {
      const res = await api.getAdmins(token);
      if (res.success && res.admins) {
        setAdminsList(res.admins);
      }
    } catch (err) {
      console.error('Failed to load admins:', err);
    } finally {
      setLoadingAdmins(false);
    }
  };

  // Change Self Password
  const handleChangeSelfPassword = async (e) => {
    e.preventDefault();
    setSelfPwdMsg({ type: '', text: '' });

    if (!selfPwdForm.currentPassword || !selfPwdForm.newPassword) {
      setSelfPwdMsg({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }
    if (selfPwdForm.newPassword.length < 4) {
      setSelfPwdMsg({ type: 'error', text: 'New password must be at least 4 characters long.' });
      return;
    }
    if (selfPwdForm.newPassword !== selfPwdForm.confirmPassword) {
      setSelfPwdMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setSelfPwdLoading(true);
    try {
      const res = await api.changeSelfPassword(
        selfPwdForm.currentPassword,
        selfPwdForm.newPassword,
        token,
        currentAdminUser
      );
      if (res.success) {
        setSelfPwdMsg({ type: 'success', text: 'Your password was changed successfully! Please use your new password next time you sign in.' });
        setSelfPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setSelfPwdMsg({ type: 'error', text: res.error || 'Failed to update password.' });
      }
    } catch (err) {
      setSelfPwdMsg({ type: 'error', text: 'Error connecting to server.' });
    } finally {
      setSelfPwdLoading(false);
    }
  };

  // Create New Admin User
  // Create / Authorize New Admin by Gmail ID
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAddAdminError('');

    const email = (newAdminForm.email || newAdminForm.username || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setAddAdminError('Please enter a valid Gmail address (e.g. manager@gmail.com).');
      return;
    }

    setAddAdminLoading(true);
    try {
      const res = await api.addAdmin({
        email,
        username: email,
        name: newAdminForm.name?.trim() || email.split('@')[0],
        role: newAdminForm.role || 'admin'
      }, token);

      if (res.success) {
        setAddAdminModalOpen(false);
        setNewAdminForm({ email: '', name: '', role: 'admin' });
        setAdminActionMsg({ type: 'success', text: `Admin access granted to '${email}'! They can now log in via Gmail to access the Admin Portal.` });
        loadAdmins();
      } else {
        setAddAdminError(res.error || 'Failed to grant admin access.');
      }
    } catch (err) {
      setAddAdminError('Error connecting to server.');
    } finally {
      setAddAdminLoading(false);
    }
  };

  // Reset Another Admin's Password
  const handleResetAdminPassword = async (e) => {
    e.preventDefault();
    setResetPwdError('');

    if (!targetAdminToReset) return;
    if (!resetPwdForm.newPassword || resetPwdForm.newPassword.length < 4) {
      setResetPwdError('New password must be at least 4 characters.');
      return;
    }
    if (resetPwdForm.newPassword !== resetPwdForm.confirmPassword) {
      setResetPwdError('Passwords do not match.');
      return;
    }

    if (!targetAdminToReset) return;
    setResetPwdLoading(true);
    try {
      const res = await api.updateAdminPassword(targetAdminToReset?.id, resetPwdForm.newPassword, token);
      if (res.success) {
        setResetPwdModalOpen(false);
        setResetPwdForm({ newPassword: '', confirmPassword: '' });
        setAdminActionMsg({ type: 'success', text: `Password for admin '${targetAdminToReset?.username || 'admin'}' updated successfully!` });
        setTargetAdminToReset(null);
      } else {
        setResetPwdError(res.error || 'Failed to update password.');
      }
    } catch (err) {
      setResetPwdError('Error connecting to server.');
    } finally {
      setResetPwdLoading(false);
    }
  };

  // Delete Admin User
  const handleDeleteAdmin = async (adminId, adminUsername) => {
    if (!window.confirm(`Are you sure you want to remove admin user '${adminUsername}'?`)) return;

    try {
      const res = await api.deleteAdmin(adminId, token, currentAdminUser);
      if (res.success) {
        setAdminActionMsg({ type: 'success', text: `Admin user '${adminUsername}' removed successfully.` });
        loadAdmins();
      } else {
        alert(res.error || 'Failed to delete admin.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
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
      loadAdmins();
    }
  }, [token, orderFilter, productCategoryFilter]);

  useEffect(() => {
    if (token && activeTab === 'admins') {
      loadAdmins();
    }
  }, [activeTab]);

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
        const uploadRes = await api.uploadImage(imagePreview, selectedFile?.name || 'photo.jpg', token);
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
        const res = await api.updateProduct(editingProduct?.id, payload, token);
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

  // Direct In-Stock / Out-of-Stock Button Handler
  const handleSetStockStatus = async (productId, targetInStock) => {
    // 1. Optimistic UI update for instant feedback
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updatedStock = targetInStock ? (p.stock > 0 ? p.stock : 25) : 0;
          return { ...p, inStock: targetInStock, stock: updatedStock };
        }
        return p;
      })
    );

    // 2. Persist update to backend / storage
    try {
      const targetProd = products.find((p) => p.id === productId);
      const updatedStock = targetInStock ? (targetProd?.stock > 0 ? targetProd.stock : 25) : 0;
      await api.updateProduct(productId, { inStock: targetInStock, stock: updatedStock }, token);
    } catch (err) {
      console.error('Failed to update stock status:', err);
      loadProducts();
    }
  };

  // Direct quick stock quantity adjuster (+10 / -5)
  const handleQuickStockQty = async (productId, newQty) => {
    const safeQty = Math.max(0, parseInt(newQty, 10) || 0);
    const inStock = safeQty > 0;
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: safeQty, inStock } : p))
    );
    try {
      await api.updateProduct(productId, { stock: safeQty, inStock }, token);
    } catch (err) {
      console.error('Failed to update stock quantity:', err);
      loadProducts();
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

  // If not authenticated as Admin, show restricted access notice
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center py-12 px-4 text-slate-900 dark:text-slate-100 transition-colors">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 text-center">
          <div className="flex justify-center mb-4">
            <YGSLogo size="lg" />
          </div>
          <div className="inline-flex p-3 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-2xl mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">
            Admin Portal Restricted
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            The Admin Portal is exclusively for authorized store management. Only verified store administrators can access this system.
          </p>
          <button
            onClick={onBackToStore}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Storefront</span>
          </button>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors">
      
      {/* Admin Top Navbar */}
      <header className="sticky top-0 z-30 bg-purple-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <YGSLogo size="sm" />
              <div className="min-w-0">
                <h1 className="text-xs sm:text-base font-extrabold leading-tight truncate">
                  YGS • Admin Portal
                </h1>
                <p className="text-[10px] sm:text-[11px] text-purple-200 truncate">
                  Radius: <strong>{shopSettings?.maxDeliveryRadiusKm || 5} km</strong> • Mirpur Cantt
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
              {toggleTheme && (
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-1.5 sm:p-2 text-purple-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-purple-200" />}
                </button>
              )}
              <button
                onClick={onBackToStore}
                className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition flex items-center gap-1"
              >
                <Store className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View Store</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-2 py-1.5 sm:px-3 sm:py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition flex items-center gap-1"
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-5 sm:mb-6">
          <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider block truncate">Total Requests</span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 sm:mt-1">{orders.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 shadow-2xs bg-amber-50/30 dark:bg-amber-950/20">
            <span className="text-[10px] sm:text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block truncate">Pending Delivery</span>
            <p className="text-xl sm:text-2xl font-black text-amber-800 dark:text-amber-300 mt-0.5 sm:mt-1">{pendingCount}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 shadow-2xs bg-emerald-50/30 dark:bg-emerald-950/20">
            <span className="text-[10px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block truncate">Delivered</span>
            <p className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-0.5 sm:mt-1">{deliveredCount}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-purple-200 dark:border-purple-900/60 shadow-2xs bg-purple-50/30 dark:bg-purple-950/20">
            <span className="text-[10px] sm:text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider block truncate">Total Products</span>
            <p className="text-xl sm:text-2xl font-black text-purple-800 dark:text-purple-300 mt-0.5 sm:mt-1">{products.length}</p>
          </div>
        </div>

        {/* Navigation Tabs (Responsive 2x2 Grid on Mobile, Full Bar on Desktop) */}
        <div className="grid grid-cols-2 sm:flex gap-1.5 sm:gap-2 mb-5 sm:mb-6 bg-white dark:bg-slate-900 rounded-2xl p-1.5 shadow-2xs border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            <Truck className="w-4 h-4 shrink-0" />
            <span>Orders ({pendingCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4 shrink-0" />
            <span>Inventory ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4 shrink-0" />
            <span>Radius & Location</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('admins');
              loadAdmins();
            }}
            className={`py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition whitespace-nowrap ${
              activeTab === 'admins'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4 shrink-0" />
            <span>Admins & Security</span>
          </button>
        </div>

        {/* TAB 1: DELIVERY REQUESTS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            
            {/* Filter and Refresh */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              {/* Mobile: Clean Dropdown Menu */}
              <div className="sm:hidden flex-1 min-w-[140px]">
                <select
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value)}
                  className="w-full text-xs font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-600 cursor-pointer shadow-2xs"
                >
                  <option value="all">All Orders</option>
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              {/* Desktop: Button pills */}
              <div className="hidden sm:flex items-center space-x-2">
                <span className="text-xs font-bold text-gray-500 dark:text-slate-400">Filter Status:</span>
                {['all', 'Pending', 'Accepted', 'Out for Delivery', 'Delivered'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition ${
                      orderFilter === st
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <button
                onClick={loadOrders}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
                <span>Refresh Requests</span>
              </button>
            </div>

            {/* Orders Cards List */}
            {orders.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center text-gray-400 dark:text-slate-500 border border-gray-200 dark:border-slate-800">
                <Truck className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-slate-600" />
                <p className="font-bold text-base text-gray-600 dark:text-slate-200">No delivery requests found</p>
                <p className="text-xs text-gray-400 dark:text-slate-400 mt-1">
                  Incoming user delivery requests with GPS location will appear here in real time.
                </p>
              </div>
            ) : (
              (orders || []).filter(Boolean).map((order) => {
                const latNum = Number(order?.latitude);
                const lonNum = Number(order?.longitude);
                const latStr = !isNaN(latNum) && latNum !== 0 ? latNum.toFixed(4) : (order?.latitude || '-');
                const lonStr = !isNaN(lonNum) && lonNum !== 0 ? lonNum.toFixed(4) : (order?.longitude || '-');
                const mapUrl = `https://www.google.com/maps?q=${order?.latitude || ''},${order?.longitude || ''}`;
                const waUrl = `https://wa.me/91${order?.customerPhone || ''}?text=Hello%20${encodeURIComponent(order?.customerName || 'Customer')},%20regarding%20your%20Yashi%20General%20Store%20YGS%20order%20${order?.id || ''}`;

                return (
                  <div
                    key={order?.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-3.5 sm:p-5 shadow-sm hover:border-purple-300 dark:hover:border-purple-700 transition"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-100 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-black text-purple-900 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/80 px-2.5 py-0.5 rounded-md">
                            {order?.id}
                          </span>
                          <span className="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400">
                            {new Date(order?.createdAt || Date.now()).toLocaleString()}
                          </span>
                          <span className="text-[11px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full">
                            📍 {order?.distanceKm || '≤ 5.0'} km (≤5km)
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-gray-900 dark:text-white mt-2">
                          Customer: {order?.customerName || 'Valued Customer'}
                        </h3>
                      </div>

                      {/* Status Update Dropdown */}
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-gray-500 dark:text-slate-400">Update Status:</span>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-xs font-black px-3 py-2 rounded-xl border focus:ring-2 focus:ring-purple-600 ${
                            order.status === 'Pending'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                              : order.status === 'Delivered'
                              ? 'bg-green-100 dark:bg-green-950/60 text-green-900 dark:text-green-200 border-green-300 dark:border-green-800'
                              : order.status === 'Out for Delivery'
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-800'
                              : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-700'
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
                        <p className="font-bold text-gray-700 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                          Customer Contact
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          +91 {order.customerPhone}
                        </p>
                        {order.customerEmail && (
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold truncate">
                            ✉️ {order.customerEmail}
                          </p>
                        )}
                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-lg font-bold text-xs transition"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Call
                          </a>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 dark:bg-green-950/50 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-800 dark:text-green-300 rounded-lg font-bold text-xs transition border border-green-200 dark:border-green-800"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-green-600 dark:text-green-400" /> WhatsApp
                          </a>
                        </div>
                      </div>

                      {/* Location & GPS Map */}
                      <div className="space-y-1.5">
                        <p className="font-bold text-gray-700 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                          Delivery Location
                        </p>
                        <p className="text-gray-900 dark:text-slate-200 font-medium">
                          {order.address}
                        </p>
                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold underline text-xs pt-1"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Open in Google Maps ({latStr}, {lonStr})</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {/* Items & Total */}
                      <div className="space-y-1.5 bg-gray-50 dark:bg-slate-800/80 p-3 rounded-xl border border-gray-200 dark:border-slate-700">
                        <div className="flex justify-between font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                          <span>Ordered Items</span>
                          <span className="text-gray-900 dark:text-white">₹{order?.totalAmount || 0}</span>
                        </div>
                        <ul className="space-y-1 text-gray-600 dark:text-slate-300 text-[11px]">
                          {(order?.items || []).map((i, idx) => (
                            <li key={idx} className="flex justify-between">
                              <span>{i?.quantity || 1}x {i?.name || 'Item'} ({i?.unit || 'unit'})</span>
                              <span className="font-semibold text-gray-900 dark:text-white">₹{(i?.price || 0) * (i?.quantity || 1)}</span>
                            </li>
                          ))}
                        </ul>
                        {order.notes && (
                          <p className="text-[10px] text-gray-500 dark:text-slate-400 italic pt-1 border-t border-gray-200 dark:border-slate-700">
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
              {/* Mobile: Category Select Dropdown */}
              <div className="sm:hidden flex-1 min-w-[140px]">
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="w-full text-xs font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-600 cursor-pointer shadow-2xs"
                >
                  <option value="all">All Categories</option>
                  <option value="dairy">Dairy Products</option>
                  <option value="icecream">Ice Cream</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="grocery">Grocery</option>
                  <option value="stationery">Stationery</option>
                  <option value="general store">General Store</option>
                </select>
              </div>

              {/* Desktop: Horizontal Pill Bar */}
              <div className="hidden sm:flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
                <span className="text-xs font-bold text-gray-500 dark:text-slate-400 whitespace-nowrap">Category:</span>
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
                        : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
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

            {/* Products Table & Mobile Cards */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-2xs">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Price & Unit</th>
                      <th className="p-3.5">Stock</th>
                      <th className="p-3.5">Stock Status (Direct Update)</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
                    {products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/60 transition">
                        <td className="p-3.5 flex items-center space-x-3">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-10 h-10 object-cover rounded-lg bg-gray-100 dark:bg-slate-800 flex-shrink-0"
                          />
                          <div>
                            <span className="font-bold text-gray-900 dark:text-white text-sm block">
                              {prod.name}
                            </span>
                            <span className="text-[11px] text-gray-400 dark:text-slate-400 line-clamp-1">
                              {prod.description}
                            </span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              prod.category === 'dairy'
                                ? 'bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300'
                                : prod.category === 'icecream'
                                ? 'bg-pink-100 dark:bg-pink-950/70 text-pink-800 dark:text-pink-300'
                                : prod.category === 'vegetables'
                                ? 'bg-green-100 dark:bg-green-950/70 text-green-800 dark:text-green-300'
                                : prod.category === 'grocery'
                                ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                                : prod.category === 'stationery'
                                ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300'
                                : 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300'
                            }`}
                          >
                            {prod.category === 'dairy' ? 'Dairy Products' : prod.category === 'icecream' ? 'Ice Cream' : prod.category}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">
                            ₹{prod.price}
                          </span>
                          <span className="text-gray-400 dark:text-slate-400 ml-1">/ {prod.unit}</span>
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center space-x-1.5">
                            <button
                              type="button"
                              onClick={() => handleQuickStockQty(prod.id, Math.max(0, (prod.stock || 0) - 5))}
                              className="w-6 h-6 rounded-md bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold flex items-center justify-center text-xs transition active:scale-90"
                              title="Decrease stock quantity by 5"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className={`w-8 text-center font-black text-xs ${prod.inStock ? 'text-gray-900 dark:text-white' : 'text-red-500 line-through'}`}>
                              {prod.stock || 0}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickStockQty(prod.id, (prod.stock || 0) + 10)}
                              className="w-6 h-6 rounded-md bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold flex items-center justify-center text-xs transition active:scale-90"
                              title="Add 10 to stock quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="inline-flex rounded-xl bg-gray-100 dark:bg-slate-800 p-0.5 border border-gray-200 dark:border-slate-700">
                            {/* Direct In Stock Button */}
                            <button
                              type="button"
                              onClick={() => handleSetStockStatus(prod.id, true)}
                              className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg flex items-center gap-1 transition ${
                                prod.inStock
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-gray-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400'
                              }`}
                              title="Directly mark product In Stock"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>In Stock</span>
                            </button>

                            {/* Direct Out of Stock Button */}
                            <button
                              type="button"
                              onClick={() => handleSetStockStatus(prod.id, false)}
                              className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg flex items-center gap-1 transition ${
                                !prod.inStock
                                  ? 'bg-red-600 text-white shadow-xs'
                                  : 'text-gray-500 dark:text-slate-400 hover:text-red-700 dark:hover:text-red-400'
                              }`}
                              title="Directly mark product Out of Stock"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Out of Stock</span>
                            </button>
                          </div>
                        </td>

                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => openEditProduct(prod)}
                            className="p-1.5 text-gray-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-lg transition"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition"
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

              {/* Mobile Card List View (<md) */}
              <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-800 font-medium">
                {products.map((prod) => (
                  <div key={prod.id} className="p-3 space-y-2.5 bg-white dark:bg-slate-900">
                    <div className="flex items-start space-x-2.5">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-12 h-12 object-cover rounded-xl bg-gray-100 dark:bg-slate-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-gray-900 dark:text-white text-xs leading-snug line-clamp-2">
                            {prod.name}
                          </h4>
                          <span className="font-black text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm shrink-0">
                            ₹{prod.price}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-slate-400 mt-0.5 truncate">
                          Unit: {prod.unit}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            prod.category === 'dairy' ? 'bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300' :
                            prod.category === 'icecream' ? 'bg-pink-100 dark:bg-pink-950/70 text-pink-800 dark:text-pink-300' :
                            prod.category === 'vegetables' ? 'bg-green-100 dark:bg-green-950/70 text-green-800 dark:text-green-300' :
                            prod.category === 'grocery' ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300' :
                            prod.category === 'stationery' ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300' :
                            'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300'
                          }`}>
                            {prod.category}
                          </span>
                          <span className={`text-[10px] font-bold ${prod.inStock ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {prod.inStock ? '✓ In Stock' : '✕ Out'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Stock Status Controls & Quick Stepper */}
                    <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-gray-100 dark:border-slate-800">
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] text-gray-500 dark:text-slate-400 font-bold">Qty:</span>
                        <button
                          type="button"
                          onClick={() => handleQuickStockQty(prod.id, Math.max(0, (prod.stock || 0) - 5))}
                          className="w-6 h-6 rounded-md bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold flex items-center justify-center text-xs active:scale-90"
                          title="Decrease 5"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className={`w-7 text-center font-black text-xs ${prod.inStock ? 'text-gray-900 dark:text-white' : 'text-red-500 line-through'}`}>
                          {prod.stock || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuickStockQty(prod.id, (prod.stock || 0) + 10)}
                          className="w-6 h-6 rounded-md bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold flex items-center justify-center text-xs active:scale-90"
                          title="Increase 10"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      <div className="inline-flex rounded-lg bg-gray-100 dark:bg-slate-800 p-0.5 border border-gray-200 dark:border-slate-700 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSetStockStatus(prod.id, true)}
                          className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md flex items-center gap-1 transition ${
                            prod.inStock ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-500 dark:text-slate-400'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>In</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetStockStatus(prod.id, false)}
                          className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md flex items-center gap-1 transition ${
                            !prod.inStock ? 'bg-red-600 text-white shadow-xs' : 'text-gray-500 dark:text-slate-400'
                          }`}
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Out</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          onClick={() => openEditProduct(prod)}
                          className="p-1.5 text-gray-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-lg"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: STORE GPS & 5KM RADIUS SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 max-w-2xl shadow-sm">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white mb-1">
              Shop Location & Delivery Zone Settings
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-5">
              The 5km delivery radius restriction is dynamically calculated based on the Shop GPS Coordinates set below.
            </p>

            {settingsSaved && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/60 border border-green-200 dark:border-green-800 rounded-xl text-green-800 dark:text-green-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span>Store coordinates and delivery settings updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  value={settingsForm.storeName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              {/* Store Mobile Number & Store Gmail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Store Contact Mobile Number / Phone *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
                  />
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">Displayed to customers across store for support calls</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Store Official Gmail / Contact Email *</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="yashigeneralstore@gmail.com"
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
                  />
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">Customer support and official store inquiries</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Shop Physical Address
                </label>
                <input
                  type="text"
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Google Maps Location Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={settingsForm.mapsUrl || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, mapsUrl: e.target.value })}
                    placeholder="https://maps.app.goo.gl/..."
                    className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
                  />
                  <a
                    href={settingsForm.mapsUrl || 'https://maps.app.goo.gl/36DwR1dGU2bfv7KD9'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition whitespace-nowrap shadow-xs"
                  >
                    <span>View on Maps ↗</span>
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Shop GPS Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={settingsForm.latitude}
                    onChange={(e) => setSettingsForm({ ...settingsForm, latitude: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Shop GPS Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={settingsForm.longitude}
                    onChange={(e) => setSettingsForm({ ...settingsForm, longitude: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
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
                    className="w-32 px-3.5 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                  <span className="text-xs text-gray-500 dark:text-slate-400 font-semibold">
                    km (Default requirement: 5 km)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Minimum Order Value (₹)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="5"
                    min="1"
                    value={settingsForm.minOrderAmount || 100}
                    onChange={(e) => setSettingsForm({ ...settingsForm, minOrderAmount: Number(e.target.value) })}
                    className="w-32 px-3.5 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                  <span className="text-xs text-gray-500 dark:text-slate-400 font-semibold">
                    ₹ (Required: Min ₹100 order value for delivery)
                  </span>
                </div>
              </div>

              {/* SMS Gateway Configuration */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                <h4 className="text-sm font-black text-gray-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Real SMS Gateway (Customer Mobile OTP Delivery)</span>
                </h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-4 leading-relaxed">
                  By default, the store operates in <strong>Free Demo Mode</strong> with instant on-screen OTP verification (123456). To dispatch real SMS text messages to customer mobile phones, configure your Fast2SMS or Twilio API key below.
                </p>

                <div className="space-y-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                      Fast2SMS API Key (Recommended for Indian Mobile Numbers)
                    </label>
                    <input
                      type="password"
                      value={settingsForm.fast2smsApiKey || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, fast2smsApiKey: e.target.value })}
                      placeholder="Paste your Fast2SMS authorization key..."
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
                    />
                    <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
                      Supports instant Quick OTP route across India. Get an API key from <a href="https://www.fast2sms.com" target="_blank" rel="noreferrer" className="text-emerald-700 dark:text-emerald-400 font-bold underline">fast2sms.com</a>.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                        Twilio Account SID (Optional)
                      </label>
                      <input
                        type="text"
                        value={settingsForm.twilioAccountSid || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, twilioAccountSid: e.target.value })}
                        placeholder="ACxxxxxxxx..."
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                        Twilio Auth Token
                      </label>
                      <input
                        type="password"
                        value={settingsForm.twilioAuthToken || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, twilioAuthToken: e.target.value })}
                        placeholder="Twilio Auth Token..."
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                        Twilio Phone Number
                      </label>
                      <input
                        type="text"
                        value={settingsForm.twilioPhoneNumber || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, twilioPhoneNumber: e.target.value })}
                        placeholder="+1xxxxxxxxxx"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Google OAuth & Google Identity Services (GIS) Configuration */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                <h4 className="text-sm font-black text-gray-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Real Google Sign-In (Google Identity Services OAuth)</span>
                </h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-3 leading-relaxed">
                  Enables real Google OAuth account chooser popup & One Tap on mobile/Chrome. When users tap 'Continue with Google', Google directly displays their phone accounts, authenticates them, and returns verified details.
                </p>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                      Google OAuth Web Client ID
                    </label>
                    <input
                      type="text"
                      value={settingsForm.googleClientId || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSettingsForm({ ...settingsForm, googleClientId: val });
                        localStorage.setItem('ygs_google_client_id', val);
                      }}
                      placeholder="e.g. 1234567890-abcdefg.apps.googleusercontent.com"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
                    />
                  </div>

                  <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 text-[11px] text-blue-950 dark:text-blue-200 space-y-1">
                    <p className="font-bold">Setup Instructions for debusahu.github.io:</p>
                    <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-blue-900 dark:text-blue-300">
                      <li>Go to Google Cloud Console (<a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline font-bold">console.cloud.google.com/apis/credentials</a>)</li>
                      <li>Click <strong>Create Credentials</strong> &gt; <strong>OAuth client ID</strong> &gt; Application type: <strong>Web application</strong></li>
                      <li>Under <strong>Authorized JavaScript origins</strong>, add: <code>https://debusahu.github.io</code> and <code>http://localhost:3000</code></li>
                      <li>Copy the generated Client ID and paste it above, then click <strong>Save Store Settings</strong></li>
                    </ol>
                  </div>
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

        {/* TAB 4: ADMIN USERS & SECURITY */}
        {activeTab === 'admins' && (
          <div className="space-y-6 max-w-4xl">
            {/* Action Feedback Banner */}
            {adminActionMsg.text && (
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 ${
                  adminActionMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {adminActionMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  )}
                  <span>{adminActionMsg.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAdminActionMsg({ type: '', text: '' })}
                  className="text-xs hover:opacity-75 font-bold p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* CARD 1: CHANGE SELF PASSWORD */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 shadow-2xs">
              <div className="flex items-start justify-between flex-wrap gap-2 pb-4 border-b border-gray-100 dark:border-slate-800 mb-5">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span>Change My Account Password</span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    Logged in as: <strong className="text-purple-700 dark:text-purple-300">@{currentAdminUser}</strong>. Update your login credentials. Passwords are encrypted with bcrypt and are strictly never shown to visitors.
                  </p>
                </div>
                <span className="px-3 py-1 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs rounded-full border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Hidden & Encrypted</span>
                </span>
              </div>

              {selfPwdMsg.text && (
                <div
                  className={`mb-4 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    selfPwdMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800'
                  }`}
                >
                  {selfPwdMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  )}
                  <span>{selfPwdMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleChangeSelfPassword} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Current Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showSelfCurrent ? 'text' : 'password'}
                      required
                      placeholder="Enter your current password"
                      value={selfPwdForm.currentPassword}
                      onChange={(e) => setSelfPwdForm({ ...selfPwdForm, currentPassword: e.target.value })}
                      className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-600 text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSelfCurrent(!showSelfCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 p-0.5"
                      title={showSelfCurrent ? 'Hide password' : 'Show password'}
                    >
                      {showSelfCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showSelfNew ? 'text' : 'password'}
                        required
                        minLength={4}
                        placeholder="At least 4 characters"
                        value={selfPwdForm.newPassword}
                        onChange={(e) => setSelfPwdForm({ ...selfPwdForm, newPassword: e.target.value })}
                        className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-600 text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSelfNew(!showSelfNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 p-0.5"
                      >
                        {showSelfNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showSelfConfirm ? 'text' : 'password'}
                        required
                        minLength={4}
                        placeholder="Repeat new password"
                        value={selfPwdForm.confirmPassword}
                        onChange={(e) => setSelfPwdForm({ ...selfPwdForm, confirmPassword: e.target.value })}
                        className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-600 text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSelfConfirm(!showSelfConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 p-0.5"
                      >
                        {showSelfConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={selfPwdLoading}
                    className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {selfPwdLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>{selfPwdLoading ? 'Updating Password...' : 'Update My Password'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* CARD 2: MANAGE STORE ADMIN ACCOUNTS */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 shadow-2xs">
              <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-gray-100 dark:border-slate-800 mb-5">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span>Store Administrator Accounts</span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    Authorized staff and store managers who can accept delivery requests, manage stock, and add items.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAddAdminError('');
                    setNewAdminForm({ email: '', name: '', role: 'admin' });
                    setAddAdminModalOpen(true);
                  }}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Add Admin by Gmail</span>
                </button>
              </div>

              {loadingAdmins ? (
                <div className="py-10 text-center text-xs text-gray-500 dark:text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-600 dark:text-purple-400" />
                  <span>Loading admin accounts...</span>
                </div>
              ) : adminsList.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500 dark:text-slate-400">
                  No additional admin accounts found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-3">Admin Gmail & Name</th>
                        <th className="py-3 px-3">Role</th>
                        <th className="py-3 px-3">Authentication</th>
                        <th className="py-3 px-3">Date Added</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {adminsList.map((adm) => {
                        const adminEmail = (adm.email || adm.username || '').toLowerCase();
                        const isOwner = adminEmail === 'debusahu121@gmail.com';
                        const isSelf = adminEmail === currentAdminUser.toLowerCase();
                        return (
                          <tr key={adm.id} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/60 transition">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-black flex items-center justify-center text-xs shrink-0">
                                  {adminEmail.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                                    <span>{adminEmail}</span>
                                    {isOwner && (
                                      <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 text-[10px] font-black rounded">
                                        Owner 👑
                                      </span>
                                    )}
                                    {isSelf && !isOwner && (
                                      <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded">
                                        You
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-gray-500 dark:text-slate-400 text-[11px]">{adm.name || 'Store Admin'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                                  adm.role === 'superadmin' || isOwner
                                    ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300'
                                    : 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300'
                                }`}
                              >
                                <ShieldCheck className="w-3 h-3" />
                                <span>{adm.role === 'superadmin' || isOwner ? 'Super Admin' : 'Store Admin'}</span>
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded text-[11px] inline-flex items-center gap-1">
                                <span>Gmail Login (Passwordless)</span>
                              </span>
                            </td>
                            <td className="py-3 px-3 text-gray-500 dark:text-slate-400 text-[11px]">
                              {adm.createdAt ? new Date(adm.createdAt).toLocaleDateString() : 'Active'}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {isOwner ? (
                                  <span className="text-[11px] font-bold text-gray-400 dark:text-slate-500 italic">Primary Owner</span>
                                ) : isSelf ? (
                                  <span className="text-[11px] font-bold text-gray-400 dark:text-slate-500 italic">Active Session</span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAdmin(adm.id, adminEmail)}
                                    className="px-2.5 py-1 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 font-bold rounded-lg transition text-[11px] flex items-center gap-1"
                                    title="Revoke admin access for this Gmail"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Revoke Access</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200 dark:border-slate-800 p-6">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white mb-4">
              {editingProduct ? 'Edit Catalog Item' : 'Add New Item to Catalog'}
            </h3>

            {productFormError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
                {productFormError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Tomatoes / Royal Basmati Rice"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl capitalize font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="dairy" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Dairy Products</option>
                    <option value="icecream" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Ice Cream</option>
                    <option value="vegetables" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Vegetables</option>
                    <option value="grocery" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Grocery</option>
                    <option value="stationery" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Stationery</option>
                    <option value="general store" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">General Store</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="35"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Unit (e.g. 1 kg / pack) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="1 kg, 500g, 1 pc, pack"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              {/* Product Photo: Browse from Local or Web URL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300">
                    Product Photo *
                  </label>
                  <div className="flex items-center space-x-1 bg-gray-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageMode('browse')}
                      className={`px-2 py-0.5 rounded-md font-bold transition ${
                        imageMode === 'browse'
                          ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-2xs'
                          : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
                      }`}
                    >
                      📁 Browse Local Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      className={`px-2 py-0.5 rounded-md font-bold transition ${
                        imageMode === 'url'
                          ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-2xs'
                          : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
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
                    <div className="relative border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/40 rounded-2xl p-3 flex items-center gap-3">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-20 h-20 rounded-xl object-cover border border-emerald-300 dark:border-emerald-700 shadow-xs flex-shrink-0 bg-white dark:bg-slate-800"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full mb-1">
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          {selectedFile ? 'Local Photo Selected' : 'Product Photo'}
                        </span>
                        <p className="text-xs font-bold text-gray-800 dark:text-slate-200 truncate">
                          {selectedFile ? selectedFile?.name : 'Image loaded'}
                        </p>
                        {selectedFile && (
                          <p className="text-[10px] text-gray-500 dark:text-slate-400">
                            Size: {((selectedFile?.size || 0) / 1024).toFixed(1)} KB
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 rounded-lg transition"
                          >
                            Browse Another Photo
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveSelectedImage}
                            className="px-2 py-1 text-[11px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-lg transition"
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
                      className="border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-400 rounded-2xl p-4 sm:p-5 text-center cursor-pointer bg-gray-50/70 dark:bg-slate-800/40 hover:bg-purple-50/40 dark:hover:bg-purple-950/30 transition group"
                    >
                      <div className="w-11 h-11 mx-auto rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-extrabold text-gray-800 dark:text-slate-200 mb-0.5">
                        Click to Browse Photo from Local Storage / Device
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400 mb-2.5">
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
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-purple-600"
                    />
                    {productForm.image && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                        <img
                          src={productForm.image}
                          alt="Preview"
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <span className="text-[11px] text-gray-500 dark:text-slate-400 truncate flex-1">
                          {productForm.image}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  placeholder="Short details about quality or origin..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="inStockCheck"
                  checked={productForm.inStock}
                  onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500 dark:bg-slate-800 dark:border-slate-700"
                />
                <label htmlFor="inStockCheck" className="text-xs font-bold text-gray-700 dark:text-slate-300 cursor-pointer">
                  Mark as Available in Stock
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold text-xs rounded-xl transition"
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

      {/* ADD NEW ADMIN MODAL (Passwordless Gmail authorization) */}
      {addAdminModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Add Admin by Gmail ID</span>
              </h3>
              <button
                type="button"
                onClick={() => setAddAdminModalOpen(false)}
                className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addAdminError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{addAdminError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-3.5">
              <div className="p-3 bg-purple-50 dark:bg-purple-950/60 rounded-2xl border border-purple-100 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-xs leading-relaxed">
                ✨ <strong>Passwordless Admin Access:</strong> Enter the user's Gmail address. When they sign in with this Gmail, the Admin Portal will automatically unlock for them!
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Admin Gmail Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. storemanager@gmail.com"
                  value={newAdminForm.email}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-600 text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Display / Staff Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Store Manager Ravi"
                  value={newAdminForm.name}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-600 text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Admin Privileges
                </label>
                <select
                  value={newAdminForm.role}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, role: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                >
                  <option value="admin" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Store Admin (Manage Orders & Products)</option>
                  <option value="superadmin" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Super Admin (Full Access to Store & Settings)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddAdminModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addAdminLoading}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {addAdminLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{addAdminLoading ? 'Granting...' : 'Grant Admin Access'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET ADMIN PASSWORD MODAL */}
      {resetPwdModalOpen && targetAdminToReset && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Reset Admin Password</span>
              </h3>
              <button
                type="button"
                onClick={() => setResetPwdModalOpen(false)}
                className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-xl text-xs text-purple-900 dark:text-purple-200">
              Resetting password for admin account: <strong>@{targetAdminToReset?.username || 'admin'}</strong> ({targetAdminToReset?.name || 'Store Admin'})
            </div>

            {resetPwdError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{resetPwdError}</span>
              </div>
            )}

            <form onSubmit={handleResetAdminPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showResetPwd ? 'text' : 'password'}
                    required
                    minLength={4}
                    placeholder="Enter new password (min 4 chars)"
                    value={resetPwdForm.newPassword}
                    onChange={(e) => setResetPwdForm({ ...resetPwdForm, newPassword: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-600 text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPwd(!showResetPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 p-0.5"
                  >
                    {showResetPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showResetConfirm ? 'text' : 'password'}
                    required
                    minLength={4}
                    placeholder="Confirm new password"
                    value={resetPwdForm.confirmPassword}
                    onChange={(e) => setResetPwdForm({ ...resetPwdForm, confirmPassword: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-600 text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(!showResetConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 p-0.5"
                  >
                    {showResetConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setResetPwdModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetPwdLoading}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {resetPwdLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{resetPwdLoading ? 'Saving...' : 'Save New Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

