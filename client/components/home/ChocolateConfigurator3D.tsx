'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Sparkles, ContactShadows, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Sparkles as SparklesIcon, Layers, RotateCw, Check, Eye } from 'lucide-react';
import * as THREE from 'three';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';

export type ConfigPreset = 'dark' | 'dubai' | 'pistachio' | 'speculoos';

interface MaterialConfig {
  name: string;
  subtitle: string;
  price: number;
  color: string;
  accent: string;
  filling: string;
  description: string;
}

const PRESETS: Record<ConfigPreset, MaterialConfig> = {
  pistachio: {
    name: 'Gourmet Kunafa Pistachio',
    subtitle: '72-hour conched chocolate with hand-roasted kataifi & pistachio crème',
    price: 24.99,
    color: '#3B2317',
    accent: '#CB9700',
    filling: '#4A7C38',
    description: 'Crispy kataifi strands folded into velvety pistachio crème, encased in luxury milk chocolate.',
  },
  dubai: {
    name: 'Dubai Gold Special Edition',
    subtitle: 'Golden kataifi weave, pistachio ganache, 24K edible gold dusting',
    price: 29.99,
    color: '#2A170A',
    accent: '#2AD2C5',
    filling: '#D4AF37',
    description: 'Our iconic Dubai edition with extra crispy golden kataifi & edible 24K gold luster.',
  },
  dark: {
    name: 'Single-Origin Dark Cacao',
    subtitle: 'Pure Venezuelan cacao with subtle floral & berry notes',
    price: 22.99,
    color: '#1A0B02',
    accent: '#E67E22',
    filling: '#361D0F',
    description: 'Deep, bittersweet single-origin cacao roasted slowly for intense aroma and velvet melt.',
  },
  speculoos: {
    name: 'Belgian Speculoos Crunch',
    subtitle: 'Caramelized spiced biscuit crème in dark chocolate',
    price: 23.99,
    color: '#241511',
    accent: '#F39C12',
    filling: '#8B4513',
    description: 'Rich dark chocolate paired with crunchy Belgian speculoos cookie butter crème.',
  },
};

function ConfiguratorMesh({
  preset,
  showCrossSection,
}: {
  preset: ConfigPreset;
  showCrossSection: boolean;
}) {
  const config = PRESETS[preset];
  const groupRef = useRef<THREE.Group>(null);

  const time = useRef(0);
  useFrame((_, delta) => {
    time.current += delta;
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
      groupRef.current.position.y = Math.sin(time.current * 1.5) * 0.1;
    }
  });

  const squares = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let x = -0.5; x <= 0.5; x += 1) {
      for (let z = -1.2; z <= 1.2; z += 0.8) {
        out.push([x * 0.9, 0.15, z]);
      }
    }
    return out;
  }, []);

  return (
    <group ref={groupRef} rotation={[0.3, 0.5, 0]}>
      {/* Main Base Slab */}
      <RoundedBox args={[2.2, showCrossSection ? 0.35 : 0.45, 3.2]} radius={0.08} smoothness={4} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={config.color}
          roughness={0.25}
          metalness={0.1}
          clearcoat={0.7}
          clearcoatRoughness={0.2}
        />
      </RoundedBox>

      {/* Grid Segments */}
      {!showCrossSection &&
        squares.map((pos, i) => (
          <RoundedBox key={i} args={[0.82, 0.25, 0.72]} radius={0.05} smoothness={4} position={pos} castShadow>
            <meshPhysicalMaterial
              color={config.color}
              roughness={0.2}
              metalness={0.15}
              clearcoat={0.8}
            />
          </RoundedBox>
        ))}

      {/* Exposed Internal Filling Core (Cross-Section View) */}
      {showCrossSection && (
        <group position={[0, 0.1, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.9, 0.22, 2.9]} />
            <meshStandardMaterial
              color={config.filling}
              roughness={0.5}
              emissive={config.filling}
              emissiveIntensity={0.25}
            />
          </mesh>

          {/* Drizzle Accent Ribbons */}
          <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0.4]}>
            <planeGeometry args={[0.3, 2.8]} />
            <meshPhysicalMaterial color={config.accent} roughness={0.3} metalness={0.2} transparent opacity={0.9} />
          </mesh>
        </group>
      )}

      {/* Gold/Mint Wrapper Foil Accent Line */}
      <mesh position={[0, -0.22, 0]}>
        <boxGeometry args={[2.24, 0.12, 3.24]} />
        <meshStandardMaterial color={config.accent} metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

export function ChocolateConfigurator3D() {
  const [activePreset, setActivePreset] = useState<ConfigPreset>('pistachio');
  const [showCrossSection, setShowCrossSection] = useState(false);
  const config = PRESETS[activePreset];

  return (
    <section className="relative min-h-[90vh] bg-[#0F0D0C] text-white py-20 px-6 overflow-hidden border-t border-white/10">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_#261914_0%,_#0F0D0C_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: 3D Canvas */}
        <div className="lg:col-span-7 relative h-[420px] sm:h-[520px] rounded-3xl bg-white/5 border border-white/10 overflow-hidden shadow-2xl">
          {/* Controls overlay */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-xs text-[#2AD2C5]">
              <SparklesIcon className="w-3.5 h-3.5 text-[#CB9700]" />
              <span>3D Real-Time Configurator</span>
            </div>

            <button
              onClick={() => setShowCrossSection((prev) => !prev)}
              className={`px-4 py-2 rounded-full text-xs font-medium border backdrop-blur-md transition-all flex items-center space-x-2 ${
                showCrossSection
                  ? 'bg-[#2AD2C5]/20 border-[#2AD2C5] text-[#2AD2C5]'
                  : 'bg-black/40 border-white/20 text-stone-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{showCrossSection ? 'Full Bar View' : 'Inside Core View'}</span>
            </button>
          </div>

          <Canvas camera={{ position: [0, 2, 5.5], fov: 40 }} gl={{ antialias: true, alpha: true }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 8, 5]} intensity={1.8} castShadow />
            <directionalLight position={[-5, 2, -3]} intensity={0.4} color={config.accent} />
            <Environment preset="apartment" />

            <ConfiguratorMesh preset={activePreset} showCrossSection={showCrossSection} />

            <Sparkles count={35} scale={6} size={2.5} speed={0.4} color={config.accent} />
            <ContactShadows position={[0, -1.2, 0]} opacity={0.6} scale={6} blur={2} far={3} />
            <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.6} minPolarAngle={Math.PI / 3} />
          </Canvas>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-[11px] text-stone-400 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center space-x-2">
            <RotateCw className="w-3 h-3 text-[#2AD2C5] animate-spin" style={{ animationDuration: '6s' }} />
            <span>Drag to rotate 360°</span>
          </div>
        </div>

        {/* Right Column: Customizer Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <p className="text-xs tracking-[0.2em] text-[#2AD2C5] uppercase font-medium mb-2">Signature Craft</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-white font-light leading-tight">{config.name}</h2>
            <p className="text-stone-400 text-sm font-light mt-2">{config.subtitle}</p>
          </div>

          {/* Flavor Selection Grid */}
          <div className="space-y-3 pt-2">
            <p className="text-xs text-stone-300 font-medium uppercase tracking-wider">Select Flavor Profile</p>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(PRESETS) as ConfigPreset[]).map((key) => {
                const item = PRESETS[key];
                const isActive = activePreset === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActivePreset(key)}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden ${
                      isActive
                        ? 'border-[#2AD2C5] bg-white/10 shadow-lg'
                        : 'border-white/10 bg-white/5 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white">{item.name.split(' ')[0]}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-[#2AD2C5]" />}
                    </div>
                    <span className="text-[11px] text-stone-400 block truncate">{item.subtitle.split(',')[0]}</span>
                    <span className="text-xs font-serif text-[#CB9700] mt-1 block">${item.price}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-xs text-[#2AD2C5] font-semibold block uppercase tracking-wider">Flavor Profile</span>
            <p className="text-xs text-stone-300 leading-relaxed font-light">{config.description}</p>
          </div>

          {/* Price & Add To Cart CTA */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs text-stone-400 block uppercase tracking-wider">Configured Price</span>
              <span className="font-serif text-3xl text-[#CB9700]">${config.price.toFixed(2)}</span>
            </div>

            <AddToCartButton
              product={{
                id: `configurator-${activePreset}`,
                name: config.name,
                price: config.price,
                image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=600&auto=format&fit=crop',
                variant: showCrossSection ? 'Cross-Section View' : 'Full Bar',
              }}
              className="px-8 py-3.5 rounded-full bg-[#CB9700] hover:bg-[#2AD2C5] text-white text-xs tracking-[0.2em] font-semibold shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
