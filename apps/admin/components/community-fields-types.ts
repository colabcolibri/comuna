import type { LocalizedText } from '@community/identity';

export type OpsField = {
  id: string;
  name: string;
  type: string;
  storage: string;
  locked: boolean;
  span: 1 | 2 | 3;
  required: boolean;
  enabled: boolean;
  options: { value: string; labelPt: string; labelEn: string }[];
  optionsText: string;
  label: LocalizedText;
  description: LocalizedText;
};

export type OpsGroup = {
  id: string;
  slug: string;
  columns: number;
  locked: boolean;
  enabled: boolean;
  label: LocalizedText;
  fields: OpsField[];
};

export type CatalogCopy = {
  empty: string;
  pageEmpty: string;
  add: string;
  addGroup: string;
  name: string;
  nameHelp: string;
  type: string;
  group: string;
  labelPt: string;
  labelEn: string;
  descriptionPt: string;
  descriptionEn: string;
  descriptionHelp: string;
  options: string;
  optionsHelp: string;
  optionValue: string;
  optionAdd: string;
  optionRemove: string;
  create: string;
  createGroup: string;
  locked: string;
  lockedHint: string;
  saved: string;
  rename: string;
  cancel: string;
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
  typeImage: string;
  moveUp: string;
  moveDown: string;
  columns: string;
  columnsHelp: string;
  columns1: string;
  columns2: string;
  columns3: string;
  span: string;
  spanHelp: string;
  layoutPreview: string;
  layoutPreviewHelp: string;
  requirement: string;
  required: string;
  optional: string;
  deactivate: string;
  activate: string;
  inactive: string;
  deleteTitle: string;
  deleteBody: string;
  groupDeleteTitle: string;
  groupDeleteBody: string;
  groupLabel: string;
  moveGroup: string;
  moveGroupHelp: string;
  moveGroupConfirm: string;
  resetOrder: string;
  resetOrderTitle: string;
  resetOrderBody: string;
  resetOrderOk: string;
};

export function fieldNeedsOptions(type: string): boolean {
  return type === 'select' || type === 'radio' || type === 'checkbox';
}

export function catalogColumns(columns: number): 1 | 2 | 3 {
  if (columns === 2 || columns === 3) {
    return columns;
  }
  return 1;
}

export function fieldSpanChoices(columns: number): Array<1 | 2 | 3> {
  const cols = catalogColumns(columns);
  if (cols === 1) {
    return [1];
  }
  if (cols === 2) {
    return [1, 2];
  }
  return [1, 2, 3];
}

export function clampFieldSpan(span: number, columns: number): 1 | 2 | 3 {
  const cols = catalogColumns(columns);
  const next = Math.min(Math.max(1, span), cols);
  return next === 2 || next === 3 ? next : 1;
}

export function fieldTypeLabel(type: string, copy: CatalogCopy): string {
  switch (type) {
    case 'text':
      return copy.typeText;
    case 'textarea':
      return copy.typeTextarea;
    case 'boolean':
      return copy.typeBoolean;
    case 'select':
      return copy.typeSelect;
    case 'url':
      return copy.typeUrl;
    case 'city':
      return copy.typeCity;
    case 'localized_text':
      return copy.typeLocalized;
    case 'radio':
      return copy.typeRadio;
    case 'checkbox':
      return copy.typeCheckbox;
    case 'image':
      return copy.typeImage;
    default:
      return type;
  }
}
