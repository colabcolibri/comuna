'use client';

import { FormEvent, useState } from 'react';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, toast } from '@community/ui';
import { OpsSheet } from '@community/ui-admin';
import { fieldNeedsOptions, type CatalogCopy } from './community-fields-types';
import { CommunityFieldsOptionsEditor, emptyOptionRow, type OptionRow } from './community-fields-options';

export function CommunityFieldsCreateField({
  communityId,
  groupId,
  locale,
  copy,
  onCreated,
}: {
  communityId: string;
  groupId: string;
  locale: string | undefined;
  copy: CatalogCopy;
  onCreated: () => void;
}) {
  const english = locale === 'en';
  const [open, setOpen] = useState(false);
  const [translate, setTranslate] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('boolean');
  const [labelPt, setLabelPt] = useState('');
  const [labelEn, setLabelEn] = useState('');
  const [descriptionPt, setDescriptionPt] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [options, setOptions] = useState<OptionRow[]>([emptyOptionRow()]);
  const [required, setRequired] = useState(false);
  const [localized, setLocalized] = useState(false);
  const [busy, setBusy] = useState(false);
  const idPrefix = `ops-new-field-${groupId}`;
  const formId = `${idPrefix}-form`;

  const reset = () => {
    setName('');
    setLabelPt('');
    setLabelEn('');
    setDescriptionPt('');
    setDescriptionEn('');
    setOptions([emptyOptionRow()]);
    setRequired(false);
    setLocalized(false);
    setTranslate(false);
  };

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await fetch(`/api/admin/communities/${communityId}/fields`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId,
        name,
        type,
        labelPt,
        labelEn,
        descriptionPt,
        descriptionEn,
        options,
        required,
        localized: type === 'text' || type === 'textarea' ? localized : false,
      }),
    });
    setBusy(false);
    if (res.status === 409) {
      toast.error(copy.duplicate);
      return;
    }
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    reset();
    setOpen(false);
    toast.success(copy.saved);
    onCreated();
  };

  return (
    <OpsSheet
      open={open}
      onOpenChange={setOpen}
      className="sm:max-w-lg"
      trigger={
        <Button type="button" variant="outline" size="sm">
          {copy.add}
        </Button>
      }
      title={copy.add}
      closeLabel={copy.cancel}
      footer={
        <Button type="submit" form={formId} disabled={busy}>
          {copy.create}
        </Button>
      }
    >
      <form id={formId} onSubmit={create} className="grid min-w-0 gap-6">
        <div className="grid min-w-0 gap-4">
          <div className="min-w-0 space-y-2">
            <Label htmlFor={`${idPrefix}-label`}>{english ? copy.labelEn : copy.labelPt}</Label>
            <Input
              id={`${idPrefix}-label`}
              value={english ? labelEn : labelPt}
              onChange={(ev) => (english ? setLabelEn(ev.target.value) : setLabelPt(ev.target.value))}
              required
            />
          </div>
          <div className="min-w-0 space-y-2">
            <Label htmlFor={`${idPrefix}-desc`}>{english ? copy.descriptionEn : copy.descriptionPt}</Label>
            <Textarea
              id={`${idPrefix}-desc`}
              value={english ? descriptionEn : descriptionPt}
              onChange={(ev) => (english ? setDescriptionEn(ev.target.value) : setDescriptionPt(ev.target.value))}
              required
            />
            <p className="text-xs text-muted-foreground">{copy.descriptionHelp}</p>
          </div>
          {translate ? (
            <>
              <div className="min-w-0 space-y-2">
                <Label htmlFor={`${idPrefix}-label-other`}>{english ? copy.labelPt : copy.labelEn}</Label>
                <Input
                  id={`${idPrefix}-label-other`}
                  value={english ? labelPt : labelEn}
                  onChange={(ev) => (english ? setLabelPt(ev.target.value) : setLabelEn(ev.target.value))}
                />
              </div>
              <div className="min-w-0 space-y-2">
                <Label htmlFor={`${idPrefix}-desc-other`}>{english ? copy.descriptionPt : copy.descriptionEn}</Label>
                <Textarea
                  id={`${idPrefix}-desc-other`}
                  value={english ? descriptionPt : descriptionEn}
                  onChange={(ev) => (english ? setDescriptionPt(ev.target.value) : setDescriptionEn(ev.target.value))}
                />
              </div>
            </>
          ) : (
            <Button type="button" variant="outline" onClick={() => setTranslate(true)}>
              {copy.translate}
            </Button>
          )}
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="min-w-0 space-y-2">
            <Label htmlFor={`${idPrefix}-type`}>{copy.type}</Label>
            <Select
              value={type}
              onValueChange={(next) => {
                setType(next);
                if (fieldNeedsOptions(next) && options.every((row) => !row.value.trim())) {
                  setOptions([emptyOptionRow()]);
                }
              }}
            >
              <SelectTrigger id={`${idPrefix}-type`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="boolean">{copy.typeBoolean}</SelectItem>
                <SelectItem value="select">{copy.typeSelect}</SelectItem>
                <SelectItem value="radio">{copy.typeRadio}</SelectItem>
                <SelectItem value="checkbox">{copy.typeCheckbox}</SelectItem>
                <SelectItem value="text">{copy.typeText}</SelectItem>
                <SelectItem value="textarea">{copy.typeTextarea}</SelectItem>
                <SelectItem value="url">{copy.typeUrl}</SelectItem>
                <SelectItem value="city">{copy.typeCity}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-0 space-y-2">
            <Label htmlFor={`${idPrefix}-name`}>{copy.name}</Label>
            <Input
              id={`${idPrefix}-name`}
              className="font-mono"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">{copy.nameHelp}</p>
          </div>
          <div className="min-w-0 space-y-2">
            <Label htmlFor={`${idPrefix}-required`}>{copy.requirement}</Label>
            <Select value={required ? 'yes' : 'no'} onValueChange={(next) => setRequired(next === 'yes')}>
              <SelectTrigger id={`${idPrefix}-required`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">{copy.no}</SelectItem>
                <SelectItem value="yes">{copy.yes}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {type === 'text' || type === 'textarea' ? (
            <div className="min-w-0 space-y-2">
              <Label htmlFor={`${idPrefix}-localized`}>{copy.localized}</Label>
              <Select value={localized ? 'yes' : 'no'} onValueChange={(next) => setLocalized(next === 'yes')}>
                <SelectTrigger id={`${idPrefix}-localized`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">{copy.no}</SelectItem>
                  <SelectItem value="yes">{copy.yes}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>
        {fieldNeedsOptions(type) ? (
          <CommunityFieldsOptionsEditor idPrefix={`${idPrefix}-opt`} rows={options} onChange={setOptions} copy={copy} />
        ) : null}
      </form>
    </OpsSheet>
  );
}
