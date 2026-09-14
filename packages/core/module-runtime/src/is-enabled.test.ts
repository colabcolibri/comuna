import { createIsEnabled } from './is-enabled';

describe('isEnabled', () => {
  it('returns false when the community has no row', async () => {
    const runtime = createIsEnabled({
      query: async () => ({ rows: [] }),
    });
    await expect(runtime.isEnabled('c1', 'directory')).resolves.toBe(false);
  });

  it('returns true only when enabled is true', async () => {
    const runtime = createIsEnabled({
      query: async () => ({ rows: [{ enabled: true }] }),
    });
    await expect(runtime.isEnabled('c1', 'directory')).resolves.toBe(true);
  });
});
