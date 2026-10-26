import React from 'react';
import {
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  Check,
  Grid,
  List,
  Tag,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export default function SortFilterToolbar({
  sortBy,
  setSortBy,
  filterVegOnly,
  setFilterVegOnly,
  filterDealsOnly,
  setFilterDealsOnly,
  filterInStockOnly,
  setFilterInStockOnly,
  selectedPriceRange,
  setSelectedPriceRange,
  selectedBrand,
  setSelectedBrand,
  availableBrands = [],
  viewMode,
  setViewMode,
  totalResults = 0,
  onResetFilters
}) {
  const priceRanges = [
    { id: 'all', label: 'All Prices' },
    { id: 'under-50', label: 'Under ₹50' },
    { id: '50-150', label: '₹50 - ₹150' },
    { id: '150-300', label: '₹150 - ₹300' },
    { id: '300-plus', label: '₹300+' }
  ];

  const hasActiveFilters =
    filterVegOnly ||
    filterDealsOnly ||
    filterInStockOnly ||
    selectedPriceRange !== 'all' ||
    selectedBrand !== 'all' ||
    sortBy !== 'featured';

  const getMobileFilterValue = () => {
    if (filterVegOnly) return 'veg';
    if (filterDealsOnly) return 'deals';
    if (filterInStockOnly) return 'instock';
    if (selectedPriceRange !== 'all') return `price:${selectedPriceRange}`;
    if (selectedBrand !== 'all') return `brand:${selectedBrand}`;
    return 'all';
  };

  const handleMobileFilterChange = (val) => {
    if (val === 'all') {
      setFilterVegOnly(false);
      setFilterDealsOnly(false);
      setFilterInStockOnly(false);
      setSelectedPriceRange('all');
      setSelectedBrand('all');
    } else if (val === 'veg') {
      setFilterVegOnly(!filterVegOnly);
    } else if (val === 'deals') {
      setFilterDealsOnly(!filterDealsOnly);
    } else if (val === 'instock') {
      setFilterInStockOnly(!filterInStockOnly);
    } else if (val.startsWith('price:')) {
      setSelectedPriceRange(val.replace('price:', ''));
    } else if (val.startsWith('brand:')) {
      setSelectedBrand(val.replace('brand:', ''));
    }
  };

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 shadow-sm mb-6 transition-colors duration-200 w-full max-w-full overflow-hidden">
      
      {/* MOBILE LAYOUT: Clean Menu & Select Formats (Replaces Cluttered Horizontal Slide Menu) */}
      <div className="sm:hidden space-y-2.5">
        {/* Mobile Top Row: Product Counter & Grid/List View Switch */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{totalResults} Products</span>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-1 rounded-xl border border-rose-200 dark:border-rose-800 transition"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Mobile View Switcher (Grid vs List) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menus: Sort & Filter Selectors */}
        <div className="grid grid-cols-2 gap-2">
          {/* Sort Menu Dropdown */}
          <div className="relative">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5 px-0.5">
              Sort By
            </label>
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full text-xs font-bold bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer truncate"
              >
                <option value="featured" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Featured / Best Sellers</option>
                <option value="price-asc" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Price: Low to High</option>
                <option value="price-desc" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Price: High to Low</option>
                <option value="rating" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Highest Rated</option>
                <option value="discount" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Biggest Discount</option>
                <option value="name" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Product Name (A - Z)</option>
              </select>
            </div>
          </div>

          {/* Filter Menu Dropdown */}
          <div className="relative">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5 px-0.5">
              Filter By
            </label>
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
              <select
                value={getMobileFilterValue()}
                onChange={(e) => handleMobileFilterChange(e.target.value)}
                className="w-full text-xs font-bold bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer truncate"
              >
                <option value="all" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">All Products</option>
                <option value="veg" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Pure Veg Only</option>
                <option value="deals" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Hot Deals (≥15% Off)</option>
                <option value="instock" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">In Stock Only</option>
                <optgroup label="Price Ranges" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                  <option value="price:under-50">Under ₹50</option>
                  <option value="price:50-150">₹50 - ₹150</option>
                  <option value="price:150-300">₹150 - ₹300</option>
                  <option value="price:300-plus">₹300+</option>
                </optgroup>
                {availableBrands.length > 0 && (
                  <optgroup label="Brands" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    {availableBrands.map((b) => (
                      <option key={b} value={`brand:${b}`}>{b}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Tags on Mobile (Clean List/Wrap, No Slide) */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
            {filterVegOnly && (
              <span
                onClick={() => setFilterVegOnly(false)}
                className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-lg cursor-pointer"
              >
                <span>Pure Veg</span>
                <span className="text-xs">✕</span>
              </span>
            )}
            {filterDealsOnly && (
              <span
                onClick={() => setFilterDealsOnly(false)}
                className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-lg cursor-pointer"
              >
                <span>🔥 Hot Deals</span>
                <span className="text-xs">✕</span>
              </span>
            )}
            {filterInStockOnly && (
              <span
                onClick={() => setFilterInStockOnly(false)}
                className="inline-flex items-center gap-1 text-[11px] font-bold bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-lg cursor-pointer"
              >
                <span>In Stock</span>
                <span className="text-xs">✕</span>
              </span>
            )}
            {selectedPriceRange !== 'all' && (
              <span
                onClick={() => setSelectedPriceRange('all')}
                className="inline-flex items-center gap-1 text-[11px] font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-lg cursor-pointer"
              >
                <span>Price: {priceRanges.find(p => p.id === selectedPriceRange)?.label}</span>
                <span className="text-xs">✕</span>
              </span>
            )}
            {selectedBrand !== 'all' && (
              <span
                onClick={() => setSelectedBrand('all')}
                className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-lg cursor-pointer"
              >
                <span>Brand: {selectedBrand}</span>
                <span className="text-xs">✕</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* DESKTOP LAYOUT (Unchanged for Larger Screens) */}
      <div className="hidden sm:block space-y-3">
        {/* Top Row: Count + Sort Dropdown + View Mode */}
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 w-full">
          {/* Results Counter & Active indicators */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] sm:text-xs font-black shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{totalResults} Products</span>
            </div>

            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 px-2 py-1 rounded-xl border border-rose-200 dark:border-rose-800 transition shrink-0"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Controls: Sort Dropdown & View Mode */}
          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0 max-w-full">
            {/* Brand Filter Dropdown */}
            {availableBrands.length > 0 && (
              <div className="relative">
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="text-[11px] sm:text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer max-w-[110px] sm:max-w-none"
                >
                  <option value="all">All Brands</option>
                  {availableBrands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort By Dropdown */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 sm:px-2.5 py-1">
              <ArrowUpDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-[11px] sm:text-xs font-bold bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1 max-w-[125px] sm:max-w-none"
              >
                <option value="featured">Featured / Best Sellers</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="discount">Biggest Discount</option>
                <option value="name">Product Name (A - Z)</option>
              </select>
            </div>

            {/* View Mode Toggle (Grid vs List) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row: Quick Filter Chips (Veg, Flash Deals, In Stock, Price Range) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth pt-1 pb-0.5 w-full">
          {/* Pure Veg Pill */}
          <button
            onClick={() => setFilterVegOnly(!filterVegOnly)}
            className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-extrabold transition active:scale-95 border ${
              filterVegOnly
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full border border-current flex items-center justify-center p-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            </span>
            <span>Pure Veg</span>
            {filterVegOnly && <Check className="w-3 h-3 ml-0.5" />}
          </button>

          {/* Hot Deals Only Pill */}
          <button
            onClick={() => setFilterDealsOnly(!filterDealsOnly)}
            className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-extrabold transition active:scale-95 border ${
              filterDealsOnly
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-300'
            }`}
          >
            <Tag className="w-3 h-3 text-amber-500 group-hover:text-amber-600" />
            <span>🔥 Hot Deals (≥15% Off)</span>
            {filterDealsOnly && <Check className="w-3 h-3 ml-0.5" />}
          </button>

          {/* In Stock Only Pill */}
          <button
            onClick={() => setFilterInStockOnly(!filterInStockOnly)}
            className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-extrabold transition active:scale-95 border ${
              filterInStockOnly
                ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-300'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>In Stock Only</span>
            {filterInStockOnly && <Check className="w-3 h-3 ml-0.5" />}
          </button>

          {/* Price Range Pills */}
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 shrink-0 mx-0.5" />

          {priceRanges.map((range) => {
            const isSelected = selectedPriceRange === range.id;
            return (
              <button
                key={range.id}
                onClick={() => setSelectedPriceRange(range.id)}
                className={`shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold transition active:scale-95 border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
