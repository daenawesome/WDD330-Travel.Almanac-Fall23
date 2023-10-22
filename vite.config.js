import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src/',

  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        aboutUs: resolve(__dirname, 'src/pages-others/about-us.html'),
        list: resolve(__dirname, 'src/pages-flight/flight-list.html'),

      },
    },
  },
});
