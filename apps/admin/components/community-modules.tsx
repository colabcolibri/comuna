'use client';

import { useEffect, useState } from 'react';
import { Button } from '@community/ui';
import { OpsSection } from '@community/ui-admin';
import { contentFromCatalog, pickContent } from '@community/identity';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  title: 'community.modules',
  help: 'community.modules_help',
  on: 'community.on',
  off: 'community.off',
});

type ModuleState = { slug: string; enabled: boolean };

export function CommunityModules({ communityId }: { communityId: string }) {
  const copy = pickContent(CONTENT, useLocale());
  const [modules, setModules] = useState<ModuleState[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  const load = () => {
    fetch(`/api/admin/communities/${communityId}/modules`).then(async (res) => {
      if (!res.ok) {
        return;
      }
      const json = await res.json();
      setModules(json.data || []);
    });
  };

  useEffect(() => {
    load();
  }, [communityId]);

  const toggle = async (moduleSlug: string, enabled: boolean) => {
    setSaving(moduleSlug);
    await fetch(`/api/admin/communities/${communityId}/modules/${moduleSlug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
    setSaving(null);
    load();
  };

  return (
    <OpsSection title={copy.title} description={copy.help}>
      <ul className="divide-y divide-border">
        {modules.map((mod) => (
          <li key={mod.slug} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <span className="font-mono text-sm leading-none">{mod.slug}</span>
            <Button
              type="button"
              size="sm"
              variant={mod.enabled ? 'default' : 'secondary'}
              disabled={saving === mod.slug}
              onClick={() => void toggle(mod.slug, !mod.enabled)}
            >
              {mod.enabled ? copy.on : copy.off}
            </Button>
          </li>
        ))}
      </ul>
    </OpsSection>
  );
}
