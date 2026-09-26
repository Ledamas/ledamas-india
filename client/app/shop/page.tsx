import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { getAllProducts, getAllCollections } from '../../lib/products';
import { constructMetadata } from '../../lib/seo';
import { ProductCard } from '../../components/product/product-card';
import { Header } from '../../components/layout/header';
import { Footer } from '../../components/layout/footer';
import { ShopClient } from '../../components/shop/shop-client';

export const metadata: Metadata = constructMetadata({
  title: 'Shop Luxury Chocolates | Kunafa & Single Origin Cacao | LE DAMAS',
  description: 'Explore the complete LE DAMAS collection. Kunafa Pistachio Dark & Milk chocolates, artisan hazelnut cremes, and 35g mini bars.',
  canonicalUrl: '/shop',
  keywords: [
    'buy luxury chocolate online India',
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
