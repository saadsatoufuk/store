import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    variant: string;
    slug: string;
    maxStock: number;
}

interface CartStore {
    items: CartItem[];
    isOpen: boolean;
    lastBounce: number;
    addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
    removeItem: (productId: string, variant: string) => void;
    updateQuantity: (productId: string, variant: string, quantity: number) => void;
    clearCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            lastBounce: 0,

            addItem: (item) => {
                const items = get().items;
                const existingIndex = items.findIndex(
                    (i) => i.productId === item.productId && i.variant === item.variant
                );

                if (existingIndex > -1) {
                    const updated = [...items];
                    updated[existingIndex].quantity += (item.quantity || 1);
                    if (updated[existingIndex].quantity > updated[existingIndex].maxStock) {
                        updated[existingIndex].quantity = updated[existingIndex].maxStock;
                    }
                    set({ items: updated, isOpen: true, lastBounce: Date.now() });
                } else {
                    set({
                        items: [...items, { ...item, quantity: item.quantity || 1 }],
                        isOpen: true,
                        lastBounce: Date.now(),
                    });
                }
            },

            removeItem: (productId, variant) => {
                set({ items: get().items.filter((i) => !(i.productId === productId && i.variant === variant)) });
            },

            updateQuantity: (productId, variant, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId, variant);
                    return;
                }
                const items = get().items.map((i) => {
                    if (i.productId === productId && i.variant === variant) {
                        return { ...i, quantity: Math.min(quantity, i.maxStock) };
                    }
                    return i;
                });
                set({ items });
            },

            clearCart: () => set({ items: [] }),
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
            toggleCart: () => set({ isOpen: !get().isOpen }),

            getTotal: () => {
                return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            },

            getItemCount: () => {
                return get().items.reduce((sum, item) => sum + item.quantity, 0);
            },
        }),
        {
            name: 'cart-storage',
            partialize: (state) => ({ items: state.items }),
        }
    )
);
