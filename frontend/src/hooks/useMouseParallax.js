import { useRef, useCallback } from 'react';
import gsap from 'gsap';

/**
 * Hook: Mouse parallax effect for hero images
 * Returns a ref to attach to the element and a handler for the container.
 */
export default function useMouseParallax(strength = 25) {
  const elementRef = useRef();

  const handleMouseMove = useCallback((e) => {
    if (!elementRef.current) return;
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * strength;
    const y = (e.clientY / innerHeight - 0.5) * strength;
    gsap.to(elementRef.current, { x, y, duration: 0.8, ease: 'power2.out' });
  }, [strength]);

  return { elementRef, handleMouseMove };
}
