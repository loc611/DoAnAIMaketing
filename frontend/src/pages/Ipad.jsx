import React, { useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import AwwwardsButton from '../components/ui/AwwwardsButton';
import { Sparkle, Lightning, Cpu, DeviceTablet } from '@phosphor-icons/react';

gsap.registerPlugin(ScrollTrigger);

function AbstractIpadModel() {
  const meshRef = useRef();
  return (
    <mesh ref={meshRef} rotation={[0.2, 0.4, 0]}>
      <boxGeometry args={[3.2, 4.4, 0.1]} />
      <meshStandardMaterial color="#1a1a24" metalness={0.9} roughness={0.1} />
    </mesh>
  );
}

function M4ChipModel() {
  const meshRef = useRef();
  return (
    <mesh ref={meshRef} rotation={[0.4, 0.2, 0]}>
      <boxGeometry args={[1.8, 1.8, 0.2]} />
      <meshStandardMaterial color="#d15a20" metalness={0.95} roughness={0.05} />
    </mesh>
  );
}

function Ipad() {
  const containerRef = useRef();

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo('.ipad-hero-title',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.2 }
      );
      gsap.fromTo('.ipad-bento-item',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.ipad-specs-section', start: 'top 75%' }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-[#08080a] text-[#f3f3f6] pt-16 min-h-screen">

      {/* SECTION 1: HERO */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-20 text-center min-h-[90dvh]">
        {/* Radial Glow */}
        <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-radial from-[#d15a20]/15 via-transparent to-transparent blur-3xl" />

        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] font-semibold border border-white/10 bg-white/5 backdrop-blur-md mb-6 text-[#e87b46]">
          <Sparkle size={14} weight="fill" />
          <span>iPad Pro M4 • Thần Thái Đẳng Cấp</span>
        </div>

        <h1 className="ipad-hero-title text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-white max-w-5xl leading-tight">
          Mỏng Không Tưởng.{' '}
          <span className="bg-gradient-to-r from-white via-white/70 to-white/20 bg-clip-text text-transparent">
            Sức Mạnh Chip M4.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg md:text-xl text-white/60 font-medium leading-relaxed">
          Thiết kế siêu mỏng 5.1mm mỏng nhất lịch sử Apple. Màn hình Ultra Retina XDR Tandem OLED tiên tiến nhất thế giới.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-5 z-10">
          <AwwwardsButton href="/pre-order" className="bg-white text-black hover:bg-[#f0f0f3]">
            Đặt Hàng Ngay
          </AwwwardsButton>
        </div>

        {/* 3D Model Interactive View */}
        <div className="w-full h-[450px] relative mt-12 cursor-move">
          <Canvas dpr={[1, 1.5]} gl={{ powerPreference: 'high-performance', antialias: true }} camera={{ position: [0, 0, 8], fov: 45 }}>
            <Environment preset="city" />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 10]} intensity={1.5} />
            <AbstractIpadModel />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} />
          </Canvas>
        </div>
      </section>

      {/* SECTION 2: INTRO BANNER */}
      <section className="py-28 px-6 bg-[#0d0d12] border-y border-white/10 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6 text-white">
            Màn Hình Ultra Retina XDR. <br />
            <span className="text-[#e87b46]">Công Nghệ Tandem OLED Đột Phá.</span>
          </h2>
          <p className="text-lg md:text-xl text-white/60 leading-relaxed font-medium">
            Hai dải ánh sáng OLED được kết hợp hoàn hảo để mang lại độ sáng cực đại 1600 nits chưa từng có, cho màu đen tuyệt đối và độ chuẩn xác màu chuyên nghiệp.
          </p>
        </div>
      </section>

      {/* SECTION 3: TECH SPECS (DOPPELRAND BENTO GRID) */}
      <section className="ipad-specs-section py-28 px-6 max-w-[1400px] mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[11px] uppercase font-bold tracking-widest text-[#e87b46] block mb-2">Đột Phá Kỹ Thuật</span>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Hiệu Năng M4. <span className="text-white/40">Vượt mọi giới hạn.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          {/* Card M4 Chip */}
          <div className="lg:col-span-8 doppelrand-shell ipad-bento-item">
            <div className="doppelrand-core p-10 flex flex-col md:flex-row items-center justify-between min-h-[380px] gap-8">
              <div className="flex-1">
                <div className="text-4xl text-[#e87b46] mb-4">
                  <Cpu weight="duotone" />
                </div>
                <h3 className="text-3xl font-extrabold text-white mb-3 tracking-tight">Kiến Trúc Chip M4 Thế Hệ Mới</h3>
                <p className="text-white/60 text-sm leading-relaxed max-w-md">
                  Được chế tác trên tiến trình 3nm thế hệ thứ 2. Xử lý các tác vụ AI và đồ họa nặng hơn 4 lần so với chip M2.
                </p>
              </div>
              <div className="w-48 h-48 relative rounded-2xl overflow-hidden cursor-move border border-white/10">
                <Canvas dpr={[1, 1.5]} gl={{ powerPreference: 'high-performance', antialias: true }} camera={{ position: [0, 0, 5], fov: 40 }}>
                  <Environment preset="studio" />
                  <ambientLight intensity={1} />
                  <directionalLight position={[5, 5, 5]} intensity={2} />
                  <M4ChipModel />
                  <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.5} />
                </Canvas>
              </div>
            </div>
          </div>

          {/* Card Apple Pencil Pro */}
          <div className="lg:col-span-4 doppelrand-shell ipad-bento-item">
            <div className="doppelrand-core p-10 flex flex-col justify-between min-h-[380px]">
              <div className="text-4xl text-purple-400 mb-6">
                <DeviceTablet weight="duotone" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-1">Tương tác ma thuật</span>
                <h3 className="text-3xl font-extrabold text-white mb-3 tracking-tight">Apple Pencil Pro</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Cảm ứng bóp phản hồi haptic, xoay thân bút để đổi cọ vẽ và định vị Tìm qua Find My.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 4: CTA */}
      <section className="py-24 px-6 bg-[#050508] border-t border-white/10 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-white mb-6">
            Sở Hữu iPad Pro M4 Ngay Hôm Nay
          </h2>
          <div className="flex justify-center gap-4">
            <AwwwardsButton href="/pre-order" className="bg-white text-black hover:bg-[#f0f0f3]">
              Đăng Ký Tư Vấn Mua Hàng
            </AwwwardsButton>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Ipad;
