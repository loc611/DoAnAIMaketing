import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

const StoreCarousel = ({ title, items, renderItem }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [items]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full py-12 relative overflow-hidden bg-[#08080a] text-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mb-8 flex justify-between items-end">
        {title && (
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">
            {title}
          </h2>
        )}
        
        {/* Navigation Buttons */}
        <div className="hidden md:flex gap-3">
          <button 
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              canScrollLeft ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10' : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
            }`}
          >
            <CaretLeft size={18} weight="bold" />
          </button>
          <button 
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              canScrollRight ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10' : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
            }`}
          >
            <CaretRight size={18} weight="bold" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-6 px-4 sm:px-6 pb-8 overflow-x-auto no-scrollbar snap-x snap-mandatory"
        style={{ paddingLeft: 'max(16px, calc((100vw - 1400px) / 2))', paddingRight: 'max(16px, calc((100vw - 1400px) / 2))' }}
      >
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {renderItem(item)}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StoreCarousel;
