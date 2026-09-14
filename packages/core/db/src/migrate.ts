import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import { listMigrationFiles, migrationIdFromPath } from './migrations';

const DEFAULT_MIGRATIONS_DIR = path.resolve(__dirname, '../../../../db/migrations');

export async function applyMigrations(connectionString: string, dir = DEFAULT_MIGRATIONS_DIR): Promise<string[]> {
  const client = new Client({ connectionString });
  await client.connect();
  const applied: string[] = [];
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        id text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    const existing = await client.query<{ id: string }>('SELECT id FROM public.schema_migrations');
    const done = new Set(existing.rows.map((r) => r.id));
    for (const file of listMigrationFiles(dir)) {
      const id = migrationIdFromPath(file);
      if (done.has(id)) {
        continue;
      }
      const sql = fs.readFileSync(file, 'utf8');
      await client.query(sql);
      await client.query('INSERT INTO public.schema_migrations (id) VALUES ($1)', [id]);
      applied.push(id);
    }
  } finally {
    await client.end();
  }
  return applied;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is required');
  }
  const applied = await applyMigrations(url);
  console.log(applied.length ? `applied: ${applied.join(', ')}` : 'no pending migrations');
}

const isCli = process.argv[1]?.includes('migrate.ts') || process.argv[1]?.includes('migrate.js');
if (isCli) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
