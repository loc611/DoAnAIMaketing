import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AwwwardsButton from '../components/ui/AwwwardsButton';
import AnimatedText from '../components/ui/AnimatedText';
import { Cpu, Monitor, BatteryCharging, Lightning, ShieldCheck, Sparkle } from '@phosphor-icons/react';

gsap.registerPlugin(ScrollTrigger);

function Mac() {
  const containerRef = useRef();
  const galleryRef = useRef();
  const heroImgRef = useRef();
  const [activeChip, setActiveChip] = useState('m4pro');

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Hero animations
      gsap.fromTo('.mac-hero-badge',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.1 }
      );
      gsap.fromTo('.mac-hero-subtitle',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.45 }
      );
      gsap.fromTo('.mac-hero-img',
        { opacity: 0, y: 80, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 1.5, ease: 'power3.out', delay: 0.3 }
      );
      // Specs cards stagger
      gsap.fromTo('.mac-spec-card',
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.mac-specs-grid', start: 'top 75%' }
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Scroll reveal for CSS animation classes
  useEffect(() => {
    const elements = document.querySelectorAll('.fade-up, .fade-in, .scale-in');
    if (!elements.length) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); observer.unobserve(e.target); } }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Hero image mouse parallax
  const handleHeroMouse = (e) => {
    if (!heroImgRef.current) return;
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 20;
    const y = (e.clientY / innerHeight - 0.5) * 20;
    gsap.to(heroImgRef.current, { x, y, duration: 0.8, ease: 'power2.out' });
  };

  const chipSpecs = {
    m4: {
      title: 'Apple M4',
      cores: '10-Core CPU • 10-Core GPU',
      bandwidth: '120GB/s Băng thông bộ nhớ',
      desc: 'Hiệu năng lý tưởng cho lập trình viên và sáng tạo nội dung đa phương tiện.'
    },
    m4pro: {
      title: 'Apple M4 Pro',
      cores: '14-Core CPU • 20-Core GPU',
      bandwidth: '273GB/s Băng thông bộ nhớ',
      desc: 'bứt phá tốc độ cho dựng phim 8K ProRes và dựng mô hình 3D phức tạp.'
    },
    m4max: {
      title: 'Apple M4 Max',
      cores: '16-Core CPU • 40-Core GPU',
      bandwidth: '546GB/s Băng thông bộ nhớ',
      desc: 'Quái vật đồ họa. Xử lý các mô hình LLM AI ngay trực tiếp trên bộ nhớ thống nhất 128GB.'
    }
  };

  return (
    <div ref={containerRef} className="bg-[#08080a] text-[#f3f3f6] pt-16 min-h-screen" onMouseMove={handleHeroMouse}>

      {/* SECTION 1: HERO */}
      <section className="relative flex flex-col items-center overflow-hidden px-6 pt-24 pb-20 text-center min-h-[90dvh] justify-center">
        {/* Radial Ambient Mesh */}
        <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-radial from-[#d15a20]/15 via-transparent to-transparent blur-3xl" />

        <div className="mac-hero-badge inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] font-semibold border border-white/10 bg-white/5 backdrop-blur-md mb-6 text-[#e87b46]">
          <Sparkle size={14} weight="fill" />
          <span>MacBook Pro M4 Series • $1M Awwwards Standard</span>
        </div>

        <AnimatedText
          text="MacBook Pro. Siêu Phàm."
          type="word"
          tag="h1"
          className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-white max-w-5xl leading-tight"
          delay={200}
          stagger={75}
        />

        <p className="mac-hero-subtitle mt-6 max-w-2xl text-lg md:text-xl text-white/60 font-medium leading-relaxed">
          Sức mạnh vô song từ chip M4 Pro và M4 Max. MÀN HÌNH Liquid Retina XDR Nano-texture lộng lẫy và thời lượng pin lên đến 24 giờ.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-5 z-10">
          <AwwwardsButton href="#specs" className="hover-glow-white">
            Khám phá Cấu hình
          </AwwwardsButton>
          <Link to="/pre-order" className="cta-secondary">
            Tư vấn Chuyên gia
          </Link>
        </div>

        <div className="mac-hero-img mt-12 max-w-5xl w-full">
          <img 
            ref={heroImgRef}
            src="/images/macbook_hero.jpg" 
            alt="MacBook Pro M4" 
            className="w-full h-auto rounded-[2.5rem] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] object-cover"
          />
        </div>
      </section>

      {/* SECTION 2: APPLE SILICON CHIP SELECTOR (DOPPELRAND CONTAINER) */}
      <section id="specs" className="py-28 px-6 max-w-[1400px] mx-auto border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[11px] uppercase font-bold tracking-widest text-[#e87b46] block mb-2">Trái Tim Công Nghệ</span>
          <AnimatedText
            text="Bộ Ba Chip M4. bứt phá mọi giới hạn."
            type="word"
            tag="h2"
            className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-white"
            stagger={55}
          />
        </div>

        {/* Chip Selector Buttons */}
        <div className="flex justify-center gap-3 mb-12">
          {['m4', 'm4pro', 'm4max'].map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveChip(chip)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-400 ${
                activeChip === chip 
                  ? 'bg-white text-black shadow-lg shadow-white/10 scale-105' 
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {chip.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Doppelrand Display Shell for Active Chip */}
        <div className="doppelrand-shell max-w-4xl mx-auto">
          <div className="doppelrand-core flex flex-col md:flex-row items-center justify-between gap-8 p-10 md:p-12">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d15a20]/20 border border-[#d15a20]/30 text-[#e87b46] text-xs font-extrabold uppercase tracking-widest mb-4">
                <Cpu size={16} weight="bold" />
                <span>{chipSpecs[activeChip].title}</span>
              </div>
              <h3 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
                {chipSpecs[activeChip].cores}
              </h3>
              <p className="text-base text-[#e87b46] font-semibold mb-4">
                {chipSpecs[activeChip].bandwidth}
              </p>
              <p className="text-white/60 text-sm font-medium leading-relaxed max-w-md">
                {chipSpecs[activeChip].desc}
              </p>
            </div>
            <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-radial from-[#d15a20]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <Cpu size={80} weight="duotone" className="text-white/80 group-hover:scale-110 transition-transform duration-700" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: SPECS BENTO MASONRY GRID */}
      <section className="py-28 px-6 max-w-[1400px] mx-auto mac-specs-grid">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 doppelrand-shell mac-spec-card hover-glow-white">
            <div className="doppelrand-core p-10 flex flex-col justify-between min-h-[380px]">
              <div className="text-4xl text-[#e87b46] mb-6 hover-spin-icon">
                <Monitor weight="duotone" className="icon-target" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1">Công Nghệ hiển thị</span>
                <h3 className="text-3xl font-extrabold text-white mb-3 tracking-tight">MÀN HÌNH Liquid Retina XDR Nano-Texture</h3>
                <p className="text-white/60 text-sm leading-relaxed max-w-xl">
                  Độ sáng cực đại 1600 nits. Tỷ lệ tương phản 1.000.000:1. Lớp phủ Nano-texture chống chói tối đa dưới ánh sáng mạnh.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 doppelrand-shell mac-spec-card hover-glow-emerald">
            <div className="doppelrand-core p-10 flex flex-col justify-between min-h-[380px]">
              <div className="text-4xl text-emerald-400 mb-6 hover-spin-icon">
                <BatteryCharging weight="duotone" className="icon-target" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1">Năng lượng vượt trội</span>
                <h3 className="text-3xl font-extrabold text-white mb-3 tracking-tight">24 giờ Pin</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Thời lượng pin dài nhất từng có trên máy tính Mac. Sạc nhanh 50% chỉ trong 30 phút với củ sạc MagSafe 3.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 4: CTA FOOTER BANNER */}
      <section className="py-24 px-6 bg-[#050508] border-t border-white/10 text-center">
        <div className="max-w-3xl mx-auto">
          <AnimatedText
            text="Sẵn Sàng Nâng Cấp Tốc Độ?"
            type="word"
            tag="h2"
            className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-white mb-6"
            stagger={70}
          />
          <p className="fade-up text-white/60 text-lg mb-10">
            Đặt mua ngay hôm nay để nhận đặc quyền giao hàng miễn phí hỏa tốc và dịch vụ hỗ trợ chuyên gia 24/7.
          </p>
          <div className="fade-up delay-200 flex justify-center gap-4">
            <AwwwardsButton href="/pre-order" className="hover-glow-white">
              Đăng Ký Tư Vấn VIP
            </AwwwardsButton>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Mac;
