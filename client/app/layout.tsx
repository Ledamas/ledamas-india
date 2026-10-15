import type { Metadata } from 'next';
import Script from 'next/script';
import { Cormorant_Garamond, Plus_Jakarta_Sans, Alex_Brush } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import { CartProvider } from '../lib/context/cart-context';
import { AuthProvider } from '../lib/context/auth-context';
import { StickyOrderCta } from '../components/ui/sticky-order-cta';
import { MetaPixelScript } from '../components/meta-pixel-script';
import { ReferralTracker } from '../components/referral-tracker';
import FirstOrderPopup from '../components/ui/first-order-popup';
import { ScrollToTop } from '../components/scroll-to-top';
import { MobileBottomNav } from '../components/layout/mobile-bottom-nav';

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
  metadataBase: new URL('https://ledamas.in'),
  title: 'Le Damas | Delicious Since 1951 | India',
  description: 'Delicious Since 1951, now in India. Premium Dubai chocolate with Kunafa & Pistachio cream, plus dark chocolate. Fast pan-India delivery.',
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
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Le Damas | Delicious Since 1951 | India',
    description: 'Delicious Since 1951, now in India. Premium Dubai chocolate with Kunafa & Pistachio cream, plus dark chocolate. Fast pan-India delivery.',
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
    title: 'Le Damas | Delicious Since 1951 | India',
    description: 'Delicious Since 1951, now in India. Premium Dubai chocolate with Kunafa & Pistachio cream, plus dark chocolate. Fast pan-India delivery.',
    images: ['/Le-Damas-Sweets-Logo-enhanced.png'],
  },
  alternates: {
    canonical: 'https://ledamas.in',
  },
};

import { StorefrontTracker } from '../components/analytics/storefront-tracker';
import { CookieConsentBanner } from '../components/ui/cookie-consent';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${cormorant.variable} ${jakarta.variable} ${scriptFont.variable} scroll-smooth`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <MetaPixelScript />
      </head>
      <body className="bg-[#FDFDFB] text-[#2B2B2B] antialiased selection:bg-[#2AD2C5] selection:text-white min-h-screen flex flex-col font-sans pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0">
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
        <AuthProvider>
          <CartProvider>
            <Suspense fallback={null}>
              <ReferralTracker />
            </Suspense>
            <StorefrontTracker />
            <ScrollToTop />
            {children}
            <MobileBottomNav />
            <CookieConsentBanner />
            <StickyOrderCta />
            <FirstOrderPopup />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
