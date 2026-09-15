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
      '@community/mail': path.resolve(__dirname, './packages/core/mail/src/index.ts'),
      '@community/identity': path.resolve(__dirname, './packages/core/identity/src/index.ts'),
      '@community/places': path.resolve(__dirname, './packages/core/places/src/index.ts'),
      '@community/communities': path.resolve(__dirname, './packages/core/communities/src/index.ts'),
      '@community/memberships': path.resolve(__dirname, './packages/core/memberships/src/index.ts'),
      '@community/module-runtime': path.resolve(__dirname, './packages/core/module-runtime/src/index.ts'),
      '@community/directory': path.resolve(__dirname, './packages/modules/directory/src/index.ts'),
      '@community/showcase': path.resolve(__dirname, './packages/modules/showcase/src/index.ts'),
      '@community/contact-mediated': path.resolve(__dirname, './packages/modules/contact-mediated/src/index.ts'),
      '@community/ui': path.resolve(__dirname, './packages/ui/primitives/src/index.ts'),
      '@community/ui-member': path.resolve(__dirname, './packages/ui/member/src/index.ts'),
      '@community/ui-admin': path.resolve(__dirname, './packages/ui/admin/src/index.ts'),
    },
  },
});
