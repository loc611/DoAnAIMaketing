import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Hook: Scroll-triggered reveal animation
 * Automatically animates elements matching the selector when scrolled into view.
 */
export default function useScrollReveal(containerRef, animations = []) {
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      animations.forEach(({ selector, from, to, trigger, stagger, start = 'top 75%' }) => {
        gsap.fromTo(selector,
          from || { opacity: 0, y: 50 },
          {
            ...(to || { opacity: 1, y: 0 }),
            duration: 1,
            ease: 'power3.out',
            stagger: stagger || 0,
            scrollTrigger: {
              trigger: trigger || selector,
              start,
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, [containerRef, animations]);
}
