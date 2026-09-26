'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Minus, Plus, Truck, ShieldCheck, Leaf } from 'lucide-react';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';

export interface ProductPageProps {
  product: {
    id: string;
    name: string;
    tagline: string;
    price: number;
    rating: number;
    reviewCount: number;
    images: string[];
    description: string;
    ingredients: string;
    variants: { label: string; extraPrice?: number }[];
  };
}

const defaultProduct: ProductPageProps['product'] = {
  id: 'kunafa-pistachio-bar',
  name: 'Kunafa Pistachio Bar',
  tagline: 'Crispy roasted kataifi, silky pistachio crème, velvet milk chocolate',
  price: 24.99,
  rating: 4.8,
  reviewCount: 312,
  images: [
    'https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=1000&auto=format&fit=crop',
  ],
  description:
    'Our signature bar layers hand-roasted kataifi threads with a silky pistachio crème, encased in single-origin milk chocolate. Made in small batches and finished within 72 hours of conching for peak texture and aroma.',
  ingredients: 'Milk chocolate (cocoa mass, cocoa butter, milk powder, sugar), kataifi (wheat), pistachio paste, ghee, sugar. Contains milk, wheat, nuts. May contain traces of other nuts.',
  variants: [{ label: '100g' }, { label: '250g', extraPrice: 12 }, { label: 'Gift box of 6', extraPrice: 38 }],
};

export function ProductPage({ product = defaultProduct }: Partial<ProductPageProps>) {
  const activeProduct = product || defaultProduct;
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const variant = activeProduct.variants[selectedVariant] || activeProduct.variants[0];
  const price = activeProduct.price + (variant.extraPrice ?? 0);

  return (
    <div className="min-h-screen bg-[#0F0D0C] text-white py-16 px-6 pt-24">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white/5 border border-white/10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <Image
                  src={activeProduct.images[activeImage] || activeProduct.images[0]}
                  alt={`${activeProduct.name} — view ${activeImage + 1}`}
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex gap-3 mt-4">
            {activeProduct.images.map((img, idx) => (
              <button
                key={img + idx}
                onClick={() => setActiveImage(idx)}
                aria-label={`View image ${idx + 1}`}
                className={`relative w-20 h-20 rounded-xl overflow-hidden border transition-colors ${
                  activeImage === idx ? 'border-[#2AD2C5]' : 'border-white/10 hover:border-white/30'
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="text-xs tracking-[0.2em] text-[#2AD2C5] mb-3 uppercase font-medium">Dubai kunafa specials</p>
          <h1 className="font-serif text-4xl mb-2 font-light">{activeProduct.name}</h1>
          <p className="text-stone-400 text-sm mb-4 font-light">{activeProduct.tagline}</p>

          <div className="flex items-center gap-2 mb-6">
            <div className="flex text-[#CB9700]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4" fill={i < Math.round(activeProduct.rating) ? 'currentColor' : 'none'} />
              ))}
            </div>
            <span className="text-xs text-stone-400">
              {activeProduct.rating} ({activeProduct.reviewCount} reviews)
            </span>
          </div>

          <p className="font-serif text-3xl text-[#CB9700] mb-6">${price.toFixed(2)}</p>

          {/* Variant selector */}
          <div className="mb-6">
            <p className="text-xs text-stone-400 mb-2 tracking-wide">Size</p>
            <div className="flex flex-wrap gap-2">
              {activeProduct.variants.map((v, idx) => (
                <button
                  key={v.label}
                  onClick={() => setSelectedVariant(idx)}
                  className={`px-4 py-2 rounded-full text-xs border transition-colors ${
                    selectedVariant === idx
                      ? 'border-[#2AD2C5] text-[#2AD2C5] bg-[#2AD2C5]/10'
                      : 'border-white/15 text-stone-300 hover:border-white/30'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity + add to cart */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-2 py-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="p-2 hover:text-[#2AD2C5] transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm w-5 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="p-2 hover:text-[#2AD2C5] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <AddToCartButton
              product={{
                id: activeProduct.id,
                name: activeProduct.name,
                variant: variant.label,
                price,
                image: activeProduct.images[0],
              }}
              quantity={quantity}
              className="flex-1 py-3.5 rounded-full bg-[#CB9700] hover:bg-[#2AD2C5] text-white text-xs tracking-[0.2em] font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            />
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 mb-8 text-center">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <Truck className="w-4 h-4 mx-auto mb-1.5 text-[#2AD2C5]" />
              <p className="text-[10px] text-stone-400">Cold-chain delivery</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <Leaf className="w-4 h-4 mx-auto mb-1.5 text-[#2AD2C5]" />
              <p className="text-[10px] text-stone-400">Small batch, fresh</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <ShieldCheck className="w-4 h-4 mx-auto mb-1.5 text-[#2AD2C5]" />
              <p className="text-[10px] text-stone-400">Since 1951</p>
            </div>
          </div>

          {/* Description / ingredients */}
          <div className="space-y-5 border-t border-white/10 pt-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-sm text-stone-400 leading-relaxed font-light">{activeProduct.description}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Ingredients</h3>
              <p className="text-sm text-stone-400 leading-relaxed font-light">{activeProduct.ingredients}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
