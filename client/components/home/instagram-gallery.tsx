'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Sparkles, ArrowUpRight } from 'lucide-react';

export function InstagramGallery() {
  const galleryItems = [
    {
      id: 1,
      image: '/Kunafa-and-Pistachio-Creme-1.png',
      title: 'Kunafa & Pistachio Crème Jars',
      price: '₹749',
      likes: '1.4k',
      href: '/products/kunafa-pistachio-creme-110g',
      category: 'Artisanal Spread',
    },
    {
      id: 2,
      image: '/Kunafa-Pistachio-Dark-Chocolate-1.png',
      title: 'Kunafa Dark Chocolate Bar',
      price: '₹1,799',
      likes: '2.1k',
      href: '/products/kunafa-pistachio-dark-chocolate-200g',
      category: '200gm Dark Bar',
    },
    {
      id: 3,
      image: '/Le-Bubu-1.png',
      title: 'Lebubu Milk Chocolate Signature',
      price: '₹449',
      likes: '3.8k',
      href: '/products/lebubu-milk-chocolate-kunafa-pistachio',
      category: 'Signature Edition',
    },
    {
      id: 4,
      image: '/Crispy-Speculoos-Creme-Milk-Chocolate-1.png',
      title: 'Crispy Speculoos Milk Chocolate',
      price: '₹1,649',
      likes: '1.9k',
      href: '/products/crispy-speculoos-creme-milk-chocolate-200g',
      category: '200gm Milk Bar',
    },
  ];

  return (
    <section id="gallery" className="py-20 sm:py-24 bg-[#F7F6F0] border-t border-stone-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Header with Instagram Profile Link */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-4">
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center space-x-2 text-xs font-sans uppercase tracking-[0.25em] text-[#CB9700] font-bold">
              <span className="h-[1px] w-6 bg-[#CB9700]/60 inline-block"></span>
              <span>ATELIER VISUALS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif text-[#2B2B2B] font-light">
              Behind The Atelier
            </h2>
            <p className="font-script text-2xl text-[#CB9700]">
              Delicious Since 1951
            </p>
          </div>

          <div>
            <a
              href="https://www.instagram.com/ledamasindia.official/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-sans text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-xs hover:shadow-md group cursor-pointer"
            >
              <svg
                className="w-4 h-4 text-[#C13584] group-hover:scale-110 transition-transform fill-none stroke-current stroke-2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span>Follow @ledamasindia.official</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700" />
            </a>
          </div>
        </div>

        {/* 4 Interactive Photo Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {galleryItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-white border border-stone-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block cursor-pointer"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-108"
              />

              {/* Hover Dark/Teal Luxury Reveal Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-5 sm:p-6 text-white">
                {/* Top Row: Sparkles & Likes */}
                <div className="flex justify-between items-center">
                  <span className="p-1.5 rounded-full bg-white/20 backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5 text-[#CB9700]" />
                  </span>
                  <div className="flex items-center space-x-1.5 text-xs bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    <span className="font-mono text-[11px]">{item.likes}</span>
                  </div>
                </div>

                {/* Bottom Row: Title, Price & Direct Product Link Cue */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-sans tracking-widest uppercase text-[#CB9700] font-bold">
                    {item.category}
                  </span>
                  <h3 className="font-serif text-base sm:text-lg text-white font-medium leading-snug line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-sans font-bold text-sm text-[#FAF6ED]">
                      {item.price}
                    </span>
                    <span className="inline-flex items-center space-x-1 text-xs font-sans text-[#CB9700] font-semibold group-hover:underline">
                      <span>View Chocolate</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
