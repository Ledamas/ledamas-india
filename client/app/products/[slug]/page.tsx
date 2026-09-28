import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllProducts, getRelatedProducts } from '../../../lib/products';
import { getProductBySlugFromDb } from '../../../lib/services/product-service';
import { generateProductMetadata } from '../../../lib/seo';
import { Header } from '../../../components/layout/header';
import { Footer } from '../../../components/layout/footer';
import { ProductDetail } from '../../../components/product/product-detail';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = getAllProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductBySlugFromDb(resolvedParams.slug);

  if (!product) {
    return {
      title: 'Product Not Found | LE DAMAS',
      description: 'Requested chocolate bar is not available.',
    };
  }

  return generateProductMetadata(product);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const product = await getProductBySlugFromDb(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(product, 4);

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900">
      <Header />
      <main className="flex-1">
        <ProductDetail product={product} relatedProducts={relatedProducts} />
      </main>
      <Footer />
    </div>
  );
}
