import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CheckoutResult() {
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'failed'
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    // Lấy query params (ví dụ: ?vnp_ResponseCode=00&vnp_TxnRef=123)
    const urlParams = new URLSearchParams(window.location.search);
    const vnp_ResponseCode = urlParams.get('vnp_ResponseCode');
    const txnRef = urlParams.get('vnp_TxnRef');
    const explicitStatus = urlParams.get('status');
    const orderIdParam = urlParams.get('orderId') || txnRef;

    setOrderId(orderIdParam);

    if (explicitStatus === 'failed') {
      setStatus('failed');
      return;
    }

    if (explicitStatus === 'pending') {
      setStatus('pending');
      return;
    }

    if (vnp_ResponseCode) {
      if (vnp_ResponseCode === '00') {
        setStatus('success');
      } else {
        setStatus('failed');
      }
    } else {
      // Simulate loading for demo if no params
      setTimeout(() => {
        setStatus('success'); // default to success for demo
      }, 1000);
    }
  }, []);

  const [isProcessing, setIsProcessing] = useState(false);

  const handleRetryPayment = () => {
    if (!orderId) return;
    setIsProcessing(true);
    alert('Mock: Đang chuyển hướng sang cổng thanh toán VNPAY...');
    setTimeout(() => {
      setIsProcessing(false);
      setStatus('success');
    }, 1500);
  };

  const handleSwitchToCOD = async () => {
    if (!orderId) return;
    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`\${import.meta.env.VITE_API_URL}/api/orders/${orderId}/switch-to-cod`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Lỗi khi chuyển sang COD');
      }
      setStatus('success');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <p>Đang kiểm tra trạng thái thanh toán...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-[#1c1c1e] p-8 rounded-3xl text-center border border-white/10"
      >
        {status === 'success' ? (
          <>
            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              ✓
            </div>
            <h1 className="text-2xl font-bold mb-2">Thanh toán thành công!</h1>
            <p className="text-[#86868b] mb-8">
              Cảm ơn bạn đã mua sắm. Đơn hàng {orderId && <strong className="text-white">#{orderId.substring(0, 8)}</strong>} đang được xử lý.
            </p>
            <button 
              onClick={() => window.location.href = '/orders'}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-full font-semibold transition-colors"
            >
              Xem đơn hàng
            </button>
          </>
        ) : status === 'pending' ? (
          <>
            <div className="w-20 h-20 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              ⌛
            </div>
            <h1 className="text-2xl font-bold mb-2">Đang chờ xác nhận thanh toán!</h1>
            <p className="text-[#86868b] mb-8">
              Cảm ơn bạn đã mua sắm. Đơn hàng {orderId && <strong className="text-white">#{orderId.substring(0, 8)}</strong>} của bạn đã được ghi nhận và đang chờ xác nhận thanh toán. Chúng tôi sẽ xử lý ngay khi nhận được khoản chuyển khoản.
            </p>
            <button 
              onClick={() => window.location.href = '/orders'}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-full font-semibold transition-colors"
            >
              Xem đơn hàng
            </button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              ✕
            </div>
            <h1 className="text-2xl font-bold mb-2">Thanh toán thất bại</h1>
            <p className="text-[#86868b] mb-8">
              Rất tiếc, quá trình thanh toán của bạn không thành công. Bạn có thể thử lại hoặc đổi phương thức thanh toán.
            </p>
            <div className="space-y-4">
              {!orderId ? (
                <button 
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-white hover:bg-gray-200 text-black py-4 rounded-full font-semibold transition-colors"
                >
                  Quay lại trang chủ
                </button>
              ) : (
                <>
                  <button 
                    onClick={handleRetryPayment}
                    disabled={isProcessing}
                    className="w-full bg-white hover:bg-gray-200 text-black py-4 rounded-full font-semibold transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Đang xử lý...' : 'Thử thanh toán lại'}
                  </button>
                  <button 
                    onClick={handleSwitchToCOD}
                    disabled={isProcessing}
                    className="w-full bg-transparent border border-white/20 hover:bg-white/5 text-white py-4 rounded-full font-semibold transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Đang xử lý...' : 'Chuyển sang thanh toán COD'}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
