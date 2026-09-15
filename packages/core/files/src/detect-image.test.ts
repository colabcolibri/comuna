import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { avatarObjectKey, detectImage, MAX_AVATAR_BYTES } from './detect-image';
import { createLocalStore } from './local-store';

const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
const svg = Uint8Array.from(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'));

describe('detectImage', () => {
  it('accepts jpeg and rejects svg', () => {
    expect(detectImage(jpeg)?.mime).toBe('image/jpeg');
    expect(detectImage(svg)).toBeNull();
  });

  it('builds a person-scoped key only for uuids', () => {
    expect(avatarObjectKey('not-a-uuid')).toBeNull();
    expect(avatarObjectKey('11111111-1111-4111-8111-111111111111')).toBe(
      'person/11111111-1111-4111-8111-111111111111/avatar'
    );
  });
});

describe('local ObjectStore', () => {
  it('round-trips bytes under the media root', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'media-'));
    const store = createLocalStore(root);
    const key = 'person/11111111-1111-4111-8111-111111111111/avatar';
    await store.put(key, jpeg, 'image/jpeg');
    const got = await store.get(key);
    expect(got?.mime).toBe('image/jpeg');
    expect(Array.from(got?.bytes || [])).toEqual(Array.from(jpeg));
    await rm(root, { recursive: true, force: true });
  });

  it('caps documented avatar size', () => {
    expect(MAX_AVATAR_BYTES).toBe(2 * 1024 * 1024);
  });
});
