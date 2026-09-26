import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string, variant?: string) => void;
  updateQuantity: (id: string, variant: string | undefined, quantity: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      addItem: (product, quantity = 1) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.id === product.id && item.variant === product.variant
          );
          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex].quantity += quantity;
            return { items: updated, isOpen: true };
          }
          return {
            items: [...state.items, { ...product, quantity }],
            isOpen: true,
          };
        }),
      removeItem: (id, variant) =>
        set((state) => ({
          items: state.items.filter((item) => !(item.id === id && item.variant === variant)),
        })),
      updateQuantity: (id, variant, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => !(item.id === id && item.variant === variant)),
            };
          }
          return {
            items: state.items.map((item) =>
              item.id === id && item.variant === variant ? { ...item, quantity } : item
            ),
          };
        }),
      clearCart: () => set({ items: [] }),
      totalPrice: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
      totalItems: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'ledamas-cart-storage',
    }
  )
);
