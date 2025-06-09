// https://vitejs.dev/config/
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/PDF-to-r3f-animated-book/', // リポジトリ名を追加
  //圧縮
  build: {
    outDir: 'dist',
    target: 'es2015', // より広い互換性
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
  rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three', '@react-three/fiber', '@react-three/drei']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['pdfjs-dist']
  },

  server: {
    host: true,
  },
});