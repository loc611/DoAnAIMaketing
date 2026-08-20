import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, KeyRound, Mail, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();

  // Mode: 'login' | 'register' | 'forgot_email' | 'forgot_reset'
  const [authMode, setAuthMode] = useState('login');
  
  const [formData, setFormData] = useState({ fullName: '', identifier: '', password: '' });
  const [forgotData, setForgotData] = useState({ email: '', otp: '', newPassword: '', confirmPassword: '' });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(location.state?.error || null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState(null);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenResponse.access_token }),
        });
        
        let data;
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          throw new Error(`Lỗi từ máy chủ: Không thể kết nối đến backend (Trạng thái: ${response.status}). Vui lòng kiểm tra lại URL API.`);
        }
        
        if (!response.ok) {
          throw new Error(data.message || data.error || 'Có lỗi xảy ra khi đăng nhập Google');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setSuccess(data.message);
        setTimeout(() => {
          if (!data.user.email || !data.user.phone) {
            navigate('/update-info');
          } else {
            const returnUrl = location.state?.returnUrl || '/';
            window.location.href = returnUrl;
          }
        }, 1000);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      setError('Đăng nhập Google thất bại');
      console.error('Google Login Error:', error);
    }
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleForgotChange = (e) => {
    setForgotData({ ...forgotData, [e.target.name]: e.target.value });
  };

  // Submit Login or Register
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const isLogin = authMode === 'login';
    const url = isLogin 
      ? `${import.meta.env.VITE_API_URL || ''}/api/auth/login` 
      : `${import.meta.env.VITE_API_URL || ''}/api/auth/register`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      let data;
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        throw new Error(`Lỗi từ máy chủ: Không thể kết nối đến backend (Trạng thái: ${response.status}). Vui lòng kiểm tra lại URL API.`);
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Có lỗi xảy ra');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccess(data.message);
      
      setTimeout(() => {
        if (!data.user.email || !data.user.phone) {
          navigate('/update-info');
        } else {
          const returnUrl = location.state?.returnUrl || '/';
          window.location.href = returnUrl;
        }
      }, 1000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setDevOtpHint(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotData.email })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Không thể gửi mã OTP');
      }

      setSuccess(data.message || 'Mã OTP đã được gửi đến email của bạn.');
      if (data.devOtp) {
        setDevOtpHint(data.devOtp);
      }
      setAuthMode('forgot_reset');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm OTP & Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (forgotData.newPassword !== forgotData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (forgotData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotData.email,
          otp: forgotData.otp,
          newPassword: forgotData.newPassword
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Đặt lại mật khẩu thất bại');
      }

      setSuccess(data.message || 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.');
      setTimeout(() => {
        setAuthMode('login');
        setFormData(prev => ({ ...prev, identifier: forgotData.email, password: '' }));
        setForgotData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
        setDevOtpHint(null);
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-gray-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] bg-white rounded-2xl p-8 shadow-xl border border-gray-100"
      >
        {/* Header Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-[#d70018] mb-3">
            {authMode.startsWith('forgot') ? <KeyRound size={24} /> : <ShieldCheck size={24} />}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {authMode === 'login' && 'Đăng nhập'}
            {authMode === 'register' && 'Đăng ký tài khoản'}
            {authMode === 'forgot_email' && 'Quên mật khẩu'}
            {authMode === 'forgot_reset' && 'Đặt lại mật khẩu mới'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {authMode === 'login' && 'Chào mừng bạn quay trở lại với Pig Store'}
            {authMode === 'register' && 'Tạo tài khoản để nhận nhiều ưu đãi độc quyền'}
            {authMode === 'forgot_email' && 'Nhập email đã đăng ký để nhận mã xác thực OTP'}
            {authMode === 'forgot_reset' && `Nhập mã 6 chữ số đã gửi tới ${forgotData.email}`}
          </p>
        </div>

        {/* Thông báo lỗi & thành công */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-xl mb-4 text-sm flex items-start gap-2">
            <span className="font-semibold">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3.5 rounded-xl mb-4 text-sm flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-600" />
            <span>{success}</span>
          </div>
        )}

        {devOtpHint && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-xl mb-4 text-xs">
            <p className="font-semibold mb-1">⚡ Mã OTP thử nghiệm (Dev Mode):</p>
            <p className="text-base font-mono font-bold tracking-widest text-[#d70018]">{devOtpHint}</p>
          </div>
        )}

        {/* --- FORM 1: LOGIN / REGISTER --- */}
        {(authMode === 'login' || authMode === 'register') && (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {authMode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Họ và tên</label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Nguyễn Văn A"
                      value={formData.fullName}
                      onChange={handleChange}
                      required={authMode === 'register'}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:outline-none focus:border-[#d70018] focus:ring-1 focus:ring-[#d70018] transition-all"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Email hoặc Số điện thoại</label>
                <input
                  type="text"
                  name="identifier"
                  placeholder="admin@pigstore.com"
                  value={formData.identifier}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:outline-none focus:border-[#d70018] focus:ring-1 focus:ring-[#d70018] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:outline-none focus:border-[#d70018] focus:ring-1 focus:ring-[#d70018] transition-all pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {authMode === 'login' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot_email');
                      setError(null);
                      setSuccess(null);
                      setForgotData(prev => ({ ...prev, email: formData.identifier.includes('@') ? formData.identifier : '' }));
                    }}
                    className="text-[#0068ff] text-sm hover:underline font-medium"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#d70018] text-white rounded-xl py-3.5 font-semibold hover:bg-red-700 active:scale-[0.99] transition-all disabled:opacity-50 shadow-md shadow-red-500/20 mt-1"
              >
                {loading ? 'Đang xử lý...' : (authMode === 'login' ? 'Đăng nhập' : 'Đăng ký tài khoản')}
              </button>
            </form>

            <div className="my-6 flex items-center before:flex-1 before:border-t before:border-gray-200 after:flex-1 after:border-t after:border-gray-200">
              <p className="mx-4 text-xs uppercase tracking-wider text-gray-400 font-medium">Hoặc đăng nhập bằng</p>
            </div>

            <button 
              type="button"
              onClick={() => loginWithGoogle()}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl py-3 hover:bg-gray-50 active:scale-[0.99] transition-all font-medium text-gray-700 shadow-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Đăng nhập với Google
            </button>

            <div className="mt-8 text-center text-sm text-gray-600">
              {authMode === 'login' ? "Bạn chưa có tài khoản? " : "Bạn đã có tài khoản? "}
              <button 
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setError(null);
                  setSuccess(null);
                }}
                className="text-[#d70018] font-semibold hover:underline"
              >
                {authMode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập ngay'}
              </button>
            </div>
          </>
        )}

        {/* --- FORM 2: QUÊN MẬT KHẨU - BƯỚC 1 (NHẬP EMAIL) --- */}
        {authMode === 'forgot_email' && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Email đã đăng ký</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="admin@pigstore.com"
                  value={forgotData.email}
                  onChange={handleForgotChange}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-11 text-gray-900 focus:bg-white focus:outline-none focus:border-[#d70018] focus:ring-1 focus:ring-[#d70018] transition-all"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d70018] text-white rounded-xl py-3.5 font-semibold hover:bg-red-700 active:scale-[0.99] transition-all disabled:opacity-50 shadow-md shadow-red-500/20 mt-2"
            >
              {loading ? 'Đang gửi mã...' : 'Gửi mã OTP xác thực'}
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setError(null);
                setSuccess(null);
              }}
              className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 py-2.5 text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} /> Quay lại Đăng nhập
            </button>
          </form>
        )}

        {/* --- FORM 3: QUÊN MẬT KHẨU - BƯỚC 2 (NHẬP OTP & MẬT KHẨU MỚI) --- */}
        {authMode === 'forgot_reset' && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Mã OTP (6 chữ số)</label>
              <input
                type="text"
                name="otp"
                maxLength={6}
                placeholder="123456"
                value={forgotData.otp}
                onChange={handleForgotChange}
                required
                className="w-full text-center tracking-[8px] font-mono text-xl font-bold bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:outline-none focus:border-[#d70018] focus:ring-1 focus:ring-[#d70018] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Mật khẩu mới</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="Tối thiểu 6 ký tự"
                  value={forgotData.newPassword}
                  onChange={handleForgotChange}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:outline-none focus:border-[#d70018] focus:ring-1 focus:ring-[#d70018] transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu mới"
                value={forgotData.confirmPassword}
                onChange={handleForgotChange}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:outline-none focus:border-[#d70018] focus:ring-1 focus:ring-[#d70018] transition-all"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Chưa nhận được mã?</span>
              <button
                type="button"
                onClick={handleSendOtp}
                className="text-[#d70018] font-semibold hover:underline"
              >
                Gửi lại mã OTP
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d70018] text-white rounded-xl py-3.5 font-semibold hover:bg-red-700 active:scale-[0.99] transition-all disabled:opacity-50 shadow-md shadow-red-500/20 mt-1"
            >
              {loading ? 'Đang cập nhật...' : 'Xác nhận đặt lại mật khẩu'}
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('forgot_email');
                setError(null);
                setSuccess(null);
              }}
              className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 py-2 text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} /> Thay đổi email nhận OTP
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
