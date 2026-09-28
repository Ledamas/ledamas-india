import type { Metadata } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans, Alex_Brush } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import { CartProvider } from '../lib/context/cart-context';
import { AuthProvider } from '../lib/context/auth-context';
import { StickyOrderCta } from '../components/ui/sticky-order-cta';
import { MetaPixelScript } from '../components/meta-pixel-script';
import { ReferralTracker } from '../components/referral-tracker';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

const scriptFont = Alex_Brush({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-script',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ledamas.in'),
  title: 'LE DAMAS — Delicious Since 1951 | Heritage Middle Eastern & Luxury Chocolates',
  description: 'Discover LE DAMAS — Delicious Since 1951. Artisan Middle Eastern chocolates, Kunafa pistachio chocolates, speculoos cremes, and luxury confectionery.',
  keywords: [
    'Le Damas',
    'Delicious Since 1951',
    'luxury chocolate India',
    'kunafa chocolate',
    'dubai chocolate bar',
    'middle eastern chocolates',
    'artisan patisserie'
  ],
  icons: {
    icon: [
      { url: '/Le-Damas-Sweets-Logo-enhanced.png', type: 'image/png' },
      { url: '/icon.png', type: 'image/png' }
    ],
    shortcut: '/Le-Damas-Sweets-Logo-enhanced.png',
    apple: '/Le-Damas-Sweets-Logo-enhanced.png',
  },
  openGraph: {
    title: 'LE DAMAS — Delicious Since 1951 | Heritage & Luxury Chocolates',
    description: 'Discover LE DAMAS — Delicious Since 1951. Artisan Middle Eastern chocolates, Kunafa pistachio chocolates, speculoos cremes, and luxury confectionery.',
    url: 'https://ledamas.in',
    siteName: 'LE DAMAS',
    images: [
      {
        url: '/Le-Damas-Sweets-Logo-enhanced.png',
        width: 800,
        height: 600,
        alt: 'LE DAMAS Luxury Chocolaterie Logo',
      }
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LE DAMAS — Delicious Since 1951',
    description: 'Artisan Middle Eastern chocolates, Kunafa pistachio chocolates, and luxury confectionery.',
    images: ['/Le-Damas-Sweets-Logo-enhanced.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${cormorant.variable} ${jakarta.variable} ${scriptFont.variable} scroll-smooth`}>
      <head>
        <MetaPixelScript />
      </head>
      <body className="bg-[#FDFDFB] text-[#2B2B2B] antialiased selection:bg-[#2AD2C5] selection:text-white min-h-screen flex flex-col font-sans">
        <AuthProvider>
          <CartProvider>
            <Suspense fallback={null}>
              <ReferralTracker />
            </Suspense>
            {children}
            <StickyOrderCta />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
