import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
    items: string[]; // Store product IDs
    toggleItem: (productId: string) => void;
    clearWishlist: () => void;
    isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],

            toggleItem: (productId) => {
                set((state) => {
                    const exists = state.items.includes(productId);
                    if (exists) {
                        return { items: state.items.filter(id => id !== productId) };
                    } else {
                        return { items: [...state.items, productId] };
                    }
                });
            },

            clearWishlist: () => set({ items: [] }),

            isInWishlist: (productId) => get().items.includes(productId)
        }),
        {
            name: 'nexcart-wishlist-storage',
        }
    )
);
