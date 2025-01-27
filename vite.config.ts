import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression' // Need to install this package

export default defineConfig({
  plugins: [
    react(),
    compression(), // Adds gzip compression

  ],

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split your code into smaller chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-maps': ['@react-google-maps/api'],
          'vendor-redux': ['react-redux', '@reduxjs/toolkit'],
        },
      },
    },
    // Optimize build settings
    minify: 'terser',
    terserOptions: {
      compress: {
      }
    },
    // Don't generate source maps in production
    sourcemap: false,
    // Warn if individual chunks are too large
    chunkSizeWarningLimit: 1000,
  }
})