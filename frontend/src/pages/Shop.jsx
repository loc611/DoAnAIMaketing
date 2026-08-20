import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  RefreshCw,
  CreditCard,
  Truck,
  Star,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle2,
  Sparkles,
  Zap,
  Tag,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  Layers,
  Cpu,
  Monitor,
  Flame,
  X,
  Bell,
  Send,
  Check,
  Smartphone
} from 'lucide-react';
import {
  PROMO_BANNERS,
  TRUST_FEATURES,
  FAQ_ITEMS
} from '../data/appleProductsCatalog';

const SERIES_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'iPhone 17 Series', label: 'iPhone 17 Series' },
  { id: 'iPhone 16 Series', label: 'iPhone 16 Series' },
  { id: 'iPhone 15 Series', label: 'iPhone 15 Series' },
  { id: 'iPhone 14 Series', label: 'iPhone 14 Series' },
  { id: 'iPhone 13 Series', label: 'iPhone 13' },
  { id: 'Mac', label: 'Mac & MacBook' },
  { id: 'iPad', label: 'iPad' },
  { id: 'Watch', label: 'Apple Watch' },
  { id: 'Phụ kiện', label: 'Phụ kiện Apple' }
];

const PRICE_RANGES = [
  { id: 'all', label: 'Tất cả mức giá' },
  { id: 'under-15', label: 'Dưới 15 triệu', min: 0, max: 15000000 },
  { id: '15-25', label: '15 - 25 triệu', min: 15000000, max: 25000000 },
  { id: '25-35', label: '25 - 35 triệu', min: 25000000, max: 35000000 },
  { id: 'above-35', label: 'Trên 35 triệu', min: 35000000, max: 999000000 }
];

const STORAGE_FILTERS = ['Tất cả', '128GB', '256GB', '512GB', '1TB'];

const SORT_OPTIONS = [
  { id: 'popular', label: 'Bán chạy nhất' },
  { id: 'price-asc', label: 'Giá: Thấp đến Cao' },
  { id: 'price-desc', label: 'Giá: Cao đến Thấp' },
  { id: 'discount-desc', label: '% Giảm nhiều nhất' },
  { id: 'rating-desc', label: 'Đánh giá cao nhất' }
];

export default function Shop() {
  const navigate = useNavigate();
  const [activeSeries, setActiveSeries] = useState('all');
  const [selectedStorage, setSelectedStorage] = useState('Tất cả');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [selectedSort, setSelectedSort] = useState('popular');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Preorder Modal State for iPhone 17 Series
  const [isPreorderModalOpen, setIsPreorderModalOpen] = useState(false);
  const [selectedPreorderProduct, setSelectedPreorderProduct] = useState(null);
  const [selectedPreorderStorage, setSelectedPreorderStorage] = useState('');
  const [selectedPreorderColor, setSelectedPreorderColor] = useState('');
  const [preorderFormData, setPreorderFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    note: ''
  });
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  // Auto-play carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % PROMO_BANNERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleOpenPreorder = (product) => {
    setSelectedPreorderProduct(product);
    setSelectedPreorderStorage(product.storage || (product.storageOptions ? product.storageOptions[0] : ''));
    setSelectedPreorderColor(product.colors ? product.colors[0] : '');
    setIsSubmittedSuccess(false);
    setIsPreorderModalOpen(true);
  };

  const handlePreorderSubmit = (e) => {
    e.preventDefault();
    if (!preorderFormData.fullName.trim() || !preorderFormData.phone.trim()) {
      alert('Vui lòng nhập đầy đủ Họ tên và Số điện thoại!');
      return;
    }
    setIsSubmittedSuccess(true);
  };

  const handleClosePreorderModal = () => {
    setIsPreorderModalOpen(false);
    setIsSubmittedSuccess(false);
    setPreorderFormData({ fullName: '', phone: '', email: '', note: '' });
  };

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from backend CRM API
  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/crm/products`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data)) {
          const mapped = resData.data.map((p) => {
            const storages = p.variants?.length
              ? [...new Set(p.variants.map((v) => v.storage).filter(Boolean))]
              : [];
            const colors = p.variants?.length
              ? [...new Set(p.variants.map((v) => v.color).filter(Boolean))]
              : [];
            const price = Number(p.basePrice) || 0;
            const isComingSoon = Boolean(
              (p.category && p.category.toLowerCase().includes('17')) ||
              (p.name && p.name.toLowerCase().includes('iphone 17'))
            );
            return {
              id: p.id,
              name: p.name,
              category: p.category || 'iPhone 17 Series',
              series: p.category || 'iPhone 17 Series',
              price: price,
              originalPrice: Math.round(price * 1.08),
              discountPercent: 8,
              image: p.heroImage || p.variants?.[0]?.image || '/images/iphone17_pro/cosmic_orange_iphone_hero.png',
              storageOptions: storages.length > 0 ? storages : ['128GB', '256GB'],
              storage: storages[0] || '128GB',
              colors: colors,
              chip: p.performance?.chipName || p.specs?.chip || 'Apple Silicon',
              screenSize: p.specs?.display || p.specs?.screenSize || 'Super Retina XDR',
              rating: 5.0,
              reviewsCount: 18,
              isHot: true,
              isNew: true,
              isComingSoon: isComingSoon,
              detailRoute: `/product/${p.id}`,
              slug: p.id,
              smemberDiscount: 'Smember giảm thêm đến 1.000.000đ',
              promotionGift: (Array.isArray(p.highlights) && p.highlights[0]) || p.description || 'Tặng củ sạc nhanh 20W & Bảo hành 1 đổi 1',
              installmentBadge: 'Trả góp 0%'
            };
          });
          setProducts(mapped);
        }
      })
      .catch((err) => {
        console.error('Error fetching products for shop:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Filter & Sorting Logic
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Series filter
      if (activeSeries !== 'all') {
        const itemCat = (item.category || '').toLowerCase();
        const itemName = (item.name || '').toLowerCase();
        const act = activeSeries.toLowerCase();

        if (act.includes('mac')) {
          if (!itemCat.includes('mac') && !itemName.includes('mac')) return false;
        } else if (act.includes('ipad')) {
          if (!itemCat.includes('ipad') && !itemName.includes('ipad')) return false;
        } else if (act.includes('watch')) {
          if (!itemCat.includes('watch') && !itemName.includes('watch')) return false;
        } else if (act.includes('phụ kiện') || act.includes('accessory')) {
          if (!itemCat.includes('phụ kiện') && !itemCat.includes('accessory')) return false;
        } else if (act.includes('17')) {
          if (!itemCat.includes('17') && !itemName.includes('17')) return false;
        } else if (act.includes('16')) {
          if (!itemCat.includes('16') && !itemName.includes('16')) return false;
        } else if (act.includes('15')) {
          if (!itemCat.includes('15') && !itemName.includes('15')) return false;
        } else if (act.includes('14')) {
          if (!itemCat.includes('14') && !itemName.includes('14')) return false;
        } else if (act.includes('13')) {
          if (!itemCat.includes('13') && !itemName.includes('13')) return false;
        } else {
          if (item.category !== activeSeries && item.series !== activeSeries) return false;
        }
      }

      // Storage filter
      if (selectedStorage !== 'Tất cả') {
        if (!item.storageOptions || !item.storageOptions.includes(selectedStorage)) {
          return false;
        }
      }

      // Price range filter
      if (selectedPriceRange !== 'all') {
        const range = PRICE_RANGES.find((r) => r.id === selectedPriceRange);
        if (range && (item.price < range.min || item.price > range.max)) {
          return false;
        }
      }

      // Only discounted
      if (onlyDiscounted && item.discountPercent <= 5) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (selectedSort === 'price-asc') return a.price - b.price;
      if (selectedSort === 'price-desc') return b.price - a.price;
      if (selectedSort === 'discount-desc') return b.discountPercent - a.discountPercent;
      if (selectedSort === 'rating-desc') return b.rating - a.rating;
      // Default: popular / isHot first
      return (b.isHot ? 1 : 0) - (a.isHot ? 1 : 0);
    });
  }, [products, activeSeries, selectedStorage, selectedPriceRange, onlyDiscounted, selectedSort]);

  const handleProductClick = (product) => {
    if (product.isComingSoon) {
      handleOpenPreorder(product);
      return;
    }
    if (product.detailRoute) {
      navigate(product.detailRoute);
    } else {
      navigate(`/product/${product.slug}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-gray-900 pt-20 pb-24 selection:bg-red-500/20 selection:text-red-900">
      
      {/* ══════════════════════════════════════════════════════
          1. BREADCRUMB & CATEGORY TITLE
         ══════════════════════════════════════════════════════ */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-4 pb-2">
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mb-4 flex-wrap">
          <Link to="/" className="hover:text-gray-900 transition-colors">Trang chủ</Link>
          <ChevronRight size={13} className="text-gray-400" />
          <span className="text-gray-700 font-medium">Pig Store</span>
          <ChevronRight size={13} className="text-gray-400" />
          <span className="text-red-600 font-semibold">Sản phẩm chính hãng</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md bg-red-50 border border-red-200 text-red-600 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} /> Pig Store Official
              </span>
              <span className="text-xs text-gray-500 hidden sm:inline">Cam kết 100% chính hãng VN/A</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
              Pig Store Chính Hãng
              <span className="text-sm md:text-base font-normal text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">
                {filteredProducts.length} sản phẩm
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3 text-xs md:text-sm text-gray-600">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 shadow-sm">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span>Bảo hành 12T AASP</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 shadow-sm">
              <Zap size={15} className="text-amber-600" />
              <span>Giao 2H miễn phí</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          2. PROMO BANNER CAROUSEL
         ══════════════════════════════════════════════════════ */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 my-6">
        <div className="relative rounded-3xl overflow-hidden border border-gray-200/80 bg-gradient-to-r shadow-xl">
          <div className="relative h-[280px] sm:h-[340px] md:h-[380px] w-full overflow-hidden">
            <AnimatePresence mode="wait">
              {PROMO_BANNERS.map((banner, index) => {
                if (index !== currentBannerIndex) return null;
                return (
                  <motion.div
                    key={banner.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                    className={`absolute inset-0 bg-gradient-to-r ${banner.bgColor} p-6 sm:p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-6`}
                  >
                    {/* Banner Left Info */}
                    <div className="flex-1 z-10 text-center md:text-left">
                      <span className={`inline-block px-3 py-1 rounded-full text-[11px] md:text-xs font-bold text-white uppercase tracking-wider mb-3 shadow-lg ${banner.badgeColor}`}>
                        {banner.badge}
                      </span>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight mb-3 leading-tight">
                        {banner.title}
                      </h2>
                      <p className="text-white/90 text-xs sm:text-sm md:text-base max-w-xl mb-6 line-clamp-2 md:line-clamp-3 font-medium">
                        {banner.subtitle}
                      </p>
                      <div className="flex items-center justify-center md:justify-start gap-4">
                        <Link
                          to={banner.link}
                          className="px-6 py-3 rounded-xl bg-white text-gray-900 font-bold text-xs sm:text-sm hover:bg-gray-100 transition-all transform active:scale-95 flex items-center gap-2 shadow-lg"
                        >
                          {banner.ctaText} <ArrowRight size={16} />
                        </Link>
                        <span className="text-xs text-white/80 font-medium hidden sm:inline">Trả góp 0% qua thẻ / CCCD</span>
                      </div>
                    </div>

                    {/* Banner Right Image */}
                    <div className="relative w-48 sm:w-64 md:w-80 lg:w-96 aspect-square flex items-center justify-center">
                      <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl" />
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] transform hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Carousel Controls */}
          <button
            onClick={() => setCurrentBannerIndex((prev) => (prev - 1 + PROMO_BANNERS.length) % PROMO_BANNERS.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all z-20"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentBannerIndex((prev) => (prev + 1) % PROMO_BANNERS.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all z-20"
            aria-label="Next Slide"
          >
            <ChevronRight size={20} />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {PROMO_BANNERS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentBannerIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentBannerIndex ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          3. TRUST COMMITMENT STRIP
         ══════════════════════════════════════════════════════ */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {TRUST_FEATURES.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200/80 shadow-sm rounded-2xl p-4 flex items-center gap-3.5 hover:border-gray-300 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0">
                {idx === 0 && <ShieldCheck size={20} />}
                {idx === 1 && <RefreshCw size={20} />}
                {idx === 2 && <CreditCard size={20} />}
                {idx === 3 && <Truck size={20} />}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900">{item.title}</h4>
                <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          4. QUICK SERIES FILTER TABS (Apple Store Style)
         ══════════════════════════════════════════════════════ */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          {SERIES_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSeries(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 border ${
                activeSeries === tab.id
                  ? 'bg-red-600 border-red-600 text-white shadow-md scale-[1.02]'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          5. MULTI-CRITERIA FILTER & SORT BAR
         ══════════════════════════════════════════════════════ */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left filters: Storage, Price, Hot Deal */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
              <SlidersHorizontal size={15} className="text-red-500" />
              <span>Bộ lọc:</span>
            </div>

            {/* Storage Select */}
            <div className="relative">
              <select
                value={selectedStorage}
                onChange={(e) => setSelectedStorage(e.target.value)}
                className="bg-gray-50 hover:bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-medium text-gray-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 cursor-pointer appearance-none pr-8 transition-colors"
              >
                <option value="Tất cả">Dung lượng: Tất cả</option>
                {STORAGE_FILTERS.slice(1).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Price Select */}
            <div className="relative">
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="bg-gray-50 hover:bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-medium text-gray-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 cursor-pointer appearance-none pr-8 transition-colors"
              >
                {PRICE_RANGES.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Only Hot Discount Toggle */}
            <button
              onClick={() => setOnlyDiscounted(!onlyDiscounted)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                onlyDiscounted
                  ? 'bg-red-50 border-red-300 text-red-600 font-semibold'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
            >
              <Flame size={13} className={onlyDiscounted ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
              <span>Giảm giá sốc</span>
            </button>

            {/* Reset Filters */}
            {(activeSeries !== 'all' || selectedStorage !== 'Tất cả' || selectedPriceRange !== 'all' || onlyDiscounted) && (
              <button
                onClick={() => {
                  setActiveSeries('all');
                  setSelectedStorage('Tất cả');
                  setSelectedPriceRange('all');
                  setOnlyDiscounted(false);
                }}
                className="text-xs text-red-600 hover:text-red-700 underline font-medium ml-2"
              >
                Xóa tất cả lọc
              </button>
            )}
          </div>

          {/* Right: Sorting */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            <span className="text-xs text-gray-600 flex items-center gap-1">
              <ArrowUpDown size={13} /> Sắp xếp:
            </span>
            <div className="relative">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="bg-gray-50 hover:bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 cursor-pointer appearance-none pr-8 transition-colors"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          6. PRODUCT CARDS GRID (Apple Minimalist White Style)
         ══════════════════════════════════════════════════════ */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 mb-16">
        {loading ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-200 shadow-sm px-4">
            <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-gray-700">Đang tải danh sách sản phẩm Pig Store...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-sm px-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-4">
              <Smartphone size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {products.length === 0 ? 'Hiện chưa có sản phẩm trong hệ thống' : 'Không tìm thấy sản phẩm phù hợp'}
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              {products.length === 0 
                ? 'Danh sách sản phẩm đang được cập nhật từ CRM. Vui lòng quay lại sau.' 
                : 'Vui lòng thử điều chỉnh lại bộ lọc giá, dung lượng hoặc chọn lại danh mục dòng máy.'}
            </p>
            {products.length > 0 && (
              <button
                onClick={() => {
                  setActiveSeries('all');
                  setSelectedStorage('Tất cả');
                  setSelectedPriceRange('all');
                  setOnlyDiscounted(false);
                }}
                className="px-6 py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-xs hover:bg-black transition-all shadow-md"
              >
                Xem tất cả sản phẩm
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="group bg-white hover:bg-white border border-gray-200/80 hover:border-red-500/40 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 cursor-pointer relative overflow-hidden"
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-1 mb-2 z-10">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {product.isComingSoon ? (
                        <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-[10px] font-extrabold text-white shadow-sm flex items-center gap-1 animate-pulse">
                          <Flame size={10} /> ĐẶT TRƯỚC SỚM
                        </span>
                      ) : (
                        <>
                          {product.installmentBadge && (
                            <span className="px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-[10px] font-bold text-gray-700">
                              {product.installmentBadge}
                            </span>
                          )}
                          {product.isNew && (
                            <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] font-bold text-white shadow-sm">
                              MỚI
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    {product.discountPercent > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-red-600 to-rose-600 text-[10px] font-extrabold text-white shadow-sm">
                        -{product.discountPercent}%
                      </span>
                    )}
                  </div>

                  {/* Product Image */}
                  <div className="relative aspect-square w-full my-3 flex items-center justify-center p-3 bg-[#f5f5f7] rounded-xl overflow-hidden border border-gray-100 group-hover:border-gray-200 transition-colors">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500 drop-shadow-sm"
                      loading="lazy"
                    />
                    {product.isComingSoon && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent py-1.5 px-2 text-center">
                        <span className="text-[10px] text-amber-300 font-semibold flex items-center justify-center gap-1">
                          <Sparkles size={11} /> Dự kiến ra mắt Q3/2025
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Storage Options Pills Preview */}
                  {product.storageOptions && product.storageOptions.length > 1 && (
                    <div className="flex items-center gap-1.5 mb-2.5 overflow-hidden flex-wrap">
                      {product.storageOptions.map((st, idx) => (
                        <span
                          key={idx}
                          className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                            st === product.storage
                              ? 'border-red-500/50 bg-red-50 text-red-600 font-semibold'
                              : 'border-gray-200 bg-gray-50 text-gray-600'
                          }`}
                        >
                          {st}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Product Title */}
                  <div className="mb-2">
                    <h3 className="text-sm md:text-base font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                      {product.name}
                    </h3>
                  </div>

                  {/* Price Block */}
                  <div className="mb-3">
                    {product.isComingSoon && (
                      <span className="text-[11px] text-amber-600 font-semibold block mb-0.5">
                        Giá dự kiến từ:
                      </span>
                    )}
                    <div className="flex items-baseline gap-2">
                      <span className="text-base md:text-lg font-black text-red-600 tracking-tight">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Smember tag */}
                    {product.smemberDiscount && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded font-medium">
                        <Tag size={11} className="text-amber-600" />
                        <span className="truncate">{product.smemberDiscount}</span>
                      </div>
                    )}
                  </div>

                  {/* Promotion Gift Box */}
                  {product.promotionGift && (
                    <div className="bg-red-50/50 border border-red-100 rounded-lg p-2 mb-3 text-[11px] text-gray-700 flex items-start gap-1.5">
                      <Sparkles size={13} className="text-red-500 shrink-0 mt-0.5" />
                      <p className="line-clamp-2">{product.promotionGift}</p>
                    </div>
                  )}

                  {/* Specs summary strip */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 mb-3">
                    <span className="flex items-center gap-1 truncate max-w-[65%]">
                      <Cpu size={12} className="text-gray-400 shrink-0" />
                      <span className="truncate">{product.chip}</span>
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      <Monitor size={12} className="text-gray-400" />
                      <span>{product.screenSize}</span>
                    </span>
                  </div>

                  {/* Rating & Action button */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1 text-xs text-amber-500">
                      <Star size={13} className="fill-amber-400" />
                      <span className="font-bold text-gray-900 text-xs">{product.rating}</span>
                      <span className="text-gray-400 text-[10px]">({product.reviewsCount})</span>
                    </div>

                    {product.isComingSoon ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPreorder(product);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md hover:scale-105"
                      >
                        <Bell size={13} />
                        <span>Đặt trước</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(product);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-1 transition-all shadow-sm hover:shadow-md"
                      >
                        <span>Mua ngay</span>
                        <ChevronRight size={13} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          7. WHY BUY FROM AUTHORIZED RESELLER (AAR)
         ══════════════════════════════════════════════════════ */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 mb-16">
        <div className="rounded-3xl border border-gray-200/80 bg-gradient-to-b from-gray-50 to-[#f3f4f6] p-6 sm:p-10 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Đặc Quyền Khách Hàng</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 mb-3">
              Lý Do Chọn Mua Tại Pig Store
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Hệ thống bán lẻ thiết bị công nghệ chính hãng với trải nghiệm dịch vụ và hậu mãi hàng đầu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex flex-col items-start hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <ShieldCheck size={26} />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Hàng Chính Hãng VN/A 100%</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Được kiểm định chất lượng nghiêm ngặt bởi Pig Store, đầy đủ hóa đơn chứng từ VAT và kích hoạt bảo hành điện tử chính thức.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex flex-col items-start hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <Sparkles size={26} />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Trợ Giá Thu Cũ Đổi Mới Cực Khủng</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Quy trình định giá máy cũ minh bạch trong 5 phút. Trợ giá trực tiếp lên đến 4.000.000đ khi nâng cấp lên dòng máy mới.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex flex-col items-start hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <CreditCard size={26} />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Hỗ Trợ Trả Góp 0% Linh Hoạt</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Đa dạng hình thức trả góp 0% qua thẻ tín dụng ngân hàng hoặc trả góp duyệt online với CCCD, nhận máy ngay sau 15 phút.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          8. FAQ SECTION (CellPhoneS AAR Style)
         ══════════════════════════════════════════════════════ */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            <HelpCircle size={18} className="text-red-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">Câu Hỏi Thường Gặp</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 text-center mb-8">
            Giải đáp những thắc mắc phổ biến khi mua sắm sản phẩm Apple chính hãng.
          </p>

          <div className="space-y-3">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-all hover:border-gray-300"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-gray-900 hover:text-red-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-red-600' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-gray-600 border-t border-gray-100 pt-3 leading-relaxed">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          9. PRE-ORDER / EARLY REGISTRATION MODAL (IPHONE 17)
         ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isPreorderModalOpen && selectedPreorderProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClosePreorderModal}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden my-8 text-gray-900"
            >
              {/* Top gradient glow */}
              <div className="absolute -top-24 -left-24 w-60 h-60 bg-gradient-to-br from-orange-500/10 to-red-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-gradient-to-tl from-amber-500/10 to-rose-600/10 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={handleClosePreorderModal}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600 hover:text-gray-900 flex items-center justify-center transition-all z-20"
                aria-label="Đóng modal"
              >
                <X size={18} />
              </button>

              {isSubmittedSuccess ? (
                /* Success State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-500/30 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-md">
                    <Check size={40} className="stroke-[3]" />
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200">
                    Đăng Ký Thành Công
                  </span>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">
                    Chào {preorderFormData.fullName || 'Quý khách'}!
                  </h3>
                  <p className="text-sm text-gray-600 max-w-md mx-auto mb-6 leading-relaxed">
                    Hệ thống AAR đã ghi nhận thông tin đặt trước sớm cho siêu phẩm{' '}
                    <strong className="text-red-600">{selectedPreorderProduct.name}</strong> ({selectedPreorderStorage}, {selectedPreorderColor}).
                  </p>

                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 max-w-md mx-auto mb-6 text-left text-xs space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Mã ưu tiên đặt trước:</span>
                      <span className="font-mono font-bold text-red-600">VIP-IP17-{Math.floor(100000 + Math.random() * 900000)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Số điện thoại nhận tin:</span>
                      <span className="font-bold text-gray-900">{preorderFormData.phone}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Đặc quyền kèm theo:</span>
                      <span className="font-bold text-emerald-600">Voucher 1.000.000đ + Trợ giá thu cũ 4Tr</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mb-6">
                    Chuyên viên tư vấn sẽ liên hệ với bạn qua số điện thoại trên ngay khi có thông tin mở bán chính thức tại Việt Nam.
                  </p>

                  <button
                    onClick={handleClosePreorderModal}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-sm hover:from-red-500 hover:to-orange-500 transition-all shadow-lg"
                  >
                    Hoàn tất & Tiếp tục xem
                  </button>
                </motion.div>
              ) : (
                /* Registration Form */
                <div>
                  {/* Modal Header */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                      Đặc quyền AAR 2025 - 2026
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-1">
                    Đăng Ký Nhận Thông Tin & Đặt Trước
                  </h2>
                  <p className="text-xs text-gray-500 mb-6">
                    Nhận thông báo mở bán sớm nhất, giữ suất nhận máy đợt 1 kèm voucher quà tặng đến 4 triệu đồng.
                  </p>

                  {/* Selected Product Card Summary */}
                  <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-2xl p-3.5 mb-6">
                    <img
                      src={selectedPreorderProduct.image}
                      alt={selectedPreorderProduct.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain bg-white rounded-xl p-1.5 border border-gray-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 truncate mb-1">
                        {selectedPreorderProduct.name}
                      </h4>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm sm:text-base font-black text-red-600">
                          {formatPrice(selectedPreorderProduct.price)}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          (Dự kiến)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-amber-700">
                        <Sparkles size={12} className="text-amber-500" />
                        <span>{selectedPreorderProduct.chip} • {selectedPreorderProduct.screenSize}</span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handlePreorderSubmit} className="space-y-4">
                    {/* Storage Options */}
                    {selectedPreorderProduct.storageOptions && selectedPreorderProduct.storageOptions.length > 1 && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Chọn dung lượng quan tâm:
                        </label>
                        <div className="flex items-center gap-2 flex-wrap">
                          {selectedPreorderProduct.storageOptions.map((st, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedPreorderStorage(st)}
                              className={`text-xs px-3.5 py-1.5 rounded-xl border font-semibold transition-all ${
                                selectedPreorderStorage === st
                                  ? 'border-red-500 bg-red-50 text-red-600 shadow-sm'
                                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Color Options */}
                    {selectedPreorderProduct.colors && selectedPreorderProduct.colors.length > 0 && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Màu sắc yêu thích:
                        </label>
                        <div className="flex items-center gap-2 flex-wrap">
                          {selectedPreorderProduct.colors.map((color, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedPreorderColor(color)}
                              className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                                selectedPreorderColor === color
                                  ? 'border-amber-500 bg-amber-50 text-amber-800 font-bold shadow-sm'
                                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {color}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Input Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Họ và tên <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ví dụ: Nguyễn Văn A"
                          value={preorderFormData.fullName}
                          onChange={(e) => setPreorderFormData({ ...preorderFormData, fullName: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Số điện thoại (Zalo/SMS) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="Ví dụ: 0912 345 678"
                          value={preorderFormData.phone}
                          onChange={(e) => setPreorderFormData({ ...preorderFormData, phone: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Email nhận thông báo (tùy chọn)
                      </label>
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={preorderFormData.email}
                        onChange={(e) => setPreorderFormData({ ...preorderFormData, email: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Ghi chú / Nhu cầu Thu cũ đổi mới lên đời
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Ví dụ: Đang dùng iPhone 14 Pro Max muốn trade-in lên đời..."
                        value={preorderFormData.note}
                        onChange={(e) => setPreorderFormData({ ...preorderFormData, note: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors resize-none"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md transform active:scale-[0.99]"
                      >
                        <Send size={16} />
                        <span>Xác Nhận Đăng Ký Đặt Trước Ngay</span>
                      </button>
                      <p className="text-[11px] text-gray-500 text-center mt-2.5">
                        * Thông tin của bạn được bảo mật tuyệt đối theo chính sách bảo vệ dữ liệu khách hàng.
                      </p>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
