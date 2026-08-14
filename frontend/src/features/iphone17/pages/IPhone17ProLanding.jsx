import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import Lenis from 'lenis';
import arrivalImg from '@imga/iphone/iphone17pro.jpg';
import khungImg from '@imga/iphone/khungiphone17pro.jpg';
import VisionCamera from '../components/VisionCamera';
import TechSpecs from '../components/TechSpecs';
import khungInsideImg from '@imga/iphone/khungiphone17pro_inside.png';

gsap.registerPlugin(ScrollTrigger);

/**
 * IPhone17ProLanding — 5-Scene Cinematic Scroll Story
 * ─────────────────────────────────────────────────────
 * Brand: Antygravyty (Sidney Valor, Creative Director)
 *
 * Scene 0: The Arrival (Hero)
 * Scene 1: The Architecture (Design)
 * Scene 2: The Vision (Cameras)
 * Scene 3: The Engine (Performance)
 * Scene 4: The Endurance (Battery)
 *
 * Scroll Experience: GSAP ScrollTrigger pin + scrub
 * Typography: React/CSS rendered (not baked in images)
 * Images: AI-generated 8K backgrounds only
 */

const FRAMES = [
  {
    id: 'arrival',
    label: 'The Arrival',
    bg: arrivalImg,
    accentColor: '#E87B2C',
  },
  {
    id: 'architecture',
    label: 'The Architecture',
    bg: null,
    accentColor: '#C4C4C8',
  },
  {
    id: 'vision',
    label: 'The Vision',
    bg: null,
    accentColor: '#E87B2C',
  },
  {
    id: 'engine',
    label: 'The Engine',
    bg: '/images/iphone17_pro/frame4_engine.png',
    accentColor: '#E87B2C',
  }
];

/* ─── Scene Overlay Components ─── */

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {Array.from({ length: 30 }).map((_, i) => {
        const size = Math.random() * 6 + 2; // 2px to 8px
        return (
          <div
            key={i}
            className="particle"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100 + 10}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
              opacity: Math.random() * 0.6 + 0.2
            }}
          />
        );
      })}
    </div>
  );
}

function ArrivalOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-end pb-[12%] z-20 pointer-events-none">
      {/* Cinematic Volumetric Lighting & Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-purple-900/30 to-amber-600/10 mix-blend-overlay" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent opacity-70 mix-blend-screen" />

      <FloatingParticles />

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-[11px] sm:text-xs font-mono tracking-[0.35em] text-[#C4C4C8] uppercase mb-3 z-30"
      >
        Antygravyty Presents
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight leading-none text-center mb-4 z-30 metallic-shine"
      >
        iPhone 17 Pro
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.7 }}
        className="text-base sm:text-lg font-light text-white/60 tracking-wide z-30"
      >
        <span className="lens-flare-text">Get the highlights.</span>
      </motion.p>
    </div>
  );
}

function ArchitectureOverlay() {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  return (
    <div className="absolute inset-0 z-20 bg-black overflow-hidden pointer-events-auto" style={{ perspective: "1200px" }}>
      {/* The zooming image */}
      <motion.img
        src={khungImg}
        alt="Chassis"
        className="absolute inset-0 w-full h-full object-contain cursor-grab active:cursor-grabbing"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d", transformOrigin: "center center" }}
        onPan={(e, info) => {
          const currentX = rotateX.get();
          const currentY = rotateY.get();
          rotateX.set(currentX - info.delta.y * 0.4);
          rotateY.set(currentY + info.delta.x * 0.4);
        }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0}
      />

      <div className="absolute top-16 left-0 right-0 text-center z-20 px-6 pointer-events-none">
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[0.95] drop-shadow-2xl mb-4">
          KHUNG NHÔM
          <br />
          NGUYÊN KHỐI.
        </h2>
        <p className="text-[#8a8a8f] text-base sm:text-lg max-w-xl mx-auto font-medium drop-shadow-md">
          Chế tác từ nhôm hàng không vũ trụ, mang lại độ bền vượt trội và trọng lượng siêu nhẹ.
        </p>
      </div>

    </div>
  );
}


function EngineOverlay() {
  const stats = [
    { value: '40%', label: 'faster' },
    { value: '2x', label: 'GPU' },
  ];
  return (
    <div className="absolute inset-0 flex items-center z-20 pointer-events-none px-8 sm:px-16 lg:px-24">
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
        {/* Left: chip name */}
        <div>
          <motion.p
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-[10px] sm:text-xs font-mono tracking-[0.3em] text-[#E87B2C] uppercase mb-3"
          >
            Performance
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none"
          >
            A19 Pro
          </motion.h2>
        </div>
        {/* Right: floating data stats */}
        <div className="flex gap-5 sm:gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.2, duration: 0.6 }}
              className="text-center"
            >
              <span className="block text-4xl sm:text-6xl font-black bg-gradient-to-b from-[#E87B2C] to-[#F49D56] bg-clip-text text-transparent tracking-tight">
                {s.value}
              </span>
              <span className="block text-xs font-mono text-white/40 tracking-[0.2em] uppercase mt-1">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const OVERLAYS = [ArrivalOverlay, ArchitectureOverlay, VisionCamera, EngineOverlay];

/* ─── Frame Navigation Dots ─── */
function FrameDots({ activeIndex, total }) {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 items-center">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`rounded-full transition-all duration-500 ${i === activeIndex
              ? 'w-2.5 h-2.5 bg-[#E87B2C] shadow-[0_0_12px_#E87B2C]'
              : 'w-1.5 h-1.5 bg-white/25'
              }`}
          />
          {i === activeIndex && (
            <span className="text-[9px] font-mono text-white/50 tracking-widest uppercase whitespace-nowrap">
              {FRAMES[i].label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Main Landing Page Component ─── */
export default function IPhone17ProLanding() {
  const containerRef = useRef(null);
  const [activeFrame, setActiveFrame] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // 1. Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical', // vertical, horizontal
      gestureDirection: 'vertical', // vertical, horizontal, both
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    const section = containerRef.current;
    if (!section) return;

    // 2. Setup ScrollTrigger
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: `+=1200%`, // Adjusted for 4 frames
      pin: true,
      scrub: 1.5, // slightly more scrub smoothing
      anticipatePin: 1,
      onUpdate: (self) => {
        setScrollProgress(self.progress);
        const p = self.progress;
        let idx = 0;
        if (p < 0.20) idx = 0;
        else if (p < 0.55) idx = 1;
        else if (p < 0.80) idx = 2;
        else idx = 3;
        setActiveFrame(idx);
      },
    });

    const timer = setTimeout(() => ScrollTrigger.refresh(), 150);

    return () => {
      clearTimeout(timer);
      st.kill();
      lenis.destroy();
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000);
      });
    };
  }, []);

  const currentFrame = FRAMES[activeFrame];
  const OverlayComponent = OVERLAYS[activeFrame];

  return (
    <>
      {/* Scroll container */}
      <section
        ref={containerRef}
        className="relative w-full h-screen bg-[#0B0B0B] overflow-hidden select-none"
      >
        {/* Background image crossfade */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFrame.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0 z-0"
          >
            {currentFrame.bg && (
              <img
                src={currentFrame.bg}
                alt={currentFrame.label}
                className="w-full h-full object-cover object-center"
              />
            )}
            {/* Dark vignette overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-[#0B0B0B]/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B]/60 via-transparent to-[#0B0B0B]/30" />
          </motion.div>
        </AnimatePresence>

        {/* Scene-specific overlay (typography, UI, data) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`overlay-${currentFrame.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-10"
          >
            <OverlayComponent scrollProgress={scrollProgress} />
          </motion.div>
        </AnimatePresence>

        {/* Top bar: brand + back link */}
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 sm:px-12 py-5">
          <Link
            to="/"
            className="text-[10px] font-mono tracking-[0.3em] text-white/40 uppercase hover:text-white/70 transition-colors pointer-events-auto"
          >
            ← Antygravyty
          </Link>
          <span className="text-[10px] font-mono tracking-[0.3em] text-white/70 uppercase metallic-shine">
            iPhone 17 Pro
          </span>
        </div>

        {/* Bottom progress bar */}
        <div className="absolute bottom-0 left-0 right-0 z-30 h-[2px] bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-[#E87B2C] to-[#F49D56]"
            style={{ width: `${((activeFrame + 1) / FRAMES.length) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        {/* Frame navigation dots */}
        {/* <FrameDots activeIndex={activeFrame} total={FRAMES.length} /> */}
      </section>

      <TechSpecs />

      {/* CTA section after scroll story */}
      <section className="w-full bg-[#0B0B0B] py-24 sm:py-32 px-8 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[11px] font-mono tracking-[0.35em] text-[#E87B2C] uppercase mb-4"
        >
          Sẵn sàng trải nghiệm
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6 metallic-shine inline-block"
        >
          iPhone 17 Pro
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-sm text-white/40 mb-10 max-w-md mx-auto"
        >
          Bộ sưu tập đỉnh cao từ Antygravyty — Industrial luxury meets sci-fi minimalism.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35 }}
          className="flex items-center justify-center gap-5"
        >
          <Link
            to="/pre-order"
            className="px-8 py-3 rounded-full bg-[#E87B2C] text-white text-sm font-bold tracking-wide hover:bg-[#F49D56] transition-colors"
          >
            Đặt Hàng Ngay
          </Link>
          <Link
            to="/"
            className="px-8 py-3 rounded-full border border-white/20 text-white/70 text-sm font-medium tracking-wide hover:border-white/40 hover:text-white transition-all"
          >
            Quay Về Trang Chủ
          </Link>
        </motion.div>
      </section>
    </>
  );
}
