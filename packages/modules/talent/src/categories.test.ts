import { describe, expect, it } from 'vitest';
import { DEFAULT_TALENT_CATEGORY_SEED } from './category-seed';
import { parseOffering } from './offerings';

const RULES = DEFAULT_TALENT_CATEGORY_SEED.map((item) => ({
  id: item.id,
  allowsOtherText: item.allowsOtherText,
}));

describe('parseOffering', () => {
  it('rejects an unknown category', () => {
    const parsed = parseOffering({ title: 'Aula de SQL', categoryId: 'nope' }, RULES);
    expect(parsed.ok).toBe(false);
  });

  it('requires free text for other', () => {
    const parsed = parseOffering({ title: 'Algo', categoryId: 'other', categoryOther: '' }, RULES);
    expect(parsed.ok).toBe(false);
  });

  it('accepts a closed category without free text', () => {
    const parsed = parseOffering({ title: 'Mentoria de produto', categoryId: 'mentorship' }, RULES);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.categoryOther).toBeNull();
      expect(parsed.value.audience).toBe('internal');
    }
  });

  it('rejects a bad link', () => {
    const parsed = parseOffering({ title: 'Site', categoryId: 'project', url: 'notaurl' }, RULES);
    expect(parsed.ok).toBe(false);
  });
});
