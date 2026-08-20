import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductModal from './ProductModal';
import styles from './PremiumProductGrid.module.css';
import { useAuthAction } from '../../hooks/useAuthAction';
import cameraImg from '@imga/iphone/camera.png';
import img16 from '@imga/iphone/iphone16promax.webp';
import img15 from '@imga/iphone/iphone15promax.jpg';
import img14 from '@imga/iphone/iphone14promax.jpg';
import img17Cam from '@imga/iphone/iphone-17-pro-cam.webp';
import img17XanhDam from '@imga/iphone/iphone-17-pro-xanh-dam.webp';
import img17Bac from '@imga/iphone/iphone-17-pro-bac.webp';
import img16SaMac from '@imga/iphone/iphone16promaxsamac.png';
import img16TuNhien from '@imga/iphone/iphone16promaxtunhien.png';
import img16Den from '@imga/iphone/iphone16promaxden.jpg';
import img16Trang from '@imga/iphone/iphone16promaxtrang.jpg';
import img15TuNhien from '@imga/iphone/iphone15promaxtunhien.png';
import img15Xanh from '@imga/iphone/iphone15promaxxanh.jpg';
import img15Trang from '@imga/iphone/iphone15promaxtrang.jpg';
import img15Den from '@imga/iphone/iphone15promaxden.jpg';
import img14Tim from '@imga/iphone/iphone14promaxtim.webp';
import img14Vang from '@imga/iphone/iphone14promaxvang.webp';
import img14Bac from '@imga/iphone/iphone14promaxbac.webp';
import img14Den from '@imga/iphone/iphone14promaxden.webp';

const PRODUCTS = [
  {
    id: 'iphone-17-pro-max',
    name: 'iPhone 17 Pro Max',
    price: 34999000,
    color: '#FF6B35', // Orange
    link: '/iphone-17-pro',
    image: cameraImg,
    colors: [
      { name: 'Cam Vũ Trụ', hex: '#FF6B35', image: img17Cam },
      { name: 'Xanh Đậm', hex: '#2A3441', image: img17XanhDam },
      { name: 'Bạc', hex: '#F0F2F2', image: img17Bac }
    ],
    storages: [
      { label: '256GB', priceMod: 0 },
      { label: '512GB', priceMod: 5000000 },
      { label: '1TB', priceMod: 10000000 }
    ]
  },
  {
    id: 'iphone-16-pro-max',
    name: 'iPhone 16 Pro Max',
    price: 29999000,
    color: '#FFFFFF', // White
    link: '/iphone-16-pro-max',
    image: img16,
    colors: [
      { name: 'Titan Trắng', hex: '#F2F1EC', image: img16Trang },
      { name: 'Titan Đen', hex: '#454341', image: img16Den },
      { name: 'Titan Tự Nhiên', hex: '#B5B4B1', image: img16TuNhien },
      { name: 'Titan Sa Mạc', hex: '#D4AF37', image: img16SaMac }
    ],
    storages: [
      { label: '256GB', priceMod: 0 },
      { label: '512GB', priceMod: 5000000 },
      { label: '1TB', priceMod: 10000000 }
    ]
  },
  {
    id: 'iphone-15-pro-max',
    name: 'iPhone 15 Pro Max',
    price: 24999000,
    color: '#D4AF37', // Gold
    link: '/iphone-15-pro-max',
    image: img15,
    colors: [
      { name: 'Titan Tự Nhiên', hex: '#B5B4B1', image: img15TuNhien },
      { name: 'Titan Xanh', hex: '#3B434A', image: img15Xanh },
      { name: 'Titan Trắng', hex: '#F2F1EC', image: img15Trang },
      { name: 'Titan Đen', hex: '#454341', image: img15Den }
    ],
    storages: [
      { label: '256GB', priceMod: 0 },
      { label: '512GB', priceMod: 5000000 },
      { label: '1TB', priceMod: 10000000 }
    ]
  },
  {
    id: 'iphone-14-pro-max',
    name: 'iPhone 14 Pro Max',
    price: 22999000,
    color: '#8B5CF6', // Purple
    link: '/iphone-14-pro-max',
    image: img14,
    colors: [
      { name: 'Tím Sẫm', hex: '#594F63', image: img14Tim },
      { name: 'Vàng', hex: '#F4E8CE', image: img14Vang },
      { name: 'Bạc', hex: '#F0F2F2', image: img14Bac },
      { name: 'Đen Không Gian', hex: '#4A4945', image: img14Den }
    ],
    storages: [
      { label: '128GB', priceMod: 0 },
      { label: '256GB', priceMod: 3000000 },
      { label: '512GB', priceMod: 8000000 },
      { label: '1TB', priceMod: 13000000 }
    ]
  }
];

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

export default function PremiumProductGrid() {
  const scrollRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dynamicProducts, setDynamicProducts] = useState(PRODUCTS);
  const requireAuth = useAuthAction();

  useEffect(() => {
    // Fetch products from backend
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/crm/products`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          // Format from backend to match frontend with robust fallback
          const mapped = data.data.map((p, idx) => {
            const fallbackStatic = PRODUCTS[idx] || PRODUCTS[0];
            return {
              id: p.id || fallbackStatic.id,
              name: p.name || fallbackStatic.name,
              price: Number(p.basePrice) || fallbackStatic.price,
              color: fallbackStatic.color || '#FFFFFF',
              link: `/product/${p.id || fallbackStatic.id}`,
              image: p.heroImage || fallbackStatic.image,
              colors: (p.variants && p.variants.length > 0)
                ? p.variants.map(v => ({ name: v.color, hex: '#cccccc', image: p.heroImage || fallbackStatic.image }))
                : fallbackStatic.colors,
              storages: (p.variants && p.variants.length > 0)
                ? [...new Set(p.variants.map(v => v.storage))].map(s => ({ label: s, priceMod: 0 }))
                : fallbackStatic.storages
            };
          });
          setDynamicProducts(mapped);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch dynamic CRM products, using static list:', err);
      });
  }, []);

  
  // Create 15 floating particles
  const particles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100 + '%',
    top: Math.random() * 100 + '%',
    animationDelay: Math.random() * 10 + 's',
    animationDuration: (10 + Math.random() * 10) + 's',
    size: (2 + Math.random() * 4) + 'px',
  }));

  // Intersection Observer for lazy loading cards
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.isVisible);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = containerRef.current?.querySelectorAll(`.${styles.productCard}`);
    cards?.forEach((card) => {
      card.classList.add(styles.isVisible);
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, [dynamicProducts]);



  const handleBuyClick = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    // Create ripple
    const btn = e.currentTarget;
    const ripple = document.createElement('span');
    ripple.className = styles.ripple;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Rotate max 10 degrees
    const rotateX = ((y - centerY) / centerY) * -10; 
    const rotateY = ((x - centerX) / centerX) * 10;
    
    card.style.setProperty('--rx', `${rotateX}deg`);
    card.style.setProperty('--ry', `${rotateY}deg`);
    card.style.setProperty('--x', `${x}px`);
    card.style.setProperty('--y', `${y}px`);
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.setProperty('--rx', `0deg`);
    card.style.setProperty('--ry', `0deg`);
    card.style.setProperty('--x', `-1000px`); // Move glare away
    card.style.setProperty('--y', `-1000px`);
  };

  return (
    <div className={styles.antygavytyContainer} ref={containerRef}>



      {/* ===== PRODUCT SCROLL WRAPPER ===== */}
      <div className={styles.productScrollWrapper}>
        <div className={styles.productScroll} ref={scrollRef}>
          {dynamicProducts.map((product, index) => (
            <Link 
              key={product.id} 
              to={product.link} 
              className={`${styles.productCard} ${index === 0 ? styles.isFirst : ''}`}
              data-product={product.id}
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className={styles.cardContent}>
                <div className={styles.productImageWrapper}>
                  <img src={product.image} alt={product.name} className={styles.productImage} />
                  <span className={styles.tooltip}>Xem chi tiết sản phẩm</span>
                </div>
                
                <h2 className={styles.productName}>{product.name}</h2>
                <p className={styles.productPrice}>{formatPrice(product.price)}</p>
                
                <div className={styles.btnGroup}>
                  <button 
                    className={styles.btnBuy} 
                    style={{ 
                      background: product.color,
                      color: product.id === 'iphone-16-pro-max' ? '#1A1A1A' : '#FFFFFF' 
                    }}
                    onClick={(e) => handleBuyClick(e, product)}
                  >
                    Mua ngay
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={selectedProduct} 
      />
    </div>
  );
}
