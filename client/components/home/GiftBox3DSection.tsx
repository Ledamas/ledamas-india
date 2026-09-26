'use client';

import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Sparkles, ContactShadows, Environment } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles as SparklesIcon, Check, Heart, ArrowRight } from 'lucide-react';
import * as THREE from 'three';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';

function GiftBoxMesh({ isOpen }: { isOpen: boolean }) {
  const boxRef = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Group>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    time.current += delta;
    if (boxRef.current) {
      boxRef.current.rotation.y += delta * 0.15;
      boxRef.current.position.y = Math.sin(time.current * 1.4) * 0.08;
    }
    if (lidRef.current) {
      // Smooth lid opening animation when isOpen is true
      const targetY = isOpen ? 1.6 : 0.42;
      const targetRotX = isOpen ? -Math.PI / 4 : 0;
      lidRef.current.position.y += (targetY - lidRef.current.position.y) * 0.08;
      lidRef.current.rotation.x += (targetRotX - lidRef.current.rotation.x) * 0.08;
    }
  });

  return (
    <group ref={boxRef} rotation={[0.2, 0.4, 0]}>
      {/* Box Base Container */}
      <RoundedBox args={[3, 1.8, 2.2]} radius={0.08} smoothness={4} position={[0, -0.5, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#1A1817"
          roughness={0.25}
          metalness={0.1}
          clearcoat={0.6}
        />
      </RoundedBox>

      {/* Gold Ribbon Cross Bands on Box */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[0.3, 1.82, 2.22]} />
        <meshStandardMaterial color="#CB9700" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[3.02, 1.82, 0.3]} />
        <meshStandardMaterial color="#CB9700" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Inner Chocolates Assortment (Visible when box opens) */}
      {isOpen && (
        <group position={[0, 0.2, 0]}>
          {[-0.8, 0, 0.8].map((x, i) => (
            <mesh key={i} position={[x, 0.1, 0]} rotation={[0.2, (i - 1) * 0.2, 0]}>
              <boxGeometry args={[0.6, 0.2, 1.4]} />
              <meshStandardMaterial
                color={i === 0 ? '#3B2317' : i === 1 ? '#4A7C38' : '#D4AF37'}
                roughness={0.3}
                metalness={0.2}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Box Lid (Opens on toggle) */}
      <group ref={lidRef} position={[0, 0.42, 0]}>
        <RoundedBox args={[3.1, 0.35, 2.3]} radius={0.06} smoothness={4} castShadow>
          <meshPhysicalMaterial
            color="#2AD2C5"
            roughness={0.3}
            metalness={0.1}
            clearcoat={0.5}
          />
        </RoundedBox>

        {/* Top Gold Bow Ribbon */}
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.7, 0.2, 0.7]} />
          <meshStandardMaterial color="#CB9700" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
}

export function GiftBox3DSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [giftNote, setGiftNote] = useState('');

  return (
    <section className="relative min-h-[90vh] bg-[#0A0908] text-white py-20 px-6 overflow-hidden border-t border-white/10">
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: 3D Canvas Box */}
        <div className="lg:col-span-7 relative h-[420px] sm:h-[520px] rounded-3xl bg-white/5 border border-white/10 overflow-hidden shadow-2xl">
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-xs text-[#2AD2C5]">
              <Gift className="w-3.5 h-3.5 text-[#CB9700]" />
              <span>3D Interactive Gift Box</span>
            </div>

            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="px-5 py-2 rounded-full text-xs font-semibold bg-[#CB9700] hover:bg-[#2AD2C5] text-white transition-all shadow-lg flex items-center space-x-2"
            >
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>{isOpen ? 'Close Gift Box' : 'Unwrap Gift Box'}</span>
            </button>
          </div>

          <Canvas camera={{ position: [0, 2, 6], fov: 40 }} gl={{ antialias: true, alpha: true }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 8, 5]} intensity={1.8} castShadow />
            <directionalLight position={[-5, 2, -3]} intensity={0.4} color="#CB9700" />
            <Environment preset="apartment" />

            <GiftBoxMesh isOpen={isOpen} />

            <Sparkles count={40} scale={6} size={3} speed={0.4} color="#CB9700" />
            <ContactShadows position={[0, -1.3, 0]} opacity={0.6} scale={6} blur={2} far={3} />
            <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.6} minPolarAngle={Math.PI / 3} />
          </Canvas>
        </div>

        {/* Right Column: Gift Configuration & Add To Cart */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <p className="text-xs tracking-[0.2em] text-[#2AD2C5] uppercase font-medium mb-2">Luxury Gifting</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-white font-light leading-tight">
              Le Damas Heritage Confectionery Box
            </h2>
            <p className="text-stone-400 text-sm font-light mt-2 leading-relaxed">
              Curated gift set of 6 signature Middle Eastern Kunafa Pistachio, Speculoos, and Dark Cacao bars encased in custom velvet foil box.
            </p>
          </div>

          {/* Included Features */}
          <div className="space-y-2.5 pt-2">
            <span className="text-xs text-stone-300 font-medium uppercase tracking-wider block">Gifting Perks Included</span>
            <div className="grid grid-cols-1 gap-2 text-xs text-stone-300 font-light">
              <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-white/5 border border-white/10">
                <Check className="w-4 h-4 text-[#2AD2C5] shrink-0" />
                <span>6 Signature Artisan Bars (100g each)</span>
              </div>
              <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-white/5 border border-white/10">
                <Check className="w-4 h-4 text-[#2AD2C5] shrink-0" />
                <span>Handmade Gold Foil Wax Seal & Satin Ribbon</span>
              </div>
              <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-white/5 border border-white/10">
                <Check className="w-4 h-4 text-[#2AD2C5] shrink-0" />
                <span>Temperature-Controlled Cold Chain Insulated Delivery</span>
              </div>
            </div>
          </div>

          {/* Personal Gift Note */}
          <div className="space-y-2">
            <label htmlFor="gift-note" className="block text-xs text-stone-400 font-medium tracking-wide uppercase">
              Add Personal Calligraphy Gift Message
            </label>
            <input
              id="gift-note"
              type="text"
              value={giftNote}
              onChange={(e) => setGiftNote(e.target.value)}
              placeholder="e.g. Happy Anniversary, My Love! — Special Edition 2026"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 focus:border-[#2AD2C5] text-white text-xs placeholder:text-stone-600 outline-none transition-colors"
            />
          </div>

          {/* CTA */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs text-stone-400 block uppercase tracking-wider">Gift Box Set</span>
              <span className="font-serif text-3xl text-[#CB9700]">$79.99</span>
            </div>

            <AddToCartButton
              product={{
                id: 'heritage-gift-box-6',
                name: 'Le Damas Heritage Confectionery Box',
                price: 79.99,
                image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=600&auto=format&fit=crop',
                variant: giftNote ? `Custom Note: ${giftNote}` : 'Standard Wax Seal',
              }}
              className="px-8 py-3.5 rounded-full bg-[#CB9700] hover:bg-[#2AD2C5] text-white text-xs tracking-[0.2em] font-semibold shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
