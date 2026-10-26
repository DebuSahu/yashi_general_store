import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import DeliveryNoticeBanner from './components/DeliveryNoticeBanner';
import AnnouncementTicker from './components/AnnouncementTicker';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import WishlistDrawer from './components/WishlistDrawer';
import OrderHistoryModal from './components/OrderHistoryModal';
import SortFilterToolbar from './components/SortFilterToolbar';
import Toast from './components/Toast';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import GoogleAuthModal from './components/GoogleAuthModal';
import OrderTrackerModal from './components/OrderTrackerModal';
import LocationPicker from './components/LocationPicker';
import AdminDashboard from './pages/AdminDashboard';
import YGSLogo from './components/YGSLogo';
import defaultData from './defaultData.json';
import { api } from './api';
import confetti from 'canvas-confetti';
import {
  Carrot,
  ShoppingBag,
  Package,
  Layers,
  MapPin,
  Truck,
  CheckCircle2,
  Clock,
  PhoneCall,
  ShieldCheck,
  Search,
  Sparkles,
  X,
  Milk,
  IceCream,
  BookOpen,
  ArrowRight,
  Zap,
  Tag,
  Star,
  Heart,
  Grid,
  List,
  RotateCcw,
  Sun,
  Moon,
  Store,
  ShoppingCart
} from 'lucide-react';

export default function App() {
  // Theme state (Dark / Light mode)
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('gs_theme');
      if (saved) return saved;
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('gs_theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [isAdminView, setIsAdminView] = useState(false);
  const [products, setProducts] = useState(defaultData.products || []);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [shopSettings, setShopSettings] = useState(defaultData.settings || null);

  // E-Commerce Filter & Sort State
  const [sortBy, setSortBy] = useState('featured');
  const [filterVegOnly, setFilterVegOnly] = useState(false);
  const [filterDealsOnly, setFilterDealsOnly] = useState(false);
  const [filterInStockOnly, setFilterInStockOnly] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Cart state
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('gs_cart');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Wishlist state
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('gs_wishlist');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Applied Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Toast Notification state
  const [toast, setToast] = useState(null);

  // Quick View / Product Detail Modal State
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // User auth state (SessionStorage so user is automatically logged out when exiting the site tab)
  const [user, setUser] = useState(() => {
    try {
      // Clear legacy localStorage keys to enforce clean logout on exit
      localStorage.removeItem('gs_user');
      localStorage.removeItem('gs_user_token');
      const saved = sessionStorage.getItem('gs_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Admin auth state (SessionStorage)
  const [adminUser, setAdminUser] = useState(() => {
    try {
      localStorage.removeItem('gs_admin_token');
      localStorage.removeItem('gs_admin_user');
      const token = sessionStorage.getItem('gs_admin_token');
      const savedUser = sessionStorage.getItem('gs_admin_user');
      if (token && savedUser) {
        return { username: savedUser, email: savedUser, token };
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [authInitialTab, setAuthInitialTab] = useState('user');

  // Modals state
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState(false);
  const [orderHistoryModalOpen, setOrderHistoryModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [googleAuthModalOpen, setGoogleAuthModalOpen] = useState(false);
  const [orderTrackerOpen, setOrderTrackerOpen] = useState(false);
  const [targetTrackerOrder, setTargetTrackerOrder] = useState(null);
  const [eligibilityModalOpen, setEligibilityModalOpen] = useState(false);
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState(null);

  // Sync cart & wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('gs_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('gs_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Load shop settings and products
  const loadInitialData = async () => {
    try {
      const [settingsRes, productsRes] = await Promise.all([
        api.getSettings(),
        api.getProducts(selectedCategory, searchTerm)
      ]);

      if (settingsRes?.settings) {
        setShopSettings(settingsRes.settings);
      } else if (settingsRes && typeof settingsRes === 'object') {
        setShopSettings(settingsRes);
      }

      let prods = [];
      if (productsRes?.products && Array.isArray(productsRes.products)) {
        prods = productsRes.products;
      } else if (Array.isArray(productsRes)) {
        prods = productsRes;
      } else if (productsRes?.success && Array.isArray(productsRes.products)) {
        prods = productsRes.products;
      }

      if (!prods || prods.length === 0) {
        prods = defaultData.products || [];
      }

      setProducts(prods);
    } catch (err) {
      console.error('Error fetching initial store data:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [selectedCategory, searchTerm]);

  // Cart operations
  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev[product.id];
      const newQty = existing ? existing.quantity + 1 : 1;
      return {
        ...prev,
        [product.id]: {
          ...product,
          quantity: newQty
        }
      };
    });
  };

  const handleUpdateQty = (productId, newQty) => {
    setCart((prev) => {
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          quantity: newQty
        }
      };
    });
  };

  const handleRemoveItem = (productId) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  // Wishlist operations
  const handleToggleWishlist = (product) => {
    setWishlist((prev) => {
      const copy = { ...prev };
      if (copy[product.id]) {
        delete copy[product.id];
        setToast({
          type: 'wishlist',
          title: 'Removed from Wishlist',
          message: `${product.name} removed from your saved items.`
        });
      } else {
        copy[product.id] = product;
        setToast({
          type: 'wishlist',
          title: 'Saved to Wishlist! ❤️',
          message: `${product.name} added to your favorites.`
        });
        try {
          confetti({
            particleCount: 20,
            spread: 40,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      }
      return copy;
    });
  };

  const handleRemoveFromWishlist = (productId) => {
    setWishlist((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  const handleClearWishlist = () => {
    setWishlist({});
    setToast({
      type: 'wishlist',
      title: 'Wishlist Cleared',
      message: 'All saved items removed.'
    });
  };

  // Reorder items from past orders
  const handleReorder = (orderItems) => {
    setCart((prev) => {
      const copy = { ...prev };
      orderItems.forEach((it) => {
        const matched = products.find((p) => p.id === it.id) || it;
        const currentQty = copy[it.id]?.quantity || 0;
        copy[it.id] = {
          ...matched,
          quantity: currentQty + (it.quantity || 1)
        };
      });
      return copy;
    });
    setCartDrawerOpen(true);
  };

  const cartItems = Object.values(cart);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const wishlistCount = Object.keys(wishlist).length;

  // Auth operations
  const handleUserVerified = (userData, token, fullRes = null) => {
    setUser(userData);
    sessionStorage.setItem('gs_user', JSON.stringify(userData));
    sessionStorage.setItem('gs_user_token', token);
    localStorage.removeItem('gs_user');
    localStorage.removeItem('gs_user_token');

    // Check if user is authorized as Admin (Owner debusahu121@gmail.com or authorized admin email)
    const email = userData?.email?.trim().toLowerCase();
    const isOwner = email === 'debusahu121@gmail.com';
    const isAuthorized = isOwner || userData?.isAdmin || fullRes?.isAdmin || api.isAuthorizedAdminEmail(email);

    if (isAuthorized) {
      const adminToken = fullRes?.adminToken || token || ('admin-jwt-token-' + Date.now());
      const adminRole = isOwner ? 'superadmin' : (userData?.role === 'superadmin' ? 'superadmin' : 'admin');
      const adminObj = {
        username: email,
        email: email,
        name: userData?.name || 'Store Admin',
        role: adminRole,
        token: adminToken
      };
      setAdminUser(adminObj);
      sessionStorage.setItem('gs_admin_token', adminToken);
      sessionStorage.setItem('gs_admin_user', email);
      localStorage.removeItem('gs_admin_token');
      localStorage.removeItem('gs_admin_user');

      setToast({
        type: 'success',
        title: isOwner ? 'Store Owner Logged In 🛡️' : 'Admin Access Granted 🛡️',
        message: `Admin Portal unlocked for ${email}`
      });
    } else {
      setAdminUser(null);
      sessionStorage.removeItem('gs_admin_token');
      sessionStorage.removeItem('gs_admin_user');
      localStorage.removeItem('gs_admin_token');
      localStorage.removeItem('gs_admin_user');
    }
  };

  const handleLogoutUser = () => {
    setUser(null);
    setAdminUser(null);
    setIsAdminView(false);
    sessionStorage.removeItem('gs_user');
    sessionStorage.removeItem('gs_user_token');
    sessionStorage.removeItem('gs_admin_token');
    sessionStorage.removeItem('gs_admin_user');
    localStorage.removeItem('gs_user');
    localStorage.removeItem('gs_user_token');
    localStorage.removeItem('gs_admin_token');
    localStorage.removeItem('gs_admin_user');
    setToast({
      type: 'success',
      title: 'Logged Out',
      message: 'You have been logged out safely.'
    });
  };

  const handleAdminLoginSuccess = (adminData, token) => {
    const userObj = {
      username: adminData.username || adminData.email || 'admin',
      email: adminData.email || adminData.username || 'admin',
      name: adminData.name || adminData.username || 'Store Admin',
      role: adminData.role || 'admin',
      token
    };
    setAdminUser(userObj);
    sessionStorage.setItem('gs_admin_token', token);
    sessionStorage.setItem('gs_admin_user', userObj.username);
    localStorage.removeItem('gs_admin_token');
    localStorage.removeItem('gs_admin_user');
    setIsAdminView(true);
  };

  const handleLogoutAdmin = () => {
    setAdminUser(null);
    sessionStorage.removeItem('gs_admin_token');
    sessionStorage.removeItem('gs_admin_user');
    localStorage.removeItem('gs_admin_token');
    localStorage.removeItem('gs_admin_user');
    setIsAdminView(false);
    setToast({
      type: 'info',
      title: 'Admin Session Ended',
      message: 'Admin portal locked.'
    });
  };

  // Admin Direct In-Stock / Out of Stock updater from Storefront
  const handleToggleProductStock = async (productId, inStock) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updatedStock = inStock ? (p.stock > 0 ? p.stock : 25) : 0;
          return { ...p, inStock, stock: updatedStock };
        }
        return p;
      })
    );

    try {
      const target = products.find((p) => p.id === productId);
      const updatedStock = inStock ? (target?.stock > 0 ? target.stock : 25) : 0;
      await api.updateProduct(productId, { inStock, stock: updatedStock }, adminUser?.token);
    } catch (err) {
      console.error('Failed to update product stock:', err);
    }
  };

  const handleOpenAdmin = () => {
    if (!adminUser) {
      setToast({
        type: 'error',
        title: 'Admin Access Denied 🔒',
        message: 'Admin Portal is strictly restricted to store owners via authorized Gmail login.'
      });
      return;
    }
    setIsAdminView(true);
  };

  const handleBackToStore = () => {
    setIsAdminView(false);
    if (window.location.hash === '#admin') {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
  };

  // URL hash routing for #admin with strict security guard
  useEffect(() => {
    const checkAdminRoute = () => {
      if (window.location.hash === '#admin' || window.location.search.includes('admin=true')) {
        if (adminUser) {
          setIsAdminView(true);
        } else {
          setIsAdminView(false);
          if (window.location.hash === '#admin') {
            window.history.replaceState(null, '', window.location.pathname + window.location.search.replace(/[?&]admin=true/, ''));
          }
          setToast({
            type: 'error',
            title: 'Admin Access Denied 🔒',
            message: 'Please sign in with your authorized Gmail account (debusahu121@gmail.com) to access Admin Portal.'
          });
        }
      }
    };
    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    return () => window.removeEventListener('hashchange', checkAdminRoute);
  }, [adminUser]);

  const handleResetFilters = () => {
    setSortBy('featured');
    setFilterVegOnly(false);
    setFilterDealsOnly(false);
    setFilterInStockOnly(false);
    setSelectedPriceRange('all');
    setSelectedBrand('all');
    setSearchTerm('');
  };



  const categoryPills = [
    { id: 'all', label: 'All Items', icon: Layers },
    {
      id: 'dairy',
      label: 'Dairy Products',
      icon: Milk,
      description: 'Fresh Milk, Curd, Paneer, Butter, Pure Desi Ghee & Cheese',
      colorClass: 'bg-sky-100 text-sky-800 border-sky-200',
      bannerImage: './images/dairy_showcase.jpg'
    },
    {
      id: 'icecream',
      label: 'Ice Cream',
      icon: IceCream,
      description: 'Delicious Cones, Cups, Bars, Kulfi & Party Tubs',
      colorClass: 'bg-pink-100 text-pink-800 border-pink-200',
      bannerImage: './images/icecream_showcase.jpg'
    },
    {
      id: 'vegetables',
      label: 'Vegetables',
      icon: Carrot,
      description: 'Farm-Fresh Green Vegetables Restocked Daily',
      colorClass: 'bg-green-100 text-green-800 border-green-200',
      bannerImage: './images/vegetables_showcase.jpg'
    },
    {
      id: 'grocery',
      label: 'Grocery',
      icon: ShoppingBag,
      description: 'Chakki Atta, Basmati Rice, Dal, Edible Oil, Tea & Spices',
      colorClass: 'bg-amber-100 text-amber-800 border-amber-200',
      bannerImage: './images/grocery_showcase.jpg'
    },
    {
      id: 'stationery',
      label: 'Stationery',
      icon: BookOpen,
      description: 'Notebooks, Pens, Pencils, Geometry Box & Study Supplies',
      colorClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      bannerImage: './images/stationery_showcase.jpg'
    },
    {
      id: 'general store',
      label: 'General Store',
      icon: Package,
      description: 'Household Soaps, Detergents & Cleaning Essentials',
      colorClass: 'bg-purple-100 text-purple-800 border-purple-200',
      bannerImage: './images/cleaning_showcase.jpg'
    }
  ];

  const mainCategorySections = categoryPills.filter((c) => c.id !== 'all');

  // Compute available unique brands
  const availableBrands = useMemo(() => {
    const bSet = new Set();
    (products || []).forEach((p) => {
      if (p?.brand && p.brand.trim()) {
        bSet.add(p.brand.trim());
      }
    });
    return Array.from(bSet).sort();
  }, [products]);

  // Comprehensive filtered and sorted products list
  const filteredAndSortedProducts = useMemo(() => {
    let list = (products || []).filter(Boolean);

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter(
        (p) =>
          (p?.category || '').toLowerCase().replace(/[\s-_]+/g, '') ===
          selectedCategory.replace(/[\s-_]+/g, '')
      );
    }

    // Search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          (p?.name || '').toLowerCase().includes(q) ||
          (p?.brand && p.brand.toLowerCase().includes(q)) ||
          (p?.category || '').toLowerCase().includes(q) ||
          (p?.description && p.description.toLowerCase().includes(q))
      );
    }

    // Brand filter
    if (selectedBrand !== 'all') {
      list = list.filter(
        (p) => p?.brand && p.brand.toLowerCase() === selectedBrand.toLowerCase()
      );
    }

    // Pure Veg filter
    if (filterVegOnly) {
      list = list.filter((p) => p?.isVeg !== false);
    }

    // Hot Deals Only filter (>= 15% discount)
    if (filterDealsOnly) {
      list = list.filter((p) => {
        if (!p) return false;
        const mrp = p?.mrp || Math.round((p?.price || 0) * 1.15);
        const disc = Math.round(((mrp - (p?.price || 0)) / (mrp || 1)) * 100);
        return disc >= 15;
      });
    }

    // In Stock Only
    if (filterInStockOnly) {
      list = list.filter((p) => p?.inStock !== false && (p?.stock ?? 1) > 0);
    }

    // Price range
    if (selectedPriceRange === 'under-50') {
      list = list.filter((p) => (p?.price || 0) < 50);
    } else if (selectedPriceRange === '50-150') {
      list = list.filter((p) => (p?.price || 0) >= 50 && (p?.price || 0) <= 150);
    } else if (selectedPriceRange === '150-300') {
      list = list.filter((p) => (p?.price || 0) > 150 && (p?.price || 0) <= 300);
    } else if (selectedPriceRange === '300-plus') {
      list = list.filter((p) => (p?.price || 0) > 300);
    }

    // Sorting
    if (sortBy === 'price-asc') {
      list.sort((a, b) => (a?.price || 0) - (b?.price || 0));
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => (b?.price || 0) - (a?.price || 0));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b?.rating || 4.8) - (a?.rating || 4.8));
    } else if (sortBy === 'discount') {
      list.sort((a, b) => {
        if (!a || !b) return 0;
        const mrpA = a?.mrp || Math.round((a?.price || 0) * 1.15);
        const mrpB = b?.mrp || Math.round((b?.price || 0) * 1.15);
        const discA = a?.discountPercent || Math.round(((mrpA - (a?.price || 0)) / (mrpA || 1)) * 100);
        const discB = b?.discountPercent || Math.round(((mrpB - (b?.price || 0)) / (mrpB || 1)) * 100);
        return discB - discA;
      });
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [
    products,
    selectedCategory,
    searchTerm,
    selectedBrand,
    filterVegOnly,
    filterDealsOnly,
    filterInStockOnly,
    selectedPriceRange,
    sortBy
  ]);

  const isCustomFiltered =
    filterVegOnly ||
    filterDealsOnly ||
    filterInStockOnly ||
    selectedPriceRange !== 'all' ||
    selectedBrand !== 'all' ||
    sortBy !== 'featured' ||
    searchTerm.trim().length > 0;

  // Switch to Admin Dashboard View if requested (guarded by adminUser authorization)
  if (isAdminView) {
    if (!adminUser) {
      setIsAdminView(false);
      return null;
    }
    return (
      <AdminDashboard
        adminUser={adminUser}
        shopSettings={shopSettings}
        onSettingsUpdated={(newSettings) => setShopSettings(newSettings)}
        onBackToStore={handleBackToStore}
        onLogoutAdmin={handleLogoutAdmin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-100 selection:text-emerald-900 w-full max-w-full overflow-x-hidden transition-colors duration-200">
      
      {/* 0. LIVE ANIMATED TICKER MARQUEE */}
      <AnnouncementTicker user={user} />

      {/* 1. TOP ANNOUNCEMENT BANNER (Strict 5km delivery notice) */}
      <DeliveryNoticeBanner
        onOpenLocationChecker={() => setEligibilityModalOpen(true)}
      />

      {/* 2. MAIN HEADER & NAVBAR */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        cartCount={cartCount}
        cartTotal={cartTotal}
        wishlistCount={wishlistCount}
        onOpenCart={() => setCartDrawerOpen(true)}
        onOpenWishlist={() => setWishlistDrawerOpen(true)}
        onOpenOrderHistory={() => setOrderHistoryModalOpen(true)}
        onOpenAuth={() => {
          setAuthInitialTab('user');
          setAuthModalOpen(true);
        }}
        onOpenGoogleAuth={() => setGoogleAuthModalOpen(true)}
        onOpenOrders={() => {
          setTargetTrackerOrder(null);
          setOrderTrackerOpen(true);
        }}
        onOpenAdmin={handleOpenAdmin}
        user={user}
        onLogoutUser={handleLogoutUser}
        adminUser={adminUser}
        onLogoutAdmin={handleLogoutAdmin}
        shopSettings={shopSettings}
        products={products}
        onAddToCart={handleAddToCart}
        onOpenQuickView={(p) => setQuickViewProduct(p)}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* 3. HERO SECTION WITH VIBRANT ANIMATIONS */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white overflow-hidden py-7 sm:py-14 lg:py-16 w-full max-w-full">
        {/* Decorative glowing gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-400/20 blur-3xl animate-pulse-glow" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-teal-400/20 blur-3xl animate-pulse-glow-amber" />
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-3 sm:space-y-4">
              
              {/* Animated Flash Delivery Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-emerald-100 shadow-sm animate-float-slow">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <Zap className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
                <span>15-30 Mins Lightning Local Delivery • Strictly within 5 km</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Fresh Milk, Amul Dairy, Farm Veggies & Daily Groceries Delivered.
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-emerald-100/90 max-w-xl leading-relaxed">
                Order fresh daily <strong className="text-white">Amul & Namaste India</strong> milk, malai paneer, dahi, ghee, farm-fresh green vegetables, chakki atta, dal, spices, and stationery from{' '}
                <strong className="text-white underline decoration-yellow-400 decoration-2">Yashi General Store</strong>.
              </p>

              {/* 5km Radius Highlight Badge */}
              <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="bg-emerald-950/70 backdrop-blur-md border border-emerald-400/50 rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center space-x-3 shadow-md">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 to-amber-300 text-slate-950 flex items-center justify-center font-black text-lg shrink-0 shadow-sm">
                    5
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-xs font-black uppercase text-yellow-300 tracking-wider block">
                      Guaranteed 5 km Delivery Zone
                    </span>
                    <span className="text-xs text-white/95">
                      Fast doorstep delivery across <strong>Mirpur Cantonment, Kanpur</strong>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setEligibilityModalOpen(true)}
                  className="px-4 py-2.5 sm:py-3 bg-white hover:bg-emerald-50 text-emerald-900 font-black text-xs sm:text-sm rounded-2xl shadow-xl transition active:scale-95 flex items-center justify-center gap-2 shrink-0 border border-white/80"
                >
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>Check GPS Eligibility (≤ 5km)</span>
                </button>
              </div>

              {/* Trust Badges Bar */}
              <div className="pt-2 flex items-center gap-4 text-xs font-bold text-emerald-200/90 flex-wrap">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                  <span>4.9★ (1,500+ Happy Customers)</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>100% Original Products</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-amber-300" />
                  <span>Coupon YASHI50</span>
                </span>
              </div>

            </div>

            {/* Visual Hero Feature Showcase Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 bg-emerald-950/40 group">
                <img
                  src="./images/hero_banner.jpg"
                  alt="Yashi General Store (YGS) Fresh Catalog"
                  className="w-full aspect-[16/10] sm:aspect-auto sm:h-76 object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-4 sm:p-5 text-white">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-yellow-300 bg-emerald-900/90 border border-emerald-400/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3 text-yellow-300" />
                      <span>Actual Store Inventory</span>
                    </span>
                    <span className="text-[10px] text-emerald-200 font-black bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                      {products.length}+ Items Ready
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-lg font-black leading-tight text-white">
                    Farm Fresh Veggies, Amul Dairy, Groceries & Ice Creams
                  </h3>
                  <p className="text-[11px] text-emerald-200 mt-1">
                    Direct local delivery • Strictly up to 5 km from shop location
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. CATEGORY SELECTOR & FILTER TABS */}
      <div className="sticky top-16 sm:top-20 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 py-2 sm:py-3 shadow-xs w-full max-w-full overflow-hidden transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
          <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
            {categoryPills.map((pill) => {
              const Icon = pill.icon;
              const isActive = selectedCategory === pill.id;
              const count = pill.id === 'all'
                ? (products || []).length
                : (products || []).filter(
                    (p) =>
                      (p?.category || '').toLowerCase().replace(/[\s-_]+/g, '') ===
                      pill.id.replace(/[\s-_]+/g, '')
                  ).length;

              return (
                <button
                  key={pill.id}
                  onClick={() => {
                    setSelectedCategory(pill.id);
                    setSelectedBrand('all');
                  }}
                  className={`flex-shrink-0 inline-flex items-center space-x-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black transition active:scale-95 whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 border border-emerald-500'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-emerald-800 dark:hover:text-emerald-300 border border-slate-200/80 dark:border-slate-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                  <span>{pill.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. PRODUCT CATALOG & TOOLBAR */}
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-24 sm:py-8 flex-1 min-w-0">
        
        {/* SORT & FILTER TOOLBAR */}
        <SortFilterToolbar
          sortBy={sortBy}
          setSortBy={setSortBy}
          filterVegOnly={filterVegOnly}
          setFilterVegOnly={setFilterVegOnly}
          filterDealsOnly={filterDealsOnly}
          setFilterDealsOnly={setFilterDealsOnly}
          filterInStockOnly={filterInStockOnly}
          setFilterInStockOnly={setFilterInStockOnly}
          selectedPriceRange={selectedPriceRange}
          setSelectedPriceRange={setSelectedPriceRange}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          availableBrands={availableBrands}
          viewMode={viewMode}
          setViewMode={setViewMode}
          totalResults={filteredAndSortedProducts.length}
          onResetFilters={handleResetFilters}
        />

        {/* Loading state */}
        {loadingProducts ? (
          <div className="grid grid-cols-2 [grid-template-columns:repeat(2,minmax(0,1fr))] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 lg:gap-5 w-full max-w-full min-w-0">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs animate-pulse space-y-3">
                <div className="aspect-square bg-slate-200 rounded-2xl" />
                <div className="h-4 bg-slate-200 rounded-lg w-3/4" />
                <div className="h-3 bg-slate-200 rounded-lg w-1/2" />
                <div className="h-9 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : isCustomFiltered || selectedCategory !== 'all' ? (
          /* Filtered / Single Category / Search Results View */
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {searchTerm ? `Search Results for "${searchTerm}"` : `Showing ${filteredAndSortedProducts.length} Items`}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Available for superfast 15-30 min delivery within 5km radius
                </p>
              </div>

              {isCustomFiltered && (
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear All Filters</span>
                </button>
              )}
            </div>

            {filteredAndSortedProducts.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 text-center border border-slate-200 dark:border-slate-800 max-w-md mx-auto my-8 space-y-3">
                <Search className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-black text-slate-800 dark:text-white">
                  No products match your filters
                </h3>
                <p className="text-xs text-slate-500">
                  Try adjusting your search keywords, price range, or clearing active filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition shadow-md shadow-emerald-600/20"
                >
                  Show All Products
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'list'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full'
                    : 'grid grid-cols-2 [grid-template-columns:repeat(2,minmax(0,1fr))] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 lg:gap-5 w-full max-w-full min-w-0'
                }
              >
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    cartQty={cart[product.id]?.quantity || 0}
                    onAddToCart={handleAddToCart}
                    onUpdateQty={handleUpdateQty}
                    isAdmin={Boolean(adminUser)}
                    onToggleStock={handleToggleProductStock}
                    isWishlisted={Boolean(wishlist[product.id])}
                    onToggleWishlist={handleToggleWishlist}
                    onOpenQuickView={(p) => setQuickViewProduct(p)}
                    onShowToast={(t) => setToast(t)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ALL ITEMS: Dedicated Sections per Category */
          <div className="space-y-10 sm:space-y-12">
            
            {/* Top Store Overview Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Shop by Categories
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Browse {products.length} daily essentials available for superfast 5km delivery
                </p>
              </div>

              <div className="hidden sm:flex items-center space-x-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Delivery Radius: Max {shopSettings?.maxDeliveryRadiusKm || 5} km</span>
              </div>
            </div>

            {/* Sections for Each Category */}
            {mainCategorySections.map((section) => {
              const sectionProducts = (products || []).filter(
                (p) =>
                  (p?.category || '').toLowerCase().replace(/[\s-_]+/g, '') ===
                  section.id.replace(/[\s-_]+/g, '')
              );
              if (sectionProducts.length === 0) return null;
              const SectionIcon = section.icon;

              return (
                <section
                  key={section.id}
                  id={`section-${section.id}`}
                  className="scroll-mt-36 w-full max-w-full min-w-0"
                >
                  {/* Category Section Header with Showcase Background */}
                  <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-3.5 sm:mb-6 border border-slate-200 shadow-md group min-h-[140px] sm:min-h-[175px] md:min-h-[195px] flex flex-col justify-between bg-slate-900">
                    {/* Background Showcase Image */}
                    {section.bannerImage && (
                      <img
                        src={section.bannerImage}
                        alt={`${section.label} Showcase Background`}
                        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}

                    {/* Gradient & Blur Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-slate-950/35 backdrop-blur-[2px] sm:backdrop-blur-sm" />

                    {/* Foreground Content */}
                    <div className="relative z-10 p-3.5 sm:p-5 md:p-6 flex flex-col justify-between h-full gap-2.5 sm:gap-3.5">
                      
                      {/* Header Row */}
                      <div className="flex items-center justify-between gap-2.5 min-w-0">
                        <div className="flex items-center space-x-2.5 sm:space-x-3.5 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-md shrink-0">
                            <SectionIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
                              <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-md">
                                {section.label}
                              </h2>
                              <span className="text-[10px] sm:text-xs font-black uppercase px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-500/95 text-white shadow-xs backdrop-blur-xs border border-emerald-400/40">
                                {sectionProducts.length} Items
                              </span>
                              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-yellow-300 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full border border-yellow-300/30">
                                <Sparkles className="w-2.5 h-2.5 text-yellow-300" />
                                <span>Showcase</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedCategory(section.id);
                            window.scrollTo({ top: 350, behavior: 'smooth' });
                          }}
                          className="shrink-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-slate-900 bg-white/95 hover:bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-md transition active:scale-95 border border-white/60 hover:shadow-lg"
                        >
                          <span>View All</span>
                          <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
                        </button>
                      </div>

                      <p className="text-xs sm:text-sm md:text-base text-slate-100 font-medium leading-relaxed max-w-2xl drop-shadow-sm">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  {/* Responsive Grid */}
                  <div className="grid grid-cols-2 [grid-template-columns:repeat(2,minmax(0,1fr))] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 lg:gap-5 w-full max-w-full min-w-0">
                    {sectionProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        cartQty={cart[product.id]?.quantity || 0}
                        onAddToCart={handleAddToCart}
                        onUpdateQty={handleUpdateQty}
                        isAdmin={Boolean(adminUser)}
                        onToggleStock={handleToggleProductStock}
                        isWishlisted={Boolean(wishlist[product.id])}
                        onToggleWishlist={handleToggleWishlist}
                        onOpenQuickView={(p) => setQuickViewProduct(p)}
                        onShowToast={(t) => setToast(t)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

          </div>
        )}

      </main>

      {/* 6. FLOATING CART BAR (Mobile optimized) */}
      {cartCount > 0 && !cartDrawerOpen && (
        <div className="fixed bottom-3 inset-x-3 sm:bottom-5 sm:inset-x-4 max-w-lg mx-auto z-40 animate-in slide-in-from-bottom duration-300">
          <div
            onClick={() => setCartDrawerOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white p-2.5 sm:p-3.5 rounded-2xl shadow-2xl flex items-center justify-between cursor-pointer border border-emerald-500/60 transition active:scale-98"
          >
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <span className="w-8 h-8 sm:w-9 sm:h-9 bg-white text-emerald-800 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                {cartCount}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black truncate">
                    {cartCount} {cartCount === 1 ? 'item' : 'items'}
                  </span>
                  <span className="text-white/60">•</span>
                  <span className="text-xs sm:text-sm font-black text-yellow-300 shrink-0">
                    ₹{cartTotal}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-emerald-200 truncate">
                  {cartTotal < (shopSettings?.minOrderAmount || 100)
                    ? `Add ₹${(shopSettings?.minOrderAmount || 100) - cartTotal} more for Min ₹100`
                    : 'Free 5km Delivery • Ready to Order'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0 ml-2">
              <span className="text-xs font-black bg-white text-emerald-900 px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs">
                <span>View Cart</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 7. FOOTER */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-10 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-slate-800">
            
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-2">
                <YGSLogo size="sm" />
                <span className="text-lg font-black text-white">Yashi General Store</span>
              </div>
              <p className="mt-1 text-slate-400 max-w-sm">
                {shopSettings?.tagline ||
                  'Your daily neighborhood grocery, fresh vegetables, Amul & Namaste India dairy, household provisions & stationery.'}
              </p>
              <div className="mt-3 flex items-center gap-3 text-xs text-emerald-400 font-bold">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Strictly 5km Delivery Radius</span>
                </span>
                <span>•</span>
                <span>Mirpur Cantt, Kanpur</span>
              </div>
            </div>

            <div>
              <span className="text-sm font-black text-white block mb-2">
                Store Location & Contact
              </span>
              <p className="text-slate-400 font-medium">
                {shopSettings?.address ||
                  '510, Elliot Lane, Near Water Tank, Mirpur Cantonment, Kanpur, Uttar Pradesh - 208004'}
              </p>
              <a
                href={shopSettings?.mapsUrl || 'https://maps.app.goo.gl/36DwR1dGU2bfv7KD9'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold mt-2 text-xs transition underline"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Directions on Google Maps &rarr;</span>
              </a>
              <p className="mt-2 font-bold text-slate-300 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Call Store: <strong>{shopSettings?.phone || '+91 98765 43210'}</strong></span>
              </p>
              <p className="mt-1 font-bold text-slate-300 flex items-center gap-1.5">
                <span className="text-emerald-400">✉️</span>
                <span>Email / Gmail: <strong>{shopSettings?.email || 'contact@yashigeneralstore.com'}</strong></span>
              </p>
            </div>

            <div>
              <span className="text-sm font-black text-white block mb-2">Quick Navigation</span>
              <div className="space-y-1.5 mt-1 text-xs">
                <button
                  onClick={() => setWishlistDrawerOpen(true)}
                  className="block text-emerald-400 hover:underline"
                >
                  &rarr; My Saved Wishlist ({wishlistCount})
                </button>
                <button
                  onClick={() => setOrderHistoryModalOpen(true)}
                  className="block text-emerald-400 hover:underline"
                >
                  &rarr; Order History & Reorder
                </button>
                <button
                  onClick={() => {
                    setTargetTrackerOrder(null);
                    setOrderTrackerOpen(true);
                  }}
                  className="block text-emerald-400 hover:underline"
                >
                  &rarr; Live Order Tracker
                </button>
                <button
                  onClick={() => setEligibilityModalOpen(true)}
                  className="block text-emerald-400 hover:underline"
                >
                  &rarr; Check GPS 5km Radius
                </button>
                {adminUser && (
                  <button
                    onClick={() => setIsAdminView(true)}
                    className="block text-purple-400 hover:text-purple-300 hover:underline font-bold text-left"
                  >
                    &rarr; 🛡️ Admin Store Management
                  </button>
                )}
              </div>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center text-slate-500 text-[11px] gap-2">
            <p>&copy; 2026 Yashi General Store (YGS). All rights reserved.</p>
            <p>5 km Delivery Radius Restriction strictly enforced via GPS Haversine verification.</p>
          </div>
        </div>
      </footer>

      {/* TOAST NOTIFICATION */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* PRODUCT QUICK VIEW MODAL */}
      {quickViewProduct && (
        <ProductDetailModal
          product={quickViewProduct}
          isOpen={Boolean(quickViewProduct)}
          onClose={() => setQuickViewProduct(null)}
          cartQty={quickViewProduct ? cart[quickViewProduct?.id]?.quantity || 0 : 0}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          isWishlisted={quickViewProduct ? Boolean(wishlist[quickViewProduct?.id]) : false}
          onToggleWishlist={handleToggleWishlist}
          onShowToast={(t) => setToast(t)}
          allProducts={products}
        />
      )}

      {/* WISHLIST DRAWER */}
      <WishlistDrawer
        isOpen={wishlistDrawerOpen}
        onClose={() => setWishlistDrawerOpen(false)}
        wishlist={wishlist}
        onRemoveFromWishlist={handleRemoveFromWishlist}
        onClearWishlist={handleClearWishlist}
        onAddToCart={handleAddToCart}
        onShowToast={(t) => setToast(t)}
      />

      {/* ORDER HISTORY & REORDER MODAL */}
      <OrderHistoryModal
        isOpen={orderHistoryModalOpen}
        onClose={() => setOrderHistoryModalOpen(false)}
        onReorder={handleReorder}
        onTrackOrder={(order) => {
          setTargetTrackerOrder(order);
          setOrderTrackerOpen(true);
        }}
        onShowToast={(t) => setToast(t)}
      />

      {/* CART DRAWER */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onAddToCart={handleAddToCart}
        shopSettings={shopSettings}
        appliedCoupon={appliedCoupon}
        setAppliedCoupon={setAppliedCoupon}
        allProducts={products}
        onShowToast={(t) => setToast(t)}
        onProceedCheckout={() => {
          setCartDrawerOpen(false);
          setCheckoutModalOpen(true);
        }}
      />

      {/* CHECKOUT MODAL */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        cart={cart}
        user={user}
        onUserVerified={handleUserVerified}
        shopSettings={shopSettings}
        appliedCoupon={appliedCoupon}
        onShowToast={(t) => setToast(t)}
        onOrderPlacedSuccess={(order) => {
          setCheckoutModalOpen(false);
          setCart({});
          setAppliedCoupon(null);
          setOrderPlacedSuccess(order);
        }}
      />

      {/* STANDALONE SINGLE UNIFIED AUTH MODAL (ADMIN & USER) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleUserVerified}
        onAdminLoginSuccess={handleAdminLoginSuccess}
        initialTab={authInitialTab}
      />

      {/* GOOGLE PASSWORDLESS GMAIL AUTH MODAL */}
      <GoogleAuthModal
        isOpen={googleAuthModalOpen}
        onClose={() => setGoogleAuthModalOpen(false)}
        onLoginSuccess={handleUserVerified}
        onShowToast={(t) => setToast(t)}
      />

      {/* USER ORDER TRACKER MODAL */}
      <OrderTrackerModal
        isOpen={orderTrackerOpen}
        onClose={() => {
          setOrderTrackerOpen(false);
          setTargetTrackerOrder(null);
        }}
        initialPhone={user?.phone || ''}
        targetOrder={targetTrackerOrder}
      />

      {/* LOCATION ELIGIBILITY CHECKER MODAL */}
      {eligibilityModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 dark:border-slate-800 p-5 sm:p-6 animate-in zoom-in-95 duration-200 text-slate-900 dark:text-white transition-colors">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Check Delivery Eligibility (≤ 5km)
                </h3>
              </div>
              <button
                onClick={() => setEligibilityModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Click "Use My GPS Location" or tap anywhere on the map to verify if your home is within Yashi General Store's 5 km delivery perimeter.
            </p>

            <LocationPicker
              shopLat={shopSettings?.latitude || 26.4519124}
              shopLon={shopSettings?.longitude || 80.3537057}
              maxRadiusKm={shopSettings?.maxDeliveryRadiusKm || 5}
            />

            <div className="mt-5 text-right">
              <button
                onClick={() => setEligibilityModalOpen(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER PLACED SUCCESS MODAL */}
      {orderPlacedSuccess && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 dark:border-slate-800 p-6 text-center animate-in zoom-in-95 duration-200 text-slate-900 dark:text-white transition-colors">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Delivery Request Dispatched!
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Your request has been received by <strong>Yashi General Store</strong>.
            </p>

            <div className="bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl p-4 my-4 text-left border border-emerald-100 dark:border-emerald-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Order ID:</span>
                <span className="font-black text-emerald-950">{orderPlacedSuccess?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Customer:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{orderPlacedSuccess?.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Mobile:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">+91 {orderPlacedSuccess?.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Distance from Shop:</span>
                <span className="font-bold text-emerald-700">
                  {orderPlacedSuccess?.distanceKm || '≤ 5.0'} km (Verified ≤ 5km)
                </span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1.5 border-t border-emerald-200 dark:border-emerald-800">
                <span>Total Amount:</span>
                <span className="text-emerald-700 font-black text-sm">₹{orderPlacedSuccess?.totalAmount}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  const ord = orderPlacedSuccess;
                  setOrderPlacedSuccess(null);
                  setTargetTrackerOrder(ord);
                  setOrderTrackerOpen(true);
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition active:scale-98"
              >
                Track Live Order Status
              </button>
              <button
                onClick={() => setOrderPlacedSuccess(null)}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}


      {/* MOBILE BOTTOM FLOATING NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-2xl transition-colors">
        <button
          onClick={() => {
            setSelectedCategory('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px]"
        >
          <Store className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setWishlistDrawerOpen(true)}
          className="relative flex flex-col items-center justify-center text-slate-600 dark:text-slate-400 hover:text-rose-600 font-extrabold text-[10px]"
        >
          <Heart className="w-5 h-5 mb-0.5" />
          <span>Wishlist</span>
          {wishlistCount > 0 && (
            <span className="absolute -top-1 right-2 bg-rose-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-slate-900">
              {wishlistCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setTargetTrackerOrder(null);
            setOrderTrackerOpen(true);
          }}
          className="flex flex-col items-center justify-center text-slate-600 dark:text-slate-400 hover:text-emerald-600 font-extrabold text-[10px]"
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span>Track</span>
        </button>

        {adminUser && (
          <button
            onClick={handleOpenAdmin}
            className="flex flex-col items-center justify-center text-purple-700 dark:text-purple-400 hover:text-purple-600 font-extrabold text-[10px]"
          >
            <ShieldCheck className="w-5 h-5 mb-0.5" />
            <span>Admin</span>
          </button>
        )}

        <button
          onClick={() => setCartDrawerOpen(true)}
          className="relative flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-xl font-black text-xs shadow-md shadow-emerald-600/30 active:scale-95"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>₹{cartTotal}</span>
          {cartCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-yellow-400 text-slate-950 text-[10px] flex items-center justify-center font-black">
              {cartCount}
            </span>
          )}
        </button>
      </nav>

    </div>
  );
}
