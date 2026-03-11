"use client";

import dynamic from 'next/dynamic';

const MobileSlideDrawer = dynamic(() => import('@/components/layout/MobileSlideDrawer/MobileSlideDrawer').then(m => m.MobileSlideDrawer), { ssr: false });
const CartDrawer = dynamic(() => import('@/components/ecommerce/CartDrawer/CartDrawer').then(m => m.CartDrawer), { ssr: false });
const ToastContainer = dynamic(() => import('@/components/ui/ToastContainer/ToastContainer').then(m => m.ToastContainer), { ssr: false });

export function ClientSideUI() {
  return (
    <>
      <MobileSlideDrawer />
      <CartDrawer />
      <ToastContainer />
    </>
  );
}
