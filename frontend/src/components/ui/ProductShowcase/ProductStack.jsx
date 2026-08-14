import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';
import ProductDescription from './ProductDescription';
import ProductSpecs from './ProductSpecs';

export default function ProductStack({ products, activeProductIndex, activeSceneIndex }) {
  const currentProduct = products[activeProductIndex];
  const peekProduct = products[activeProductIndex + 1]; // Sản phẩm kế tiếp peek mờ phía trên

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[560px]">

      {/* ── Peek card mờ phía trên (Hiển thị sản phẩm sắp tới giống mockup) ── */}
      {peekProduct && activeSceneIndex === 0 && (
        <div className="absolute -top-12 z-0 scale-90 opacity-40 transition-all duration-500">
          <ProductCard product={peekProduct} isPeekCard={true} />
        </div>
      )}

      {/* ── Stack Card Container ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentProduct.id}-scene-${activeSceneIndex}`}
          initial={{ opacity: 0, y: activeSceneIndex === 0 ? 40 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="w-full relative z-10 flex flex-col items-center"
        >
          {/* Tầng 1 — Hero Card (full card) */}
          {activeSceneIndex === 0 && (
            <ProductCard product={currentProduct} isStickyHeader={false} />
          )}

          {/* Tầng 2 — Mô Tả (Card thu nhỏ thành Sticky Header + Slide up Description) */}
          {activeSceneIndex === 1 && (
            <div className="w-full flex flex-col items-center">
              <ProductCard product={currentProduct} isStickyHeader={true} />
              <ProductDescription
                description={currentProduct.description}
                highlights={currentProduct.highlights}
              />
            </div>
          )}

          {/* Tầng 3 — Thông Số Kỹ Thuật (Sticky Header + Slide up Specs Grid) */}
          {activeSceneIndex === 2 && (
            <div className="w-full flex flex-col items-center">
              <ProductCard product={currentProduct} isStickyHeader={true} />
              <ProductSpecs specs={currentProduct.specs} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
