import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Shop',
    description: 'Browse our premium electronics catalog. Find headphones, speakers, keyboards, and more.',
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
