import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@imga': 'D:/BaiTapAIMaketing/AI3D/imga'
    }
  },
  server: {
    port: 2007,
    strictPort: true,
    fs: {
      allow: ['..', 'd:/BaiTapAIMaketing/AI3D'],
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
    watch: {
      ignored: ['**/replace_url.js'],
    },
  }
})
