'use client';

import React from 'react';
import Image from 'next/image';
import { Heart, Sparkles } from 'lucide-react';

export function InstagramGallery() {
  const galleryItems = [
    {
      id: 1,
      image: '/Kunafa and Pistachio Creme 1.png',
      title: 'Kunafa & Pistachio Crème Jars',
      likes: '1.4k',
    },
    {
      id: 2,
      image: '/Kunafa Pistachio Dark Chocolate 1.png',
      title: 'Kunafa Dark Chocolate Bar',
      likes: '2.1k',
    },
    {
      id: 3,
      image: '/Le Bubu 1.png',
      title: 'Lebubu Milk Chocolate Signature',
      likes: '3.8k',
    },
    {
      id: 4,
      image: '/Crispy Speculoos Creme Milk Chocolate 1.png',
      title: 'Crispy Speculoos Milk Chocolate',
      likes: '1.9k',
    },
  ];

  return (
    <section id="gallery" className="py-24 bg-[#F7F6F0] border-t border-[#2AD2C5]/20 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">

          <h2 className="text-4xl sm:text-5xl font-serif text-[#2B2B2B] font-light">
            Behind The Atelier
          </h2>
          <p className="font-script text-2xl text-[#CB9700]">
            Delicious Since 1951
          </p>
        </div>

        {/* 4 Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-white border border-[#2AD2C5]/20 shadow-sm"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-[#2AD2C5]/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6 text-white">
                <div className="flex justify-between items-center">
                  <Sparkles className="w-5 h-5 text-white" />
                  <div className="flex items-center space-x-1 text-xs">
                    <Heart className="w-4 h-4 fill-white" />
                    <span>{item.likes}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-serif text-lg text-white font-medium">
                    {item.title}
                  </h3>
                  <p className="text-[10px] font-sans tracking-widest uppercase text-[#FDFDFB] mt-0.5">
                    #LeDamas
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
