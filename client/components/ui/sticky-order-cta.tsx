'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../lib/context/cart-context';

export function StickyOrderCta() {
  const { openCart, totalItems } = useCart();
  const pathname = usePathname();

  // Hide Order Now floating CTA button on Admin Panel pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="hidden md:block fixed bottom-6 right-6 z-45 pointer-events-auto">
      <button
        onClick={openCart}
        className="group relative flex items-center space-x-2.5 px-6 py-3.5 rounded-full bg-[#CB9700] hover:bg-[#e0a800] text-black font-sans text-xs uppercase tracking-widest font-bold shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-black/20"
        aria-label="Order Now"
      >
        <ShoppingBag className="w-4.5 h-4.5 text-black group-hover:rotate-12 transition-transform stroke-[2.2]" />
        <span>Order Now</span>
        {totalItems > 0 ? (
          <span className="ml-1.5 px-2 py-0.5 rounded-full bg-black text-white text-[11px] font-bold shadow-md">
            {totalItems}
          </span>
        ) : (
          <span className="relative flex h-2.5 w-2.5 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-black"></span>
          </span>
        )}
      </button>
    </div>
  );
}

