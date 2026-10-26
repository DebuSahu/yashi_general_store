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

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 shadow-sm mb-6 space-y-3 transition-colors duration-200 w-full max-w-full overflow-hidden">
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
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
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
  );
}
