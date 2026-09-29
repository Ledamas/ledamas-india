'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart } from 'lucide-react';
import { Product } from '../../lib/types';
import { useCart } from '../../lib/context/cart-context';
import { useWishlistStore } from '../wishlist/wishlist-store';

export interface ProductCardProps {
  product: Product;
  badgeText?: string;
}

export function ProductCard({ product, badgeText }: ProductCardProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const { addItem } = useCart();
  const toggleItem = useWishlistStore((state) => state.toggleItem);
  const isInWishlistRaw = useWishlistStore((state) => state.isInWishlist(product.id));

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const isInWishlist = isMounted && isInWishlistRaw;

  const primaryImage = product.images?.[0] || '/Kunafa-Pistachio-Dark-Chocolate-1.png';
  const secondaryImage = product.images?.[1] || primaryImage;
  const hasSecondaryImage = product.images && product.images.length > 1;

  const currentBadge = badgeText || (product.isBestSeller ? 'BESTSELLER' : product.isFeatured ? 'FEATURED' : null);

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col bg-white text-left cursor-pointer h-full justify-between"
    >
      <div className="flex flex-col flex-1">
        {/* Studio Image Container with Badges */}
        <div className="relative aspect-square w-full overflow-hidden bg-[#F5F3EF] rounded-xl border border-stone-200/80 shadow-2xs">
          <Link href={`/products/${product.slug}`} className="block w-full h-full relative">
            {/* Primary Studio Image */}
            <Image
              src={primaryImage}
              alt={product.imageAlt || product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover object-center transition-all duration-700 ease-out group-hover:scale-105 ${
                hasSecondaryImage ? 'group-hover:opacity-0' : ''
              }`}
            />

            {/* Secondary Hover / Lifestyle Image */}
            {hasSecondaryImage && (
              <Image
                src={secondaryImage}
                alt={`${product.name} lifestyle view`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover object-center transition-all duration-700 ease-out opacity-0 group-hover:opacity-100 group-hover:scale-105"
              />
            )}
          </Link>

          {/* Top Badges Stack (Left Column: BESTSELLER/NEW + % OFF, Right: Wishlist) */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10 pointer-events-none">
            {/* Left Badges Stacked Vertically to prevent any overlap */}
            <div className="flex flex-col gap-1 items-start pointer-events-auto max-w-[70%]">
              {currentBadge && (
                <span className="px-2 py-0.5 text-[8.5px] sm:text-[9.5px] font-sans font-extrabold uppercase tracking-wider rounded-md bg-[#141110] text-white shadow-md border border-white/10">
                  {currentBadge}
                </span>
              )}
              {discountPercent && (
                <span className="px-2 py-0.5 text-[8.5px] sm:text-[9.5px] font-sans font-extrabold uppercase tracking-wider rounded-md bg-[#C65538] text-white shadow-md">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Right Wishlist Button */}
            <div className="pointer-events-auto">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleItem({
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    image: primaryImage,
                    category: product.category,
                    inStock: product.inStock,
                  });
                }}
                className="p-1.5 text-stone-700 hover:text-stone-900 bg-white/90 hover:bg-white backdrop-blur-md rounded-full shadow-md transition-all active:scale-90 cursor-pointer"
                aria-label="Add to Wishlist"
              >
                <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'stroke-[1.6]'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Details Row (Name & Prices on Left, Circular Cart Button on Right) */}
        <div className="pt-2.5 pb-1 flex items-start justify-between gap-1.5 flex-1">
          <div className="flex flex-col text-left space-y-1 min-w-0 flex-1">
            {/* Product Title - Line Clamp 2 for full legibility on mobile */}
            <Link href={`/products/${product.slug}`} className="block group-hover:text-[#CB9700] transition-colors">
              <h3 className="font-sans font-bold text-xs sm:text-sm text-stone-900 tracking-tight line-clamp-2 leading-snug">
                {product.name}
              </h3>
            </Link>

            {/* Price Info */}
            <div className="flex flex-wrap items-baseline gap-1.5 pt-0.5">
              <span className="font-sans font-extrabold text-xs sm:text-sm text-[#C65538] leading-none">
                ₹{product.price.toLocaleString('en-IN')}
              </span>

              {product.originalPrice && product.originalPrice > product.price && (
                <span className="font-sans text-[10px] sm:text-[11px] text-stone-400 line-through font-normal leading-none">
                  MRP ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          {/* Quick Add Cart Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
            }}
            className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-stone-800 bg-white hover:bg-[#141110] hover:border-[#141110] hover:text-white text-stone-900 flex items-center justify-center transition-all duration-200 shadow-2xs active:scale-95 group/btn cursor-pointer mt-0.5"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.8] group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
