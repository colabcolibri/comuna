import { describe, expect, it } from 'vitest';
import {
  clampFieldSpan,
  fieldSpanChoices,
  fieldTypeLabel,
  type CatalogCopy,
} from '../apps/admin/components/community-fields-types';

const copy = { typeImage: 'imagem', typeText: 'texto' } as CatalogCopy;

describe('community fields layout helpers', () => {
  it('hides extra span choices when the group is a single column', () => {
    expect(fieldSpanChoices(1)).toEqual([1]);
    expect(clampFieldSpan(3, 1)).toBe(1);
  });

  it('caps span to the group column count', () => {
    expect(fieldSpanChoices(2)).toEqual([1, 2]);
    expect(clampFieldSpan(3, 2)).toBe(2);
  });

  it('maps image type to a human label', () => {
    expect(fieldTypeLabel('image', copy)).toBe('imagem');
  });
});
