import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { 
  ShoppingBag, User, ArrowUpRight, 
  SignOut, Receipt, SquaresFour, CaretDown
} from '@phosphor-icons/react';

const Navbar = () => {
  const { totalItems, toggleCart } = useCart();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (location.pathname === '/auth' || location.pathname === '/update-info' || location.pathname === '/checkout') {
    return null;
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    localStorage.removeItem('guest_cart');
    setIsUserMenuOpen(false);
    window.location.href = '/auth';
  };

  // Determine if island is in compact mode (scrolled AND not hovered)
  const isCompact = isScrolled && !isHovered;

  return (
    <div className="fixed top-0 left-0 w-full z-50 flex justify-center pt-4 md:pt-6 pointer-events-none px-4">
      {/* Dynamic Island Container */}
      <motion.nav 
        initial={{ y: -70, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsUserMenuOpen(false);
        }}
        className={`pointer-events-auto relative rounded-full flex items-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isCompact 
            ? 'px-3 py-1.5 bg-[#06060a]/90 backdrop-blur-3xl border border-white/20 shadow-[0_10px_35px_rgba(0,0,0,0.9)] gap-3'
            : 'px-3 sm:px-4 py-2 bg-[#06060a]/80 backdrop-blur-2xl border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.85)] hover:border-[#e87b46]/50 hover:shadow-[0_0_35px_rgba(232,123,70,0.25)] gap-3 sm:gap-4'
        }`}
      >
        {/* 1. LOGO EMBLEM */}
        <Link 
          to="/" 
          className="group flex items-center gap-2.5 transition-transform active:scale-95 shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden group-hover:border-[#e87b46]/60 group-hover:shadow-[0_0_12px_rgba(232,123,70,0.4)] transition-all">
            <img 
              src="/pig-logo.png" 
              alt="Pig Store Logo" 
              className="w-full h-full object-contain p-0.5 transition-transform group-hover:scale-110"
            />
          </div>

          {/* Title Wordmark (Hides when compact) */}
          <AnimatePresence>
            {!isCompact && (
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col leading-none overflow-hidden whitespace-nowrap"
              >
                <span className="font-extrabold tracking-[0.2em] text-[11px] uppercase bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
                  PIG
                </span>
                <span className="text-[8px] uppercase tracking-[0.25em] font-mono text-[#e87b46] font-semibold mt-0.5">
                  STORE
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        {/* 2. MIDDLE CTA: "Đăng ký Tư vấn" (Hides when compact) */}
        <AnimatePresence>
          {!isCompact && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                to="/pre-order"
                className="group relative inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-white/10 via-white/15 to-white/10 border border-white/20 hover:border-[#e87b46]/50 backdrop-blur-md transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-lg shadow-black/50"
              >
                <span className="text-xs font-bold tracking-tight text-white/90 group-hover:text-white transition-colors whitespace-nowrap">
                  Đăng ký Tư vấn
                </span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. RIGHT ACTIONS: Account & Cart */}
        <div className="flex items-center gap-2 border-l border-white/10 pl-2 sm:pl-3 shrink-0">
          
          {/* USER ACCOUNT DROPDOWN */}
          {token ? (
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/15 hover:border-white/40 text-white/80 hover:text-white transition-all active:scale-95"
                aria-label="User menu"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#e87b46] to-[#d4af37] flex items-center justify-center text-black text-[10px] font-extrabold shadow-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                {!isCompact && <CaretDown size={11} className={`transition-transform duration-300 mr-0.5 ${isUserMenuOpen ? 'rotate-180' : ''}`} />}
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-56 bg-[#06060a]/95 backdrop-blur-3xl border border-white/15 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] p-2 z-50 pointer-events-auto before:absolute before:-top-4 before:left-0 before:w-full before:h-4 before:bg-transparent"
                  >
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="text-xs font-bold text-white truncate">{user?.name || 'Khách hàng VIP'}</p>
                      <p className="text-[10px] text-white/40 truncate font-mono mt-0.5">{user?.email || 'Pig Member'}</p>
                    </div>

                    {user && ['admin', 'manager', 'sales_staff', 'warehouse_staff'].includes(user?.role) && (
                      <Link 
                        to="/crm" 
                        onClick={() => setIsUserMenuOpen(false)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2.5"
                      >
                        <SquaresFour size={15} className="text-[#e87b46]" />
                        <span>Dashboard CRM</span>
                      </Link>
                    )}

                    <Link 
                      to="/orders" 
                      onClick={() => setIsUserMenuOpen(false)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2.5"
                    >
                      <Receipt size={15} className="text-[#e87b46]" />
                      <span>Lịch sử đơn hàng</span>
                    </Link>

                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-2.5 mt-1 border-t border-white/10"
                    >
                      <SignOut size={15} />
                      <span>Đăng xuất</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link 
              to="/auth" 
              className="w-8 h-8 rounded-full bg-white/5 border border-white/15 hover:border-white/40 flex items-center justify-center text-white/80 hover:text-white transition-all hover:scale-105 active:scale-95"
              title="Đăng nhập / Tài khoản"
            >
              <User size={16} weight="bold" />
            </Link>
          )}

          {/* SHOPPING CART BUTTON */}
          <button 
            onClick={toggleCart}
            className="relative w-8 h-8 rounded-full bg-white/5 border border-white/15 hover:border-white/40 flex items-center justify-center text-white/80 hover:text-white transition-all hover:scale-105 active:scale-95"
            aria-label="Giỏ hàng"
          >
            <ShoppingBag size={16} weight="bold" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#e87b46] to-[#d4af37] text-black text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {totalItems}
              </span>
            )}
          </button>

        </div>
      </motion.nav>
    </div>
  );
};

export default Navbar;
