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
  showcaseTitle: 'community.showcase_title',
  showcaseDescription: 'community.showcase_description',
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
  talentCeiling: 'community.talent_ceiling',
  translate: 'community.fields_translate',
});

export function CommunitySettings({
  communityId,
  name,
  slug,
  type,
  isPublicShowcase,
  settings,
  talentOn,
}: {
  communityId: string;
  name: string;
  slug: string;
  type: string;
  isPublicShowcase: boolean;
  settings: CommunitySettingsValue;
  talentOn: boolean;
}) {
  const locale = useLocale();
  const copy = pickContent(CONTENT, locale);
  const english = locale === 'en';
  const router = useRouter();
  const [namePt, setNamePt] = useState(name);
  const [nameEn, setNameEn] = useState(settings.name_en || '');
  const [typeValue, setTypeValue] = useState(
    COMMUNITY_TYPES.includes(type as (typeof COMMUNITY_TYPES)[number]) ? type : 'alumni'
  );
  const [description, setDescription] = useState(settings.description);
  const [showcaseTitle, setShowcaseTitle] = useState(settings.showcase_title);
  const [showcaseTitleEn, setShowcaseTitleEn] = useState(settings.showcase_title_en || '');
  const [showcaseDescription, setShowcaseDescription] = useState(settings.showcase_description);
  const [showcaseDescriptionEn, setShowcaseDescriptionEn] = useState(settings.showcase_description_en || '');
  const [translate, setTranslate] = useState(false);
  const [defaultLocale, setDefaultLocale] = useState(settings.default_locale);
  const [publicShowcase, setPublicShowcase] = useState(isPublicShowcase);
  const [talentExposure, setTalentExposure] = useState(settings.talent_exposure || 'internal');
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
        name: namePt.trim() || nameEn.trim(),
        type: typeValue,
        is_public_showcase: publicShowcase,
        settings: {
          description,
          name_en: nameEn,
          showcase_title: showcaseTitle,
          showcase_title_en: showcaseTitleEn,
          showcase_description: showcaseDescription,
          showcase_description_en: showcaseDescriptionEn,
          default_locale: defaultLocale,
          talent_exposure: talentExposure,
        },
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
          <Input
            id="ops-community-name"
            value={english ? nameEn : namePt}
            onChange={(ev) => (english ? setNameEn(ev.target.value) : setNamePt(ev.target.value))}
            required
          />
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
          <Label htmlFor="ops-showcase-title">{copy.showcaseTitle}</Label>
          <Input
            id="ops-showcase-title"
            value={english ? showcaseTitleEn : showcaseTitle}
            onChange={(ev) => (english ? setShowcaseTitleEn(ev.target.value) : setShowcaseTitle(ev.target.value))}
            maxLength={80}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ops-showcase-description">{copy.showcaseDescription}</Label>
          <Textarea
            id="ops-showcase-description"
            value={english ? showcaseDescriptionEn : showcaseDescription}
            onChange={(ev) => (english ? setShowcaseDescriptionEn(ev.target.value) : setShowcaseDescription(ev.target.value))}
            rows={4}
            maxLength={500}
          />
        </div>
        {translate ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="ops-community-name-other">{english ? copy.localePt : copy.localeEn}</Label>
              <Input
                id="ops-community-name-other"
                value={english ? namePt : nameEn}
                onChange={(ev) => (english ? setNamePt(ev.target.value) : setNameEn(ev.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ops-showcase-title-other">{copy.showcaseTitle}</Label>
              <Input
                id="ops-showcase-title-other"
                value={english ? showcaseTitle : showcaseTitleEn}
                onChange={(ev) => (english ? setShowcaseTitle(ev.target.value) : setShowcaseTitleEn(ev.target.value))}
                maxLength={80}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ops-showcase-description-other">{copy.showcaseDescription}</Label>
              <Textarea
                id="ops-showcase-description-other"
                value={english ? showcaseDescription : showcaseDescriptionEn}
                onChange={(ev) => (english ? setShowcaseDescription(ev.target.value) : setShowcaseDescriptionEn(ev.target.value))}
                rows={4}
                maxLength={500}
              />
            </div>
          </>
        ) : (
          <Button type="button" variant="outline" onClick={() => setTranslate(true)}>
            {copy.translate}
          </Button>
        )}
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
        {talentOn ? (
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-sm">{copy.talentCeiling}</span>
            {(['hidden', 'internal', 'external'] as const).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={talentExposure === item}
                title={item === 'hidden' ? 'Oculto' : item === 'internal' ? 'Interno' : 'Externo'}
                className={`inline-flex size-9 items-center justify-center rounded-md border text-sm ${talentExposure === item ? 'border-foreground' : 'border-input'}`}
                onClick={() => setTalentExposure(item)}
              >
                {item === 'hidden' ? '⊘' : item === 'internal' ? '👥' : '🌐'}
              </button>
            ))}
          </div>
        ) : null}
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
