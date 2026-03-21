import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Use relative paths for assets to work on both user and project pages
  build: {
    outDir: 'dist',
  },
});
