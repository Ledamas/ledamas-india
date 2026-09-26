'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, Collection } from '../../lib/types';
import { ProductCard } from '../product/product-card';
import { SlidersHorizontal, ChevronDown, X, Check, RotateCcw, Search } from 'lucide-react';

interface ShopClientProps {
  products: Product[];
  collections: Collection[];
  isTrendingView?: boolean;
}

type SortOption =
  | 'newest'
  | 'recommended'
  | 'popularity'
  | 'price-low-high'
  | 'price-high-low'
  | 'rating'
  | 'discount';

export function ShopClient({ products, collections, isTrendingView = false }: ShopClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlSearchQuery = searchParams ? searchParams.get('search') || searchParams.get('q') || '' : '';

  // Search state synced with URL
  const [searchTerm, setSearchTerm] = useState<string>(urlSearchQuery);

  useEffect(() => {
    setSearchTerm(urlSearchQuery);
  }, [urlSearchQuery]);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedWeight, setSelectedWeight] = useState<string>('all');
  const [pricePreset, setPricePreset] = useState<string>('all');
  const [maxPriceRange, setMaxPriceRange] = useState<number>(2500);

  // Sorting State
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);

  // Filter Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Collapsible Accordion States in Drawer
  const [openSections, setOpenSections] = useState<{
    category: boolean;
    price: boolean;
    weight: boolean;
  }>({
    category: true,
    price: true,
    weight: true,
  });

  const toggleSection = (section: 'category' | 'price' | 'weight') => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const sortOptionsList: { label: string; value: SortOption }[] = [
    { label: 'RECOMMENDED', value: 'recommended' },
    { label: 'POPULARITY', value: 'popularity' },
    { label: 'PRICE: LOW TO HIGH', value: 'price-low-high' },
    { label: 'PRICE: HIGH TO LOW', value: 'price-high-low' },
    { label: 'CUSTOMER RATING', value: 'rating' },
    { label: 'NEWEST FIRST', value: 'newest' },
    { label: 'DISCOUNT %', value: 'discount' },
  ];

  // Filtering & Sorting Logic
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      if (isTrendingView && !p.isBestSeller && !p.isFeatured && !p.isNewRelease) {
        return false;
      }

      // Search match
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const searchMatch =
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.slug.toLowerCase().includes(query);
        if (!searchMatch) return false;
      }

      // Category match
      const categoryMatch =
        selectedCategory === 'all' ||
        p.categorySlug === selectedCategory ||
        p.slug.includes(selectedCategory);

      // Weight match
      const weightMatch = selectedWeight === 'all' || p.weight === selectedWeight;

      // Price preset match
      let priceMatch = p.price <= maxPriceRange;
      if (pricePreset === 'under-500') priceMatch = p.price <= 500;
      else if (pricePreset === '500-1000') priceMatch = p.price >= 500 && p.price <= 1000;
      else if (pricePreset === '1000-1500') priceMatch = p.price >= 1000 && p.price <= 1500;
      else if (pricePreset === 'over-1500') priceMatch = p.price > 1500;

      return categoryMatch && weightMatch && priceMatch;
    });

    // Apply Sorting
    return result.sort((a, b) => {
      if (sortOption === 'price-low-high') return a.price - b.price;
      if (sortOption === 'price-high-low') return b.price - a.price;
      if (sortOption === 'popularity') return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      if (sortOption === 'discount') {
        const discA = a.compareAtPrice ? a.compareAtPrice - a.price : 0;
        const discB = b.compareAtPrice ? b.compareAtPrice - b.price : 0;
        return discB - discA;
      }
      if (sortOption === 'rating') return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      // Newest first default
      return 0;
    });
  }, [products, isTrendingView, selectedCategory, selectedWeight, pricePreset, maxPriceRange, sortOption]);

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSelectedWeight('all');
    setPricePreset('all');
    setMaxPriceRange(2500);
    setSortOption('newest');
  };

  return (
    <main className="flex-1 pt-44 sm:pt-48 md:pt-52 pb-20 bg-white">
      <div className="max-w-[1480px] w-full mx-auto px-6 lg:px-12 space-y-8">

        {/* Top Hero Banner (Clean Centered Heading - High Contrast & Sharp Legibility) */}
        <div className="relative rounded-2xl bg-[#FAF6F0] border border-[#E5DDD0] p-8 sm:p-12 overflow-hidden shadow-xs">
          <div className="text-center max-w-3xl mx-auto space-y-3 py-2 sm:py-4">
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#1A1817] font-medium tracking-tight">
              Discover Our Collection
            </h1>
            <p className="font-sans text-sm sm:text-base text-[#3D3731] font-normal leading-relaxed max-w-2xl mx-auto">
              Explore masterfully crafted Dubai chocolates for every occasion. From timeless classics to modern statements.
            </p>
          </div>
        </div>

        {/* Sticky Utility Toolbar Row (SORT BY Dropdown | Product Count | FILTERS Button) */}
        <div className="sticky top-[84px] sm:top-[96px] z-30 bg-white border-y border-stone-300 py-4 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          
          {/* Left: SORT BY Dropdown + Item Count */}
          <div className="flex items-center space-x-6 relative">
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center space-x-2 text-xs font-sans uppercase tracking-wider text-[#1A1817] hover:text-[#CB9700] transition-colors cursor-pointer"
              >
                <span className="text-[#1A1817] font-extrabold">SORT BY</span>
                <span className="text-[#1A1817] font-black underline decoration-[#CB9700] underline-offset-4">
                  {sortOptionsList.find((s) => s.value === sortOption)?.label}
                </span>
                <ChevronDown className={`w-4 h-4 text-[#1A1817] transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Sort Dropdown Popup */}
              <AnimatePresence>
                {isSortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute left-0 top-full mt-2 w-60 bg-white border border-stone-300 shadow-2xl rounded-md py-2 z-50 text-xs font-sans uppercase tracking-wider"
                  >
                    {sortOptionsList.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortOption(opt.value);
                          setIsSortOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-[#FAF6ED] transition-colors ${
                          sortOption === opt.value ? 'text-[#CB9700] font-bold bg-[#FAF6ED]' : 'text-[#1A1817] font-medium'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {sortOption === opt.value && <Check className="w-4 h-4 text-[#CB9700]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span className="text-xs font-sans text-[#1A1817] font-extrabold tracking-wider uppercase border-l-2 border-stone-300 pl-6 hidden sm:inline-block">
              {filteredProducts.length} PRODUCTS
            </span>
          </div>

          {/* Center Heading (Hidden on mobile) */}
          <div className="hidden lg:block text-center">
            <span className="font-serif text-xl sm:text-2xl text-[#1A1817] font-medium tracking-tight">
              Discover Our Collection
            </span>
          </div>

          {/* Right: FILTERS Drawer Button */}
          <div>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="px-6 py-2.5 border-2 border-[#1A1817] hover:bg-[#1A1817] hover:text-white text-[#1A1817] text-xs font-sans uppercase font-extrabold tracking-[0.15em] transition-all duration-300 flex items-center space-x-2 rounded-xs shadow-xs cursor-pointer"
            >
              <span>FILTERS</span>
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Main Product Grid Showcase */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 pt-2">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#FAFAFA] border border-stone-200 rounded-xl space-y-4">
            <p className="text-sm text-stone-600 font-sans">
              No chocolates found matching the selected filters.
            </p>
            <button
              onClick={resetAllFilters}
              className="px-6 py-2.5 bg-[#CB9700] text-white text-xs font-sans uppercase font-bold tracking-wider rounded-md shadow-sm hover:bg-[#3D2314] transition-colors inline-flex items-center space-x-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}

      </div>

      {/* Slide-Over Right Side Drawer (CarbonSmith Filters Drawer matching Screenshot 2) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs"
            />

            {/* Right Drawer Modal */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col justify-between"
            >
              {/* Drawer Top Bar */}
              <div className="p-6 border-b border-stone-200 flex items-center justify-between">
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 text-stone-500 hover:text-stone-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="font-serif text-2xl text-stone-900 font-normal">Filters</h3>
                <div className="w-5" />
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-sans text-stone-800">
                
                {/* 1. Category Collapsible Section */}
                <div className="border-b border-stone-200 pb-5">
                  <button
                    onClick={() => toggleSection('category')}
                    className="w-full flex items-center justify-between text-sm font-sans font-bold uppercase tracking-wider text-stone-900 py-1"
                  >
                    <span>Category</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${openSections.category ? 'rotate-180' : ''}`} />
                  </button>

                  {openSections.category && (
                    <div className="pt-4 space-y-2">
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className={`w-full text-left px-3 py-2 rounded text-xs transition-colors flex items-center justify-between ${
                          selectedCategory === 'all' ? 'bg-[#FAF6ED] text-[#CB9700] font-bold' : 'hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <span>All Categories</span>
                        {selectedCategory === 'all' && <Check className="w-3.5 h-3.5" />}
                      </button>

                      {collections.map((col) => {
                        const isActive = selectedCategory === col.slug;
                        return (
                          <button
                            key={col.id}
                            onClick={() => setSelectedCategory(col.slug)}
                            className={`w-full text-left px-3 py-2 rounded text-xs transition-colors flex items-center justify-between ${
                              isActive ? 'bg-[#FAF6ED] text-[#CB9700] font-bold' : 'hover:bg-stone-50 text-stone-700'
                            }`}
                          >
                            <span>{col.name}</span>
                            {isActive && <Check className="w-3.5 h-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Price Range Collapsible Section */}
                <div className="border-b border-stone-200 pb-5">
                  <button
                    onClick={() => toggleSection('price')}
                    className="w-full flex items-center justify-between text-sm font-sans font-bold uppercase tracking-wider text-stone-900 py-1"
                  >
                    <span>Price Range</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${openSections.price ? 'rotate-180' : ''}`} />
                  </button>

                  {openSections.price && (
                    <div className="pt-4 space-y-4">
                      {/* Price Range Indicators */}
                      <div className="flex items-center justify-between text-stone-500 font-medium">
                        <span>Min: ₹0</span>
                        <span>Max: ₹{maxPriceRange}</span>
                      </div>

                      <input
                        type="range"
                        min="400"
                        max="2500"
                        step="50"
                        value={maxPriceRange}
                        onChange={(e) => {
                          setMaxPriceRange(Number(e.target.value));
                          setPricePreset('all');
                        }}
                        className="w-full accent-[#CB9700] cursor-pointer"
                      />

                      {/* Quick Price Range Pill Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <button
                          onClick={() => setPricePreset(pricePreset === 'under-500' ? 'all' : 'under-500')}
                          className={`py-2 px-3 border text-[11px] font-sans font-medium rounded transition-all ${
                            pricePreset === 'under-500'
                              ? 'border-[#CB9700] bg-[#FAF6ED] text-[#CB9700] font-bold'
                              : 'border-stone-200 text-stone-700 hover:border-stone-400'
                          }`}
                        >
                          Under ₹500
                        </button>

                        <button
                          onClick={() => setPricePreset(pricePreset === '500-1000' ? 'all' : '500-1000')}
                          className={`py-2 px-3 border text-[11px] font-sans font-medium rounded transition-all ${
                            pricePreset === '500-1000'
                              ? 'border-[#CB9700] bg-[#FAF6ED] text-[#CB9700] font-bold'
                              : 'border-stone-200 text-stone-700 hover:border-stone-400'
                          }`}
                        >
                          ₹500 - ₹1,000
                        </button>

                        <button
                          onClick={() => setPricePreset(pricePreset === '1000-1500' ? 'all' : '1000-1500')}
                          className={`py-2 px-3 border text-[11px] font-sans font-medium rounded transition-all ${
                            pricePreset === '1000-1500'
                              ? 'border-[#CB9700] bg-[#FAF6ED] text-[#CB9700] font-bold'
                              : 'border-stone-200 text-stone-700 hover:border-stone-400'
                          }`}
                        >
                          ₹1,000 - ₹1,500
                        </button>

                        <button
                          onClick={() => setPricePreset(pricePreset === 'over-1500' ? 'all' : 'over-1500')}
                          className={`py-2 px-3 border text-[11px] font-sans font-medium rounded transition-all ${
                            pricePreset === 'over-1500'
                              ? 'border-[#CB9700] bg-[#FAF6ED] text-[#CB9700] font-bold'
                              : 'border-stone-200 text-stone-700 hover:border-stone-400'
                          }`}
                        >
                          Over ₹1,500
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Weight Collapsible Section */}
                <div className="border-b border-stone-200 pb-5">
                  <button
                    onClick={() => toggleSection('weight')}
                    className="w-full flex items-center justify-between text-sm font-sans font-bold uppercase tracking-wider text-stone-900 py-1"
                  >
                    <span>Weight / Format</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${openSections.weight ? 'rotate-180' : ''}`} />
                  </button>

                  {openSections.weight && (
                    <div className="pt-4 space-y-2">
                      {[
                        { label: 'All Weights', value: 'all' },
                        { label: '200g', value: '200gm' },
                        { label: '110g', value: '110gm' },
                        { label: '35g', value: '35gm' },
                        { label: '25g', value: '25gm' },
                      ].map((opt) => {
                        const isActive = selectedWeight === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => setSelectedWeight(opt.value)}
                            className={`w-full text-left px-3 py-2 rounded text-xs transition-colors flex items-center justify-between ${
                              isActive ? 'bg-[#FAF6ED] text-[#CB9700] font-bold' : 'hover:bg-stone-50 text-stone-700'
                            }`}
                          >
                            <span>{opt.label}</span>
                            {isActive && <Check className="w-3.5 h-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* Drawer Bottom Sticky Action Bar (CLEAR ALL | VIEW ALL) */}
              <div className="p-6 border-t border-stone-200 grid grid-cols-2 gap-4 bg-white">
                <button
                  onClick={resetAllFilters}
                  className="py-3.5 border border-stone-300 hover:border-stone-800 text-stone-800 text-xs uppercase font-bold tracking-widest transition-colors"
                >
                  CLEAR ALL
                </button>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="py-3.5 bg-stone-900 hover:bg-[#CB9700] text-white text-xs uppercase font-bold tracking-widest transition-colors"
                >
                  VIEW ALL ({filteredProducts.length})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </main>
  );
}
