import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { getAllProducts, getAllCollections } from '../../lib/products';
import { constructMetadata } from '../../lib/seo';
import { Header } from '../../components/layout/header';
import { Footer } from '../../components/layout/footer';
import { ShopClient } from '../../components/shop/shop-client';

export const metadata: Metadata = constructMetadata({
  title: 'Best Seller Chocolates | LE DAMAS',
  description: 'Shop the most loved and best selling LE DAMAS luxury chocolates.',
  canonicalUrl: '/best-seller',
});

export default function BestSellerPage() {
  const products = getAllProducts();
  const collections = getAllCollections();

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900">
      <Header />
      <Suspense fallback={<div className="py-24 text-center text-stone-400">Loading Best Sellers...</div>}>
        <ShopClient products={products} collections={collections} isBestSellerView={true} />
      </Suspense>
      <Footer />
    </div>
  );
}
