import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: [
      'apps/web/src/**/*.test.ts',
      'apps/web/src/**/*.test.tsx',
      'tests/**/*.test.ts',
      'packages/**/*.test.ts',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/web/src'),
      '@community/db': path.resolve(__dirname, './packages/core/db/src/pool.ts'),
      '@community/auth': path.resolve(__dirname, './packages/core/auth/src/index.ts'),
      '@community/identity': path.resolve(__dirname, './packages/core/identity/src/pick-content.ts'),
    },
  },
});
