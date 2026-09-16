'use client';

import { useState } from 'react';
import Link from 'next/link';
import { contentFromCatalog, pickContent } from '@community/identity';
import { Button, toast } from '@community/ui';
import { useLocale } from '@/components/app/LocaleProvider';
import { uiCatalog } from '@/lang/catalog';
import type { NetworkStatus } from '@community/memberships';

const CONTENT = contentFromCatalog(uiCatalog, 'core_membership', {
  request: 'join.request',
  pending: 'join.pending',
  suspended: 'join.suspended',
  signin: 'join.signin',
  enter: 'join.enter',
  ok: 'join.ok',
  error: 'join.error',
});

export function JoinCta({
  slug,
  signedIn,
  status,
  tone = 'inline',
}: {
  slug: string;
  signedIn: boolean;
  status: NetworkStatus | null;
  tone?: 'hero' | 'inline';
}) {
  const copy = pickContent(CONTENT, useLocale());
  const [busy, setBusy] = useState(false);
  const [localStatus, setLocalStatus] = useState(status);

  if (localStatus === 'active') {
    return null;
  }
  if (!signedIn) {
    const href = `/login?next=${encodeURIComponent(`/c/${slug}/directory`)}`;
    if (tone === 'hero') {
      return (
        <Button asChild className="min-h-11 w-full px-6 sm:w-auto">
          <Link href={href}>{copy.enter}</Link>
        </Button>
      );
    }
    return (
      <p className="text-sm text-muted-foreground">
        <Link className="underline" href={href}>
          {copy.signin}
        </Link>
      </p>
    );
  }
  if (localStatus === 'pending_approval') {
    return <p className="max-w-xs text-sm text-muted-foreground">{copy.pending}</p>;
  }
  if (localStatus === 'suspended') {
    return <p className="max-w-xs text-sm text-muted-foreground">{copy.suspended}</p>;
  }

  const send = async () => {
    setBusy(true);
    const res = await fetch(`/api/communities/${slug}/join`, { method: 'POST' });
    setBusy(false);
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    setLocalStatus('pending_approval');
    toast.success(copy.ok);
  };

  return (
    <Button type="button" className="min-h-11 w-full px-6 sm:w-auto" disabled={busy} onClick={() => void send()}>
      {copy.request}
    </Button>
  );
}
