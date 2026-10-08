'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroSectionProps {
  ctaText?: string;
  ctaLink?: string;
}

export function HeroSection({
  ctaText = 'Explore Collection',
  ctaLink = '/collections/all',
}: HeroSectionProps) {
  // Collection of all signature product photos for animated background
  const collectionImages = [
    {
      src: '/Kunafa-Pistachio-Dark-Chocolate-1.png',
      name: 'Kunafa Pistachio Dark Bar',
    },
    {
      src: '/Kunafa-Pistachio-Milk-Chocolate-1.png',
      name: 'Kunafa Pistachio Milk Bar',
    },
    {
      src: '/Le-Bubu-2.png',
      name: 'Le Bubu Signature Edition',
    },
    {
      src: '/Crispy-Speculoos-Creme-Milk-Chocolate-1.png',
      name: 'Crispy Speculoos Milk Chocolate',
    },
    {
      src: '/White-Chocolate-Hazelnut-Creme-1.png',
      name: 'Belgian White Hazelnut Bar',
    },
    {
      src: '/Kunafa-and-Pistachio-Creme-1.png',
      name: 'Artisanal Pistachio Spread',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Automated background photo transition timer (every 4.5s)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % collectionImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [collectionImages.length]);

  // Ambient particle configuration for luxury floating shimmer effect
  const particles = Array.from({ length: 16 }).map((_, i) => ({
    id: i,
    size: 3 + (i % 4) * 2,
    x: (i * 6.5) % 95 + 2,
    delay: (i * 0.35) % 3,
    duration: 6 + (i % 5) * 2,
  }));

  return (
    <section className="relative h-screen min-h-[720px] w-full overflow-hidden bg-[#0F0D0C] flex flex-col justify-between pt-[110px] sm:pt-32 pb-10">
      {/* Animated Background Photo Collection Crossfade & Ken-Burns Zoom */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={collectionImages[currentIndex].src}
              alt={collectionImages[currentIndex].name}
              fill
              priority
              className="object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {/* Multi-layered Dark Vignette Overlay for Crisp Header & Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-black/90 pointer-events-none" />
      </div>

      {/* Ambient Floating Luxury Gold Particles Animation */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-[#CB9700]/70 blur-[1px]"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              bottom: '-5%',
            }}
            animate={{
              y: ['0vh', '-110vh'],
              opacity: [0, 0.8, 0.4, 0],
              scale: [0.8, 1.4, 0.8],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Top Floating Heritage Pill Badge */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-[#D5B268]/40 text-[11px] font-sans tracking-[0.25em] text-[#D5B268] uppercase shadow-xl"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#CB9700] animate-pulse" />
          <span>Handcrafted Luxury &bull; Since 1951</span>
        </motion.div>
      </div>

      {/* Center Hero Heading & Subtitle Overlay */}
      <div className="relative z-20 max-w-4xl mx-auto px-6 text-center space-y-4 my-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-serif type-hero text-white drop-shadow-2xl"
        >
          Dubai Kunafa & Pistachio <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E5C57B] via-[#FAF6ED] to-[#CB9700]">
            Artisanal Confections
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="font-sans type-body text-stone-200 font-light max-w-2xl mx-auto drop-shadow-md"
        >
          Crispy kataifi pastry, velvet pistachio creme, and rich dark chocolate — handcrafted to perfection.
        </motion.p>
      </div>

      {/* Bottom CTA Button & Interactive Photo Slideshow Dots Indicator */}
      <div className="relative z-20 flex flex-col items-center gap-4 pb-2">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Link href={ctaLink}>
            <button className="px-9 py-4 bg-[#CB9700] hover:bg-[#b08000] text-white text-xs tracking-[0.3em] font-semibold uppercase transition-all duration-300 rounded-full shadow-2xl hover:scale-105 active:scale-95 border border-white/20">
              {ctaText.toUpperCase()}
            </button>
          </Link>
        </motion.div>

        {/* Collection Photo Thumbnails / Indicators Bar */}
        <div className="flex items-center gap-2 pt-2">
          {collectionImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 transition-all duration-500 rounded-full ${
                currentIndex === idx
                  ? 'w-8 bg-[#CB9700]'
                  : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Show ${img.name}`}
            />
          ))}
        </div>

        {/* Current Active Photo Label */}
        <span className="text-[10px] font-sans font-light uppercase tracking-[0.2em] text-stone-300/80">
          {collectionImages[currentIndex].name} ({currentIndex + 1}/{collectionImages.length})
        </span>
      </div>
    </section>
  );
}

