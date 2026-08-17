import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BANK_CONFIG } from '../config/bankConfig';
export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  // State cho QR Modal
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedPayOrder, setSelectedPayOrder] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/orders`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      window.location.href = '/auth';
    } else {
      fetchOrders();
    }
  }, []);

  // Polling để kiểm tra thanh toán khi đang mở QR
  useEffect(() => {
    let intervalId;
    if (showQRModal && selectedPayOrder) {
      intervalId = setInterval(() => {
        fetchOrders();
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [showQRModal, selectedPayOrder]);

  // Lắng nghe thay đổi của orders để đóng QR Modal nếu đã thanh toán
  useEffect(() => {
    if (showQRModal && selectedPayOrder) {
      const updatedOrder = orders.find(o => o.id === selectedPayOrder.id);
      if (updatedOrder && (updatedOrder.paymentStatus === 'PAID' || updatedOrder.orderStatus === 'PROCESSING' || updatedOrder.orderStatus === 'COMPLETED')) {
        setShowQRModal(false);
        alert('Hệ thống đã nhận được tiền. Thanh toán thành công!');
      }
    }
  }, [orders, showQRModal, selectedPayOrder]);



  const handleOpenCancelModal = (orderId) => {
    setSelectedOrderId(orderId);
    setCancelReason('');
    setCancelError(null);
    setShowCancelModal(true);
  };

  const handleOpenQRModal = (order) => {
    setSelectedPayOrder(order);
    setShowQRModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancelReason) {
      setCancelError('Vui lòng chọn lý do hủy.');
      return;
    }

    setIsCancelling(true);
    setCancelError(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/orders/${selectedOrderId}/cancel`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ cancelReason })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      // Hủy thành công, ẩn popup và tải lại danh sách
      setShowCancelModal(false);
      fetchOrders();
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-black pt-24 px-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Lịch sử đơn hàng</h1>
          <div className="flex gap-4">

          </div>
        </div>

        {loading && <p className="text-[#86868b]">Đang tải danh sách đơn hàng...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && orders.length === 0 && <p className="text-[#86868b]">Bạn chưa có đơn hàng nào.</p>}

        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <motion.div 
              key={order.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl border border-black/10"
            >
              <div className="flex justify-between items-start mb-4 border-b border-black/10 pb-4">
                <div>
                  <p className="text-sm text-[#86868b] mb-1">Mã đơn: <span className="text-black font-mono uppercase">{order.id.slice(0, 8)}</span></p>
                  <p className="text-xs text-[#86868b]">Ngày đặt: {formatDate(order.createdAt)}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  order.orderStatus === 'PENDING' ? 'bg-yellow-500/20 text-yellow-700 border border-yellow-500/30' :
                  order.orderStatus === 'PROCESSING' ? 'bg-blue-500/20 text-blue-700 border border-blue-500/30' :
                  order.orderStatus === 'COMPLETED' ? 'bg-green-500/20 text-green-700 border border-green-500/30' :
                  'bg-red-500/20 text-red-700 border border-red-500/30'
                }`}>
                  {order.orderStatus === 'PENDING' ? 'Chờ xác nhận' :
                   order.orderStatus === 'PROCESSING' ? 'Đang xử lý' :
                   order.orderStatus === 'COMPLETED' ? 'Đã giao' : 'Đã hủy'}
                </div>
              </div>

              {/* Danh sách sản phẩm */}
              <div className="flex flex-col gap-4 mb-4 border-b border-black/10 pb-4">
                {order.items && order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <img 
                      src={item.image || '/images/iphone17.jpg'} 
                      alt={item.productName} 
                      className="w-16 h-16 object-cover rounded-lg border border-black/10"
                      onError={(e) => { e.target.onerror = null; e.target.src = '/images/iphone17.jpg'; }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-black">{item.productName}</p>
                      <p className="text-xs text-[#86868b] mt-0.5">
                        {item.selectedColor || item.selectedStorage ? (
                          [
                            item.selectedColor ? `Màu: ${item.selectedColor}` : null,
                            item.selectedStorage ? `Dung lượng: ${item.selectedStorage}` : null
                          ].filter(Boolean).join(' - ')
                        ) : (
                          'Mặc định'
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-black">{formatPrice(item.price)}</p>
                      <p className="text-xs text-[#86868b] mt-0.5">x{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xl font-semibold mb-1">{formatPrice(order.totalAmount)}</p>
                  <p className="text-sm text-[#86868b] mb-2">
                    Thanh toán: {order.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : (order.paymentMethod === 'COD' ? 'Tiền mặt (COD)' : (order.paymentMethod || 'Tiền mặt (COD)'))}
                  </p>
                  {order.orderStatus === 'CANCELLED' && (
                    <div className="text-xs text-red-400 mt-2">
                      <p>Lý do hủy: {order.cancelReason}</p>
                      <p className="text-[#86868b] mt-1">Đã hủy lúc: {formatDate(order.cancelledAt)}</p>
                    </div>
                  )}
                </div>
                
                {/* Chỉ hiện nút hủy nếu PENDING hoặc PROCESSING */}
                {(order.orderStatus === 'PENDING' || order.orderStatus === 'PROCESSING') && (
                  <div className="flex gap-2">
                    {order.orderStatus === 'PENDING' && order.paymentMethod === 'BANK_TRANSFER' && (
                      <button 
                        onClick={() => handleOpenQRModal(order)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full transition-colors"
                      >
                        Thanh toán ngay
                      </button>
                    )}
                    <button 
                      onClick={() => handleOpenCancelModal(order.id)}
                      className="px-4 py-2 bg-transparent border border-red-500/50 hover:bg-red-500/20 text-red-500 text-sm font-medium rounded-full transition-colors"
                    >
                      Hủy đơn hàng
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cancel Modal (Popup) */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isCancelling && setShowCancelModal(false)}
              className="absolute inset-0 bg-gray-50/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 border border-black/10 shadow-2xl"
            >
              <h2 className="text-xl font-bold mb-4">Lý do hủy đơn hàng</h2>
              <p className="text-sm text-[#86868b] mb-6">Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng này. Thao tác này không thể hoàn tác.</p>

              {cancelError && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4 text-sm">
                  {cancelError}
                </div>
              )}

              <div className="flex flex-col gap-3 mb-6">
                {[
                  'Muốn thay đổi màu sắc/dung lượng',
                  'Đổi ý không mua nữa',
                  'Thay đổi địa chỉ nhận hàng',
                  'Tìm thấy giá tốt hơn ở nơi khác',
                  'Khác'
                ].map((reason) => (
                  <label key={reason} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5 rounded-full border border-white/30 group-hover:border-blue-500 transition-colors">
                      {cancelReason === reason && (
                        <motion.div layoutId="radio" className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                      )}
                    </div>
                    <input 
                      type="radio" 
                      className="hidden" 
                      name="cancel_reason"
                      value={reason}
                      onChange={(e) => setCancelReason(e.target.value)}
                    />
                    <span className="text-sm text-black/90">{reason}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCancelModal(false)}
                  disabled={isCancelling}
                  className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Bỏ qua
                </button>
                <button 
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-black py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isCancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Modal for Bank Transfer */}
      <AnimatePresence>
      {showQRModal && selectedPayOrder && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl max-w-4xl w-full p-6 lg:p-8 relative shadow-2xl"
          >
            <button 
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 text-2xl font-bold"
            >
              ×
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
                     src={`https://img.vietqr.io/image/${BANK_CONFIG.BANK_ID}-${BANK_CONFIG.ACCOUNT_NUMBER}-compact.jpg?amount=${selectedPayOrder.totalAmount}&addInfo=Thanh toan don hang ${selectedPayOrder.id}&accountName=${encodeURIComponent(BANK_CONFIG.ACCOUNT_NAME)}`} 
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
                  {selectedPayOrder.items.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-lg border flex items-center justify-center p-2 shrink-0">
                         <img src={item.image || '/images/iphone17.jpg'} alt={item.productName} className="max-w-full max-h-full object-contain" onError={(e) => { e.target.onerror = null; e.target.src = '/images/iphone17.jpg'; }} />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h5 className="font-medium text-gray-900 text-sm sm:text-base leading-tight line-clamp-2">{item.productName}</h5>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.selectedColor || item.selectedStorage ? [item.selectedColor ? `Màu: ${item.selectedColor}` : null, item.selectedStorage ? `Dung lượng: ${item.selectedStorage}` : null].filter(Boolean).join(' - ') : 'Mặc định'} x {item.quantity}
                        </p>
                      </div>
                      <div className="text-right flex items-center">
                        <p className="font-semibold text-red-600 text-sm sm:text-base">{formatPrice(item.price * item.quantity)}</p>
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
                      <span className="font-bold text-red-600 text-lg">{formatPrice(selectedPayOrder.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-start pt-2 border-t border-gray-200">
                      <span className="text-gray-500 whitespace-nowrap mr-4">Nội dung:</span> 
                      <span className="font-bold text-gray-900 text-right">Thanh toan don hang {selectedPayOrder.id}</span>
                    </div>
                </div>
                
                <button 
                  onClick={() => setShowQRModal(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg transition-colors shadow-sm mt-auto uppercase tracking-wide"
                >
                  Xác nhận đã thanh toán
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
}
