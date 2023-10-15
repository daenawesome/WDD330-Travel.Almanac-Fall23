import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src/',

  resolve: {
    alias: {
      '@css': '/css' // Adding alias for css directory
    }
  },

  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        list: resolve(__dirname, 'src/page-list/flight-list.html'),

      },
    },
  },
});
