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
  ok: 'join.ok',
  error: 'join.error',
});

export function JoinCta({
  slug,
  signedIn,
  status,
}: {
  slug: string;
  signedIn: boolean;
  status: NetworkStatus | null;
}) {
  const copy = pickContent(CONTENT, useLocale());
  const [busy, setBusy] = useState(false);
  const [localStatus, setLocalStatus] = useState(status);

  if (localStatus === 'active') {
    return null;
  }
  if (!signedIn) {
    return (
      <p className="mb-6 text-sm text-muted-foreground">
        <Link className="underline" href={`/login?next=/c/${slug}/showcase`}>
          {copy.signin}
        </Link>
      </p>
    );
  }
  if (localStatus === 'pending_approval') {
    return <p className="mb-6 text-sm text-muted-foreground">{copy.pending}</p>;
  }
  if (localStatus === 'suspended') {
    return <p className="mb-6 text-sm text-muted-foreground">{copy.suspended}</p>;
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
    <div className="mb-6">
      <Button type="button" disabled={busy} onClick={() => void send()}>
        {copy.request}
      </Button>
    </div>
  );
}
