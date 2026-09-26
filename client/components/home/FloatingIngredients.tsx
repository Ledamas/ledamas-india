'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Leaf, Sparkles as SparklesIcon, Info } from 'lucide-react';
import * as THREE from 'three';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  origin: string;
  color: string;
  notes: string;
  taste: string;
}

const INGREDIENTS: Ingredient[] = [
  {
    id: 'pistachio',
    name: 'Antep Green Pistachio',
    category: 'Nuts & Crème',
    origin: 'Gaziantep, Turkey',
    color: '#8FA646',
    notes: 'Rich, buttery, intense roasted pistachio aroma',
    taste: 'Silky smooth crème with crunchy roasted pistachio pieces',
  },
  {
    id: 'cacao',
    name: 'Venezuelan Criollo Cacao',
    category: 'Single-Origin Cacao',
    origin: 'Sur del Lago, Venezuela',
    color: '#3B2317',
    notes: 'Bittersweet dark with subtle floral & berry notes',
    taste: 'Velvet melt with deep cocoa finish',
  },
  {
    id: 'kataifi',
    name: 'Ghee-Roasted Kataifi',
    category: 'Kunafa Pastry',
    origin: 'Artisanal Bakery, Damascus',
    color: '#D4AF37',
    notes: 'Crispy roasted golden pastry strands',
    taste: 'Delicate buttery crunch in every bite',
  },
  {
    id: 'speculoos',
    name: 'Belgian Speculoos Spice',
    category: 'Caramelized Biscuit',
    origin: 'Hasselt, Belgium',
    color: '#B87333',
    notes: 'Warm cinnamon, nutmeg, & caramelized sugar',
    taste: 'Spiced cookie butter with crisp biscuit crumbs',
  },
];

function FloatingIngredientMesh({ color, position }: { color: string; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const time = useRef(Math.random() * 10);

  useFrame((_, delta) => {
    time.current += delta;
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.4;
      meshRef.current.position.y = position[1] + Math.sin(time.current * 1.6) * 0.15;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={0.4}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.3}
        metalness={0.2}
        clearcoat={0.5}
      />
    </mesh>
  );
}

function IngredientCanvas({ activeColor }: { activeColor: string }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 2]} intensity={1.5} />
      <Environment preset="studio" />

      <FloatingIngredientMesh color={activeColor} position={[-1.2, 0.5, 0]} />
      <FloatingIngredientMesh color="#CB9700" position={[1.2, -0.4, -0.5]} />
      <FloatingIngredientMesh color="#2AD2C5" position={[0, 0.8, -1]} />
      <FloatingIngredientMesh color={activeColor} position={[0.8, 1, -0.2]} />

      <Sparkles count={30} scale={5} size={2} speed={0.3} color={activeColor} />
    </Canvas>
  );
}

export function FloatingIngredients() {
  const [activeIngredient, setActiveIngredient] = useState<Ingredient>(INGREDIENTS[0]);

  return (
    <section className="relative min-h-[85vh] bg-[#0F0D0C] text-white py-20 px-6 overflow-hidden border-t border-white/10">
      <div className="relative z-10 max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 border border-[#2AD2C5]/30 text-xs font-sans tracking-[0.2em] text-[#2AD2C5] uppercase">
            <Leaf className="w-3.5 h-3.5 text-[#CB9700]" />
            <span>Pure Ingredient Quality</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-white font-light">Flavor Notes & Rare Ingredients</h2>
          <p className="text-stone-400 text-sm font-light leading-relaxed">
            Every Le Damas confection is crafted from uncompromised ingredients sourced directly from heritage origin farms.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* 3D Canvas Showcase */}
          <div className="lg:col-span-6 relative h-[380px] sm:h-[460px] rounded-3xl bg-white/5 border border-white/10 overflow-hidden shadow-2xl">
            <IngredientCanvas activeColor={activeIngredient.color} />

            <div className="absolute bottom-4 left-4 right-4 z-20 bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#2AD2C5] uppercase tracking-wider block font-semibold">Active Ingredient</span>
                <span className="text-sm font-serif text-white">{activeIngredient.name}</span>
              </div>
              <span className="text-xs text-[#CB9700] font-sans border border-[#CB9700]/30 px-3 py-1 rounded-full bg-[#CB9700]/10">
                {activeIngredient.origin}
              </span>
            </div>
          </div>

          {/* Interactive Cards List */}
          <div className="lg:col-span-6 space-y-4">
            {INGREDIENTS.map((item) => {
              const isActive = activeIngredient.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveIngredient(item)}
                  onMouseEnter={() => setActiveIngredient(item)}
                  className={`w-full p-5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden ${
                    isActive
                      ? 'border-[#2AD2C5] bg-white/10 shadow-xl'
                      : 'border-white/5 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-base font-serif text-white">{item.name}</span>
                    </div>
                    <span className="text-[11px] text-stone-400 font-sans tracking-wider">{item.category}</span>
                  </div>

                  <p className="text-xs text-stone-300 font-light leading-relaxed pl-6">{item.notes}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
