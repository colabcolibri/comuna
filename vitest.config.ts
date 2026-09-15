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
      'tests/**/*.test.tsx',
      'packages/**/*.test.ts',
      'packages/**/*.test.tsx',
      'scripts/**/*.test.ts',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/web/src'),
      cn: path.resolve(__dirname, './packages/ui/primitives/src/lib/utils.ts'),
      '@community/db': path.resolve(__dirname, './packages/core/db/src/index.ts'),
      '@community/auth': path.resolve(__dirname, './packages/core/auth/src/index.ts'),
      '@community/identity': path.resolve(__dirname, './packages/core/identity/src/index.ts'),
      '@community/places': path.resolve(__dirname, './packages/core/places/src/index.ts'),
      '@community/ui': path.resolve(__dirname, './packages/ui/primitives/src/index.ts'),
      '@community/ui-member': path.resolve(__dirname, './packages/ui/member/src/index.ts'),
    },
  },
});
