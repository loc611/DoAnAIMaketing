import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const categories = [
  { name: 'Mac', icon: <img src="/images/mac_nen.jpg" alt="Mac" className="w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] object-contain rounded-2xl" />, link: '/mac' },
  { name: 'iPhone', icon: <img src="/images/iphone_nen.jpg" alt="iPhone" className="w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] object-contain rounded-2xl" />, link: '/iphone' },
  { name: 'iPad', icon: <img src="/images/ipad_nen.jpg" alt="iPad" className="w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] object-contain rounded-2xl" />, link: '/ipad' }
];

const StoreCategoryNav = () => {
  return (
    <div className="w-full bg-[#08080a] py-8 sm:py-10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex overflow-x-auto gap-8 sm:gap-16 md:gap-24 justify-center items-center no-scrollbar snap-x snap-mandatory">
        {categories.map((cat, idx) => (
          <Link
            key={idx}
            to={cat.link}
            className="flex flex-col items-center gap-4 group snap-start min-w-[120px] sm:min-w-[140px]"
          >
            {/* Doppelrand Glass Category Icon Container */}
            <motion.div
              whileHover={{ scale: 1.08, y: -4 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] p-2.5 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/20 shadow-xl"
            >
              <div className="w-full h-full rounded-[2rem] bg-[#0d0d12] border border-white/5 flex items-center justify-center overflow-hidden p-2 shadow-inner">
                {cat.icon}
              </div>
            </motion.div>
            <span className="text-sm sm:text-base font-extrabold text-white/70 tracking-wide whitespace-nowrap group-hover:text-white transition-colors duration-300">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default StoreCategoryNav;
