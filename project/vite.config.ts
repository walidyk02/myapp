import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, 'dist'), // emplacement du build de Vite
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001', // Pour la communication entre frontend et backend pendant le dev
    },
  },
});
