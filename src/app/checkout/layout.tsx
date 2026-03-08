import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Checkout',
    description: 'Complete your purchase securely. Enter shipping and payment details.',
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
