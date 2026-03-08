import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Track Order',
    description: 'Track your NexCart order status and shipment progress.',
};

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
