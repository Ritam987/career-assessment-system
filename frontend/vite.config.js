import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const backend = process.env.REACT_APP_BACKEND_URL || process.env.VITE_API_URL || 'https://career-assessment-system-production.up.railway.app'

export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'REACT_APP_'],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: backend,
        changeOrigin: true,
      },
      '/reports': {
        target: backend,
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': { target: backend, changeOrigin: true },
      '/reports': { target: backend, changeOrigin: true },
    },
  },
})
