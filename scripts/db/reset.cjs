#!/usr/bin/env node
'use strict';

const { Client } = require('pg');
const { loadRootEnv } = require('../lib/load-root-env.cjs');
const { pgSsl } = require('../lib/pg-ssl.cjs');

async function main() {
  loadRootEnv();
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is required');
  }
  const parsed = new URL(url);
  const dbName = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
  if (!dbName || dbName === 'postgres') {
    throw new Error('DATABASE_URL must point at the app database, not postgres');
  }
  const adminUrl = new URL(url);
  adminUrl.pathname = '/postgres';
  const client = new Client({ connectionString: adminUrl.toString(), ssl: pgSsl(adminUrl.toString()) });
  await client.connect();
  try {
    await client.query(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`, [
      dbName,
    ]);
    const quoted = `"${dbName.replace(/"/g, '""')}"`;
    await client.query(`DROP DATABASE IF EXISTS ${quoted}`);
    await client.query(`CREATE DATABASE ${quoted}`);
    console.log(`reset ok database=${dbName}`);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
