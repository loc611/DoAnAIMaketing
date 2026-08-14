import React from 'react';
import { motion } from 'framer-motion';

export default function ProductCard({ product, isStickyHeader = false, isPeekCard = false }) {
  if (!product) return null;

  /* ── Chế độ Sticky Header thu nhỏ cho Tầng 2 (Mô tả) & Tầng 3 (Thông số) ── */
  if (isStickyHeader) {
    return (
      <motion.div
        layoutId={`product-header-${product.id}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-2xl mx-auto mb-4 p-3 rounded-2xl bg-[#0F0F12]/90 backdrop-blur-xl border border-[#E87B2C]/40 shadow-[0_0_20px_rgba(232,123,44,0.25)] flex items-center justify-between gap-4 z-30"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-black/60 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center p-1">
            <img
              src={product.heroImage}
              alt={product.name}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-mono tracking-widest text-[#E87B2C] uppercase font-semibold">
              {product.edition}
            </span>
            <h3 className="text-base font-bold text-white truncate">
              {product.name}
            </h3>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="block text-base font-extrabold text-[#E87B2C]">
            {product.price}
          </span>
          {product.originalPrice && (
            <span className="block text-xs text-white/40 line-through">
              {product.originalPrice}
            </span>
          )}
        </div>
      </motion.div>
    );
  }

  /* ── Chế độ Peek Mờ cho sản phẩm phía trên chưa active ── */
  if (isPeekCard) {
    return (
      <div className="w-full max-w-[440px] h-[100px] rounded-[24px] bg-[#0A0A0C] border border-[#E87B2C]/20 shadow-lg p-3 flex items-center justify-center overflow-hidden opacity-40 blur-[3px] select-none pointer-events-none">
        <span className="text-4xl font-extrabold text-white/15 font-mono tracking-tighter">
          {product.watermarkText}
        </span>
        <span className="ml-3 text-sm font-semibold text-white/30 truncate">
          {product.name}
        </span>
      </div>
    );
  }

  /* ── Chế độ Full Hero Card tiêu chuẩn (Tầng 1 - Hero Card) ── */
  const isTitaniumBlackHero = product.id === 'iphone-16-pro-max';

  return (
    <motion.div
      layoutId={`product-card-${product.id}`}
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.92, opacity: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="flex flex-col items-center w-full max-w-[540px] sm:max-w-[620px] mx-auto select-none"
    >
      {/* ── Main Card Frame ── */}
      <div className={`relative w-full rounded-[28px] overflow-hidden flex flex-col justify-between min-h-[480px] sm:min-h-[520px] p-6 sm:p-8 transition-all duration-500 ${
        isTitaniumBlackHero
          ? 'bg-[#0B0B0B] border border-white/15 shadow-[0_0_50px_rgba(0,0,0,0.9)]'
          : 'bg-[#0A0A0C] border border-[#E87B2C]/40 shadow-[0_0_35px_rgba(232,123,44,0.2)]'
      }`}>
        
        {/* Studio Void Lighting Overlays for Titanium Black */}
        {isTitaniumBlackHero && (
          <>
            {/* Volumetric Rim Light Beam (Top-Left) */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 left-0 w-3/4 h-3/4 opacity-40 blur-[40px] z-0"
              style={{
                background: 'radial-gradient(ellipse at 15% 15%, rgba(255,255,255,0.3) 0%, rgba(212,212,216,0.08) 45%, transparent 70%)'
              }}
            />
            {/* Ice Blue Neon Fill Glow (Bottom edge) */}
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/3 opacity-35 blur-[35px] z-0"
              style={{
                background: 'radial-gradient(ellipse at 50% 100%, rgba(56,189,248,0.25) 0%, rgba(14,165,233,0.05) 50%, transparent 80%)'
              }}
            />
            {/* Anthracite Gray Radial Gradient Edges */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-0 opacity-80"
              style={{
                background: 'radial-gradient(circle at 50% 50%, #0B0B0B 40%, #16161A 100%)'
              }}
            />
          </>
        )}

        {/* Top Header Section: Architectural Typography (Left) & Glassmorphism Badge (Right) */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-4 items-start w-full mb-2">
          {/* Left 2/3: Neue Haas Grotesk Wide-Tracked Typography */}
          <div className="sm:col-span-7 flex flex-col justify-start">
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.28em] text-[#C4C4C8] uppercase mb-1 drop-shadow-sm"
            >
              {product.edition}
            </motion.span>
            <motion.h3
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none"
            >
              {product.name}
            </motion.h3>
          </div>

          {/* Right 1/3: Floating Pig Store Authorized Authentication Seal */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none">
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              <ShieldCheck size={12} weight="fill" className="text-[#d4af37]" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#d4af37]">
                Pig Store Authorized
              </span>
            </div>
          </div>
          <div className="sm:col-span-5 flex sm:justify-end">
            <div className="w-full sm:w-auto p-3 sm:p-3.5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex flex-col items-start sm:items-end gap-1">
              {product.originalPrice && (
                <span className="text-[11px] font-mono text-white/40 line-through tracking-wider decoration-[#E87B2C]/70">
                  {product.originalPrice}
                </span>
              )}
              <span className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-[#E87B2C] via-[#F49D56] to-[#E58C73] bg-clip-text text-transparent drop-shadow-sm">
                {product.price}
              </span>
              <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gradient-to-r from-zinc-900 to-black border border-white/10 text-[9px] font-mono font-semibold text-zinc-300">
                <svg className="w-3 h-3 text-[#38BDF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Vanguard Authorized</span>
              </div>
            </div>
          </div>
        </div>

        {/* Giant Watermark Text Background */}
        <div
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-extrabold text-center select-none leading-none pointer-events-none z-0"
          style={{
            fontSize: 'clamp(70px, 16vw, 130px)',
            letterSpacing: '-0.04em',
            color: 'transparent',
            WebkitTextStroke: isTitaniumBlackHero ? '1px rgba(255,255,255,0.06)' : '1px rgba(255,255,255,0.07)',
          }}
        >
          {product.watermarkText}
        </div>

        {/* Product Image & Translucent Floating Shadow */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-4 my-1">
          <motion.img
            src={product.heroImage}
            alt={product.name}
            loading="lazy"
            animate={isTitaniumBlackHero ? { y: [0, -8, 0] } : {}}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="max-h-[230px] sm:max-h-[270px] w-auto object-contain transition-transform duration-500 hover:scale-105 filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.95)]"
          />
          {/* Soft translucent floating shadow 15cm beneath */}
          <div className="w-44 sm:w-52 h-3.5 mt-2 rounded-[100%] bg-black/80 blur-md pointer-events-none transform scale-y-50" />
        </div>

        {/* Card Footer: Micro-interaction Pulsing Indicator */}
        <div className="relative z-10 mt-auto pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-white/40 font-mono tracking-widest uppercase">
            Hyper-Premium Series
          </span>

          {/* Pulsing circular glow dot indicator */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Discover</span>
            <motion.div
              animate={{
                scale: [1, 1.35, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] shadow-[0_0_12px_#38BDF8]"
            />
          </div>
        </div>
      </div>

      {/* ── Bottom Pill Label dưới card (Format: "EDITION | Full Name") ── */}
      <div className="mt-4 inline-flex items-center gap-3 px-5 py-2 rounded-full bg-[#121216]/90 border border-white/15 backdrop-blur-md shadow-lg text-xs font-mono tracking-wider">
        <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]" />
        <span className="text-[#38BDF8] font-semibold uppercase">{product.edition}</span>
        <span className="text-white/30">|</span>
        <span className="text-white/80 font-medium">{product.name}</span>
      </div>
    </motion.div>
  );
}

