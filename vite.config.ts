import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Create a separate vendor chunk for common libraries
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    // Increase the chunk size warning limit (in kB)
    chunkSizeWarningLimit: 1000,
  },
});
