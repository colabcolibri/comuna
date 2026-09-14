import fs from 'fs';
import path from 'path';

export function listMigrationFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((name) => /^\d{14}_.+\.sql$/.test(name))
    .sort()
    .map((name) => path.join(dir, name));
}

export function migrationIdFromPath(filePath: string): string {
  return path.basename(filePath, '.sql');
}
