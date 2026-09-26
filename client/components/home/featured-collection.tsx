'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { getAllProducts, getProductsByCollection } from '../../lib/products';
import { ProductCard } from '../product/product-card';

export function FeaturedCollection() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const allProducts = getAllProducts();

  // Filter products dynamically based on tab selection
  let filteredProducts = allProducts;
  if (activeTab === 'all' || activeTab === 'bestseller') {
    filteredProducts = allProducts;
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

  const categoryCircles = [
    {
      id: 'all',
      label: 'ALL PRODUCTS',
      image: '/Discover product.png',
    },
    {
      id: 'kunafa-pistachio',
      label: 'KUNAFA PISTACHIO',
      image: '/Kunafa Pistachio Dark Chocolate 1.png',
    },
    {
      id: 'dark-chocolate',
      label: 'DARK CHOCOLATE',
      image: '/Kunafa Pistachio Dark Chocolate 2.png',
    },
    {
      id: 'milk-chocolate',
      label: 'MILK CHOCOLATE',
      image: '/Hazelnut Creme Milk Chocolate 1.png',
    },
    {
      id: 'speculoos',
      label: 'SPECULOOS',
      image: '/Speculoos Creme and Kunafa 1.png',
    },
    {
      id: 'lebubu',
      label: 'LEBUBU',
      image: '/Le Bubu 1.png',
    },
    {
      id: 'mini-bar',
      label: 'MINI BAR',
      image: '/Kunafa Pistachio Dark Chocolate – Mini Bar 35gm 1.png',
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-white border-t border-stone-200 relative overflow-hidden">
      <div className="max-w-[1480px] w-full mx-auto px-4 sm:px-6 lg:px-12 space-y-8">
        
        {/* Section Header */}
        <div className="relative flex flex-col items-center justify-center border-b border-stone-200 pb-6">
          <h2 className="font-serif text-3xl sm:text-5xl text-[#1A1817] font-bold tracking-tight text-center">
            Best Sellers & Trending
          </h2>

          <div className="mt-4 sm:mt-0 sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2">
            <Link href="/shop">
              <button className="px-5 py-2.5 bg-[#1A1817] hover:bg-[#CB9700] text-white text-xs font-sans uppercase font-extrabold tracking-widest transition-colors flex items-center gap-1.5 shadow-md cursor-pointer rounded-sm">
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>

        {/* 1. Circular Category Bubbles Row (Matching User's Reference Image 1) */}
        <div className="py-2">
          <div className="flex items-center justify-start md:justify-center gap-5 sm:gap-8 overflow-x-auto no-scrollbar pb-4 pt-2 px-2 snap-x">
            {categoryCircles.map((cat) => {
              const isActive = activeTab === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className="group flex flex-col items-center shrink-0 snap-center cursor-pointer transition-all focus:outline-none"
                >
                  <div
                    className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 rounded-full overflow-hidden border-2 transition-all duration-300 shadow-sm ${
                      isActive
                        ? 'border-[#1A1817] ring-4 ring-[#1A1817]/15 scale-105'
                        : 'border-stone-200/90 group-hover:border-[#CB9700] group-hover:scale-105'
                    }`}
                  >
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <span
                    className={`mt-2.5 text-[11px] sm:text-xs font-sans font-bold tracking-wider uppercase transition-colors text-center max-w-[100px] leading-tight ${
                      isActive ? 'text-[#1A1817] font-extrabold' : 'text-[#5C4538] group-hover:text-[#1A1817]'
                    }`}
                  >
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Animated Product Grid (2 Columns on Mobile, 3 on Tablet, 4 on Desktop) */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6 md:gap-8 pt-4"
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

        {/* View All Button Footer (After All 12 Products) */}
        <div className="text-center pt-6 flex justify-center">
          <Link href="/shop" className="w-full max-w-xs sm:max-w-md">
            <button className="w-full py-3.5 px-8 rounded-full bg-[#703019] hover:bg-[#1A1817] active:bg-[#1A1817] text-white text-xs font-sans font-bold uppercase tracking-[0.2em] shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <span>VIEW ALL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

      </div>
    </section>
  );
}
