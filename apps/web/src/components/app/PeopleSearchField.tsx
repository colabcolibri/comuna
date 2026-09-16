'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Button, Input, cn } from '@community/ui';

type PeopleSearchFieldProps = {
  id: string;
  label: string;
  hint: string;
  applyLabel: string;
  clearLabel: string;
  committed: string;
  onApply: (term: string) => void;
  onClear: () => void;
  icon?: boolean;
  inputClassName?: string;
};

export function PeopleSearchField({
  id,
  label,
  hint,
  applyLabel,
  clearLabel,
  committed,
  onApply,
  onClear,
  icon = false,
  inputClassName,
}: PeopleSearchFieldProps) {
  const [draft, setDraft] = useState(committed);

  useEffect(() => {
    setDraft(committed);
  }, [committed]);

  function submit() {
    const term = draft.trim();
    if (term === committed.trim()) {
      return;
    }
    onApply(term);
  }

  function clear() {
    setDraft('');
    if (committed) {
      onClear();
    }
  }

  const dirty = draft.trim() !== committed.trim();
  const canClear = Boolean(draft || committed);

  return (
    <form
      className="min-w-0 flex-1"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <label className="mb-2 block text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          {icon ? (
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          ) : null}
          <Input
            id={id}
            className={cn(icon ? 'h-12 min-h-12 pl-10' : 'min-h-11', 'w-full text-base md:text-base', inputClassName)}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={hint}
          />
        </div>
        <div className="flex shrink-0 gap-2">
          <Button type="submit" className="min-h-11 flex-1 sm:flex-none" disabled={!dirty}>
            {applyLabel}
          </Button>
          {canClear ? (
            <Button type="button" variant="outline" className="min-h-11 flex-1 sm:flex-none" onClick={clear}>
              {clearLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </form>
  );
}
