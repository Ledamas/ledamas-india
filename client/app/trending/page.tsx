import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { getAllProducts, getAllCollections } from '../../lib/products';
import { constructMetadata } from '../../lib/seo';
import { Header } from '../../components/layout/header';
import { Footer } from '../../components/layout/footer';
import { ShopClient } from '../../components/shop/shop-client';

export const metadata: Metadata = constructMetadata({
  title: 'Trending Chocolates | LE DAMAS',
  description: 'Explore the most popular and trending LE DAMAS luxury chocolates.',
  canonicalUrl: '/trending',
});

export default function TrendingPage() {
  const products = getAllProducts();
  const collections = getAllCollections();

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900">
      <Header />
      <Suspense fallback={<div className="py-24 text-center text-stone-400">Loading Trending Products...</div>}>
        <ShopClient products={products} collections={collections} isTrendingView={true} />
      </Suspense>
      <Footer />
    </div>
  );
}
