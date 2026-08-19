import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, X, Box, Tag, Layers, DollarSign } from 'lucide-react';

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/crm`;
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const CATEGORY_LIST = [
  'iPhone 17 Series',
  'iPhone 16 Series',
  'iPhone 15 Series',
  'iPhone 14 Series',
  'iPhone 13',
  'Mac & MacBook',
  'iPad',
  'Apple Watch',
  'Phụ kiện Apple'
];

// Hàm nén ảnh tự động client-side (chuyển sang WebP/JPEG max 1200px)
const compressImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.82) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP).'));
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const ProductManagement = () => {
  const context = useOutletContext() || {};
  const user = context.user;
  const role = (user?.role || 'SUPER_ADMIN').toUpperCase();
  const isAuthorized = role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MANAGER';

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    basePrice: '',
    heroImage: '',
    description: '',
    edition: '',
    watermarkText: '',
    camera: { main: '', ultraWide: '', telephoto: '', zoom: '' },
    performance: { chipName: '', cpuCores: '', gpuCores: '', batteryCapacity: '', chargingSpeed: '' },
    design: { name: '', description: '' },
    variants: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [uploadingVariantIndex, setUploadingVariantIndex] = useState(null);
  const [forbidden, setForbidden] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'add'

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    if (!isAuthorized) {
      setForbidden(true);
    } else {
      setForbidden(false);
      fetchProducts();
    }
  }, [isAuthorized]);

  useEffect(() => {
    if (!isAuthorized) {
      setForbidden(true);
    } else {
      setForbidden(false);
    }
  }, [isAuthorized]);

  const handleAddVariant = () => {
    setNewProduct(prev => ({
      ...prev,
      variants: [...prev.variants, { color: '', storage: '', price: '', stockQuantity: 0, image: '' }]
    }));
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...newProduct.variants];
    updatedVariants[index][field] = value;
    setNewProduct(prev => ({ ...prev, variants: updatedVariants }));
  };

  const handleRemoveVariant = (index) => {
    setNewProduct(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (e, type, variantIndex = null) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      if (type === 'hero') setIsUploadingHero(true);
      else setUploadingVariantIndex(variantIndex);

      // Nén ảnh client-side nhanh chóng, siêu nhẹ, không phụ thuộc server
      const compressedDataUrl = await compressImage(file);

      if (type === 'hero') {
        setNewProduct(prev => ({ ...prev, heroImage: compressedDataUrl }));
      } else {
        handleVariantChange(variantIndex, 'image', compressedDataUrl);
      }
    } catch (error) {
      console.error(error);
      alert('Đã xảy ra lỗi khi nén và tải ảnh: ' + (error.message || 'Không xác định'));
    } finally {
      if (type === 'hero') setIsUploadingHero(false);
      else setUploadingVariantIndex(null);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-CRM-Role': role
        },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        alert('Thêm sản phẩm thành công!');
        setNewProduct({ name: '', category: '', basePrice: '', heroImage: '', description: '', edition: '', watermarkText: '', camera: { main: '', ultraWide: '', telephoto: '', zoom: '' }, performance: { chipName: '', cpuCores: '', gpuCores: '', batteryCapacity: '', chargingSpeed: '' }, design: { name: '', description: '' }, variants: [] });
        setViewMode('list');
        fetchProducts();
      } else {
        const err = await res.json();
        alert('Lỗi: ' + (err.error || 'Không thể thêm sản phẩm'));
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi thêm sản phẩm.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-CRM-Role': role
        }
      });
      if (res.ok) {
        fetchProducts();
      } else {
        alert('Lỗi khi xóa sản phẩm');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (forbidden) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border border-red-500/20 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
          <X className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Truy Cập Bị Từ Chối</h2>
        <p className="text-xs text-[#86868b] max-w-md">
          Chỉ có <span className="text-red-400 font-semibold">MANAGER</span> hoặc <span className="text-red-400 font-semibold">SUPER_ADMIN</span> mới có quyền thêm sản phẩm.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Box className="w-6 h-6 text-indigo-400" /> Quản Lý Sản Phẩm
          </h1>
          <p className="text-sm text-[#86868b] mt-1">Danh sách sản phẩm động trên hệ thống.</p>
        </div>
        <button 
          onClick={() => setViewMode(viewMode === 'list' ? 'add' : 'list')}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          {viewMode === 'list' ? '+ Thêm Sản Phẩm' : 'Quay Lại'}
        </button>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-4">
          {/* Quick Category Filter Bar (Style Hình 2) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 border ${
                  selectedCategory === 'all'
                    ? 'bg-red-600 border-red-600 text-white shadow-sm scale-[1.02]'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm'
                }`}
              >
                Tất cả
              </button>
              {CATEGORY_LIST.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
                    selectedCategory === cat
                      ? 'bg-red-600 border-red-600 text-white shadow-sm scale-[1.02]'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold text-[#86868b] uppercase tracking-wider">
                  <th className="p-4">Sản phẩm</th>
                  <th className="p-4">Giá cơ bản</th>
                  <th className="p-4">Biến thể</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.filter(p => selectedCategory === 'all' || p.category?.toLowerCase() === selectedCategory.toLowerCase()).length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500 text-sm">
                      {selectedCategory === 'all' 
                        ? 'Chưa có sản phẩm nào.' 
                        : `Không có sản phẩm nào thuộc danh mục "${selectedCategory}".`}
                    </td>
                  </tr>
                ) : (
                  products
                    .filter(p => selectedCategory === 'all' || p.category?.toLowerCase() === selectedCategory.toLowerCase())
                    .map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {p.heroImage ? (
                              <img 
                                src={p.heroImage.startsWith('/uploads') ? `${BACKEND_URL}${p.heroImage}` : p.heroImage} 
                                alt={p.name} 
                                className="w-10 h-10 object-contain bg-gray-100 rounded-lg p-1" 
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Box className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{p.name}</div>
                              <div className="text-xs text-gray-500">{p.category || 'Chưa phân loại'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm font-medium text-gray-900">{Number(p.basePrice).toLocaleString()}đ</td>
                        <td className="p-4 text-xs text-gray-600">{p.variants?.length || 0} phiên bản</td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Thông tin chung */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
              <Tag className="w-4 h-4 text-indigo-400" /> Thông tin cơ bản
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#86868b] mb-1.5 uppercase tracking-wide">Tên sản phẩm *</label>
                <input 
                  type="text" 
                  required 
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="VD: iPhone 17 Pro Max"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#86868b] mb-1.5 uppercase tracking-wide">Danh mục</label>
                <input 
                  type="text" 
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="VD: Điện thoại, Laptop..."
                />
                {/* Quick select category chips */}
                <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] font-medium text-gray-500 mr-1">Gợi ý chọn nhanh:</span>
                  {CATEGORY_LIST.map((cat) => {
                    const isSelected = newProduct.category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewProduct({ ...newProduct, category: isSelected ? '' : cat })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-150 ${
                          isSelected
                            ? 'bg-red-600 border-red-600 text-white shadow-sm scale-105'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900 shadow-sm'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#86868b] mb-1.5 uppercase tracking-wide">Giá cơ bản (VNĐ) *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-[#86868b]" />
                  </div>
                  <input 
                    type="number" 
                    required 
                    value={newProduct.basePrice}
                    onChange={e => setNewProduct({...newProduct, basePrice: e.target.value})}
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="VD: 34999000"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#86868b] mb-1.5 uppercase tracking-wide">Hero Image (Ảnh sản phẩm)</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1 relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => handleImageUpload(e, 'hero')}
                      className="hidden"
                      id="hero-image-upload"
                    />
                    <label 
                      htmlFor="hero-image-upload"
                      className="cursor-pointer flex items-center justify-center w-full bg-gray-100 hover:bg-gray-200 border border-gray-200 border-dashed rounded-xl px-4 py-3 text-sm text-gray-700 hover:border-indigo-400 transition-all font-medium"
                    >
                      {isUploadingHero ? (
                        <div className="flex items-center gap-2">
                           <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                           Đang xử lý ảnh...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          📁 Tải ảnh từ máy tính (Tự động tối ưu nét & nhẹ)
                        </div>
                      )}
                    </label>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Hoặc dán trực tiếp link ảnh (URL)..."
                      value={newProduct.heroImage}
                      onChange={e => setNewProduct({ ...newProduct, heroImage: e.target.value })}
                      className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  {newProduct.heroImage && (
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200 shrink-0 bg-gray-50 flex items-center justify-center relative group shadow-sm">
                      <img src={newProduct.heroImage.startsWith('/uploads') ? `${BACKEND_URL}${newProduct.heroImage}` : newProduct.heroImage} alt="Preview" className="w-full h-full object-contain p-1" />
                      <button type="button" onClick={() => setNewProduct({...newProduct, heroImage: ''})} title="Xóa ảnh" className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#86868b] mb-1.5 uppercase tracking-wide">Edition / Phiên bản</label>
                <input 
                  type="text" 
                  value={newProduct.edition}
                  onChange={e => setNewProduct({...newProduct, edition: e.target.value})}
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="VD: TITANIUM BLACK"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#86868b] mb-1.5 uppercase tracking-wide">Mô tả ngắn</label>
                <textarea 
                  rows={2}
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="Nhập mô tả sản phẩm hiển thị trên trang bán hàng..."
                />
              </div>
            </div>
          </div>

          {/* Chi tiết cấu hình */}
          <div className="space-y-6 border-t border-gray-200 pt-6">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-2">
              <Layers className="w-4 h-4 text-purple-400" /> Chi tiết cấu hình (Specs)
            </h3>
            
            {/* Camera */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50 p-4 rounded-xl">
              <div className="md:col-span-2 font-medium text-sm text-gray-700">Camera</div>
              <div>
                <label className="block text-xs text-[#86868b] mb-1">Camera Chính</label>
                <input type="text" value={newProduct.camera.main} onChange={e => setNewProduct({...newProduct, camera: {...newProduct.camera, main: e.target.value}})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="VD: 48MP" />
              </div>
              <div>
                <label className="block text-xs text-[#86868b] mb-1">Góc siêu rộng</label>
                <input type="text" value={newProduct.camera.ultraWide} onChange={e => setNewProduct({...newProduct, camera: {...newProduct.camera, ultraWide: e.target.value}})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="VD: 12MP" />
              </div>
              <div>
                <label className="block text-xs text-[#86868b] mb-1">Telephoto</label>
                <input type="text" value={newProduct.camera.telephoto} onChange={e => setNewProduct({...newProduct, camera: {...newProduct.camera, telephoto: e.target.value}})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="VD: 12MP 5x" />
              </div>
              <div>
                <label className="block text-xs text-[#86868b] mb-1">Zoom</label>
                <input type="text" value={newProduct.camera.zoom} onChange={e => setNewProduct({...newProduct, camera: {...newProduct.camera, zoom: e.target.value}})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="VD: Optical zoom 5x" />
              </div>
            </div>

            {/* Performance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-gray-50 p-4 rounded-xl">
              <div className="md:col-span-3 font-medium text-sm text-gray-700">Hiệu năng & Pin</div>
              <div>
                <label className="block text-xs text-[#86868b] mb-1">Tên Chip</label>
                <input type="text" value={newProduct.performance.chipName} onChange={e => setNewProduct({...newProduct, performance: {...newProduct.performance, chipName: e.target.value}})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="VD: A19 Pro" />
              </div>
              <div>
                <label className="block text-xs text-[#86868b] mb-1">Số lõi CPU</label>
                <input type="text" value={newProduct.performance.cpuCores} onChange={e => setNewProduct({...newProduct, performance: {...newProduct.performance, cpuCores: e.target.value}})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="VD: 6 Lõi" />
              </div>
              <div>
                <label className="block text-xs text-[#86868b] mb-1">Số lõi GPU</label>
                <input type="text" value={newProduct.performance.gpuCores} onChange={e => setNewProduct({...newProduct, performance: {...newProduct.performance, gpuCores: e.target.value}})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="VD: 6 Lõi" />
              </div>
              <div>
                <label className="block text-xs text-[#86868b] mb-1">Dung lượng Pin (mAh)</label>
                <input type="number" value={newProduct.performance.batteryCapacity} onChange={e => setNewProduct({...newProduct, performance: {...newProduct.performance, batteryCapacity: e.target.value}})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="VD: 4422" />
              </div>
              <div>
                <label className="block text-xs text-[#86868b] mb-1">Tốc độ sạc (W)</label>
                <input type="number" value={newProduct.performance.chargingSpeed} onChange={e => setNewProduct({...newProduct, performance: {...newProduct.performance, chargingSpeed: e.target.value}})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="VD: 27" />
              </div>
            </div>
            
            {/* Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50 p-4 rounded-xl">
              <div className="md:col-span-2 font-medium text-sm text-gray-700">Thiết kế</div>
              <div>
                <label className="block text-xs text-[#86868b] mb-1">Tên thiết kế</label>
                <input type="text" value={newProduct.design.name} onChange={e => setNewProduct({...newProduct, design: {...newProduct.design, name: e.target.value}})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="VD: TITANIUM DESIGN" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-[#86868b] mb-1">Mô tả thiết kế</label>
                <textarea rows={2} value={newProduct.design.description} onChange={e => setNewProduct({...newProduct, design: {...newProduct.design, description: e.target.value}})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="Mô tả..." />
              </div>
            </div>
          </div>

          {/* Biến thể */}
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" /> Biến thể (Màu sắc, Dung lượng)
              </h3>
              <button 
                type="button" 
                onClick={handleAddVariant}
                className="text-xs bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-gray-900 px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm biến thể
              </button>
            </div>
            
            <div className="space-y-4">
              {newProduct.variants.length === 0 && (
                <div className="text-sm text-[#86868b] py-8 text-center border-2 border-dashed border-gray-200 rounded-xl bg-white/[0.01]">
                  Sản phẩm chưa có biến thể nào.<br/>(Mặc định sẽ sử dụng cấu hình và giá cơ bản)
                </div>
              )}
              
              {newProduct.variants.map((v, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-3 items-end p-4 bg-gradient-to-br from-white/[0.02] to-white/[0.01] border border-gray-100 rounded-xl relative group transition-all duration-300 hover:border-indigo-500/30 hover:shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                  <button 
                    type="button" 
                    onClick={() => handleRemoveVariant(idx)}
                    className="absolute -top-3 -right-3 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-gray-900 rounded-full p-1.5 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:scale-110 shadow-lg"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex-1 w-full md:w-auto">
                    <label className="block text-[11px] font-semibold text-[#86868b] mb-1.5 uppercase tracking-wide">Màu sắc</label>
                    <input type="text" value={v.color} onChange={e => handleVariantChange(idx, 'color', e.target.value)} placeholder="VD: Titan Sa Mạc" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                  </div>
                  <div className="flex-1 w-full md:w-auto">
                    <label className="block text-[11px] font-semibold text-[#86868b] mb-1.5 uppercase tracking-wide">Dung lượng</label>
                    <input type="text" value={v.storage} onChange={e => handleVariantChange(idx, 'storage', e.target.value)} placeholder="VD: 256GB" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                  </div>
                  <div className="flex-1 w-full md:w-auto">
                    <label className="block text-[11px] font-semibold text-[#86868b] mb-1.5 uppercase tracking-wide">Giá riêng (VNĐ)</label>
                    <input type="number" value={v.price} onChange={e => handleVariantChange(idx, 'price', e.target.value)} placeholder="Để trống = Giá cơ bản" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                  </div>
                  <div className="w-full md:w-24">
                    <label className="block text-[11px] font-semibold text-[#86868b] mb-1.5 uppercase tracking-wide">Tồn kho</label>
                    <input type="number" value={v.stockQuantity} onChange={e => handleVariantChange(idx, 'stockQuantity', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                  </div>
                  <div className="w-full md:w-60">
                    <label className="block text-[11px] font-semibold text-[#86868b] mb-1.5 uppercase tracking-wide">Hình ảnh</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={e => handleImageUpload(e, 'variant', idx)}
                          className="hidden"
                          id={`variant-image-upload-${idx}`}
                        />
                        <label 
                          htmlFor={`variant-image-upload-${idx}`}
                          className="cursor-pointer flex items-center justify-center w-full bg-white border border-gray-200 border-dashed rounded-lg px-2 py-2 text-[11px] font-medium text-gray-700 hover:bg-gray-50 hover:border-indigo-400 transition-all text-center truncate"
                        >
                          {uploadingVariantIndex === idx ? 'Đang xử lý...' : '📁 Tải ảnh'}
                        </label>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Dán URL..." 
                        value={v.image?.startsWith('data:') ? '' : (v.image || '')} 
                        onChange={e => handleVariantChange(idx, 'image', e.target.value)} 
                        className="w-24 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      />
                      {v.image && (
                        <div className="w-8 h-8 rounded-md overflow-hidden border border-gray-200 shrink-0 relative group bg-gray-50 flex items-center justify-center">
                          <img src={v.image.startsWith('/uploads') ? `${BACKEND_URL}${v.image}` : v.image} alt="Preview" className="w-full h-full object-contain" />
                          <button type="button" onClick={() => handleVariantChange(idx, 'image', '')} className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 flex justify-end">
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="px-6 py-3 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-gray-900 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
                  Đang lưu...
                </>
              ) : (
                'Thêm Sản Phẩm Vào Kho'
              )}
            </button>
          </div>
        </form>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
