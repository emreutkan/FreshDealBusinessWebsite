import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression' // Need to install this package

export default defineConfig({
  plugins: [
    react(),
    compression(), // Adds gzip compression

  ],
  define: {
    // Maintain your existing environment variable configuration
    'process.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(process.env.VITE_GOOGLE_MAPS_API_KEY)
  },
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
        drop_console: true, // Removes console.logs in production
        drop_debugger: true
      }
    },
    // Don't generate source maps in production
    sourcemap: false,
    // Warn if individual chunks are too large
    chunkSizeWarningLimit: 1000,
  }
})