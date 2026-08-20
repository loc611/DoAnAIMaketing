import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ShoppingCart, Zap, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

// Register GSAP Plugin
gsap.registerPlugin(ScrollTrigger);

const PremiumProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, openCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [activeColor, setActiveColor] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/crm/products/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const p = data.data;
          // Map backend product to expected format
          const mappedProduct = {
            id: p.id,
            name: p.name,
            tagline: p.description || 'Tuyệt Tác Huyền Thoại.',
            price: String(p.basePrice || 0),
            defaultColorName: p.variants?.[0]?.color || 'Mặc định',
            defaultAccentColor: '#FF6B35',
            buttonTextColor: '#FFFFFF',
            designDescription: p.design?.description || 'Thiết kế tinh xảo.',
            design: p.design?.name || 'TITANIUM DESIGN',
            specs: {
              chip: p.performance?.chipName || 'A19 Pro',
              ram: '8GB',
              storage: p.variants?.[0]?.storage || '256GB',
              display: '6.9" Super Retina XDR'
            },
            camera: {
              main: p.camera?.main || '48MP',
              ultraWide: p.camera?.ultraWide || '48MP',
              telephoto: p.camera?.telephoto || '48MP 5x',
              zoom: p.camera?.zoom || 'Optical zoom 5x'
            },
            performance: {
              chipName: p.performance?.chipName || 'A19 Pro',
              cpuCores: parseInt(p.performance?.cpuCores) || 6,
              gpuCores: parseInt(p.performance?.gpuCores) || 6,
              batteryCapacity: parseInt(p.performance?.batteryCapacity) || 4422,
              chargingSpeed: parseInt(p.performance?.chargingSpeed) || 27
            },
            colors: p.variants?.length ? p.variants.map(v => ({
              name: v.color || 'Mặc định',
              hex: v.color?.toLowerCase().includes('đỏ') ? '#ff0000' : 
                   v.color?.toLowerCase().includes('cam') ? '#FF6B35' :
                   v.color?.toLowerCase().includes('xanh') ? '#2A3441' :
                   v.color?.toLowerCase().includes('đen') ? '#454341' :
                   v.color?.toLowerCase().includes('tự nhiên') ? '#B5B4B1' :
                   v.color?.toLowerCase().includes('trắng') ? '#F2F1EC' :
                   v.color?.toLowerCase().includes('sa mạc') ? '#D4AF37' : '#cccccc',
              image: v.image || p.heroImage,
              slug: p.id
            })) : [{
              name: 'Mặc định',
              hex: '#cccccc',
              image: p.heroImage,
              slug: p.id
            }]
          };
          setProduct(mappedProduct);
        } else {
          setError(true);
        }
      })
      .catch(err => {
        console.error(err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);
  
  // Stats counter refs
  const priceRef = useRef(null);
  const batteryRef = useRef(null);
  const chargingRef = useRef(null);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-600 border-t-[var(--accent,#FF6B35)] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  // Fallback if product not found
  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-widest">SẢN PHẨM KHÔNG TỒN TẠI</h1>
          <Link to="/" className="mt-8 inline-block border border-white/20 px-6 py-3 transition-colors hover:bg-white hover:text-black">
            Quay lại cửa hàng
          </Link>
        </div>
      </div>
    );
  }

  // Initialize active color on load
  useEffect(() => {
    const defaultColor = product.colors.find(c => c.name === product.defaultColorName) || product.colors[0];
    setActiveColor(defaultColor);
  }, [product]);

  // GSAP Animations for Numbers
  useLayoutEffect(() => {
    if (!product) return;
    
    let ctx = gsap.context(() => {
      // Animate Price
      if (priceRef.current) {
        const rawPrice = parseInt(product.price.replace(/\D/g, ''));
        const obj = { val: 0 };
        gsap.to(obj, {
          val: rawPrice,
          duration: 2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: priceRef.current,
            start: "top 80%",
          },
          onUpdate: () => {
            if (priceRef.current) {
              priceRef.current.innerHTML = Math.floor(obj.val).toLocaleString('vi-VN') + '₫';
            }
          }
        });
      }

      // Animate Battery Capacity
      if (batteryRef.current) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: product.performance.batteryCapacity,
          duration: 2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: batteryRef.current,
            start: "top 85%",
          },
          onUpdate: () => {
            if (batteryRef.current) {
              batteryRef.current.innerHTML = Math.floor(obj.val).toLocaleString('vi-VN') + ' mAh';
            }
          }
        });
      }

      // Animate Charging Speed
      if (chargingRef.current) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: product.performance.chargingSpeed,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: chargingRef.current,
            start: "top 85%",
          },
          onUpdate: () => {
            if (chargingRef.current) {
              chargingRef.current.innerHTML = Math.floor(obj.val) + 'W';
            }
          }
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [product]);

  const cssVars = {
    '--accent': activeColor ? activeColor.hex : product.defaultAccentColor,
    '--btn-text': product.buttonTextColor,
  };

  const handleColorClick = (color) => {
    setActiveColor(color);
    if (color.slug !== slug) {
      // Navigate visually but keep the smooth transition
      setTimeout(() => navigate(`/product/${color.slug}`), 300);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen bg-[#0A0A0A] text-white selection:bg-[var(--accent)] selection:text-[var(--btn-text)]"
      style={{
        ...cssVars,
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        .accent-glow {
          box-shadow: 0 0 40px var(--accent);
          opacity: 0.15;
        }
        
        .btn-primary {
          background-color: var(--accent);
          color: var(--btn-text);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-primary:hover {
          transform: scale(1.05);
          box-shadow: 0 0 20px var(--accent);
        }
        
        .btn-secondary {
          position: relative;
          color: white;
          transition: all 0.3s ease;
        }
        .btn-secondary::after {
          content: '';
          position: absolute;
          width: 0;
          height: 1px;
          bottom: -4px;
          left: 0;
          background-color: var(--accent);
          transition: width 0.3s ease;
        }
        .btn-secondary:hover {
          transform: translateX(4px);
        }
        .btn-secondary:hover::after {
          width: 100%;
        }

        .lens-pulse:hover {
          box-shadow: 0 0 15px var(--accent) inset, 0 0 20px var(--accent);
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-20">
        {/* Volumetric Light */}
        <div className="pointer-events-none absolute left-0 top-[-20%] h-[140%] w-[80%] -rotate-12 bg-gradient-to-br from-white/5 via-transparent to-transparent blur-[120px]" />
        <div className="accent-glow pointer-events-none absolute right-[10%] top-[20%] h-[400px] w-[400px] rounded-full blur-[100px]" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="z-10 text-center"
        >
          <h1 className="text-5xl font-bold tracking-tight md:text-7xl lg:text-[100px] lg:leading-none">
            {product.name}
          </h1>
          <p className="mt-6 text-xl font-light tracking-wide text-gray-400 md:text-2xl">
            {product.tagline}
          </p>
          <div className="mt-8 text-2xl text-[var(--accent)] md:text-4xl">
            <span ref={priceRef}>0₫</span>
          </div>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button 
              onClick={() => {
                const cleanPrice = parseInt(String(product.price).replace(/\D/g, '')) || 0;
                addToCart({
                  id: product.id,
                  name: product.name,
                  price: cleanPrice,
                  color: activeColor?.name || product.defaultColorName || 'Mặc định',
                  storage: product.specs?.storage || '256GB',
                  image: activeColor?.image || product.colors?.[0]?.image || '/images/iphone17_pro/cosmic_orange_iphone_hero.png',
                  quantity: 1
                });
                navigate('/checkout');
              }}
              className="btn-primary rounded-full px-8 py-4 text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-all"
            >
              <Zap size={16} />
              Mua ngay
            </button>
            <button 
              onClick={() => {
                const cleanPrice = parseInt(String(product.price).replace(/\D/g, '')) || 0;
                addToCart({
                  id: product.id,
                  name: product.name,
                  price: cleanPrice,
                  color: activeColor?.name || product.defaultColorName || 'Mặc định',
                  storage: product.specs?.storage || '256GB',
                  image: activeColor?.image || product.colors?.[0]?.image || '/images/iphone17_pro/cosmic_orange_iphone_hero.png',
                  quantity: 1
                });
                openCart();
              }}
              className="rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white px-8 py-4 text-sm font-semibold tracking-wider uppercase flex items-center justify-center gap-2 backdrop-blur-sm transition-all"
            >
              <ShoppingCart size={16} />
              Thêm vào giỏ hàng
            </button>
          </div>
        </motion.div>

        {/* Hero Image / Product Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="z-10 mt-16 group"
        >
          <div className="relative flex h-[320px] w-[220px] sm:h-[420px] sm:w-[280px] md:h-[480px] md:w-[320px] items-center justify-center overflow-hidden rounded-[3rem] border border-white/10 bg-[#111] shadow-2xl transition-transform duration-700 ease-out group-hover:scale-105">
             {/* Abstract Phone Screen Background */}
             <div className="absolute inset-1 rounded-[2.8rem] bg-black overflow-hidden flex items-center justify-center">
               <div className="absolute top-0 h-full w-full bg-gradient-to-b from-[var(--accent)]/20 to-transparent opacity-50" />
               <div className="absolute left-1/2 top-4 h-6 w-20 -translate-x-1/2 rounded-full bg-black shadow-[0_0_10px_rgba(255,255,255,0.1)] z-20" />
               
               {activeColor?.image ? (
                 <img 
                   src={activeColor.image.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL || ''}${activeColor.image}` : activeColor.image} 
                   alt={product.name}
                   className="w-full h-full object-contain p-6 relative z-10 transition-all duration-500 drop-shadow-2xl" 
                 />
               ) : (
                 <div className="text-6xl drop-shadow-2xl opacity-80 z-10">📱</div>
               )}
             </div>
          </div>
        </motion.div>
      </section>

      {/* Design Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-32">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid gap-12 lg:grid-cols-2 lg:items-center"
        >
          <div>
            <h2 className="text-4xl font-bold tracking-widest uppercase text-white/90 md:text-6xl">
              Thiết kế
            </h2>
            <div className="mt-8 h-[1px] w-24 bg-[var(--accent)]" />
            <p className="mt-8 text-xl font-light leading-relaxed text-gray-400">
              {product.designDescription}
            </p>
            <p className="mt-4 font-mono text-sm tracking-widest text-[var(--accent)] uppercase">
              {product.design}
            </p>
          </div>
          
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-[#111] border border-white/5">
            {/* Abstract Design Representation */}
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="absolute h-[150%] w-[10px] rotate-45 bg-[var(--accent)] opacity-20 blur-xl" />
               <div className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-30" />
               <div className="h-64 w-64 rounded-full border border-white/10" />
               <div className="absolute h-48 w-48 rounded-full border border-[var(--accent)]/30" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Key Specs Section */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <motion.div
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, margin: "-100px" }}
           variants={{
             visible: { transition: { staggerChildren: 0.1 } },
             hidden: {}
           }}
           className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8"
        >
          {[
            { label: 'Chip', value: product.specs.chip, icon: '⚡' },
            { label: 'RAM', value: product.specs.ram, icon: '🧠' },
            { label: 'Lưu trữ', value: product.specs.storage, icon: '💾' },
            { label: 'Màn hình', value: product.specs.display, icon: '✨' },
          ].map((spec, idx) => (
            <motion.div 
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
              className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center backdrop-blur-sm transition-colors hover:bg-white/[0.04]"
            >
              <div className="text-3xl opacity-80">{spec.icon}</div>
              <p className="mt-4 text-sm font-medium tracking-wider text-gray-500 uppercase">{spec.label}</p>
              <p className="mt-2 font-light text-white/90">{spec.value}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Camera System Section */}
      <section className="relative mx-auto max-w-7xl px-6 py-32 overflow-hidden">
        <div className="text-center">
          <h2 className="text-4xl font-bold tracking-widest uppercase md:text-6xl">Camera</h2>
          <div className="mx-auto mt-6 h-[1px] w-16 bg-[var(--accent)]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mt-20 flex flex-col items-center justify-center gap-16 md:flex-row md:gap-32"
        >
          {/* Abstract Camera Module */}
          <div className="relative h-64 w-64 rounded-[3rem] bg-[#111] p-6 border border-white/10 shadow-2xl">
             <div className="absolute left-8 top-8 h-20 w-20 rounded-full bg-black border-2 border-[#222] lens-pulse transition-all duration-500" />
             <div className="absolute right-8 top-20 h-20 w-20 rounded-full bg-black border-2 border-[#222] lens-pulse transition-all duration-500" />
             <div className="absolute bottom-8 left-16 h-20 w-20 rounded-full bg-black border-2 border-[#222] lens-pulse transition-all duration-500" />
          </div>
          
          <div className="flex w-full max-w-md flex-col gap-6">
            <div className="border-b border-white/10 pb-6">
              <p className="text-sm tracking-widest text-[var(--accent)] uppercase">Chính</p>
              <p className="mt-2 text-3xl font-light">{product.camera.main}</p>
            </div>
            <div className="border-b border-white/10 pb-6">
              <p className="text-sm tracking-widest text-[var(--accent)] uppercase">Góc siêu rộng</p>
              <p className="mt-2 text-3xl font-light">{product.camera.ultraWide}</p>
            </div>
            <div className="border-b border-white/10 pb-6">
              <p className="text-sm tracking-widest text-[var(--accent)] uppercase">Telephoto</p>
              <p className="mt-2 text-3xl font-light">{product.camera.telephoto}</p>
            </div>
            <div className="pt-2">
              <p className="font-mono text-sm tracking-widest text-gray-400">{product.camera.zoom}</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Performance & Battery */}
      <section className="bg-[#111]/50 py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 md:grid-cols-2 border border-white/5 rounded-3xl p-8 md:p-16 bg-[#0A0A0A]">
            
            {/* Performance */}
            <div className="flex flex-col justify-center">
              <h3 className="text-2xl font-bold tracking-widest uppercase">Hiệu năng</h3>
              <p className="mt-4 text-5xl font-light text-[var(--accent)]">{product.performance.chipName}</p>
              <div className="mt-8 flex gap-8">
                <div>
                  <p className="text-4xl font-bold">{product.performance.cpuCores}</p>
                  <p className="mt-2 text-sm text-gray-500 uppercase">Lõi CPU</p>
                </div>
                <div className="w-[1px] bg-white/10" />
                <div>
                  <p className="text-4xl font-bold">{product.performance.gpuCores}</p>
                  <p className="mt-2 text-sm text-gray-500 uppercase">Lõi GPU</p>
                </div>
              </div>
            </div>

            {/* Battery */}
            <div className="flex flex-col justify-center">
              <h3 className="text-2xl font-bold tracking-widest uppercase">Pin & Sạc</h3>
              <div className="mt-8 grid gap-8">
                <div>
                  <p className="text-sm tracking-widest text-gray-500 uppercase">Dung lượng</p>
                  <p className="mt-2 text-4xl font-light text-white/90">
                    <span ref={batteryRef}>0 mAh</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm tracking-widest text-gray-500 uppercase">Sạc nhanh</p>
                  <p className="mt-2 text-4xl font-light text-[var(--accent)]">
                    <span ref={chargingRef}>0W</span>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Color Options */}
      <section className="mx-auto max-w-7xl px-6 py-32 text-center">
        <h2 className="text-3xl font-bold tracking-widest uppercase md:text-5xl">Chọn màu sắc</h2>
        <p className="mt-6 text-xl font-light text-gray-400">{activeColor?.name}</p>
        
        <div className="mt-12 flex flex-wrap justify-center gap-6">
          {product.colors.map((color, idx) => {
            const isActive = activeColor?.hex === color.hex;
            return (
              <button
                key={idx}
                onClick={() => handleColorClick(color)}
                className={`relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 ${isActive ? 'scale-110' : 'hover:scale-105'}`}
                style={{
                  backgroundColor: color.hex,
                  boxShadow: isActive ? `0 0 0 2px #0A0A0A, 0 0 0 4px ${color.hex}` : 'none'
                }}
                aria-label={`Select ${color.name}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeColorRing"
                    className="absolute -inset-2 rounded-full border border-[var(--accent)] opacity-50"
                  />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Compare & Navigate */}
      <section className="border-t border-white/10 bg-[#0A0A0A] py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 md:flex-row">
          <Link to="/" className="btn-secondary text-sm tracking-widest uppercase">
            ← Quay lại
          </Link>
          <Link to="/compare" className="btn-primary rounded-full px-8 py-3 text-sm font-medium tracking-widest uppercase">
            So sánh cấu hình
          </Link>
        </div>
      </section>

    </div>
  );
};

export default PremiumProductDetail;
