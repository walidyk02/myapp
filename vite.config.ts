import { defineConfig } from 'vite';
import reactSwc from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [reactSwc()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'pdf-vendor': ['jspdf', 'react-pdf'],
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['@swc/core'],
  },
  server: {
    proxy: {
      // Redirige les requêtes vers le backend API
      '/api': 'http://localhost:4000', // Assure-toi que ton serveur backend écoute sur ce port
    },
  },
});
