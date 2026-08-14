/**
 * AnimatedText.jsx
 * Animate từng từ hoặc từng ký tự khi element vào viewport.
 * 
 * Cách dùng:
 *   <AnimatedText text="iPhone 17 Pro Max" type="word" className="hero-title-large" />
 *   <AnimatedText text="Mỏng nhất từ trước đến nay." type="char" className="story-title" delay={200} />
 */
import React, { useEffect, useRef, useMemo } from 'react';

export default function AnimatedText({
  text = '',
  type = 'word',      // 'word' | 'char'
  className = '',
  tag: Tag = 'h2',
  delay = 0,          // base delay ms trước khi bắt đầu
  stagger = 60,       // ms giữa mỗi từ/ký tự
  threshold = 0.2,    // IntersectionObserver threshold
}) {
  const ref = useRef(null);

  // Chia text thành mảng tokens (word hoặc char)
  const tokens = useMemo(() => {
    if (type === 'word') {
      return text.split(' ').filter(Boolean);
    }
    return text.split('');
  }, [text, type]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const spans = el.querySelectorAll('.token-unit');

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          spans.forEach((span, i) => {
            setTimeout(() => {
              span.classList.add('is-animated');
            }, delay + i * stagger);
          });
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, stagger, threshold]);

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {tokens.map((token, i) => (
        <span
          key={i}
          className={`text-clip-wrapper${type === 'word' ? '' : ''}`}
          style={{ display: type === 'word' ? 'inline-block' : 'inline-block', marginRight: type === 'word' ? '0.3em' : '0' }}
        >
          <span className={`token-unit ${type === 'word' ? 'word' : 'char'}`}>
            {token === ' ' ? '\u00A0' : token}
          </span>
        </span>
      ))}
    </Tag>
  );
}
