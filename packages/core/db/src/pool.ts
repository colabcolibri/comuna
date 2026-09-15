import { Pool, QueryResult, QueryResultRow, type PoolConfig } from 'pg';
import { loadRootEnv } from './load-root-env';

let pool: Pool | null = null;

export function pgSsl(connectionString: string): PoolConfig['ssl'] {
  if (process.env.PGSSL === '0') {
    return undefined;
  }
  const wantsSsl =
    process.env.PGSSL === '1' ||
    Boolean(process.env.RAILWAY_ENVIRONMENT) ||
    /sslmode=(require|verify-ca|verify-full)/i.test(connectionString);
  if (!wantsSsl) {
    return undefined;
  }
  return { rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED === '1' };
}

export function poolConfig(connectionString: string): PoolConfig {
  const ssl = pgSsl(connectionString);
  const readOnly = process.env.DATABASE_READ_ONLY === '1';
  return {
    connectionString,
    ...(ssl ? { ssl } : {}),
    ...(readOnly ? { options: '-c default_transaction_read_only=on' } : {}),
  };
}

export function getPool(): Pool {
  if (!pool) {
    loadRootEnv();
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is required');
    }
    pool = new Pool(poolConfig(connectionString));
  }
  return pool;
}

export function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params);
}

export async function healthCheck(): Promise<boolean> {
  const result = await query<{ ok: number }>('SELECT 1 AS ok');
  return result.rows[0]?.ok === 1;
}

export function resetPoolForTests(): void {
  pool = null;
}

export { loadRootEnv };
