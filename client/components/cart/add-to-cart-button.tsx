'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShoppingBag } from 'lucide-react';
import { useCart } from '../../lib/context/cart-context';

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    variant?: string;
  };
  quantity?: number;
  className?: string;
}

/**
 * Flies a small copy of the product image from the button to the header's
 * cart icon (#cart-icon) on click, then shows a brief "Added" confirmation.
 * Give your header cart icon `id="cart-icon"` for this to target correctly —
 * it degrades gracefully to just the confirmation state if that id isn't found.
 */
export function AddToCartButton({ product, quantity = 1, className }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [flight, setFlight] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(
    null
  );

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const buttonRect = e.currentTarget.getBoundingClientRect();
    const cartEl = document.getElementById('cart-icon');
    const cartRect = cartEl?.getBoundingClientRect();

    if (cartRect) {
      setFlight({
        startX: buttonRect.left + buttonRect.width / 2,
        startY: buttonRect.top + buttonRect.height / 2,
        endX: cartRect.left + cartRect.width / 2,
        endY: cartRect.top + cartRect.height / 2,
      });
    }

    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        images: [product.image],
        weight: product.variant || '',
      },
      undefined,
      quantity
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={
          className ??
          'px-6 py-3 rounded-full bg-[#CB9700] hover:bg-[#2AD2C5] text-white text-xs tracking-[0.15em] font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5'
        }
      >
        <AnimatePresence mode="wait" initial={false}>
          {justAdded ? (
            <motion.span
              key="added"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Added
            </motion.span>
          ) : (
            <motion.span
              key="add"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>ADD TO CART</span>
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Flying image, rendered at the document root so it isn't clipped by any parent */}
      {flight &&
        typeof document !== 'undefined' &&
        createPortal(
          <motion.img
            src={product.image}
            alt=""
            initial={{
              position: 'fixed',
              left: flight.startX,
              top: flight.startY,
              width: 36,
              height: 36,
              borderRadius: '9999px',
              opacity: 1,
              x: '-50%',
              y: '-50%',
              zIndex: 9999,
              pointerEvents: 'none',
              objectFit: 'cover',
            }}
            animate={{
              left: flight.endX,
              top: flight.endY,
              width: 10,
              height: 10,
              opacity: 0.3,
            }}
            transition={{ duration: 0.65, ease: [0.34, 1.15, 0.64, 1] }}
            onAnimationComplete={() => setFlight(null)}
          />,
          document.body
        )}
    </>
  );
}
