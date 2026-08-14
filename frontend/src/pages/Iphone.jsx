/**
 * Iphone.jsx — Redesigned with Store's cinematic approach
 * Hero: full-bleed, bottom-left anchor, AnimatedText
 * Below: Marquee strip + Bento spec cards (giữ lại từ version cũ)
 */
import React, { useRef, useLayoutEffect, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AnimatedText from '../components/ui/AnimatedText';
import { ArrowRight, ArrowUpRight } from '@phosphor-icons/react';
import iphoneOip5 from '@imga/iphone/OIP (5).webp';

gsap.registerPlugin(ScrollTrigger);

/* ─── Marquee strip ──────────────────────────────────────── */
const MARQUEE_ITEMS = [
  'A19 Pro Chip', 'Camera 48MP Quad-Pixel', 'Titanium Desert Gold',
  'Màn Hình ProMotion 120Hz', 'Pin 33 Gi�?', 'USB-C 10Gb/s', 'iOS 19',
];

function MarqueeStrip() {
  const repeated = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="relative overflow-hidden border-y border-white/8 py-3 bg-[#08080a]">
      <div className="pointer-events-none absolute left-0 top-0 h-full w-24 z-10"
        style={{ background: 'linear-gradient(to right, #08080a, transparent)' }} />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-24 z-10"
        style={{ background: 'linear-gradient(to left, #08080a, transparent)' }} />
      <motion.div
        className="flex gap-10 whitespace-nowrap"
        animate={{ x: [0, -1 * MARQUEE_ITEMS.length * 180] }}
        transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
      >
        {repeated.map((item, i) => (
          <span key={i} className="text-[11px] uppercase tracking-[0.22em] text-white/25 font-mono shrink-0">
            {item}<span className="mx-4 text-white/10">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function Iphone() {
  const containerRef = useRef();
  const heroImgRef = useRef();

  /* ── GSAP: Rich Scroll Effects for Text & Images ───────── */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Hero image zoom & parallax shift on scroll
      gsap.to(heroImgRef.current, {
        y: '22%',
        scale: 1.18,
        scrollTrigger: {
          trigger: '.iphone-section-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      });

      // 2. Bento cards stagger in with blur-to-sharp reveal
      gsap.fromTo('.bento-item',
        { opacity: 0, y: 70, filter: 'blur(8px)' },
        {
          opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.15, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: '.section-specs', start: 'top 78%' },
        }
      );

      // 3. Bento inner background images scrub zoom
      const bentoImgs = gsap.utils.toArray('.bento-bg');
      bentoImgs.forEach((img) => {
        const parent = img?.closest('.bento-item');
        if (parent) {
          gsap.fromTo(img,
            { scale: 1.25 },
            {
              scale: 1.0,
              scrollTrigger: {
                trigger: parent,
                start: 'top 90%',
                end: 'bottom top',
                scrub: 1,
              },
            }
          );
        }
      });

      // 4. Intro text blur-in reveal on scroll
      gsap.fromTo('.intro-reveal',
        { opacity: 0, y: 50, filter: 'blur(10px)' },
        {
          opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: '.section-intro', start: 'top 70%' },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  /* ── Scroll reveal for CSS classes ─────────────────────── */
  useEffect(() => {
    const els = document.querySelectorAll('.fade-up, .fade-in, .scale-in');
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* ── 3D tilt for bento cards ────────────────────────────── */
  const handleCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    gsap.to(card, {
      rotateX: ((y - cy) / cy) * -7,
      rotateY: ((x - cx) / cx) * 7,
      scale: 1.02,
      transformPerspective: 1000,
      duration: 0.2,
      ease: 'power1.out',
    });

    // Scrubbable color layers
    if (card.classList.contains('scrubbable-card')) {
      const progress = Math.max(0, Math.min(1, x / rect.width));
      const p = card.querySelector('.bento-bg-primary');
      const s = card.querySelector('.bento-bg-secondary');
      const t = card.querySelector('.bento-bg-tertiary');
      const op1 = Math.max(0, 1 - (progress / 0.4));
      const op2 = progress > 0.2 && progress < 0.8 ? Math.sin((progress - 0.2) * (Math.PI / 0.6)) : 0;
      const op3 = Math.max(0, (progress - 0.6) / 0.4);
      if (p) gsap.to(p, { opacity: op1, duration: 0.2 });
      if (s) gsap.to(s, { opacity: op2, duration: 0.2 });
      if (t) gsap.to(t, { opacity: op3, duration: 0.2 });
    }
  };

  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget;
    gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.5, ease: 'power3.out' });
    if (card.classList.contains('scrubbable-card')) {
      const p = card.querySelector('.bento-bg-primary');
      const s = card.querySelector('.bento-bg-secondary');
      const t = card.querySelector('.bento-bg-tertiary');
      if (p) gsap.to(p, { opacity: 1, duration: 0.5 });
      if (s) gsap.to(s, { opacity: 0, duration: 0.5 });
      if (t) gsap.to(t, { opacity: 0, duration: 0.5 });
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#08080a] text-white overflow-x-hidden">

      {/* �?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
          SECTION 1 — CINEMATIC HERO (image-as-canvas, bottom-left anchor)
         �?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�? */}
      <section className="iphone-section-hero relative min-h-[100dvh] flex items-end pb-20 overflow-hidden">

        {/* Full-bleed iPhone hero image — Crisp Studio Lighting */}
        <div className="absolute inset-0 z-0">
          <img
            ref={heroImgRef}
            src={iphoneOip5}
            alt="iPhone 17 Pro Max"
            className="w-full h-full object-cover object-center scale-105 transition-all duration-700"
            style={{ 
              filter: 'brightness(0.85) contrast(1.18) saturate(1.1)',
              imageRendering: 'crisp-edges'
            }}
            onError={(e) => e.target.style.display = 'none'}
          />
          {/* Directional scrim: Giữ tối góc dưới trái cho chữ, phía phải giữ nguyên độ sắc nét */}
          <div className="absolute inset-0"
            style={{
              background: 'linear-gradient(110deg, rgba(8,8,10,0.92) 0%, rgba(8,8,10,0.55) 38%, rgba(8,8,10,0.1) 70%, rgba(8,8,10,0.35) 100%)'
            }}
          />
          {/* Bottom fade into next section */}
          <div className="absolute bottom-0 left-0 right-0 h-52"
            style={{ background: 'linear-gradient(to top, #08080a, transparent)' }}
          />
        </div>

        {/* Hero copy — bottom-left */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 44 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#e87b46]/70 font-mono mb-5">
              Thế hệ mới · iPhone 17 Pro Max
            </p>

            <AnimatedText
              text="Titan. Tốc �?ộ."
              type="word"
              tag="h1"
              className="text-5xl sm:text-7xl lg:text-[6rem] font-extrabold tracking-tighter text-white leading-none mb-2"
              delay={200}
              stagger={100}
            />
            <AnimatedText
              text="Huy�?n Thoại."
              type="word"
              tag="div"
              className="text-5xl sm:text-7xl lg:text-[6rem] font-extrabold tracking-tighter text-white/25 leading-none mb-10"
              delay={480}
              stagger={100}
            />

            <div className="flex flex-wrap items-center gap-4">
              <a
                id="iphone-cta-buy"
                href="/store"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-black font-semibold text-sm tracking-tight transition-all hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98]"
              >
                Mua Ngay <ArrowRight size={15} weight="bold" />
              </a>
              <a
                id="iphone-cta-explore"
                href="#specs"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/20 text-white/75 font-medium text-sm backdrop-blur-sm bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all"
              >
                Khám phá <ArrowUpRight size={15} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* �?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
          SECTION 2 — MARQUEE STRIP
         �?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�? */}
      <MarqueeStrip />

      {/* �?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
          SECTION 3 — INTRO STATEMENT
         �?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�? */}
      <section className="section-intro py-28 px-6 max-w-[1000px] mx-auto text-center">
        <div className="intro-reveal">
          <AnimatedText
            text="Thiết kế bứt phá. �?ẹp không tì vết."
            type="word"
            tag="h2"
            className="text-4xl md:text-6xl font-extrabold tracking-tighter text-white leading-tight mb-8"
            stagger={60}
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-xl text-white/50 leading-relaxed max-w-[720px] mx-auto"
          >
            Trải nghiệm vi�?n màn hình m�?ng nhất từng có trên thiết bị Apple. Khung Titanium chuẩn hàng không vũ trụ, đánh bóng mang lại vẻ ngoài lộng lẫy và độ b�?n vô song.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-10"
          >
            <a
              href="/store"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-semibold text-sm tracking-tight hover:bg-white/90 hover:scale-[1.02] transition-all"
            >
              �?ặt mua ngay <ArrowRight size={15} weight="bold" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* �?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
          SECTION 4 — BENTO SPECS GRID (giữ lại, có 3D tilt)
         �?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�? */}
      <section id="specs" className="section-specs py-20 px-4 sm:px-6 max-w-[1400px] mx-auto relative">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] blur-3xl opacity-30"
          style={{ background: 'radial-gradient(ellipse, rgba(232,123,70,0.25) 0%, transparent 70%)' }}
        />

        <div className="text-center mb-20 relative z-10">
          <AnimatedText
            text="Sức Mạnh Vượt Trội."
            type="word"
            tag="h2"
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-white leading-tight"
            stagger={55}
          />
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-white/35 text-lg mt-4 font-mono uppercase tracking-[0.15em] text-sm"
          >
            Kỷ Nguyên �?ồ H�?a Mới
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 relative z-10">

          {/* Card A19 Pro — scrubbable */}
          <div
            className="lg:col-span-8 doppelrand-shell bento-item scrubbable-card cursor-pointer group"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="doppelrand-core !p-0 overflow-hidden relative min-h-[420px] flex flex-col justify-end rounded-[calc(2.25rem-0.5rem)]">
              <img src="/images/chipa19pro.webp" alt="A19 Pro" className="bento-bg bento-bg-primary absolute inset-0 w-full h-full object-cover opacity-100" onError={(e) => e.target.style.display = 'none'} />
              <img src="/images/chip12pro.jpg" alt="A19 Pro layer 2" className="bento-bg bento-bg-secondary absolute inset-0 w-full h-full object-cover opacity-0" onError={(e) => e.target.style.display = 'none'} />
              <img src="/images/xhip.webp" alt="A19 Pro layer 3" className="bento-bg bento-bg-tertiary absolute inset-0 w-full h-full object-cover opacity-0" onError={(e) => e.target.style.display = 'none'} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10 pointer-events-none" />
              <div className="relative z-20 p-8 md:p-10">
                <h3 className="text-3xl font-extrabold text-white mb-2">Chip A19 Pro</h3>
                <p className="text-white/70 text-sm max-w-md mb-4">Chipset điện thoại nhanh nhất thế giới. �?ồ h�?a ray-tracing đẳng cấp console.</p>
                <Link to="/store" className="inline-flex items-center gap-1 text-sm font-semibold text-[#e87b46] hover:underline">
                  Tìm hiểu Apple Silicon <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>

          {/* Card Camera — scrubbable */}
          <div
            className="lg:col-span-4 doppelrand-shell bento-item scrubbable-card cursor-pointer group"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="doppelrand-core !p-0 overflow-hidden relative min-h-[420px] flex flex-col justify-end rounded-[calc(2.25rem-0.5rem)]">
              <img src="/images/camera.jpg" alt="Pro Camera" className="bento-bg bento-bg-primary absolute inset-0 w-full h-full object-cover opacity-100" onError={(e) => e.target.style.display = 'none'} />
              <img src="/images/cameraiphone.webp" alt="Camera closeup" className="bento-bg bento-bg-secondary absolute inset-0 w-full h-full object-cover opacity-0" onError={(e) => e.target.style.display = 'none'} />
              <img src="/images/camera3d.jpg" alt="Camera 3D" className="bento-bg bento-bg-tertiary absolute inset-0 w-full h-full object-cover opacity-0" onError={(e) => e.target.style.display = 'none'} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10 pointer-events-none" />
              <div className="relative z-20 p-8 md:p-10">
                <h3 className="text-3xl font-extrabold text-white mb-2">Camera Pro 48MP</h3>
                <p className="text-white/70 text-sm mb-4">Cảm biến Quad-Pixel thế hệ 2. Quay 4K 120fps Dolby Vision.</p>
              </div>
            </div>
          </div>

          {/* Card Titanium */}
          <div
            className="lg:col-span-6 doppelrand-shell bento-item cursor-pointer group"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="doppelrand-core !p-0 overflow-hidden relative min-h-[340px] flex flex-col justify-end rounded-[calc(2.25rem-0.5rem)]">
              <img src="/images/titanium.jpg" alt="Titanium" className="bento-bg absolute inset-0 w-full h-full object-cover opacity-100" onError={(e) => e.target.style.display = 'none'} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10 pointer-events-none" />
              <div className="relative z-20 p-8 md:p-10">
                <h3 className="text-3xl font-extrabold text-white mb-2">Chế Tác Titanium</h3>
                <p className="text-white/70 text-sm">B�?n bỉ vượt trội. Tr�?ng lượng siêu nhẹ.</p>
              </div>
            </div>
          </div>

          {/* Card Battery */}
          <div
            className="lg:col-span-6 doppelrand-shell bento-item cursor-pointer group"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="doppelrand-core !p-0 overflow-hidden relative min-h-[340px] flex flex-col justify-end rounded-[calc(2.25rem-0.5rem)]">
              <img src="/images/pin17.jpg" alt="Battery" className="bento-bg absolute inset-0 w-full h-full object-cover opacity-100" onError={(e) => e.target.style.display = 'none'} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10 pointer-events-none" />
              <div className="relative z-20 p-8 md:p-10">
                <h3 className="text-3xl font-extrabold text-white mb-2">Pin Kỷ Lục 33H</h3>
                <p className="text-white/70 text-sm">Phát video liên tục 33 gi�?. Sạc nhanh 50% trong 30 phút.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* �?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
          SECTION 5 — CTA CINEMATIC (full-bleed)
         �?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�? */}
      <section className="relative min-h-[60vh] flex items-center justify-center text-center overflow-hidden mt-16">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/iphone17.jpg"
            alt=""
            aria-hidden
            className="w-full h-full object-cover object-center"
            style={{ filter: 'brightness(0.25) saturate(0.6)' }}
            onError={(e) => e.target.style.display = 'none'}
          />
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at center, rgba(8,8,10,0.2) 0%, rgba(8,8,10,0.8) 100%)' }}
          />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <AnimatedText
            text="Sở Hữu iPhone 17 Pro Hôm Nay."
            type="word"
            tag="h2"
            className="text-4xl sm:text-5xl font-extrabold tracking-tighter text-white leading-tight mb-6"
            stagger={55}
          />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <a
              href="/store"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Mua Ngay <ArrowRight size={15} weight="bold" />
            </a>
            <Link
              to="/pre-order"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/25 text-white/75 font-medium text-sm hover:bg-white/8 hover:border-white/50 transition-all"
            >
              Tư Vấn VIP
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
