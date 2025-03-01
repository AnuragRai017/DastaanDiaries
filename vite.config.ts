import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    // Enable hot module replacement for components
    babel: {
      plugins: ['@emotion/babel-plugin']
    }
  })],
  server: {
    port: 3000,
    // Enable HMR with overlay
    hmr: {
      overlay: true,
    },
    // Optimize watch options for better performance
    watch: {
      usePolling: true,
      interval: 100
    }
  },
  // Optimize build settings
  build: {
    // Enable chunk size warnings
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['@headlessui/react', 'framer-motion'],
          'editor': ['@tinymce/tinymce-react'],
          'three': ['three', '@react-three/fiber', '@react-three/drei'],
        }
      }
    }
  },
  // Enable source maps in development
  css: {
    devSourcemap: true,
  },
  // Optimize dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@headlessui/react',
      'framer-motion',
      '@tinymce/tinymce-react',
      'three',
      '@react-three/fiber',
      '@react-three/drei'
    ]
  }
});
