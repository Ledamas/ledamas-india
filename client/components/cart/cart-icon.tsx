'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../lib/context/cart-context';

export function CartIcon() {
  const { totalItems, toggleCart } = useCart();

  return (
    <button
      id="cart-icon"
      onClick={toggleCart}
      className="relative p-2.5 rounded-full border border-white/15 hover:border-[#2AD2C5] text-stone-200 hover:text-white transition-colors"
      aria-label={`Open cart, ${totalItems} item${totalItems === 1 ? '' : 's'}`}
    >
      <ShoppingBag className="w-4 h-4" />
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.span
            key={totalItems}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#CB9700] text-[10px] font-semibold flex items-center justify-center text-white"
          >
            {totalItems}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
