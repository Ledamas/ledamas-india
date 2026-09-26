import { Product, Collection } from './types';
import { SITE_URL } from './seo';

export function generateProductJsonLd(product: Product, canonicalUrl?: string) {
  const url = canonicalUrl || `${SITE_URL}/products/${product.slug}`;
  const mainImage = product.images[0] || `${SITE_URL}/images/og-default.jpg`;

  const offers: Record<string, unknown> = {
    '@type': 'Offer',
    url,
    priceCurrency: product.currency || 'INR',
    price: product.price,
    itemCondition: 'https://schema.org/NewCondition',
    availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    seller: {
      '@type': 'Organization',
      name: 'LE DAMAS',
    },
  };

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images.map((img) => (img.startsWith('http') ? img : `${SITE_URL}${img}`)),
    description: product.shortDescription || product.description,
    sku: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'LE DAMAS',
    },
    offers,
  };

  // Only include AggregateRating if valid rating & review count exist (do NOT fake)
  if (product.rating && product.rating > 0 && (product.reviewsCount || product.reviewCount)) {
    const count = product.reviewsCount || product.reviewCount || 0;
    if (count > 0) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: count,
        bestRating: 5,
        worstRating: 1,
      };
    }
  }

  return schema;
}

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.item.startsWith('http') ? crumb.item : `${SITE_URL}${crumb.item}`,
    })),
  };
}

export function generateCollectionJsonLd(collection: Collection, products: Product[], canonicalUrl?: string) {
  const url = canonicalUrl || `${SITE_URL}/collections/${collection.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.name,
    description: collection.description,
    url,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/products/${product.slug}`,
        name: product.name,
      })),
    },
  };
}
