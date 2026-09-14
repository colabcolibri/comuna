import fs from 'fs';
import path from 'path';

function applyEnvFile(file: string): void {
  if (!fs.existsSync(file)) {
    return;
  }
  for (const raw of fs.readFileSync(file, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }
    const eq = line.indexOf('=');
    if (eq <= 0) {
      continue;
    }
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined || process.env[key] === '') {
      process.env[key] = value;
    }
  }
}

/** Next `pnpm --filter` cwd is apps/web; env files live at the monorepo root. */
export function loadRootEnv(): void {
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    applyEnvFile(path.join(dir, '.env'));
    applyEnvFile(path.join(dir, '.env.local'));
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
      break;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
}
