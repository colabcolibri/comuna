'use client';

import React, { useEffect, useState } from 'react';
import { contentFromCatalog, pickContent, pickLocalizedText } from '@community/identity';
import { displayPlace } from '@community/places';
import { AppIndexList, AppPageTemplate, AppPersonRow } from '@community/ui-member';
import { useLocale } from '@/components/app/LocaleProvider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'plugin_directory', {
  kicker: 'page.kicker',
  title: 'page.title',
  subtitle: 'page.subtitle',
  search: 'page.search',
  empty: 'page.empty',
  off: 'page.off',
  privacy: 'page.privacy',
  view: 'page.view',
});

type MemberRow = {
  id: string;
  full_name: string;
  current_city: unknown;
  languages: unknown;
  headline: unknown;
  bio: unknown;
  availability_status: string | null;
};

export default function DirectoryPage() {
  const locale = useLocale();
  const copy = pickContent(CONTENT, locale);
  const [rows, setRows] = useState<MemberRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [off, setOff] = useState(false);

  useEffect(() => {
    fetch('/api/profiles').then(async (res) => {
      if (res.status === 404) {
        setOff(true);
        return;
      }
      const json = await res.json();
      setRows(json.data || []);
    });
  }, []);

  const filtered = rows.filter((p) => {
    const headline = pickLocalizedText(p.headline, locale);
    const bio = pickLocalizedText(p.bio, locale);
    const city = displayPlace(p.current_city, locale);
    return `${p.full_name} ${headline} ${bio} ${city}`.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <AppPageTemplate kicker={copy.kicker} title={copy.title} subtitle={copy.subtitle}>
      <label className="block text-sm font-medium mb-2" htmlFor="global-search">
        {copy.search}
      </label>
      <input
        id="global-search"
        className="w-full min-h-11 px-4 py-2.5 bg-card border border-border rounded-lg mb-6"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <p className="text-base text-muted-foreground mb-6 max-w-[40rem]">{copy.privacy}</p>
      {off && <p>{copy.off}</p>}
      {!off && filtered.length === 0 && <p className="text-muted-foreground">{copy.empty}</p>}
      {!off && filtered.length > 0 && (
        <AppIndexList>
          {filtered.map((profile) => {
            const headline = pickLocalizedText(profile.headline, locale);
            const city = displayPlace(profile.current_city, locale);
            return (
              <AppPersonRow
                key={profile.id}
                name={profile.full_name}
                headline={[headline, city].filter(Boolean).join(' · ')}
                status={profile.availability_status}
              />
            );
          })}
        </AppIndexList>
      )}
    </AppPageTemplate>
  );
}
