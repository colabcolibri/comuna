'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Checkbox, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, toast } from '@community/ui';
import { OpsSection } from '@community/ui-admin';
import { COMMUNITY_TYPES, type CommunitySettings as CommunitySettingsValue } from '@community/communities/types';
import { contentFromCatalog, pickContent } from '@community/identity';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  title: 'community.settings',
  help: 'community.settings_help',
  name: 'communities.name',
  slug: 'communities.slug',
  type: 'community.type',
  description: 'community.description',
  locale: 'community.default_locale',
  localePt: 'locale.pt',
  localeEn: 'locale.en',
  typeAlumni: 'community.type_alumni',
  typePractice: 'community.type_practice',
  typeIncubator: 'community.type_incubator',
  typeMentor: 'community.type_mentor',
  save: 'community.save',
  saved: 'community.saved',
  error: 'community.save_error',
  publicShowcase: 'community.public_showcase',
});

export function CommunitySettings({
  communityId,
  name,
  slug,
  type,
  isPublicShowcase,
  settings,
}: {
  communityId: string;
  name: string;
  slug: string;
  type: string;
  isPublicShowcase: boolean;
  settings: CommunitySettingsValue;
}) {
  const copy = pickContent(CONTENT, useLocale());
  const router = useRouter();
  const [nameValue, setNameValue] = useState(name);
  const [typeValue, setTypeValue] = useState(
    COMMUNITY_TYPES.includes(type as (typeof COMMUNITY_TYPES)[number]) ? type : 'alumni'
  );
  const [description, setDescription] = useState(settings.description);
  const [defaultLocale, setDefaultLocale] = useState(settings.default_locale);
  const [publicShowcase, setPublicShowcase] = useState(isPublicShowcase);
  const [busy, setBusy] = useState(false);
  const typeLabels: Record<string, string> = {
    alumni: copy.typeAlumni,
    practice_community: copy.typePractice,
    incubator: copy.typeIncubator,
    mentor_network: copy.typeMentor,
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await fetch(`/api/admin/communities/${communityId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: nameValue,
        type: typeValue,
        is_public_showcase: publicShowcase,
        settings: { description, default_locale: defaultLocale },
      }),
    });
    setBusy(false);
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    toast.success(copy.saved);
    router.refresh();
  };

  return (
    <OpsSection title={copy.title} description={copy.help}>
      <form onSubmit={(ev) => void save(ev)} className="grid max-w-lg gap-4">
        <div className="space-y-2">
          <Label htmlFor="ops-community-name">{copy.name}</Label>
          <Input id="ops-community-name" value={nameValue} onChange={(ev) => setNameValue(ev.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ops-community-slug">{copy.slug}</Label>
          <Input id="ops-community-slug" className="font-mono" value={slug} readOnly />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ops-community-type">{copy.type}</Label>
          <Select value={typeValue} onValueChange={setTypeValue}>
            <SelectTrigger id="ops-community-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMMUNITY_TYPES.map((item) => (
                <SelectItem key={item} value={item}>
                  {typeLabels[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ops-community-description">{copy.description}</Label>
          <Textarea
            id="ops-community-description"
            value={description}
            onChange={(ev) => setDescription(ev.target.value)}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ops-community-locale">{copy.locale}</Label>
          <Select value={defaultLocale} onValueChange={(next) => setDefaultLocale(next === 'en' ? 'en' : 'pt-BR')}>
            <SelectTrigger id="ops-community-locale">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pt-BR">{copy.localePt}</SelectItem>
              <SelectItem value="en">{copy.localeEn}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <Checkbox checked={publicShowcase} onCheckedChange={(checked) => setPublicShowcase(checked === true)} />
          {copy.publicShowcase}
        </label>
        <Button type="submit" disabled={busy}>
          {copy.save}
        </Button>
      </form>
    </OpsSection>
  );
}
