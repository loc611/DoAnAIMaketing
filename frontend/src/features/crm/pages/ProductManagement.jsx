import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, X, Box, Tag, Layers, DollarSign } from 'lucide-react';

const API_BASE = `${import.meta.env.VITE_API_URL || ''}/api/v1/crm`;

const ProductManagement = () => {
  const context = useOutletContext() || {};
  const user = context.user;
  const role = (user?.role || 'SUPER_ADMIN').toUpperCase();
  const isAuthorized = role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MANAGER';

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    basePrice: '',
    variants: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forbidden, setForbidden] = useState(false);

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
      variants: [...prev.variants, { color: '', storage: '', price: '', stockQuantity: 0 }]
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
        setNewProduct({ name: '', category: '', basePrice: '', variants: [] });
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Box className="w-6 h-6 text-indigo-400" /> Thêm Sản Phẩm Mới
        </h1>
        <p className="text-sm text-[#86868b] mt-1">Quản lý và thêm sản phẩm vào kho hàng để nhân viên sales có thể tư vấn.</p>
      </div>

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
    </div>
  );
};

export default ProductManagement;
