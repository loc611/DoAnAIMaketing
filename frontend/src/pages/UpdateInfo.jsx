import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function UpdateInfo() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    dob: '',
    promo: false,
    student: false,
    business: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userStr || !token) {
      navigate('/auth');
      return;
    }
    const user = JSON.parse(userStr);
    
    // If both exist, they don't need to be here
    if (user.phone && user.email) {
      navigate('/');
      return;
    }

    setFormData(prev => ({
      ...prev,
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      dob: user.dob ? new Date(user.dob).toLocaleDateString('vi-VN') : ''
    }));
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleToggle = (name) => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.fullName || (!formData.phone && !formData.email)) {
      setError('Vui lòng điền Họ tên và ít nhất Số điện thoại hoặc Email');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`\${import.meta.env.VITE_API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          dob: formData.dob
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Cập nhật thất bại');
      }

      // Update local storage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.fullName = data.user.fullName;
        user.phone = data.user.phone;
        user.email = data.user.email;
        user.dob = data.user.dob;
        localStorage.setItem('user', JSON.stringify(user));
      }

      // Navigate home
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[600px] bg-white rounded-xl p-8"
      >
        <h2 className="text-3xl font-bold text-center mb-8 text-[#d70018]">
          Cập nhật thông tin
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="mb-2">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Thông tin cá nhân</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Họ và tên</label>
                <div className="relative">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Nhập họ và tên"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-black focus:outline-none focus:border-[#d70018] transition-colors pr-10"
                  />
                  {formData.fullName && (
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, fullName: ''})}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-gray-200"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Ngày sinh</label>
                <div className="relative">
                  <input
                    type="text"
                    name="dob"
                    placeholder="Nhập ngày sinh"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-black focus:outline-none focus:border-[#d70018] transition-colors pl-10"
                  />
                  <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Nhập số điện thoại"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!!(JSON.parse(localStorage.getItem('user'))?.phone)}
                  required={!(JSON.parse(localStorage.getItem('user'))?.phone)}
                  className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none transition-colors ${
                    JSON.parse(localStorage.getItem('user'))?.phone 
                      ? 'bg-gray-50 text-gray-500 cursor-not-allowed' 
                      : 'bg-white text-black focus:border-[#d70018]'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Nhập email của bạn"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!!(JSON.parse(localStorage.getItem('user'))?.email)}
                  required={!(JSON.parse(localStorage.getItem('user'))?.email)}
                  className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none transition-colors ${
                    JSON.parse(localStorage.getItem('user'))?.email 
                      ? 'bg-gray-50 text-gray-500 cursor-not-allowed' 
                      : 'bg-white text-black focus:border-[#d70018]'
                  }`}
                />
              </div>
            </div>
          </div>



          <div className="grid grid-cols-2 gap-4 mt-4">
            <button
              type="button"
              onClick={handleLogout}
              className="bg-white border border-gray-300 text-gray-700 rounded-lg py-3.5 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              &lt; Quay lại đăng nhập
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#d70018] text-white rounded-lg py-3.5 font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Hoàn tất đăng ký'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
