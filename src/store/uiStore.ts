import { create } from 'zustand';

interface UIState {
    isCartOpen: boolean;
    isMobileMenuOpen: boolean;
    isFilterSidebarOpen: boolean;

    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;

    openMobileMenu: () => void;
    closeMobileMenu: () => void;
    toggleMobileMenu: () => void;

    openFilterSidebar: () => void;
    closeFilterSidebar: () => void;
    toggleFilterSidebar: () => void;

    closeAllPanels: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    isCartOpen: false,
    isMobileMenuOpen: false,
    isFilterSidebarOpen: false,

    openCart: () => set({ isCartOpen: true, isMobileMenuOpen: false }),
    closeCart: () => set({ isCartOpen: false }),
    toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen, isMobileMenuOpen: false })),

    openMobileMenu: () => set({ isMobileMenuOpen: true, isCartOpen: false }),
    closeMobileMenu: () => set({ isMobileMenuOpen: false }),
    toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen, isCartOpen: false })),

    openFilterSidebar: () => set({ isFilterSidebarOpen: true }),
    closeFilterSidebar: () => set({ isFilterSidebarOpen: false }),
    toggleFilterSidebar: () => set((state) => ({ isFilterSidebarOpen: !state.isFilterSidebarOpen })),

    closeAllPanels: () => set({ isCartOpen: false, isMobileMenuOpen: false, isFilterSidebarOpen: false })
}));
