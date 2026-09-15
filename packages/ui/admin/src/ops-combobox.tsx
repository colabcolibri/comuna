'use client';

import { useId, useState, type KeyboardEvent } from 'react';
import { Input } from '@community/ui';

export type OpsComboboxOption = {
  id: string;
  label: string;
  detail?: string;
};

export function OpsCombobox({
  id,
  query,
  onQueryChange,
  options,
  selectedId,
  onSelect,
  placeholder,
  empty,
  hint,
  disabled,
  minChars = 2,
}: {
  id?: string;
  query: string;
  onQueryChange: (value: string) => void;
  options: OpsComboboxOption[];
  selectedId: string;
  onSelect: (option: OpsComboboxOption) => void;
  placeholder: string;
  empty: string;
  hint?: string;
  disabled?: boolean;
  minChars?: number;
}) {
  const autoId = useId();
  const inputId = id || autoId;
  const listId = `${inputId}-list`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const showList = open && query.trim().length >= minChars;

  const pick = (option: OpsComboboxOption) => {
    onSelect(option);
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showList || options.length === 0) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((index) => (index + 1) % options.length);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => (index - 1 + options.length) % options.length);
      return;
    }
    if (event.key === 'Enter' && options[active]) {
      event.preventDefault();
      pick(options[active]);
      return;
    }
    if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="relative min-w-0">
      <Input
        id={inputId}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && options[active] ? `${listId}-${options[active].id}` : undefined}
        autoComplete="off"
        placeholder={placeholder}
        value={query}
        disabled={disabled}
        onChange={(event) => {
          onQueryChange(event.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 120);
        }}
      />
      {hint && !showList ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
      {showList ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-card py-1 shadow-md"
        >
          {options.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">{empty}</li>
          ) : (
            options.map((option, index) => (
              <li key={option.id} role="presentation">
                <button
                  id={`${listId}-${option.id}`}
                  type="button"
                  role="option"
                  aria-selected={option.id === selectedId || index === active}
                  className={`flex w-full min-w-0 flex-col items-start px-3 py-2 text-left text-sm ${
                    index === active ? 'bg-secondary' : ''
                  }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => pick(option)}
                >
                  <span className="font-medium wrap-break-word">{option.label}</span>
                  {option.detail ? (
                    <span className="text-xs text-muted-foreground wrap-break-word">{option.detail}</span>
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
