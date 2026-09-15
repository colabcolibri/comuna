import { describe, expect, it } from 'vitest';
import { directoryQueryString, facetsFromSearchParams } from './directory-query';

describe('directory query string', () => {
  it('builds search and facet params without empty keys', () => {
    expect(directoryQueryString('  ana  ', { host_at_home: 'true', skip: '' }, 'c1')).toBe(
      'search=ana&attr.host_at_home=true&cohort=c1'
    );
    const parsed = facetsFromSearchParams(new URLSearchParams('search=ana&attr.host_at_home=true'));
    expect(parsed).toEqual({ host_at_home: 'true' });
  });
});
