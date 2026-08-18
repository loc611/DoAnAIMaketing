import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/ui/ProtectedRoute';

// Lazy-loaded Pages
const Store = lazy(() => import('../pages/Store'));
const Mac = lazy(() => import('../pages/Mac'));
const Support = lazy(() => import('../pages/Support'));
const ProductDetail = lazy(() => import('../pages/ProductDetail'));
const Auth = lazy(() => import('../pages/Auth'));
const UpdateInfo = lazy(() => import('../pages/UpdateInfo'));
const Orders = lazy(() => import('../pages/Orders'));
const Checkout = lazy(() => import('../pages/Checkout'));
const CheckoutResult = lazy(() => import('../pages/CheckoutResult'));
const Ipad = lazy(() => import('../pages/Ipad'));
const PreOrder = lazy(() => import('../pages/PreOrder'));
const Shop = lazy(() => import('../pages/Shop'));
// CRM Components
const CrmLayout = lazy(() => import('../layouts/CrmLayout'));
const OperationalDashboard = lazy(() => import('../features/crm/pages/OperationalDashboard'));
const ExecutiveDashboard = lazy(() => import('../features/crm/pages/ExecutiveDashboard'));
const LeadManagement = lazy(() => import('../features/crm/pages/LeadManagement'));
const UserManagement = lazy(() => import('../features/crm/pages/UserManagement'));
const ProductManagement = lazy(() => import('../features/crm/pages/ProductManagement'));
const IPhone17ProLanding = lazy(() => import('../features/iphone17/pages/IPhone17ProLanding'));
const IPhone16ProMaxLanding = lazy(() => import('../features/iphone16/pages/IPhone16ProMaxLanding'));
const IPhone15ProLanding = lazy(() => import('../features/iphone15/pages/IPhone15ProLanding'));
const IPhone14ProMaxLanding = lazy(() => import('../features/iphone14/pages/IPhone14ProMaxLanding'));

// Phase 3 Demo Components
const ProductConfigurator = lazy(() => import('../components/ui/ProductConfigurator'));
const CRMDashboard = lazy(() => import('../components/ui/CRMDashboard'));

function LoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
        <p className="text-sm text-[#86868b]">Đang tải...</p>
      </div>
    </div>
  );
}

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Suspense fallback={<LoadingScreen />}>
          <Routes location={location}>
            {/* Phase 3 Demo Routes */}
            <Route path="/configurator" element={<ProductConfigurator />} />
            <Route path="/crm-demo" element={<CRMDashboard />} />
            
            {/* Routes with MainLayout (Navbar, Footer) */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Store />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/mac" element={<Mac />} />
              <Route path="/ipad" element={<Ipad />} />
              <Route path="/support" element={<Support />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/pre-order" element={<PreOrder />} />
              <Route path="/iphone-17-pro" element={<IPhone17ProLanding />} />
              <Route path="/iphone-16-pro-max" element={<IPhone16ProMaxLanding />} />
              <Route path="/iphone-15-pro-max" element={<IPhone15ProLanding />} />
              <Route path="/iphone-14-pro-max" element={<IPhone14ProMaxLanding />} />

              <Route path="/auth" element={<Auth />} />
              <Route path="/update-info" element={<UpdateInfo />} />

              {/* User Routes (Must be logged in) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/orders" element={<Orders />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/checkout/result" element={<CheckoutResult />} />
              </Route>
            </Route>

            {/* CRM Layout & Routes */}
            <Route element={<CrmLayout />}>
              <Route path="/crm" element={<OperationalDashboard />} />
              <Route path="/crm/leads" element={<LeadManagement />} />

              {/* Protected Admin & Executive CRM Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'SUPER_ADMIN', 'MANAGER']} />}>
                <Route path="/crm/executive" element={<ExecutiveDashboard />} />
                <Route path="/crm/users" element={<UserManagement />} />
                <Route path="/crm/products" element={<ProductManagement />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

export default AppRoutes;
