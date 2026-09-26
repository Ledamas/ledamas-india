import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { constructMetadata } from '@/lib/seo';
import { CheckCircle2, ShieldCheck, Award, Sparkles, ArrowRight, Truck, Clock, HeartHandshake, Sparkle } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'About Le Damas India | Authentic Dubai Chocolate in India | Est. 1951',
  description: 'Learn about Le Damas — bringing authentic Dubai chocolate, Kunafa Pistachio bars, and luxury Arabic sweets to India. 100% natural, no preservatives, pan-India delivery.',
  canonicalUrl: '/about',
  keywords: [
    'About Le Damas India',
    'authentic Dubai chocolate in India',
    'buy Dubai chocolate online India',
    'Kunafa Pistachio chocolate',
    'Lebubu Milk Chocolate',
    'Dubai sweets online India',
    'Le Damas story Damascus 1951 Dubai 2014'
  ]
});

export default function AboutPage() {
  const breadcrumbs = [
    { name: 'About Le Damas India', item: '/about' },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Le Damas India',
    url: 'https://ledamas.in/about',
    logo: 'https://ledamas.in/Le-Damas-Sweets-Logo-enhanced.png',
    description: 'Le Damas brings authentic Dubai chocolate, Kunafa Pistachio chocolate, and luxury Arabic sweets to India — a legacy that began in 1951.',
    foundingDate: '1951',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Unit no. 514, 5th floor, Manglam Paradise Mall, Sec-3, Rohini',
      addressLocality: 'New Delhi',
      postalCode: '110085',
      addressCountry: 'IN'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-9311228575',
      contactType: 'customer service',
      email: 'info@ledamas.in'
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <main className="flex-1 pt-44 sm:pt-48 md:pt-52 pb-24">
        {/* Top Hero Section */}
        <section className="bg-[#FAF7F2] border-b border-stone-200 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs items={breadcrumbs} />

            <div className="mt-8 text-center max-w-4xl mx-auto space-y-4">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#3D2314] text-white text-xs font-sans tracking-[0.25em] uppercase shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#CB9700]" />
                <span className="font-semibold text-[#D5B268]">DELICIOUS SINCE 1951</span>
              </div>

              <h1 className="font-serif type-page-title text-[#3D2314] font-normal leading-tight">
                About Le Damas India
              </h1>

              <p className="text-base sm:text-xl text-[#CB9700] font-serif italic max-w-2xl mx-auto">
                Authentic Dubai Chocolate & Kunafa Confections in India
              </p>

              <p className="font-sans type-body text-stone-700 font-light max-w-3xl mx-auto pt-2">
                Le Damas brings the authentic taste of Dubai chocolate to India — a legacy that began in 1951 in a small shop in Damascus, and grew into a globally loved brand after its official establishment in Dubai in 2014. Today, Le Damas is one of the most trusted names for premium Dubai chocolate online in India.
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-20">

          {/* Section 1: Legacy & Uncompromising Quality */}
          <section className="bg-[#FAF7F2] rounded-3xl p-8 sm:p-14 border border-stone-200 shadow-sm">
            <div className="max-w-4xl space-y-6">
              <span className="inline-block type-label text-[#CB9700] bg-white px-3 py-1 rounded-md border border-[#CB9700]/30 shadow-2xs">
                OUR HERITAGE
              </span>

              <h2 className="font-serif type-section-title text-[#3D2314] font-normal leading-snug">
                Rooted in Traditional Recipes Passed Down Through Generations
              </h2>

              <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-light">
                Rooted in traditional recipes passed down through generations, Le Damas is known for its uncompromising quality and distinctive flavors. Every product — from our world-famous Dubai Chocolate bars to our signature Kunafa & Pistachio chocolate creations — is made using only the finest raw materials.
              </p>

              <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-light">
                We strictly enforce a <strong>no-compromise policy</strong> on preservatives, artificial colors, flavorings, and genetically modified ingredients.
              </p>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                <div className="flex items-center space-x-3 bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
                  <div className="w-9 h-9 rounded-full bg-[#3D2314] text-[#CB9700] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#3D2314]">Est. 1951</h4>
                    <p className="text-[11px] text-stone-500">75+ Years Heritage</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
                  <div className="w-9 h-9 rounded-full bg-[#3D2314] text-[#CB9700] flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#3D2314]">Dubai 2014</h4>
                    <p className="text-[11px] text-stone-500">Official Brand Origin</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Now in India — Buy Dubai Chocolate Online */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Dubai Artisan Craft Atmosphere Photograph */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-stone-200 shadow-lg group bg-stone-100">
                <Image
                  src="/dubai-artisan-craft.png"
                  alt="Dubai Master Pastry Chef Crafting Kunafa & Pistachio Confectionery"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover object-center group-hover:scale-103 transition-transform duration-500"
                />
              </div>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-[#CB9700] bg-stone-100 px-3 py-1 rounded-md border border-stone-200">
                OFFICIAL INDIA OPERATIONS
              </span>

              <h2 className="text-2xl sm:text-4xl font-serif text-[#3D2314] font-normal leading-snug">
                Now in India — Buy Dubai Chocolate Online
              </h2>

              <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-light">
                We're proud to bring this Dubai-origin legacy to Indian chocolate lovers through our official India operations. From Kunafa Pistachio chocolate and Hazelnut Creme chocolate to our best-selling Lebubu Milk Chocolate, every product is crafted following the same original recipes and quality standards that made Le Damas a global sensation.
              </p>

              <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-light">
                Now you can order Dubai chocolate online in India — delivered fresh, fast, and pan-India, so you can experience the authentic taste of Dubai without leaving home.
              </p>

              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center space-x-3 px-8 py-3.5 rounded-full bg-[#3D2314] hover:bg-[#CB9700] text-white text-xs tracking-[0.2em] font-semibold transition-all duration-300 uppercase shadow-md group"
                >
                  <span>ORDER DUBAI CHOCOLATE ONLINE</span>
                  <ArrowRight className="w-4 h-4 text-[#CB9700] group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>
          </section>

          {/* Section 3: Our Craft — Handmade Kunafa Chocolate & Pistachio Creme */}
          <section className="bg-[#FAF7F2] rounded-3xl p-8 sm:p-14 border border-stone-200 shadow-sm space-y-10">
            <div className="max-w-4xl space-y-4">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-[#CB9700] bg-white px-3 py-1 rounded-md border border-[#CB9700]/30">
                HANDMADE CRAFTSMANSHIP
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif text-[#3D2314] font-normal">
                Our Craft — Handmade Kunafa Chocolate & Pistachio Creme
              </h2>
              <p className="text-sm sm:text-base text-stone-700 font-light leading-relaxed">
                At the heart of Le Damas lies a dedication to craftsmanship. Our skilled pastry chefs bring generations of expertise to every creation, working with premium pistachios, cashews, and the finest nuts to produce Dubai chocolate, artisanal chocolates, and pistachio cremes that are as authentic as they are indulgent.
              </p>
              <p className="text-sm sm:text-base text-stone-700 font-light leading-relaxed">
                From delicate crispy kunafa layers to rich pistachio creme and hazelnut creme chocolate, each product reflects a fusion of traditional technique and modern quality standards — making Le Damas the go-to choice for luxury chocolate gifting in India.
              </p>
            </div>

            {/* Craft Feature Highlights Trio */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-stone-200">
              <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#CB9700] flex items-center justify-center font-bold text-xs border border-[#CB9700]/30">
                  01
                </div>
                <h4 className="font-serif text-base font-bold text-[#3D2314]">
                  Crispy Kataifi Threads
                </h4>
                <p className="text-xs text-stone-600 font-light leading-relaxed">
                  Slow-toasted golden kunafa pastry roasted to crispy perfection.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#CB9700] flex items-center justify-center font-bold text-xs border border-[#CB9700]/30">
                  02
                </div>
                <h4 className="font-serif text-base font-bold text-[#3D2314]">
                  Single-Origin Pistachios
                </h4>
                <p className="text-xs text-stone-600 font-light leading-relaxed">
                  Hand-selected premium emerald pistachios & roasted cashews.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#CB9700] flex items-center justify-center font-bold text-xs border border-[#CB9700]/30">
                  03
                </div>
                <h4 className="font-serif text-base font-bold text-[#3D2314]">
                  Velvety Nut Crèmes
                </h4>
                <p className="text-xs text-stone-600 font-light leading-relaxed">
                  Creamy pistachio spread & hazelnut filling with zero additives.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Our Promise */}
          <section className="space-y-10">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-[#CB9700] bg-stone-100 px-3 py-1 rounded-md border border-stone-200">
                GUARANTEE OF AUTHENTICITY
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#3D2314] font-normal">
                Our Promise
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 font-light">
                Crafted for the modern chocolate lover without compromising on generations of tradition.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-3 hover:border-[#CB9700] transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#FAF7F2] text-[#3D2314] flex items-center justify-center border border-[#CB9700]/30">
                  <CheckCircle2 className="w-5 h-5 text-[#CB9700]" />
                </div>
                <h3 className="font-serif text-base font-bold text-[#3D2314]">
                  100% Authentic Dubai-Origin Recipes
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-light">
                  Handcrafted strictly following the original Dubai-origin formulas developed and perfected since 1951.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-3 hover:border-[#CB9700] transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#FAF7F2] text-[#3D2314] flex items-center justify-center border border-[#CB9700]/30">
                  <Award className="w-5 h-5 text-[#CB9700]" />
                </div>
                <h3 className="font-serif text-base font-bold text-[#3D2314]">
                  Premium Quality Ingredients
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-light">
                  Premium Dubai chocolate, Kunafa Pistachio chocolate, and pistachio creme — zero compromise on raw material quality.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-3 hover:border-[#CB9700] transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#FAF7F2] text-[#3D2314] flex items-center justify-center border border-[#CB9700]/30">
                  <ShieldCheck className="w-5 h-5 text-[#CB9700]" />
                </div>
                <h3 className="font-serif text-base font-bold text-[#3D2314]">
                  No Preservatives or Artificial Colors
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-light">
                  Strict zero-chemical policy — completely free from artificial flavorings, preservatives, and GMO ingredients.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-3 hover:border-[#CB9700] transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#FAF7F2] text-[#3D2314] flex items-center justify-center border border-[#CB9700]/30">
                  <Truck className="w-5 h-5 text-[#CB9700]" />
                </div>
                <h3 className="font-serif text-base font-bold text-[#3D2314]">
                  Temperature-Controlled Delivery
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-light">
                  Fast, cold-chain temperature-controlled dispatch across India — including fast delivery in Delhi NCR.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-3 hover:border-[#CB9700] transition-colors sm:col-span-2 lg:col-span-2">
                <div className="w-10 h-10 rounded-full bg-[#FAF7F2] text-[#3D2314] flex items-center justify-center border border-[#CB9700]/30">
                  <HeartHandshake className="w-5 h-5 text-[#CB9700]" />
                </div>
                <h3 className="font-serif text-base font-bold text-[#3D2314]">
                  India's Trusted Destination to Buy Dubai Chocolate Online
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-light">
                  Crafted for the modern chocolate lover seeking authentic Dubai confections with guaranteed freshness and 100% customer satisfaction.
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
