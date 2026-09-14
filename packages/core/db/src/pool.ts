import { Pool, QueryResult, QueryResultRow } from 'pg';
import { loadRootEnv } from './load-root-env';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    loadRootEnv();
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is required');
    }
    pool = new Pool({ connectionString });
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
