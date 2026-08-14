import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretLeft, CaretRight, CaretUp, CaretDown, X, ShoppingCart, Lightning, ShieldCheck, Cpu, BatteryHigh, Camera, DeviceMobile, Star } from '@phosphor-icons/react';
import { useCart } from '../../contexts/CartContext';
import { useAuthAction } from '../../hooks/useAuthAction';

// Import image 1 from imga/iphone/OIP (5).webp as requested in requirement 1
import iphoneOip5 from '@imga/iphone/OIP (5).webp';

export default function Store3DCoverFlow({ products: externalProducts, onSelectProduct }) {
  const cartContext = useCart();
  const requireAuth = useAuthAction();
  const addToCart = cartContext?.addToCart;
  const openCart = cartContext?.openCart;

  // Default products dataset fallback (iPhone series: 17 Pro Max, 15 Pro Max, 14 Pro Max)
  const defaultProducts = [
    {
      id: 'iphone-17-pro-max',
      title: 'iPhone 17 Pro Max',
      subtitle: 'BLACK MYTH EDITION',
      seriesText: '17 PRO',
      price: 34999000,
      originalPrice: 39999000,
      description: 'Khung Titan Sa Máº¡c hÃ ng khÃ´ng vÅ© trá»¥. Chipset A19 Pro 3nm siÃªu phÃ¢n luá»“ng vá»›i ray-tracing pháº§n cá»©ng.',
      image: iphoneOip5,
      accentColor: '#e87b46',
      badge: 'BLACK MYTH EDITION',
      rating: 4.9,
      reviewsCount: 328,
      colors: ['Titan Sa Máº¡c', 'Titan Äen', 'Titan Tráº¯ng', 'Titan Tá»± NhiÃªn'],
      storages: ['256GB', '512GB', '1TB'],
      specs: [
        { label: 'CHIPSET', value: 'A19 Pro (3nm)', icon: <Cpu size={16} /> },
        { label: 'MÃ€N HÃŒNH', value: '6.9" ProMotion 120Hz', icon: <DeviceMobile size={16} /> },
        { label: 'CAMERA', value: '48MP Quad-Pixel AI', icon: <Camera size={16} /> },
        { label: 'PIN & Sáº C', value: '33H Â· Sáº¡c 45W', icon: <BatteryHigh size={16} /> },
      ],
    },
    {
      id: 'iphone-15-pro-max',
      title: 'iPhone 15 Pro Max',
      subtitle: 'TITANIUM SELECTION',
      seriesText: '15 PRO',
      price: 29999000,
      originalPrice: 34999000,
      description: 'Khung Titanium tá»± nhiÃªn siÃªu nháº¹ bá»n bá»‰. Chip A17 Pro Ä‘áº³ng cáº¥p game Console, nÃºt Action Button vÃ  cá»•ng USB-C tá»‘c Ä‘á»™ cao.',
      image: '/images/iphone16_pro.png',
      accentColor: '#3b82f6',
      badge: 'TITANIUM SELECTION',
      rating: 4.9,
      reviewsCount: 245,
      colors: ['Titan Tá»± NhiÃªn', 'Titan Xanh', 'Titan Tráº¯ng', 'Titan Äen'],
      storages: ['256GB', '512GB', '1TB'],
      specs: [
        { label: 'CHIPSET', value: 'A17 Pro (3nm)', icon: <Cpu size={16} /> },
        { label: 'MÃ€N HÃŒNH', value: '6.7" Super Retina 120Hz', icon: <DeviceMobile size={16} /> },
        { label: 'CAMERA', value: '48MP Main | 5x Optical', icon: <Camera size={16} /> },
        { label: 'PIN & Sáº C', value: '4422 mAh Â· Sáº¡c 20W/25W', icon: <BatteryHigh size={16} /> },
      ],
    },
    {
      id: 'iphone-14-pro-max',
      title: 'iPhone 14 Pro Max',
      subtitle: 'DYNAMIC ISLAND EDITION',
      seriesText: '14 PRO',
      price: 24999000,
      originalPrice: 28999000,
      description: 'MÃ n hÃ¬nh Dynamic Island Ä‘á»™t phÃ¡ tÆ°Æ¡ng tÃ¡c linh hoáº¡t. Chipset A16 Bionic máº¡nh máº½, cáº£m biáº¿n 48MP sáº¯c nÃ©t.',
      image: '/images/iphone_hero_light.png',
      accentColor: '#a855f7',
      badge: 'DYNAMIC ISLAND',
      rating: 4.8,
      reviewsCount: 198,
      colors: ['TÃ­m Tá»‘i (Deep Purple)', 'VÃ ng', 'Báº¡c', 'Äen KhÃ´ng Gian'],
      storages: ['128GB', '256GB', '512GB', '1TB'],
      specs: [
        { label: 'CHIPSET', value: 'A16 Bionic (4nm)', icon: <Cpu size={16} /> },
        { label: 'MÃ€N HÃŒNH', value: '6.7" Super Retina 120Hz', icon: <DeviceMobile size={16} /> },
        { label: 'CAMERA', value: '48MP Main | 3x Optical', icon: <Camera size={16} /> },
        { label: 'PIN & Sáº C', value: '4323 mAh Â· Sáº¡c 20W', icon: <BatteryHigh size={16} /> },
      ],
    },
  ];

  const productsList = (externalProducts && externalProducts.length > 0)
    ? externalProducts.map((p, idx) => ({
        ...p,
        image: idx === 0 ? iphoneOip5 : (p.image || defaultProducts[idx % defaultProducts.length].image),
        subtitle: p.subtitle || defaultProducts[idx % defaultProducts.length]?.subtitle || 'PIG STORE EDITION',
        seriesText: p.seriesText || defaultProducts[idx % defaultProducts.length]?.seriesText || 'PRO',
        accentColor: p.accentColor || defaultProducts[idx % defaultProducts.length]?.accentColor || '#e87b46',
        badge: p.badge || defaultProducts[idx % defaultProducts.length]?.badge || 'PREMIUM SELECTION',
        originalPrice: p.originalPrice || (p.price ? Math.round(p.price * 1.15) : 39999000),
        specs: p.specs || defaultProducts[idx % defaultProducts.length]?.specs || defaultProducts[0].specs,
      }))
    : defaultProducts;

  // â”€â”€ State â”€â”€
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(0); // target continuous angle in index units
  const [displayAngle, setDisplayAngle] = useState(0);   // smoothed render angle
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [loadedImages, setLoadedImages] = useState({});

  // â”€â”€ Drag & Inertia Physics Refs (Vertical Y-Axis Drag) â”€â”€
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartYRef = useRef(0);
  const startAngleRef = useRef(0);
  const lastYRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const animFrameIdRef = useRef(null);

  // Synchronize rotationAngle with activeIndex when changed via buttons
  useEffect(() => {
    setRotationAngle(activeIndex);
  }, [activeIndex]);

  // Smooth render loop for displayAngle transition
  useEffect(() => {
    let loopId;
    const animateAngle = () => {
      setDisplayAngle((prev) => {
        const diff = rotationAngle - prev;
        if (Math.abs(diff) < 0.001) return rotationAngle;
        return prev + diff * 0.18; // smooth spring lerp
      });
      loopId = requestAnimationFrame(animateAngle);
    };
    loopId = requestAnimationFrame(animateAngle);
    return () => cancelAnimationFrame(loopId);
  }, [rotationAngle]);

  // Handle active index snap calculation
  const updateActiveFromAngle = useCallback((angle) => {
    const total = productsList.length;
    let normalized = Math.round(angle) % total;
    if (normalized < 0) normalized += total;
    setActiveIndex(normalized);
  }, [productsList.length]);

  // Inertia Deceleration Momentum Loop
  const startMomentum = useCallback(() => {
    if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);

    let currentVel = velocityRef.current;
    let currentAngle = rotationAngle;

    const step = () => {
      if (Math.abs(currentVel) > 0.002) {
        currentVel *= 0.91; // damping factor
        currentAngle += currentVel * 0.04;
        setRotationAngle(currentAngle);
        animFrameIdRef.current = requestAnimationFrame(step);
      } else {
        // Snap to nearest index integer
        const nearestIndex = Math.round(currentAngle);
        setRotationAngle(nearestIndex);
        updateActiveFromAngle(nearestIndex);
      }
    };
    animFrameIdRef.current = requestAnimationFrame(step);
  }, [rotationAngle, updateActiveFromAngle]);

  // â”€â”€ Pointer Drag Event Handlers (Vertical Y-Axis) â”€â”€
  const handlePointerDown = (e) => {
    if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    isDraggingRef.current = true;
    dragStartYRef.current = e.clientY;
    startAngleRef.current = rotationAngle;
    lastYRef.current = e.clientY;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const now = performance.now();
    const dt = Math.max(1, now - lastTimeRef.current);
    const dy = e.clientY - lastYRef.current;
    
    // Calculate instantaneous vertical drag velocity
    velocityRef.current = -dy / dt * 15;

    lastYRef.current = e.clientY;
    lastTimeRef.current = now;

    // Convert vertical pixel delta to angle rotation
    const totalDragDy = e.clientY - dragStartYRef.current;
    const angleDelta = -totalDragDy / 150; 
    const newAngle = startAngleRef.current + angleDelta;

    setRotationAngle(newAngle);
    updateActiveFromAngle(newAngle);
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    startMomentum();
  };

  // â”€â”€ Keyboard Accessibility (Arrow Up / Down / Left / Right) â”€â”€
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isDetailOpen) return;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const next = Math.max(0, activeIndex - 1);
        setActiveIndex(next);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        const next = Math.min(productsList.length - 1, activeIndex + 1);
        setActiveIndex(next);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, productsList.length, isDetailOpen]);

  // â”€â”€ Product Selection / Card Click â”€â”€
  const handleCardClick = (product, index) => {
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
    
    setModalProduct(product);
    setSelectedColor(product.colors?.[0] || '');
    setSelectedStorage(product.storages?.[0] || '');
    setIsDetailOpen(true);

    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  // Update modal contents when switching products while modal is open
  useEffect(() => {
    if (isDetailOpen && productsList[activeIndex]) {
      const activeProd = productsList[activeIndex];
      setModalProduct(activeProd);
      setSelectedColor(activeProd.colors?.[0] || '');
      setSelectedStorage(activeProd.storages?.[0] || '');
    }
  }, [activeIndex, isDetailOpen]);

  const activeProduct = productsList[activeIndex] || productsList[0];

  const handleAddToCart = (e) => {
    e?.stopPropagation();
    if (addToCart && modalProduct) {
      addToCart({
        id: modalProduct.id,
        name: modalProduct.title,
        price: modalProduct.price,
        image: modalProduct.image,
        color: selectedColor,
        storage: selectedStorage,
        quantity: 1,
      });
      setToastMessage('ÄÃ£ thÃªm sáº£n pháº©m vÃ o giá» hÃ ng!');
      setTimeout(() => setToastMessage(''), 2200);
    }
  };

  const handleBuyNow = (e) => {
    e?.stopPropagation();
    if (addToCart && modalProduct) {
      addToCart({
        id: modalProduct.id,
        name: modalProduct.title,
        price: modalProduct.price,
        image: modalProduct.image,
        color: selectedColor,
        storage: selectedStorage,
        quantity: 1,
      });
    }
    requireAuth(() => {
      setIsDetailOpen(false);
      if (openCart) openCart();
    });
  };

  return (
    <div className="w-full relative overflow-hidden bg-[#040406] text-white select-none py-10">

      {/* â”€â”€ BRAND LOGO & HEADER ABOVE CAROUSEL â”€â”€ */}
      <div className="max-w-[1200px] mx-auto px-6 text-center mb-6 relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/12 backdrop-blur-md mb-3">
          <span className="w-2 h-2 rounded-full bg-[#e87b46] animate-pulse" />
          <span className="text-[11px] font-mono font-bold tracking-[0.25em] text-[#e87b46] uppercase">
            Pig Store 3D Showcase
          </span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tighter text-white">
          SiÃªu Pháº©m Äiá»‡n Thoáº¡i &amp; CÃ´ng Nghá»‡
        </h2>
        <p className="text-sm text-white/40 mt-2 max-w-md">
          KÃ©o dá»c hoáº·c sá»­ dá»¥ng phÃ­m mÅ©i tÃªn LÃªn/Xuá»‘ng Ä‘á»ƒ khÃ¡m phÃ¡ bá»™ sÆ°u táº­p 3D
        </p>
      </div>

      {/* â”€â”€ KINETIC AMBIENT SPOTLIGHT BACKGROUND GLOW â”€â”€ */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] rounded-full blur-[120px] opacity-40 transition-all duration-700 z-0"
        style={{
          background: `radial-gradient(circle, ${activeProduct?.accentColor || '#e87b46'}80 0%, rgba(212,175,55,0.2) 45%, rgba(4,4,6,0) 75%)`,
        }}
      />

      {/* â”€â”€ 3D VERTICAL CYLINDRICAL STAGE CAROUSEL CONTAINER â”€â”€ */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full h-[580px] flex items-center justify-center cursor-grab active:cursor-grabbing touch-none z-10"
        style={{ perspective: '1400px' }}
      >
        <div
          className="relative w-full max-w-[1350px] h-[540px] flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >

          {/* 3D VERTICAL ARC PRODUCT CARDS */}
          {productsList.map((product, i) => {
            const offset = i - displayAngle;
            const absOffset = Math.abs(offset);
            const isCenter = Math.abs(offset) < 0.4;

            // 3D Vertical Curved Arc Math Transformations
            const rotateX = offset * 22;
            const rotateY = offset * -4;
            const rotateZ = 0;
            const translateX = 0;
            const translateY = offset * 200;
            const translateZ = isCenter ? 140 : -absOffset * 95;
            const scale = isCenter ? 1.12 : Math.max(0.68, 1 - absOffset * 0.15);
            const opacity = isCenter ? 1 : Math.max(0.25, 1 - absOffset * 0.3);
            const zIndex = Math.round(100 - absOffset * 10);

            return (
              <motion.div
                key={product.id || i}
                onClick={() => handleCardClick(product, i)}
                animate={{
                  rotateX,
                  rotateY,
                  rotateZ,
                  x: translateX,
                  y: translateY,
                  z: translateZ,
                  scale,
                  opacity,
                }}
                transition={{ duration: 0.15, ease: 'linear' }}
                className={`absolute rounded-3xl overflow-hidden border transition-all duration-500 group cursor-pointer ${
                  isCenter
                    ? 'border-[#e87b46] shadow-[0_0_70px_rgba(232,123,70,0.5)] ring-2 ring-[#e87b46]/70'
                    : 'border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.85)] hover:border-white/30'
                }`}
                style={{
                  width: 'clamp(280px, 32vw, 360px)',
                  height: '420px',
                  zIndex,
                  transformStyle: 'preserve-3d',
                  background: '#090912',
                }}
              >
                {/* STYLIZED BACKGROUND WATERMARK TEXT */}
                <div className="absolute top-2 right-4 z-10 pointer-events-none opacity-20 font-extrabold text-6xl tracking-tighter text-white select-none">
                  {product.seriesText || 'PRO'}
                </div>

                {/* PRODUCT IMAGE WITH LAZY LOAD & BLUR PLACEHOLDER */}
                <div className="relative w-full h-[270px] overflow-hidden bg-black/40 flex items-center justify-center p-4">
                  {!loadedImages[i] && (
                    <div className="absolute inset-0 bg-white/5 animate-pulse backdrop-blur-sm" />
                  )}
                  <img
                    src={product.image}
                    alt={product.title}
                    loading="lazy"
                    onLoad={() => setLoadedImages((prev) => ({ ...prev, [i]: true }))}
                    className={`w-full h-full object-contain transition-all duration-700 group-hover:scale-105 pointer-events-none drop-shadow-2xl ${
                      loadedImages[i] ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
                    }`}
                    style={{
                      filter: isCenter
                        ? 'brightness(1.02) contrast(1.15) saturate(1.1)'
                        : 'brightness(0.45) saturate(0.5)',
                    }}
                    onError={(e) => {
                      e.target.src = iphoneOip5;
                      setLoadedImages((prev) => ({ ...prev, [i]: true }));
                    }}
                  />
                </div>

                {/* DARK GRADIENT OVERLAY */}
                <div
                  className="absolute inset-0 z-10 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to top, rgba(4,4,6,0.96) 0%, rgba(4,4,6,0.3) 50%, transparent 100%)',
                  }}
                />

                {/* TOP EDITION PILL BADGE */}
                <div className="absolute top-4 left-4 z-20">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] uppercase font-mono font-bold tracking-[0.2em] backdrop-blur-md border ${
                      isCenter
                        ? 'bg-[#e87b46]/30 border-[#e87b46] text-[#e87b46] shadow-[0_0_12px_rgba(232,123,70,0.4)]'
                        : 'bg-black/60 border-white/10 text-white/40'
                    }`}
                  >
                    {product.subtitle || 'BLACK MYTH EDITION'}
                  </span>
                </div>

                {/* BOTTOM PRODUCT DETAILS */}
                <div className="absolute bottom-5 left-5 right-5 z-20">
                  <h3 className="text-xl font-extrabold text-white tracking-tight leading-tight">
                    {product.title}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-base font-bold text-[#e87b46]">
                      {new Intl.NumberFormat('vi-VN').format(product.price)}Ä‘
                    </p>
                    {product.originalPrice && (
                      <p className="text-xs text-white/40 line-through">
                        {new Intl.NumberFormat('vi-VN').format(product.originalPrice)}Ä‘
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* BOTTOM SPOTLIGHT GLOW PODIUM PEDESTAL */}
          <div
            className="pointer-events-none absolute bottom-[-30px] z-30 flex flex-col items-center justify-center transition-all duration-500"
            style={{ transform: 'translateZ(140px)' }}
          >
            <div
              className="w-72 h-16 rounded-full border border-[#e87b46]/70 shadow-[0_0_60px_rgba(232,123,70,0.65)] flex items-center justify-center"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(232,123,70,0.4) 0%, rgba(212,175,55,0.2) 50%, rgba(4,4,6,0.95) 90%)',
                transform: 'rotateX(75deg)',
              }}
            />
          </div>

        </div>
      </div>

      {/* â”€â”€ GLOWING PILL BADGE BELOW CAROUSEL â”€â”€ */}
      <div className="flex justify-center mt-2 relative z-20">
        <motion.div
          key={activeProduct.id}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-[#e87b46]/60 bg-black/60 backdrop-blur-xl shadow-[0_0_25px_rgba(232,123,70,0.35)]"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#e87b46] shadow-[0_0_8px_#e87b46] animate-ping" />
          <span className="text-xs font-mono font-bold tracking-[0.22em] text-[#e87b46] uppercase">
            {activeProduct.badge || activeProduct.subtitle || 'PECHE BLANCHE'}
          </span>
          <span className="text-xs text-white/30 font-mono">|</span>
          <span className="text-xs font-semibold text-white/80">
            {activeProduct.title}
          </span>
        </motion.div>
      </div>

      {/* â”€â”€ SLEEK CONTROLS: VERTICAL ARROW BUTTONS & DOTS (PROGRESS BAR REMOVED) â”€â”€ */}
      <div className="max-w-md mx-auto px-6 mt-6 flex items-center justify-center gap-6 relative z-30">
        {/* Up Arrow Button */}
        <button
          onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
          disabled={activeIndex === 0}
          aria-label="Previous Product"
          className="w-10 h-10 rounded-full border border-white/15 bg-white/5 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 hover:border-white/40 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 shadow-lg"
        >
          <CaretUp size={20} weight="bold" />
        </button>

        {/* Navigation Dots (Horizontal Scroll Bar Line Removed per Requirement 4) */}
        <div className="flex items-center gap-2">
          {productsList.map((p, idx) => (
            <button
              key={p.id || idx}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Go to product ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-400 ${
                idx === activeIndex
                  ? 'w-7 bg-[#e87b46] shadow-[0_0_10px_#e87b46]'
                  : 'w-2 bg-white/20 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Down Arrow Button */}
        <button
          onClick={() => setActiveIndex((prev) => Math.min(productsList.length - 1, prev + 1))}
          disabled={activeIndex === productsList.length - 1}
          aria-label="Next Product"
          className="w-10 h-10 rounded-full border border-white/15 bg-white/5 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 hover:border-white/40 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 shadow-lg"
        >
          <CaretDown size={20} weight="bold" />
        </button>
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PREMIUM PHONE PRODUCT DETAIL PANEL
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <AnimatePresence>
        {isDetailOpen && modalProduct && (
          <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center md:p-6">

            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailOpen(false)}
              className="fixed inset-0 bg-black/82 backdrop-blur-2xl"
            />

            {/* Panel â€” bottom sheet mobile, centered card desktop */}
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              className="relative w-full md:max-w-[880px] rounded-t-[2rem] md:rounded-3xl overflow-hidden z-10 flex flex-col md:flex-row"
              style={{
                maxHeight: '95dvh',
                background: '#0e0e13',
                border: '1px solid rgba(255,255,255,0.09)',
                boxShadow: '0 -24px 80px rgba(0,0,0,0.96)',
              }}
            >
              {/* Mobile drag handle */}
              <div className="md:hidden w-full flex justify-center pt-3 flex-shrink-0 relative z-30">
                <div className="w-9 h-1 rounded-full bg-white/20" />
              </div>

              {/* Close */}
              <button
                onClick={() => setIsDetailOpen(false)}
                className="absolute top-4 right-4 z-40 w-9 h-9 rounded-full flex items-center justify-center text-white/55 hover:text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}
              >
                <X size={16} weight="bold" />
              </button>

              {/* â”€â”€â”€ LEFT: Image Showcase â”€â”€â”€ */}
              <div
                className="w-full md:w-[40%] flex-shrink-0 relative flex flex-col p-6 overflow-hidden border-b md:border-b-0 md:border-r"
                style={{ background: 'linear-gradient(160deg, #111119 0%, #0a0a0f 100%)', borderColor: 'rgba(255,255,255,0.07)' }}
              >
                {/* Accent ambient glow */}
                <div
                  className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 w-52 h-32 blur-3xl rounded-full opacity-35"
                  style={{ background: modalProduct.accentColor || '#e87b46' }}
                />

                {/* Tagline pill badge */}
                <span
                  className="self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-[0.22em] uppercase border mb-4 relative z-10"
                  style={{
                    color: modalProduct.accentColor || '#e87b46',
                    borderColor: `${modalProduct.accentColor || '#e87b46'}50`,
                    background: `${modalProduct.accentColor || '#e87b46'}12`,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: modalProduct.accentColor || '#e87b46' }} />
                  {modalProduct.subtitle || 'PIG STORE PRO'}
                </span>

                {/* Main product image with crossfade on color select */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-2">
                  <div className="relative w-full max-w-[190px] mx-auto">
                    {/* Glow puddle reflection */}
                    <div
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-7 blur-2xl rounded-full opacity-65"
                      style={{ background: modalProduct.accentColor || '#e87b46' }}
                    />
                    <motion.img
                      key={`${modalProduct.id}-img-${selectedColor}`}
                      initial={{ opacity: 0, scale: 0.86, y: 14 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                      src={modalProduct.image}
                      alt={modalProduct.title}
                      className="relative z-10 w-full max-h-[230px] object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.88)]"
                    />
                  </div>

                  {/* Star rating */}
                  <div className="flex items-center gap-1 mt-5">
                    {[...Array(5)].map((_, si) => (
                      <Star
                        key={si}
                        size={12}
                        weight={si < Math.floor(modalProduct.rating || 5) ? 'fill' : 'regular'}
                        className="text-amber-400"
                      />
                    ))}
                    <span className="text-[11px] text-white/45 ml-1.5 font-mono">
                      {modalProduct.rating} Â· {(modalProduct.reviewsCount || 0).toLocaleString('vi-VN')} Ä‘Ã¡nh giÃ¡
                    </span>
                  </div>
                </div>

                {/* Mini thumbnail gallery */}
                <div className="relative z-10 flex items-center justify-center gap-2 mt-4">
                  {[modalProduct.image, modalProduct.image, modalProduct.image].map((thumb, ti) => (
                    <button
                      key={ti}
                      className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 transition-all hover:scale-105 active:scale-95"
                      style={{
                        background: '#1a1a22',
                        border: ti === 0
                          ? `1.5px solid ${modalProduct.accentColor || '#e87b46'}`
                          : '1px solid rgba(255,255,255,0.12)',
                        boxShadow: ti === 0 ? `0 0 10px ${modalProduct.accentColor || '#e87b46'}40` : 'none',
                      }}
                    >
                      <img src={thumb} alt="" className="w-full h-full object-contain p-1.5 opacity-85" />
                    </button>
                  ))}
                </div>
              </div>

              {/* â”€â”€â”€ RIGHT: Info & Purchase â”€â”€â”€ */}
              <div className="w-full md:flex-1 flex flex-col overflow-y-auto">
                <div className="p-6 flex flex-col gap-4 flex-1">

                  {/* Product name */}
                  <motion.h3
                    key={modalProduct.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.28 }}
                    className="text-[1.5rem] leading-tight font-extrabold text-white tracking-tight"
                  >
                    {modalProduct.title}
                  </motion.h3>

                  {/* Pricing block */}
                  <div className="flex items-center gap-2.5 flex-wrap -mt-1">
                    <motion.span
                      key={`price-${modalProduct.id}-${selectedStorage}`}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.24 }}
                      className="text-[1.4rem] font-extrabold tabular-nums"
                      style={{ color: modalProduct.accentColor || '#e87b46' }}
                    >
                      {new Intl.NumberFormat('vi-VN').format(modalProduct.price)}Ä‘
                    </motion.span>
                    {modalProduct.originalPrice && (
                      <span className="text-sm text-white/35 line-through font-medium tabular-nums">
                        {new Intl.NumberFormat('vi-VN').format(modalProduct.originalPrice)}Ä‘
                      </span>
                    )}
                    {modalProduct.originalPrice && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                        style={{
                          background: `${modalProduct.accentColor || '#e87b46'}20`,
                          color: modalProduct.accentColor || '#e87b46',
                          border: `1px solid ${modalProduct.accentColor || '#e87b46'}45`,
                        }}
                      >
                        -{Math.round((1 - modalProduct.price / modalProduct.originalPrice) * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-white/50 leading-relaxed -mt-1">
                    {modalProduct.description}
                  </p>

                  {/* Spec chips 2x2 grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {(modalProduct.specs || []).slice(0, 4).map((s, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.025, y: -1 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-default"
                        style={{ background: '#191921', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: `${modalProduct.accentColor || '#e87b46'}18`,
                            color: modalProduct.accentColor || '#e87b46',
                          }}
                        >
                          {s.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] uppercase tracking-widest font-mono leading-none mb-0.5" style={{ color: 'rgba(255,255,255,0.32)' }}>
                            {s.label}
                          </p>
                          <p className="text-[11px] font-semibold truncate leading-tight" style={{ color: 'rgba(255,255,255,0.88)' }}>
                            {s.value}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Color selector */}
                  {modalProduct.colors && modalProduct.colors.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          MÃ€U Sáº®C
                        </p>
                        <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          {selectedColor}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {modalProduct.colors.map((c) => {
                          const colorDots = {
                            'Titan Sa Máº¡c': '#c9a96e', 'Titan Sa Máº¡c Gold': '#c9a96e',
                            'Titan Äen': '#2e2e36', 'Titan Tráº¯ng': '#e8e8ec',
                            'Titan Tá»± NhiÃªn': '#c0b9b0', 'XÃ¡m KhÃ´ng Gian': '#58585e',
                            'Báº¡c': '#c8cad4', 'Äen ÄÃªm': '#14141a',
                          };
                          const dot = colorDots[c] || '#888';
                          const isSel = selectedColor === c;
                          return (
                            <button
                              key={c}
                              onClick={() => setSelectedColor(c)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200"
                              style={isSel ? {
                                background: modalProduct.accentColor || '#e87b46',
                                border: `1px solid ${modalProduct.accentColor || '#e87b46'}`,
                                color: '#0a0a0a',
                                fontWeight: 700,
                                transform: 'scale(1.05)',
                                boxShadow: `0 0 14px ${modalProduct.accentColor || '#e87b46'}55`,
                              } : {
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                color: 'rgba(255,255,255,0.65)',
                              }}
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ background: dot, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)' }}
                              />
                              {c}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Storage selector */}
                  {modalProduct.storages && modalProduct.storages.length > 0 && (
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        DUNG LÆ¯á»¢NG
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {modalProduct.storages.map((s) => {
                          const isSel = selectedStorage === s;
                          return (
                            <button
                              key={s}
                              onClick={() => setSelectedStorage(s)}
                              className="px-4 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200"
                              style={isSel ? {
                                background: '#ffffff',
                                color: '#0a0a0a',
                                border: '1px solid #ffffff',
                                transform: 'scale(1.05)',
                                boxShadow: '0 0 16px rgba(255,255,255,0.2)',
                              } : {
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                color: 'rgba(255,255,255,0.65)',
                              }}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />

                  {/* CTA Buttons */}
                  <div className="flex gap-2.5">
                    {/* Secondary â€” add to cart */}
                    <button
                      onClick={handleAddToCart}
                      className="flex-[2] py-3 px-4 rounded-xl font-semibold text-[13px] text-white flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97]"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                    >
                      <ShoppingCart size={15} weight="duotone" />
                      ThÃªm vÃ o giá»
                    </button>

                    {/* Primary â€” buy now with shimmer glow */}
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleBuyNow}
                      className="flex-[3] py-3 px-5 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${modalProduct.accentColor || '#e87b46'} 0%, ${modalProduct.accentColor || '#e87b46'}bb 100%)`,
                        color: '#0a0a0a',
                        boxShadow: `0 0 28px ${modalProduct.accentColor || '#e87b46'}60, 0 4px 18px rgba(0,0,0,0.4)`,
                      }}
                    >
                      <motion.span
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.22) 50%, transparent 70%)',
                          backgroundSize: '250% 100%',
                        }}
                        animate={{ backgroundPosition: ['150% center', '-50% center'] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
                      />
                      <Lightning size={16} weight="fill" className="relative z-10" />
                      <span className="relative z-10">Mua ngay</span>
                    </motion.button>
                  </div>

                  {/* Toast notification */}
                  <AnimatePresence>
                    {toastMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-emerald-400 text-xs font-semibold"
                        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.28)' }}
                      >
                        <ShieldCheck size={15} weight="fill" />
                        {toastMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
