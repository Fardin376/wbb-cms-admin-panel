import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    visualizer({
      open: true,
    }),
  ],
  resolve: {
    alias: {
      global: {}, // Add empty global object
    },
  },
  optimizeDeps: {
    exclude: ['grapesjs'],
    include: ['fabric '], // Ensure draft-js is pre-bundled
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', '@mui/material'],
        },
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  server: {
    port: 5174,
    strictPort: true,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  base: mode === 'production' ? '/' : './',
  define: {
    global: 'globalThis', // Define global as globalThis
    'process.env': {},
  },
}));
