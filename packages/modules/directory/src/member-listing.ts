import { parseLocalized } from '@community/identity';
import { audiencePickerCeiling, audienceVisible, parseAudience, type CatalogField } from './audience';
import { communityAllowsDirectoryListing, communityAllowsShowcaseListing } from './member-exposure';

export type MemberCardSlice = {
  headline?: unknown;
  bio?: unknown;
  headline_audience?: unknown;
  bio_audience?: unknown;
  public_showcase?: unknown;
  attribute_audience?: Record<string, unknown> | null;
  custom_attributes?: Record<string, unknown> | null;
};

export type ListingSurface = 'directory' | 'showcase';

export type ListingHint =
  | 'directory_module_off'
  | 'showcase_module_off'
  | 'membership_inactive'
  | 'all_private'
  | 'no_public_blocks'
  | 'visible_directory'
  | 'visible_showcase'
  | 'showcase_opt_out'
  | 'community_directory_blocked'
  | 'community_showcase_blocked';

function fieldByColumn(fields: CatalogField[], columnKey: string) {
  return fields.find((field) => field.column_key === columnKey);
}

function attributeBlocks(card: MemberCardSlice, fields: CatalogField[], level: 'internal' | 'external') {
  const audMap =
    card.attribute_audience && typeof card.attribute_audience === 'object' ? card.attribute_audience : {};
  const attrs =
    card.custom_attributes && typeof card.custom_attributes === 'object' ? card.custom_attributes : {};
  for (const field of fields) {
    if (field.storage !== 'attributes') {
      continue;
    }
    const cap = audiencePickerCeiling(field.exposure);
    if (level === 'external' && cap !== 'external') {
      continue;
    }
    if (level === 'internal' && cap === 'hidden') {
      continue;
    }
    const audience = parseAudience(audMap[field.name], 'private');
    if (!audienceVisible(audience, level)) {
      continue;
    }
    const value = attrs[field.name];
    if (value === undefined || value === null || value === '') {
      continue;
    }
    if (Array.isArray(value) && value.length === 0) {
      continue;
    }
    return true;
  }
  return false;
}

function blockVisible(
  card: MemberCardSlice,
  field: CatalogField | undefined,
  audienceRaw: unknown,
  content: unknown,
  level: 'internal' | 'external'
) {
  if (!field) {
    return false;
  }
  const cap = audiencePickerCeiling(field.exposure);
  if (level === 'external' && cap !== 'external') {
    return false;
  }
  if (level === 'internal' && cap === 'hidden') {
    return false;
  }
  const audience = parseAudience(audienceRaw, 'private');
  if (!audienceVisible(audience, level)) {
    return false;
  }
  if (field.column_key === 'headline' || field.column_key === 'bio') {
    return parseLocalized(content).some((entry) => (entry.value || '').trim().length > 0);
  }
  return Boolean(content);
}

function showcaseContentVisible(card: MemberCardSlice, fields: CatalogField[]) {
  const level = 'external';
  const headlineField = fieldByColumn(fields, 'headline');
  const bioField = fieldByColumn(fields, 'bio');
  return (
    blockVisible(card, headlineField, card.headline_audience, card.headline, level) ||
    blockVisible(card, bioField, card.bio_audience, card.bio, level) ||
    attributeBlocks(card, fields, level)
  );
}

/** Mirrors directory/showcase scope SQL for the member's own card (read path). */
export function memberListsOnSurface(
  surface: ListingSurface,
  card: MemberCardSlice | null | undefined,
  fields: CatalogField[]
): boolean {
  if (!card) {
    return false;
  }
  if (surface === 'showcase' && card.public_showcase !== true) {
    return false;
  }
  const level = surface === 'showcase' ? 'external' : 'internal';
  const headlineField = fieldByColumn(fields, 'headline');
  const bioField = fieldByColumn(fields, 'bio');
  if (
    blockVisible(card, headlineField, card.headline_audience, card.headline, level) ||
    blockVisible(card, bioField, card.bio_audience, card.bio, level) ||
    attributeBlocks(card, fields, level)
  ) {
    return true;
  }
  return false;
}

export function memberListingHints(input: {
  directoryOn: boolean;
  showcaseOn: boolean;
  card: MemberCardSlice | null | undefined;
  fields: CatalogField[];
}): ListingHint[] {
  const hints: ListingHint[] = [];
  if (!input.directoryOn) {
    hints.push('directory_module_off');
  }
  if (!input.showcaseOn) {
    hints.push('showcase_module_off');
  }
  if (input.directoryOn && !communityAllowsDirectoryListing(input.fields)) {
    hints.push('community_directory_blocked');
  }
  if (input.showcaseOn && !communityAllowsShowcaseListing(input.fields)) {
    hints.push('community_showcase_blocked');
  }
  const card = input.card;
  if (!card) {
    hints.push('no_public_blocks');
    return hints;
  }
  const onDirectory =
    input.directoryOn &&
    communityAllowsDirectoryListing(input.fields) &&
    memberListsOnSurface('directory', card, input.fields);
  const onShowcase =
    input.showcaseOn &&
    communityAllowsShowcaseListing(input.fields) &&
    memberListsOnSurface('showcase', card, input.fields);
  if (onDirectory) {
    hints.push('visible_directory');
  }
  if (onShowcase) {
    hints.push('visible_showcase');
  }
  if (
    input.showcaseOn &&
    communityAllowsShowcaseListing(input.fields) &&
    card.public_showcase !== true &&
    showcaseContentVisible(card, input.fields)
  ) {
    hints.push('showcase_opt_out');
  }
  if (!onDirectory && !onShowcase) {
    const headline = fieldByColumn(input.fields, 'headline');
    const bio = fieldByColumn(input.fields, 'bio');
    const allPrivate =
      parseAudience(card.headline_audience, 'private') === 'private' &&
      parseAudience(card.bio_audience, 'private') === 'private' &&
      !attributeBlocks(card, input.fields, 'internal') &&
      !attributeBlocks(card, input.fields, 'external');
    hints.push(allPrivate ? 'all_private' : 'no_public_blocks');
  }
  return hints;
}
