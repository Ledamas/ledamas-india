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

  const primaryImage = product.images?.[0] || '/Kunafa Pistachio Dark Chocolate 1.png';
  const secondaryImage = product.images?.[1] || primaryImage;
  const hasSecondaryImage = product.images && product.images.length > 1;

  const currentBadge = badgeText || (product.isBestSeller ? 'BEST SELLER' : product.isFeatured ? 'FEATURED' : null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col bg-white text-center cursor-pointer"
    >
      {/* CarbonSmith-Style Clean Studio Image Container with Dual-Image Hover Swap */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#FAFAFA] rounded-xs border border-stone-100">
        <Link href={`/products/${product.slug}`} className="block w-full h-full relative">
          {/* Primary Studio Image */}
          <Image
            src={primaryImage}
            alt={product.imageAlt || product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover object-center transition-all duration-700 ease-out opacity-0 group-hover:opacity-100 group-hover:scale-105"
            />
          )}
        </Link>

        {/* Top Badges & Wishlist - CarbonSmith Style */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10 pointer-events-none">
          {/* Badge Display */}
          <div>
            {currentBadge ? (
              <span
                className={`px-2.5 py-1 text-[9px] font-sans font-bold uppercase tracking-[0.18em] rounded-none pointer-events-auto shadow-xs ${
                  currentBadge === 'BEST SELLER'
                    ? 'bg-[#1A1D20] text-white border border-stone-800'
                    : 'bg-[#FAF1E6] text-[#C68A4C]'
                }`}
              >
                {currentBadge}
              </span>
            ) : product.weight ? (
              <span className="px-2 py-0.5 bg-stone-900/80 text-white text-[9px] font-sans font-medium uppercase tracking-wider rounded-none pointer-events-auto">
                {product.weight}
              </span>
            ) : null}
          </div>

          {/* Top-Right Heart Wishlist Trigger (CarbonSmith Bare Outline Heart) */}
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
            className="p-1 text-stone-400 hover:text-stone-900 transition-colors pointer-events-auto drop-shadow-xs"
            aria-label="Add to Wishlist"
          >
            <Heart className={`w-4.5 h-4.5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'stroke-[1.3]'}`} />
          </button>
        </div>

        {/* Quick Add Overlay Bar on Hover */}
        <div className="absolute inset-x-3 bottom-3 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
            }}
            className="w-full py-2.5 px-4 rounded-xs bg-[#232628] hover:bg-[#CB9700] text-white text-[11px] font-sans font-medium uppercase tracking-[0.2em] transition-colors shadow-md flex items-center justify-center space-x-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>ADD TO CART</span>
          </button>
        </div>
      </div>

      {/* CarbonSmith Centered Product Details below Image */}
      <div className="pt-2.5 pb-1 px-1 flex flex-col items-center text-center space-y-0.5">
        {/* Product Title */}
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="font-serif type-product-name font-normal text-stone-900 group-hover:text-[#CB9700] transition-colors leading-snug line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Category & Collection Subtitle */}
        <span className="font-sans type-label text-stone-400 font-light tracking-wider uppercase">
          {product.category} Collection
        </span>

        {/* Price */}
        <div className="pt-0.5 flex items-center justify-center gap-1.5">
          <span className="font-sans type-product-price text-stone-900">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.originalPrice && (
            <span className="font-sans text-xs text-stone-400 line-through font-light">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

