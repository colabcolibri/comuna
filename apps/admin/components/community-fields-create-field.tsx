'use client';

import { FormEvent, useState } from 'react';
import { Button, Checkbox, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, toast } from '@community/ui';
import { OpsCheckboxFrame, OpsIconButton, OpsSheet } from '@community/ui-admin';
import { Plus } from 'lucide-react';
import { fieldCanFilter, fieldNeedsOptions, type CatalogCopy } from './community-fields-types';
import { CommunityFieldsOptionsEditor, emptyOptionRow, type OptionRow } from './community-fields-options';

export function CommunityFieldsCreateField({
  communityId,
  groupId,
  copy,
  onCreated,
}: {
  communityId: string;
  groupId: string;
  copy: CatalogCopy;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('boolean');
  const [labelPt, setLabelPt] = useState('');
  const [labelEn, setLabelEn] = useState('');
  const [descriptionPt, setDescriptionPt] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [options, setOptions] = useState<OptionRow[]>([emptyOptionRow()]);
  const [filterable, setFilterable] = useState(true);
  const [required, setRequired] = useState(false);
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
    setFilterable(true);
    setRequired(false);
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
        filterable,
        required,
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
        <OpsIconButton label={copy.add}>
          <Plus />
        </OpsIconButton>
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
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <div className="min-w-0 space-y-2">
            <Label htmlFor={`${idPrefix}-pt`}>{copy.labelPt}</Label>
            <Input id={`${idPrefix}-pt`} value={labelPt} onChange={(ev) => setLabelPt(ev.target.value)} required />
          </div>
          <div className="min-w-0 space-y-2">
            <Label htmlFor={`${idPrefix}-en`}>{copy.labelEn}</Label>
            <Input id={`${idPrefix}-en`} value={labelEn} onChange={(ev) => setLabelEn(ev.target.value)} />
          </div>
        </div>
        <div className="grid min-w-0 gap-4">
          <div className="min-w-0 space-y-2">
            <Label htmlFor={`${idPrefix}-desc-pt`}>{copy.descriptionPt}</Label>
            <Textarea
              id={`${idPrefix}-desc-pt`}
              value={descriptionPt}
              onChange={(ev) => setDescriptionPt(ev.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">{copy.descriptionHelp}</p>
          </div>
          <div className="min-w-0 space-y-2">
            <Label htmlFor={`${idPrefix}-desc-en`}>{copy.descriptionEn}</Label>
            <Textarea id={`${idPrefix}-desc-en`} value={descriptionEn} onChange={(ev) => setDescriptionEn(ev.target.value)} />
          </div>
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
                <SelectItem value="localized_text">{copy.typeLocalized}</SelectItem>
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
          {fieldCanFilter(type) ? (
            <div className="min-w-0 space-y-2">
              <Label htmlFor={`${idPrefix}-filter`}>{copy.filterable}</Label>
              <OpsCheckboxFrame htmlFor={`${idPrefix}-filter`}>
                <Checkbox
                  id={`${idPrefix}-filter`}
                  checked={filterable}
                  onCheckedChange={(checked) => setFilterable(checked === true)}
                />
              </OpsCheckboxFrame>
            </div>
          ) : null}
          <div className="min-w-0 space-y-2">
            <Label htmlFor={`${idPrefix}-required`}>{copy.requirement}</Label>
            <OpsCheckboxFrame htmlFor={`${idPrefix}-required`}>
              <Checkbox
                id={`${idPrefix}-required`}
                checked={required}
                onCheckedChange={(checked) => setRequired(checked === true)}
              />
            </OpsCheckboxFrame>
          </div>
        </div>
        {fieldNeedsOptions(type) ? (
          <CommunityFieldsOptionsEditor idPrefix={`${idPrefix}-opt`} rows={options} onChange={setOptions} copy={copy} />
        ) : null}
      </form>
    </OpsSheet>
  );
}
