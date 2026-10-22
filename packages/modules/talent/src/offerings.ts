export const OFFERING_LIMIT = 20;
const AUDIENCES = ['private', 'internal', 'external'] as const;
export type OfferingAudience = (typeof AUDIENCES)[number];

export type OfferingCategoryRule = { id: string; allowsOtherText: boolean };

export type OfferingInput = {
  title: string;
  description: string;
  url: string | null;
  categoryId: string;
  categoryOther: string | null;
  audience: OfferingAudience;
};

export function parseOffering(
  body: Record<string, unknown>,
  categories: OfferingCategoryRule[]
): { ok: true; value: OfferingInput } | { ok: false; message: string } {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!title || title.length > 120) {
    return { ok: false, message: 'Título obrigatório (até 120 caracteres).' };
  }
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  if (description.length > 2000) {
    return { ok: false, message: 'Descrição longa demais.' };
  }
  const rawUrl = typeof body.url === 'string' ? body.url.trim() : '';
  if (rawUrl && !/^https:\/\/\S+$/i.test(rawUrl)) {
    return { ok: false, message: 'Link inválido.' };
  }
  const categoryId = typeof body.categoryId === 'string' ? body.categoryId : '';
  const category = categories.find((item) => item.id === categoryId);
  if (!category) {
    return { ok: false, message: 'Categoria desconhecida.' };
  }
  const other = typeof body.categoryOther === 'string' ? body.categoryOther.trim() : '';
  if (category.allowsOtherText && (other.length < 1 || other.length > 80)) {
    return { ok: false, message: 'Descreva a categoria (até 80 caracteres).' };
  }
  const audience = AUDIENCES.includes(body.audience as OfferingAudience) ? (body.audience as OfferingAudience) : 'internal';
  return {
    ok: true,
    value: {
      title,
      description,
      url: rawUrl || null,
      categoryId,
      categoryOther: category.allowsOtherText ? other : null,
      audience,
    },
  };
}

export type TalentCeiling = 'hidden' | 'internal' | 'external';

export function talentCeiling(settings: unknown): TalentCeiling {
  const value = settings && typeof settings === 'object' ? (settings as { talent_exposure?: unknown }).talent_exposure : null;
  return value === 'hidden' || value === 'internal' || value === 'external' ? value : 'internal';
}

export type TalentListSurface = 'directory' | 'showcase';

/** Whether list UI (category filter, talent-aware search bind) applies for this community and surface. */
export function talentListFiltersEnabled(input: {
  talentOn: boolean;
  ceiling: TalentCeiling;
  surface: TalentListSurface;
}): boolean {
  if (!input.talentOn || input.ceiling === 'hidden') {
    return false;
  }
  if (input.surface === 'showcase') {
    return input.ceiling === 'external';
  }
  return true;
}

export function visibleOfferings<T extends { audience: string }>(
  rows: T[],
  level: 'owner' | 'internal' | 'external',
  ceiling: TalentCeiling = 'external'
) {
  if (level !== 'owner' && (ceiling === 'hidden' || (ceiling === 'internal' && level === 'external'))) {
    return [];
  }
  if (level === 'owner') {
    return rows;
  }
  return rows.filter((row) => (level === 'external' ? row.audience === 'external' : row.audience !== 'private'));
}
