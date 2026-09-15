import { redirect } from 'next/navigation';
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
  const cohorts = await listCohorts(member.ctx.communityId);
  return (
    <DirectoryPanel
      rows={listed.body.data}
      facets={listed.body.facets}
      listFields={listed.body.listFields}
      search={query.get('search') || ''}
      facetValues={facetsFromSearchParams(query)}
      status={query.get('status') || ''}
      cohorts={cohorts}
      cohort={query.get('cohort') || ''}
    />
  );
}
