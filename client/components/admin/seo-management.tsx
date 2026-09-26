'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { PRODUCTS } from '@/lib/products';

export interface SeoPageRecord {
  id: string;
  pageName: string;
  urlSlug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  schemaType: string;
  indexingStatus: 'INDEXED' | 'PENDING';
}

const INITIAL_SEO_PAGES: SeoPageRecord[] = [
  {
    id: 'seo-home',
    pageName: 'Homepage',
    urlSlug: '/',
    metaTitle: 'LE DAMAS | Luxury Middle Eastern & Artisanal Chocolates',
    metaDescription: 'Discover LE DAMAS, India’s premier luxury chocolate house. Handcrafted Kunafa Pistachio bars, Bueno White Dubai Chocolates, and Speculoos cremes.',
    keywords: ['luxury chocolate India', 'kunafa pistachio chocolate', 'dubai chocolate bar', 'artisanal dark chocolate'],
    schemaType: 'Organization & WebSite',
    indexingStatus: 'INDEXED',
  },
  {
    id: 'seo-shop',
    pageName: 'Shop Catalog',
    urlSlug: '/shop',
    metaTitle: 'Shop Luxury Chocolates Online | LE DAMAS Collection',
    metaDescription: 'Browse artisanal dark chocolate bars, milk chocolate cremes, and luxury gift assortments with nationwide cold-chain delivery.',
    keywords: ['buy dubai chocolate online', 'luxury gifting India', 'kunafa chocolate bar'],
    schemaType: 'CollectionPage',
    indexingStatus: 'INDEXED',
  },
  ...PRODUCTS.slice(0, 4).map((p) => ({
    id: `seo-${p.id}`,
    pageName: p.name,
    urlSlug: `/products/${p.slug}`,
    metaTitle: p.seoTitle || `${p.name} | LE DAMAS`,
    metaDescription: p.metaDescription || p.shortDescription || '',
    keywords: [p.primaryKeyword || p.name, ...(p.secondaryKeywords || [])],
    schemaType: 'Product',
    indexingStatus: 'INDEXED' as const,
  })),
];

export const SeoManagement: React.FC = () => {
  const [seoPages, setSeoPages] = useState<SeoPageRecord[]>(INITIAL_SEO_PAGES);
  const [selectedPage, setSelectedPage] = useState<SeoPageRecord>(seoPages[0]);
  const [newKeyword, setNewKeyword] = useState('');

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    const updated = {
      ...selectedPage,
      keywords: [...selectedPage.keywords, newKeyword.trim()],
    };
    setSelectedPage(updated);
    setSeoPages(seoPages.map((p) => (p.id === selectedPage.id ? updated : p)));
    setNewKeyword('');
  };

  const handleRemoveKeyword = (kwToRemove: string) => {
    const updated = {
      ...selectedPage,
      keywords: selectedPage.keywords.filter((kw) => kw !== kwToRemove),
    };
    setSelectedPage(updated);
    setSeoPages(seoPages.map((p) => (p.id === selectedPage.id ? updated : p)));
  };

  const handleSaveSEO = () => {
    setSeoPages(seoPages.map((p) => (p.id === selectedPage.id ? selectedPage : p)));
    alert(`SEO metadata and structured schema updated for ${selectedPage.pageName}!`);
  };

  return (
    <div className="space-y-8 bg-white text-stone-900 p-6 rounded-2xl border border-stone-200 shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h2 className="type-page-title text-3xl font-serif font-bold text-black tracking-wide">
            📈 SEO & Structured Schema Studio
          </h2>
          <p className="type-body text-stone-600 text-sm mt-1">
            Optimize meta titles, descriptions, canonical URLs, XML sitemaps, and auto-generate Google Rich Snippet JSON-LD schemas.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-mono text-emerald-800 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Sitemap.xml Valid & Synced</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Page List Side Panel */}
        <div className="space-y-3">
          <h3 className="text-xs font-sans font-bold text-black uppercase tracking-wider">Select Page / Route</h3>
          <div className="space-y-2">
            {seoPages.map((page) => (
              <button
                key={page.id}
                onClick={() => setSelectedPage(page)}
                className={`w-full text-left p-4 rounded-xl border font-sans text-xs transition-all cursor-pointer ${
                  selectedPage.id === page.id
                    ? 'bg-black text-white border-black font-bold shadow-xs'
                    : 'bg-stone-50 text-stone-900 border-stone-200 hover:border-black'
                }`}
              >
                <p className="font-semibold text-sm font-serif">{page.pageName}</p>
                <p className={`font-mono text-[11px] ${selectedPage.id === page.id ? 'text-stone-300' : 'text-[#CB9700]'}`}>
                  {page.urlSlug}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* SEO Editor Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Google Search Preview Card */}
          <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 space-y-2 shadow-xs">
            <span className="text-[10px] uppercase font-mono font-bold text-black">Google Search Snippet Preview</span>
            <div className="p-4 rounded-xl bg-white text-black space-y-1 font-sans border border-stone-300">
              <p className="text-xs text-[#202124] font-mono">https://ledamas.in{selectedPage.urlSlug}</p>
              <h4 className="text-base text-[#1a0dab] font-semibold hover:underline cursor-pointer line-clamp-1">
                {selectedPage.metaTitle}
              </h4>
              <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                {selectedPage.metaDescription}
              </p>
            </div>
          </div>

          {/* Form Editors */}
          <div className="p-6 rounded-xl bg-white border border-stone-200 space-y-4 shadow-xs">
            <h3 className="text-base font-serif font-bold text-black border-b border-stone-200 pb-3">
              Edit Metadata & Schema
            </h3>

            <div>
              <label className="type-label text-xs font-sans text-stone-700 block mb-1">
                Meta Title Tag ({selectedPage.metaTitle.length}/60 chars)
              </label>
              <input
                type="text"
                value={selectedPage.metaTitle}
                onChange={(e) => setSelectedPage({ ...selectedPage, metaTitle: e.target.value })}
                className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none"
              />
            </div>

            <div>
              <label className="type-label text-xs font-sans text-stone-700 block mb-1">
                Meta Description ({selectedPage.metaDescription.length}/160 chars)
              </label>
              <textarea
                rows={3}
                value={selectedPage.metaDescription}
                onChange={(e) => setSelectedPage({ ...selectedPage, metaDescription: e.target.value })}
                className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none"
              />
            </div>

            {/* Keyword Tagger */}
            <div>
              <label className="type-label text-xs font-sans text-stone-700 block mb-1">
                Target Keywords
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Add target keyword..."
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                  className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="px-4 py-2.5 rounded-xl bg-black text-white font-bold text-xs shrink-0 cursor-pointer"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedPage.keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full text-xs font-sans bg-stone-100 text-black border border-stone-300 flex items-center gap-1 font-semibold"
                  >
                    #{kw}
                    <button onClick={() => handleRemoveKeyword(kw)} className="hover:text-rose-600 font-bold ml-1">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Schema JSON-LD Preview */}
            <div className="pt-2">
              <label className="type-label text-xs font-sans text-stone-700 block mb-1">
                Auto-Generated JSON-LD Schema ({selectedPage.schemaType})
              </label>
              <pre className="p-3 rounded-xl bg-stone-900 text-[11px] font-mono text-emerald-400 overflow-x-auto border border-stone-800">
{JSON.stringify(
  {
    '@context': 'https://schema.org',
    '@type': selectedPage.schemaType,
    name: selectedPage.pageName,
    url: `https://ledamas.in${selectedPage.urlSlug}`,
    description: selectedPage.metaDescription,
    brand: { '@type': 'Brand', name: 'LE DAMAS' },
  },
  null,
  2
)}
              </pre>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSaveSEO}
                className="px-6 py-2.5 rounded-xl bg-black text-white font-bold text-xs shadow-md hover:bg-stone-800 cursor-pointer"
              >
                Save SEO & Publish Metadata
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
