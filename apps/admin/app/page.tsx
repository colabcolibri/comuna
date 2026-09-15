import { redirect } from 'next/navigation';
import { getOpsSession } from '@/lib/ops-session';

export default async function AdminIndex() {
  const session = await getOpsSession();
  redirect(session ? '/communities' : '/login');
}
