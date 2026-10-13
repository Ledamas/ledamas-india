import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { getAllProducts, getAllCollections } from '../../lib/products';
import { constructMetadata } from '../../lib/seo';
import { ProductCard } from '../../components/product/product-card';
import { Header } from '../../components/layout/header';
import { Footer } from '../../components/layout/footer';
import { ShopClient } from '../../components/shop/shop-client';

export const metadata: Metadata = constructMetadata({
  title: 'Buy Dubai Kunafa Chocolate Online | Le Damas India',
  description: 'Shop Dubai chocolate bars, Kunafa Pistachio chocolate and dark chocolate online. Premium gifting boxes with fast pan-India delivery. Order now.',
  canonicalUrl: '/shop',
  keywords: [
    'buy dubai chocolate online',
    'kunafa chocolate shop',
    'dubai chocolate buy online',
    'artisan dark chocolate bar',
    'LE DAMAS shop'
  ],
});

export default function ShopPage() {
  const products = getAllProducts();
  const collections = getAllCollections();

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900">
      <Header />
      <Suspense fallback={
        <div className="py-24 text-center text-stone-400 font-serif">
          Loading LE DAMAS Confections Collection...
        </div>
      }>
        <ShopClient products={products} collections={collections} />
      </Suspense>
      <Footer />
    </div>
  );
}
