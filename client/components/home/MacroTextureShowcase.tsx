'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, Sun, Eye, Award } from 'lucide-react';

const TEXTURES = [
  {
    id: 'conch-shine',
    title: '72-Hour Conched Sheen',
    subtitle: 'Mirror-Like Cocoa Butter Gloss',
    description: 'Slow granite conching aligns cocoa butter crystals perfectly, producing an ultra-smooth sheen that melts instantly at body temperature.',
    image: '/Kunafa-Pistachio-Dark-Chocolate-1.png',
    stat: '0.01mm Texture',
  },
  {
    id: 'kataifi-layer',
    title: 'Ghee-Roasted Kataifi Layers',
    subtitle: 'Golden Shredded Pastry Threads',
    description: 'Every bar contains thousands of microscopic crispy pastry strands, toasted in clarified ghee to maintain crispness inside velvety chocolate.',
    image: '/Kunafa-Pistachio-Milk-Chocolate-2.png',
    stat: '100% Ghee Toasted',
  },
  {
    id: 'pistachio-creme',
    title: 'Pistachio Crème Melt',
    subtitle: 'Pure Antep Nut Paste',
    description: 'Dense pistachio ganache whipped into a silky texture that delivers an instant burst of roasted nutty flavor without artificial emulsifiers.',
    image: '/Kunafa-and-Pistachio-Creme-1.png',
    stat: 'Zero Palm Oil',
  },
];

export function MacroTextureShowcase() {
  const [activeTexture, setActiveTexture] = useState(0);
  const current = TEXTURES[activeTexture];
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <section className="relative bg-[#0F0D0C] text-white py-24 px-6 overflow-hidden border-t border-white/10">
      <div className="relative z-10 max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 border border-[#2AD2C5]/30 text-xs font-sans tracking-[0.2em] text-[#2AD2C5] uppercase">
            <Sun className="w-3.5 h-3.5 text-[#CB9700]" />
            <span>Macro Texture Detail</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-white font-light">The Anatomy of Texture & Shine</h2>
          <p className="text-stone-400 text-sm font-light leading-relaxed">
            Move your cursor across the close-up render to inspect light glints, cocoa sheen, and kataifi crispness.
          </p>
        </div>

        {/* Interactive Spotlight Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div
            onMouseMove={handleMouseMove}
            className="lg:col-span-7 relative aspect-[16/10] rounded-3xl overflow-hidden border border-white/15 shadow-2xl group cursor-crosshair"
          >
            <Image
              src={current.image}
              alt={current.title}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              priority
              className="object-cover filter contrast-125 brightness-90 transition-transform duration-700 group-hover:scale-105"
            />

            {/* Interactive Spotlight Glint Following Mouse Position */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle 180px at ${mousePos.x}% ${mousePos.y}%, rgba(255, 255, 255, 0.25), transparent 70%)`,
              }}
            />

            {/* Overlay badge */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
              <span className="text-xs text-[#2AD2C5] font-semibold bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                {current.stat}
              </span>
              <span className="text-[11px] text-stone-300 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center space-x-1.5">
                <Eye className="w-3 h-3 text-[#CB9700]" />
                <span>Move cursor to inspect light glint</span>
              </span>
            </div>
          </div>

          {/* Selector Tabs */}
          <div className="lg:col-span-5 space-y-4">
            {TEXTURES.map((item, idx) => {
              const isActive = activeTexture === idx;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTexture(idx)}
                  className={`w-full p-5 rounded-2xl border text-left transition-all duration-300 ${
                    isActive
                      ? 'border-[#2AD2C5] bg-white/10 shadow-xl'
                      : 'border-white/5 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <span className="text-[10px] text-[#2AD2C5] uppercase tracking-wider block font-semibold mb-1">
                    {item.subtitle}
                  </span>
                  <h3 className="font-serif text-xl text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-stone-300 font-light leading-relaxed">{item.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
