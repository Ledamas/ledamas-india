'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, Award, Sparkles, Heart } from 'lucide-react';

export function HeritageSection() {
  const timelineEvents = [
    {
      year: '1951',
      title: 'The Founding Atelier',
      description: 'Our story began in 1951 with a passion for traditional Middle Eastern confectionery, stone-ground pistachios, and pure honey pastries.',
      icon: Clock,
    },
    {
      year: '1978',
      title: 'Mastering the Kunafa Creme',
      description: 'Perfected our signature recipe combining golden toasted Kataifi phyllo pastry with slow-roasted Mediterranean pistachio paste.',
      icon: Sparkles,
    },
    {
      year: '2005',
      title: 'Haute Patisserie Heritage',
      description: 'Expanded across royal boutiques, earning acclaim for uncompromised quality, fresh butter gianduja, and artisanal craftsmanship.',
      icon: Award,
    },
    {
      year: 'Today',
      title: 'LE DAMAS India',
      description: 'Bringing 75+ years of secret heritage recipes to luxury chocolate lovers across India with fresh cold-chain delivery.',
      icon: Heart,
    },
  ];

  return (
    <section id="heritage" className="py-24 bg-[#F7F6F0] border-t border-b border-[#2AD2C5]/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-sans uppercase tracking-[0.25em] text-[#2AD2C5] font-semibold">
            Our Legacy
          </span>
          <h2 className="text-4xl sm:text-5xl font-serif text-[#2B2B2B] font-light leading-tight">
            Our Heritage / Since 1951
          </h2>
          <p className="font-script text-3xl text-[#CB9700]">
            Delicious Since 1951
          </p>
          <p className="text-sm text-[#666666] leading-relaxed font-sans max-w-xl mx-auto pt-2">
            For over seven decades, LE DAMAS has honored classical Middle Eastern patisserie methods, hand-selected pistachios, and uncompromised artisanal cacao.
          </p>
        </div>

        {/* Timeline Layout */}
        <div className="relative border-l-2 border-[#2AD2C5]/30 ml-4 md:ml-1/2 md:-translate-x-1/2 space-y-12 my-8">
          {timelineEvents.map((event, idx) => {
            const Icon = event.icon;
            const isEven = idx % 2 === 0;

            return (
              <motion.div
                key={event.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className={`relative flex flex-col md:flex-row items-start ${
                  isEven ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Timeline Dot Icon */}
                <div className="absolute -left-[17px] md:left-1/2 md:-translate-x-1/2 w-8 h-8 rounded-full bg-[#CB9700] text-white flex items-center justify-center shadow-md z-10">
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content Box */}
                <div className={`ml-8 md:ml-0 md:w-1/2 ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
                  <div className="p-6 rounded-2xl bg-white border border-[#2AD2C5]/20 shadow-sm hover:shadow-md transition-shadow">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#2AD2C5]/10 text-[#2AD2C5] text-xs font-semibold uppercase tracking-wider mb-2">
                      {event.year}
                    </span>
                    <h3 className="font-serif text-2xl text-[#2B2B2B] font-medium">
                      {event.title}
                    </h3>
                    <p className="text-xs text-[#666666] mt-2 leading-relaxed font-sans">
                      {event.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
