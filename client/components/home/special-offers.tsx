'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export function SpecialOffers() {
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl text-center text-[#333] font-bold mb-10 sm:mb-14 font-serif">
          Special Offers & Promotions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">

          {/* Card 1: Yellow */}
          <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#FFE74C] to-[#FFD500] p-6 sm:p-8 flex flex-col items-center justify-center text-[#333] shadow-sm">
            {/* Background Decorations */}
            <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-black/5" />
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-black/5" />

            <div className="absolute top-6 left-6">
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider border border-[#333]/20 rounded-full">
                Stay Tuned
              </span>
            </div>
            <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
              <ChevronDown className="w-4 h-4 text-[#333]/60" />
            </div>

            <div className="mt-8 mb-4 text-center z-10">
              <h3 className="text-2xl font-bold mb-1">Coming Soon</h3>
              <p className="text-sm font-semibold">Stay Tuned</p>
            </div>

            <div className="bg-white px-6 py-2 rounded-lg shadow-sm font-bold text-sm mb-6 z-10 relative">
              Special Offers
              {/* Little decorative dot */}
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#FF8A00] opacity-80" />
            </div>

            <p className="text-sm font-bold text-center max-w-[200px] mb-12 z-10">
              New and exciting offers are on their way.
            </p>

            <div className="absolute bottom-6 right-6 z-10">
              <button className="bg-[#2C303A] text-white text-[11px] font-bold px-4 py-2 rounded-md shadow-sm opacity-90 cursor-default">
                Shop Now
              </button>
            </div>
          </div>

          {/* Card 2: Brown */}
          <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#A64A17] to-[#80310A] p-6 sm:p-8 flex flex-col items-center justify-center text-white shadow-sm">
            {/* Background Decorations */}
            <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/5" />
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/5" />

            <div className="absolute top-6 left-6">
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider border border-white/30 rounded-full bg-white/10">
                Upcoming
              </span>
            </div>
            <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <ChevronDown className="w-4 h-4 text-white/70" />
            </div>

            <div className="mt-8 mb-4 text-center z-10">
              <h3 className="text-2xl font-bold mb-1">Exclusive Deals</h3>
              <p className="text-sm font-semibold">Members Only</p>
            </div>

            <div className="bg-white px-6 py-2 rounded-lg shadow-sm font-bold text-[#A64A17] text-sm mb-6 z-10 relative">
              Get Ready
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#FFB627] opacity-90" />
            </div>

            <p className="text-sm font-bold text-center max-w-[220px] mb-12 z-10">
              Exclusive benefits for our valued members.
            </p>

            <div className="absolute bottom-6 right-6 z-10">
              <button className="bg-white text-[#80310A] text-[11px] font-bold px-4 py-2 rounded-md shadow-sm opacity-90 cursor-default">
                Shop Now
              </button>
            </div>
          </div>

          {/* Card 3: Purple */}
          <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#9655FF] to-[#7B3FE4] p-6 sm:p-8 flex flex-col items-center justify-center text-white shadow-sm">
            {/* Background Decorations */}
            <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/5" />
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10" />

            <div className="absolute top-6 left-6">
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider border border-white/30 rounded-full bg-white/10">
                Coming Soon
              </span>
            </div>
            <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <ChevronDown className="w-4 h-4 text-white/70" />
            </div>

            <div className="mt-8 mb-4 text-center z-10">
              <h3 className="text-2xl font-bold mb-1">Festive Offers</h3>
              <p className="text-sm font-semibold">Celebrate with Us</p>
            </div>

            <div className="bg-white px-6 py-2 rounded-lg shadow-sm font-bold text-[#7B3FE4] text-sm mb-6 z-10 relative">
              Big Savings
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#FF9F1C] opacity-90" />
            </div>

            <p className="text-sm font-bold text-center max-w-[220px] mb-12 z-10">
              Incredible discounts for the upcoming festive season.
            </p>

            <div className="absolute bottom-6 right-6 z-10">
              <button className="bg-white text-[#7B3FE4] text-[11px] font-bold px-4 py-2 rounded-md shadow-sm opacity-90 cursor-default">
                Shop Now
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
