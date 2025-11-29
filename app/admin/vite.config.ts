import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';

const alias = (mode: string) => {
  const aliases = [
    {
      find: '@',
      replacement: path.resolve(__dirname, './src'),
    },
  ];

  if (mode !== 'production') {
    aliases.push(
      {
        find: 'react-admin',
        replacement: path.resolve(__dirname, './node_modules/react-admin/src'),
      },
      {
        find: 'ra-core',
        replacement: path.resolve(__dirname, './node_modules/ra-core/src'),
      },
      {
        find: 'ra-ui-materialui',
        replacement: path.resolve(__dirname, './node_modules/ra-ui-materialui/src'),
      },
    );
  }
  return aliases;
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    base: env.APP_BASENAME ? env.APP_BASENAME : '/',
    build: {
      sourcemap: env.mode !== 'production',
    },
    resolve: {
      alias: alias(mode),
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
  };
});
