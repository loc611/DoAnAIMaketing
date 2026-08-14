import React, { useRef } from 'react';
import gsap from 'gsap';

/**
 * Apple-style 3D Tilt Card with glow cursor follower
 * Wraps children in an interactive card with perspective tilt on mouse move.
 */
export default function Card({
  children,
  className = '',
  tilt = true,
  glow = true,
  glowColor = 'rgba(100, 120, 255, 0.15)',
  ...props
}) {
  const cardRef = useRef();

  const handleMove = (e) => {
    if (!tilt || !cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // 3D tilt
    gsap.to(card, {
      rotateX: y * -10, rotateY: x * 10,
      transformPerspective: 800, scale: 1.03,
      duration: 0.25, ease: 'power1.out'
    });

    // Inner image parallax
    const img = card.querySelector('img');
    if (img) {
      gsap.to(img, {
        x: x * -12, y: y * -12, scale: 1.06,
        duration: 0.25, ease: 'power1.out'
      });
    }

    // Glow follower
    if (glow) {
      const glowEl = card.querySelector('.card-glow');
      if (glowEl) {
        gsap.to(glowEl, {
          x: (e.clientX - rect.left) - 150,
          y: (e.clientY - rect.top) - 150,
          opacity: 1, duration: 0.3
        });
      }
    }
  };

  const handleLeave = () => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.6, ease: 'power3.out' });

    const img = card.querySelector('img');
    if (img) gsap.to(img, { x: 0, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' });

    const glowEl = card.querySelector('.card-glow');
    if (glowEl) gsap.to(glowEl, { opacity: 0, duration: 0.4 });
  };

  return (
    <div
      ref={cardRef}
      className={`group relative overflow-hidden rounded-3xl border border-white/5 bg-[#1c1c1e] transition-colors hover:border-white/10 ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...props}
    >
      {/* Glow cursor follower */}
      {glow && (
        <div
          className="card-glow pointer-events-none absolute z-[1] h-[300px] w-[300px] rounded-full opacity-0"
          style={{ background: `radial-gradient(circle, ${glowColor}, transparent 70%)` }}
        />
      )}
      {children}
    </div>
  );
}
