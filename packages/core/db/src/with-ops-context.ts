import { PoolClient, QueryResult, QueryResultRow } from 'pg';
import { getPool } from './pool';

export async function withOpsContext<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    await client.query(`SELECT set_config('app.ops', '1', true)`);
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // ignore rollback failure after a failed BEGIN
    }
    throw err;
  } finally {
    client.release();
  }
}

export async function queryAsOps<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return withOpsContext((client) => client.query<T>(text, params));
}
