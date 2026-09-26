'use client';

import React, { useState } from 'react';
import {
  Layout,
  Sparkles,
  Star,
  Eye,
  Edit,
  Save,
  Megaphone,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { PRODUCTS } from '@/lib/products';
import { Product } from '@/lib/types';

export const WebsiteDisplayManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [announcementText, setAnnouncementText] = useState(
    'Complimentary Pan-India Express Cold-Chain Shipping on Orders Above ₹2,499 🚚✨'
  );
  const [announcementLink, setAnnouncementLink] = useState('/shop');
  const [heroTitle, setHeroTitle] = useState('Crafted for Royalty');
  const [heroTagline, setHeroTagline] = useState('Artisanal Middle Eastern Confections & Single-Origin Dark Cacao');

  const toggleFeatured = (id: string) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, isFeatured: !p.isFeatured } : p))
    );
  };

  const toggleBestSeller = (id: string) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, isBestSeller: !p.isBestSeller } : p))
    );
  };

  const toggleNewRelease = (id: string) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, isNewRelease: !p.isNewRelease } : p))
    );
  };

  const toggleVisibility = (id: string) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p))
    );
  };

  return (
    <div className="space-y-8 bg-white text-stone-900 p-6 rounded-2xl border border-stone-200 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h2 className="type-page-title text-3xl font-serif font-bold text-black tracking-wide">
            🖼 Homepage & Website Display Manager
          </h2>
          <p className="type-body text-stone-600 text-sm mt-1">
            Control homepage featured products, new arrivals, best sellers, hero banners, and top announcement ticker.
          </p>
        </div>

        <button
          onClick={() => alert('Website layout changes published to live storefront!')}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-black hover:bg-stone-800 text-white font-sans text-xs font-bold shadow-md cursor-pointer"
        >
          <Save className="w-4 h-4 text-white" />
          <span>Publish Display Changes</span>
        </button>
      </div>

      {/* 1. Top Announcement Bar Config */}
      <div className="p-6 rounded-xl bg-stone-50 border border-stone-200 space-y-4 shadow-xs">
        <div className="flex items-center space-x-2">
          <Megaphone className="w-5 h-5 text-black" />
          <h3 className="font-serif font-bold text-black text-lg">Top Website Announcement Bar</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="type-label text-stone-700 block mb-1 font-bold">Announcement Message *</label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full bg-white text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none font-bold"
            />
          </div>
          <div>
            <label className="type-label text-stone-700 block mb-1 font-bold">Target Link URL</label>
            <input
              type="text"
              value={announcementLink}
              onChange={(e) => setAnnouncementLink(e.target.value)}
              className="w-full bg-white text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none font-mono font-bold"
            />
          </div>
        </div>

        <div className="p-3 rounded-lg bg-black text-white text-xs font-sans text-center flex items-center justify-center gap-2">
          <span className="font-mono text-white uppercase font-bold text-[10px] bg-stone-800 px-2 py-0.5 rounded border border-stone-700">Preview</span>
          <span className="font-bold">{announcementText}</span>
        </div>
      </div>

      {/* 2. Hero Banner Config */}
      <div className="p-6 rounded-xl bg-stone-50 border border-stone-200 space-y-4 shadow-xs">
        <div className="flex items-center space-x-2">
          <ImageIcon className="w-5 h-5 text-black" />
          <h3 className="font-serif font-bold text-black text-lg">Homepage Hero Banner & Copy</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="type-label text-stone-700 block mb-1 font-bold">Hero Title</label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full bg-white text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none font-serif text-sm font-bold"
            />
          </div>
          <div>
            <label className="type-label text-stone-700 block mb-1 font-bold">Hero Tagline</label>
            <input
              type="text"
              value={heroTagline}
              onChange={(e) => setHeroTagline(e.target.value)}
              className="w-full bg-white text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none font-bold"
            />
          </div>
        </div>
      </div>

      {/* 3. Product Display Toggles (Featured, Best Seller, New Arrival, Visibility) */}
      <div className="space-y-4">
        <h3 className="font-serif font-bold text-black text-xl flex items-center gap-2">
          <Layout className="w-5 h-5 text-black" /> Product Section Placement Toggles
        </h3>

        <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-xs font-sans text-stone-600 uppercase tracking-wider bg-stone-100 font-extrabold">
                  <th className="py-4 px-4">Live Product</th>
                  <th className="py-4 px-4 text-center">Featured on Homepage</th>
                  <th className="py-4 px-4 text-center">Best Seller Tag</th>
                  <th className="py-4 px-4 text-center">New Arrival Tag</th>
                  <th className="py-4 px-4 text-center">Store Visibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-sm font-sans">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-stone-50 transition-colors font-bold text-black">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-cover border border-stone-300 bg-stone-100 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-black font-serif">{prod.name}</p>
                          <p className="text-xs text-stone-500 font-sans">{prod.category} • ₹{prod.price}</p>
                        </div>
                      </div>
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => toggleFeatured(prod.id)}
                        className={`px-3 py-1 rounded-full text-xs font-mono font-bold cursor-pointer transition-all ${
                          prod.isFeatured
                            ? 'bg-black text-white shadow-xs'
                            : 'bg-stone-100 text-stone-500 border border-stone-300'
                        }`}
                      >
                        {prod.isFeatured ? '★ Featured' : 'Off'}
                      </button>
                    </td>

                    {/* Best Seller Toggle — Pure Black / Slate */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => toggleBestSeller(prod.id)}
                        className={`px-3 py-1 rounded-full text-xs font-mono font-bold cursor-pointer transition-all ${
                          prod.isBestSeller
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-stone-100 text-stone-500 border border-stone-300'
                        }`}
                      >
                        {prod.isBestSeller ? '🔥 Best Seller' : 'Off'}
                      </button>
                    </td>

                    {/* New Release Toggle */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => toggleNewRelease(prod.id)}
                        className={`px-3 py-1 rounded-full text-xs font-mono font-bold cursor-pointer transition-all ${
                          prod.isNewRelease
                            ? 'bg-cyan-100 text-cyan-900 border border-cyan-300 font-bold'
                            : 'bg-stone-100 text-stone-500 border border-stone-300'
                        }`}
                      >
                        {prod.isNewRelease ? '✨ New Arrival' : 'Off'}
                      </button>
                    </td>

                    {/* Store Visibility */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => toggleVisibility(prod.id)}
                        className={`px-3 py-1 rounded-full text-xs font-mono font-bold cursor-pointer transition-all ${
                          prod.inStock
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}
                      >
                        {prod.inStock ? 'Visible' : 'Hidden'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

