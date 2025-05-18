// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // proxy any requests starting with /api to your backend
      '/api': {
        target: 'http://localhost:5006', // ← wherever your Express (or other) server runs
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
