'use client';

import React, { useEffect, useState } from 'react';
import { AppCardTemplate } from '@/components/templates/AppCardTemplate';
import { AppAlertTemplate } from '@/components/templates/AppAlertTemplate';
import { AppPageTemplate } from '@community/ui-member';
import { Button, Checkbox, Input, Label, Textarea } from '@community/ui';
import { contentFromCatalog, mergeContent, pickContent } from '@community/identity';
import {
  localizedPair,
  parseContacts,
  parseLanguages,
  valueAt,
} from '@community/identity';
import { parsePlace, type GeoPlace } from '@community/places';
import { useLocale } from '@/components/app/LocaleProvider';
import { CitySearchField } from '@/components/app/CitySearchField';
import { uiCatalog } from '@/lang/catalog';

const AVAILABILITY = ['available_for_hire', 'project_partner', 'mentor', 'unavailable'] as const;
const LANGUAGE_CODES = ['pt', 'en', 'es', 'fr'] as const;

const CONTENT = mergeContent(
  contentFromCatalog(uiCatalog, 'core_identity', {
    kicker: 'profile.kicker',
    title: 'profile.title',
    subtitle: 'profile.subtitle',
    save: 'profile.save',
    saved: 'profile.saved',
    error: 'profile.error',
    identity: 'profile.identity',
    name: 'profile.name',
    avatar: 'profile.avatar',
    person: 'profile.person',
    gender: 'profile.gender',
    genderWoman: 'profile.gender_woman',
    genderMan: 'profile.gender_man',
    genderNb: 'profile.gender_nb',
    genderSkip: 'profile.gender_skip',
    genderUnset: 'profile.gender_unset',
    birthCity: 'profile.birth_city',
    currentCity: 'profile.current_city',
    languages: 'profile.languages',
    contacts: 'profile.contacts',
    linkedin: 'profile.linkedin',
    github: 'profile.github',
    portfolio: 'profile.portfolio',
  }),
  contentFromCatalog(uiCatalog, 'plugin_directory', {
    directory: 'card.section',
    headline: 'card.headline',
    bio: 'card.bio',
    availability: 'card.availability',
    showcase: 'card.showcase',
    hire: 'card.hire',
    partner: 'card.partner',
    mentor: 'card.mentor',
    unavailable: 'card.unavailable',
    proficiency: 'card.proficiency',
  })
);

function LocalizedPairFields({
  id,
  label,
  pt,
  en,
  onPt,
  onEn,
  multiline,
}: {
  id: string;
  label: string;
  pt: string;
  en: string;
  onPt: (value: string) => void;
  onEn: (value: string) => void;
  multiline?: boolean;
}) {
  const Field = multiline ? Textarea : Input;
  const extra = multiline ? { rows: 4 as const } : {};
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2 min-w-0">
        <Label htmlFor={`${id}-pt`}>{label} (pt-BR)</Label>
        <Field id={`${id}-pt`} value={pt} onChange={(e) => onPt(e.target.value)} {...extra} />
      </div>
      <div className="space-y-2 min-w-0">
        <Label htmlFor={`${id}-en`}>{label} (en)</Label>
        <Field id={`${id}-en`} value={en} onChange={(e) => onEn(e.target.value)} {...extra} />
      </div>
    </div>
  );
}

export default function ProfileEditPage() {
  const locale = useLocale();
  const copy = pickContent(CONTENT, locale);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [gender, setGender] = useState('');
  const [birthCity, setBirthCity] = useState<GeoPlace | null>(null);
  const [currentCity, setCurrentCity] = useState<GeoPlace | null>(null);
  const [languageCodes, setLanguageCodes] = useState<string[]>(['pt']);
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [headlinePt, setHeadlinePt] = useState('');
  const [headlineEn, setHeadlineEn] = useState('');
  const [bioPt, setBioPt] = useState('');
  const [bioEn, setBioEn] = useState('');
  const [availability, setAvailability] = useState<(typeof AVAILABILITY)[number]>('available_for_hire');
  const [publicShowcase, setPublicShowcase] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetch('/api/profiles/me'), fetch('/api/memberships/me')])
      .then(async ([profileRes, membershipRes]) => {
        const profileJson = await profileRes.json();
        const membershipJson = await membershipRes.json();
        if (profileJson.profile) {
          const profile = profileJson.profile;
          setFullName(profile.full_name || '');
          setAvatarUrl(profile.avatar_url || '');
          setGender(profile.gender || '');
          setBirthCity(parsePlace(profile.birth_city));
          setCurrentCity(parsePlace(profile.current_city));
          const spoken = parseLanguages(profile.languages);
          setLanguageCodes(spoken.length ? spoken.map((item) => item.code) : ['pt']);
          const contacts = parseContacts(profile.contacts);
          setLinkedin(contacts.linkedin);
          setGithub(contacts.github);
          setPortfolio(contacts.portfolio);
        }
        if (membershipJson.card) {
          setHeadlinePt(valueAt(membershipJson.card.headline, 'pt-BR'));
          setHeadlineEn(valueAt(membershipJson.card.headline, 'en'));
          setBioPt(valueAt(membershipJson.card.bio, 'pt-BR'));
          setBioEn(valueAt(membershipJson.card.bio, 'en'));
          const status = membershipJson.card.availability_status;
          if ((AVAILABILITY as readonly string[]).includes(status)) {
            setAvailability(status);
          }
          setPublicShowcase(Boolean(membershipJson.card.public_showcase));
        }
      })
      .catch(() => setError(copy.error));
  }, [copy.error]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const profileRes = await fetch('/api/profiles/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fullName,
        avatar_url: avatarUrl || null,
        preferred_locale: locale,
        gender: gender || null,
        birth_city: birthCity,
        current_city: currentCity,
        languages: languageCodes.map((code) => ({
          code,
          proficiency: code === 'pt' ? 'native' : 'fluent',
        })),
        contacts: { linkedin, github, portfolio },
      }),
    });
    if (!profileRes.ok) {
      const data = await profileRes.json();
      setError(data.error?.message || copy.error);
      return;
    }
    const cardRes = await fetch('/api/memberships/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        headline: localizedPair(headlinePt, headlineEn),
        bio: localizedPair(bioPt, bioEn),
        availability_status: availability,
        public_showcase: publicShowcase,
      }),
    });
    if (!cardRes.ok) {
      const data = await cardRes.json();
      setError(data.error?.message || copy.error);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AppPageTemplate kicker={copy.kicker} title={copy.title} subtitle={copy.subtitle}>
      {saved && <AppAlertTemplate variant="success" title={copy.saved} message={copy.saved} />}
      {error && <AppAlertTemplate variant="destructive" title={copy.error} message={error} />}
      <form onSubmit={handleSave} className="space-y-6">
        <AppCardTemplate
          title={copy.identity}
          content={
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">{copy.name}</Label>
                <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar_url">{copy.avatar}</Label>
                <Input id="avatar_url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
              </div>
            </div>
          }
        />
        <AppCardTemplate
          title={copy.person}
          content={
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gender">{copy.gender}</Label>
                <select
                  id="gender"
                  className="w-full min-h-11 px-3 bg-surface border border-border rounded-lg"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">{copy.genderUnset}</option>
                  <option value="woman">{copy.genderWoman}</option>
                  <option value="man">{copy.genderMan}</option>
                  <option value="non_binary">{copy.genderNb}</option>
                  <option value="prefer_not">{copy.genderSkip}</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CitySearchField id="birth_city" label={copy.birthCity} value={birthCity} onChange={setBirthCity} />
                <CitySearchField id="current_city" label={copy.currentCity} value={currentCity} onChange={setCurrentCity} />
              </div>
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">{copy.languages}</legend>
                <div className="flex flex-wrap gap-4">
                  {LANGUAGE_CODES.map((code) => (
                    <label key={code} className="flex items-center gap-2 min-h-11 text-sm">
                      <Checkbox
                        checked={languageCodes.includes(code)}
                        onChange={(e) => {
                          setLanguageCodes((current) =>
                            e.target.checked ? [...current, code] : current.filter((item) => item !== code)
                          );
                        }}
                      />
                      {code}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="linkedin">{copy.linkedin}</Label>
                  <Input id="linkedin" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
                </div>
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="github">{copy.github}</Label>
                  <Input id="github" value={github} onChange={(e) => setGithub(e.target.value)} />
                </div>
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="portfolio">{copy.portfolio}</Label>
                  <Input id="portfolio" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} />
                </div>
              </div>
            </div>
          }
        />
        <AppCardTemplate
          title={copy.directory}
          content={
            <div className="space-y-4">
              <LocalizedPairFields
                id="headline"
                label={copy.headline}
                pt={headlinePt}
                en={headlineEn}
                onPt={setHeadlinePt}
                onEn={setHeadlineEn}
              />
              <LocalizedPairFields
                id="bio"
                label={copy.bio}
                pt={bioPt}
                en={bioEn}
                onPt={setBioPt}
                onEn={setBioEn}
                multiline
              />
              <div className="space-y-2">
                <Label htmlFor="availability">{copy.availability}</Label>
                <select
                  id="availability"
                  className="w-full min-h-11 px-3 bg-surface border border-border rounded-lg"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as (typeof AVAILABILITY)[number])}
                >
                  <option value="available_for_hire">{copy.hire}</option>
                  <option value="project_partner">{copy.partner}</option>
                  <option value="mentor">{copy.mentor}</option>
                  <option value="unavailable">{copy.unavailable}</option>
                </select>
              </div>
              <label className="flex items-center gap-3 min-h-11 text-sm">
                <Checkbox
                  id="public_showcase"
                  checked={publicShowcase}
                  onChange={(e) => setPublicShowcase(e.target.checked)}
                />
                {copy.showcase}
              </label>
            </div>
          }
          footer={
            <div className="w-full flex justify-end">
              <Button type="submit">{copy.save}</Button>
            </div>
          }
        />
      </form>
    </AppPageTemplate>
  );
}
