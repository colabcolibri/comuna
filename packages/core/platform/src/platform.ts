import { query } from '@community/db';

export type PlatformSettings = {
  product_name: string;
  from_name: string;
  from_address: string;
  support_url: string;
  logo_url: string;
};

export class PlatformValidationError extends Error {
  constructor() {
    super('VALIDATION_ERROR');
    this.name = 'PlatformValidationError';
  }
}

const DEFAULTS: PlatformSettings = {
  product_name: 'Community',
  from_name: 'Community',
  from_address: '',
  support_url: '',
  logo_url: '',
};

function isValidFromAddress(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());
}

function parseLogoUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:')) {
    throw new PlatformValidationError();
  }
  if (trimmed.startsWith('/') || trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }
  throw new PlatformValidationError();
}

export function parsePlatformInput(input: {
  product_name?: unknown;
  from_name?: unknown;
  from_address?: unknown;
  support_url?: unknown;
  logo_url?: unknown;
}): PlatformSettings {
  const product_name = String(input.product_name ?? '').trim();
  const from_name = String(input.from_name ?? '').trim();
  const from_address = String(input.from_address ?? '').trim().toLowerCase();
  const support_url = String(input.support_url ?? '').trim();
  const logo_url = parseLogoUrl(String(input.logo_url ?? ''));
  if (!product_name || !from_name) {
    throw new PlatformValidationError();
  }
  if (!isValidFromAddress(from_address)) {
    throw new PlatformValidationError();
  }
  if (support_url) {
    const lower = support_url.toLowerCase();
    if (lower.startsWith('javascript:')) {
      throw new PlatformValidationError();
    }
    if (!support_url.startsWith('https://') && !support_url.startsWith('http://') && !support_url.startsWith('/')) {
      throw new PlatformValidationError();
    }
  }
  return { product_name, from_name, from_address, support_url, logo_url };
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const result = await query<PlatformSettings>(
    `SELECT product_name, from_name, from_address, support_url, logo_url
     FROM ops_core.platform_settings
     ORDER BY updated_at
     LIMIT 1`
  );
  return result.rows[0] ?? DEFAULTS;
}

export async function updatePlatformSettings(input: {
  product_name?: unknown;
  from_name?: unknown;
  from_address?: unknown;
  support_url?: unknown;
  logo_url?: unknown;
}): Promise<PlatformSettings> {
  const next = parsePlatformInput(input);
  const updated = await query<PlatformSettings>(
    `UPDATE ops_core.platform_settings
     SET product_name = $1,
         from_name = $2,
         from_address = $3,
         support_url = $4,
         logo_url = $5,
         updated_at = now()
     WHERE id = (SELECT id FROM ops_core.platform_settings ORDER BY updated_at LIMIT 1)
     RETURNING product_name, from_name, from_address, support_url, logo_url`,
    [next.product_name, next.from_name, next.from_address, next.support_url, next.logo_url]
  );
  if (updated.rows[0]) {
    return updated.rows[0];
  }
  const inserted = await query<PlatformSettings>(
    `INSERT INTO ops_core.platform_settings (product_name, from_name, from_address, support_url, logo_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING product_name, from_name, from_address, support_url, logo_url`,
    [next.product_name, next.from_name, next.from_address, next.support_url, next.logo_url]
  );
  return inserted.rows[0];
}

export function resolveFromAddress(settings: PlatformSettings, envFrom?: string): string {
  if (settings.from_address) {
    return settings.from_address;
  }
  return (envFrom || '').trim() || 'auth@community.local';
}

export function formatFromHeader(settings: PlatformSettings, envFrom?: string): string {
  const address = resolveFromAddress(settings, envFrom);
  const name = settings.from_name.replace(/["\r\n]/g, '');
  return `"${name}" <${address}>`;
}
