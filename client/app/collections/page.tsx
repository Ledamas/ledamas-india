import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { getAllProducts, getAllCollections } from '../../lib/products';
import { constructMetadata } from '../../lib/seo';
import { Header } from '../../components/layout/header';
import { Footer } from '../../components/layout/footer';
import { ShopClient } from '../../components/shop/shop-client';

export const metadata: Metadata = constructMetadata({
  title: 'Artisanal Cacao Collections | LE DAMAS',
  description: 'Explore all haute chocolates by LE DAMAS. Filter by Kunafa, Dubai, Dark, Milk, and Mini Chocolate Bars.',
  canonicalUrl: '/collections',
});

export default function CollectionsPage() {
  const products = getAllProducts();
  const collections = getAllCollections();

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900">
      <Header />
      <Suspense fallback={<div className="py-24 text-center text-stone-400">Loading Collections...</div>}>
        <ShopClient products={products} collections={collections} isTrendingView={false} />
      </Suspense>
      <Footer />
    </div>
  );
}
