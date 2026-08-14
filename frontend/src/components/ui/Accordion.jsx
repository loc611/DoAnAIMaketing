import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Apple-style FAQ Accordion with Framer Motion animations
 */
export function AccordionItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="border-b border-white/5">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-white"
      >
        <span className="pr-4 text-lg font-medium text-white/90 md:text-xl">{question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="flex-shrink-0 text-2xl text-[#86868b]"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-base leading-relaxed text-[#86868b]">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Accordion({ items, className = '' }) {
  const [openIndex, setOpenIndex] = React.useState(null);

  return (
    <div className={`divide-y-0 ${className}`}>
      {items.map((item, i) => (
        <AccordionItem
          key={i}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === i}
          onClick={() => setOpenIndex(openIndex === i ? null : i)}
        />
      ))}
    </div>
  );
}
