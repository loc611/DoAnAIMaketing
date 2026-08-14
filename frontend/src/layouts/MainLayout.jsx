import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../components/ui/CartDrawer';

const MainLayout = () => {
  return (
    <div className="min-h-screen font-sans antialiased flex flex-col bg-[#08080a] text-[#f3f3f6] relative selection:bg-[#d15a20] selection:text-white">
      {/* Noise Grain Texture */}
      <div className="noise-texture" />

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Drawers & Features */}
      <CartDrawer />
    </div>
  );
};

export default MainLayout;
