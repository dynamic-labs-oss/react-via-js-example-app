/// <reference types='vitest' />
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(async () => {
  const { default: tailwindcss } = await import('@tailwindcss/vite');

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'zod/v4/core': 'zod',
        'zod/v4': 'zod',
      },
    },

    define: {
      'process.env': Object.fromEntries(
        Object.entries(process.env).filter(([key]) => key.startsWith('VITE_'))
      ),
      'process.browser': true,
      'process.version': JSON.stringify('v18.0.0'),
      global: 'globalThis',
    },

    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      emptyOutDir: true,
      outDir: './dist',
      reportCompressedSize: true,
      sourcemap: true,
    },

    cacheDir: 'node_modules/.vite',

    plugins: [
      tsconfigPaths({
        root: '.',
        projects: ['./tsconfig.json'],
      }),
      react(),
      tailwindcss(),
    ],

    preview: {
      host: 'localhost',
      port: 5300,
      historyApiFallback: true,
    },

    root: __dirname,

    server: {
      host: 'localhost',
      port: 5200,
      historyApiFallback: true,
    },
  };
});
