#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { loadRootEnv } = require('./load-root-env.cjs');

const dir = path.resolve(__dirname, '../db/migrations');

function listMigrationIds(migrationsDir) {
  return fs
    .readdirSync(migrationsDir)
    .filter((name) => /^\d{14}_.+\.sql$/.test(name))
    .sort()
    .map((name) => path.basename(name, '.sql'));
}

function classifyMigrations(fileIds, appliedIds) {
  const done = new Set(appliedIds);
  return {
    applied: fileIds.filter((id) => done.has(id)),
    pending: fileIds.filter((id) => !done.has(id)),
  };
}

async function readAppliedIds(connectionString) {
  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        id text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    const existing = await client.query('SELECT id FROM public.schema_migrations');
    return existing.rows.map((r) => r.id);
  } finally {
    await client.end();
  }
}

async function applyMigrations(connectionString) {
  const fileIds = listMigrationIds(dir);
  const appliedNow = [];
  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        id text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    const existing = await client.query('SELECT id FROM public.schema_migrations');
    const done = new Set(existing.rows.map((r) => r.id));
    for (const id of fileIds) {
      if (done.has(id)) continue;
      const sql = fs.readFileSync(path.join(dir, `${id}.sql`), 'utf8');
      await client.query(sql);
      await client.query('INSERT INTO public.schema_migrations (id) VALUES ($1)', [id]);
      appliedNow.push(id);
    }
  } finally {
    await client.end();
  }
  return appliedNow;
}

async function printStatus(connectionString) {
  const fileIds = listMigrationIds(dir);
  const appliedIds = await readAppliedIds(connectionString);
  const { applied, pending } = classifyMigrations(fileIds, appliedIds);
  console.log(`applied (${applied.length}):`);
  for (const id of applied) console.log(`  ${id}.sql`);
  console.log(`pending (${pending.length}):`);
  for (const id of pending) console.log(`  ${id}.sql`);
}

async function main() {
  loadRootEnv();
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is required');
  }
  const statusOnly = process.argv.includes('--status');
  if (statusOnly) {
    await printStatus(url);
    return;
  }
  const applied = await applyMigrations(url);
  console.log(applied.length ? `applied: ${applied.join(', ')}` : 'no pending migrations');
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { listMigrationIds, classifyMigrations };
