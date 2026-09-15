import { describe, expect, it } from 'vitest';
import { communityPath, jobFromPath, nextJobPath, slugFromPathname } from './community-path';

describe('communityPath', () => {
  it('prefixes the plugin href with the slug', () => {
    expect(communityPath('alumni', '/directory')).toBe('/c/alumni/directory');
  });

  it('reads the slug from the workspace path', () => {
    expect(slugFromPathname('/c/lab/directory')).toBe('lab');
    expect(slugFromPathname('/showcase')).toBeNull();
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
    expect(jobFromPath('/c/alumni/profile')).toBe('/profile');
  });

  it('keeps community profile when switching tenants', () => {
    expect(nextJobPath('/c/alumni/profile', 'lab', ['directory'], false)).toBe('/c/lab/profile');
  });

  it('leaves the global account page when switching community', () => {
    expect(nextJobPath('/profile', 'lab', ['directory'], false)).toBe('/c/lab/directory');
  });
});
