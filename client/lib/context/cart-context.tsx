'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariant, CartItem } from '../types';
import { trackAddToCart } from '../meta-pixel';
import { useAuth } from './auth-context';

export type SimpleCartProduct = {
  id: string;
  name: string;
  price: number;
  slug?: string;
  images?: string[];
  image?: string;
  weight?: string;
  category?: string;
};

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product | SimpleCartProduct, variant?: ProductVariant, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const FREE_SHIPPING_THRESHOLD = 3000;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const userStorageKey = `ledamas_cart_${user?.id || (user?.phone ? user.phone.replace(/\D/g, '') : null) || user?.email || 'guest'}`;

  // Load cart from localStorage on mount or when logged-in user changes
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(userStorageKey);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        setItems(parsed);
      } else {
        setItems([]);
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
      setItems([]);
    }
  }, [userStorageKey]);

  // Save cart to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(userStorageKey, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items, userStorageKey]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const addItem = (
    productInput: Product | (Partial<Product> & { id: string; name: string; price: number; image?: string; images?: string[] }),
    variant?: ProductVariant,
    quantity: number = 1
  ) => {
    const images: string[] =
      'images' in productInput && Array.isArray(productInput.images) && productInput.images.length > 0
        ? productInput.images
        : 'image' in productInput && typeof productInput.image === 'string'
          ? [productInput.image]
          : ['/Kunafa-Pistachio-Dark-Chocolate-1.png'];

    const product: Product =
      'slug' in productInput && productInput.slug
        ? (productInput as Product)
        : {
          id: productInput.id,
          slug: productInput.slug || productInput.id,
          name: productInput.name,
          tagline: productInput.tagline || '',
          shortDescription: productInput.shortDescription || '',
          description: productInput.description || '',
          brand: productInput.brand || 'LE DAMAS',
          category: productInput.category || 'Chocolates',
          categorySlug: productInput.categorySlug || 'chocolates',
          images,
          weight: productInput.weight || '',
          price: productInput.price,
          currency: 'INR',
          availability: 'InStock',
          inStock: true,
        };

    const targetPrice = variant ? variant.price : product.price;

    // Track Meta Pixel AddToCart
    trackAddToCart({
      id: product.id,
      name: product.name,
      price: targetPrice,
      quantity,
      category: typeof product.category === 'string' ? product.category : 'Chocolates',
    });

    setItems((prevItems) => {
      const itemKey = `${product.id}-${variant ? variant.id : 'base'}`;
      const existingIndex = prevItems.findIndex((i) => i.id === itemKey);

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      return [
        ...prevItems,
        {
          id: itemKey,
          product,
          variant,
          quantity,
        },
      ];
    });
    setIsOpen(true);
  };

  const removeItem = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((sum, item) => {
    const price = item.variant ? item.variant.price : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        totalItems,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountNeededForFreeShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
