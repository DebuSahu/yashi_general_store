import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DeliveryNoticeBanner from './components/DeliveryNoticeBanner';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import OrderTrackerModal from './components/OrderTrackerModal';
import LocationPicker from './components/LocationPicker';
import AdminDashboard from './pages/AdminDashboard';
import YGSLogo from './components/YGSLogo';
import defaultData from './defaultData.json';
import { api } from './api';
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
  ArrowRight
} from 'lucide-react';

export default function App() {
  const [isAdminView, setIsAdminView] = useState(false);
  const [products, setProducts] = useState(defaultData.products || []);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [shopSettings, setShopSettings] = useState(defaultData.settings || null);

  // Cart state
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('gs_cart');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // User auth state
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('gs_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Admin auth state
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const token = localStorage.getItem('gs_admin_token');
      const savedUser = localStorage.getItem('gs_admin_user');
      if (token && savedUser) {
        return { username: savedUser, token };
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [authInitialTab, setAuthInitialTab] = useState('user');

  // Modals
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [orderTrackerOpen, setOrderTrackerOpen] = useState(false);
  const [eligibilityModalOpen, setEligibilityModalOpen] = useState(false);
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState(null);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('gs_cart', JSON.stringify(cart));
  }, [cart]);

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

  const cartItems = Object.values(cart);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Auth operations
  const handleUserVerified = (userData, token) => {
    setUser(userData);
    localStorage.setItem('gs_user', JSON.stringify(userData));
    localStorage.setItem('gs_user_token', token);
  };

  const handleLogoutUser = () => {
    setUser(null);
    localStorage.removeItem('gs_user');
    localStorage.removeItem('gs_user_token');
  };

  const handleAdminLoginSuccess = (adminData, token) => {
    const userObj = {
      username: adminData.username || 'admin',
      name: adminData.name || adminData.username || 'Store Admin',
      role: adminData.role || 'admin',
      token
    };
    setAdminUser(userObj);
    localStorage.setItem('gs_admin_token', token);
    localStorage.setItem('gs_admin_user', userObj.username);
    setIsAdminView(true);
  };

  const handleLogoutAdmin = () => {
    setAdminUser(null);
    localStorage.removeItem('gs_admin_token');
    localStorage.removeItem('gs_admin_user');
    setIsAdminView(false);
  };

  // Admin Direct In-Stock / Out of Stock updater from Storefront
  const handleToggleProductStock = async (productId, inStock) => {
    // 1. Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updatedStock = inStock ? (p.stock > 0 ? p.stock : 25) : 0;
          return { ...p, inStock, stock: updatedStock };
        }
        return p;
      })
    );

    // 2. Persist update
    try {
      const target = products.find((p) => p.id === productId);
      const updatedStock = inStock ? (target?.stock > 0 ? target.stock : 25) : 0;
      await api.updateProduct(productId, { inStock, stock: updatedStock }, adminUser?.token);
    } catch (err) {
      console.error('Failed to update product stock:', err);
    }
  };

  const handleOpenAdmin = () => {
    if (adminUser) {
      setIsAdminView(true);
    } else {
      setAuthInitialTab('admin');
      setAuthModalOpen(true);
    }
  };

  // Switch to Admin Dashboard View if requested and authenticated as admin
  if (isAdminView && adminUser) {
    return (
      <AdminDashboard
        shopSettings={shopSettings}
        onSettingsUpdated={(newSettings) => setShopSettings(newSettings)}
        onBackToStore={() => setIsAdminView(false)}
        onLogoutAdmin={handleLogoutAdmin}
      />
    );
  }

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

  const mainCategorySections = categoryPills.filter(c => c.id !== 'all');

  const displayedProducts = products.filter((p) => {
    if (selectedBrand === 'all') return true;
    return p.brand && p.brand.toLowerCase() === selectedBrand.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      
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
        onOpenCart={() => setCartDrawerOpen(true)}
        onOpenAuth={() => {
          setAuthInitialTab('user');
          setAuthModalOpen(true);
        }}
        onOpenOrders={() => setOrderTrackerOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        user={user}
        onLogoutUser={handleLogoutUser}
        adminUser={adminUser}
        onLogoutAdmin={handleLogoutAdmin}
        shopSettings={shopSettings}
      />

      {/* 3. HERO SECTION */}
      <section className="relative bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white overflow-hidden py-8 sm:py-12 lg:py-14">
        {/* Decorative background circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs font-semibold text-emerald-100">
                <Truck className="w-3.5 h-3.5 text-yellow-300" />
                <span>Superfast Local Delivery • Strictly within 5 km of Shop</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Fresh Milk, Dairy, Vegetables & Grocery Delivered to Your Doorstep.
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-emerald-100/90 max-w-xl">
                Order fresh daily <strong className="text-white">Amul & Namaste India</strong> milk, paneer, dahi, ghee, farm-fresh vegetables, flour, rice, and household provisions from{' '}
                <strong className="text-white">Yashi General Store</strong>.
              </p>

              {/* 5km Radius Highlight Badge */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <div className="bg-emerald-900/60 backdrop-blur-md border border-emerald-400/40 rounded-2xl px-4 py-2.5 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-400 text-emerald-950 flex items-center justify-center font-black text-lg">
                    5
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase text-yellow-300 tracking-wider block">
                      Delivery Perimeter
                    </span>
                    <span className="text-xs text-white/90">
                      Deliveries available only up to <strong>5km</strong> from Mirpur Cantt, Kanpur
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setEligibilityModalOpen(true)}
                  className="px-4 py-3 bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition active:scale-95 flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>Check If We Deliver To You</span>
                </button>
              </div>
            </div>

            {/* Visual Hero Feature Showcase Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 bg-emerald-950/40 group">
                <img
                  src="./images/hero_banner.jpg"
                  alt="Yashi General Store (YGS) Fresh Catalog"
                  className="w-full h-56 sm:h-72 object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4 sm:p-5 text-white">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-yellow-300 bg-emerald-900/90 border border-emerald-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-yellow-300" />
                      <span>Actual Store Showcase</span>
                    </span>
                    <span className="text-[10px] text-emerald-200 font-bold bg-white/10 px-2 py-0.5 rounded-full">
                      70+ Products
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black leading-tight text-white">
                    Fresh Farm Vegetables, Amul Dairy, Groceries & Stationery
                  </h3>
                  <p className="text-[11px] text-emerald-200 mt-0.5">
                    Order online • Strictly delivered up to 5 km from shop location
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. CATEGORY SELECTOR & FILTER TABS */}
      <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 py-2.5 sm:py-3 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto no-scrollbar scroll-smooth py-1">
            {categoryPills.map((pill) => {
              const Icon = pill.icon;
              const isActive = selectedCategory === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => {
                    setSelectedCategory(pill.id);
                    setSelectedBrand('all');
                  }}
                  className={`flex-shrink-0 inline-flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-extrabold transition active:scale-95 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200/80 hover:text-emerald-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. PRODUCT CATALOG: DEDICATED SECTIONS PER CATEGORY */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1">
        
        {/* Loading state */}
        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 lg:gap-5">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs animate-pulse space-y-3">
                <div className="aspect-square bg-gray-200 rounded-xl" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : searchTerm ? (
          /* Search Results View */
          <div>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-gray-900">
                  Search Results for "{searchTerm}"
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Found {products.length} matching product{products.length === 1 ? '' : 's'}
                </p>
              </div>
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition"
              >
                Clear Search
              </button>
            </div>

            {products.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-200 max-w-md mx-auto my-8">
                <Search className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-sm sm:text-base font-bold text-gray-800">No items match "{searchTerm}"</h3>
                <p className="text-xs text-gray-500 mt-1 mb-4">
                  Try searching for milk, paneer, ice cream, potato, atta, dal, or pens.
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 lg:gap-5">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    cartQty={cart[product.id]?.quantity || 0}
                    onAddToCart={handleAddToCart}
                    onUpdateQty={handleUpdateQty}
                    isAdmin={Boolean(adminUser)}
                    onToggleStock={handleToggleProductStock}
                  />
                ))}
              </div>
            )}
          </div>
        ) : selectedCategory === 'all' ? (
          /* ALL ITEMS: Dedicated Section for each category */
          <div className="space-y-10 sm:space-y-12">
            
            {/* Top Store Overview Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  Shop by Categories
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Browse {products.length} daily essentials available for superfast 5km delivery
                </p>
              </div>

              <div className="hidden sm:flex items-center space-x-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <Truck className="w-4 h-4" />
                <span>Delivery Radius: Max {shopSettings?.maxDeliveryRadiusKm || 5} km</span>
              </div>
            </div>

            {/* Sections for Each Category */}
            {mainCategorySections.map((section) => {
              const sectionProducts = products.filter(
                (p) => p.category.toLowerCase().replace(/[\s-_]+/g, '') === section.id.replace(/[\s-_]+/g, '')
              );
              if (sectionProducts.length === 0) return null;
              const SectionIcon = section.icon;

              return (
                <section
                  key={section.id}
                  id={`section-${section.id}`}
                  className="scroll-mt-36"
                >
                  {/* Category Section Header & AI Banner */}
                  <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-4 sm:mb-6 border border-gray-200 bg-white shadow-2xs">
                    <div className="flex flex-col md:flex-row items-stretch justify-between">
                      <div className="p-4 sm:p-5 flex-1 flex items-center justify-between gap-4">
                        <div className="flex items-center space-x-3.5">
                          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center ${section.colorClass} border shadow-xs shrink-0`}>
                            <SectionIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
                                {section.label}
                              </h2>
                              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                {sectionProducts.length} Items
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">
                              {section.description}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedCategory(section.id);
                            window.scrollTo({ top: 350, behavior: 'smooth' });
                          }}
                          className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition active:scale-95"
                        >
                          <span>View All</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* AI Category Showcase Thumbnail */}
                      {section.bannerImage && (
                        <div className="w-full md:w-56 h-28 sm:h-32 md:h-auto relative overflow-hidden shrink-0 border-t md:border-t-0 md:border-l border-gray-100 group">
                          <img
                            src={section.bannerImage}
                            alt={`${section.label} Showcase`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/50 via-transparent to-transparent flex items-end md:items-center p-2.5 text-white">
                            <span className="bg-black/60 px-2 py-0.5 rounded text-[10px] font-bold backdrop-blur-xs flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-yellow-300" />
                              <span>Showcase</span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Responsive Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 lg:gap-5">
                    {sectionProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        cartQty={cart[product.id]?.quantity || 0}
                        onAddToCart={handleAddToCart}
                        onUpdateQty={handleUpdateQty}
                        isAdmin={Boolean(adminUser)}
                        onToggleStock={handleToggleProductStock}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

          </div>
        ) : (
          /* Single Filtered Category View */
          <div>
            {(() => {
              const activeCat = categoryPills.find(c => c.id === selectedCategory) || {
                label: selectedCategory,
                description: 'Provisions for immediate delivery',
                icon: Package,
                colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200'
              };
              const ActiveIcon = activeCat.icon;

              return (
                <div>
                  {/* Category Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center ${activeCat.colorClass} border shadow-2xs`}>
                        <ActiveIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                          {activeCat.label}
                        </h2>
                        <p className="text-xs text-gray-500 font-medium">
                          {activeCat.description} • {displayedProducts.length} items available
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className="text-xs font-bold text-gray-700 hover:text-emerald-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition"
                      >
                        &larr; View All Categories
                      </button>

                      <div className="hidden sm:flex items-center space-x-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <Truck className="w-4 h-4" />
                        <span>≤ 5 km Delivery</span>
                      </div>
                    </div>
                  </div>

                  {/* Product Grid */}
                  {displayedProducts.length === 0 ? (
                    <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-200 max-w-md mx-auto my-8">
                      <Search className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-sm sm:text-base font-bold text-gray-800">No items available in this category</h3>
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
                      >
                        Back to All Categories
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 lg:gap-5">
                      {displayedProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          cartQty={cart[product.id]?.quantity || 0}
                          onAddToCart={handleAddToCart}
                          onUpdateQty={handleUpdateQty}
                          isAdmin={Boolean(adminUser)}
                          onToggleStock={handleToggleProductStock}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

      </main>

      {/* 6. FLOATING CART BAR (Mobile friendly) */}
      {cartCount > 0 && !cartDrawerOpen && (
        <div className="fixed bottom-4 inset-x-4 max-w-md mx-auto z-30">
          <div
            onClick={() => setCartDrawerOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between cursor-pointer border border-emerald-500 transition transform hover:-translate-y-0.5 active:scale-98"
          >
            <div className="flex items-center space-x-3">
              <span className="w-7 h-7 bg-white text-emerald-800 rounded-xl flex items-center justify-center font-black text-xs">
                {cartCount}
              </span>
              <div>
                <p className="text-xs font-extrabold leading-tight">
                  {cartCount} item{cartCount > 1 ? 's' : ''} in cart
                </p>
                <p className="text-[11px] text-emerald-200">
                  {cartTotal < (shopSettings?.minOrderAmount || 100)
                    ? `Add ₹${(shopSettings?.minOrderAmount || 100) - cartTotal} more for Min Order ₹100`
                    : 'Min Order Met • Strictly ≤5km Delivery'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-black">₹{cartTotal}</span>
              <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-xl flex items-center gap-1">
                View Cart & Checkout &rarr;
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 7. FOOTER */}
      <footer className="bg-gray-900 text-gray-400 text-xs py-10 border-t border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-gray-800">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <YGSLogo size="sm" />
                <span className="text-lg font-black text-white">Yashi General Store</span>
              </div>
              <p className="mt-1 text-gray-400">
                {shopSettings?.tagline || 'Daily Grocery, Farm Fresh Vegetables & Household Essentials.'}
              </p>
              <p className="text-amber-400 font-bold mt-2 flex items-center gap-1 text-[11px]">
                <Truck className="w-3.5 h-3.5" />
                <span>Notice: Delivery strictly restricted to 5 km radius of shop.</span>
              </p>
            </div>

            <div>
              <span className="text-sm font-bold text-white block mb-1">Store Address & Contact</span>
              <p className="text-gray-400 font-medium">{shopSettings?.address || '510, Elliot Lane, Near Water Tank, Mirpur Cantonment, Kanpur, Uttar Pradesh - 208004'}</p>
              <a
                href={shopSettings?.mapsUrl || "https://maps.app.goo.gl/36DwR1dGU2bfv7KD9"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold mt-1.5 text-xs transition underline"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>View on Google Maps (Directions & Location) &rarr;</span>
              </a>
              <p className="mt-1.5 font-semibold text-gray-300">Call: {shopSettings?.phone}</p>
              <p className="text-emerald-400 font-semibold mt-0.5">Admin: admin@yashigeneralstore.com</p>
            </div>

            <div>
              <span className="text-sm font-bold text-white block mb-1">Portals</span>
              <div className="space-y-2 mt-2">
                <button
                  onClick={() => {
                    setAuthInitialTab('user');
                    setAuthModalOpen(true);
                  }}
                  className="block text-emerald-400 hover:underline"
                >
                  &rarr; Customer & Store Login
                </button>
                <button
                  onClick={() => setOrderTrackerOpen(true)}
                  className="block text-emerald-400 hover:underline"
                >
                  &rarr; Track My Delivery Request
                </button>
                {adminUser && (
                  <button
                    onClick={() => setIsAdminView(true)}
                    className="block text-purple-400 hover:underline font-bold"
                  >
                    &rarr; 🛡️ Admin Management Portal
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center text-gray-500 text-[11px] gap-2">
            <p>&copy; 2026 Yashi General Store (YGS). All rights reserved.</p>
            <p>5km Delivery Restriction Enforced via Haversine Distance Calculation.</p>
          </div>
        </div>
      </footer>

      {/* CART DRAWER */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        shopSettings={shopSettings}
        onProceedCheckout={() => {
          setCartDrawerOpen(false);
          setCheckoutModalOpen(true);
        }}
      />

      {/* CHECKOUT MODAL (Phone verification + Address + Location picker + 5km check) */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        cart={cart}
        user={user}
        onUserVerified={handleUserVerified}
        shopSettings={shopSettings}
        onOrderPlacedSuccess={(order) => {
          setCheckoutModalOpen(false);
          setCart({});
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

      {/* USER ORDER TRACKER MODAL */}
      <OrderTrackerModal
        isOpen={orderTrackerOpen}
        onClose={() => setOrderTrackerOpen(false)}
        initialPhone={user?.phone || ''}
      />

      {/* LOCATION ELIGIBILITY CHECKER MODAL */}
      {eligibilityModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 p-5 sm:p-6">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-gray-900">
                  Check Delivery Eligibility (≤ 5km)
                </h3>
              </div>
              <button
                onClick={() => setEligibilityModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Click "Use My GPS Location" or tap on the map to see if your home is within Yashi General Store's 5km delivery radius.
            </p>

            <LocationPicker
              shopLat={shopSettings?.latitude || 26.4519124}
              shopLon={shopSettings?.longitude || 80.3537057}
              maxRadiusKm={shopSettings?.maxDeliveryRadiusKm || 5}
            />

            <div className="mt-5 text-right">
              <button
                onClick={() => setEligibilityModalOpen(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
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
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 p-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-black text-gray-900">
              Delivery Request Sent!
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Your request has been dispatched to <strong>Yashi General Store</strong> admin.
            </p>

            <div className="bg-emerald-50 rounded-2xl p-4 my-4 text-left border border-emerald-100 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-black text-emerald-900">{orderPlacedSuccess.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-bold text-gray-800">{orderPlacedSuccess.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mobile:</span>
                <span className="font-bold text-gray-800">+91 {orderPlacedSuccess.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Distance from Shop:</span>
                <span className="font-bold text-emerald-700">{orderPlacedSuccess.distanceKm} km (≤5km verified)</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-1.5 border-t border-emerald-200">
                <span>Total Amount:</span>
                <span className="text-emerald-700 font-black">₹{orderPlacedSuccess.totalAmount}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setOrderPlacedSuccess(null);
                  setOrderTrackerOpen(true);
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition"
              >
                Track Live Order Status
              </button>
              <button
                onClick={() => setOrderPlacedSuccess(null)}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

