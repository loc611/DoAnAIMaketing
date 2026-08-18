import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, X, Box, Tag, Layers, DollarSign } from 'lucide-react';

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/crm`;
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProductManagement = () => {
  const context = useOutletContext() || {};
  const user = context.user;
  const role = (user?.role || 'SUPER_ADMIN').toUpperCase();
  const isAuthorized = role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MANAGER';

  const [products, setProducts] = useState([]);
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

    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('token');
    
    try {
      if (type === 'hero') setIsUploadingHero(true);
      else setUploadingVariantIndex(variantIndex);

      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-CRM-Role': role
        },
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        if (type === 'hero') {
          setNewProduct(prev => ({ ...prev, heroImage: data.url }));
        } else {
          handleVariantChange(variantIndex, 'image', data.url);
        }
      } else {
        const err = await res.json();
        alert('Lỗi tải ảnh: ' + (err.error || 'Lỗi không xác định'));
      }
    } catch (error) {
      console.error(error);
      alert('Đã xảy ra lỗi khi tải ảnh.');
    } finally {
      if (type === 'hero') setIsUploadingHero(false);
      else setUploadingVariantIndex(null);
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
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
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
              {products.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500 text-sm">Chưa có sản phẩm nào.</td>
                </tr>
              ) : (
                products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {p.heroImage ? (
                          <img src={p.heroImage} alt={p.name} className="w-10 h-10 object-contain bg-gray-100 rounded-lg p-1" />
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
              <div>
                <label className="block text-xs font-semibold text-[#86868b] mb-1.5 uppercase tracking-wide">Danh mục</label>
                <input 
                  type="text" 
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="VD: Điện thoại, Laptop..."
                />
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
              <div>
                <label className="block text-xs font-semibold text-[#86868b] mb-1.5 uppercase tracking-wide">Hero Image (Ảnh sản phẩm)</label>
                <div className="flex items-center gap-4">
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
                      className="cursor-pointer flex items-center justify-center w-full bg-gray-100 border border-gray-200 border-dashed rounded-xl px-4 py-3 text-sm text-gray-600 hover:bg-gray-200 hover:border-indigo-400 transition-all"
                    >
                      {isUploadingHero ? (
                        <div className="flex items-center gap-2">
                           <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                           Đang tải lên...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Chọn ảnh tải lên...
                        </div>
                      )}
                    </label>
                  </div>
                  {newProduct.heroImage && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-gray-50 flex items-center justify-center relative group">
                      <img src={newProduct.heroImage.startsWith('/uploads') ? `${BACKEND_URL}${newProduct.heroImage}` : newProduct.heroImage} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setNewProduct({...newProduct, heroImage: ''})} className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
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
                  <div className="w-full md:w-48">
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
                          className="cursor-pointer flex items-center justify-center w-full bg-white border border-gray-200 border-dashed rounded-lg px-2 py-2 text-[11px] text-gray-600 hover:bg-gray-50 hover:border-indigo-400 transition-all"
                        >
                          {uploadingVariantIndex === idx ? 'Đang tải...' : 'Tải lên'}
                        </label>
                      </div>
                      {v.image && (
                        <div className="w-8 h-8 rounded-md overflow-hidden border border-gray-200 shrink-0 relative group">
                          <img src={v.image.startsWith('/uploads') ? `${BACKEND_URL}${v.image}` : v.image} alt="Preview" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => handleVariantChange(idx, 'image', '')} className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
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
