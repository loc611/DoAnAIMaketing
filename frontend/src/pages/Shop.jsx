import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductModal from '../components/ui/ProductModal';
import { ShoppingCart, Heart } from 'lucide-react';
import AnimatedText from '../components/ui/AnimatedText';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CATEGORIES = ['Tất cả', 'iPhone', 'Mac', 'iPad', 'Watch', 'Phụ kiện'];

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/crm/products`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          // Map data
          const mapped = data.data.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category || 'Khác',
            price: Number(p.basePrice),
            image: p.heroImage ? (p.heroImage.startsWith('/uploads') ? `${API_BASE}${p.heroImage}` : p.heroImage) : '/images/iphone_hero_light.png',
            originalPrice: Number(p.basePrice) * 1.15, // fake original price for display
            colors: p.variants ? p.variants.map(v => ({ name: v.color, hex: '#cccccc', image: p.heroImage })) : [],
            storages: p.variants ? [...new Set(p.variants.map(v => v.storage))].map(s => ({ label: s, priceMod: 0 })) : []
          }));
          setProducts(mapped);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredProducts = activeCategory === 'Tất cả' 
    ? products 
    : products.filter(p => p.category.toLowerCase().includes(activeCategory.toLowerCase()));

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleBuyClick = (e, product) => {
    e.preventDefault();
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#040406] text-white pt-24 pb-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="mb-10 text-center">
          <AnimatedText
            text="Mua Sắm Mọi Sản Phẩm."
            type="word"
            tag="h1"
            className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white mb-4"
            stagger={50}
          />
          <p className="text-gray-400 text-lg">Lựa chọn các siêu phẩm công nghệ hàng đầu.</p>
        </div>

        {/* Categories */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-12 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === cat 
                  ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {loading ? (
           <div className="flex justify-center items-center h-64">
             <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
           </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            Không tìm thấy sản phẩm nào trong danh mục này.
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={product.id}
                  className="bg-[#0f0f13] border border-white/10 rounded-2xl p-4 flex flex-col group hover:border-white/20 hover:-translate-y-1 transition-all"
                >
                  <div className="relative aspect-square mb-4 bg-white/5 rounded-xl overflow-hidden flex items-center justify-center p-4">
                    <img src={product.image} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    <button className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-md rounded-full text-white/50 hover:text-red-500 transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-base md:text-lg font-semibold text-white mb-1 line-clamp-2">{product.name}</h3>
                    <div className="mt-auto pt-4 flex items-end justify-between">
                      <div>
                        <div className="text-sm text-gray-500 line-through mb-1">{formatPrice(product.originalPrice)}</div>
                        <div className="text-red-500 font-bold text-lg md:text-xl">{formatPrice(product.price)}</div>
                      </div>
                      <button 
                        onClick={(e) => handleBuyClick(e, product)}
                        className="bg-white/10 hover:bg-white text-white hover:text-black p-3 rounded-xl transition-all"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={selectedProduct} 
      />
    </div>
  );
}
