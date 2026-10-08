import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { MobileSearchOverlay } from '../../components/search/mobile-search-overlay';

export const metadata: Metadata = {
  title: 'Search | LE DAMAS',
  description: 'Search for luxury chocolates, gift boxes, and more.',
};

export default function SearchPage() {
  return (
    <div className="bg-white min-h-screen w-full">
      <Suspense fallback={null}>
        <MobileSearchOverlay />
      </Suspense>
    </div>
  );
}
