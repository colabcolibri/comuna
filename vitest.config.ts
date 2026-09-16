import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: [
      'apps/web/src/**/*.test.ts',
      'apps/web/src/**/*.test.tsx',
      'apps/admin/lib/**/*.test.ts',
      'tests/**/*.test.ts',
      'tests/**/*.test.tsx',
      'packages/**/*.test.ts',
      'packages/**/*.test.tsx',
      'scripts/**/*.test.ts',
    ],
  },
  resolve: {
    alias: [
      { find: 'server-only', replacement: path.resolve(__dirname, './tests/mocks/server-only.ts') },
      { find: '@', replacement: path.resolve(__dirname, './apps/web/src') },
      { find: 'cn', replacement: path.resolve(__dirname, './packages/ui/primitives/src/lib/utils.ts') },
      { find: '@community/db', replacement: path.resolve(__dirname, './packages/core/db/src/index.ts') },
      {
        find: '@community/mail/compose',
        replacement: path.resolve(__dirname, './packages/core/mail/src/compose.ts'),
      },
      { find: '@community/mail', replacement: path.resolve(__dirname, './packages/core/mail/src/index.ts') },
      { find: '@community/identity', replacement: path.resolve(__dirname, './packages/core/identity/src/index.ts') },
      { find: '@community/places', replacement: path.resolve(__dirname, './packages/core/places/src/index.ts') },
      {
        find: '@community/communities/types',
        replacement: path.resolve(__dirname, './packages/core/communities/src/types.ts'),
      },
      { find: '@community/communities', replacement: path.resolve(__dirname, './packages/core/communities/src/index.ts') },
      { find: '@community/memberships', replacement: path.resolve(__dirname, './packages/core/memberships/src/index.ts') },
      { find: '@community/module-runtime', replacement: path.resolve(__dirname, './packages/core/module-runtime/src/index.ts') },
      { find: '@community/directory', replacement: path.resolve(__dirname, './packages/modules/directory/src/index.ts') },
      { find: '@community/showcase', replacement: path.resolve(__dirname, './packages/modules/showcase/src/index.ts') },
      { find: '@community/contact-mediated', replacement: path.resolve(__dirname, './packages/modules/contact-mediated/src/index.ts') },
      { find: '@community/map', replacement: path.resolve(__dirname, './packages/modules/map/src/index.ts') },
      { find: '@community/ui/theme-init', replacement: path.resolve(__dirname, './packages/ui/primitives/src/theme-init.ts') },
      { find: '@community/ui', replacement: path.resolve(__dirname, './packages/ui/primitives/src/index.ts') },
      { find: '@community/ui-member', replacement: path.resolve(__dirname, './packages/ui/member/src/index.ts') },
      { find: '@community/ui-admin', replacement: path.resolve(__dirname, './packages/ui/admin/src/index.ts') },
      { find: 'next/navigation', replacement: path.resolve(__dirname, './tests/mocks/next-navigation.ts') },
    ],
  },
});
