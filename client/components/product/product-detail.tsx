'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Check, Heart, ChevronLeft, ChevronRight, ChevronDown, MessageSquare } from 'lucide-react';
import { Product, ProductVariant } from '../../lib/types';
import { useCart } from '../../lib/context/cart-context';
import { useWishlistStore } from '../wishlist/wishlist-store';
import { JsonLd } from '../seo/json-ld';
import { generateProductJsonLd } from '../../lib/structured-data';
import { ProductCard } from './product-card';

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isInWishlistRaw = useWishlistStore((state) => state.isInWishlist(product.id));

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isInWishlist = isMounted && isInWishlistRaw;

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [selectedImage, setSelectedImage] = useState<string>(product.images[0] || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [showSpecsAccordion, setShowSpecsAccordion] = useState<boolean>(false);

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentCompareAt = selectedVariant ? selectedVariant.compareAtPrice || selectedVariant.originalPrice : product.compareAtPrice || product.originalPrice;

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, selectedVariant, quantity);
    openCart();
  };

  const productJsonLd = generateProductJsonLd(product);

  const whatsappMessage = encodeURIComponent(`Hello LE DAMAS team, I would like to inquire about "${product.name}".`);

  return (
    <div className="bg-white text-stone-900 pt-44 sm:pt-48 md:pt-52 pb-24">
      <JsonLd data={productJsonLd} />

      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* CarbonSmith Top Left Navigation */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-[11px] font-sans font-medium uppercase tracking-[0.25em] text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1 text-stone-500" />
            <span>Back</span>
          </button>
        </div>

        {/* Main Product Display Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: Pure Studio Product Image & Thumbnails (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-square sm:aspect-[4/3] w-full bg-[#FAFAFA] border border-stone-200/70 rounded-none overflow-hidden p-6 sm:p-10 flex items-center justify-center">
              <Image
                src={selectedImage || product.images[0]}
                alt={product.imageAlt || product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-contain object-center transition-transform duration-500 hover:scale-105"
              />
              {product.cacaoPercentage && (
                <div className="absolute top-4 left-4 bg-stone-900 text-white text-[10px] font-sans uppercase font-bold tracking-[0.2em] px-3 py-1">
                  {product.cacaoPercentage}% CACAO
                </div>
              )}
            </div>

            {/* Thumbnail Selection Bar */}
            {product.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-20 bg-[#FAFAFA] border transition-all flex-shrink-0 focus:outline-none ${selectedImage === img
                        ? 'border-stone-900 opacity-100'
                        : 'border-stone-200 opacity-60 hover:opacity-100'
                      }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: CarbonSmith Product Details & Action Stack (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Eyebrow Label */}
            <div>
              <span className="type-label text-[#CB9700] block mb-1.5">
                PRODUCT DETAILS
              </span>
              <h1 className="type-page-title text-stone-900 font-normal leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price Display */}
            <div className="flex items-baseline space-x-3 pt-1">
              <span className="type-product-price text-2xl font-semibold text-stone-900 tracking-tight">
                ₹ {currentPrice.toLocaleString('en-IN')}
              </span>
              {currentCompareAt && currentCompareAt > currentPrice && (
                <span className="type-small text-stone-400 line-through font-light">
                  ₹ {currentCompareAt.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Product Variants (If available) */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2 pt-2">
                <label className="block text-[10px] font-sans uppercase tracking-[0.2em] text-stone-500 font-semibold">
                  SELECT VARIANT
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-3 py-2.5 text-left border transition-all text-xs ${selectedVariant?.id === variant.id
                          ? 'border-stone-900 bg-stone-900 text-white font-medium'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                        }`}
                    >
                      <div className="text-xs font-semibold">{variant.name}</div>
                      <div className="text-[11px] opacity-80">₹ {variant.price.toLocaleString('en-IN')}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CarbonSmith Stacked Action Buttons */}
            <div className="space-y-3 pt-2">
              {/* 1. Primary Full Width "Add to Cart" Button */}
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`w-full py-4 px-6 font-sans text-xs uppercase tracking-[0.2em] font-medium transition-colors flex items-center justify-center space-x-2 rounded-none shadow-xs ${isAdded
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#232628] hover:bg-[#CB9700] text-white'
                  }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>ADDED TO CART</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>ADD TO CART</span>
                  </>
                )}
              </button>

              {/* 2. Secondary Full Width "Buy Now" Warm Accent Button */}
              <button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="w-full py-4 px-6 bg-[#E88D43] hover:bg-[#d97d34] text-white font-sans text-xs uppercase tracking-[0.2em] font-medium transition-colors text-center rounded-none shadow-xs"
              >
                BUY NOW
              </button>

              {/* 3. Dual Side-by-Side Outlined Buttons (Wishlist & Contact Now) */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() =>
                    toggleWishlist({
                      id: product.id,
                      slug: product.slug,
                      name: product.name,
                      price: currentPrice,
                      image: selectedImage || product.images[0],
                      category: product.category,
                      inStock: product.inStock,
                    })
                  }
                  className={`w-full py-3 border text-xs font-sans font-medium uppercase tracking-[0.15em] flex items-center justify-center space-x-1.5 transition-colors rounded-none ${isInWishlist
                      ? 'border-red-500 text-red-600 bg-red-50/50'
                      : 'border-stone-300 hover:border-stone-900 text-stone-800 bg-white'
                    }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{isInWishlist ? 'WISHLISTED' : 'WISHLIST'}</span>
                </button>

                <a
                  href={`https://wa.me/919876543210?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 border border-stone-300 hover:border-stone-900 text-stone-800 bg-white text-xs font-sans font-medium uppercase tracking-[0.15em] flex items-center justify-center space-x-1.5 transition-colors rounded-none"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-stone-600" />
                  <span>CONTACT NOW</span>
                </a>
              </div>
            </div>

            {/* Narrative Product Description Text */}
            <div className="pt-4 border-t border-stone-100">
              <p className="text-xs sm:text-sm font-sans text-stone-600 leading-relaxed font-light">
                {product.description || product.shortDescription}
              </p>
            </div>

            {/* View Complete Specifications Link / Expandable Accordion */}
            <div className="pt-2 border-t border-stone-100">
              <button
                onClick={() => setShowSpecsAccordion(!showSpecsAccordion)}
                className="w-full py-3 flex items-center justify-between text-xs font-sans font-medium uppercase tracking-[0.18em] text-stone-800 hover:text-[#CB9700] transition-colors text-left"
              >
                <span>VIEW COMPLETE SPECIFICATIONS</span>
                {showSpecsAccordion ? (
                  <ChevronDown className="w-4 h-4 text-stone-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-stone-500" />
                )}
              </button>

              {showSpecsAccordion && (
                <div className="py-4 text-xs text-stone-600 space-y-2 border-t border-stone-100 leading-relaxed">
                  <p><strong className="text-stone-900 font-medium">Brand:</strong> {product.brand}</p>
                  <p><strong className="text-stone-900 font-medium">Category:</strong> {product.category}</p>
                  {product.origin && (
                    <p><strong className="text-stone-900 font-medium">Origin:</strong> {product.origin}</p>
                  )}
                  {product.ingredients && product.ingredients.length > 0 && (
                    <p><strong className="text-stone-900 font-medium">Ingredients:</strong> {product.ingredients.join(', ')}</p>
                  )}
                  {product.allergens && product.allergens.length > 0 && (
                    <p><strong className="text-stone-900 font-medium">Allergens:</strong> {product.allergens.join(', ')}</p>
                  )}
                  {product.tastingNotes && product.tastingNotes.length > 0 && (
                    <p><strong className="text-stone-900 font-medium">Tasting Notes:</strong> {product.tastingNotes.join(', ')}</p>
                  )}
                </div>
              )}
            </div>

            {/* 3-Column Specifications Summary Boxes (Matching CarbonSmith Bottom Boxes) */}
            <div className="bg-[#F8F8F8] border border-stone-200/80 grid grid-cols-1 sm:grid-cols-3 text-[10.5px] font-sans font-medium uppercase tracking-wider text-stone-700 py-3.5 px-4 text-center divide-y sm:divide-y-0 sm:divide-x divide-stone-200/80 gap-2 sm:gap-0">
              <div className="py-1 px-2">
                <span className="text-stone-400 font-normal">GROSS WEIGHT : </span>
                <span className="text-stone-900 font-semibold">{product.weight || '200 g'}</span>
              </div>
              <div className="py-1 px-2">
                <span className="text-stone-400 font-normal">NET WEIGHT : </span>
                <span className="text-stone-900 font-semibold">{product.weight ? product.weight : '180 g'}</span>
              </div>
              <div className="py-1 px-2">
                <span className="text-stone-400 font-normal">ORIGIN : </span>
                <span className="text-stone-900 font-semibold">{product.origin || 'Single Origin'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SEO & Collection Quick Navigation */}
        <section className="mt-20 pt-10 border-t border-stone-200">
          <div className="max-w-3xl">
            <h2 className="text-lg font-serif text-stone-900 font-normal">
              Explore More {product.category} & Handcrafted Dubai Chocolates
            </h2>
            <p className="mt-2 text-xs text-stone-500 leading-relaxed font-light">
              Each LE DAMAS confection is handcrafted in small artisanal batches. Discover our full range of{' '}
              <Link href="/collections/kunafa-chocolate" className="text-[#CB9700] underline font-medium hover:text-stone-900">
                Kunafa Chocolates
              </Link>
              , featuring crisp roasted Kataifi pastry, slow-roasted pistachio creme, and Belgian dark chocolate.
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Link
                href="/collections/dubai-chocolate"
                className="text-[11px] px-3.5 py-1.5 bg-stone-50 border border-stone-200 text-stone-700 hover:border-stone-900 hover:text-stone-900 transition-colors uppercase tracking-wider font-sans font-medium"
              >
                Dubai Chocolate Bars
              </Link>
              <Link
                href="/collections/dark-chocolate"
                className="text-[11px] px-3.5 py-1.5 bg-stone-50 border border-stone-200 text-stone-700 hover:border-stone-900 hover:text-stone-900 transition-colors uppercase tracking-wider font-sans font-medium"
              >
                Dark Chocolate Collection
              </Link>
              <Link
                href="/collections/milk-chocolate"
                className="text-[11px] px-3.5 py-1.5 bg-stone-50 border border-stone-200 text-stone-700 hover:border-stone-900 hover:text-stone-900 transition-colors uppercase tracking-wider font-sans font-medium"
              >
                Milk Chocolate Collection
              </Link>
              <Link
                href="/collections/mini-chocolate-bars"
                className="text-[11px] px-3.5 py-1.5 bg-stone-50 border border-stone-200 text-stone-700 hover:border-stone-900 hover:text-stone-900 transition-colors uppercase tracking-wider font-sans font-medium"
              >
                Mini Chocolate Bars
              </Link>
            </div>
          </div>
        </section>

        {/* 4-Column "Pairs Well With" Related Products Grid */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-10 border-t border-stone-200">
            <h2 className="text-xl sm:text-2xl font-serif text-stone-900 font-normal mb-8">
              Pairs Well With
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

