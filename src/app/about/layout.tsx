import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us | NexCart',
    description: 'Learn more about NexCart, your premium destination for high-fidelity electronics.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
