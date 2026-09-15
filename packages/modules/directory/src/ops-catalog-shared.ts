export class CatalogWriteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CatalogWriteError';
  }
}

export const ATTRIBUTE_FIELD_TYPES = ['text', 'textarea', 'boolean', 'select', 'url'] as const;
export type AttributeFieldType = (typeof ATTRIBUTE_FIELD_TYPES)[number];

export const SEED_GROUP_SLUGS = new Set([
  'identity',
  'person',
  'links',
  'community_copy',
  'availability',
  'hospitality',
]);

export function isFieldLocked(storage: string): boolean {
  return storage !== 'attributes';
}

export function isSeedGroup(slug: string): boolean {
  return SEED_GROUP_SLUGS.has(slug);
}

export function slugifyCatalogName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}

export type MoveDirection = 'up' | 'down';

export function movedSequence(ids: string[], id: string, direction: MoveDirection): string[] | null {
  const index = ids.indexOf(id);
  if (index < 0) {
    throw new CatalogWriteError('NOT_FOUND');
  }
  const next = direction === 'up' ? index - 1 : index + 1;
  if (next < 0 || next >= ids.length) {
    return null;
  }
  const copy = [...ids];
  const [item] = copy.splice(index, 1);
  copy.splice(next, 0, item);
  return copy;
}
