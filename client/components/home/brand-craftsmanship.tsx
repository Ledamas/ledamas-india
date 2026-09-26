'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, Clock, Compass, Shield } from 'lucide-react';
import { Heading } from '../ui/heading';

export function BrandCraftsmanship() {
  const pillars = [
    {
      icon: Compass,
      title: 'High Elevation Micro-Terroir',
      description: 'Our cacao pods are harvested from 1,200m elevation micro-farms in the Western Ghats, yielding naturally floral notes with low acidity.'
    },
    {
      icon: Clock,
      title: '72-Hour Granite Stone Conching',
      description: 'Slow-ground in heavy granite wheels for three consecutive days to refine particle size to below 15 microns for unparalleled silkiness.'
    },
    {
      icon: Sparkles,
      title: 'Botanical Infusions & 24K Leaf',
      description: 'Infused with organic Grade-A Kashmiri Mogra Saffron, Himalayan wildflower honey, and gilded with certified 24-karat gold.'
    },
    {
      icon: Shield,
      title: 'Cold-Chain Insulated Shipping',
      description: 'Delivered in customized double-walled thermal insulated containers with gel coolants to preserve tempering in any climate.'
    }
  ];

  return (
    <section className="py-24 bg-[#080504] border-t border-[#d5b268]/15 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Asymmetric Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Image Editorial Showcase */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 relative aspect-[4/5] bg-[#19110d] border border-[#d5b268]/20 overflow-hidden group"
          >
            <Image
              src="https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=1200&auto=format&fit=crop"
              alt="Le Damas Artisanal Craftsmanship"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080504] via-transparent to-transparent opacity-80" />

            {/* Overlaid Badge Quote */}
            <div className="absolute bottom-8 left-8 right-8 p-6 bg-[#0c0806]/90 backdrop-blur-md border border-[#d5b268]/30 space-y-2">
              <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#d5b268]">
                MAISON PHILOSOPHY
              </span>
              <p className="font-serif text-lg text-[#fbf9f5] italic leading-snug">
                “Chocolate is not merely a confection; it is a sensory vintage capturing soil, elevation, and passion.”
              </p>
            </div>
          </motion.div>

          {/* Text Content & Pillars */}
          <div className="lg:col-span-6 space-y-10">
            <Heading
              eyebrow="The Art of Haute Chocolaterie"
              subtitle="Every bar and truffle created at LE DAMAS is an ode to patience, precision, and botanical harmony."
            >
              Where Ancient Spices Meet Classical European Craft
            </Heading>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
              {pillars.map((pillar, index) => {
                const IconComponent = pillar.icon;
                return (
                  <div key={index} className="space-y-3 p-5 bg-[#140e0b] border border-[#d5b268]/15 hover:border-[#d5b268]/35 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-[#1c1410] border border-[#d5b268]/30 flex items-center justify-center text-[#d5b268]">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h4 className="font-serif text-lg text-[#fbf9f5] font-light">
                      {pillar.title}
                    </h4>
                    <p className="text-xs text-[#a89a8e] font-sans font-light leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
