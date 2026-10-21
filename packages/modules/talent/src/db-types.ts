export type QueryFn = (
  sql: string,
  params: unknown[]
) => Promise<{ rows: Record<string, unknown>[] }>;
