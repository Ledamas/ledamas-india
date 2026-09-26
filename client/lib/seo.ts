import type { Metadata } from 'next';
import { Product, Collection } from './types';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ledamas.in';
export const SITE_NAME = 'LE DAMAS';

export interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  image?: string;
  keywords?: string[];
  noIndex?: boolean;
}

export function constructMetadata({
  title,
  description,
  canonicalUrl,
  image = `${SITE_URL}/images/og-default.jpg`,
  keywords = [
    'luxury chocolate India',
    'kunafa chocolate',
    'dubai chocolate bar',
    'kunafa pistachio chocolate',
    'artisan dark chocolate',
    'single origin cacao',
    'Le Damas'
  ],
  noIndex = false,
}: SEOProps): Metadata {
  const canonical = canonicalUrl ? (canonicalUrl.startsWith('http') ? canonicalUrl : `${SITE_URL}${canonicalUrl}`) : SITE_URL;

  return {
    title: `${title}`,
    description,
    keywords,
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: 'en_IN',
      type: 'website',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@ledamas_official',
    },
  };
}

export function generateProductMetadata(product: Product): Metadata {
  const title = product.seoTitle || `${product.name} | LE DAMAS Luxury Chocolates`;
  const description = product.metaDescription || product.shortDescription || product.description;
  const canonicalUrl = `${SITE_URL}/products/${product.slug}`;
  const image = product.images[0] || `${SITE_URL}/images/og-default.jpg`;
  const keywords = [
    product.primaryKeyword || product.name.toLowerCase(),
    ...(product.secondaryKeywords || []),
    'LE DAMAS',
    'luxury chocolate',
  ];

  return constructMetadata({
    title,
    description,
    canonicalUrl,
    image,
    keywords,
  });
}

export function generateCollectionMetadata(collection: Collection): Metadata {
  const title = collection.seoTitle || `${collection.name} Collection | LE DAMAS`;
  const description = collection.metaDescription || collection.description;
  const canonicalUrl = `${SITE_URL}/collections/${collection.slug}`;
  const image = collection.heroImage;
  const keywords = [
    collection.primaryKeyword,
    ...(collection.secondaryKeywords || []),
    'LE DAMAS collection',
  ];

  return constructMetadata({
    title,
    description,
    canonicalUrl,
    image,
    keywords,
  });
}
