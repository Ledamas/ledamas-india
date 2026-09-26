'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Check } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  avatarInitial: string;
  verified: boolean;
  location: string;
  rating: number;
  quote: string;
  purchasedProduct: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Mitesh Pitale',
    avatarInitial: 'M',
    verified: true,
    location: 'Mumbai',
    rating: 5,
    quote:
      'Outstanding experience! The craftsmanship of the Kataifi crunch paired with dark cacao is unmatched. Delivered in pristine cold-chain packaging with complete peace of mind. Highly recommend LE DAMAS!',
    purchasedProduct: 'Kunafa Pistachio Dark Chocolate - 200gm',
  },
  {
    id: 2,
    name: 'Pratyoosh Singh',
    avatarInitial: 'P',
    verified: true,
    location: 'Pune',
    rating: 5,
    quote:
      'A big thank you to the team for such warm hospitality! The spiced speculoos creme combined with toasted kunafa strands is rich, buttery, and unforgettable. Will definitely be coming back!',
    purchasedProduct: 'Speculoos Creme and Kunafa - 110gm',
  },
  {
    id: 3,
    name: 'Anjali Sharma',
    avatarInitial: 'A',
    verified: true,
    location: 'Mumbai',
    rating: 5,
    quote:
      'Amazing experience from start to finish! The organic cocoa butter white chocolate and slow-roasted hazelnut gianduja gave us total confidence. We are absolutely in love with the craftsmanship!',
    purchasedProduct: 'White Chocolate Hazelnut Creme - 200gm',
  },
  {
    id: 4,
    name: 'Kavita Reddy',
    avatarInitial: 'K',
    verified: true,
    location: 'Hyderabad',
    rating: 5,
    quote:
      'The Lebubu Kunafa Pistachio bar is pure perfection! Velvet alpine milk chocolate filled with generous pistachio creme and crispy kataifi. Everyone at our family gathering loved it!',
    purchasedProduct: 'Lebubu Milk Chocolate – Kunafa Pistachio',
  },
  {
    id: 5,
    name: 'Rohan Kapoor',
    avatarInitial: 'R',
    verified: true,
    location: 'Delhi NCR',
    rating: 5,
    quote:
      'Ordered the mini 35g bars as corporate luxury gifts. The packaging, gold foil wrapping, and taste exceeded all expectations. Extremely fast delivery and professional service!',
    purchasedProduct: 'Kunafa Pistachio Milk Chocolate – Mini Bar 35gm',
  },
  {
    id: 6,
    name: 'Siddharth Mehta',
    avatarInitial: 'S',
    verified: true,
    location: 'Bengaluru',
    rating: 5,
    quote:
      'Fast delivery, incredible insulated temperature packaging, and the chocolate tastes insanely good. The crunch of Belgian speculoos with alpine milk cacao is 10/10.',
    purchasedProduct: 'Crispy Speculoos Creme Milk Chocolate - 200gm',
  },
];

// Quadrupled array for infinite seamless looping ticker
const MARQUEE_TESTIMONIALS = [
  ...TESTIMONIALS,
  ...TESTIMONIALS,
  ...TESTIMONIALS,
  ...TESTIMONIALS,
];

export function TestimonialsCarousel() {
  return (
    <section id="testimonials" className="py-20 sm:py-24 bg-[#FAFAFA] text-[#2B2825] relative overflow-hidden border-t border-stone-200">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />

      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-3 mb-12 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 text-xs font-sans uppercase tracking-[0.25em] text-[#CB9700] font-bold">
          <span className="h-[1px] w-6 bg-[#CB9700]/60 inline-block"></span>
          <span>TESTIMONIALS</span>
          <span className="h-[1px] w-6 bg-[#CB9700]/60 inline-block"></span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-serif text-[#1F1C1A] font-bold tracking-tight">
          Trusted by Thousands of Satisfied Customers
        </h2>

        <p className="text-sm sm:text-base font-sans text-stone-500 font-normal">
          Discover why our customers love shopping with us
        </p>
      </div>

      {/* Infinite Horizontal Marquee Ticker */}
      <div className="relative w-full overflow-hidden py-4">
        {/* Edge Fade Overlay Masks */}
        <div className="pointer-events-none absolute top-0 bottom-0 left-0 w-16 sm:w-36 z-20 bg-gradient-to-r from-[#FAFAFA] to-transparent" />
        <div className="pointer-events-none absolute top-0 bottom-0 right-0 w-16 sm:w-36 z-20 bg-gradient-to-l from-[#FAFAFA] to-transparent" />

        {/* Marquee Motion Container */}
        <div className="flex overflow-hidden select-none">
          <motion.div
            className="flex items-stretch gap-6 shrink-0"
            animate={{ x: ['0%', '-25%'] }}
            transition={{
              ease: 'linear',
              duration: 35,
              repeat: Infinity,
            }}
          >
            {MARQUEE_TESTIMONIALS.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="w-[300px] sm:w-[380px] shrink-0 bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group"
              >
                {/* Profile Header & Review */}
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    {/* Avatar Circle */}
                    <div className="w-11 h-11 rounded-full bg-[#2B2825] text-white font-bold flex items-center justify-center text-base shrink-0 shadow-sm">
                      {item.avatarInitial}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-sans text-sm font-bold text-[#1F1C1A] truncate">
                          {item.name}
                        </h3>
                        {item.verified && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-medium bg-[#FFF8ED] text-[#B8860B] border border-[#F5E6CC] shrink-0">
                            <Check className="w-2.5 h-2.5" />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-stone-400 mt-0.5">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="flex space-x-1 mb-3">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                    ))}
                  </div>

                  {/* Quote Text */}
                  <div className="relative mb-4">
                    <span className="text-[#CB9700] text-xl font-serif leading-none select-none">“</span>
                    <p className="font-sans text-xs sm:text-sm text-stone-600 font-normal leading-relaxed inline px-1">
                      {item.quote}
                    </p>
                    <span className="text-[#CB9700] text-xl font-serif leading-none select-none">”</span>
                  </div>
                </div>

                {/* Card Footer: Purchased Product Tag */}
                <div className="pt-4 border-t border-stone-150 mt-auto">
                  <div className="flex items-start space-x-1.5 text-[11px] text-stone-500 font-sans">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="truncate">
                      <span className="font-medium text-stone-400 mr-1">Purchased:</span>
                      <span className="font-semibold text-stone-800 truncate">{item.purchasedProduct}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

