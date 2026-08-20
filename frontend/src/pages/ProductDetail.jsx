import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageSquare,
  Sliders,
  Play,
  Star,
  ShieldCheck,
  RefreshCw,
  CreditCard,
  Truck,
  ChevronRight,
  ChevronLeft,
  ShoppingCart,
  Zap,
  Check,
  CheckCircle2,
  Tag,
  Phone,
  Gift,
  HelpCircle,
  X,
  Share2,
  Camera,
  Image as ImageIcon,
  ThumbsUp,
  SlidersHorizontal,
  ArrowRight,
  User,
  Edit3,
  Video
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { premiumProducts } from '../data/premiumProductsData';
import { PRODUCTS_DATA } from '../data/productsData';

const getEmbedUrl = (url) => {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return { type: 'youtube', src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1` };
  }
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return { type: 'vimeo', src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1` };
  }
  if (url.match(/\.(mp4|webm|ogg)($|\?)/i) || url.startsWith('blob:') || url.startsWith('data:video/')) {
    return { type: 'video', src: url };
  }
  return { type: 'iframe', src: url };
};

export const getVideoThumbnail = (url, fallbackImage = '') => {
  if (!url) return fallbackImage;
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
  }
  return fallbackImage;
};

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, openCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState('video'); // 'video' | 'image' (mặc định hiển thị video)
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'reviews'

  // Review System State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedStarFilter, setSelectedStarFilter] = useState('all'); // 'all' | 5 | 4 | 3 | 2 | 1 | 'has_image'
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewFormData, setReviewFormData] = useState({
    rating: 5,
    name: '',
    phone: '',
    comment: '',
    images: []
  });
  const [selectedReviewImageModal, setSelectedReviewImageModal] = useState(null);

  const [reviewsList, setReviewsList] = useState([
    {
      id: 1,
      name: 'Trần Văn Hoàng',
      rating: 5,
      date: '2 ngày trước',
      comment: 'Máy cực kỳ nét, cảm biến 1 inch quay đêm đỉnh chóp! Chống rung 3 trục mượt mà như dùng gimbal chuyên nghiệp. Đóng gói rất kỹ, giao hàng siêu nhanh chỉ 2 tiếng.',
      isVerified: true,
      likes: 12,
      isLiked: false,
      images: [
        '/images/camera3d.jpg',
        '/images/cameraiphone.webp'
      ]
    },
    {
      id: 2,
      name: 'Nguyễn Thị Mai',
      rating: 5,
      date: '1 tuần trước',
      comment: 'Màn hình cảm ứng xoay 2 inch rất tiện lợi, chuyển đổi ngang dọc quay TikTok cực nhanh. Nhân viên Pig Store tư vấn nhiệt tình và hướng dẫn tận tâm.',
      isVerified: true,
      likes: 8,
      isLiked: false,
      images: [
        '/images/iphone17_pro/cosmic_orange_iphone_hero.png'
      ]
    },
    {
      id: 3,
      name: 'Lê Minh Quân',
      rating: 5,
      date: '2 tuần trước',
      comment: 'Hàng chính hãng chuẩn VN/A nguyên seal, bảo hành 12 tháng yên tâm tuyệt đối. Giá tại Pig Store đang rẻ hơn các nơi khác kèm nhiều quà tặng.',
      isVerified: true,
      likes: 5,
      isLiked: false,
      images: []
    }
  ]);

  const topBuyRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch product data & backend reviews
  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/crm/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const p = data.data;
          const rawVariants = p.variants || [];

          const storages = rawVariants.length
            ? [...new Set(rawVariants.map((v) => v.storage).filter(Boolean))]
            : (p.storageOptions?.length ? p.storageOptions : ['Standard Combo', 'Standard Combo + Thẻ nhớ 128GB', 'Creator Combo']);

          // Unique colors map
          const uniqueColorsMap = new Map();
          rawVariants.forEach((v) => {
            if (v.color && !uniqueColorsMap.has(v.color)) {
              uniqueColorsMap.set(v.color, {
                name: v.color,
                price: Number(v.price) || Number(p.basePrice) || 0,
                image: v.image || p.heroImage || '',
                hex: v.color?.toLowerCase().includes('cam') ? '#FF6B35'
                  : v.color?.toLowerCase().includes('xanh') ? '#2A3441'
                  : v.color?.toLowerCase().includes('trắng') || v.color?.toLowerCase().includes('bạc') ? '#F2F1EC'
                  : v.color?.toLowerCase().includes('sa mạc') || v.color?.toLowerCase().includes('vàng') ? '#D4AF37'
                  : v.color?.toLowerCase().includes('đen') ? '#222222'
                  : '#888888'
              });
            }
          });

          const colors = uniqueColorsMap.size > 0
            ? Array.from(uniqueColorsMap.values())
            : [
                {
                  name: 'Tiêu chuẩn',
                  price: Number(p.basePrice) || 9204000,
                  image: p.heroImage || '/images/iphone17_pro/cosmic_orange_iphone_hero.png',
                  hex: '#222222'
                }
              ];

          const basePriceNum = Number(p.basePrice) || colors[0]?.price || 9204000;
          const origPriceNum = Math.round(basePriceNum * 1.35) || 13990000;

          // Dynamic Gallery: Chỉ lấy ảnh thực tế từ sản phẩm & các biến thể (không thêm ảnh mẫu tĩnh)
          const dynamicImages = [];
          if (p.heroImage) dynamicImages.push(p.heroImage);
          if (Array.isArray(p.images)) {
            p.images.forEach((img) => img && !dynamicImages.includes(img) && dynamicImages.push(img));
          }
          if (Array.isArray(p.specs?.galleryImages)) {
            p.specs.galleryImages.forEach((img) => img && !dynamicImages.includes(img) && dynamicImages.push(img));
          }
          rawVariants.forEach((v) => {
            if (v.image && !dynamicImages.includes(v.image)) {
              dynamicImages.push(v.image);
            }
          });
          const finalGallery = dynamicImages.length > 0 ? dynamicImages : (p.heroImage ? [p.heroImage] : ['/images/iphone17_pro/cosmic_orange_iphone_hero.png']);

          const mapped = {
            id: p.id,
            name: p.name || 'DJI Osmo Pocket 3 Standard Combo',
            category: p.category || 'Máy quay chống rung / Điện thoại',
            price: basePriceNum,
            originalPrice: origPriceNum,
            discountPercent: Math.round(((origPriceNum - basePriceNum) / origPriceNum) * 100) || 34,
            heroImage: p.heroImage || colors[0]?.image || finalGallery[0],
            galleryImages: finalGallery,
            videoThumbnail: getVideoThumbnail(p.specs?.videoUrl || p.videoUrl, p.heroImage || colors[0]?.image),
            storageOptions: storages.length > 0 ? storages : ['Standard Combo', 'Creator Combo'],
            colors: colors,
            rawVariants: rawVariants,
            description: p.description || 'Sản phẩm công nghệ cao cấp chính hãng với cảm biến vượt trội, chống rung thế hệ mới và tính năng AI hiện đại.',
            highlights: Array.isArray(p.highlights) && p.highlights.length > 0
              ? p.highlights
              : [
                  'Cảm biến CMOS 1 inch mạnh mẽ thu sáng vượt trội',
                  'Màn hình cảm ứng xoay 2 inch linh hoạt chuyển đổi dọc / ngang',
                  'Chống rung cơ học 3 trục cho thước phim mượt mà chuẩn điện ảnh',
                  'Lấy nét toàn diện nhanh chóng ActiveTrack 6.0 thông minh'
                ],
            specs: {
              screen: p.specs?.screen || p.specs?.display || 'Màn hình cảm ứng OLED 2.0 inch (314x556)',
              sensor: p.specs?.sensor || 'Cảm biến CMOS 1-inch, ISO 50 - 6400',
              resolution: p.specs?.resolution || '4K UHD (3840×2160) @ 120fps',
              chip: p.specs?.chip || p.performance?.chipName || 'Bộ xử lý hình ảnh AI thế hệ mới',
              battery: p.specs?.battery || (p.performance?.batteryCapacity ? `${p.performance.batteryCapacity} mAh` : '1.300 mAh (Sạc nhanh 80% trong 16 phút)'),
              weight: p.specs?.weight || '179 grams',
              stabilization: p.specs?.stabilization || 'Chống rung cơ học 3 trục (Gimbal 3-Axis)',
              connectivity: p.specs?.connectivity || 'Wi-Fi 802.11 a/b/g/n/ac, Bluetooth 5.2 BLE',
              os: p.specs?.os || 'Hỗ trợ iOS 12.0+ & Android 8.0+'
            },
            videoUrl: p.specs?.videoUrl || p.videoUrl || 'https://www.youtube.com/watch?v=fWz6f6_bZ7o'
          };

          setProduct(mapped);
          setSelectedStorage(mapped.storageOptions[0] || 'Standard Combo');
          setSelectedColor(mapped.colors[0]);

          // Fetch reviews for this product
          fetchReviews(p.id);
        } else {
          loadFallbackProduct();
        }
      })
      .catch((err) => {
        console.error('Error fetching product detail:', err);
        loadFallbackProduct();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  const fetchReviews = (productId) => {
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/reviews?productId=${productId}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
          setReviewsList((prev) => [
            ...resData.data.map((r) => ({
              id: r.id,
              name: r.name,
              rating: r.rating,
              date: new Date(r.createdAt).toLocaleDateString('vi-VN'),
              comment: r.comment,
              isVerified: true,
              likes: 1,
              isLiked: false,
              images: r.images || []
            })),
            ...prev
          ]);
        }
      })
      .catch((e) => console.warn('Reviews fetch notice:', e));
  };

  const loadFallbackProduct = () => {
    const foundData = PRODUCTS_DATA.find((p) => p.id === slug) || premiumProducts[slug];
    const isDJI = slug?.toLowerCase().includes('dji') || slug?.toLowerCase().includes('osmo');

    const defaultPrice = isDJI ? 9204000 : 29999000;
    const defaultOrig = isDJI ? 13990000 : 34999000;

    const fallbackColors = [
      {
        name: isDJI ? 'Đen' : 'Cam Vũ Trụ (Cosmic Orange)',
        price: defaultPrice,
        image: foundData?.heroImage || '/images/iphone17_pro/cosmic_orange_iphone_hero.png',
        hex: isDJI ? '#222222' : '#FF6B35'
      },
      {
        name: isDJI ? 'Titan Xám' : 'Titan Tự Nhiên',
        price: defaultPrice + (isDJI ? 0 : 1000000),
        image: '/images/iphone16_pro.png',
        hex: '#8C8B85'
      },
      {
        name: isDJI ? 'Trắng Tinh Khôi' : 'Titan Đen Vũ Trụ',
        price: defaultPrice,
        image: '/images/iphone16_pro_max_titanium_black.png',
        hex: '#323232'
      }
    ];

    const fallbackImages = [];
    if (foundData?.heroImage) fallbackImages.push(foundData.heroImage);
    fallbackColors.forEach(c => {
      if (c.image && !fallbackImages.includes(c.image)) fallbackImages.push(c.image);
    });
    if (fallbackImages.length === 0) fallbackImages.push('/images/iphone17_pro/cosmic_orange_iphone_hero.png');

    const fallback = {
      id: slug || 'dji-osmo-pocket-3',
      name: foundData?.name || (isDJI ? 'DJI Osmo Pocket 3 Standard Combo' : 'iPhone 17 Pro Max Cosmic Orange (Chính Hãng VN/A)'),
      category: isDJI ? 'Máy quay chống rung' : 'Điện thoại thông minh',
      price: foundData?.price ? (parseInt(String(foundData.price).replace(/\D/g, '')) || defaultPrice) : defaultPrice,
      originalPrice: defaultOrig,
      discountPercent: Math.round(((defaultOrig - defaultPrice) / defaultOrig) * 100),
      heroImage: foundData?.heroImage || fallbackColors[0].image,
      galleryImages: fallbackImages,
      videoThumbnail: getVideoThumbnail(foundData?.videoUrl, foundData?.heroImage),
      storageOptions: isDJI
        ? ['Standard Combo', 'Standard Combo + Thẻ nhớ 128GB', 'Creator Combo', 'Creator Combo + Thẻ nhớ 128GB']
        : ['128GB', '256GB', '512GB', '1TB'],
      colors: fallbackColors,
      rawVariants: [],
      description: foundData?.description || 'Tuyệt tác công nghệ hội tụ cảm biến 1 inch đỉnh cao, màn hình cảm ứng xoay 2 inch và công nghệ lấy nét ActiveTrack 6.0 mang đến trải nghiệm quay chụp hoàn hảo nhất.',
      highlights: foundData?.highlights || [
        'Cảm biến CMOS 1 inch thu sáng mạnh mẽ, chất lượng hình ảnh vượt trội',
        'Màn hình cảm ứng OLED 2 inch xoay ngang/dọc linh hoạt',
        'Hệ thống chống rung cơ học 3 trục chống rung lắc tuyệt đối',
        'Quay video 4K/120fps cùng cấu hình màu 10-bit D-Log M & HLG'
      ],
      specs: {
        screen: 'Màn hình OLED 2.0 inch xoay đa hướng',
        sensor: 'Cảm biến CMOS 1-inch cao cấp',
        resolution: '4K/120fps UHD, slow-motion mượt mà',
        chip: 'Chip xử lý hình ảnh AI A19/Active Neural',
        battery: '1.300 mAh (Sạc 80% trong 16 phút)',
        weight: '179g siêu nhỏ gọn bỏ túi',
        stabilization: 'Chống rung 3 trục Gimbal',
        connectivity: 'Wi-Fi, Bluetooth 5.2, Type-C High-Speed',
        os: 'Tương thích hoàn hảo iOS & Android'
      },
      videoUrl: foundData?.videoUrl || 'https://www.youtube.com/watch?v=fWz6f6_bZ7o'
    };

    setProduct(fallback);
    setSelectedStorage(fallback.storageOptions[0]);
    setSelectedColor(fallback.colors[0]);
  };

  // Sticky bottom bar listener
  useEffect(() => {
    const handleScroll = () => {
      if (topBuyRef.current) {
        const rect = topBuyRef.current.getBoundingClientRect();
        if (rect.bottom < 100) {
          setShowStickyBar(true);
        } else {
          setShowStickyBar(false);
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatPrice = (p) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);
  };

  const getCurrentVariant = () => {
    if (!product) return null;
    const raw = product.rawVariants || [];
    // 1. Match both storage and color
    let v = raw.find(
      (item) =>
        (!selectedStorage || !item.storage || item.storage === selectedStorage) &&
        (!selectedColor || !item.color || item.color === selectedColor.name)
    );
    // 2. If no exact match, match color
    if (!v && selectedColor) {
      v = raw.find((item) => item.color === selectedColor.name);
    }
    // 3. If no match, match storage
    if (!v && selectedStorage) {
      v = raw.find((item) => item.storage === selectedStorage);
    }
    return v;
  };

  const currentVariant = getCurrentVariant();
  const currentPrice = currentVariant?.price
    ? Number(currentVariant.price)
    : (selectedColor?.price || product?.price || 0);
  const currentOriginalPrice = product?.originalPrice || Math.round(currentPrice * 1.35);

  const handleAddToCartClick = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: `${product.name} - ${selectedStorage} - ${selectedColor?.name || ''}`,
      price: currentPrice,
      color: selectedColor?.name || 'Mặc định',
      storage: selectedStorage,
      image: selectedColor?.image || product.galleryImages?.[activeImageIndex] || product.heroImage,
      quantity: 1
    });
    openCart();
  };

  const handleBuyNowClick = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: `${product.name} - ${selectedStorage} - ${selectedColor?.name || ''}`,
      price: currentPrice,
      color: selectedColor?.name || 'Mặc định',
      storage: selectedStorage,
      image: selectedColor?.image || product.galleryImages?.[activeImageIndex] || product.heroImage,
      quantity: 1
    });
    navigate('/checkout');
  };

  // Handle Review Image Upload Preview
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const remainingSlots = 5 - reviewFormData.images.length;
    const selectedFiles = files.slice(0, remainingSlots);

    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setReviewFormData((prev) => ({
          ...prev,
          images: [...prev.images, event.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    setReviewFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleLikeReview = (reviewId) => {
    setReviewsList((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          const isLiked = !r.isLiked;
          return {
            ...r,
            isLiked,
            likes: isLiked ? r.likes + 1 : r.likes - 1
          };
        }
        return r;
      })
    );
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewFormData.name.trim() || !reviewFormData.comment.trim()) {
      alert('Vui lòng nhập họ tên và nội dung đánh giá!');
      return;
    }

    const token = localStorage.getItem('token');
    const newRev = {
      id: `rev-${Date.now()}`,
      name: reviewFormData.name.trim(),
      rating: reviewFormData.rating,
      date: 'Vừa xong',
      comment: reviewFormData.comment.trim(),
      isVerified: true,
      likes: 0,
      isLiked: false,
      images: reviewFormData.images
    };

    // Optimistic UI update
    setReviewsList([newRev, ...reviewsList]);

    // Send to backend API
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          productId: product.id,
          name: reviewFormData.name,
          phone: reviewFormData.phone,
          rating: reviewFormData.rating,
          comment: reviewFormData.comment,
          images: reviewFormData.images
        })
      });
    } catch (err) {
      console.warn('Review submission background sync notice:', err);
    }

    setIsReviewModalOpen(false);
    setReviewFormData({
      rating: 5,
      name: '',
      phone: '',
      comment: '',
      images: []
    });

    alert('Cảm ơn bạn đã gửi đánh giá! Nhận xét đã được đăng thành công.');
  };

  // Review Filtering & Metrics
  const filteredReviews = reviewsList.filter((r) => {
    if (selectedStarFilter === 'all') return true;
    if (selectedStarFilter === 'has_image') return r.images && r.images.length > 0;
    return r.rating === selectedStarFilter;
  });

  const averageRating = (
    reviewsList.reduce((acc, r) => acc + r.rating, 0) / (reviewsList.length || 1)
  ).toFixed(1);

  const starCounts = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: reviewsList.filter((r) => r.rating === s).length,
    percent: Math.round((reviewsList.filter((r) => r.rating === s).length / (reviewsList.length || 1)) * 100)
  }));

  const ratingLabels = {
    1: 'Rất tệ 😞',
    2: 'Chưa hài lòng 🙁',
    3: 'Bình thường 😐',
    4: 'Hài lòng 🙂',
    5: 'Rất hài lòng / Tuyệt vời ⭐⭐⭐⭐⭐'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700">Đang tải thông số sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;



  const handleSelectStorage = (st) => {
    setSelectedStorage(st);
    const matchingVariants = (product.rawVariants || []).filter((v) => v.storage === st);
    if (matchingVariants.length > 0) {
      const hasCurrentColor = matchingVariants.some((v) => v.color === selectedColor?.name);
      if (!hasCurrentColor && matchingVariants[0]?.color) {
        const newColorObj = product.colors.find((c) => c.name === matchingVariants[0].color);
        if (newColorObj) {
          setSelectedColor(newColorObj);
          if (newColorObj.image) {
            const idx = product.galleryImages?.indexOf(newColorObj.image);
            if (idx !== -1 && idx !== undefined) setActiveImageIndex(idx);
          }
        }
      } else {
        const currentVariantMatch = matchingVariants.find((v) => v.color === selectedColor?.name);
        if (currentVariantMatch?.image) {
          const idx = product.galleryImages?.indexOf(currentVariantMatch.image);
          if (idx !== -1 && idx !== undefined) setActiveImageIndex(idx);
        }
      }
    }
  };

  const handleSelectColor = (color) => {
    setSelectedColor(color);
    setActiveMediaTab('image');
    if (color.image) {
      const idx = product.galleryImages?.indexOf(color.image);
      if (idx !== -1 && idx !== undefined) {
        setActiveImageIndex(idx);
      }
    }
  };

  const getVariantPriceForColor = (colorName) => {
    const v = (product.rawVariants || []).find(
      (item) => item.color === colorName && (!selectedStorage || !item.storage || item.storage === selectedStorage)
    ) || (product.rawVariants || []).find((item) => item.color === colorName);
    return v?.price ? Number(v.price) : (product.colors.find((c) => c.name === colorName)?.price || product.price);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 font-sans pb-28">
      {/* ══════════════════════════════════════════════════════
          1. TOP BREADCRUMB & TITLE BAR
         ══════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Link to="/" className="hover:text-red-600 transition-colors">Trang chủ</Link>
            <ChevronRight size={12} />
            <Link to="/shop" className="hover:text-red-600 transition-colors">{product.category}</Link>
            <ChevronRight size={12} />
            <span className="text-gray-800 font-medium truncate max-w-[280px] sm:max-w-md">{product.name}</span>
          </div>

          {/* Title and Top Action Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                {product.name}
              </h1>
              <div className="hidden sm:flex items-center gap-1 text-amber-500 text-xs font-semibold bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                <Star size={13} className="fill-amber-400" />
                <span>{averageRating}</span>
                <span className="text-gray-400 font-normal">({reviewsList.length} đánh giá)</span>
              </div>
            </div>

            {/* Actions: Yêu thích | Đánh giá | Thông số */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs font-medium text-gray-600">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                  isFavorite ? 'bg-red-50 border-red-200 text-red-600 font-bold' : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Heart size={14} className={isFavorite ? 'fill-red-600 text-red-600' : 'text-gray-500'} />
                <span>{isFavorite ? 'Đã thích' : 'Yêu thích'}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('reviews');
                  const revElem = document.getElementById('main-tabs-section');
                  if (revElem) revElem.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 transition-all"
              >
                <MessageSquare size={14} className="text-blue-500" />
                <span>Đánh giá ({reviewsList.length})</span>
              </button>

              <button
                onClick={() => setIsSpecsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 transition-all"
              >
                <Sliders size={14} className="text-emerald-600" />
                <span>Thông số</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          2. MAIN PRODUCT DETAIL GRID (2 Columns: Image 1 Style)
         ══════════════════════════════════════════════════════ */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6" ref={topBuyRef}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ════════════════════════════════════════════════════
              LEFT COLUMN (5 Cols): Media Viewer + Thumbnails + Cam kết
             ════════════════════════════════════════════════════ */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-5">
            
            {/* Main Media Container */}
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm flex items-center justify-center p-4 group">

              {/* MEDIA DISPLAY: VIDEO / HIGHLIGHTS / IMAGE */}
              {activeMediaTab === 'video' ? (
                <div className="relative w-full h-full rounded-xl overflow-hidden bg-black flex items-center justify-center group/video">
                  {isVideoPlaying ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-black">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsVideoPlaying(false);
                        }}
                        className="absolute top-3 right-3 z-30 px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-xs font-medium flex items-center gap-1.5 transition-all border border-white/20 shadow-lg backdrop-blur-sm cursor-pointer"
                        title="Đóng video"
                      >
                        <X size={14} />
                        <span>Đóng video</span>
                      </button>
                      {(() => {
                        const embed = getEmbedUrl(product.videoUrl || 'https://www.youtube.com/watch?v=fWz6f6_bZ7o');
                        if (!embed) return <p className="text-white text-sm">Không thể phát video này.</p>;
                        if (embed.type === 'video') {
                          return (
                            <video
                              src={embed.src}
                              autoPlay
                              controls
                              className="w-full h-full object-contain"
                            />
                          );
                        }
                        return (
                          <iframe
                            className="w-full h-full border-0"
                            src={embed.src}
                            title={`${product.name} Video Showcase`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        );
                      })()}
                    </div>
                  ) : (
                    <>
                      <img
                        src={product.videoThumbnail || getVideoThumbnail(product.videoUrl, product.heroImage)}
                        alt="Video preview"
                        onError={(e) => {
                          const ytMatch = product.videoUrl?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
                          if (ytMatch && ytMatch[1] && !e.target.dataset.triedHq) {
                            e.target.dataset.triedHq = 'true';
                            e.target.src = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
                          } else {
                            e.target.src = product.heroImage || '/images/iphone17_pro/cosmic_orange_iphone_hero.png';
                          }
                        }}
                        className="w-full h-full object-cover opacity-85 group-hover/video:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 pointer-events-none">
                        <h3 className="text-white font-bold text-lg sm:text-xl drop-shadow-md">
                          {product.name}
                        </h3>
                        <p className="text-gray-300 text-xs mt-1 line-clamp-2">
                          {product.highlights?.[0] || product.description || 'Trải nghiệm chất lượng video chân thực và sống động'}
                        </p>
                      </div>
                      {/* Big Red YouTube-style Play Button */}
                      <button
                        onClick={() => setIsVideoPlaying(true)}
                        className="absolute z-20 w-16 h-12 bg-red-600 hover:bg-red-700 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 text-white cursor-pointer"
                        aria-label="Play video"
                      >
                        <Play size={24} className="fill-white translate-x-0.5" />
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <img
                    src={product.galleryImages?.[activeImageIndex] || selectedColor?.image || product.heroImage}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain drop-shadow-md transition-all duration-300 hover:scale-105"
                  />
                </div>
              )}

              {/* Prev / Next controls for images */}
              {activeMediaTab === 'image' && product.galleryImages?.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev - 1 + product.galleryImages.length) % product.galleryImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md border border-gray-200 text-gray-700 flex items-center justify-center hover:bg-white transition-all z-10 cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev + 1) % product.galleryImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md border border-gray-200 text-gray-700 flex items-center justify-center hover:bg-white transition-all z-10 cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails Row (Video, Image 1, 2, 3, ...) */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
              
              {/* Tab Video button */}
              <button
                onClick={() => setActiveMediaTab('video')}
                className={`w-16 h-16 sm:w-18 sm:h-18 rounded-xl border flex flex-col items-center justify-center p-1 shrink-0 transition-all cursor-pointer ${
                  activeMediaTab === 'video'
                    ? 'border-red-600 bg-red-50 text-red-600 shadow-sm ring-1 ring-red-600'
                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-1">
                  <Play size={12} className="fill-red-600 translate-x-0.5" />
                </div>
                <span className="text-[10px] font-bold">Video</span>
              </button>

              {/* Individual Image Thumbnails */}
              {product.galleryImages?.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveMediaTab('image');
                    setActiveImageIndex(idx);
                    const matchingColor = product.colors.find(c => c.image === img);
                    if (matchingColor) {
                      setSelectedColor(matchingColor);
                    }
                  }}
                  className={`w-16 h-16 sm:w-18 sm:h-18 rounded-xl border p-1 bg-white shrink-0 overflow-hidden transition-all flex items-center justify-center ${
                    activeMediaTab === 'image' && activeImageIndex === idx
                      ? 'border-red-600 shadow-sm ring-1 ring-red-600 scale-102'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>

            {/* Cam kết sản phẩm Box (Exact Image 1 layout) */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm">
              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <ShieldCheck size={18} className="text-red-600" />
                Cam kết sản phẩm tại Pig Store
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-gray-700">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
                    <ShieldCheck size={15} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Mới, đầy đủ phụ kiện</p>
                    <p className="text-[11px] text-gray-500">Nguyên seal từ nhà sản xuất, phụ kiện chuẩn theo hộp.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
                    <RefreshCw size={15} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Bảo hành 12 tháng</p>
                    <p className="text-[11px] text-gray-500">Bảo hành chính hãng tại các TTBH ủy quyền toàn quốc.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={15} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">1 đổi 1 trong 30 ngày</p>
                    <p className="text-[11px] text-gray-500">Nếu có lỗi phần cứng từ nhà sản xuất đổi mới ngay.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
                    <Truck size={15} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Giao hàng miễn phí</p>
                    <p className="text-[11px] text-gray-500">Giao siêu tốc 2h nội thành, kiểm hàng trước khi trả tiền.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ════════════════════════════════════════════════════
              RIGHT COLUMN (6 Cols): Price + Variants + Colors + Promos + CTAs
             ════════════════════════════════════════════════════ */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-4">
            
            {/* Price Box (Image 1 style) */}
            <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-red-50/40 border border-blue-100/80 rounded-2xl p-4 sm:p-5 shadow-sm">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-red-600 tracking-tight">
                  {formatPrice(currentPrice)}
                </span>
                {currentOriginalPrice > currentPrice && (
                  <span className="text-sm sm:text-base text-gray-400 line-through font-medium">
                    {formatPrice(currentOriginalPrice)}
                  </span>
                )}
                {product.discountPercent > 0 && (
                  <span className="bg-red-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md">
                    -{product.discountPercent}%
                  </span>
                )}
              </div>
            </div>

            {/* Phiên bản (Storage / Combo Options) */}
            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                Phiên bản
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
                {product.storageOptions.map((st, idx) => {
                  const isSelected = selectedStorage === st;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectStorage(st)}
                      className={`relative p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-red-600 bg-white shadow-sm ring-1 ring-red-600'
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <span className={`block text-xs ${isSelected ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {st}
                      </span>
                      {isSelected && (
                        <div className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white rounded-bl-lg rounded-tr-xl flex items-center justify-center">
                          <Check size={11} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Màu sắc (Color Selection Cards) */}
            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                Màu sắc
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.colors.map((color, idx) => {
                  const isSelected = selectedColor?.name === color.name;
                  const colorPrice = getVariantPriceForColor(color.name);

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectColor(color)}
                      className={`relative p-2.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-red-600 bg-white shadow-sm ring-1 ring-red-600'
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center p-1 shrink-0">
                        <img src={color.image} alt={color.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="text-left">
                        <p className={`text-xs ${isSelected ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {color.name}
                        </p>
                        <p className="text-xs font-bold text-red-600">
                          {formatPrice(colorPrice)}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white rounded-bl-lg rounded-tr-xl flex items-center justify-center">
                          <Check size={11} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ưu đãi thanh toán (Payment Promo Cards) */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Gift size={15} className="text-red-500" />
                Ưu đãi thanh toán & Khuyến mãi
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-red-50/50 hover:border-red-200 transition-all cursor-pointer">
                  <p className="font-bold text-gray-900">VNPay-QR</p>
                  <p className="text-[11px] text-red-600 font-semibold mt-0.5">Giảm ngay 400K</p>
                  <p className="text-[10px] text-gray-500">Cho đơn từ 8 triệu</p>
                </div>

                <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-red-50/50 hover:border-red-200 transition-all cursor-pointer">
                  <p className="font-bold text-gray-900">Thẻ VPBank</p>
                  <p className="text-[11px] text-red-600 font-semibold mt-0.5">Hoàn tiền 2.000.000đ</p>
                  <p className="text-[10px] text-gray-500">Khi mở thẻ tín dụng mới</p>
                </div>

                <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-red-50/50 hover:border-red-200 transition-all cursor-pointer">
                  <p className="font-bold text-gray-900">Techcombank</p>
                  <p className="text-[11px] text-red-600 font-semibold mt-0.5">Voucher 500K</p>
                  <p className="text-[10px] text-gray-500">Trả góp lãi suất 0%</p>
                </div>
              </div>
            </div>

            {/* Main Call-to-Action Buttons (Mua ngay, Giỏ hàng, Trả góp) */}
            <div className="flex flex-col gap-2.5 pt-1">
              <div className="grid grid-cols-12 gap-2">
                <button
                  type="button"
                  onClick={handleBuyNowClick}
                  className="col-span-9 sm:col-span-10 py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm sm:text-base flex flex-col items-center justify-center transition-all shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
                >
                  <span className="uppercase tracking-wide">Mua Ngay</span>
                  <span className="text-[11px] font-normal text-red-100">Giao tận nơi hoặc nhận tại cửa hàng</span>
                </button>

                <button
                  type="button"
                  title="Thêm vào giỏ hàng"
                  onClick={handleAddToCartClick}
                  className="col-span-3 sm:col-span-2 rounded-xl border-2 border-red-600 hover:bg-red-50 text-red-600 flex flex-col items-center justify-center transition-all active:scale-95 p-2 cursor-pointer"
                >
                  <ShoppingCart size={22} />
                  <span className="text-[10px] font-bold mt-0.5">Thêm giỏ</span>
                </button>
              </div>

              {/* Installment Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => alert('Hỗ trợ trả góp 0% qua công ty tài chính Home Credit, HD Saison. Vui lòng liên hệ hotline 028.3923.4675 để được xét duyệt nhanh!')}
                  className="py-2.5 px-3 rounded-xl border border-blue-500 bg-blue-50/40 hover:bg-blue-100/50 text-blue-700 flex flex-col items-center justify-center transition-all text-xs font-bold cursor-pointer"
                >
                  <span>TRẢ GÓP 0%</span>
                  <span className="text-[10px] font-normal text-gray-500">Duyệt hồ sơ nhanh qua điện thoại</span>
                </button>

                <button
                  type="button"
                  onClick={() => alert('Hỗ trợ trả góp qua thẻ tín dụng hơn 25 ngân hàng liên kết, không cần trả trước!')}
                  className="py-2.5 px-3 rounded-xl border border-blue-500 bg-blue-50/40 hover:bg-blue-100/50 text-blue-700 flex flex-col items-center justify-center transition-all text-xs font-bold cursor-pointer"
                >
                  <span>TRẢ GÓP QUA THẺ</span>
                  <span className="text-[10px] font-normal text-gray-500">Visa, Mastercard, JCB</span>
                </button>
              </div>

              {/* Hotline Contact Strip */}
              <div className="text-center text-xs text-gray-500 pt-1">
                Gọi đặt mua <a href="tel:02839234675" className="font-bold text-red-600 hover:underline">028.3923.4675</a> (7:30 - 22:00) để được tư vấn miễn phí
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          3. TABS: THÔNG SỐ & ĐÁNH GIÁ NGƯỜI MUA
         ══════════════════════════════════════════════════════ */}
      <div id="main-tabs-section" className="max-w-[1280px] mx-auto px-4 sm:px-6 mt-8">
        
        {/* Navigation Tabs Header */}
        <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 pt-3 rounded-t-2xl overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'specs'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Sliders size={16} />
            Thông số kỹ thuật
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Star size={16} className={activeTab === 'reviews' ? 'fill-red-600' : ''} />
            Đánh giá người mua ({reviewsList.length})
          </button>
        </div>

        {/* Tab Content Box */}
        <div className="bg-white border-x border-b border-gray-200 rounded-b-2xl p-6 shadow-sm">

          {/* TAB 2: TECH SPECS TABLE */}
          {activeTab === 'specs' && (
            <div id="specs-table-section" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Sliders size={20} className="text-red-600" />
                  Bảng thông số kỹ thuật chi tiết
                </h3>
                <button
                  onClick={() => setIsSpecsModalOpen(true)}
                  className="text-xs text-red-600 font-bold hover:underline"
                >
                  Mở dạng Pop-up
                </button>
              </div>

              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-xs sm:text-sm">
                  <tbody>
                    <tr className="border-b border-gray-200 bg-gray-50/80">
                      <td className="py-3 px-4 font-bold text-gray-700 w-1/3">Màn hình</td>
                      <td className="py-3 px-4 text-gray-900">{product.specs.screen}</td>
                    </tr>
                    <tr className="border-b border-gray-200 bg-white">
                      <td className="py-3 px-4 font-bold text-gray-700">Cảm biến hình ảnh</td>
                      <td className="py-3 px-4 text-gray-900">{product.specs.sensor}</td>
                    </tr>
                    <tr className="border-b border-gray-200 bg-gray-50/80">
                      <td className="py-3 px-4 font-bold text-gray-700">Độ phân giải video</td>
                      <td className="py-3 px-4 text-gray-900">{product.specs.resolution}</td>
                    </tr>
                    <tr className="border-b border-gray-200 bg-white">
                      <td className="py-3 px-4 font-bold text-gray-700">Vi xử lý / Chipset</td>
                      <td className="py-3 px-4 text-gray-900">{product.specs.chip}</td>
                    </tr>
                    <tr className="border-b border-gray-200 bg-gray-50/80">
                      <td className="py-3 px-4 font-bold text-gray-700">Dung lượng Pin & Sạc</td>
                      <td className="py-3 px-4 text-gray-900">{product.specs.battery}</td>
                    </tr>
                    <tr className="border-b border-gray-200 bg-white">
                      <td className="py-3 px-4 font-bold text-gray-700">Công nghệ chống rung</td>
                      <td className="py-3 px-4 text-gray-900">{product.specs.stabilization}</td>
                    </tr>
                    <tr className="border-b border-gray-200 bg-gray-50/80">
                      <td className="py-3 px-4 font-bold text-gray-700">Trọng lượng</td>
                      <td className="py-3 px-4 text-gray-900">{product.specs.weight}</td>
                    </tr>
                    <tr className="border-b border-gray-200 bg-white">
                      <td className="py-3 px-4 font-bold text-gray-700">Kết nối không dây</td>
                      <td className="py-3 px-4 text-gray-900">{product.specs.connectivity}</td>
                    </tr>
                    <tr className="bg-gray-50/80">
                      <td className="py-3 px-4 font-bold text-gray-700">Hệ điều hành tương thích</td>
                      <td className="py-3 px-4 text-gray-900">{product.specs.os}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: BUYER REVIEWS & RATINGS SYSTEM */}
          {activeTab === 'reviews' && (
            <div id="reviews-section" className="space-y-6">
              
              {/* Header Box: Rating Score + Progress Bars + Write Review Button */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-red-50/30 border border-amber-200/80 flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* Left: Big Score */}
                <div className="flex items-center gap-4 text-center md:text-left shrink-0">
                  <div>
                    <div className="text-4xl sm:text-5xl font-black text-amber-500 tracking-tight">
                      {averageRating}
                      <span className="text-lg font-bold text-gray-400">/5</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start text-amber-400 gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < Math.round(Number(averageRating)) ? 'fill-amber-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 font-medium">
                      ({reviewsList.length} lượt đánh giá thực tế)
                    </p>
                  </div>
                </div>

                {/* Middle: Star breakdown progress bars */}
                <div className="flex-1 w-full max-w-xs sm:max-w-sm space-y-1.5">
                  {starCounts.map((item) => (
                    <div key={item.star} className="flex items-center gap-2 text-xs">
                      <span className="w-9 text-gray-600 flex items-center gap-0.5 shrink-0 font-medium">
                        {item.star} <Star size={11} className="fill-amber-400 text-amber-400" />
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                      <span className="w-8 text-gray-400 text-right text-[11px] shrink-0">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Right: Write Review CTA Button */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <p className="text-xs text-gray-600 text-center font-medium">
                    Bạn đã sử dụng sản phẩm này?
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95"
                  >
                    <Edit3 size={16} />
                    <span>Viết đánh giá ngay</span>
                  </button>
                </div>

              </div>

              {/* Filter Pills Strip */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                <span className="text-xs text-gray-500 font-medium shrink-0 flex items-center gap-1">
                  <SlidersHorizontal size={13} /> Lọc xem:
                </span>

                <button
                  onClick={() => setSelectedStarFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    selectedStarFilter === 'all'
                      ? 'bg-red-600 border-red-600 text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Tất cả ({reviewsList.length})
                </button>

                <button
                  onClick={() => setSelectedStarFilter('has_image')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                    selectedStarFilter === 'has_image'
                      ? 'bg-red-600 border-red-600 text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Camera size={13} />
                  <span>Có hình ảnh ({reviewsList.filter((r) => r.images && r.images.length > 0).length})</span>
                </button>

                {[5, 4, 3, 2, 1].map((s) => {
                  const count = reviewsList.filter((r) => r.rating === s).length;
                  return (
                    <button
                      key={s}
                      onClick={() => setSelectedStarFilter(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1 ${
                        selectedStarFilter === s
                          ? 'bg-red-600 border-red-600 text-white shadow-sm'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{s} sao</span>
                      <span className="text-[10px] opacity-80">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Reviews Feed */}
              {filteredReviews.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  <MessageSquare size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm font-semibold text-gray-600">Chưa có đánh giá nào theo bộ lọc này</p>
                  <button
                    onClick={() => setSelectedStarFilter('all')}
                    className="text-xs text-red-600 font-bold hover:underline mt-1"
                  >
                    Xem tất cả đánh giá
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 sm:p-5 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 transition-all shadow-sm"
                    >
                      {/* Top Row: User name, verified badge, stars, date */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-700 to-gray-900 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                            {rev.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs sm:text-sm text-gray-900">{rev.name}</span>
                              {rev.isVerified && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1">
                                  <CheckCircle2 size={11} className="text-emerald-600" />
                                  Đã mua tại Pig Store
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex items-center text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={12}
                                    className={i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                                  />
                                ))}
                              </div>
                              <span className="text-[11px] text-gray-400">{rev.date}</span>
                            </div>
                          </div>
                        </div>

                        {/* Thumbs up / Like button */}
                        <button
                          type="button"
                          onClick={() => handleLikeReview(rev.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-all ${
                            rev.isLiked
                              ? 'bg-red-50 border-red-200 text-red-600 font-bold'
                              : 'border-gray-200 hover:bg-gray-50 text-gray-500'
                          }`}
                        >
                          <ThumbsUp size={12} className={rev.isLiked ? 'fill-red-600' : ''} />
                          <span>Hữu ích ({rev.likes})</span>
                        </button>
                      </div>

                      {/* Review Comment Text */}
                      <p className="text-xs sm:text-sm text-gray-800 leading-relaxed mb-3">
                        {rev.comment}
                      </p>

                      {/* Attached Customer Photos */}
                      {rev.images && rev.images.length > 0 && (
                        <div className="flex items-center gap-2.5 flex-wrap pt-1">
                          {rev.images.map((imgSrc, imgIdx) => (
                            <button
                              key={imgIdx}
                              type="button"
                              onClick={() => setSelectedReviewImageModal(imgSrc)}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 hover:scale-105 transition-transform duration-200 cursor-pointer"
                            >
                              <img src={imgSrc} alt="Buyer photo" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          4. STICKY BOTTOM FLOATING BAR (Exact match to Image 1)
         ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-50 py-2.5 px-4 sm:px-8"
          >
            <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
              
              {/* Product mini info */}
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={selectedColor?.image || product.heroImage}
                  alt={product.name}
                  className="w-10 h-10 object-contain rounded-lg border border-gray-200 p-0.5 bg-gray-50 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                    {product.name} - {selectedColor?.name || ''}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs sm:text-sm font-black text-red-600">
                      {formatPrice(currentPrice)}
                    </span>
                    {currentOriginalPrice > currentPrice && (
                      <span className="text-[11px] text-gray-400 line-through hidden sm:inline">
                        {formatPrice(currentOriginalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => alert('Trả góp 0% thủ tục online trong 5 phút!')}
                  className="hidden md:inline-flex px-3.5 py-2 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold transition-all"
                >
                  Trả góp 0%
                </button>

                <button
                  type="button"
                  onClick={handleBuyNowClick}
                  className="px-5 sm:px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md active:scale-95"
                >
                  Mua Ngay
                </button>

                <button
                  type="button"
                  title="Thêm vào giỏ"
                  onClick={handleAddToCartClick}
                  className="p-2 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 transition-all flex items-center justify-center"
                >
                  <ShoppingCart size={18} />
                </button>

                <a
                  href="tel:02839234675"
                  className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-all shadow-sm"
                >
                  <Phone size={14} />
                  <span>Liên hệ</span>
                </a>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════
          5. MODAL: VIẾT ĐÁNH GIÁ SẢN PHẨM (Review Submission)
         ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-3">
                  <img
                    src={product.heroImage}
                    alt={product.name}
                    className="w-10 h-10 object-contain rounded-lg border border-gray-200 bg-white p-1"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">Đánh giá sản phẩm</h3>
                    <p className="text-xs text-gray-500 truncate max-w-[240px] sm:max-w-xs">{product.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-200/80 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Form Body */}
              <form onSubmit={handleSubmitReview} className="p-5 sm:p-6 overflow-y-auto space-y-4">
                
                {/* 1. Star Rating Selection */}
                <div className="text-center py-2 bg-amber-50/50 rounded-2xl border border-amber-200/60 p-4">
                  <p className="text-xs font-bold text-gray-700 mb-2">Bạn cảm thấy sản phẩm này thế nào?</p>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const isActive = (hoverRating || reviewFormData.rating) >= starVal;
                      return (
                        <button
                          key={starVal}
                          type="button"
                          onMouseEnter={() => setHoverRating(starVal)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setReviewFormData({ ...reviewFormData, rating: starVal })}
                          className="p-1 text-amber-400 hover:scale-125 transition-transform"
                        >
                          <Star
                            size={28}
                            className={isActive ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs font-bold text-amber-600 mt-2">
                    {ratingLabels[hoverRating || reviewFormData.rating]}
                  </p>
                </div>

                {/* 2. Review Textarea */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Nội dung nhận xét <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Mời bạn chia sẻ cảm nhận về sản phẩm (độ nét camera, thời lượng pin, thiết kế, đóng gói giao hàng...)..."
                    value={reviewFormData.comment}
                    onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                    className="w-full bg-gray-50 focus:bg-white border border-gray-200 rounded-xl p-3.5 text-xs text-gray-900 focus:outline-none focus:border-red-500 transition-colors resize-none"
                  />
                </div>

                {/* 3. Upload Actual Photos / Videos from Customer */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <Camera size={15} className="text-red-600" />
                      Gửi hình ảnh thực tế (Tối đa 5 ảnh)
                    </label>
                    <span className="text-[11px] text-gray-400">{reviewFormData.images.length}/5</span>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />

                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Add Image Button */}
                    {reviewFormData.images.length < 5 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl border-2 border-dashed border-gray-300 hover:border-red-500 text-gray-500 hover:text-red-600 bg-gray-50 flex flex-col items-center justify-center gap-1 transition-all"
                      >
                        <Camera size={20} />
                        <span className="text-[10px] font-bold">Thêm ảnh</span>
                      </button>
                    )}

                    {/* Image Previews */}
                    {reviewFormData.images.map((imgUrl, idx) => (
                      <div key={idx} className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 group">
                        <img src={imgUrl} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Buyer Info Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={reviewFormData.name}
                      onChange={(e) => setReviewFormData({ ...reviewFormData, name: e.target.value })}
                      className="w-full bg-gray-50 focus:bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Số điện thoại (để xác thực đơn hàng)
                    </label>
                    <input
                      type="tel"
                      placeholder="Ví dụ: 0912 345 678"
                      value={reviewFormData.phone}
                      onChange={(e) => setReviewFormData({ ...reviewFormData, phone: e.target.value })}
                      className="w-full bg-gray-50 focus:bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-md active:scale-95"
                  >
                    Gửi đánh giá ngay
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════
          6. MODAL: TECH SPECS POP-UP ("Thông số kỹ thuật")
         ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isSpecsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Sliders size={18} className="text-red-600" />
                  Thông số kỹ thuật {product.name}
                </h3>
                <button
                  onClick={() => setIsSpecsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-200/80 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-3">
                <table className="w-full text-xs text-left">
                  <tbody>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <td className="py-2.5 px-3 font-semibold text-gray-600 w-1/3">Màn hình</td>
                      <td className="py-2.5 px-3 font-medium text-gray-900">{product.specs.screen}</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-white">
                      <td className="py-2.5 px-3 font-semibold text-gray-600">Cảm biến</td>
                      <td className="py-2.5 px-3 font-medium text-gray-900">{product.specs.sensor}</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <td className="py-2.5 px-3 font-semibold text-gray-600">Độ phân giải</td>
                      <td className="py-2.5 px-3 font-medium text-gray-900">{product.specs.resolution}</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-white">
                      <td className="py-2.5 px-3 font-semibold text-gray-600">Vi xử lý</td>
                      <td className="py-2.5 px-3 font-medium text-gray-900">{product.specs.chip}</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <td className="py-2.5 px-3 font-semibold text-gray-600">Pin & Sạc</td>
                      <td className="py-2.5 px-3 font-medium text-gray-900">{product.specs.battery}</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-white">
                      <td className="py-2.5 px-3 font-semibold text-gray-600">Chống rung</td>
                      <td className="py-2.5 px-3 font-medium text-gray-900">{product.specs.stabilization}</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <td className="py-2.5 px-3 font-semibold text-gray-600">Trọng lượng</td>
                      <td className="py-2.5 px-3 font-medium text-gray-900">{product.specs.weight}</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-white">
                      <td className="py-2.5 px-3 font-semibold text-gray-600">Kết nối</td>
                      <td className="py-2.5 px-3 font-medium text-gray-900">{product.specs.connectivity}</td>
                    </tr>
                    <tr className="bg-gray-50/50">
                      <td className="py-2.5 px-3 font-semibold text-gray-600">Hệ điều hành</td>
                      <td className="py-2.5 px-3 font-medium text-gray-900">{product.specs.os}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setIsSpecsModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-black transition-all"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════
          7. MODAL: LIGHTBOX IMAGE REVIEW VIEWER
         ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedReviewImageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-3xl w-full max-h-[85vh] flex items-center justify-center"
            >
              <button
                onClick={() => setSelectedReviewImageModal(null)}
                className="absolute -top-12 right-0 w-9 h-9 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all"
              >
                <X size={20} />
              </button>
              <img
                src={selectedReviewImageModal}
                alt="Enlarged review photo"
                className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/20"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>



    </div>
  );
}
