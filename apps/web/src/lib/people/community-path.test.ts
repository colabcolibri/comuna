import { describe, expect, it } from 'vitest';
import { communityPath, jobFromPath, nextJobPath } from './community-path';

describe('communityPath', () => {
  it('prefixes the plugin href with the slug', () => {
    expect(communityPath('alumni', '/directory')).toBe('/c/alumni/directory');
  });
});

describe('nextJobPath', () => {
  it('keeps directory when the destination still has the plugin', () => {
    expect(nextJobPath('/c/alumni/directory', 'lab', ['directory'], false)).toBe('/c/lab/directory');
  });

  it('falls back when the job is missing in the destination', () => {
    expect(nextJobPath('/c/alumni/directory', 'lab', ['showcase'], false)).toBe('/c/lab/showcase');
  });

  it('reads the job out of a workspace path', () => {
    expect(jobFromPath('/c/alumni/profile/edit')).toBe('/profile/edit');
  });
});
