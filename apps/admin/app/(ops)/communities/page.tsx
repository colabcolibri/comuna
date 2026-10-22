import { CommunitiesPanel } from '@/components/communities-panel';
import { getOpsAccess } from '@/lib/ops-session';

export default async function CommunitiesPage() {
  const access = await getOpsAccess();
  const canCreate = access?.communityIds === null;
  return <CommunitiesPanel canCreate={canCreate} />;
}
