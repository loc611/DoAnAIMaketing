/**
 * LandingAnimations.jsx
 * Demo section cho thấy tất cả hiệu ứng animation đã tạo:
 *  - Float / Bounce sản phẩm
 *  - Fade-up khi cuộn
 *  - Parallax background
 *  - Hover glow / scale / xoay
 *  - AnimatedText từng từ
 *
 * Thêm vào trang landing: <LandingAnimations />
 * (Ví dụ: import vào Iphone.jsx hoặc một trang Home riêng)
 */
import React, { useEffect, useRef } from 'react';
import AnimatedText from '../components/ui/AnimatedText';
import '../animations.css';

// --- Parallax Hook đơn giản ---
function useParallax(ref, speed = 0.3) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleScroll = () => {
      const rect = el.parentElement.getBoundingClientRect();
      const offset = rect.top * speed;
      el.style.setProperty('--parallax-y', `${offset}px`);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ref, speed]);
}

// --- Mouse-tracking product card ---
function ProductCard({ label, emoji, accentClass, glowClass }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mx', `${x}%`);
    card.style.setProperty('--my', `${y}%`);
  };

  return (
    <div
      ref={cardRef}
      className={`product-card ${glowClass} p-8 flex flex-col items-center gap-4 cursor-pointer`}
      onMouseMove={handleMouseMove}
    >
      {/* Product floating emoji / icon */}
      <div className="text-7xl animate-float" style={{ animationDelay: Math.random() * 2 + 's' }}>
        {emoji}
      </div>

      <div className="text-center">
        <div className={`text-lg font-bold text-white ${accentClass}`}>{label}</div>
        <div className="text-sm text-white/50 mt-1">Hover để xem hiệu ứng</div>
      </div>

      {/* Ping dot */}
      <div className="ping-dot">
        <span className="block w-2.5 h-2.5 rounded-full bg-emerald-400" />
      </div>

      {/* CTA button với xoay mũi tên */}
      <button className="cta-secondary hover-arrow-tilt text-sm mt-2">
        Mua ngay
        <span className="cta-arrow arrow-target">→</span>
      </button>
    </div>
  );
}

// --- Main Export ---
export default function LandingAnimations() {
  const parallaxRef = useRef(null);
  const bgRef = useRef(null);

  useParallax(bgRef, 0.25);

  // Scroll reveal với IntersectionObserver
  useEffect(() => {
    const elements = document.querySelectorAll(
      '.fade-up, .fade-in, .fade-left, .fade-right, .scale-in'
    );
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ background: '#08080a', minHeight: '100vh' }}>

      {/* =====================================================
          HERO — Parallax background + Animated Title
         ===================================================== */}
      <section
        ref={parallaxRef}
        className="parallax-wrapper relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden"
      >
        {/* Parallax background layer */}
        <div
          ref={bgRef}
          className="parallax-bg animated-gradient-bg"
          aria-hidden
        />
        <div className="parallax-overlay" aria-hidden />

        {/* Content */}
        <div className="parallax-content px-6 max-w-5xl mx-auto">
          {/* Tag badge — fade-in */}
          <div className="fade-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur text-xs font-semibold text-white/70 mb-8 uppercase tracking-widest">
            <span className="ping-dot">
              <span className="block w-2 h-2 rounded-full bg-emerald-400" />
            </span>
            Bộ sưu tập mới nhất 2025
          </div>

          {/* Title — animate từng từ */}
          <AnimatedText
            text="Vượt Giới Hạn. Một Thiết Kế."
            type="word"
            tag="h1"
            className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6"
            delay={200}
            stagger={80}
          />

          {/* Sub text — animate từng ký tự */}
          <AnimatedText
            text="iPhone. MacBook. Apple Watch."
            type="char"
            tag="p"
            className="shimmer-text-gold text-2xl md:text-3xl font-bold mb-10"
            delay={800}
            stagger={30}
          />

          {/* CTA Buttons */}
          <div className="fade-up delay-600 flex flex-wrap items-center justify-center gap-4">
            <button id="hero-cta-buy" className="cta-primary hover-glow-white">
              Khám Phá Ngay
              <span className="cta-arrow">→</span>
            </button>
            <button id="hero-cta-watch" className="cta-secondary hover-glow-indigo">
              Xem video
              <span className="cta-arrow">▶</span>
            </button>
          </div>
        </div>

        {/* Scroll indicator — bounce */}
        <div className="absolute bottom-10 animate-bounce-subtle text-white/30 text-xs tracking-widest uppercase flex flex-col items-center gap-2">
          <span>Cuộn xuống</span>
          <span className="text-lg">↓</span>
        </div>
      </section>


      {/* =====================================================
          PRODUCTS — Fade-up grid + Float cards
         ===================================================== */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <AnimatedText
            text="Hệ Sinh Thái Apple"
            type="word"
            tag="h2"
            className="text-4xl md:text-5xl font-extrabold text-white mb-4"
            stagger={100}
          />
          <p className="fade-up delay-200 text-white/50 text-lg max-w-xl mx-auto">
            Ba sản phẩm định nghĩa lại tiêu chuẩn. Một trải nghiệm liền mạch.
          </p>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="scale-in delay-100">
            <ProductCard
              emoji="📱"
              label="iPhone 17 Pro Max"
              accentClass=""
              glowClass="hover-glow-orange"
            />
          </div>
          <div className="scale-in delay-300">
            <ProductCard
              emoji="💻"
              label="MacBook Pro M4"
              accentClass=""
              glowClass="hover-glow-white"
            />
          </div>
          <div className="scale-in delay-500">
            <ProductCard
              emoji="⌚"
              label="Apple Watch Ultra 3"
              accentClass=""
              glowClass="hover-glow-emerald"
            />
          </div>
        </div>
      </section>


      {/* =====================================================
          HOVER SHOWCASE — Glow, Scale, Spin Demo
         ===================================================== */}
      <section className="py-24 px-6 bg-[#0d0d12]">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedText
            text="Hiệu Ứng Tương Tác"
            type="word"
            tag="h2"
            className="text-3xl font-extrabold text-white mb-4"
          />
          <p className="fade-up text-white/40 mb-16">Rê chuột lên từng nút để xem animation</p>

          <div className="fade-up delay-200 flex flex-wrap items-center justify-center gap-6">
            {/* Glow buttons */}
            <button
              id="demo-glow-orange"
              className="hover-glow-orange px-6 py-3 rounded-full bg-[#151516] border border-orange-500/20 text-orange-400 font-semibold text-sm"
            >
              🔥 Glow Orange
            </button>

            <button
              id="demo-glow-indigo"
              className="hover-glow-indigo px-6 py-3 rounded-full bg-[#151516] border border-indigo-500/20 text-indigo-400 font-semibold text-sm"
            >
              💜 Glow Indigo
            </button>

            <button
              id="demo-glow-emerald"
              className="hover-glow-emerald px-6 py-3 rounded-full bg-[#151516] border border-emerald-500/20 text-emerald-400 font-semibold text-sm"
            >
              ✅ Glow Emerald
            </button>

            {/* Scale buttons */}
            <button
              id="demo-scale"
              className="hover-scale-lg hover-press px-6 py-3 rounded-full bg-white text-black font-bold text-sm"
            >
              ⬆ Scale
            </button>

            {/* Lift + shadow */}
            <button
              id="demo-lift"
              className="hover-lift px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-lg"
            >
              🚀 Lift + Shadow
            </button>

            {/* Spin icon */}
            <button
              id="demo-spin"
              className="hover-spin-icon flex items-center gap-2 px-6 py-3 rounded-full bg-[#151516] border border-white/10 text-white font-semibold text-sm"
            >
              <span className="icon-target text-xl">⚙</span>
              Xoay Icon
            </button>

            {/* Flip 3D */}
            <div
              id="demo-flip"
              className="hover-flip-3d px-8 py-4 rounded-2xl bg-[#151516] border border-white/10 text-white font-bold text-sm cursor-pointer"
            >
              🌀 Flip 3D
            </div>

            {/* Arrow tilt */}
            <button
              id="demo-arrow"
              className="hover-arrow-tilt flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white font-semibold text-sm"
            >
              Khám phá
              <span className="arrow-target">→</span>
            </button>
          </div>
        </div>
      </section>


      {/* =====================================================
          ANIMATED TEXT SHOWCASE
         ===================================================== */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="mb-12">
          <AnimatedText
            text="Thiết Kế Cho Thế Hệ Tiếp Theo"
            type="word"
            tag="h2"
            className="text-4xl md:text-6xl font-extrabold text-white leading-tight"
            stagger={70}
          />
        </div>

        <div className="mb-8">
          <AnimatedText
            text="POWER."
            type="char"
            tag="div"
            className="shimmer-text text-6xl md:text-8xl font-black tracking-tight"
            delay={300}
            stagger={50}
          />
        </div>

        <div className="mb-8">
          <AnimatedText
            text="ELEGANCE."
            type="char"
            tag="div"
            className="shimmer-text-gold text-6xl md:text-8xl font-black tracking-tight"
            delay={600}
            stagger={50}
          />
        </div>

        <p className="fade-up delay-400 text-white/40 text-xl max-w-lg mt-8 leading-relaxed">
          Từ chip A19 Pro đến màn hình ProMotion 120Hz — mọi chi tiết đều được tối ưu hoàn hảo.
        </p>
      </section>

    </div>
  );
}
