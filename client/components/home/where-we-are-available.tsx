'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface Partner {
  id: string;
  name: string;
  logo: string;
}

const PARTNERS: Partner[] = [
  {
    id: 'blinkit',
    name: 'Blinkit',
    logo: '/Blinkit.webp'
  },
  {
    id: 'swiggy-instamart',
    name: 'Swiggy Instamart',
    logo: '/Swiggy instamart.jpg'
  },
  {
    id: 'sodhi',
    name: "Sodhi's",
    logo: '/Sodhi.webp'
  },
  {
    id: 'nature-basket',
    name: "Nature's Basket",
    logo: '/nature basket.jpg'
  },
  {
    id: 'modern-bazar',
    name: 'Modern Bazaar',
    logo: '/modern bazar.png'
  },
  {
    id: 'relay-airport',
    name: 'Relay',
    logo: '/relay airport.png'
  },
  {
    id: 'crossword',
    name: 'Crossword',
    logo: '/Crossword.jpg'
  },
  {
    id: 'q-mart',
    name: 'Qmart',
    logo: '/qmart.png'
  }
];

// Duplicated twice for seamless looping inside bounded card window
const MARQUEE_PARTNERS = [...PARTNERS, ...PARTNERS];

export function WhereWeAreAvailable() {
  return (
    <section
      id="where-we-are-available"
      className="py-12 sm:py-16 bg-[#FAFAFA] border-y border-stone-200/60 text-[#1F1C1A] relative overflow-hidden"
    >
      {/* Centered Poster Card Box Container */}
      <div className="max-w-4xl sm:max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/80 shadow-xl shadow-stone-200/50 relative overflow-hidden">

          {/* Card Header Section */}
          <div className="text-center mb-6 sm:mb-8 space-y-1.5">
            <span className="block text-[10px] sm:text-xs font-sans uppercase tracking-[0.2em] text-[#CB9700] font-bold">
              RETAIL & DELIVERY NETWORK
            </span>

            <h2 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-[#1F1C1A]">
              Where We Are Available
            </h2>

            {/* Accent Divider Line */}
            <div className="w-10 h-[2px] bg-[#CB9700]/70 mx-auto my-2 rounded-full" />

            <p className="text-xs sm:text-sm text-stone-500 font-sans font-light max-w-md mx-auto">
              Find our luxury chocolates at leading gourmet stores and instant delivery apps near you
            </p>
          </div>

          {/* Marquee Ticker track bounded inside the card box */}
          <div className="relative w-full overflow-hidden py-2">
            {/* Left & Right Edge Gradient Fade Masks */}
            <div className="pointer-events-none absolute top-0 bottom-0 left-0 w-16 sm:w-24 z-20 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute top-0 bottom-0 right-0 w-16 sm:w-24 z-20 bg-gradient-to-l from-white to-transparent" />

            {/* Marquee Motion Container */}
            <div className="flex overflow-hidden select-none">
              <motion.div
                className="flex items-center gap-4 sm:gap-5 shrink-0"
                animate={{ x: ['0%', '-50%'] }}
                transition={{
                  ease: 'linear',
                  duration: 38,
                  repeat: Infinity
                }}
              >
                {MARQUEE_PARTNERS.map((partner, index) => (
                  <div
                    key={`${partner.id}-${index}`}
                    className="group relative shrink-0 w-36 sm:w-44 h-20 sm:h-24 bg-[#FAF9F6] border border-stone-200/80 rounded-2xl p-3 flex items-center justify-center transition-all duration-300 hover:border-[#CB9700]/50 hover:bg-white hover:shadow-md cursor-pointer overflow-hidden"
                  >
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        fill
                        className="object-contain p-2 rounded-lg group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}


