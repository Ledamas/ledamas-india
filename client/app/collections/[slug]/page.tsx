import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllCollections, getCollectionBySlug, getProductsByCollection } from '../../../lib/products';
import { generateCollectionMetadata } from '../../../lib/seo';
import { Header } from '../../../components/layout/header';
import { Footer } from '../../../components/layout/footer';
import { CollectionGrid } from '../../../components/collection/collection-grid';

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const collections = getAllCollections();
  return [
    { slug: 'all' },
    ...collections.map((col) => ({
      slug: col.slug,
    })),
  ];
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const collection = getCollectionBySlug(resolvedParams.slug);

  if (!collection) {
    return {
      title: 'Collection Not Found | LE DAMAS',
      description: 'Requested collection is unavailable.',
    };
  }

  return generateCollectionMetadata(collection);
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const resolvedParams = await params;
  const collection = getCollectionBySlug(resolvedParams.slug);

  if (!collection) {
    notFound();
  }

  const products = getProductsByCollection(collection.slug);
  const allCollections = getAllCollections();

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900">
      <Header />
      <main className="flex-1">
        <CollectionGrid collection={collection} products={products} allCollections={allCollections} />
      </main>
      <Footer />
    </div>
  );
}
