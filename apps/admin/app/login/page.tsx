import { redirect } from 'next/navigation';
import { DemoOpsLogin } from '@/components/demo-ops-login';
import { LoginForm } from '@/components/login-form';
import { isDatabaseReadOnly } from '@/lib/read-only';
import { getOpsSession } from '@/lib/ops-session';

export default async function LoginPage() {
  const session = await getOpsSession();
  if (session) {
    redirect('/communities');
  }
  return isDatabaseReadOnly() ? <DemoOpsLogin /> : <LoginForm />;
}
