import { audiencePickerCeiling, type Exposure } from './audience';
import type { CatalogField } from './catalog';

const EXPOSURE_RANK: Record<Exposure, number> = { hidden: 0, internal: 1, external: 2 };

const LISTING_COLUMN_BLOCKLIST = new Set(['public_directory', 'public_showcase']);

/** Fields on the community card that can affect directory / showcase listing. */
export function memberListingFields(fields: CatalogField[]): CatalogField[] {
  return fields.filter(
    (field) =>
      field.storage !== 'person' &&
      field.enabled &&
      !LISTING_COLUMN_BLOCKLIST.has(field.column_key || field.name)
  );
}

/** Highest exposure any listing field allows (community ops cap aggregate). */
export function communityListingExposureCap(fields: CatalogField[]): Exposure {
  const listing = memberListingFields(fields);
  if (!listing.length) {
    return 'hidden';
  }
  let rank = 0;
  for (const field of listing) {
    rank = Math.max(rank, EXPOSURE_RANK[audiencePickerCeiling(field.exposure)]);
  }
  if (rank >= 2) {
    return 'external';
  }
  if (rank >= 1) {
    return 'internal';
  }
  return 'hidden';
}

export function communityAllowsDirectoryListing(fields: CatalogField[]): boolean {
  return communityListingExposureCap(fields) !== 'hidden';
}

/** At least one listing field may be set to external audience (showcase-eligible). */
export function communityAllowsShowcaseListing(fields: CatalogField[]): boolean {
  return memberListingFields(fields).some((field) => audiencePickerCeiling(field.exposure) === 'external');
}
