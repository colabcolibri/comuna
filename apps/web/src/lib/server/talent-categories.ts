import { query, queryAsMember } from '@community/db';
import { pickLocalizedText } from '@community/identity';
import { listTalentCategories, type TalentCategory } from '@community/talent';
import type { AppQueryCtx } from '@/lib/server/app-ctx';

export async function memberTalentCategories(ctx: AppQueryCtx, opts?: { enabledOnly?: boolean }) {
  return listTalentCategories((sql, params) => queryAsMember(ctx, sql, params), ctx.communityId, opts);
}

export async function publicTalentCategories(communityId: string, opts?: { enabledOnly?: boolean }) {
  return listTalentCategories((sql, params) => query(sql, params), communityId, opts);
}

export function offeringCategoryRules(categories: TalentCategory[]) {
  return categories
    .filter((item) => item.enabled)
    .map((item) => ({ id: item.id, allowsOtherText: item.allowsOtherText }));
}

export function talentCategoriesForLocale(categories: TalentCategory[], locale: string) {
  return categories
    .filter((item) => item.enabled)
    .map((item) => ({
      id: item.id,
      label: pickLocalizedText(item.label, locale),
      allowsOtherText: item.allowsOtherText,
    }));
}
