import type { LocalizedText } from '@community/identity';

export type OpsField = {
  id: string;
  name: string;
  type: string;
  storage: string;
  locked: boolean;
  filterable: boolean;
  label: LocalizedText;
};

export type OpsGroup = {
  id: string;
  slug: string;
  columns: number;
  locked: boolean;
  label: LocalizedText;
  fields: OpsField[];
};

export type CatalogCopy = {
  empty: string;
  add: string;
  addGroup: string;
  name: string;
  type: string;
  group: string;
  labelPt: string;
  labelEn: string;
  options: string;
  optionsHelp: string;
  filterable: string;
  create: string;
  createGroup: string;
  locked: string;
  delete: string;
  error: string;
  duplicate: string;
  groupNotEmpty: string;
  typeText: string;
  typeTextarea: string;
  typeBoolean: string;
  typeSelect: string;
  typeUrl: string;
  moveUp: string;
  moveDown: string;
  order: string;
  columns: string;
};

export const CATALOG_SELECT_CLASS = 'h-9 w-full max-w-full rounded-md border border-input bg-background px-3 text-sm';
