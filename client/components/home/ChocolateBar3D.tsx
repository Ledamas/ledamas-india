'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, RoundedBox, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// ---- Flavor variants matched to the hero slides ----------------------------
export type ChocolateVariant = 'pistachio' | 'dubai' | 'speculoos';

const VARIANT_MATERIAL: Record<ChocolateVariant, { base: string; accent: string }> = {
  pistachio: { base: '#3B2317', accent: '#8FA646' }, // dark shell, pistachio filling
  dubai: { base: '#5B3A22', accent: '#C7A15A' },      // milk chocolate, golden kataifi
  speculoos: { base: '#241511', accent: '#B87333' },  // dark, caramel speculoos
};

/**
 * A single chocolate square segment (the classic scored-bar look).
 * Built from primitives only — no external .glb needed.
 */
function ChocolateSquare({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <RoundedBox args={[0.86, 0.28, 0.86]} radius={0.05} smoothness={4} position={position} castShadow receiveShadow>
      <meshPhysicalMaterial
        color={color}
        roughness={0.35}
        metalness={0.08}
        clearcoat={0.6}
        clearcoatRoughness={0.25}
        reflectivity={0.4}
      />
    </RoundedBox>
  );
}

function Bar({ variant }: { variant: ChocolateVariant }) {
  const group = useRef<THREE.Group>(null);
  const colors = VARIANT_MATERIAL[variant];

  // 2x4 grid of squares, like a real bar
  const squares = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let x = -0.5; x <= 0.5; x += 1) {
      for (let z = -1.5; z <= 1.5; z += 1) {
        out.push([x * 0.9, 0, z * 0.9]);
      }
    }
    return out;
  }, []);

  // Gentle continuous rotation, separate from the pointer-driven tilt on the wrapper
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.15;
  });

  return (
    <group ref={group}>
      {squares.map((pos, i) => (
        <ChocolateSquare key={i} position={pos} color={colors.base} />
      ))}
      {/* A drizzle accent across the top to read as "premium" rather than a plain slab */}
      <mesh position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0.3]}>
        <planeGeometry args={[0.35, 3.4]} />
        <meshPhysicalMaterial color={colors.accent} roughness={0.4} metalness={0.15} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

/** Small orbiting ingredient bits (pistachio / cocoa nib shapes) for ambience. */
function OrbitingCrumbs({ variant }: { variant: ChocolateVariant }) {
  const colors = VARIANT_MATERIAL[variant];
  const items = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        radius: 2.1 + (i % 2) * 0.4,
        speed: 0.15 + i * 0.03,
        offset: (i / 6) * Math.PI * 2,
        y: (i % 3) * 0.3 - 0.3,
        scale: 0.09 + (i % 3) * 0.03,
      })),
    []
  );

  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const time = useRef(0);

  useFrame((_, delta) => {
    time.current += delta;
    const t = time.current;
    items.forEach((item, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      const angle = item.offset + t * item.speed;
      mesh.position.set(Math.cos(angle) * item.radius, item.y + Math.sin(t + i) * 0.1, Math.sin(angle) * item.radius);
      mesh.rotation.x += 0.01;
      mesh.rotation.y += 0.008;
    });
  });

  return (
    <>
      {items.map((item, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)} scale={item.scale}>
          <icosahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial color={colors.accent} roughness={0.5} metalness={0.1} />
        </mesh>
      ))}
    </>
  );
}

function Scene({ variant, pointer }: { variant: ChocolateVariant; pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const wrapper = useRef<THREE.Group>(null);
  const floatGroup = useRef<THREE.Group>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    time.current += delta;
    const t = time.current;
    if (wrapper.current) {
      wrapper.current.rotation.y += (pointer.current.x * 0.5 - wrapper.current.rotation.y) * 0.04;
      wrapper.current.rotation.x += (pointer.current.y * -0.3 - wrapper.current.rotation.x) * 0.04;
    }
    if (floatGroup.current) {
      floatGroup.current.position.y = Math.sin(t * 1.4) * 0.12;
      floatGroup.current.rotation.z = Math.cos(t * 1.2) * 0.03;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 6, 4]} intensity={1.4} castShadow />
      <directionalLight position={[-4, 2, -3]} intensity={0.3} color="#CB9700" />
      <Environment preset="apartment" />

      <group ref={wrapper}>
        <group ref={floatGroup}>
          <Bar variant={variant} />
        </group>
        <OrbitingCrumbs variant={variant} />
      </group>

      <ContactShadows position={[0, -0.6, 0]} opacity={0.5} scale={6} blur={2.5} far={2} />
    </>
  );
}

interface ChocolateBar3DProps {
  variant: ChocolateVariant;
  className?: string;
  /** Disable the pointer-tilt effect, e.g. when prefers-reduced-motion is set */
  interactive?: boolean;
}

export function ChocolateBar3D({ variant, className, interactive = true }: ChocolateBar3DProps) {
  const pointer = useRef({ x: 0, y: 0 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    pointer.current = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: ((e.clientY - rect.top) / rect.height) * 2 - 1,
    };
  };

  return (
    <div
      className={className}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => (pointer.current = { x: 0, y: 0 })}
      aria-hidden="true"
    >
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 1.4, 5.2], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene variant={variant} pointer={pointer} />
      </Canvas>
    </div>
  );
}
