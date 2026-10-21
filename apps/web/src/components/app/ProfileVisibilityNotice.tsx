'use client';

import { contentFromCatalog, pickContent } from '@community/identity';
import type { ListingHint } from '@community/directory';
import { useLocale } from '@/components/app/LocaleProvider';
import { uiCatalog } from '@/lang/catalog';

const COPY = contentFromCatalog(uiCatalog, 'plugin_directory', {
  title: 'profile.visibility_title',
  visibleDirectory: 'profile.visibility_visible_directory',
  visibleShowcase: 'profile.visibility_visible_showcase',
  allPrivate: 'profile.visibility_all_private',
  noBlocks: 'profile.visibility_no_blocks',
  directoryOff: 'profile.visibility_directory_off',
  showcaseOff: 'profile.visibility_showcase_off',
  showcaseOptOut: 'profile.visibility_showcase_opt_out',
  communityDirectoryBlocked: 'profile.visibility_community_directory_blocked',
  communityShowcaseBlocked: 'profile.visibility_community_showcase_blocked',
});

const HINT_LINES: Record<ListingHint, keyof typeof COPY> = {
  visible_directory: 'visibleDirectory',
  visible_showcase: 'visibleShowcase',
  all_private: 'allPrivate',
  no_public_blocks: 'noBlocks',
  directory_module_off: 'directoryOff',
  showcase_module_off: 'showcaseOff',
  showcase_opt_out: 'showcaseOptOut',
  community_directory_blocked: 'communityDirectoryBlocked',
  community_showcase_blocked: 'communityShowcaseBlocked',
  membership_inactive: 'noBlocks',
};

export function ProfileVisibilityNotice({ hints }: { hints: ListingHint[] }) {
  const locale = useLocale();
  const copy = pickContent(COPY, locale);
  const positive = hints.filter((item) => item === 'visible_directory' || item === 'visible_showcase');
  const issues = hints.filter(
    (item) =>
      item === 'all_private' ||
      item === 'no_public_blocks' ||
      item === 'directory_module_off' ||
      item === 'showcase_module_off' ||
      item === 'showcase_opt_out' ||
      item === 'community_directory_blocked' ||
      item === 'community_showcase_blocked'
  );
  const lines = [...positive, ...issues].map((hint) => copy[HINT_LINES[hint]]).filter(Boolean);
  if (lines.length === 0) {
    return null;
  }
  return (
    <aside className="mb-8 rounded-xl border border-border bg-muted/40 p-4 text-sm leading-relaxed text-foreground">
      <p className="font-medium">{copy.title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </aside>
  );
}
