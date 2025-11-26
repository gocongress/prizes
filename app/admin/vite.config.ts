import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
import { defineConfig } from 'vite';

const alias = [
  {
    find: '@',
    replacement: path.resolve(__dirname, './src'),
  },
  {
    find: 'react-admin',
    replacement: path.resolve(__dirname, '../../node_modules/react-admin/src'),
  },
  {
    find: 'ra-core',
    replacement: path.resolve(__dirname, '../../node_modules/ra-core/src'),
  },
  {
    find: 'ra-ui-materialui',
    replacement: path.resolve(__dirname, '../../node_modules/ra-ui-materialui/src'),
  },
  // add any other react-admin packages you have
];

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
  },
  resolve: {
    alias,
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3000,
    },
    watch: {
      usePolling: true, // <-- forces polling
      interval: 100, // optional: tuning (ms)
    },
  },
});
