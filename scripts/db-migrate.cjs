#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const dir = path.resolve(__dirname, '../db/migrations');

function listMigrationFiles(migrationsDir) {
  return fs
    .readdirSync(migrationsDir)
    .filter((name) => /^\d{14}_.+\.sql$/.test(name))
    .sort()
    .map((name) => path.join(migrationsDir, name));
}

async function applyMigrations(connectionString) {
  const client = new Client({ connectionString });
  await client.connect();
  const applied = [];
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        id text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    const existing = await client.query('SELECT id FROM public.schema_migrations');
    const done = new Set(existing.rows.map((r) => r.id));
    for (const file of listMigrationFiles(dir)) {
      const id = path.basename(file, '.sql');
      if (done.has(id)) continue;
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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
