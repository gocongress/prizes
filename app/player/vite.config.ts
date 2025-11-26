import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      tmpDir: './.tanstack/tmp',
    }),
    viteReact(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3002,
    host: '0.0.0.0',
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3002,
    },
    watch: {
      usePolling: true, // <-- forces polling
      interval: 100, // optional: tuning (ms)
    },
  },
  // Ensure route changes trigger HMR
  optimizeDeps: {
    exclude: [], // Avoid excluding router deps
  },
});
