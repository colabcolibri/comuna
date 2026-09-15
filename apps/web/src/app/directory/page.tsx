import { redirect } from 'next/navigation';
import type { CatalogField } from '@community/directory';
import { DirectoryPanel } from '@/components/app/DirectoryPanel';
import { listDirectoryCatalog } from '@/lib/server/directory-catalog';
import { listDirectoryMembers } from '@/lib/server/directory-members';
import { requireActiveMember } from '@/lib/server/require-member';
import { facetsFromSearchParams, searchParamsFromRecord } from '@/lib/people/directory-query';

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const member = await requireActiveMember();
  if (!member.ok) {
    return (
      <p className="p-6 text-muted-foreground">Esta conta ainda não tem membership nesta comunidade.</p>
    );
  }
  const params = searchParamsFromRecord(await searchParams);
  const catalog = await listDirectoryCatalog(member.ctx);
  if (catalog.status === 404) {
    redirect('/');
  }
  const listed = await listDirectoryMembers(member.ctx, params);
  if (listed.status === 404) {
    redirect('/');
  }
  if (listed.status !== 200) {
    return <p className="p-6 text-muted-foreground">Não foi possível carregar o diretório.</p>;
  }
  const facets = (catalog.body.groups || []).flatMap((group) => group.fields || []).filter(
    (field: CatalogField) => field.filterable && field.storage === 'attributes'
  );
  return (
    <DirectoryPanel
      rows={listed.body.data}
      facets={facets}
      search={params.get('search') || ''}
      facetValues={facetsFromSearchParams(params)}
    />
  );
}
