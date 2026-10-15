'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Copy, Check, Sparkles, Gift, PackageCheck } from 'lucide-react';

export function SpecialOffers() {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      navigator.clipboard.writeText('FIRST5');
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <section className="bg-[#FAF9F5] py-14 sm:py-20 border-t border-stone-200/80 relative overflow-hidden">
      {/* Subtle Warm Gradient Accent */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-stone-100/60 to-transparent pointer-events-none" />

      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-12 relative z-10 space-y-10 sm:space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 text-xs font-sans uppercase tracking-[0.25em] text-[#CB9700] font-bold">
            <span className="h-[1px] w-6 bg-[#CB9700]/60 inline-block"></span>
            <span>CURATED PRIVILEGES</span>
            <span className="h-[1px] w-6 bg-[#CB9700]/60 inline-block"></span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl text-[#1A1817] font-bold font-serif tracking-tight">
            Special Offers & Promotions
          </h2>

          <p className="text-xs sm:text-sm font-sans text-stone-500 font-normal max-w-lg mx-auto">
            Experience Mediterranean craftsmanship with exclusive seasonal privileges and curated gifting collections.
          </p>
        </div>

        {/* 3 Luxury Promotional Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">

          {/* Card 1: First Order 5% OFF (Warm Dark Cacao & Gold) */}
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#241A15] via-[#1B1410] to-[#0F0B09] p-7 sm:p-8 flex flex-col justify-between text-white border border-[#CB9700]/30 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#CB9700]/60 hover:shadow-2xl">
            {/* Ambient Background Glow */}
            <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#CB9700]/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-[#A86B2B]/10 blur-3xl pointer-events-none" />

            <div>
              {/* Badge & Top Indicator */}
              <div className="flex items-center justify-between mb-6">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 text-[10px] font-sans font-bold uppercase tracking-widest rounded-full bg-[#CB9700]/20 text-[#FAF6ED] border border-[#CB9700]/40">
                  <Sparkles className="w-3 h-3 text-[#CB9700]" />
                  <span>WELCOME PRIVILEGE</span>
                </span>
                <span className="text-[11px] font-mono text-[#D5B268] font-semibold">5% OFF</span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2 mb-6">
                <h3 className="font-serif text-2xl sm:text-3xl text-white font-medium leading-snug">
                  5% Off Your First Order
                </h3>
                <p className="font-sans text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
                  Indulge in authentic Dubai Kunafa & Pistachio luxury chocolates with a special welcome gift on your first purchase.
                </p>
              </div>

              {/* Interactive Coupon Code Box */}
              <div className="mb-8">
                <button
                  onClick={handleCopyCode}
                  type="button"
                  title="Click to copy coupon code"
                  className="w-full group/btn flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-[#CB9700]/40 hover:bg-white/10 hover:border-[#CB9700] transition-all cursor-pointer"
                >
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-sans uppercase tracking-wider text-stone-400">Coupon Code</span>
                    <span className="font-mono text-base font-bold text-[#CB9700] tracking-widest">FIRST5</span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-xs font-sans text-stone-300 group-hover/btn:text-white transition-colors">
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                        <span className="text-emerald-400 font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#CB9700]" />
                        <span className="text-[11px] font-semibold">Copy Code</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Bottom CTA Button */}
            <div className="pt-2">
              <Link href="/shop" className="block w-full">
                <button
                  type="button"
                  className="w-full py-3.5 px-6 rounded-full bg-[#CB9700] hover:bg-[#d9a408] active:scale-[0.98] text-stone-950 font-sans text-xs font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                >
                  <span>Claim & Shop Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>

          {/* Card 2: Signature Gifting Collection (Roasted Praline & Dark Cocoa) */}
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#382013] via-[#2A160C] to-[#180C05] p-7 sm:p-8 flex flex-col justify-between text-white border border-[#D5B268]/35 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#D5B268]/60 hover:shadow-2xl">
            {/* Ambient Background Glow */}
            <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#D5B268]/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-[#A86B2B]/10 blur-3xl pointer-events-none" />

            <div>
              {/* Badge & Top Indicator */}
              <div className="flex items-center justify-between mb-6">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 text-[10px] font-sans font-bold uppercase tracking-widest rounded-full bg-white/10 text-[#FAF6ED] border border-white/20">
                  <Gift className="w-3 h-3 text-[#D5B268]" />
                  <span>CURATED HAMPERS</span>
                </span>
                <span className="text-[11px] font-mono text-[#D5B268] font-semibold">ALL OCCASIONS</span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2 mb-6">
                <h3 className="font-serif text-2xl sm:text-3xl text-white font-medium leading-snug">
                  Artisanal Luxury Gifting
                </h3>
                <p className="font-sans text-xs sm:text-sm text-[#E6D5C9] font-light leading-relaxed">
                  Celebrate weddings, corporate milestones, and festive occasions with bespoke gold-embossed gift boxes.
                </p>
              </div>

              {/* Feature Highlights Box */}
              <div className="mb-8 p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center space-x-2 text-xs text-[#FAF6ED]">
                  <PackageCheck className="w-4 h-4 text-[#D5B268] shrink-0" />
                  <span>Custom Foil Branding & Personal Notes</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-[#FAF6ED]">
                  <PackageCheck className="w-4 h-4 text-[#D5B268] shrink-0" />
                  <span>Insulated Cold-Chain Pan-India Delivery</span>
                </div>
              </div>
            </div>

            {/* Bottom CTA Button */}
            <div className="pt-2">
              <Link href="/collections" className="block w-full">
                <button
                  type="button"
                  className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-stone-100 active:scale-[0.98] text-[#3D2314] font-sans text-xs font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                >
                  <span>Explore Gift Boxes</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>

          {/* Card 3: Mini Bar Discovery Pack (Bittersweet Bronze & Gold) */}
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2D2419] via-[#1E1710] to-[#120E09] p-7 sm:p-8 flex flex-col justify-between text-white border border-[#CB9700]/30 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#CB9700]/60 hover:shadow-2xl">
            {/* Ambient Background Glow */}
            <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#CB9700]/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-[#8C5219]/10 blur-3xl pointer-events-none" />

            <div>
              {/* Badge & Top Indicator */}
              <div className="flex items-center justify-between mb-6">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 text-[10px] font-sans font-bold uppercase tracking-widest rounded-full bg-[#CB9700]/20 text-[#FAF6ED] border border-[#CB9700]/40">
                  <Sparkles className="w-3 h-3 text-[#CB9700]" />
                  <span>POCKET INDULGENCE</span>
                </span>
                <span className="text-[11px] font-mono text-[#D5B268] font-semibold">FROM ₹499</span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2 mb-6">
                <h3 className="font-serif text-2xl sm:text-3xl text-white font-medium leading-snug">
                  35g Mini Bar Collection
                </h3>
                <p className="font-sans text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
                  The grand Dubai experience in curated 35g snack bars. Taste Kunafa Dark, Speculoos Creme & Hazelnut Gianduja.
                </p>
              </div>

              {/* Flavours Pill Row */}
              <div className="mb-8 flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-sans font-medium bg-white/5 border border-white/10 text-stone-300">
                  Kunafa Dark
                </span>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-sans font-medium bg-white/5 border border-white/10 text-stone-300">
                  Kunafa Milk
                </span>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-sans font-medium bg-white/5 border border-white/10 text-stone-300">
                  Speculoos Crunch
                </span>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-sans font-medium bg-white/5 border border-white/10 text-stone-300">
                  Hazelnut Gianduja
                </span>
              </div>
            </div>

            {/* Bottom CTA Button */}
            <div className="pt-2">
              <Link href="/collections/mini-chocolate-bars" className="block w-full">
                <button
                  type="button"
                  className="w-full py-3.5 px-6 rounded-full bg-[#CB9700] hover:bg-[#d9a408] active:scale-[0.98] text-stone-950 font-sans text-xs font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                >
                  <span>Shop 35g Mini Bars</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
