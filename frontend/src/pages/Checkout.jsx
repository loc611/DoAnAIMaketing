import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Store, Truck, MapPin, X, ArrowLeft, Ticket } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { getProvincesList, getDistrictsList, getWardsList, VIETNAM_PROVINCES } from '../data/vietnamLocations';
import { BANK_CONFIG } from '../config/bankConfig';

// Validation Schema
const checkoutSchema = z.object({
  // Customer Info
  customerEmail: z.string().email({ message: "Email không hợp lệ" }),
  receivePromotions: z.boolean().optional(),

  // Delivery Method
  deliveryMethod: z.enum(['store', 'delivery']),

  // Delivery details
  recipientName: z.string().optional(),
  recipientPhone: z.string().optional(),
  provinceCode: z.string().optional(),
  provinceName: z.string().optional(),
  districtCode: z.string().optional(),
  districtName: z.string().optional(),
  wardCode: z.string().optional(),
  wardName: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),

  // Store details
  storeProvince: z.string().optional(),
  storeDistrict: z.string().optional(),

  storeAddress: z.string().optional(),

  // Payment Method
  paymentMethod: z.enum(['cod', 'bank_transfer']).default('cod'),
}).superRefine((data, ctx) => {
  if (data.deliveryMethod === 'delivery') {
    if (!data.recipientName || data.recipientName.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Vui lòng nhập tên người nhận", path: ["recipientName"] });
    }
    if (!data.recipientPhone || !/^(0[3|5|7|8|9])+([0-9]{8})\b/.test(data.recipientPhone)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Số điện thoại không hợp lệ", path: ["recipientPhone"] });
    }
    if (!data.provinceCode) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Vui lòng chọn Tỉnh/Thành phố", path: ["provinceCode"] });
    }
    if (!data.districtCode) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Vui lòng chọn Quận/Huyện", path: ["districtCode"] });
    }
    if (!data.wardCode) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Vui lòng chọn Phường/Xã", path: ["wardCode"] });
    }
    if (!data.address) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Vui lòng nhập địa chỉ nhà", path: ["address"] });
    }
  } else if (data.deliveryMethod === 'store') {
    if (!data.storeProvince) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Vui lòng chọn Tỉnh/Thành phố", path: ["storeProvince"] });
    }
    if (!data.storeDistrict) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Vui lòng chọn Quận/Huyện", path: ["storeDistrict"] });
    }
    if (!data.storeAddress) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Vui lòng chọn cửa hàng", path: ["storeAddress"] });
    }
  }

});

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  
  // Nếu giỏ hàng trống thì quay về store
  useEffect(() => {
    if (cart.length === 0 && !isOrderPlaced) {
      navigate('/');
    }
  }, [cart, navigate, isOrderPlaced]);

  // Tính finalPrice bằng cách trừ đi 2.000.000đ (khuyến mãi cứng trên UI)
  const discountAmount = 2000000;
  const finalPrice = Math.max(0, totalPrice - discountAmount);

  const [provinces, setProvinces] = useState(() => VIETNAM_PROVINCES.map(p => ({ code: p.code, name: p.name })));
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [storeDistricts, setStoreDistricts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showQRModal, setShowQRModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);

  // User context (tự động lấy thông tin nếu đã đăng nhập)
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        return {
          fullName: u.fullName || u.fullname || '',
          phone: u.phone || '',
          email: u.email || '',
        };
      }
    } catch(e) {}
    return {
      fullName: '',
      phone: '',
      email: '',
    };
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerEmail: user.email,
      deliveryMethod: 'delivery',
      recipientName: user.fullName,
      recipientPhone: user.phone,
      paymentMethod: 'cod',
    }
  });

  const deliveryMethod = watch('deliveryMethod');
  const selectedProvinceCode = watch('provinceCode');
  const selectedDistrictCode = watch('districtCode');
  const selectedWardCode = watch('wardCode');
  const selectedStoreProvinceCode = watch('storeProvince');

  // Fetch Provinces on mount
  useEffect(() => {
    let isMounted = true;
    const fetchProvinces = async () => {
      try {
        const data = await getProvincesList();
        if (isMounted && data && data.length > 0) {
          setProvinces(data);
        }
      } catch (error) {
        console.error("Error loading provinces:", error);
      }
    };
    fetchProvinces();
    return () => { isMounted = false; };
  }, []);

  // Fetch Districts when Province changes
  useEffect(() => {
    if (selectedProvinceCode) {
      let isMounted = true;
      const fetchDistricts = async () => {
        try {
          const data = await getDistrictsList(selectedProvinceCode);
          if (isMounted) {
            setDistricts(data || []);
            setValue('districtCode', '');
            setValue('districtName', '');
            setValue('wardCode', '');
            setValue('wardName', '');
            setWards([]);
          }
        } catch (error) {
          console.error("Error loading districts:", error);
        }
      };
      fetchDistricts();

      const prov = provinces.find(p => p.code.toString() === selectedProvinceCode.toString());
      if (prov) setValue('provinceName', prov.name);
      return () => { isMounted = false; };
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [selectedProvinceCode, provinces, setValue]);

  // Fetch Wards when District changes
  useEffect(() => {
    if (selectedDistrictCode) {
      let isMounted = true;
      const fetchWards = async () => {
        try {
          const data = await getWardsList(selectedDistrictCode);
          if (isMounted) {
            setWards(data || []);
            setValue('wardCode', '');
            setValue('wardName', '');
          }
        } catch (error) {
          console.error("Error loading wards:", error);
        }
      };
      fetchWards();

      const dist = districts.find(d => d.code.toString() === selectedDistrictCode.toString());
      if (dist) setValue('districtName', dist.name);
      return () => { isMounted = false; };
    } else {
      setWards([]);
    }
  }, [selectedDistrictCode, districts, setValue]);

  // Sync Ward Name
  useEffect(() => {
    if (selectedWardCode && wards.length > 0) {
      const ward = wards.find(w => w.code.toString() === selectedWardCode.toString());
      if (ward) setValue('wardName', ward.name);
    }
  }, [selectedWardCode, wards, setValue]);

  // Fetch Store Districts when Store Province changes
  useEffect(() => {
    if (selectedStoreProvinceCode) {
      let isMounted = true;
      const fetchStoreDistricts = async () => {
        try {
          const data = await getDistrictsList(selectedStoreProvinceCode);
          if (isMounted) {
            setStoreDistricts(data || []);
            setValue('storeDistrict', '');
            setValue('storeAddress', '');
          }
        } catch (error) {
          console.error("Error loading store districts:", error);
        }
      };
      fetchStoreDistricts();
      return () => { isMounted = false; };
    } else {
      setStoreDistricts([]);
    }
  }, [selectedStoreProvinceCode, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      const authUser = userStr ? JSON.parse(userStr) : null;

      const payload = {
        userId: authUser ? authUser.id : null,
        fullName: data.deliveryMethod === 'delivery' ? data.recipientName : user.fullName,
        phone: data.deliveryMethod === 'delivery' ? data.recipientPhone : user.phone,
        shippingAddress: data.deliveryMethod === 'delivery'
          ? `${data.address}, ${data.wardName}, ${data.districtName}, ${data.provinceName}`
          : data.storeAddress,
        paymentMethod: data.paymentMethod === 'cod' ? 'COD' : 'BANK_TRANSFER',
        notes: data.notes || '',
        totalAmount: finalPrice,
        items: cart.map(item => ({
          productName: item.name,
          selectedColor: item.color,
          selectedStorage: item.storage,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        }))
      };

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/orders`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errData = '';
        try {
          errData = await response.text();
        } catch(e) {
          errData = 'Không thể đọc phản hồi từ server';
        }
        console.error('Backend error status:', response.status, 'data:', errData);
        throw new Error('Thanh toán thất bại (Status: ' + response.status + '): ' + errData);
      }

      const responseData = await response.json();
      const orderId = responseData.orderId || '';

      setIsOrderPlaced(true);
      
      if (data.paymentMethod === 'bank_transfer') {
        setCreatedOrderId(orderId);
        setShowQRModal(true);
      } else {
        clearCart();
        navigate(`/checkout/result?status=success&orderId=${orderId}`);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Đã xảy ra lỗi: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0 && !isOrderPlaced) return null;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 pt-8 pb-20 font-sans">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Back Button */}
        <div className="flex items-center gap-2 mb-6 cursor-pointer hover:text-blue-600 transition-colors w-max" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          <span className="font-medium">Quay lại giỏ hàng / Thông tin thanh toán</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-6">

          {/* LEFT COLUMN */}
          <div className="flex-1 space-y-4">

            {/* Customer Info Section */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between gap-6">
                <div>
                  <h2 className="text-lg font-bold mb-1">Thông tin khách hàng</h2>
                  <p className="font-semibold">{user.fullName}</p>
                  <p className="text-gray-600 text-base mb-2">{user.phone}</p>
                  <span className="bg-gray-200 text-sm px-2 py-1 rounded-full font-medium">S-NULL</span>
                </div>
                <div className="flex-1 max-w-sm border-l border-gray-100 pl-6">
                  <div className="mb-2">
                    <label className="block text-base text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <input
                        {...register('customerEmail')}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-base ${errors.customerEmail ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Nhập email"
                      />
                      {watch('customerEmail') && (
                        <button type="button" onClick={() => setValue('customerEmail', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    {errors.customerEmail && <p className="text-red-500 text-sm mt-1">{errors.customerEmail.message}</p>}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" {...register('receivePromotions')} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label className="text-base text-gray-700">Nhận email thông báo và ưu đãi từ hệ thống</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Method Section */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
                <h2 className="text-lg font-bold">Chọn hình thức nhận hàng</h2>
                <div className="flex bg-gray-100 rounded-full p-1 border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setValue('deliveryMethod', 'store')}
                    className={`px-4 py-1.5 rounded-full text-base font-medium transition-colors ${deliveryMethod === 'store' ? 'bg-white text-blue-600 shadow-sm border border-blue-200' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    Nhận tại cửa hàng
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('deliveryMethod', 'delivery')}
                    className={`px-4 py-1.5 rounded-full text-base font-medium transition-colors ${deliveryMethod === 'delivery' ? 'bg-white text-blue-600 shadow-sm border border-blue-200' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    Giao hàng tận nơi
                  </button>
                </div>
              </div>

              {/* Delivery Details */}
              {deliveryMethod === 'delivery' && (
                <div className="space-y-4 mt-4 border-t border-gray-100 pt-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base mb-1 text-gray-700">Tên người nhận</label>
                      <div className="relative">
                        <input
                          {...register('recipientName')}
                          className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-base ${errors.recipientName ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="Nhập tên người nhận"
                        />
                        {watch('recipientName') && (
                          <button type="button" onClick={() => setValue('recipientName', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      {errors.recipientName && <p className="text-red-500 text-sm mt-1">{errors.recipientName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-base mb-1 text-gray-700">Số điện thoại người nhận</label>
                      <div className="relative">
                        <input
                          {...register('recipientPhone')}
                          className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-base ${errors.recipientPhone ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="Nhập SĐT người nhận"
                        />
                        {watch('recipientPhone') && (
                          <button type="button" onClick={() => setValue('recipientPhone', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      {errors.recipientPhone && <p className="text-red-500 text-sm mt-1">{errors.recipientPhone.message}</p>}
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-base font-medium text-gray-700 mb-2">Địa chỉ nhận hàng</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-base mb-1 text-gray-700">Tỉnh/Thành phố</label>
                        <select
                          {...register('provinceCode')}
                          className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-base ${errors.provinceCode ? 'border-red-500' : 'border-gray-300'}`}
                        >
                          <option value="">Chọn Tỉnh/Thành phố</option>
                          {provinces.map(p => (
                            <option key={p.code} value={p.code}>{p.name}</option>
                          ))}
                        </select>
                        {errors.provinceCode && <p className="text-red-500 text-sm mt-1">{errors.provinceCode.message}</p>}
                      </div>
                      <div>
                        <label className="block text-base mb-1 text-gray-700">Quận/Huyện</label>
                        <select
                          {...register('districtCode')}
                          disabled={!selectedProvinceCode}
                          className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-base disabled:bg-gray-50 ${errors.districtCode ? 'border-red-500' : 'border-gray-300'}`}
                        >
                          <option value="">Chọn Quận/Huyện</option>
                          {districts.map(d => (
                            <option key={d.code} value={d.code}>{d.name}</option>
                          ))}
                        </select>
                        {errors.districtCode && <p className="text-red-500 text-sm mt-1">{errors.districtCode.message}</p>}
                      </div>
                      <div>
                        <label className="block text-base mb-1 text-gray-700">Phường/Xã</label>
                        <select
                          {...register('wardCode')}
                          disabled={!selectedDistrictCode}
                          className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-base disabled:bg-gray-50 ${errors.wardCode ? 'border-red-500' : 'border-gray-300'}`}
                        >
                          <option value="">Chọn Phường/Xã</option>
                          {wards.map(w => (
                            <option key={w.code} value={w.code}>{w.name}</option>
                          ))}
                        </select>
                        {errors.wardCode && <p className="text-red-500 text-sm mt-1">{errors.wardCode.message}</p>}
                      </div>
                      <div>
                        <label className="block text-base mb-1 text-gray-700">Địa chỉ nhà</label>
                        <input
                          {...register('address')}
                          className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-base ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="Nhập địa chỉ nhà"
                        />
                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 mb-2">
                    <input type="checkbox" id="saveAddr" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="saveAddr" className="text-base text-blue-600">Lưu địa chỉ cho lần mua kế tiếp</label>
                  </div>

                  <div>
                    <label className="block text-base mb-1 text-gray-700">Ghi chú (nếu có)</label>
                    <input
                      {...register('notes')}
                      className="w-full px-3 py-2 border rounded-lg bg-white border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-base"
                      placeholder="Nhập ghi chú"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      <span className="font-bold text-gray-700">Mẹo:</span> Bạn có thể cài đặt Sổ địa chỉ tại <span className="font-bold text-gray-700">Pig Member</span> để đặt hàng nhanh hơn.
                    </p>
                  </div>
                </div>
              )}

              {/* Store Details (Simplified) */}
              {deliveryMethod === 'store' && (
                <div className="space-y-4 mt-4 border-t border-gray-100 pt-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base mb-1 text-gray-700">Tỉnh/Thành phố</label>
                      <select
                        {...register('storeProvince')}
                        className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-base ${errors.storeProvince ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="">Chọn Tỉnh/Thành phố</option>
                        {provinces.length > 0 ? provinces.map(p => (
                          <option key={p.code} value={p.code}>{p.name}</option>
                        )) : <option value="" disabled>Đang tải...</option>}
                      </select>
                      {errors.storeProvince && <p className="text-red-500 text-sm mt-1">{errors.storeProvince.message}</p>}
                    </div>
                    <div>
                      <label className="block text-base mb-1 text-gray-700">Quận/Huyện</label>
                      <select
                        {...register('storeDistrict')}
                        disabled={!selectedStoreProvinceCode}
                        className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-base disabled:bg-gray-50 ${errors.storeDistrict ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="">Chọn Quận/Huyện</option>
                        {storeDistricts.length > 0 ? storeDistricts.map(d => (
                          <option key={d.code} value={d.code}>{d.name}</option>
                        )) : <option value="" disabled>Vui lòng chọn Tỉnh/Thành phố trước</option>}
                      </select>
                      {errors.storeDistrict && <p className="text-red-500 text-sm mt-1">{errors.storeDistrict.message}</p>}
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="block text-base mb-1 text-gray-700">Cửa hàng</label>
                    <select
                      {...register('storeAddress')}
                      disabled={!watch('storeDistrict')}
                      className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-base disabled:bg-gray-50 ${errors.storeAddress ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Chọn địa chỉ cửa hàng</option>
                      <option value="Store 1">134 Nguyễn Thái Học, Quận 1</option>
                      <option value="Store 2">55B Trần Quang Khải, Quận 1</option>
                    </select>
                    {errors.storeAddress && <p className="text-red-500 text-sm mt-1">{errors.storeAddress.message}</p>}
                  </div>
                  <div>
                    <label className="block text-base mb-1 text-gray-700">Ghi chú (nếu có)</label>
                    <input
                      {...register('notes')}
                      className="w-full px-3 py-2 border rounded-lg bg-white border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-base"
                      placeholder="Nhập ghi chú"
                    />
                  </div>
                </div>
              )}
            </div>



          </div>

          {/* RIGHT COLUMN */}
          <div className="w-full lg:w-[500px] space-y-4">

            {/* Product Summary */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h3 className="font-bold mb-4 text-gray-900">Danh sách sản phẩm</h3>
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-start border-b border-gray-200 pb-4 mb-4">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-white rounded-lg border flex items-center justify-center p-1">
                      <img src={item.image || 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-bluetitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692846360609'} alt={item.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 leading-tight text-base">{item.name}</h4>
                      <p className="text-base text-gray-500 mt-1">{item.color} | {item.storage}</p>
                      <p className="text-base text-gray-500">Số lượng: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600 text-base">{item.price.toLocaleString('vi-VN')}đ</p>
                  </div>
                </div>
              ))}

              {/* Order Details */}
              <h3 className="font-bold mb-3 text-gray-900">Thông tin đơn hàng</h3>

              <div className="flex justify-between items-center bg-red-50/30 border border-red-100 rounded-lg p-3 mb-4 cursor-pointer hover:bg-red-50 transition-colors">
                <div className="flex items-center gap-2 text-red-600">
                  <Ticket size={18} />
                  <span className="font-medium text-base">Áp dụng mã giảm giá</span>
                </div>
                <span className="text-red-500 text-sm font-medium bg-red-100 px-3 py-1.5 rounded-md">Chọn</span>
              </div>

              <div className="space-y-3 text-base text-gray-700 border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between">
                  <span>Số lượng sản phẩm</span>
                  <span className="font-medium text-gray-900">{cart.reduce((total, item) => total + item.quantity, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tổng tiền hàng</span>
                  <span className="font-medium text-gray-900">{totalPrice.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium text-gray-900">Miễn phí</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá trực tiếp</span>
                  <span className="font-medium">- 2.000.000đ</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-1">
                <div>
                  <span className="font-bold text-gray-900">TỔNG TIỀN</span>
                  <p className="text-xs text-gray-500">(Đã bao gồm VAT và thuế phí)</p>
                </div>
                <span className="text-xl font-bold text-red-600">{finalPrice.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-sm text-green-600 font-medium">
                <span>Bạn đã tiết kiệm được</span>
                <span>- 2.000.000đ</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h3 className="font-bold mb-4 text-gray-900">Chọn phương thức thanh toán</h3>

              <label className={`flex items-center justify-between p-3 border rounded-lg bg-white cursor-pointer mb-3 ${watch('paymentMethod') === 'cod' ? 'border-red-500' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded text-xl">
                    💵
                  </div>
                  <span className="font-medium text-base text-gray-900">Thanh toán khi nhận hàng (COD)</span>
                </div>
                <input type="radio" value="cod" {...register('paymentMethod')} className="text-red-500 focus:ring-red-500" />
              </label>

              <label className={`flex items-center justify-between p-3 border rounded-lg bg-white cursor-pointer mb-5 ${watch('paymentMethod') === 'bank_transfer' ? 'border-red-500' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded text-xl">
                    💳
                  </div>
                  <span className="font-medium text-base text-gray-900">Chuyển khoản ngân hàng</span>
                </div>
                <input type="radio" value="bank_transfer" {...register('paymentMethod')} className="text-red-500 focus:ring-red-500" />
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-lg uppercase tracking-wide transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Thanh Toán'}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Bằng việc đặt hàng, bạn đồng ý với <a href="#" className="text-blue-600 hover:underline">Điều khoản sử dụng</a> của hệ thống
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* QR Code Modal for Bank Transfer */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 lg:p-8 relative shadow-2xl">
            <button 
              onClick={() => {
                clearCart();
                navigate(`/checkout/result?status=pending&orderId=${createdOrderId}`);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <X size={24} />
            </button>
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán chuyển khoản</h3>
              <p className="text-gray-600">Quét mã QR qua ứng dụng ngân hàng của bạn để thanh toán.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
              {/* Left Column: QR Code */}
              <div className="flex-1 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0 md:pr-8 lg:pr-12">
                <div className="bg-gray-50 p-4 rounded-xl mb-4 w-full max-w-[280px] aspect-square flex items-center justify-center border border-gray-200 shadow-inner">
                   <img 
                     src={`https://img.vietqr.io/image/${BANK_CONFIG.BANK_ID}-${BANK_CONFIG.ACCOUNT_NUMBER}-compact.jpg?amount=${finalPrice}&addInfo=Thanh toan don hang ${createdOrderId}&accountName=${encodeURIComponent(BANK_CONFIG.ACCOUNT_NAME)}`} 
                     alt="QR Code" 
                     className="w-full h-full object-contain mix-blend-multiply" 
                   />
                </div>
                <p className="text-sm text-gray-500 text-center">Sử dụng App ngân hàng để quét mã</p>
              </div>

              {/* Right Column: Order Info & Bank Details */}
              <div className="flex-[1.2] flex flex-col">
                <h4 className="font-bold text-gray-900 mb-3 text-lg">Thông tin đơn hàng</h4>
                
                {/* Product List */}
                <div className="max-h-48 overflow-y-auto pr-2 mb-6 space-y-4">
                  {cart.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-lg border flex items-center justify-center p-2 shrink-0">
                         <img src={item.image || 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-bluetitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692846360609'} alt={item.name} className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h5 className="font-medium text-gray-900 text-sm sm:text-base leading-tight line-clamp-2">{item.name}</h5>
                        <p className="text-sm text-gray-500 mt-1">{item.color} | {item.storage} x {item.quantity}</p>
                      </div>
                      <div className="text-right flex items-center">
                        <p className="font-semibold text-red-600 text-sm sm:text-base">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bank Transfer Details */}
                <h4 className="font-bold text-gray-900 mb-3 pt-5 border-t border-gray-100 text-lg">Chi tiết chuyển khoản</h4>
                <div className="w-full space-y-3 bg-gray-50 p-5 rounded-xl mb-6 text-sm text-gray-700 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Ngân hàng:</span> 
                      <span className="font-bold text-gray-900">{BANK_CONFIG.BANK_NAME}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Số tài khoản:</span> 
                      <span className="font-bold text-gray-900">{BANK_CONFIG.ACCOUNT_NUMBER}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Chủ tài khoản:</span> 
                      <span className="font-bold text-gray-900">{BANK_CONFIG.ACCOUNT_NAME}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-gray-500">Số tiền:</span> 
                      <span className="font-bold text-red-600 text-lg">{finalPrice.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between items-start pt-2 border-t border-gray-200">
                      <span className="text-gray-500 whitespace-nowrap mr-4">Nội dung:</span> 
                      <span className="font-bold text-gray-900 text-right">Thanh toan don hang {createdOrderId}</span>
                    </div>
                </div>
                
                <button 
                  onClick={() => {
                    clearCart();
                    navigate(`/checkout/result?status=pending&orderId=${createdOrderId}`);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg transition-colors shadow-sm mt-auto uppercase tracking-wide"
                >
                  Xác nhận đã thanh toán
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
