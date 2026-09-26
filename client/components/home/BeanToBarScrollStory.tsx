'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, Flame, Award, ShieldCheck, ChevronRight } from 'lucide-react';

interface StoryStep {
  id: number;
  phase: string;
  title: string;
  duration: string;
  description: string;
  highlight: string;
  image: string;
}

const STEPS: StoryStep[] = [
  {
    id: 1,
    phase: 'STEP 01 — HARVESTING',
    title: 'Single-Origin Venezuelan Criollo Cacao',
    duration: 'Selected at Peak Ripeness',
    description: 'We source rare Criollo cacao pods from sustainable Venezuelan estates. Hand-picked, fermented under banana leaves, and sun-dried for rich floral undertones.',
    highlight: 'Pure Single Origin',
    image: '/Kunafa Pistachio Dark Chocolate 1.png',
  },
  {
    id: 2,
    phase: 'STEP 02 — KUNAFA KATAIFI',
    title: 'Golden Oven-Roasted Kataifi Strands',
    duration: 'Roasted in Pure Ghee',
    description: 'Traditional Middle Eastern kataifi pastry threads are finely shredded and slow roasted in clarified ghee until crisp and golden brown.',
    highlight: 'Hand-Roasted Crunch',
    image: '/Kunafa Pistachio Milk Chocolate 1.png',
  },
  {
    id: 3,
    phase: 'STEP 03 — PISTACHIO CRÈME',
    title: 'Whipped Pistachio Ganache',
    duration: '100% Antep Pistachio Paste',
    description: 'Freshly harvested pistachios are stone-ground into a silky crème, blended with a hint of sea salt and tahini for unmatched creaminess.',
    highlight: 'No Added Palm Oil',
    image: '/Kunafa and Pistachio Creme 1.png',
  },
  {
    id: 4,
    phase: 'STEP 04 — CONCHING',
    title: 'The 72-Hour Slow Conching Secret',
    duration: '3 Days Continuous Process',
    description: 'Most brands conch for 6 hours. We conch our cacao for 72 continuous hours on granite rollers to eliminate astringency and achieve velvet texture.',
    highlight: 'Ultra-Fine Micron Texture',
    image: '/White Chocolate Hazelnut Creme 1.png',
  },
  {
    id: 5,
    phase: 'STEP 05 — FINISHING',
    title: 'Gold Foil Hand Wrapping',
    duration: 'Insulated Cold-Chain Delivery',
    description: 'Each bar is inspected for gloss, poured into precision molds, and wrapped in gold foil within 72 hours to seal in fresh aroma.',
    highlight: 'Freshness Guaranteed',
    image: '/Crispy Speculoos Creme Milk Chocolate 1.png',
  },
];

export function BeanToBarScrollStory() {
  const [activeStep, setActiveStep] = useState(0);
  const current = STEPS[activeStep];

  return (
    <section className="relative bg-[#0A0908] text-white py-24 px-6 overflow-hidden border-t border-white/10">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#CB9700]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 border border-[#2AD2C5]/30 text-xs font-sans tracking-[0.2em] text-[#2AD2C5] uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#CB9700]" />
            <span>Artisanal Craftsmanship</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-white font-light">From Cacao Bean to Molded Bar</h2>
          <p className="text-stone-400 text-sm font-light leading-relaxed">
            Follow our 5-step secret process that gives Le Damas chocolates their signature snap, velvet melt, and golden kunafa crunch.
          </p>
        </div>

        {/* Story Interactive Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-white/5 rounded-3xl p-6 sm:p-10 border border-white/10 backdrop-blur-md">
          {/* Left Column: Timeline Navigation */}
          <div className="lg:col-span-5 space-y-3">
            {STEPS.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(idx)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between group ${
                    isActive
                      ? 'border-[#2AD2C5] bg-white/10 shadow-xl'
                      : 'border-white/5 hover:border-white/20 bg-transparent'
                  }`}
                >
                  <div className="space-y-1">
                    <span className={`text-[10px] font-sans tracking-widest block font-semibold ${isActive ? 'text-[#2AD2C5]' : 'text-stone-500'}`}>
                      {step.phase}
                    </span>
                    <span className="text-sm font-serif text-white block">{step.title}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-[#2AD2C5] translate-x-1' : 'text-stone-600 group-hover:text-white'}`} />
                </button>
              );
            })}
          </div>

          {/* Right Column: Visual Stage Showcase */}
          <div className="lg:col-span-7 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Image Stage */}
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/15 shadow-2xl">
                  <Image
                    src={current.image}
                    alt={current.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0908] via-transparent to-transparent" />

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs text-[#CB9700]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{current.duration}</span>
                    </div>
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs text-[#2AD2C5]">
                      <Award className="w-3.5 h-3.5" />
                      <span>{current.highlight}</span>
                    </div>
                  </div>
                </div>

                {/* Step Details */}
                <div className="space-y-2">
                  <span className="text-xs text-[#2AD2C5] font-semibold uppercase tracking-wider block">
                    {current.phase}
                  </span>
                  <h3 className="font-serif text-2xl text-white font-light">{current.title}</h3>
                  <p className="text-sm text-stone-300 font-light leading-relaxed">{current.description}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
