import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { DICEBEAR_STYLE, demoAvatarUrl, dicebearAvatarUrl, seedDemoAvatarsEnabled } = require('./seed-demo-avatars.cjs');

describe('seed-demo-avatars', () => {
  it('uses dicebear sprouts for every member', () => {
    expect(DICEBEAR_STYLE).toBe('sprouts');
    expect(dicebearAvatarUrl(1)).toBe(
      'https://api.dicebear.com/10.x/sprouts/png?seed=demo-member-1&size=512'
    );
    expect(demoAvatarUrl(3)).toBe(dicebearAvatarUrl(3));
    expect(demoAvatarUrl(42)).toContain('seed=demo-member-42');
  });

  it('can be disabled with SEED_DEMO_AVATARS=0', () => {
    const previous = process.env.SEED_DEMO_AVATARS;
    process.env.SEED_DEMO_AVATARS = '0';
    expect(seedDemoAvatarsEnabled()).toBe(false);
    delete process.env.SEED_DEMO_AVATARS;
    expect(seedDemoAvatarsEnabled()).toBe(true);
    process.env.SEED_DEMO_AVATARS = previous;
  });
});
