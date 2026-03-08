import { notFound } from 'next/navigation';
import { GlassPanel } from '@/components/ui/GlassPanel';
import styles from './policies.module.css';

// Mock policy content since this is just static markdown-like data
const POLICIES: Record<string, { title: string, content: React.ReactNode }> = {
    shipping: {
        title: "Shipping Policy",
        content: (
            <>
                <h3>Domestic Shipping</h3>
                <p>We offer standard (3-5 business days) and expedited (1-2 business days) shipping options for all domestic orders within the United States. All orders over ₹150 qualify for free standard shipping.</p>
                <h3>International Shipping</h3>
                <p>NexCart ships worldwide. International shipping costs and delivery times are calculated at checkout based on the destination country. Please note that customs duties, taxes, and import fees are the responsibility of the customer.</p>
                <h3>Order Processing</h3>
                <p>Orders are processed within 24 hours of placement. You will receive a tracking link via email once your order has dispatched.</p>
            </>
        )
    },
    returns: {
        title: "Returns & Refunds",
        content: (
            <>
                <h3>30-Day Return Policy</h3>
                <p>If you are not entirely satisfied with your purchase, you may return the unused item in its original condition and packaging within 30 days of receipt for a full refund or exchange.</p>
                <h3>Process</h3>
                <p>To initiate a return, please visit our Help Center or contact our support team with your order number. We will provide a prepaid return shipping label.</p>
                <h3>Refunds</h3>
                <p>Refunds are processed to the original method of payment within 5-7 business days after we receive and inspect the returned item.</p>
            </>
        )
    },
    privacy: {
        title: "Privacy Policy",
        content: (
            <>
                <h3>Information Collection</h3>
                <p>We collect personal information that you provide to us, such as your name, email address, and shipping details when you place an order or create an account. We also use cookies to analyze web traffic and improve your shopping experience.</p>
                <h3>Use of Information</h3>
                <p>Your information is used strictly to process orders, provide customer support, and, with your consent, send promotional offers. We do not sell your personal data to third parties.</p>
                <h3>Data Security</h3>
                <p>We employ industry-standard security measures, including SSL encryption, to protect your personal and payment information during transmission and storage.</p>
            </>
        )
    },
    terms: {
        title: "Terms of Service",
        content: (
            <>
                <h3>Overview</h3>
                <p>This website is operated by NexCart. By accessing or using any part of the site, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, then you may not access the website.</p>
                <h3>Product Adjustments</h3>
                <p>We reserve the right to modify or discontinue any product or service without notice at any time. Prices for our products are subject to change.</p>
                <h3>Governing Law</h3>
                <p>These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of the jurisdiction in which NexCart operates.</p>
            </>
        )
    }
};

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Check if the requested policy exists
    if (!POLICIES[slug]) {
        notFound();
    }

    const policy = POLICIES[slug];
    const lastUpdated = "March 1, 2026"; // static date for demo

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>{policy.title}</h1>
                <p className={styles.subtitle}>Last updated: {lastUpdated}</p>
            </div>

            <GlassPanel className={styles.contentPanel}>
                <div className={styles.content}>
                    {policy.content}
                </div>
            </GlassPanel>
        </div>
    );
}
