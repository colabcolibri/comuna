import type { LocalizedText } from '@community/identity';

export type OpsField = {
  id: string;
  name: string;
  type: string;
  storage: string;
  locked: boolean;
  filterable: boolean;
  span: 1 | 2 | 3;
  optionsText: string;
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
  edit: string;
  save: string;
  error: string;
  duplicate: string;
  groupNotEmpty: string;
  typeText: string;
  typeTextarea: string;
  typeBoolean: string;
  typeSelect: string;
  typeUrl: string;
  typeCity: string;
  typeLocalized: string;
  typeRadio: string;
  typeCheckbox: string;
  moveUp: string;
  moveDown: string;
  columns: string;
  columnsHelp: string;
  columns1: string;
  columns2: string;
  columns3: string;
  span: string;
};

export function fieldNeedsOptions(type: string): boolean {
  return type === 'select' || type === 'radio' || type === 'checkbox';
}

export function fieldCanFilter(type: string): boolean {
  return type === 'boolean' || fieldNeedsOptions(type);
}
