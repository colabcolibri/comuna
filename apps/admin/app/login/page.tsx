import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/login-form';
import { getOpsSession } from '@/lib/ops-session';

export default async function LoginPage() {
  const session = await getOpsSession();
  if (session) {
    redirect('/communities');
  }
  return <LoginForm />;
}
