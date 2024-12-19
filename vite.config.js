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
  optimizeDeps: {
    include: ['firebase/storage'],
    exclude: ['grapesjs'],
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
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
  },
  base: mode === 'production' ? '/' : './',
}));
