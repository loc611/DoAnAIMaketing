import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './contexts/CartContext.jsx'

import * as THREE from 'three';

// Patch Three.js render target disposal to safely guard against unmount race conditions
if (THREE && THREE.WebGLCubeRenderTarget) {
  const origCubeDispose = THREE.WebGLCubeRenderTarget.prototype.dispose;
  THREE.WebGLCubeRenderTarget.prototype.dispose = function (...args) {
    try {
      return origCubeDispose.apply(this, args);
    } catch (e) {
      // Safe fallback when renderer properties are disposed before environment cleanup
    }
  };
}
if (THREE && THREE.WebGLRenderTarget) {
  const origTargetDispose = THREE.WebGLRenderTarget.prototype.dispose;
  THREE.WebGLRenderTarget.prototype.dispose = function (...args) {
    try {
      return origTargetDispose.apply(this, args);
    } catch (e) {
      // Safe fallback when renderer properties are disposed before environment cleanup
    }
  };
}

// Silence Three.js deprecation & WebGL context loss log noise
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string') {
    if (args[0].includes('THREE.Clock: This module has been deprecated')) return;
    if (args[0].includes('THREE.WebGLRenderer: Context Lost')) return;
  }
  originalWarn(...args);
};

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <App />
      </CartProvider>
    </QueryClientProvider>
  </StrictMode>,
)
