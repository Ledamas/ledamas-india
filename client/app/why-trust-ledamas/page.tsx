import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { constructMetadata } from '@/lib/seo';
import { Star, ShieldCheck, Award, HeartHandshake, CheckCircle2, Truck, RefreshCw, Flame, Sparkles, ArrowRight } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Why Trust Le Damas? | Authentic Dubai Chocolate in India | 100% Guarantee',
  description: 'Discover why Le Damas is India\'s most trusted brand for authentic Dubai chocolate, Kunafa Pistachio bars, Hazelnut Cremes, and Speculoos confections. 70+ years heritage, 100% natural ingredients, zero preservatives, fresh daily dispatch, and 100% satisfaction guarantee.',
  canonicalUrl: '/why-trust-ledamas',
  keywords: [
    'Why trust Le Damas',
    'authentic Dubai chocolate India trust',
    'buy Dubai chocolate online India',
    '100% satisfaction guarantee chocolate India',
    'fresh Kunafa pistachio chocolate India',
    'pan-India temperature-controlled delivery',
    'Le Damas Damascus 1951 Dubai 2014'
  ]
});

export default function WhyTrustLeDamasPage() {

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Why Trust Le Damas India',
    url: 'https://ledamas.in/why-trust-ledamas',
    description: 'Le Damas brings 70+ years of confectionery heritage, 100% natural ingredients, fresh daily production, and a 100% satisfaction guarantee for luxury Dubai chocolates.',
    publisher: {
      '@type': 'Organization',
      name: 'Le Damas India',
      logo: 'https://ledamas.in/Le-Damas-Sweets-Logo-enhanced.png'
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: '70+ Years Confectionery Heritage (Est. 1951)'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: '100% Satisfaction Guarantee — Return or Refund even if package is opened'
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: '100% Pure Raw Ingredients & Gold Medal Ghee'
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Temperature-Controlled Insulated Dispatch Across India'
        }
      ]
    }
  };

  const reviews = [
    {
      id: 1,
      author: 'Najoua S.',
      time: '2 months ago',
      rating: 5,
      text: 'I ordered the Kunafa Pistachio Dark Chocolate bar and Lebubu Milk Chocolate, and they were excellent! The quality of the chocolate was incredible, crisp kataifi, and the presentation was beautiful. Highly recommend Le Damas chocolates.',
    },
    {
      id: 2,
      author: 'Henna A.',
      time: '3 months ago',
      rating: 5,
      text: 'Ordered some Kunafa and Pistachio Creme jars and Speculoos Creme chocolates to give as gifts and they were a huge hit! Everyone loved them so much. The Kunafa Pistachio chocolate is some of the best we have ever had and the delivery was ice-cold. Highly recommend!',
    },
    {
      id: 3,
      author: 'Rohan Sharma',
      time: '1 month ago',
      rating: 5,
      text: 'Received my Kunafa Pistachio Milk Chocolate bar in Delhi in perfect temperature-controlled packaging. Zero melting, incredibly crisp kataifi inside, and pure authentic taste. Truly the most trusted source for Dubai chocolate in India!',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <main className="flex-1 pt-[110px] sm:pt-32 md:pt-36 pb-24">
        {/* Top Header */}
        <section className="bg-[#FAF7F2] border-b border-stone-200 py-10 sm:py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="inline-flex items-center space-x-2 px-4 py-1 rounded-full bg-[#3D2314] text-[#D5B268] text-xs font-sans tracking-[0.25em] uppercase font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#CB9700]" />
              <span>UNCOMPROMISING TRUST & FRESHNESS</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif text-[#3D2314] font-normal leading-tight">
              Why trust Le Damas?
            </h1>

            <p className="text-sm sm:text-base text-stone-600 font-light leading-relaxed max-w-2xl mx-auto">
              With over 70 years of heritage, Le Damas brings generations of expertise in authentic Dubai chocolate — a journey that began in Damascus in 1951 and continues with excellence in Dubai since 2014, now serving chocolate lovers pan-India with 12 signature SKUs.
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-14">

          {/* Official Why Trust Le Damas Image */}
          <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-lg bg-stone-50">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src="/whytrustleadamas.png"
                alt="Why Trust Le Damas — Damascus 1951 Historic Archival"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 80vw"
                className="object-cover object-top"
              />
            </div>
          </div>

          {/* Core Trust Statement & Goal Card */}
          <div className="bg-[#FAF7F2] rounded-2xl p-8 sm:p-10 border border-stone-200 shadow-2xs text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#3D2314] text-[#CB9700] flex items-center justify-center mx-auto border border-[#CB9700]/40">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-serif text-[#3D2314] font-normal">
              Driven by one simple goal — to deliver happiness in every box.
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed max-w-2xl mx-auto">
              Whether you order our world-famous Kunafa Pistachio Dubai Chocolate bars, Hazelnut Creme bars, or signature Creme spreads, we guarantee an unmatched sensory experience crafted with absolute transparency and uncompromising passion.
            </p>
          </div>

          {/* Trust Factors List (Matching exact points from official screenshot with SEO keywords) */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif text-[#3D2314] font-bold border-b border-stone-200 pb-2">
              Our 8 Commitments to You
            </h3>

            <div className="grid grid-cols-1 gap-4">

              {/* Point 1 */}
              <div className="flex items-start space-x-4 p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:border-[#CB9700] transition-colors">
                <div className="w-9 h-9 rounded-full bg-[#FAF7F2] text-[#CB9700] flex items-center justify-center shrink-0 border border-[#CB9700]/30 mt-0.5">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#3D2314]">Only the Finest Raw Ingredients & Gold Medal Ghee</h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-light mt-1">
                    We use only the finest raw ingredients, including premium hand-selected pistachios, cashews, single-origin cacao, and authentic 100% pure Gold Medal ghee.
                  </p>
                </div>
              </div>

              {/* Point 2 */}
              <div className="flex items-start space-x-4 p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:border-[#CB9700] transition-colors">
                <div className="w-9 h-9 rounded-full bg-[#FAF7F2] text-[#CB9700] flex items-center justify-center shrink-0 border border-[#CB9700]/30 mt-0.5">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#3D2314]">Low in Sugar & Made Fresh Daily — Never Stored on Shelves</h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-light mt-1">
                    Our Dubai chocolates and creme spreads are low in sugar, perfectly balanced, and prepared fresh daily — never sitting on retail shelves or old warehouse inventory.
                  </p>
                </div>
              </div>

              {/* Point 3 */}
              <div className="flex items-start space-x-4 p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:border-[#CB9700] transition-colors">
                <div className="w-9 h-9 rounded-full bg-[#FAF7F2] text-[#CB9700] flex items-center justify-center shrink-0 border border-[#CB9700]/30 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#3D2314]">Direct Factory Dispatch for Unmatched Freshness</h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-light mt-1">
                    Every order comes directly from our production facility to your doorstep to ensure maximum aroma, crunch, and authentic flavor.
                  </p>
                </div>
              </div>

              {/* Point 4 */}
              <div className="flex items-start space-x-4 p-5 rounded-2xl bg-[#FAF7F2] border border-[#CB9700]/40 shadow-sm">
                <div className="w-9 h-9 rounded-full bg-[#3D2314] text-[#CB9700] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#3D2314]">
                    100% Satisfaction Guaranteed — Return or Refund for Any Reason
                  </h4>
                  <p className="text-xs text-stone-700 leading-relaxed font-normal mt-1">
                    Your happiness is 100% guaranteed. Full return or refund is available for any reason — even if the package has been opened.
                  </p>
                </div>
              </div>

              {/* Point 5 */}
              <div className="flex items-start space-x-4 p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:border-[#CB9700] transition-colors">
                <div className="w-9 h-9 rounded-full bg-[#FAF7F2] text-[#CB9700] flex items-center justify-center shrink-0 border border-[#CB9700]/30 mt-0.5">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#3D2314]">Fast Refrigerated & Temperature-Controlled Delivery</h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-light mt-1">
                    Enjoy fast delivery across Delhi NCR and pan-India in insulated, temperature-controlled packaging dedicated to sweet & luxury chocolate transport.
                  </p>
                </div>
              </div>

              {/* Point 6 */}
              <div className="flex items-start space-x-4 p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:border-[#CB9700] transition-colors">
                <div className="w-9 h-9 rounded-full bg-[#FAF7F2] text-[#CB9700] flex items-center justify-center shrink-0 border border-[#CB9700]/30 mt-0.5">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#3D2314]">Express Dispatch & Pan-India Thermal Protection</h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-light mt-1">
                    We offer express dispatch across all Indian pin-codes with insulated thermal foil bubble layers ensuring no melting even in summer heat.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Google Reviews Showcase Section */}
          <div className="pt-6 border-t border-stone-200 space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FAF7F2] p-6 rounded-2xl border border-stone-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-stone-200 shadow-2xs">
                  <span className="text-xl font-black text-[#4285F4]">G</span>
                </div>
                <div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold font-serif text-[#3D2314]">4.7</span>
                    <div className="flex items-center space-x-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#CB9700] text-[#CB9700]" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-stone-500 font-light mt-0.5">Based on verified Google Customer Reviews</p>
                </div>
              </div>

              <Link
                href="/shop"
                className="px-6 py-2.5 rounded-full bg-[#3D2314] hover:bg-[#CB9700] text-white text-xs font-sans tracking-widest font-semibold uppercase transition-colors shadow-2xs"
              >
                Order Dubai Chocolate Now &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-[#3D2314] text-[#D5B268] font-bold text-xs flex items-center justify-center">
                          {rev.author.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-[#3D2314]">{rev.author}</span>
                      </div>
                      <span className="text-xs font-bold text-[#4285F4]">Google</span>
                    </div>

                    <div className="flex items-center space-x-0.5">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#CB9700] text-[#CB9700]" />
                      ))}
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed font-light italic">
                      "{rev.text}"
                    </p>
                  </div>
                  <span className="text-[10px] text-stone-400 block">{rev.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Banner */}
          <div className="bg-[#3D2314] text-white rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-lg border border-[#CB9700]/30">
            <span className="text-xs font-sans uppercase tracking-[0.25em] text-[#CB9700] font-bold">
              EXPERIENCE AUTHENTIC DUBAI CHOCOLATE
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-light text-[#FAF6ED]">
              Ready to Taste 70+ Years of Craftsmanship?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 font-light max-w-xl mx-auto">
              Freshly made, low in sugar, temperature-controlled delivery to your doorstep across India.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-full bg-[#CB9700] hover:bg-[#2AD2C5] text-[#3D2314] hover:text-white text-xs font-sans uppercase tracking-[0.2em] font-bold transition-all shadow-md group"
              >
                <span>SHOP DUBAI CHOCOLATE COLLECTION</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
