import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PRODUCTS_DATA } from '../../../data/productsData';
import ProductStack from './ProductStack';
import ScrollHint from './ScrollHint';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

/**
 * GSAP SCROLL-DRIVEN PRODUCT SHOWCASE (Serve Robotics Pattern)
 * ─────────────────────────────────────────────────────────────────────────────
 * Section quản lý 4 sản phẩm, mỗi sản phẩm gồm 3 Tầng (Scene):
 * - Tầng 0 (Hero Card): Card sản phẩm full
 * - Tầng 1 (Mô tả): Card thu nhỏ sticky header + Nội dung mô tả & highlights
 * - Tầng 2 (Thông số kỹ thuật): Card thu nhỏ sticky header + Grid thông số 8 trường
 *
 * Interactivity:
 * - GSAP ScrollTrigger pin container với scroll height = products.length * 300% (~300vh / sản phẩm)
 * - scrub: 1 cho hiệu ứng cuộn mượt mà có quán tính (1s smooth lag)
 * - Xóa hoàn toàn progress dots / navigation bar (cuộn thuần)
 * ─────────────────────────────────────────────────────────────────────────────
 */

export default function ProductShowcase({ products = PRODUCTS_DATA }) {
  const [currentStep, setCurrentStep] = useState(0);
  const containerRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const totalProducts = products.length;
  const totalSteps = totalProducts * 3;

  // Calculate active product and scene indices
  const activeProductIndex = Math.floor(currentStep / 3);
  const activeSceneIndex = currentStep % 3;

  /* ── GSAP ScrollTrigger Pin & Scrub (Serve Robotics Pattern) ── */
  useEffect(() => {
    const section = containerRef.current;
    if (!section) return;

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: `+=${totalProducts * 300}%`, // Mỗi sản phẩm = 1 pinned section ~300vh
      pin: true,
      scrub: 1, // smooth lag 1s — premium feel
      anticipatePin: 1,
      onUpdate: (self) => {
        const step = Math.min(
          totalSteps - 1,
          Math.floor(self.progress * totalSteps)
        );
        setCurrentStep(step);
      },
    });

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(timer);
      st.kill();
    };
  }, [totalProducts, totalSteps]);

  return (
    <section
      id="product-showcase"
      ref={containerRef}
      className="relative w-full h-screen bg-[#0A0A0A] text-white py-12 sm:py-16 px-4 sm:px-8 overflow-hidden flex flex-col justify-between select-none"
    >
      {/* Background ambient lighting glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full opacity-20 blur-[120px] z-0 transition-all duration-700"
        style={{
          background: activeProductIndex === 0
            ? 'radial-gradient(circle, #38BDF8 0%, #0EA5E9 30%, transparent 75%)'
            : 'radial-gradient(circle, #E87B2C 0%, #C4784A 40%, transparent 75%)'
        }}
      />

      {/* Section Header Title */}
      <div className="relative z-10 text-center max-w-3xl mx-auto mb-6 sm:mb-8">
        <motion.h2
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight"
        >
          Siêu Phẩm Điện Thoại & Công Nghệ
        </motion.h2>
        <p className="text-xs sm:text-sm text-white/40 mt-2 font-medium tracking-wide">
          Cuộn chuột hoặc vuốt để khám phá bộ sưu tập cao cấp
        </p>
        {/* CTA: iPhone 17 Pro Cinematic Landing */}
        <Link
          to="/iphone-17-pro"
          className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#E87B2C]/15 border border-[#E87B2C]/40 text-[11px] font-mono font-bold tracking-[0.2em] text-[#E87B2C] uppercase hover:bg-[#E87B2C]/25 transition-colors"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#E87B2C] shadow-[0_0_6px_#E87B2C] animate-pulse" />
          Khám Phá iPhone 17 Pro
        </Link>
      </div>

      {/* Main Product Stack & Scene Content */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center">
        <ProductStack
          products={products}
          activeProductIndex={activeProductIndex}
          activeSceneIndex={activeSceneIndex}
          reducedMotion={prefersReducedMotion}
        />
      </div>

      {/* Dynamic Sub-hint text */}
      <div className="relative z-10 mt-4">
        <ScrollHint sceneIndex={activeSceneIndex} />
      </div>
    </section>
  );
}
