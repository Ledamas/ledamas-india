'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { getAllProducts } from '../../lib/products';
import { ProductCard } from '../product/product-card';
import { Product } from '../../lib/types';

interface CategoryTab {
  id: string;
  name: string;
  slug: string;
  filterFn: (p: Product) => boolean;
}

export function CategoryExploreSection() {
  const allProducts = getAllProducts();

  const categories: CategoryTab[] = [
    {
      id: 'kunafa-pistachio',
      name: 'Kunafa Pistachio',
      slug: 'kunafa-chocolate',
      filterFn: (p) => p.slug.includes('kunafa') || p.slug.includes('pistachio') || p.categorySlug === 'kunafa-chocolate',
    },
    {
      id: 'dark-chocolate',
      name: 'Dark Chocolate',
      slug: 'dark-chocolate',
      filterFn: (p) => p.categorySlug === 'dark-chocolate' || p.slug.includes('dark'),
    },
    {
      id: 'milk-chocolate',
      name: 'Milk Chocolate',
      slug: 'milk-chocolate',
      filterFn: (p) => p.categorySlug === 'milk-chocolate' || p.name.toLowerCase().includes('milk'),
    },
    {
      id: 'speculoos',
      name: 'Speculoos',
      slug: 'speculoos-chocolate',
      filterFn: (p) => p.name.toLowerCase().includes('speculoos') || p.slug.includes('speculoos'),
    },
    {
      id: 'mini-bars',
      name: 'Mini Bars',
      slug: 'mini-chocolate-bars',
      filterFn: (p) => p.weight === '35gm' || p.slug.includes('mini'),
    },
    {
      id: 'lebubu',
      name: 'Lebubu',
      slug: 'lebubu',
      filterFn: (p) => p.categorySlug === 'lebubu' || p.slug.includes('lebubu'),
    },
  ];

  const [activeCategoryId, setActiveCategoryId] = useState<string>('kunafa-pistachio');

  const activeCategory = categories.find((c) => c.id === activeCategoryId) || categories[0];
  const activeProducts = allProducts.filter(activeCategory.filterFn).slice(0, 4);

  return (
    <section className="py-16 sm:py-20 bg-white border-t border-stone-100 relative overflow-hidden">
      <div className="max-w-[1480px] w-full mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Vertical Categories Sidebar (CarbonSmith Style) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="border-b border-stone-200 pb-3">
              <h3 className="text-xs font-sans font-bold tracking-[0.25em] text-stone-500 uppercase">
                CATEGORIES
              </h3>
            </div>

            <nav className="flex flex-col space-y-1">
              {categories.map((cat) => {
                const isActive = activeCategoryId === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`w-full text-left px-4 py-3 rounded-md text-sm sm:text-base transition-all duration-200 flex items-center justify-between ${
                      isActive
                        ? 'bg-[#FAF1E6] text-[#C68A4C] font-semibold shadow-2xs'
                        : 'text-stone-700 hover:text-stone-900 hover:bg-stone-50 font-normal'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {isActive && <ChevronRight className="w-4 h-4 text-[#C68A4C]" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Product Showcase Panel */}
          <div className="lg:col-span-9 lg:border-l lg:border-stone-100 lg:pl-10 space-y-6">
            {/* Category Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 pb-3 gap-2">
              <h3 className="text-xl sm:text-2xl font-serif text-stone-900 font-normal uppercase tracking-wide">
                EXPLORE {activeCategory.name}
              </h3>

              <Link
                href={`/collections/${activeCategory.slug}`}
                className="text-xs font-sans text-[#CB9700] hover:text-[#3D2314] uppercase tracking-wider font-semibold flex items-center gap-1 transition-colors"
              >
                <span>View All {activeCategory.name}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Product Cards Grid (4 Columns) */}
            <AnimatePresence mode="popLayout">
              <motion.div
                key={activeCategory.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
              >
                {activeProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Fallback if no products */}
            {activeProducts.length === 0 && (
              <div className="text-center py-12 bg-[#FAFAFA] rounded-md border border-stone-100">
                <p className="text-sm font-sans text-stone-500">No items available in this category.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
