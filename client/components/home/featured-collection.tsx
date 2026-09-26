'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { getAllProducts, getProductsByCollection } from '../../lib/products';
import { ProductCard } from '../product/product-card';

export function FeaturedCollection() {
  const [activeTab, setActiveTab] = useState<string>('bestseller');
  const allProducts = getAllProducts();

  const tabs = [
    { id: 'bestseller', label: 'Best Sellers' },
    { id: 'trending', label: 'Trending' },
    { id: 'kunafa-pistachio', label: 'Kunafa Pistachio' },
    { id: 'dark-chocolate', label: 'Dark Chocolate' },
    { id: 'milk-chocolate', label: 'Milk Chocolate' },
    { id: 'speculoos', label: 'Speculoos' },
    { id: 'lebubu', label: 'Lebubu' },
    { id: 'mini-bar', label: 'Mini Bar' },
  ];

  // Filter products dynamically based on tab selection
  let filteredProducts = allProducts;
  if (activeTab === 'bestseller') {
    filteredProducts = allProducts.filter((p) => p.isBestSeller);
  } else if (activeTab === 'trending') {
    filteredProducts = allProducts.filter((p) => p.isFeatured || p.isNewRelease);
  } else if (activeTab === 'kunafa-pistachio') {
    filteredProducts = allProducts.filter((p) => p.slug.includes('kunafa') || p.slug.includes('pistachio'));
  } else if (activeTab === 'dark-chocolate') {
    filteredProducts = allProducts.filter((p) => p.categorySlug === 'dark-chocolate' || p.name.toLowerCase().includes('dark'));
  } else if (activeTab === 'milk-chocolate') {
    filteredProducts = allProducts.filter((p) => p.categorySlug === 'milk-chocolate' || p.name.toLowerCase().includes('milk'));
  } else if (activeTab === 'speculoos') {
    filteredProducts = allProducts.filter((p) => p.name.toLowerCase().includes('speculoos') || p.slug.includes('speculoos'));
  } else if (activeTab === 'lebubu') {
    filteredProducts = allProducts.filter((p) => p.categorySlug === 'lebubu' || p.slug.includes('lebubu'));
  } else if (activeTab === 'mini-bar') {
    filteredProducts = allProducts.filter((p) => p.categorySlug === 'mini-chocolate-bars' || p.slug.includes('mini') || p.weight === '35gm' || p.name.toLowerCase().includes('mini'));
  } else {
    filteredProducts = getProductsByCollection(activeTab);
  }

  return (
    <section className="py-16 sm:py-20 bg-white border-t border-stone-200 relative overflow-hidden">
      <div className="max-w-[1480px] w-full mx-auto px-6 lg:px-12 space-y-8">
        
        {/* Section Header: Centered 'Best Sellers & Trending' Title + View All Button */}
        <div className="relative flex flex-col items-center justify-center border-b border-stone-200 pb-6">
          <h2 className="font-serif text-3xl sm:text-5xl text-[#1A1817] font-bold tracking-tight text-center">
            Best Sellers & Trending
          </h2>

          <div className="mt-4 sm:mt-0 sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2">
            <Link href="/shop">
              <button className="px-5 py-2.5 bg-[#1A1817] hover:bg-[#CB9700] text-white text-xs font-sans uppercase font-extrabold tracking-widest transition-colors flex items-center gap-1.5 shadow-md cursor-pointer">
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>

        {/* High-Contrast Centered Sub-Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-sans tracking-wider uppercase transition-all duration-200 rounded-lg cursor-pointer ${
                  isActive
                    ? 'bg-[#1A1817] text-white font-extrabold shadow-md border border-[#1A1817]'
                    : 'bg-[#F5F3EC] text-[#222222] hover:text-[#1A1817] hover:bg-[#EAE6D9] font-bold border border-stone-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Animated Product Grid (4 Columns) */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-8 pt-4"
          >
            {filteredProducts.map((product) => {
              let badge: string | undefined = undefined;
              if (activeTab === 'bestseller') badge = 'BEST SELLER';
              else if (activeTab === 'trending') badge = 'TRENDING';
              else if (activeTab === 'featured') badge = 'FEATURED';
              
              return (
                <ProductCard key={product.id} product={product} badgeText={badge} />
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Empty state fallback */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 bg-[#FAFAFA] rounded-md border border-stone-200">
            <p className="text-sm font-sans text-stone-600 font-medium">No products found in this selection.</p>
          </div>
        )}

        {/* View All Button Footer */}
        <div className="text-center pt-6">
          <Link href="/shop">
            <button className="px-8 py-3.5 rounded-lg bg-[#1A1817] hover:bg-[#CB9700] text-white font-sans text-xs uppercase tracking-[0.25em] font-extrabold shadow-md transition-all duration-300 inline-flex items-center space-x-2 cursor-pointer">
              <span>EXPLORE COMPLETE SHOP ({allProducts.length} ITEMS)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

      </div>
    </section>
  );
}
