import React, { useRef } from 'react';
import gsap from 'gsap';

/**
 * Apple-style Pill Button with Magnetic effect
 * @param {string} variant - 'primary' | 'secondary' | 'outline' | 'ghost'
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  href, 
  className = '',
  magnetic = true,
  ...props 
}) {
  const btnRef = useRef();

  const handleMagnet = (e) => {
    if (!magnetic || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
    gsap.to(btnRef.current, { x, y, duration: 0.3, ease: 'power2.out' });
  };

  const handleLeave = () => {
    if (!magnetic || !btnRef.current) return;
    gsap.to(btnRef.current, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
  };

  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-400 hover:shadow-lg hover:shadow-blue-500/25',
    secondary: 'bg-white text-black hover:bg-gray-200',
    outline: 'border border-blue-500/50 text-blue-400 hover:border-blue-400 hover:bg-blue-500/10',
    ghost: 'text-blue-400 hover:text-blue-300',
    accent: 'bg-apple-accent text-white hover:bg-apple-accent-light hover:shadow-lg hover:shadow-apple-accent/25',
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-7 py-3 text-sm',
    lg: 'px-9 py-4 text-base',
  };
  const base = `inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`;

  const Tag = href ? 'a' : 'button';

  return (
    <Tag
      ref={btnRef}
      href={href}
      className={base}
      onMouseMove={handleMagnet}
      onMouseLeave={handleLeave}
      {...props}
    >
      {children}
    </Tag>
  );
}
