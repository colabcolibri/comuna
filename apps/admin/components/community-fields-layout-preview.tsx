'use client';

import { useState } from 'react';
import { pickLocalizedText } from '@community/identity';
import { cn } from '@community/ui';
import { Columns2 } from 'lucide-react';
import { OpsDialog, OpsDialogBody, OpsDialogHeader, OpsIconButton } from '@community/ui-admin';
import { catalogColumns, clampFieldSpan, type OpsField } from './community-fields-types';

export function CommunityFieldsLayoutPreview({
  slug,
  columns,
  fields,
  locale,
  label,
  help,
  requiredLabel,
  optionalLabel,
}: {
  slug: string;
  columns: number;
  fields: OpsField[];
  locale: string | undefined;
  label: string;
  help: string;
  requiredLabel: string;
  optionalLabel: string;
}) {
  const [open, setOpen] = useState(false);
  if (fields.length === 0) {
    return null;
  }
  const cols = catalogColumns(columns);
  const photos = slug === 'identity' ? fields.filter((field) => field.type === 'image') : [];
  const rest = slug === 'identity' ? fields.filter((field) => field.type !== 'image') : fields;

  return (
    <>
      <OpsIconButton label={label} onClick={() => setOpen(true)}>
        <Columns2 />
      </OpsIconButton>
      <OpsDialog open={open} onClose={() => setOpen(false)} size="xl">
        <OpsDialogHeader title={label} description={help} />
        <OpsDialogBody>
          <div className="overflow-x-auto">
            <div className="min-w-xl">
              {photos.length ? (
                <div className="flex min-w-0 flex-row items-center gap-6">
                  {photos.map((field) => (
                    <PreviewCell
                      key={field.id}
                      field={field}
                      locale={locale}
                      requiredLabel={requiredLabel}
                      optionalLabel={optionalLabel}
                      className="w-28 shrink-0 sm:w-32"
                    />
                  ))}
                  <div className="min-w-0 flex-1 space-y-4">
                    {rest.map((field) => (
                      <PreviewCell
                        key={field.id}
                        field={field}
                        locale={locale}
                        requiredLabel={requiredLabel}
                        optionalLabel={optionalLabel}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  className="grid gap-4"
                  style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                >
                  {rest.map((field) => (
                    <PreviewCell
                      key={field.id}
                      field={field}
                      locale={locale}
                      requiredLabel={requiredLabel}
                      optionalLabel={optionalLabel}
                      className="min-w-0"
                      style={{ gridColumn: `span ${clampFieldSpan(field.span, cols)}` }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </OpsDialogBody>
      </OpsDialog>
    </>
  );
}

function PreviewCell({
  field,
  locale,
  requiredLabel,
  optionalLabel,
  className,
  style,
}: {
  field: OpsField;
  locale: string | undefined;
  requiredLabel: string;
  optionalLabel: string;
  className?: string;
  style?: { gridColumn: string };
}) {
  const name = pickLocalizedText(field.label, locale) || field.name;
  const status = field.required ? requiredLabel : optionalLabel;
  return (
    <div className={cn(className, field.enabled ? undefined : 'opacity-50')} style={style}>
      {field.type === 'image' ? (
        <div className="flex flex-col items-center gap-2">
          <span className="flex w-full min-w-0 items-baseline gap-2">
            <span className="truncate text-sm font-medium">{name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{status}</span>
          </span>
          <span
            aria-hidden
            className="block size-28 rounded-full border border-border bg-primary text-primary-foreground sm:size-32"
          />
        </div>
      ) : (
        <div className="space-y-1.5 min-w-0">
          <span className="flex min-w-0 items-baseline gap-2">
            <span className="truncate text-sm font-medium">{name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{status}</span>
          </span>
          <FakeControl type={field.type} name={field.name} />
        </div>
      )}
    </div>
  );
}

function FakeControl({ type, name }: { type: string; name: string }) {
  if (type === 'boolean') {
    return (
      <span aria-hidden className="flex min-h-11 items-center gap-3">
        <span className="size-4 rounded-sm border border-input" />
        <span className="h-2 w-24 rounded-sm bg-muted" />
      </span>
    );
  }
  if (type === 'checkbox') {
    return (
      <span aria-hidden className="flex min-h-11 flex-wrap gap-2">
        <span className="h-8 w-20 rounded-lg border border-border" />
        <span className="h-8 w-16 rounded-lg border border-dashed border-border" />
      </span>
    );
  }
  if (type === 'textarea') {
    return <span aria-hidden className="block min-h-24 w-full rounded-md border border-input bg-background" />;
  }
  if (type === 'localized_text') {
    const box = name === 'bio' ? 'min-h-24' : 'h-11';
    return (
      <span aria-hidden className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <span className="min-w-0 space-y-1">
          <span className="block text-xs text-muted-foreground">pt-BR</span>
          <span className={cn('block w-full rounded-md border border-input bg-background', box)} />
        </span>
        <span className="min-w-0 space-y-1">
          <span className="block text-xs text-muted-foreground">en</span>
          <span className={cn('block w-full rounded-md border border-input bg-background', box)} />
        </span>
      </span>
    );
  }
  if (type === 'select' || type === 'radio' || type === 'city') {
    return (
      <span
        aria-hidden
        className="flex h-11 w-full items-center justify-end rounded-md border border-input bg-background px-3"
      >
        <span className="size-2 rotate-45 border-r border-b border-muted-foreground" />
      </span>
    );
  }
  return <span aria-hidden className="block h-11 w-full rounded-md border border-input bg-background" />;
}
