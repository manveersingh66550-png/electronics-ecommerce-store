import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentlyViewedState {
    productIds: string[];
    addProduct: (id: string) => void;
    clear: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
    persist(
        (set, get) => ({
            productIds: [],
            addProduct: (id: string) => {
                const current = get().productIds.filter(pid => pid !== id);
                set({ productIds: [id, ...current].slice(0, 10) });
            },
            clear: () => set({ productIds: [] }),
        }),
        { name: 'recently-viewed-storage' }
    )
);
