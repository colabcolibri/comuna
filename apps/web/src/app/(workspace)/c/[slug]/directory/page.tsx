import { redirect } from 'next/navigation';
import type { CatalogField } from '@community/directory';
import { listCohorts } from '@community/memberships';
import { DirectoryPanel } from '@/components/app/DirectoryPanel';
import { MemberAccessNotice } from '@/components/app/MemberAccessNotice';
import { listDirectoryCatalog } from '@/lib/server/directory-catalog';
import { listDirectoryMembers } from '@/lib/server/directory-members';
import { requireMemberForSlug } from '@/lib/server/require-member';
import { facetsFromSearchParams, searchParamsFromRecord } from '@/lib/people/directory-query';

export default async function DirectoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const member = await requireMemberForSlug(slug);
  if (!member.ok) {
    return <MemberAccessNotice kind="forbidden" />;
  }
  const query = searchParamsFromRecord(await searchParams);
  const catalog = await listDirectoryCatalog(member.ctx);
  if (catalog.status === 404) {
    redirect('/');
  }
  const listed = await listDirectoryMembers(member.ctx, query);
  if (listed.status === 404) {
    redirect('/');
  }
  if (listed.status !== 200) {
    return <MemberAccessNotice kind="loadError" />;
  }
  const facets = (catalog.body.groups || []).flatMap((group) => group.fields || []).filter(
    (field: CatalogField) => field.filterable && field.storage === 'attributes'
  );
  const cohorts = await listCohorts(member.ctx.communityId);
  return (
    <DirectoryPanel
      rows={listed.body.data}
      facets={facets}
      search={query.get('search') || ''}
      facetValues={facetsFromSearchParams(query)}
      cohorts={cohorts}
      cohort={query.get('cohort') || ''}
    />
  );
}
