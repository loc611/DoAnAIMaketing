import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import Lenis from 'lenis';

import IPhone15TechSpecs from '../components/IPhone15TechSpecs';
import heroImg from '@imga/iphone/iphone15promax.jpg';
import cameraImg from '@imga/iphone/cameraiphone15promax.jpeg';
import chipImg from '@imga/iphone/chipa15pro.webp';
import pinImg from '@imga/iphone/pin15promax.jpg';

gsap.registerPlugin(ScrollTrigger);

/**
 * IPhone15ProLanding — 4-Scene Cinematic Scroll Story
 * ─────────────────────────────────────────────────────
 * Scene 0: Titanium Design (Arrival)
 * Scene 1: Camera & Action Button
 * Scene 2: A17 Pro (Performance)
 * Scene 3: Endurance (Battery & Display)
 */

// Placeholder images since user will add them later
const FRAMES = [
  {
    id: 'arrival',
    label: 'Titanium',
    bg: heroImg, // Added user's image
    accentColor: '#C6B9A6', // Natural Titanium
  },
  {
    id: 'camera',
    label: 'Camera & Action',
    bg: cameraImg,
    accentColor: '#A09F9C',
  },
  {
    id: 'performance',
    label: 'A17 Pro',
    bg: chipImg,
    accentColor: '#C6B9A6',
  },
  {
    id: 'endurance',
    label: 'Endurance',
    bg: pinImg,
    accentColor: '#A09F9C',
  }
];

/* ─── Scene Overlay Components ─── */

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {Array.from({ length: 30 }).map((_, i) => {
        const size = Math.random() * 6 + 2;
        return (
          <div
            key={i}
            className="particle bg-[#C6B9A6] rounded-full absolute"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100 + 10}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
              opacity: Math.random() * 0.3 + 0.1,
              filter: 'blur(1px)'
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
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/70 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C6B9A6]/5 via-transparent to-transparent opacity-50 mix-blend-screen" />

      <FloatingParticles />

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-[11px] sm:text-xs font-mono tracking-[0.35em] text-[#C6B9A6] uppercase mb-3 z-30"
      >
        Apple Presents
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight leading-none text-center mb-4 z-30 drop-shadow-[0_0_15px_rgba(198,185,166,0.2)]"
      >
        iPhone 15 Pro Max
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.7 }}
        className="text-base sm:text-lg font-light text-white/70 tracking-wide z-30"
      >
        <span>Titanium. �?ậm chất Pro.</span>
      </motion.p>
    </div>
  );
}

function CameraControlOverlay({ scrollProgress = 0 }) {
  // Local progress [0.2, 0.5]
  const localProgress = Math.max(0, Math.min(1, (scrollProgress - 0.20) / 0.30));

  return (
    <div className="absolute inset-0 z-20 pointer-events-none bg-[#0A0A0A] overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C6B9A6]/5 via-transparent to-transparent" />

      {/* Optional: if there's an image, scale and blur it here */}
      <motion.img 
        src={cameraImg}
        alt="Camera"
        className="absolute inset-0 w-full h-full object-cover opacity-50"
        style={{
          transform: `scale(${1 + localProgress * 0.1})`
        }}
      />

      <div className="relative z-30 flex flex-col items-center justify-center h-full px-6">
        <motion.div
          style={{ opacity: Math.sin(localProgress * Math.PI) }}
          className="text-center"
        >
          <p className="text-[#C6B9A6] font-mono text-xs tracking-[0.2em] uppercase mb-4">Camera & Nút Tác Vụ</p>
          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-6 drop-shadow-lg">
            Telephoto 5x. <br /> Ghi điểm từ xa.
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Sở hữu ống kính thu phóng quang h�?c xa nhất từng có trên iPhone. Kết hợp với Nút Tác Vụ mới, giúp truy cập nhanh tính năng yêu thích của bạn chỉ bằng một cú nhấn giữ.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function EngineOverlay({ scrollProgress = 0 }) {
  const localProgress = Math.max(0, Math.min(1, (scrollProgress - 0.50) / 0.30));

  const stats = [
    { value: '6-lõi', label: 'Pro-class GPU' },
    { value: '10%', label: 'Nhanh hơn CPU' },
  ];
  return (
    <div className="absolute inset-0 flex items-center z-20 pointer-events-none px-8 sm:px-16 lg:px-24 bg-[#0A0A0A]">
      <motion.img 
        src={chipImg}
        alt="A17 Pro"
        className="absolute inset-0 w-full h-full object-cover opacity-50"
        style={{
          transform: `scale(${1.2 - localProgress * 0.1})`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]/40" />
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 relative z-30">
        <div>
          <motion.p
            style={{ opacity: Math.sin(localProgress * Math.PI) }}
            className="text-[10px] sm:text-xs font-mono tracking-[0.3em] text-[#C6B9A6] uppercase mb-3"
          >
            Hiệu năng
          </motion.p>
          <motion.h2
            style={{ opacity: Math.sin(localProgress * Math.PI), x: -25 + (localProgress * 25) }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none drop-shadow-2xl"
          >
            A17 Pro
          </motion.h2>
          <motion.p
            style={{ opacity: Math.sin(localProgress * Math.PI) }}
            className="text-white/50 mt-4 max-w-sm"
          >
            �?ột phá lớn dành cho Apple silicon. GPU hoàn toàn mới tạo nên hiệu suất đồ h�?a tốt nhất lịch sử Apple. �?ắm chìm trong game với Công Nghệ dò tia phần cứng.
          </motion.p>
        </div>
        <div className="flex gap-5 sm:gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              style={{ opacity: Math.sin(localProgress * Math.PI) }}
              className="text-center"
            >
              <span className="block text-4xl sm:text-6xl font-black bg-gradient-to-b from-white to-[#C6B9A6]/50 bg-clip-text text-transparent tracking-tight">
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

function EnduranceOverlay({ scrollProgress = 0 }) {
  const localProgress = Math.max(0, Math.min(1, (scrollProgress - 0.80) / 0.20));

  return (
    <div className="absolute inset-0 z-20 pointer-events-none bg-[#0A0A0A] overflow-hidden flex items-center justify-center">
      <motion.img 
        src={pinImg}
        alt="Battery"
        className="absolute inset-0 w-full h-full object-cover opacity-50"
        style={{
          transform: `scale(${1 + localProgress * 0.1})`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
      <div className="relative z-30 flex flex-col items-center justify-center h-full px-6">
        <motion.div
          style={{ opacity: Math.sin(localProgress * Math.PI) }}
          className="text-center"
        >
          <p className="text-[#C6B9A6] font-mono text-xs tracking-[0.2em] uppercase mb-4">Pin & Kết Nối</p>
          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-6">
            USB-C Mới. <br /> Th�?i lượng pin cả ngày.
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Hỗ trợ USB 3 mang lại bước nhảy v�?t khổng lồ về tốc độ truy�?n dữ liệu. Và cung cấp năng lượng tr�?n ngày dài để bạn thoả sức sáng tạo.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

const OVERLAYS = [ArrivalOverlay, CameraControlOverlay, EngineOverlay, EnduranceOverlay];

/* ─── Main Landing Page Component ─── */
export default function IPhone15ProLanding() {
  const containerRef = useRef(null);
  const [activeFrame, setActiveFrame] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
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

    // Setup ScrollTrigger for 4 frames
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: `+=1000%`,
      pin: true,
      scrub: 1.5,
      anticipatePin: 1,
      onUpdate: (self) => {
        setScrollProgress(self.progress);
        const p = self.progress;
        let idx = 0;
        if (p < 0.20) idx = 0;
        else if (p < 0.50) idx = 1;
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
      <section
        ref={containerRef}
        className="relative w-full h-screen bg-[#0A0A0A] overflow-hidden select-none"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFrame.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0 z-0"
          >
            {currentFrame.bg && activeFrame === 0 && ( // Only show static bg for frame 0, others handled in overlay
              <motion.img
                src={currentFrame.bg}
                alt={currentFrame.label}
                className="w-full h-full object-cover object-center lg:object-top scale-100"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            )}
            {!currentFrame.bg && (
               // Fallback background if no image is provided
               <div className="w-full h-full bg-[#111111]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/80 via-transparent to-[#0A0A0A]/30" />
          </motion.div>
        </AnimatePresence>

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

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 sm:px-12 py-5">
          <Link
            to="/"
            className="text-[10px] font-mono tracking-[0.3em] text-white/40 uppercase hover:text-white/70 transition-colors pointer-events-auto"
          >
            �? Apple
          </Link>
          <span className="text-[10px] font-mono tracking-[0.3em] text-white/70 uppercase">
            iPhone 15 Pro Max
          </span>
        </div>

        {/* Bottom progress bar */}
        <div className="absolute bottom-0 left-0 right-0 z-30 h-[2px] bg-white/10">
          <motion.div
            className="h-full bg-[#C6B9A6]"
            style={{ width: `${((activeFrame + 1) / FRAMES.length) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </section>

      <IPhone15TechSpecs />

      {/* CTA section */}
      <section className="w-full bg-[#0A0A0A] py-24 sm:py-32 px-8 text-center border-t border-white/5">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[11px] font-mono tracking-[0.35em] text-[#C6B9A6] uppercase mb-4"
        >
          Sẵn sàng trải nghiệm
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6 inline-block drop-shadow-md"
        >
          iPhone 15 Pro Max
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-sm text-white/50 mb-10 max-w-md mx-auto"
        >
          Trải nghiệm sức mạnh của Titan, A17 Pro, và camera Telephoto 5x đỉnh cao.
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
            className="px-8 py-3 rounded-full bg-white text-black text-sm font-bold tracking-wide hover:bg-[#e5e5ea] transition-colors"
          >
            Mua Ngay
          </Link>
          <Link
            to="/"
            className="px-8 py-3 rounded-full border border-white/20 text-white/70 text-sm font-medium tracking-wide hover:border-white/40 hover:text-white transition-all"
          >
            Quay V�?
          </Link>
        </motion.div>
      </section>
    </>
  );
}
