import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Deals',
    description: 'Browse current deals and discounts on premium electronics.',
};

export default function DealsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
