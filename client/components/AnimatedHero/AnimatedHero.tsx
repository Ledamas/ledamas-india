'use client';

/**
 * LE DAMAS photo-reel hero — Diwali edition (phone-first rewrite)
 *
 * Setup: copy the folder `hero-images/` into your Next.js `public/` folder and
 * rename it to `public/hero/`, so files live at /hero/<name>.webp
 *
 * What changed vs the previous version
 * ------------------------------------
 * 1. SMART FIT. The hero measures its own frame and every image's real
 *    aspect ratio. On portrait screens (phones, tablets held upright) it asks:
 *    "how much of this image would `cover` cut off?"  If too much (banner text,
 *    product names on boxes) it shows the WHOLE image, centred on a soft blurred
 *    copy of itself. If little is lost it fills the screen edge to edge.
 *    Tune with MIN_VISIBLE_TEXT / MIN_VISIBLE_PHOTO below.
 * 2. NO EDGE REVEALS. Parallax / drag / tilt are clamped to the overscan margin,
 *    and are switched off where they would push banner text off the screen.
 * 3. SOFTER CAMERA ON PHONES. Half-strength push/pull, no handheld rotation.
 * 4. CONTROLS CLEAR THE "ORDER NOW" BUTTON. Scrubber + play sit in one row above
 *    it (adjust with --hero-cta-clearance) and respect the iOS safe area.
 * 5. LIGHTER ON PHONES. No blur() on scene transitions, no rotating ray layer,
 *    no animated grain, smaller backdrop blur, fewer particles.
 * 6. Preload uses the SAME url as the visible image (so the cache is really warm)
 *    and doubles as the aspect-ratio probe for the next slide.
 *
 * Set DIWALI to false after the festival to remove every festive effect.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from 'framer-motion';
import { Pause, Play } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

const DIWALI = true; // string lights, diyas, petals, sparks, embers, warm glow

type Tone = 'dark' | 'light'; // light = cream / beige photo backgrounds
type Cam = 'in' | 'out' | 'left' | 'right' | 'up' | 'down';

interface Chapter {
  id: string;
  name: string; // used for the scrubber's accessible label only
  accent: string;
}

interface Scene {
  id: string;
  chapter: string;
  src: string;
  mobileSrc?: string; // portrait art for phones / upright tablets
  alt: string;
  focus: string; // object-position: which part stays in frame when cropped
  cam: Cam; // camera move
  tone: Tone;
  duration: number; // ms
  /** 'contain' = a banner with copy baked into the picture: never crop it. */
  fit?: 'contain';
  desktopOnly?: boolean; // restrict scene to desktop mode only
}

const CHAPTERS: Chapter[] = [
  { id: 'collection', name: 'The Dubai Chocolate collection', accent: '#E0912B' },
  { id: 'kunafa-creme', name: 'Kunafa & Pistachio Creme', accent: '#9CB84B' },
  { id: 'le-bubu', name: 'Le Bubu', accent: '#E63946' },
  { id: 'kunafa-dark', name: 'Kunafa & Pistachio Dark Chocolate', accent: '#CB9700' },
  { id: 'mini-bar', name: 'Dubai Chocolate Mini Bar', accent: '#2B7A9B' },
];

const BANNER = 6500; // wide banners need reading time
const WIDE = 6500; // main photos

// Fallback aspect ratio of the wide banners (all are about 2.64 : 1).
// Real ratios are measured from the loaded image; this is only the first guess.
const BANNER_RATIO = 2.64;
const PORTRAIT_GUESS = 9 / 16;

/* ---- Tuning knobs -------------------------------------------------------- */

const IMG_QUALITY = 85; // one value everywhere => same URL => browser cache hits
const MOBILE_MAX_W = 768; // px: below this we use the lighter "phone" mode
const LANDSCAPE_MIN_RATIO = 1.25; // frame width / height at or above this = landscape

/**
 * On portrait screens: the share of an image that must stay visible when it is
 * cropped to fill the screen. Below the number, the whole image is shown instead.
 *   1.00 = never crop anything (everything is shown whole)
 *   0.70 = allow up to 30% of the image to be cropped away
 * Banners carry text, so they get a much stricter limit than product photos.
 */
const MIN_VISIBLE_TEXT = 0.92;
const MIN_VISIBLE_PHOTO = 0.7;

const SCENES: Scene[] = [
  /* Collection */
  {
    id: 'banner-elegance',
    chapter: 'collection',
    src: '/hero/banner-elegance.webp',
    mobileSrc: '/hero/indulgence-banner-portrait.png',
    alt: 'Indulgence wrapped in elegance: the LE DAMAS Dubai Chocolate collection with pistachios and dark chocolate swirls',
    focus: '50% 50%',
    cam: 'in',
    tone: 'light',
    duration: BANNER,
    fit: 'contain',
  },

  /* Kunafa & Pistachio Creme */
  {
    id: 'banner-pure-indulgence',
    chapter: 'kunafa-creme',
    src: '/hero/banner-pure-indulgence-v2.webp',
    alt: 'Creamy. Crispy. Pure indulgence. Kunafa and Pistachio Creme stuffed chocolate',
    focus: '50% 50%',
    cam: 'in',
    tone: 'dark',
    duration: BANNER,
    fit: 'contain',
    desktopOnly: true,
  },
  {
    id: 'kunafa-creme-board',
    chapter: 'kunafa-creme',
    src: '/hero/kunafa-creme-board.webp',
    mobileSrc: '/hero/kunafa-creme-board-portrait.webp',
    alt: 'Kunafa and Pistachio Creme box with stacked bars on a wooden board',
    focus: '35% 45%',
    cam: 'right',
    tone: 'dark',
    duration: WIDE,
  },

  /* Le Bubu */
  {
    id: 'banner-le-bubu',
    chapter: 'le-bubu',
    src: '/hero/banner-le-bubu-v2.webp',
    mobileSrc: '/hero/le-bubu-banner-portrait.png',
    alt: 'Le Bubu Dubai Chocolate, made for happy munching: two children with character-shaped chocolates',
    focus: '50% 50%',
    cam: 'in',
    tone: 'light',
    duration: BANNER,
    fit: 'contain',
  },

  /* Kunafa & Pistachio Dark Chocolate */
  {
    id: 'kunafa-dark-flatlay',
    chapter: 'kunafa-dark',
    src: '/hero/kunafa-dark-flatlay.webp',
    mobileSrc: '/hero/hazelnut-mini-bar-portrait.png',
    alt: 'Purple Dubai chocolate box with dark chocolate bars and crushed pistachio',
    focus: '30% 50%',
    cam: 'out',
    tone: 'light',
    duration: WIDE,
  },

  /* Mini Bar */
  {
    id: 'mini-bar-cozy',
    chapter: 'mini-bar',
    src: '/hero/mini-bar-cozy.webp',
    mobileSrc: '/hero/mini-bar-cozy-portrait.webp',
    alt: 'Dubai Chocolate mini bar box with pistachio-filled pieces on a plate beside a mug and lamp',
    focus: '55% 62%',
    cam: 'in',
    tone: 'dark',
    duration: WIDE,
  },
];

/* -------------------------------------------------------------------------- */
/*  Motion constants                                                          */
/* -------------------------------------------------------------------------- */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Pose = { scale: number; x: number; y: number }; // x / y in % of the frame
const CAMERA: Record<Cam, { from: Pose; to: Pose }> = {
  in: { from: { scale: 1.03, x: 0, y: 0 }, to: { scale: 1.13, x: 0, y: 0 } },
  out: { from: { scale: 1.15, x: 0, y: 0 }, to: { scale: 1.04, x: 0, y: 0 } },
  left: { from: { scale: 1.1, x: 2.5, y: 0 }, to: { scale: 1.1, x: -2.5, y: 0 } },
  right: { from: { scale: 1.1, x: -2.5, y: 0 }, to: { scale: 1.1, x: 2.5, y: 0 } },
  up: { from: { scale: 1.1, x: 0, y: 2.5 }, to: { scale: 1.1, x: 0, y: -2.5 } },
  down: { from: { scale: 1.1, x: 0, y: -2.5 }, to: { scale: 1.1, x: 0, y: 2.5 } },
};
// Whole-image shots only get a very gentle push-in (almost none on phones).
const CONTAIN_CAM = { from: { scale: 1, x: 0, y: 0 }, to: { scale: 1.04, x: 0, y: 0 } };
const CONTAIN_CAM_PHONE = { from: { scale: 1, x: 0, y: 0 }, to: { scale: 1.015, x: 0, y: 0 } };

/** Scales a camera move toward "no move": k = 1 keeps it, k = 0 removes it. */
const soften = (p: Pose, k: number): Pose => ({
  scale: 1 + (p.scale - 1) * k,
  x: p.x * k,
  y: p.y * k,
});

// Softens the edges of a whole-image shot into its blurred backdrop.
const FADE_Y = 'linear-gradient(to bottom, transparent 0%, #000 5%, #000 95%, transparent 100%)';
const FADE_X = 'linear-gradient(to right, transparent 0%, #000 5%, #000 95%, transparent 100%)';

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.6'/></svg>\")";

// Fixed positions so server and client markup match (no Math.random in render)
const DUST = Array.from({ length: 24 }, (_, i) => ({
  left: `${(i * 37 + 7) % 100}%`,
  top: `${35 + ((i * 53 + 11) % 60)}%`,
  size: 1 + (i % 3),
  drift: 14 + (i % 5) * 5,
  sway: (i % 2 === 0 ? 1 : -1) * (10 + (i % 4) * 8),
  duration: 7 + (i % 6) * 1.6,
  delay: (i % 7) * 0.9,
  tinted: i % 3 === 0,
}));

const BOKEH = Array.from({ length: 5 }, (_, i) => ({
  left: `${(i * 23 + 6) % 92}%`,
  top: `${(i * 31 + 12) % 78}%`,
  size: 90 + i * 34,
  duration: 14 + i * 3,
  dx: (i % 2 === 0 ? 1 : -1) * (30 + i * 10),
  dy: -(20 + i * 8),
}));

/* ---- Diwali ---- */

const BULB_COLORS = ['#FFC93C', '#FF8A00', '#FF4D6D', '#FFE29A', '#FF6B35'];
const SWAGS = 10; // hanging loops of lights (only the first 5 show on phones)
// Bulb positions along one loop, as % of the loop's width and height
const BULBS = [
  { x: 20, y: 35 },
  { x: 35, y: 50 },
  { x: 50, y: 55 },
  { x: 65, y: 50 },
  { x: 80, y: 35 },
];

const PETAL_COLORS = ['#FF9F1C', '#FFB627', '#F77F00', '#FFD166'];
const PETALS = Array.from({ length: 12 }, (_, i) => ({
  left: `${(i * 29 + 5) % 96}%`,
  size: 9 + (i % 4) * 3,
  duration: 12 + (i % 5) * 2.5,
  delay: -((i * 1.9) % 14), // negative: petals are already mid-fall on load
  sway: (i % 2 === 0 ? 1 : -1) * (24 + (i % 4) * 14),
  spin: 180 + (i % 3) * 120,
  color: PETAL_COLORS[i % PETAL_COLORS.length],
}));

const SPARKS = 16;
const BURSTS = [
  { x: '10%', y: '13%', size: 84, delay: 2.4, color: '#FFB300' },
  { x: '90%', y: '11%', size: 104, delay: 5.2, color: '#FF5D8F' },
  { x: '78%', y: '21%', size: 70, delay: 7.4, color: '#FF7A00' },
];

/* The camera flies "through" the old shot into the new one. */
const sceneVariants: Variants = {
  enter: { opacity: 0, scale: 0.95, y: 30, filter: 'blur(14px)' },
  center: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1.2, ease: EASE },
  },
  exit: {
    opacity: 0,
    scale: 1.18,
    filter: 'blur(10px)',
    transition: { duration: 0.9, ease: [0.65, 0, 0.35, 1] },
  },
};

// Phones: no full-screen blur() during transitions (it is the #1 cause of jank).
const phoneSceneVariants: Variants = {
  enter: { opacity: 0, scale: 0.98 },
  center: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: EASE } },
  exit: { opacity: 0, scale: 1.04, transition: { duration: 0.7, ease: [0.65, 0, 0.35, 1] } },
};

const fadeVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const clampAbs = (v: number, limit: number) => Math.max(-limit, Math.min(limit, v));

/**
 * Share of an image that stays visible when it is scaled to COVER a frame.
 * 1 = nothing cropped, 0.5 = half of the image is cut off along one axis.
 */
const visibleShare = (imageRatio: number, frameRatio: number) =>
  imageRatio > frameRatio ? frameRatio / imageRatio : imageRatio / frameRatio;

/** Measures an element (the hero) and keeps width / height up to date. */
function useFrame(ref: { current: HTMLElement | null }) {
  const [frame, setFrame] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const w = Math.round(r.width);
      const h = Math.round(r.height);
      setFrame((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return frame;
}

/* -------------------------------------------------------------------------- */
/*  Small pieces                                                              */
/* -------------------------------------------------------------------------- */

/** A light sheen that sweeps across the photo (lights up glossy chocolate). */
function Glint({ delay }: { delay: number }) {
  return (
    <motion.div
      aria-hidden
      initial={{ x: '-150%' }}
      animate={{ x: '450%' }}
      transition={{ duration: 1.6, delay, ease: [0.4, 0, 0.2, 1] }}
      className="pointer-events-none absolute inset-y-[-10%] left-0 w-[30%] -skew-x-12"
      style={{
        mixBlendMode: 'screen',
        background:
          'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.04) 70%, transparent 100%)',
      }}
    />
  );
}

/** Fill of the active scrubber segment: moves across all shots of the chapter. */
function ChapterFill({
  progress,
  local,
  count,
  color,
  still,
}: {
  progress: MotionValue<number>;
  local: number;
  count: number;
  color: string;
  still: boolean;
}) {
  const scaleX = useTransform(progress, (p) => (local + p) / count);
  return (
    <motion.span
      className="block h-full w-full"
      style={{
        scaleX: still ? 1 : scaleX,
        originX: 0,
        backgroundColor: color,
        boxShadow: `0 0 12px ${color}`,
      }}
    />
  );
}

/* ---- Diwali pieces ---- */

/** Fairy lights hanging in loops from the top edge, twinkling out of step. */
function StringLights() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-[26] flex">
      {Array.from({ length: SWAGS }, (_, si) => (
        <div key={si} className={`relative h-10 flex-1 ${si >= 5 ? 'hidden md:block' : ''}`}>
          <svg
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            <path
              d="M0 0 Q50 44 100 0"
              fill="none"
              stroke="rgba(110,75,30,0.85)"
              strokeWidth="1.25"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {BULBS.map((b, bi) => {
            const c = BULB_COLORS[(si * 5 + bi) % BULB_COLORS.length];
            return (
              <span
                key={bi}
                className="diwali-bulb absolute block h-[11px] w-[8px]"
                style={{
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  marginLeft: -4,
                  backgroundColor: c,
                  boxShadow: `0 0 10px 3px ${c}99`,
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

/** A clay diya with a flickering flame and a warm halo. */
function Diya({ className, small = false }: { className?: string; small?: boolean }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute z-[26] ${className ?? ''}`}>
      <div
        className={`diwali-glow absolute left-1/2 rounded-full ${
          small ? '-top-5 h-16 w-16' : '-top-7 h-24 w-24'
        }`}
        style={{
          background:
            'radial-gradient(circle, rgba(255,190,80,0.6) 0%, rgba(255,140,30,0.2) 45%, transparent 70%)',
        }}
      />
      <svg
        viewBox="0 0 64 46"
        className={`relative drop-shadow-lg ${small ? 'h-7 w-10' : 'h-10 w-14 sm:h-11 sm:w-16'}`}
      >
        <g className="diwali-flame">
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

/** One firework: rays fly out from a point, fade, and repeat. */
function Burst({
  x,
  y,
  size,
  delay,
  color,
}: {
  x: string;
  y: string;
  size: number;
  delay: number;
  color: string;
}) {
  return (
    <div aria-hidden className="pointer-events-none absolute z-[24] h-0 w-0" style={{ left: x, top: y }}>
      {Array.from({ length: SPARKS }, (_, i) => (
        <span
          key={i}
          className="diwali-spark absolute left-0 top-0 block h-[2px] w-[18px] rounded-full"
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

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function AnimatedHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const frame = useFrame(sectionRef);

  // Layout mode comes from the hero's own measured size, not from guesses.
  const frameRatio = frame.h ? frame.w / frame.h : 16 / 9;
  const isLandscape = !frame.w || frameRatio >= LANDSCAPE_MIN_RATIO;
  const isMobile = frame.w > 0 && frame.w < MOBILE_MAX_W;

  const [[rawIndex, direction], setSlide] = useState<[number, number]>([0, 1]);
  const [cuts, setCuts] = useState(0); // counts product changes (drives the light streak)
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [ratios, setRatios] = useState<Record<string, number>>({}); // src -> width / height

  const reduceMotion = useReducedMotion();
  const inView = useInView(sectionRef, { amount: 0.35 });

  const scenes = useMemo(() => {
    if (!isLandscape || isMobile) {
      return SCENES.filter((s) => !s.desktopOnly);
    }
    return SCENES;
  }, [isLandscape, isMobile]);

  const index = Math.min(rawIndex, scenes.length - 1);
  const scene = scenes[index];
  const nextScene = scenes[(index + 1) % scenes.length];
  const chapter = CHAPTERS.find((c) => c.id === scene.chapter) ?? CHAPTERS[0];
  const accent = chapter.accent;
  const isLight = scene.tone === 'light';
  const progress = useMotionValue(0); // 0 to 1 across the current scene

  /* ---- Which file, and how it is fitted ---- */
  const srcFor = useCallback(
    (s: Scene) => (!isLandscape && s.mobileSrc ? s.mobileSrc : s.src),
    [isLandscape]
  );
  const guessFor = (s: Scene, src: string) =>
    s.fit === 'contain' ? (src === s.mobileSrc ? PORTRAIT_GUESS : BANNER_RATIO) : 1;

  const activeSrc = srcFor(scene);
  const nextActiveSrc = srcFor(nextScene);
  const measured = ratios[activeSrc];
  const ratio = measured ?? guessFor(scene, activeSrc);

  const isBanner = scene.fit === 'contain';
  let fit: 'cover' | 'contain';
  if (isLandscape) {
    fit = isBanner ? 'contain' : 'cover'; // desktop behaviour, unchanged
  } else {
    const min = isBanner ? MIN_VISIBLE_TEXT : MIN_VISIBLE_PHOTO;
    fit = visibleShare(ratio, frameRatio) >= min ? 'cover' : 'contain';
  }

  const overscan = isMobile ? 0.03 : 0.05; // photo is drawn this much larger than the frame
  const cam =
    fit === 'contain'
      ? isLandscape
        ? CONTAIN_CAM
        : CONTAIN_CAM_PHONE
      : isLandscape
        ? CAMERA[scene.cam]
        : {
            from: soften(CAMERA[scene.cam].from, 0.5),
            to: soften(CAMERA[scene.cam].to, 0.5),
          };

  const rememberRatio = useCallback((src: string, el: HTMLImageElement) => {
    if (!el.naturalWidth || !el.naturalHeight) return;
    const r = el.naturalWidth / el.naturalHeight;
    setRatios((prev) => (prev[src] ? prev : { ...prev, [src]: r }));
  }, []);

  // Scrubber groups: one segment per product chapter
  const groups = useMemo(
    () =>
      CHAPTERS.map((c) => ({
        chapter: c,
        indices: scenes.flatMap((s, i) => (s.chapter === c.id ? [i] : [])),
      })).filter((g) => g.indices.length > 0),
    [scenes]
  );
  const activeGroup = Math.max(
    0,
    groups.findIndex((g) => g.chapter.id === scene.chapter)
  );
  const localIndex = Math.max(0, groups[activeGroup].indices.indexOf(index));

  /* ---- Movement: pointer, phone tilt and finger drag feed the same layer ---- */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const dragX = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 60, damping: 20, mass: 0.7 });
  const smoothY = useSpring(mouseY, { stiffness: 60, damping: 20, mass: 0.7 });

  // Amplitudes and safety limits live in motion values so the transforms below
  // never read stale props. Limits stop the photo from ever exposing its edges.
  const pAmpX = useMotionValue(36);
  const pAmpY = useMotionValue(36);
  const dragAmp = useMotionValue(0.35);
  const tiltAmp = useMotionValue(1);
  const limX = useMotionValue(60);
  const limY = useMotionValue(30);

  useEffect(() => {
    pAmpX.set(isMobile ? 14 : 36);
    pAmpY.set(isMobile ? 16 : 36);
    dragAmp.set(isMobile ? 0.4 : 0.35);
    tiltAmp.set(isMobile ? 0 : 1);

    if (fit === 'cover') {
      limX.set(frame.w * overscan * 0.9);
      limY.set(frame.h * overscan * 0.9);
    } else if (isLandscape) {
      limX.set(48); // wide banner floating over its backdrop
      limY.set(18);
    } else {
      limX.set(0); // whole image on a phone: keep every word exactly in place
      limY.set(0);
    }
  }, [isMobile, isLandscape, fit, frame.w, frame.h, overscan, pAmpX, pAmpY, dragAmp, tiltAmp, limX, limY]);

  const shiftX = useTransform(
    [smoothX, dragX, pAmpX, dragAmp, limX],
    ([m, d, pa, da, l]: number[]) => clampAbs(m * pa + d * da, l)
  );
  const shiftY = useTransform([smoothY, pAmpY, limY], ([m, pa, l]: number[]) => clampAbs(m * pa, l));
  const tiltY = useTransform([smoothX, tiltAmp], ([m, t]: number[]) => m * 6 * t);
  const tiltX = useTransform([smoothY, tiltAmp], ([m, t]: number[]) => m * -5 * t);
  const dustX = useTransform(smoothX, [-0.5, 0.5], [16, -16]);
  const bokehX = useTransform(smoothX, [-0.5, 0.5], [70, -70]);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduceMotion || e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Phone tilt (Android and browsers that don't ask for permission)
  useEffect(() => {
    if (reduceMotion || typeof DeviceOrientationEvent === 'undefined') return;
    const needsPermission =
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission ===
      'function';
    if (needsPermission) return; // iOS would show a prompt, so skip it

    let base: { b: number; g: number } | null = null;
    const clamp = (v: number) => Math.max(-0.5, Math.min(0.5, v));
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      if (!base) base = { b: e.beta, g: e.gamma };
      mouseX.set(clamp((e.gamma - base.g) / 50));
      mouseY.set(clamp((e.beta - base.b) / 50));
    };
    window.addEventListener('deviceorientation', onTilt);
    return () => window.removeEventListener('deviceorientation', onTilt);
  }, [reduceMotion, mouseX, mouseY]);

  /* ---- Navigation ---- */
  const moveTo = useCallback(
    (target: number, dir: number) => {
      if (target === index) return;
      if (scenes[target].chapter !== scenes[index].chapter) setCuts((c) => c + 1);
      setSlide([target, dir]);
      progress.set(0);
    },
    [index, scenes, progress]
  );

  const go = useCallback(
    (dir: 1 | -1) => moveTo((index + dir + scenes.length) % scenes.length, dir),
    [index, scenes.length, moveTo]
  );

  useEffect(() => {
    if (reduceMotion) setIsPlaying(false);
  }, [reduceMotion]);

  const running = isPlaying && inView && !isDragging;
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const delta = Math.min(now - last, 64);
      last = now;
      const next = progress.get() + delta / scene.duration;
      if (next >= 1) {
        go(1);
      } else {
        progress.set(next);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, progress, go, scene.duration]);

  useEffect(() => {
    if (!inView) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))) return;
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inView, go]);

  const glints = scene.duration > 5500 ? [1.4, 4.3] : [1.2];

  /* ---- The picture ---- */
  const photo = (
    <Image
      src={activeSrc}
      alt={scene.alt}
      fill
      priority={index === 0}
      sizes="100vw"
      quality={IMG_QUALITY}
      onLoad={(e) => rememberRatio(activeSrc, e.currentTarget)}
      className={fit === 'contain' ? 'object-contain' : 'object-cover'}
      style={{ objectPosition: scene.focus }}
    />
  );

  // Whole-image shots: an exact-size box (image ratio, capped to the frame),
  // with soft edges on whichever axis has spare room.
  let boxStyle: React.CSSProperties = { width: '100%', aspectRatio: String(ratio) };
  if (frame.w > 0 && frame.h > 0) {
    const w = Math.min(frame.w, frame.h * ratio);
    const h = w / ratio;
    const layers = [frame.h - h > 8 ? FADE_Y : '', frame.w - w > 8 ? FADE_X : '']
      .filter(Boolean)
      .join(', ');
    boxStyle = {
      width: w,
      height: h,
      ...(layers
        ? {
            WebkitMaskImage: layers,
            maskImage: layers,
            WebkitMaskComposite: 'source-in',
            maskComposite: 'intersect',
          }
        : {}),
    } as React.CSSProperties;
  }

  const variants = reduceMotion ? fadeVariants : isMobile ? phoneSceneVariants : sceneVariants;

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label="LE DAMAS featured chocolates"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative isolate h-[100svh] min-h-[420px] w-full touch-pan-y overflow-hidden bg-[#0A0807] md:min-h-[560px]"
      style={{ overscrollBehaviorX: 'contain' }}
    >
      <style>{`
        /* Scrubber + play row. On phones it sits ABOVE the floating "Order now"
           button. Change the clearance by setting --hero-cta-clearance on the section. */
        .hero-controls {
          bottom: calc(env(safe-area-inset-bottom, 0px) + var(--hero-cta-clearance, 4.75rem));
        }
        @media (min-width: 768px) {
          .hero-controls { bottom: 2rem; }
        }

        @keyframes hero-grain {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-3%, 2%); }
          40% { transform: translate(2%, -3%); }
          60% { transform: translate(-2%, -1%); }
          80% { transform: translate(3%, 3%); }
        }
        .hero-grain { animation: hero-grain 0.9s steps(5) infinite; }

        /* ---- Diwali ---- */
        @keyframes diwali-twinkle {
          0%, 100% { opacity: 0.45; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        .diwali-bulb { animation: diwali-twinkle 2.6s ease-in-out infinite; }

        @keyframes diwali-flame {
          0%, 100% { transform: scale(1, 1) skewX(0deg); }
          25% { transform: scale(0.94, 1.07) skewX(2deg); }
          50% { transform: scale(1.04, 0.94) skewX(-2deg); }
          75% { transform: scale(0.97, 1.04) skewX(1deg); }
        }
        .diwali-flame {
          transform-box: fill-box;
          transform-origin: 50% 100%;
          animation: diwali-flame 1.1s ease-in-out infinite;
        }

        @keyframes diwali-glow {
          0%, 100% { opacity: 0.75; transform: translateX(-50%) scale(1); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.12); }
        }
        .diwali-glow { transform: translateX(-50%); animation: diwali-glow 2.2s ease-in-out infinite; }

        @keyframes diwali-warmth {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.9; }
        }
        .diwali-warmth { animation: diwali-warmth 5s ease-in-out infinite; }

        @keyframes diwali-petal {
          0%   { transform: translate3d(0, -8vh, 0) rotate(0deg); opacity: 0; }
          10%  { opacity: 0.85; }
          50%  { transform: translate3d(var(--sway), 50vh, 0) rotate(var(--spin)); }
          90%  { opacity: 0.85; }
          100% { transform: translate3d(calc(var(--sway) * -0.5), 110vh, 0) rotate(calc(var(--spin) * 2)); opacity: 0; }
        }
        .diwali-petal { opacity: 0; animation: diwali-petal var(--dur) linear var(--delay) infinite; }

        @keyframes diwali-spark {
          0%   { transform: rotate(var(--a)) translateX(0) scaleX(0.3); opacity: 0; }
          3%   { opacity: 1; }
          20%  { transform: rotate(var(--a)) translateX(var(--d)) scaleX(1); opacity: 0; }
          100% { transform: rotate(var(--a)) translateX(var(--d)) scaleX(1); opacity: 0; }
        }
        .diwali-spark {
          opacity: 0;
          transform-origin: 0 50%;
          animation: diwali-spark 8s ease-out var(--delay) infinite both;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-grain, .diwali-bulb, .diwali-flame, .diwali-glow, .diwali-warmth { animation: none; }
        }
      `}</style>

      {/* ------------------------------------------------------------------ */}
      {/*  Scene: the photo fills the screen (or sits whole on a backdrop)   */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence mode="sync">
        <motion.div
          key={scene.id}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 z-10"
        >
          {/* Camera move: push in, pull out or pan */}
          <motion.div
            initial={{ scale: cam.from.scale, x: `${cam.from.x}%`, y: `${cam.from.y}%` }}
            animate={
              reduceMotion
                ? undefined
                : { scale: cam.to.scale, x: `${cam.to.x}%`, y: `${cam.to.y}%` }
            }
            transition={{ duration: scene.duration / 1000 + 1.5, ease: 'linear' }}
            className="absolute inset-0"
          >
            {/* Whole-image shots: a blurred copy of the same file fills the gaps.
                Same URL as the photo, so it costs no extra download. */}
            {fit === 'contain' && (
              <div aria-hidden className="absolute -inset-[6%] [transform:translateZ(0)]">
                <Image
                  src={activeSrc}
                  alt=""
                  fill
                  sizes="100vw"
                  quality={IMG_QUALITY}
                  className="object-cover"
                  style={{
                    filter: `blur(${isMobile ? 22 : 36}px) brightness(${isLight ? 1 : 0.7}) saturate(1.1)`,
                  }}
                />
              </div>
            )}

            {/* The photo, moving with pointer, tilt and drag (clamped, never shows edges) */}
            <motion.div
              style={{
                x: shiftX,
                y: shiftY,
                rotateX: tiltX,
                rotateY: tiltY,
                transformPerspective: 1400,
                ...(fit === 'cover' ? { inset: `${-overscan * 100}%` } : {}),
              }}
              animate={reduceMotion || isMobile ? undefined : { rotate: [-0.15, 0.15, -0.15] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              className={
                fit === 'contain' ? 'absolute inset-0 flex items-center justify-center' : 'absolute'
              }
            >
              {fit === 'contain' ? (
                <div className="relative shrink-0" style={boxStyle}>
                  {photo}
                </div>
              ) : (
                photo
              )}
              {!reduceMotion && glints.map((d) => <Glint key={d} delay={d} />)}
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Grab layer: drag sideways and it springs back. A swipe changes shot. */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -170, right: 170 }}
        dragElastic={0.25}
        dragMomentum={false}
        dragSnapToOrigin
        style={{ x: dragX, touchAction: 'pan-y' }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(_, info) => {
          setIsDragging(false);
          if (Math.abs(info.offset.x) > 60 || Math.abs(info.velocity.x) > 250) {
            go(info.offset.x < 0 ? 1 : -1);
          }
        }}
        className="absolute inset-y-0 -inset-x-[20%] z-[12] cursor-grab touch-pan-y active:cursor-grabbing"
      />

      {/* ------------------------------------------------------------------ */}
      {/*  Light: glow, rays and flare blend in on dark shots                */}
      {/* ------------------------------------------------------------------ */}
      <motion.div
        aria-hidden
        animate={{ opacity: isLight ? 0 : 1 }}
        transition={{ duration: 0.8 }}
        className="pointer-events-none absolute inset-0 z-[15] mix-blend-screen"
      >
        <AnimatePresence mode="sync">
          <motion.div
            key={`glow-${chapter.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              animate={reduceMotion ? undefined : { scale: [1, 1.12, 1], opacity: [0.75, 1, 0.75] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="h-[120vmin] w-[120vmin] shrink-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${accent}44 0%, ${accent}16 35%, transparent 68%)`,
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Rotating rays: desktop only (a 130vmax masked layer is too heavy for phones) */}
        {!reduceMotion && !isMobile && (
          <AnimatePresence mode="sync">
            <motion.div
              key={`rays-${chapter.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
                className="h-[130vmax] w-[130vmax] shrink-0 opacity-[0.12]"
                style={{
                  willChange: 'transform',
                  background: `repeating-conic-gradient(from 0deg, transparent 0deg 9deg, ${accent}66 11deg, transparent 15deg 26deg)`,
                  WebkitMaskImage: 'radial-gradient(circle, #000 0%, transparent 55%)',
                  maskImage: 'radial-gradient(circle, #000 0%, transparent 55%)',
                }}
              />
            </motion.div>
          </AnimatePresence>
        )}

        {!reduceMotion && (
          <motion.div
            key={`flare-${scene.id}`}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: [0, 1, 1], opacity: [0, 0.7, 0] }}
            transition={{ duration: 1.9, ease: 'easeOut', times: [0, 0.35, 1] }}
            className="absolute inset-x-0 top-1/2 h-[2px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${accent}, #ffffff, ${accent}, transparent)`,
              boxShadow: `0 0 40px 8px ${accent}66`,
            }}
          />
        )}
      </motion.div>

      {/* Drifting crumbs and dust. On Diwali they turn into golden embers. */}
      {!reduceMotion && (
        <motion.div
          aria-hidden
          style={{ x: dustX }}
          className="pointer-events-none absolute inset-0 z-[16]"
        >
          {(isMobile ? DUST.slice(0, 8) : DUST).map((p, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full transition-colors duration-1000"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                backgroundColor: DIWALI
                  ? p.tinted
                    ? '#FF9F1C'
                    : '#FFD98A'
                  : isLight || p.tinted
                    ? accent
                    : '#ffffff',
                boxShadow: DIWALI ? '0 0 6px 1px rgba(255,176,32,0.55)' : undefined,
                willChange: 'transform, opacity',
              }}
              animate={{
                y: [0, `${-p.drift / 2}vh`, `${-p.drift}vh`],
                x: [0, p.sway, 0],
                opacity: [0, isLight ? 0.5 : 0.6, 0],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: 'linear',
                times: [0, 0.5, 1],
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Diwali: marigold petals drifting down */}
      {DIWALI && !reduceMotion && (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[17] overflow-hidden">
          {(isMobile ? PETALS.slice(0, 5) : PETALS).map((p, i) => (
            <span
              key={i}
              className="diwali-petal absolute top-0 block"
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

      {/* ------------------------------------------------------------------ */}
      {/*  Foreground: bokeh, light streak on each product change, grade     */}
      {/* ------------------------------------------------------------------ */}
      {!reduceMotion && (
        <motion.div
          aria-hidden
          style={{ x: bokehX }}
          className={`pointer-events-none absolute inset-0 z-20 transition-opacity duration-700 ${
            isLight ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {(isMobile ? BOKEH.slice(0, 2) : BOKEH).map((b, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full"
              style={{
                left: b.left,
                top: b.top,
                width: b.size,
                height: b.size,
                opacity: 0.14,
                background: DIWALI
                  ? 'radial-gradient(circle, rgba(255,196,90,0.7) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 70%)',
              }}
              animate={{ x: [0, b.dx, 0], y: [0, b.dy, 0] }}
              transition={{ duration: b.duration, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </motion.div>
      )}

      {cuts > 0 && !reduceMotion && (
        <motion.div
          key={`streak-${cuts}`}
          aria-hidden
          initial={{ x: direction > 0 ? '-60%' : '260%' }}
          animate={{ x: direction > 0 ? '260%' : '-60%' }}
          transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
          className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[45%] -skew-x-12"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}33, ${accent}66, ${accent}33, transparent)`,
          }}
        />
      )}

      {/* Warm tint that keeps cream photo backgrounds from looking sterile */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 mix-blend-multiply transition-[opacity,background-color] duration-700"
        style={{ backgroundColor: accent, opacity: isLight ? 0.12 : 0 }}
      />

      {/* Diwali: diya-light glow rising from the bottom, a golden wash from the lights above */}
      {DIWALI && (
        <div
          aria-hidden
          className="diwali-warmth pointer-events-none absolute inset-0 z-[19] mix-blend-soft-light"
          style={{
            background:
              'radial-gradient(ellipse 70% 45% at 50% 105%, rgba(255,170,50,0.8), transparent 70%), radial-gradient(ellipse 60% 30% at 50% -5%, rgba(255,200,90,0.55), transparent 70%)',
          }}
        />
      )}

      {/* Film grain: desktop only (a moving blended layer costs a lot on phones) */}
      {!isMobile && (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          <div
            className="hero-grain absolute -inset-[10%] opacity-[0.08] mix-blend-overlay"
            style={{ backgroundImage: GRAIN }}
          />
        </div>
      )}

      {/* Vignettes and edge gradients, cross-faded by shot tone */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.55)_100%)] transition-opacity duration-700 ${
          isLight ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(60,40,20,0.22)_100%)] transition-opacity duration-700 ${
          isLight ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 z-20 h-40 bg-gradient-to-b from-black/45 to-transparent transition-opacity duration-700 ${
          isLight ? 'opacity-0' : 'opacity-100'
        }`}
      />
      {/* Bottom fades back the scrubber and the floating "Order now" button */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40 bg-gradient-to-t from-black/55 to-transparent transition-opacity duration-700 ${
          isLight ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40 bg-gradient-to-t from-white/45 to-transparent transition-opacity duration-700 ${
          isLight ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* ------------------------------------------------------------------ */}
      {/*  Diwali: fireworks, string lights, diyas                           */}
      {/* ------------------------------------------------------------------ */}
      {DIWALI &&
        !reduceMotion &&
        (isMobile ? BURSTS.slice(0, 2) : BURSTS).map((b, i) => <Burst key={i} {...b} />)}
      {DIWALI && <StringLights />}
      {DIWALI && (
        <>
          <Diya className="bottom-2 left-2 sm:bottom-4 sm:left-10" small={isMobile} />
          <Diya small className="bottom-2 left-[3.25rem] sm:bottom-4 sm:left-[6.75rem]" />
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*  Opening: fade up from black, letterbox bars open                  */}
      {/* ------------------------------------------------------------------ */}
      {!reduceMotion && (
        <>
          <motion.div
            aria-hidden
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            className="pointer-events-none absolute inset-0 z-40 bg-black"
          />
          <motion.div
            aria-hidden
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{ duration: 1.5, delay: 0.3, ease: EASE }}
            style={{ originY: 0 }}
            className="pointer-events-none absolute inset-x-0 top-0 z-40 h-[16vh] bg-black"
          />
          <motion.div
            aria-hidden
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{ duration: 1.5, delay: 0.3, ease: EASE }}
            style={{ originY: 1 }}
            className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-[16vh] bg-black"
          />
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*  Controls: [spacer] [scrubber, one segment per product] [play]     */}
      {/*  One row, centred, lifted above the floating "Order now" button.   */}
      {/* ------------------------------------------------------------------ */}
      <div className="hero-controls pointer-events-none absolute inset-x-0 z-30 flex items-center justify-between px-3 md:px-10">
        <span aria-hidden className="block h-9 w-9 shrink-0 sm:h-10 sm:w-10" />

        <div className="pointer-events-auto flex items-center justify-center gap-0.5 sm:gap-3">
          {groups.map((g, gi) => {
            const active = gi === activeGroup;
            return (
              <button
                key={g.chapter.id}
                type="button"
                onClick={() => moveTo(g.indices[0], g.indices[0] > index ? 1 : -1)}
                aria-label={`Show ${g.chapter.name}`}
                aria-current={active}
                className="group px-1 py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:py-3"
              >
                <span
                  className={`block h-[3px] overflow-hidden rounded-full transition-all duration-500 ${
                    isLight ? 'bg-black/20' : 'bg-white/30'
                  } ${active ? 'w-9 sm:w-20 md:w-24' : 'w-3.5 sm:w-6 md:w-8'}`}
                >
                  {active ? (
                    <ChapterFill
                      key={scene.id}
                      progress={progress}
                      local={localIndex}
                      count={g.indices.length}
                      color={g.chapter.accent}
                      still={!!reduceMotion}
                    />
                  ) : (
                    <span
                      className="block h-full w-full origin-left"
                      style={{
                        transform: `scaleX(${gi < activeGroup ? 1 : 0})`,
                        backgroundColor: g.chapter.accent,
                      }}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setIsPlaying((p) => !p)}
          aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          className={`pointer-events-auto grid h-9 w-9 shrink-0 place-items-center rounded-full border backdrop-blur-md transition-colors duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:h-10 sm:w-10 ${
            isLight
              ? 'border-black/15 bg-white/55 text-stone-800 hover:bg-white/80'
              : 'border-white/15 bg-black/35 text-stone-200 hover:bg-white/15 hover:text-white'
          }`}
        >
          {isPlaying ? (
            <Pause className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          ) : (
            <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          )}
        </button>
      </div>

      {/* Preload the next shot. Same url + quality as the visible image, so the
          browser really does have it ready, and its size tells us how to fit it. */}
      <div aria-hidden className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0">
        <Image
          key={`${nextScene.id}-${nextActiveSrc}`}
          src={nextActiveSrc}
          alt=""
          fill
          loading="eager"
          sizes="100vw"
          quality={IMG_QUALITY}
          onLoad={(e) => rememberRatio(nextActiveSrc, e.currentTarget)}
        />
      </div>
    </section>
  );
}
