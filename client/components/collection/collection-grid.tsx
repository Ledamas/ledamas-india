import React from 'react';
import Link from 'next/link';
import { Collection, Product } from '../../lib/types';
import { ProductCard } from '../product/product-card';
import { JsonLd } from '../seo/json-ld';
import { generateCollectionJsonLd } from '../../lib/structured-data';
import { PromoBanner } from '../ui/promo-banner';

interface CollectionGridProps {
  collection: Collection;
  products: Product[];
  allCollections: Collection[];
}

export function CollectionGrid({ collection, products, allCollections }: CollectionGridProps) {
  const collectionJsonLd = generateCollectionJsonLd(collection, products);

  return (
    <div className="min-h-screen bg-white text-stone-900 pt-[110px] sm:pt-[140px] md:pt-[170px] lg:pt-[220px] pb-20">
      <JsonLd data={collectionJsonLd} />

      <div className="max-w-[1480px] w-full mx-auto px-6 lg:px-12">
        {/* Promotional Banner */}
        <PromoBanner />

        {/* Redesigned Clean Luxury Collection Hero Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-stone-900 font-normal tracking-tight">
            {collection.name}
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed font-light max-w-lg mx-auto">
            {collection.description || collection.tagline}
          </p>
        </div>

        {/* Product Grid (4 Columns) */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#FAFAFA] border border-stone-200 rounded-xl">
            <p className="text-sm text-stone-500 font-sans">No products currently available in this collection.</p>
            <Link
              href="/shop"
              className="inline-block mt-4 text-xs font-sans text-[#CB9700] uppercase tracking-wider font-semibold hover:underline"
            >
              Browse All Chocolates &rarr;
            </Link>
          </div>
        )}

        {/* Topic Cluster & Internal Linking Navigation */}
        <section className="mt-20 pt-12 border-t border-stone-200">
          <h2 className="text-xl font-serif text-stone-900 font-normal mb-4 text-center">
            Explore LE DAMAS Collections
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {allCollections.map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.slug}`}
                className={`p-3 rounded-md border text-center transition-all ${
                  col.slug === collection.slug
                    ? 'border-[#CB9700] bg-[#FAF1E6] text-[#C68A4C] font-semibold shadow-2xs'
                    : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-[#CB9700] hover:text-stone-900'
                }`}
              >
                <div className="text-xs font-sans">{col.name}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
