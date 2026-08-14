import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from '@phosphor-icons/react';

const StoreCard = ({ 
  id,
  title, 
  subtitle, 
  description, 
  image, 
  price,
  darkText = false,
  size = 'large', // large, medium, small
  onClick,
  className = ''
}) => {
  const navigate = useNavigate();
  
  const sizeClasses = {
    large: 'w-full md:w-[420px] h-[520px]',
    medium: 'w-full md:w-[340px] h-[440px]',
    small: 'w-full md:w-[260px] h-[340px]'
  };

  return (
    <motion.div 
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={`relative cursor-pointer flex-shrink-0 group snap-start ${sizeClasses[size]} ${className}`}
    >
      {/* Outer Shell (Doppelrand Dual-Shell) */}
      <div className="absolute inset-0 p-2 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.4)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-white/10 group-hover:border-white/20 group-hover:shadow-[0_25px_60px_rgba(0,0,0,0.6)] group-hover:-translate-y-1.5">
        
        {/* Inner Core */}
        <div className="relative w-full h-full rounded-[calc(2.5rem-0.5rem)] overflow-hidden bg-[#12121a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] flex flex-col justify-between p-8">
          
          {/* Background Image Layer (Full Opacity & Vibrant Contrast) */}
          <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
            {image ? (
              <img 
                src={image} 
                alt={title || 'Product'} 
                className="w-full h-full object-cover object-center transition-transform duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105 opacity-100" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1c1c28] to-[#0d0d14]" />
            )}
            {/* Soft Gradient Vignette for Text Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12] via-[#0d0d12]/40 to-[#0d0d12]/70 pointer-events-none" />
          </div>

          {/* Header Content */}
          <div className="relative z-10 pointer-events-none">
            {subtitle && (
              <span className="inline-block px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest bg-black/60 border border-white/20 text-white/90 mb-3 backdrop-blur-md">
                {subtitle}
              </span>
            )}
            {title && (
              <h3 className="text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm font-medium text-white/75 mt-2 max-w-[280px] line-clamp-2 drop-shadow-sm">
                {description}
              </p>
            )}
          </div>

          {/* Footer Action */}
          <div className="relative z-10 flex items-center justify-between pointer-events-auto mt-auto pt-6 border-t border-white/15 backdrop-blur-sm bg-black/20 -mx-8 -mb-8 p-8">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/50">Giá từ</span>
              <span className="text-lg font-extrabold text-white tracking-tight">
                {price ? `${price.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
              </span>
            </div>

            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                if (id) navigate(`/product/${id}`);
                else if (onClick) onClick();
              }}
              className="group/btn flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#f0f0f3] active:scale-95 shadow-lg"
            >
              <span>Chi tiết</span>
              <span className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center transition-transform duration-400 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" weight="bold" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StoreCard;
