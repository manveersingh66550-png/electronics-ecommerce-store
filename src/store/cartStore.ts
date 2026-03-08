import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string; // A unique hash or UUID for this cart line item
    product_id: string;
    variant_id?: string;
    name: string;
    price: number;
    quantity: number;
    image_url: string;
    stock: number;
}

interface CartState {
    items: CartItem[];
    discount: number;
    couponCode: string | null;
    addItem: (item: Omit<CartItem, 'id'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    applyCoupon: (code: string, discountAmount: number) => void;
    clearCoupon: () => void;
    clearCart: () => void;
    getSubtotal: () => number;
    getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            discount: 0,
            couponCode: null,

            addItem: (newItem) => {
                set((state) => {
                    // Check if item exactly matches existing product + variant
                    const existingItemIndex = state.items.findIndex(
                        (i) => i.product_id === newItem.product_id && i.variant_id === newItem.variant_id
                    );

                    if (existingItemIndex > -1) {
                        // Update quantity
                        const newItems = [...state.items];
                        const newQuantity = Math.min(
                            newItems[existingItemIndex].quantity + newItem.quantity,
                            newItem.stock
                        );
                        newItems[existingItemIndex].quantity = newQuantity;
                        return { items: newItems };
                    }

                    // Add new item with a generated ID
                    const id = crypto.randomUUID();
                    return { items: [...state.items, { ...newItem, id }] };
                });
            },

            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter((i) => i.id !== id),
                }));
            },

            updateQuantity: (id, quantity) => {
                set((state) => ({
                    items: state.items.map((i) =>
                        i.id === id ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i
                    ),
                }));
            },

            applyCoupon: (code, discountAmount) => set({ couponCode: code, discount: discountAmount }),

            clearCoupon: () => set({ couponCode: null, discount: 0 }),

            clearCart: () => set({ items: [], couponCode: null, discount: 0 }),

            getSubtotal: () => {
                return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
            },

            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            }
        }),
        {
            name: 'nexcart-cart-storage', // local storage key
        }
    )
);
