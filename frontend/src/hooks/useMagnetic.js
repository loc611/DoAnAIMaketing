import { useRef, useCallback } from 'react';
import gsap from 'gsap';

/**
 * Hook: Magnetic button effect
 * Returns a ref and handlers to make any element attract toward the cursor.
 */
export default function useMagnetic(strength = 0.3) {
  const ref = useRef();

  const onMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    gsap.to(ref.current, { x, y, duration: 0.3, ease: 'power2.out' });
  }, [strength]);

  const onMouseLeave = useCallback(() => {
    if (!ref.current) return;
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
