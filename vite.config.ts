import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    compression(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-maps': ['@react-google-maps/api'],
          'vendor-redux': ['react-redux', '@reduxjs/toolkit'],
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {}
    },
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
  },
  server: {
    headers: {
      'Service-Worker-Allowed': '/'
    }
  }
})