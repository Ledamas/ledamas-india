'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';

/* ---- Settings ---- */
const DIWALI = true; // set false after the festival
const CTA_HREF = '/collections';
const CTA_LABEL = 'Explore collection';
const VIDEO_DESKTOP = '/hero/hero.mp4';
const VIDEO_MOBILE = '/hero/hero-mobile.mp4';
const GOLD = '#F2B84B';

interface Scene {
  id: string;
  name: string;
  src: string;
  mobileSrc?: string;
  alt: string;
  focus: string; // part of the photo that stays in view when cropped
  focusMobile?: string;
  duration: number;
}

const SCENES: Scene[] = [
  {
    id: 'part-1',
    name: 'Banner 1',
    src: '/hero/part-1.png',
    mobileSrc: '/hero/portrait-part-1.png',
    alt: 'LE DAMAS Diwali chocolate banner, part 1',
    focus: '50% 50%',
    duration: 6500,
  },

  {
    id: 'part-4',
    name: 'Banner 4',
    src: '/hero/part-4.png',
    mobileSrc: '/hero/portrait-part-4.png',
    alt: 'LE DAMAS Diwali chocolate banner, part 4',
    focus: '50% 50%',
    duration: 6500,
  },
  {
    id: 'part-5',
    name: 'Indulgence Elegance',
    src: '/hero/banner-elegance.webp',
    mobileSrc: '/hero/indulgence-banner-portrait.png',
    alt: 'Indulgence Wrapped in Elegance',
    focus: '50% 50%',
    duration: 6500,
  },
  {
    id: 'part-6',
    name: 'Le Bubu',
    src: '/hero/banner-le-bubu-v2.webp',
    mobileSrc: '/hero/le-bubu-banner-portrait.png',
    alt: 'Le Bubu Chocolate',
    focus: '50% 50%',
    duration: 6500,
  },
  {
    id: 'part-7',
    name: 'Dubai Mini Bar',
    src: '/hero/hazelnut-mini-bar-portrait.png',
    mobileSrc: '/hero/hazelnut-mini-bar-portrait.png',
    alt: 'Dubai Chocolate Mini Bar',
    focus: '50% 50%',
    duration: 6500,
  },
  {
    id: 'part-8',
    name: 'Speculoos Creme',
    src: '/hero/speculoos-gift-box.webp',
    mobileSrc: '/hero/speculoos-gift-box.webp',
    alt: 'Dubai Chocolate Speculoos Creme',
    focus: '50% 50%',
    duration: 6500,
  },

  {
    id: 'part-10',
    name: 'Kunafa Creme Board',
    src: '/hero/kunafa-creme-board.webp',
    mobileSrc: '/hero/kunafa-creme-board-portrait.webp',
    alt: 'Kunafa Creme Board',
    focus: '50% 50%',
    duration: 6500,
  },
  {
    id: 'part-11',
    name: 'Kunafa Dark Flatlay',
    src: '/hero/kunafa-dark-flatlay.webp',
    mobileSrc: '/hero/kunafa-dark-flatlay.webp',
    alt: 'Kunafa Dark Flatlay',
    focus: '50% 50%',
    duration: 6500,
  },

  {
    id: 'part-13',
    name: 'Speculoos Velvet',
    src: '/hero/speculoos-velvet.webp',
    mobileSrc: '/hero/speculoos-velvet.webp',
    alt: 'Speculoos Velvet',
    focus: '50% 50%',
    duration: 6500,
  },
];

/* ---- Festive data (fixed values so server and client markup match) ---- */
const BULB_COLORS = ['#FFC93C', '#FF8A00', '#FF4D6D', '#FFE29A', '#FF6B35'];
const SWAGS = 10;
const BULBS = [
  { x: 20, y: 35 },
  { x: 35, y: 50 },
  { x: 50, y: 55 },
  { x: 65, y: 50 },
  { x: 80, y: 35 },
];

const PETAL_COLORS = ['#FF9F1C', '#FFB627', '#F77F00', '#FFD166'];
const PETALS = Array.from({ length: 10 }, (_, i) => ({
  left: `${(i * 29 + 5) % 96}%`,
  size: 9 + (i % 4) * 3,
  duration: 12 + (i % 5) * 2.5,
  delay: -((i * 1.9) % 14),
  sway: (i % 2 === 0 ? 1 : -1) * (24 + (i % 4) * 14),
  spin: 180 + (i % 3) * 120,
  color: PETAL_COLORS[i % PETAL_COLORS.length],
}));

const EMBERS = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 41 + 9) % 100}%`,
  size: 2 + (i % 3),
  sway: (i % 2 ? 1 : -1) * (10 + (i % 4) * 8),
  dur: 8 + (i % 6) * 1.6,
  delay: -((i * 1.3) % 9),
  hot: i % 3 === 0,
}));

const BOKEH = Array.from({ length: 6 }, (_, i) => ({
  left: `${(i * 23 + 6) % 90}%`,
  top: `${(i * 31 + 14) % 70}%`,
  size: 90 + i * 30,
  dur: 14 + i * 3,
  dx: (i % 2 ? 1 : -1) * (30 + i * 10),
  dy: -(20 + i * 8),
}));

const SPARKS = 16;
const BURSTS = [
  { x: '10%', y: '26%', size: 84, delay: 2.4, color: '#FFB300' },
  { x: '90%', y: '24%', size: 104, delay: 5.2, color: '#FF5D8F' },
  { x: '78%', y: '34%', size: 70, delay: 7.4, color: '#FF7A00' },
];

/* ---- Helpers ---- */
function useFrame(ref: { current: HTMLElement | null }) {
  const [frame, setFrame] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const w = Math.round(r.width);
      const h = Math.round(r.height);
      setFrame((p) => (p.w === w && p.h === h ? p : { w, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return frame;
}


/* ---- Festive pieces ---- */
function StringLights({ phone }: { phone: boolean }) {
  return (
    <div aria-hidden className="hero-lights pointer-events-none absolute inset-x-0 z-[26] flex">
      {Array.from({ length: SWAGS }, (_, si) => (
        <div key={si} className={`relative h-10 flex-1 ${si >= 5 && phone ? 'hidden' : ''}`}>
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
            <path
              d="M0 0 Q50 44 100 0"
              fill="none"
              stroke="rgba(120,80,30,0.9)"
              strokeWidth="1.25"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {BULBS.map((b, bi) => {
            const c = BULB_COLORS[(si * 5 + bi) % BULB_COLORS.length];
            return (
              <span
                key={bi}
                className="dw-bulb absolute block h-[11px] w-[8px]"
                style={{
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  marginLeft: -4,
                  backgroundColor: c,
                  boxShadow: `0 0 12px 4px ${c}99`,
                  borderRadius: '50% 50% 50% 50% / 35% 35% 65% 65%',
                  animationDelay: `${((si * 5 + bi) * 0.37) % 2.6}s`,
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Diya({ className, small = false }: { className?: string; small?: boolean }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute z-[26] ${className ?? ''}`}>
      <div
        className={`dw-glow absolute left-1/2 rounded-full ${small ? '-top-6 h-20 w-20' : '-top-9 h-32 w-32'}`}
        style={{
          background: 'radial-gradient(circle, rgba(255,190,80,0.65) 0%, rgba(255,140,30,0.22) 45%, transparent 70%)',
        }}
      />
      <svg viewBox="0 0 64 46" className={`relative drop-shadow-lg ${small ? 'h-7 w-10' : 'h-10 w-14 sm:h-12 sm:w-[4.5rem]'}`}>
        <g className="dw-flame">
          <path d="M32 3 C25 12 26 19 32 24 C38 19 39 12 32 3 Z" fill="#FF9F1C" />
          <path d="M32 11 C29.5 15 29.5 19 32 22 C34.5 19 34.5 15 32 11 Z" fill="#FFF1A8" />
        </g>
        <path d="M6 25 C8 39 22 45 32 45 C42 45 56 39 58 25 Z" fill="#A8471A" />
        <path d="M10 33 C16 41 24 43 32 43" fill="none" stroke="#D9793A" strokeWidth="1.5" />
        <ellipse cx="32" cy="25" rx="26" ry="4" fill="#C2601F" />
        <ellipse cx="32" cy="25" rx="21" ry="2.6" fill="#FFB020" opacity="0.55" />
      </svg>
    </div>
  );
}

function Burst({ x, y, size, delay, color }: { x: string; y: string; size: number; delay: number; color: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute z-[24] h-0 w-0" style={{ left: x, top: y }}>
      {Array.from({ length: SPARKS }, (_, i) => (
        <span
          key={i}
          className="dw-spark absolute left-0 top-0 block h-[2px] w-[18px] rounded-full"
          style={
            {
              background: `linear-gradient(90deg, transparent, ${color})`,
              boxShadow: `0 0 6px ${color}`,
              '--a': `${(360 / SPARKS) * i}deg`,
              '--d': `${size * (i % 2 === 0 ? 1 : 0.7)}px`,
              '--delay': `${delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/* ---- Component ---- */
export function AnimatedHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hero = useFrame(sectionRef);
  const reduceMotion = useReducedMotion();
  const still = !!reduceMotion;
  const inView = useInView(sectionRef, { amount: 0.3 });

  const [isPhone, setIsPhone] = useState(false);
  const [portrait, setPortrait] = useState(false);
  const [mode, setMode] = useState<'video' | 'photos'>('video');
  const [videoReady, setVideoReady] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [[index, direction], setSlide] = useState<[number, number]>([0, 1]);

  useEffect(() => {
    const phone = window.matchMedia('(max-width: 767px)');
    const port = window.matchMedia('(max-aspect-ratio: 5/4)');
    const set = () => {
      setIsPhone(phone.matches);
      setPortrait(port.matches);
    };
    set();
    phone.addEventListener('change', set);
    port.addEventListener('change', set);
    const saver = (navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduceMotion || saver) {
      setMode('photos');
      setPlaying(false);
    }
    return () => {
      phone.removeEventListener('change', set);
      port.removeEventListener('change', set);
    };
  }, [reduceMotion]);

  const scenes = SCENES;
  const i = Math.min(index, scenes.length - 1);
  const scene = scenes[i];
  const nextScene = scenes[(i + 1) % scenes.length];
  const srcFor = useCallback((s: Scene) => (portrait && s.mobileSrc ? s.mobileSrc : s.src), [portrait]);
  const focusFor = useCallback((s: Scene) => (portrait && s.focusMobile ? s.focusMobile : s.focus), [portrait]);
  const showVideo = mode === 'video' && videoReady;
  const running = playing && inView;

  const go = useCallback(
    (dir: 1 | -1) => setSlide(([cur]) => [(cur + dir + scenes.length) % scenes.length, dir]),
    [scenes.length]
  );

  // Photo slideshow timer (only when there is no video)
  useEffect(() => {
    if (showVideo || !playing || !inView || dragging || reduceMotion) return;
    const t = setTimeout(() => go(1), scene.duration);
    return () => clearTimeout(t);
  }, [showVideo, playing, inView, dragging, reduceMotion, scene.duration, i, go]);

  // Video play / pause
  useEffect(() => {
    const v = videoRef.current;
    if (!v || mode !== 'video') return;
    if (running) v.play().catch(() => { });
    else v.pause();
  }, [running, mode, isPhone]);

  useEffect(() => {
    if (!inView) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))) return;
      if (showVideo) return;
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inView, go, showVideo]);

  return (
    <section
      ref={sectionRef}
      data-running={running ? 'true' : 'false'}
      aria-roledescription="carousel"
      aria-label="LE DAMAS featured chocolates"
      className="group/hero relative isolate h-[54svh] min-h-[360px] max-h-[460px] w-full touch-pan-y overflow-hidden rounded-b-[1.75rem] bg-[#E8DFD0] outline-none border-none [transform:translateZ(0)] md:h-[100svh] md:max-h-none md:min-h-[640px] md:rounded-none"
      style={{ overscrollBehaviorX: 'contain', transform: 'translateZ(0)' }}
    >
      <style>{`
        /* Fairy lights hang from the header's bottom line.
           If they sit wrong, set --hero-lights-top on this section (e.g. 12.5rem). */
        .hero-lights { top: var(--hero-lights-top, 4.9rem); }
        
        .hero-cta { bottom: calc(env(safe-area-inset-bottom, 0px) + 1.5rem); }
        @media (min-width: 768px) {
          .hero-lights { top: var(--hero-lights-top, 11.9rem); }
          .hero-cta { bottom: 2.5rem; }
        }
 
        @keyframes hero-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .hero-fill { transform-origin: left; animation: hero-fill var(--d) linear forwards; }
 
        @keyframes dw-twinkle { 0%,100% { opacity: .45; transform: scale(.85); } 50% { opacity: 1; transform: scale(1.15); } }
        .dw-bulb { animation: dw-twinkle 2.6s ease-in-out infinite; }
 
        @keyframes dw-flame {
          0%,100% { transform: scale(1,1) skewX(0); }
          25% { transform: scale(.94,1.07) skewX(2deg); }
          50% { transform: scale(1.04,.94) skewX(-2deg); }
          75% { transform: scale(.97,1.04) skewX(1deg); }
        }
        .dw-flame { transform-box: fill-box; transform-origin: 50% 100%; animation: dw-flame 1.1s ease-in-out infinite; }
 
        @keyframes dw-glow { 0%,100% { opacity: .75; transform: translateX(-50%) scale(1); } 50% { opacity: 1; transform: translateX(-50%) scale(1.12); } }
        .dw-glow { transform: translateX(-50%); animation: dw-glow 2.2s ease-in-out infinite; }
 
        @keyframes dw-warmth { 0%,100% { opacity: .55; } 50% { opacity: .95; } }
        .dw-warmth { animation: dw-warmth 4.5s ease-in-out infinite; }
 
        @keyframes dw-petal {
          0%   { transform: translate3d(0,-8vh,0) rotate(0deg); opacity: 0; }
          10%  { opacity: .9; }
          50%  { transform: translate3d(var(--sway),50vh,0) rotate(var(--spin)); }
          90%  { opacity: .9; }
          100% { transform: translate3d(calc(var(--sway) * -.5),110vh,0) rotate(calc(var(--spin) * 2)); opacity: 0; }
        }
        .dw-petal { opacity: 0; animation: dw-petal var(--dur) linear var(--delay) infinite; will-change: transform; }
 
        @keyframes dw-ember { 0% { transform: translate3d(0,0,0); opacity: 0; } 15% { opacity: .95; } 100% { transform: translate3d(var(--sway),-95vh,0); opacity: 0; } }
        .dw-ember { animation: dw-ember var(--dur) ease-out var(--delay) infinite; will-change: transform; }
 
        @keyframes dw-bokeh { 0%,100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(var(--dx),var(--dy),0); } }
        .dw-bokeh { animation: dw-bokeh var(--dur) ease-in-out infinite; }
 
        @keyframes dw-spark {
          0%   { transform: rotate(var(--a)) translateX(0) scaleX(.3); opacity: 0; }
          3%   { opacity: 1; }
          20%  { transform: rotate(var(--a)) translateX(var(--d)) scaleX(1); opacity: 0; }
          100% { transform: rotate(var(--a)) translateX(var(--d)) scaleX(1); opacity: 0; }
        }
        .dw-spark { opacity: 0; transform-origin: 0 50%; animation: dw-spark 8s ease-out var(--delay) infinite both; }
 
        /* Pause every decorative loop when the hero is off screen or paused: saves battery */
        [data-running='false'] .dw-bulb, [data-running='false'] .dw-flame, [data-running='false'] .dw-glow,
        [data-running='false'] .dw-warmth, [data-running='false'] .dw-petal, [data-running='false'] .dw-ember,
        [data-running='false'] .dw-bokeh, [data-running='false'] .dw-spark { animation-play-state: paused; }
 
        @media (prefers-reduced-motion: reduce) {
          .hero-fill, .dw-bulb, .dw-flame, .dw-glow, .dw-warmth, .dw-petal, .dw-ember, .dw-bokeh, .dw-spark { animation: none; }
          .dw-petal, .dw-ember, .dw-spark { display: none; }
        }
      `}</style>

      {/* Backdrop while the first picture loads */}
      <div
        aria-hidden
        className="absolute inset-0 z-[1]"
        style={{ background: 'radial-gradient(ellipse 90% 60% at 50% 45%, #F0E6D8 0%, #E8DFD0 45%, #D6CABA 85%)' }}
      />

      {/* Photo hero: always fills the screen. Also the placeholder while video loads. */}
      <div className={`absolute inset-0 z-10 transition-opacity duration-1000 ${showVideo ? 'opacity-0' : 'opacity-100'}`}>
        <AnimatePresence>
          <motion.div
            key={scene.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.8 } }}
            /* keeps the old shot visible until the new one has finished fading in */
            exit={{ opacity: 0.999, transition: { duration: 0.8 } }}
          >
            {/* Slow camera settle. Significantly reduced zoom to keep more of the image in frame. */}
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.02, x: still ? 0 : direction * 4 }}
              animate={still ? undefined : { scale: 1, x: 0 }}
              transition={{ duration: scene.duration / 1000 + 2, ease: 'linear' }}
            >
              <Image
                src={srcFor(scene)}
                alt={scene.alt}
                fill
                unoptimized
                priority={i === 0}
                sizes="100vw"
                draggable={false}
                className="object-cover"
                style={{ objectPosition: focusFor(scene) }}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Swipe */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          dragMomentum={false}
          onDragStart={() => setDragging(true)}
          onDragEnd={(_, info) => {
            setDragging(false);
            if (Math.abs(info.offset.x) > 60 || Math.abs(info.velocity.x) > 250) go(info.offset.x < 0 ? 1 : -1);
          }}
          style={{ touchAction: 'pan-y' }}
          className="absolute inset-0 z-[2] cursor-grab active:cursor-grabbing"
        />
      </div>

      {/* Video hero (used when the files exist) */}
      {mode === 'video' && (
        <video
          key={isPhone ? 'm' : 'd'}
          ref={videoRef}
          src={isPhone ? VIDEO_MOBILE : VIDEO_DESKTOP}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          onCanPlay={() => setVideoReady(true)}
          onError={() => setMode('photos')}
          className={`absolute inset-0 z-[11] h-full w-full object-cover transition-opacity duration-1000 ${videoReady ? 'opacity-100' : 'opacity-0'
            }`}
        />
      )}

      {/* ------------------------------ Lighting ------------------------------ */}
      {DIWALI && (
        <div
          aria-hidden
          className="dw-warmth pointer-events-none absolute inset-0 z-[14] mix-blend-soft-light"
          style={{
            background:
              'radial-gradient(ellipse 70% 45% at 50% 105%, rgba(255,170,50,.8), transparent 70%), radial-gradient(ellipse 60% 30% at 50% -5%, rgba(255,200,90,.55), transparent 70%), radial-gradient(circle at 6% 100%, rgba(255,150,40,.7), transparent 40%)',
          }}
        />
      )}

      {/* Readability: darker at the top (header) and a deeper, wider base for the text and controls */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[15]"
        style={{
          background:
            'linear-gradient(to bottom, rgba(8,2,10,.55) 0%, transparent 22%, transparent 42%, rgba(8,2,10,.55) 72%, rgba(8,2,10,.85) 100%), radial-gradient(ellipse at center, transparent 55%, rgba(8,2,10,.4) 100%)',
        }}
      />

      {DIWALI && !still && (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[17] mix-blend-screen">
          {(isPhone ? BOKEH.slice(0, 3) : BOKEH).map((b, k) => (
            <span
              key={k}
              className="dw-bokeh absolute rounded-full"
              style={
                {
                  left: b.left,
                  top: b.top,
                  width: b.size,
                  height: b.size,
                  opacity: 0.2,
                  background: 'radial-gradient(circle, rgba(255,196,90,.75) 0%, transparent 70%)',
                  '--dx': `${b.dx}px`,
                  '--dy': `${b.dy}px`,
                  '--dur': `${b.dur}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      {DIWALI && !still && (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[18] overflow-hidden">
          {(isPhone ? PETALS.slice(0, 5) : PETALS).map((p, k) => (
            <span
              key={k}
              className="dw-petal absolute top-0 block"
              style={
                {
                  left: p.left,
                  width: p.size,
                  height: p.size * 1.35,
                  borderRadius: '80% 0 80% 0',
                  background: `linear-gradient(135deg, ${p.color}, #FF6A00)`,
                  '--dur': `${p.duration}s`,
                  '--delay': `${p.delay}s`,
                  '--sway': `${p.sway}px`,
                  '--spin': `${p.spin}deg`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      {DIWALI && !still && (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[19] overflow-hidden">
          {(isPhone ? EMBERS.slice(0, 8) : EMBERS).map((e, k) => (
            <span
              key={k}
              className="dw-ember absolute bottom-0 block rounded-full"
              style={
                {
                  left: e.left,
                  width: e.size,
                  height: e.size,
                  background: e.hot ? '#FF9F1C' : '#FFD98A',
                  boxShadow: '0 0 8px 2px rgba(255,176,32,.6)',
                  '--sway': `${e.sway}px`,
                  '--dur': `${e.dur}s`,
                  '--delay': `${e.delay}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      {DIWALI && !still && (isPhone ? BURSTS.slice(0, 2) : BURSTS).map((b, k) => <Burst key={k} {...b} />)}

      {DIWALI && <StringLights phone={isPhone} />}

      {/* Diyas sit on the right  */}
      {DIWALI && (
        <>
          <Diya small className="bottom-[9.5rem] right-4 hidden sm:block md:bottom-[5.5rem] md:right-10" />
          <Diya small className="bottom-[9.5rem] right-[4.25rem] hidden sm:block md:bottom-[5.5rem] md:right-[6.75rem]" />
          <Diya small className="bottom-[5.5rem] right-[9.5rem] hidden md:block" />
        </>
      )}

      {/* Opening fade from black */}
      {!still && (
        <motion.div
          aria-hidden
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="pointer-events-none absolute inset-0 z-40 bg-black"
        />
      )}

      {/* CTA: shown on phones and desktop */}
      <div className="hero-cta pointer-events-none absolute inset-x-0 z-30 flex justify-center px-5">
        <a
          href={CTA_HREF}
          className="pointer-events-auto inline-flex items-center rounded-full px-6 py-2.5 text-sm font-semibold text-[#2A0F05] shadow-[0_10px_34px_rgba(242,184,75,.35)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-7 sm:py-3 sm:text-[15px]"
          style={{ backgroundColor: GOLD }}
        >
          {CTA_LABEL}
        </a>
      </div>

      {/* Preload next photo */}
      <div aria-hidden className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0">
        <Image
          key={`${nextScene.id}-${srcFor(nextScene)}`}
          src={srcFor(nextScene)}
          alt=""
          fill
          unoptimized
          priority={false}
          sizes="100vw"
        />
      </div>
    </section>
  );
}

