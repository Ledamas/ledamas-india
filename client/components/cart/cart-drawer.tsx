'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../lib/context/cart-context';
import { useAuth } from '../../lib/context/auth-context';

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal } = useCart();
  const { isAuthenticated, openLoginModal } = useAuth();
  const router = useRouter();

  const handleCheckoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    closeCart();
    if (!isAuthenticated) {
      openLoginModal();
    } else {
      router.push('/checkout');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className="fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-[#120E0C] text-white shadow-2xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#171210]">
              <div className="flex items-center space-x-2">
                <h2 className="font-serif text-xl text-[#2AD2C5] font-light">Your cart</h2>
                <span className="text-xs text-stone-400 bg-white/10 px-2 py-0.5 rounded-full font-mono">
                  {items.reduce((acc, i) => acc + i.quantity, 0)}
                </span>
              </div>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-stone-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Line items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-stone-400 gap-3 py-16">
                  <p className="text-sm font-light text-stone-300">Your shopping cart is currently empty.</p>
                  <button
                    onClick={closeCart}
                    className="text-xs text-[#2AD2C5] hover:text-[#28b8ad] underline underline-offset-4 tracking-wider uppercase font-medium"
                  >
                    Continue browsing
                  </button>
                </div>
              ) : (
                items.map((item) => {
                  const unitPrice = item.variant ? item.variant.price : item.product.price;
                  const itemImage = item.product.images?.[0] || '/Kunafa-Pistachio-Dark-Chocolate-1.png';
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3.5 p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all"
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-stone-900 border border-white/5">
                        <Image src={itemImage} alt={item.product.name} fill className="object-contain p-1" />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs sm:text-sm font-medium text-stone-100 line-clamp-2 leading-tight">
                              {item.product.name}
                            </h4>
                            {item.variant && (
                              <p className="text-[11px] text-stone-400 truncate mt-0.5">
                                {item.variant.name || item.variant.weight}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            aria-label={`Remove ${item.product.name}`}
                            className="text-stone-400 hover:text-red-400 transition-colors shrink-0 p-1.5 rounded-md hover:bg-white/10 -mr-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-2.5 pt-0.5">
                          <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-0.5 border border-white/5">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              aria-label="Decrease quantity"
                              className="p-1 text-stone-300 hover:text-[#2AD2C5] transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-semibold w-5 text-center text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              aria-label="Increase quantity"
                              className="p-1 text-stone-300 hover:text-[#2AD2C5] transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-xs sm:text-sm text-[#CB9700] font-semibold tracking-tight shrink-0 ml-2">
                            ₹{(unitPrice * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer / checkout */}
            {items.length > 0 && (
              <div className="border-t border-white/10 px-6 pt-5 pb-[calc(20px+env(safe-area-inset-bottom))] space-y-4 bg-[#0F0D0C]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-400 font-light">Subtotal</span>
                  <span className="font-serif text-lg text-white font-medium">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 font-light">
                  Shipping and taxes calculated at checkout.
                </p>
                <button
                  onClick={handleCheckoutClick}
                  className="w-full py-3.5 rounded-full bg-[#CB9700] hover:bg-[#b88800] active:scale-[0.99] text-stone-950 text-xs tracking-[0.2em] font-bold uppercase transition-all duration-300 shadow-lg shadow-[#CB9700]/10 cursor-pointer"
                >
                  Proceed to checkout
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

