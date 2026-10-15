import { describe, expect, it } from 'vitest';
import { contributionsOn } from '@community/module-runtime';
import { talentContribution } from './contribution';

describe('talent contribution', () => {
  it('stays out of the chrome when the module is off', () => {
    expect(contributionsOn([talentContribution], [])).toEqual([]);
  });

  it('joins the chrome when the module is on', () => {
    expect(contributionsOn([talentContribution], ['talent'])[0]?.slug).toBe('talent');
  });
});
