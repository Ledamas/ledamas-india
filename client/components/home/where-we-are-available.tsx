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
    logo: '/blinkitt.jpg'
  },
  {
    id: 'swiggy-instamart',
    name: 'Swiggy Instamart',
    logo: '/Swiggy-instamart.jpg'
  },
  {
    id: 'sodhi',
    name: "Sodhi's",
    logo: '/Sodhi.webp'
  },
  {
    id: 'nature-basket',
    name: "Nature's Basket",
    logo: '/nature-basket.jpg'
  },
  {
    id: 'modern-bazar',
    name: 'Modern Bazaar',
    logo: '/modern-bazar.png'
  },
  {
    id: 'relay-airport',
    name: 'Relay',
    logo: '/relay-airport.png'
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

// Duplicated enough times to fill ultra-wide screens seamlessly
const MARQUEE_PARTNERS = [...PARTNERS, ...PARTNERS, ...PARTNERS, ...PARTNERS];

export function WhereWeAreAvailable() {
  return (
    <section
      id="where-we-are-available"
      className="py-12 sm:py-16 bg-white border-y border-stone-200/60 text-[#1F1C1A] relative overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Title */}
        <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.2em] uppercase text-[#1F1C1A] text-center mb-10 sm:mb-14">
          We Are Available On
        </h2>

        {/* Marquee Ticker Track */}
        <div className="relative w-full overflow-hidden pb-4">
          {/* Left & Right Edge Gradient Fade Masks */}
          <div className="pointer-events-none absolute top-0 bottom-0 left-0 w-16 sm:w-32 z-20 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute top-0 bottom-0 right-0 w-16 sm:w-32 z-20 bg-gradient-to-l from-white to-transparent" />

          {/* Marquee Motion Container */}
          <div className="flex overflow-hidden select-none">
            <motion.div
              className="flex items-center gap-8 sm:gap-14 shrink-0 pr-8 sm:pr-14"
              animate={{ x: ['0%', '-50%'] }}
              transition={{
                ease: 'linear',
                duration: 60,
                repeat: Infinity
              }}
            >
              {MARQUEE_PARTNERS.map((partner, index) => (
                <div
                  key={`${partner.id}-${index}`}
                  className="group flex flex-col items-center justify-center shrink-0 w-20 sm:w-24 gap-4 cursor-pointer"
                >
                  {/* Icon Square */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-105">
                    <div className="relative w-full h-full">
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        fill
                        className="object-contain rounded-md"
                        unoptimized
                      />
                    </div>
                  </div>
                  
                  {/* Label Below */}
                  <span className="text-[9px] sm:text-[10px] font-sans font-semibold uppercase tracking-widest text-stone-500 group-hover:text-[#CB9700] transition-colors text-center">
                    {partner.name}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
}


