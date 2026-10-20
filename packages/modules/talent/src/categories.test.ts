import { describe, expect, it } from 'vitest';
import { parseOffering } from './offerings';

describe('parseOffering', () => {
  it('rejects an unknown category', () => {
    const parsed = parseOffering({ title: 'Aula de SQL', categoryId: 'nope' });
    expect(parsed.ok).toBe(false);
  });

  it('requires free text for other', () => {
    const parsed = parseOffering({ title: 'Algo', categoryId: 'other', categoryOther: '' });
    expect(parsed.ok).toBe(false);
  });

  it('accepts a closed category without free text', () => {
    const parsed = parseOffering({ title: 'Mentoria de produto', categoryId: 'mentorship' });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.categoryOther).toBeNull();
      expect(parsed.value.audience).toBe('private');
    }
  });

  it('rejects a bad link', () => {
    const parsed = parseOffering({ title: 'Site', categoryId: 'project', url: 'notaurl' });
    expect(parsed.ok).toBe(false);
  });
});
