import { PoolClient, QueryResult, QueryResultRow } from 'pg';
import { getPool } from './pool';

export type AppQueryContext = {
  userId: string;
  communityId: string | null;
};

export async function withAppContext<T>(
  ctx: AppQueryContext,
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    await client.query('SET LOCAL ROLE community_app');
    await client.query(`SELECT set_config('app.user_id', $1, true)`, [ctx.userId]);
    await client.query(`SELECT set_config('app.community_id', $1, true)`, [ctx.communityId ?? '']);
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

export async function queryAsMember<T extends QueryResultRow = QueryResultRow>(
  ctx: AppQueryContext,
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return withAppContext(ctx, (client) => client.query<T>(text, params));
}
