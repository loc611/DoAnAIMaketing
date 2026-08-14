import React from 'react';
import { motion } from 'framer-motion';

export default function TypingIndicator() {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -5 },
  };

  const transition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: 'reverse',
    ease: 'easeInOut',
  };

  return (
    <div className="flex items-center gap-1.5 px-3 py-4 bg-[#2c2c2e] rounded-2xl rounded-tl-sm w-fit">
      <motion.div
        className="w-2 h-2 bg-[#86868b] rounded-full"
        variants={dotVariants}
        initial="initial"
        animate="animate"
        transition={{ ...transition, delay: 0 }}
      />
      <motion.div
        className="w-2 h-2 bg-[#86868b] rounded-full"
        variants={dotVariants}
        initial="initial"
        animate="animate"
        transition={{ ...transition, delay: 0.15 }}
      />
      <motion.div
        className="w-2 h-2 bg-[#86868b] rounded-full"
        variants={dotVariants}
        initial="initial"
        animate="animate"
        transition={{ ...transition, delay: 0.3 }}
      />
    </div>
  );
}
