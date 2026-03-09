import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar/Navbar';
import { MobileSlideDrawer } from '@/components/layout/MobileSlideDrawer/MobileSlideDrawer';
import { Footer } from '@/components/layout/Footer/Footer';
import { CartDrawer } from '@/components/ecommerce/CartDrawer/CartDrawer';
import { AuthProvider } from '@/components/providers/AuthProvider';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexcart.store';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'NexCart | Premium Electronics Store',
    template: '%s | NexCart',
  },
  description: 'Shop premium electronics, audio gear, and tech accessories with a seamless luxury shopping experience.',
  keywords: ['electronics', 'headphones', 'audio', 'tech', 'premium', 'online store', 'e-commerce'],
  authors: [{ name: 'NexCart' }],
  creator: 'NexCart',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'NexCart',
    title: 'NexCart | Premium Electronics Store',
    description: 'Shop premium electronics, audio gear, and tech accessories with a seamless luxury shopping experience.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NexCart | Premium Electronics Store',
    description: 'Shop premium electronics with a luxury shopping experience.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
};

import { ToastContainer } from '@/components/ui/ToastContainer/ToastContainer';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://gvxczxrqukweixncybri.supabase.co" />
        <link rel="dns-prefetch" href="https://gvxczxrqukweixncybri.supabase.co" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <div className="globalMeshBackground" aria-hidden="true" />
        <div className="globalNoiseOverlay" aria-hidden="true" />
        <AuthProvider>
          <Navbar />
          <MobileSlideDrawer />
          <CartDrawer />
          <ToastContainer />
          <main className="main-content">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
