/**
 * Store.jsx â€” Redesigned with Iphone.jsx's GSAP scroll-section approach
 * Hero: scroll-pinned, giant background word, parallax product image, centered CTAs
 * Sections: marquee / product bento / features / CTA
 */
import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AnimatedText from '../components/ui/AnimatedText';
import StoreCard from '../components/ui/StoreCard';
import ProductModal from '../components/ui/ProductModal';

import PremiumProductGrid from '../components/ui/PremiumProductGrid';
import iphoneOip5 from '@imga/iphone/OIP (5).webp';
import {
  CreditCard, ArrowsLeftRight, Truck, ShieldCheck,
  ArrowRight, FacebookLogo, InstagramLogo,
} from '@phosphor-icons/react';

gsap.registerPlugin(ScrollTrigger);

/* â”€â”€â”€ Marquee â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const MARQUEE = [
  'iPhone 17 Pro Max', 'MacBook Pro M4', 'Apple Watch Ultra 3', 'iPad Pro M4',
  'Giao HÃ ng 2H', 'Tráº£ GÃ³p 0%', 'Thu CÅ© Äá»•i Má»›i', 'Báº£o HÃ nh 12 ThÃ¡ng',
];
function MarqueeStrip() {
  const rep = [...MARQUEE, ...MARQUEE, ...MARQUEE];
  return (
    <div className="relative overflow-hidden border-y border-white/8 py-3 bg-[#040406]">
      <div className="pointer-events-none absolute left-0 top-0 h-full w-24 z-10"
        style={{ background: 'linear-gradient(to right,#040406,transparent)' }} />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-24 z-10"
        style={{ background: 'linear-gradient(to left,#040406,transparent)' }} />
      <motion.div
        className="flex gap-10 whitespace-nowrap"
        animate={{ x: [0, -1 * MARQUEE.length * 160] }}
        transition={{ repeat: Infinity, duration: 28, ease: 'linear' }}
      >
        {rep.map((item, i) => (
          <span key={i} className="text-[11px] uppercase tracking-[0.22em] text-white/25 font-mono shrink-0">
            {item}<span className="mx-4 text-white/10">Â·</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* â”€â”€â”€ Products data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const PRODUCTS = [
  {
    id: 'iphone-17-pro-max', title: 'iPhone 17 Pro Max',
    subtitle: 'BLACK MYTH EDITION', price: 34999000, originalPrice: 39999000,
    description: 'Khung Titan Sa Máº¡c. Chip A19 Pro 3nm siÃªu phÃ¢n luá»“ng.',
    image: iphoneOip5,
    colors: ['Titan Sa Máº¡c Gold', 'Titan Äen', 'Titan Tráº¯ng'],
    storages: ['256GB', '512GB', '1TB'],
  },
  {
    id: 'iphone-15-pro-max', title: 'iPhone 15 Pro Max',
    subtitle: 'TITANIUM SELECTION', price: 29999000, originalPrice: 34999000,
    description: 'Khung Titanium tá»± nhiÃªn siÃªu nháº¹ bá»n bá»‰. Chip A17 Pro 3nm, NÃºt Action Button.',
    image: '/images/iphone16_pro.png',
    colors: ['Titan Tá»± NhiÃªn', 'Titan Xanh', 'Titan Tráº¯ng', 'Titan Äen'],
    storages: ['256GB', '512GB', '1TB'],
  },
  {
    id: 'iphone-14-pro-max', title: 'iPhone 14 Pro Max',
    subtitle: 'DYNAMIC ISLAND EDITION', price: 24999000, originalPrice: 28999000,
    description: 'MÃ n hÃ¬nh Dynamic Island Ä‘á»™t phÃ¡. Chip A16 Bionic 4nm, Camera 48MP.',
    image: '/images/iphone_hero_light.png',
    colors: ['TÃ­m Tá»‘i (Deep Purple)', 'VÃ ng', 'Báº¡c', 'Äen KhÃ´ng Gian'],
    storages: ['128GB', '256GB', '512GB', '1TB'],
  },
];

const FEATURES = [
  { icon: <Truck weight="duotone" />, label: 'Giao HÃ ng 2H', sub: 'Miá»…n phÃ­ ná»™i thÃ nh, báº£o hiá»ƒm 100%' },
  { icon: <ArrowsLeftRight weight="duotone" />, label: 'Thu CÅ© Äá»•i Má»›i', sub: 'Trá»£ giÃ¡ lÃªn Ä‘áº¿n 3.000.000Ä‘' },
  { icon: <CreditCard weight="duotone" />, label: 'Tráº£ GÃ³p 0%', sub: 'Táº¥t cáº£ ngÃ¢n hÃ ng hÃ ng Ä‘áº§u' },
  { icon: <ShieldCheck weight="duotone" />, label: 'Báº£o HÃ nh 12 ThÃ¡ng', sub: '1 Ä‘á»•i 1 trong 30 ngÃ y Ä‘áº§u' },
];

export default function Store() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef();
  const heroImgRef = useRef();

  const openModal = (p) => { setSelectedProduct(p); setIsModalOpen(true); };

  /* â”€â”€ GSAP: Rich Scroll Effects for Text & Images â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Hero image zoom & parallax on scroll
      gsap.to('.store-hero-image', {
        y: '25%',
        scale: 1.2,
        scrollTrigger: {
          trigger: '.store-section-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      });

      // 2. Giant "STORE" background word scroll shift
      gsap.to('.store-hero-bg-text', {
        x: -120,
        scale: 1.12,
        opacity: 0.15,
        scrollTrigger: {
          trigger: '.store-section-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });

      // 3. Hero text fades up and out on scroll
      gsap.to('.store-hero-text', {
        y: '-30%',
        opacity: 0,
        filter: 'blur(8px)',
        scrollTrigger: {
          trigger: '.store-section-hero',
          start: 'top top',
          end: 'center top',
          scrub: 1,
        },
      });

      // 4. Product cards & images scrub reveal
      const cardEls = gsap.utils.toArray('.store-product-card');
      if (cardEls.length > 0) {
        cardEls.forEach((card) => {
          const img = card.querySelector('img');
          if (img) {
            gsap.fromTo(img,
              { scale: 1.3, filter: 'brightness(0.3) blur(8px)' },
              {
                scale: 1.0,
                filter: 'brightness(0.7) blur(0px)',
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: card,
                  start: 'top 90%',
                  end: 'top 35%',
                  scrub: 1,
                },
              }
            );
          }
        });

        gsap.fromTo('.store-product-card',
          { opacity: 0, y: 70 },
          {
            opacity: 1, y: 0, stagger: 0.15, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: '.store-section-products', start: 'top 78%' },
          }
        );
      }

      // 6. Editorial Feature Image Parallax & Scale Scrub
      gsap.fromTo('.store-feature-img',
        { scale: 1.2, y: '-8%' },
        {
          scale: 1.0, y: '8%',
          scrollTrigger: {
            trigger: '.store-section-features',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        }
      );

      // 7. Feature rows stagger reveal
      gsap.fromTo('.store-feature-row',
        { opacity: 0, x: 40, filter: 'blur(6px)' },
        {
          opacity: 1, x: 0, filter: 'blur(0px)', stagger: 0.12, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.store-section-features', start: 'top 72%' },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  /* â”€â”€ Mouse parallax on hero image â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const handleHeroMouse = (e) => {
    if (!heroImgRef.current) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 24;
    const y = (e.clientY / window.innerHeight - 0.5) * 24;
    gsap.to(heroImgRef.current, { x, y, duration: 1, ease: 'power2.out' });
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#040406] text-white overflow-x-hidden">

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          SECTION 1 â€” SCROLL-PINNED HERO w/ Giant Background Word
         â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section
        className="store-section-hero relative flex flex-col items-center justify-center min-h-[100dvh] overflow-hidden text-center"
        onMouseMove={handleHeroMouse}
      >
        {/* Giant "STORE" background word */}
        <span
          aria-hidden
          className="store-hero-bg-text pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-extrabold select-none leading-none"
          style={{
            fontSize: 'clamp(120px, 25vw, 320px)',
            letterSpacing: '-0.04em',
            color: 'transparent',
            WebkitTextStroke: '1px rgba(255,255,255,0.07)',
            zIndex: 0,
          }}
        >
          STORE
        </span>

        {/* Studio Lighting Glow Behind Camera */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] pointer-events-none z-[1]"
          style={{ background: 'radial-gradient(ellipse at center, rgba(232,123,70,0.18) 0%, rgba(212,175,55,0.08) 45%, transparent 75%)' }}
        />

        {/* Product hero image â€” Original /images/iphone17.jpg */}
        <img
          ref={heroImgRef}
          src="/images/iphone17.jpg"
          alt="iPhone 17 Pro Max"
          className="store-hero-image absolute inset-0 w-full h-full object-cover object-center transition-all duration-700"
          style={{ 
            filter: 'brightness(0.85) contrast(1.18) saturate(1.1)', 
            zIndex: 1,
            imageRendering: 'crisp-edges'
          }}
          onError={(e) => e.target.style.display = 'none'}
        />

        {/* Text Scrim (Chá»‰ lÃ m má» phÃ­a dÆ°á»›i chá»¯, giá»¯ nguyÃªn vÃ¹ng camera sáº¯c nÃ©t) */}
        <div className="absolute inset-0 z-[2] pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(4,4,6,0.95) 0%, rgba(4,4,6,0.5) 35%, rgba(4,4,6,0.1) 65%, transparent 100%)' }}
        />

        {/* Hero content â€” centered */}
        <div className="store-hero-text relative z-10 px-4">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="inline-block px-4 py-1.5 rounded-full text-[11px] uppercase tracking-[0.25em] font-bold border border-white/15 bg-white/5 backdrop-blur-md text-[#e87b46] mb-7"
          >
            Tháº§n Thoáº¡i CÃ´ng Nghá»‡ Â· Pig Store
          </motion.span>

          <AnimatedText
            text="Tuyá»‡t TÃ¡c Huyá»n Thoáº¡i."
            type="word"
            tag="h1"
            className="text-5xl sm:text-7xl md:text-[5.5rem] font-extrabold tracking-tighter text-white leading-none mb-2"
            delay={200}
            stagger={70}
          />
          <AnimatedText
            text="Äá»‹nh HÃ¬nh Tháº¿ Giá»›i Má»›i."
            type="word"
            tag="div"
            className="text-5xl sm:text-7xl md:text-[5.5rem] font-extrabold tracking-tighter text-white/20 leading-none mb-10"
            delay={480}
            stagger={70}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <a
              id="store-cta-primary"
              href="#products"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Mua Sáº¯m Ngay <ArrowRight size={15} weight="bold" />
            </a>
            <Link
              id="store-cta-iphone"
              to="/iphone-17-pro"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-white/75 font-medium text-sm hover:bg-white/10 hover:border-white/40 transition-all"
            >
              iPhone 17 Pro
            </Link>
          </motion.div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-40 z-[3]"
          style={{ background: 'linear-gradient(to top, #040406, transparent)' }}
        />
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          SECTION 2 â€” MARQUEE TRUST STRIP
         â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <MarqueeStrip />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          SECTION 2.5 â€” PREMIUM PRODUCT GRID
         â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="products" className="w-full py-12 bg-[#040406]">
        <PremiumProductGrid />
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          SECTION 4 â€” FEATURES EDITORIAL SPLIT
         â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="store-section-features py-28 border-t border-white/6">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left: editorial photo */}
          <div className="relative overflow-hidden rounded-3xl lg:rounded-r-none min-h-[520px]">
            <img
              src="/images/macbook_hero.jpg"
              alt="MacBook Pro trong khÃ´ng gian lÃ m viá»‡c tá»‘i giáº£n"
              className="store-feature-img w-full h-full object-cover object-center transition-transform duration-700"
              style={{ filter: 'brightness(0.85) saturate(1)' }}
              onError={(e) => e.target.parentElement.style.background = '#0d0d10'}
            />
          </div>
          {/* Right: feature rows */}
          <div className="bg-[#0a0a0e] lg:rounded-3xl lg:rounded-l-none border-t lg:border-t-0 lg:border-l border-white/6 p-10 lg:p-16 flex flex-col justify-center gap-10">
            <AnimatedText
              text="Huyá»n Thoáº¡i Pig Store."
              type="word"
              tag="h2"
              className="text-4xl font-extrabold tracking-tighter text-white leading-tight"
              stagger={65}
            />
            <div className="flex flex-col divide-y divide-white/8">
              {FEATURES.map((f, i) => (
                <div key={i} className="store-feature-row py-5 flex items-start gap-5 group">
                  <div className="text-2xl text-white/25 group-hover:text-white/65 transition-colors shrink-0 mt-0.5">
                    {f.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-base tracking-tight">{f.label}</p>
                    <p className="text-sm text-white/35 mt-0.5">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          SECTION 5 â€” CINEMATIC CTA (full-bleed watch)
         â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative min-h-[65vh] flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/watch_new.jpg"
            alt=""
            aria-hidden
            className="w-full h-full object-cover object-center"
            style={{ filter: 'brightness(0.45) saturate(0.75)' }}
            onError={(e) => e.target.style.display = 'none'}
          />
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at center, rgba(4,4,6,0.25) 0%, rgba(4,4,6,0.6) 100%)' }}
          />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <AnimatedText
            text="Sá»Ÿ Há»¯u SiÃªu Pháº©m HÃ´m Nay."
            type="word"
            tag="h2"
            className="text-4xl sm:text-6xl font-extrabold tracking-tighter text-white leading-tight mb-6"
            stagger={60}
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-lg text-white/45 mb-10 max-w-md mx-auto"
          >
            Nháº­n giao hÃ ng trong 2 giá» táº¡i ná»™i thÃ nh.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <a
              id="store-cta-final"
              href="#products"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 hover:scale-[1.02] transition-all"
            >
              Mua Ngay <ArrowRight size={15} weight="bold" />
            </a>
            <Link
              to="/pre-order"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/25 text-white/70 font-medium text-sm hover:bg-white/8 hover:border-white/50 transition-all"
            >
              TÆ° Váº¥n VIP
            </Link>
          </motion.div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          SECTION 6 â€” FOOTER
         â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <footer className="bg-black border-t border-white/8 px-6 sm:px-10 py-10">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/25">Pig Store</p>
          <nav className="flex flex-wrap gap-6">
            {['iPhone', 'MacBook', 'iPad', 'Apple Watch', 'Há»— Trá»£'].map(item => (
              <Link key={item} to="/" className="text-[11px] text-white/25 hover:text-white/65 transition-colors tracking-wide">{item}</Link>
            ))}
          </nav>
        </div>
        <div className="max-w-[1400px] mx-auto mt-8 pt-6 border-t border-white/6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[11px] text-white/20 font-mono">Â© 2025 Pig Store. Táº¥t cáº£ quyá»n Ä‘Æ°á»£c báº£o lÆ°u.</p>
          <div className="flex items-center gap-4">
            <a href="#" aria-label="Facebook" className="text-white/20 hover:text-white/55 transition-colors"><FacebookLogo size={16} /></a>
            <a href="#" aria-label="Instagram" className="text-white/20 hover:text-white/55 transition-colors"><InstagramLogo size={16} /></a>
          </div>
        </div>
      </footer>

      <ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={selectedProduct} />
    </div>
  );
}
