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

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col bg-white text-left cursor-pointer"
    >
      {/* Studio Image Container with Badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F5F3EF] rounded-sm border border-stone-200/60">
        <Link href={`/products/${product.slug}`} className="block w-full h-full relative">
          {/* Primary Studio Image */}
          <Image
            src={primaryImage}
            alt={product.imageAlt || product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
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
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover object-center transition-all duration-700 ease-out opacity-0 group-hover:opacity-100 group-hover:scale-105"
            />
          )}
        </Link>

        {/* Top Badges (Left = BESTSELLER/NEW, Right = % OFF) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start z-10 pointer-events-none">
          <div>
            {currentBadge && (
              <span className="px-2 py-0.5 text-[9px] font-sans font-bold uppercase tracking-wider rounded-xs pointer-events-auto bg-[#1E2540] text-white shadow-xs">
                {currentBadge.replace(' ', '')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {discountPercent && (
              <span className="px-2 py-0.5 text-[9px] font-sans font-bold uppercase tracking-wider rounded-xs bg-[#BF523C] text-white shadow-xs">
                {discountPercent}% Off
              </span>
            )}
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
              className="p-1 text-stone-600 hover:text-stone-900 bg-white/80 backdrop-blur-xs rounded-full shadow-xs transition-colors"
              aria-label="Add to Wishlist"
            >
              <Heart className={`w-3.5 h-3.5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'stroke-[1.5]'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Details Row (Name & Prices on Left, Circular Cart Button on Right) */}
      <div className="pt-3 pb-1 flex items-start justify-between gap-2">
        <div className="flex flex-col text-left space-y-0.5 min-w-0 flex-1">
          {/* Product Title */}
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="font-sans font-semibold text-xs sm:text-sm text-stone-900 uppercase tracking-tight line-clamp-1 group-hover:text-[#CB9700] transition-colors leading-tight">
              {product.name}
            </h3>
          </Link>

          {/* Strikethrough original MRP price */}
          {product.originalPrice && (
            <span className="font-sans text-[11px] text-stone-400 line-through font-normal leading-none pt-0.5">
              MRP RS. {product.originalPrice.toLocaleString('en-IN')}.00
            </span>
          )}

          {/* Selling Price */}
          <span className="font-sans font-medium text-xs sm:text-sm text-[#C65538] leading-tight">
            RS. {product.price.toLocaleString('en-IN')}.00
          </span>
        </div>

        {/* Circular Quick Add Bag Icon Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            addItem(product);
          }}
          className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-stone-800 bg-white hover:bg-[#1E2540] hover:border-[#1E2540] hover:text-white text-stone-900 flex items-center justify-center transition-all duration-200 shadow-xs active:scale-95 group/btn"
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingBag className="w-4 h-4 stroke-[1.6] group-hover/btn:scale-110 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}

