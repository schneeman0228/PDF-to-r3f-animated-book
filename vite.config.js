// https://vitejs.dev/config/
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/PDF-to-r3f-animated-book/', // リポジトリ名を追加
  optimizeDeps: {
    include: ['pdfjs-dist']
  },

  server: {
    host: true,
  },

});