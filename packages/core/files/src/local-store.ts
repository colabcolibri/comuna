import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type StoredObject = {
  bytes: Uint8Array;
  mime: string;
};

export type ObjectStore = {
  put(key: string, bytes: Uint8Array, mime: string): Promise<void>;
  get(key: string): Promise<StoredObject | null>;
};

function resolveUnderRoot(root: string, key: string) {
  const resolved = path.resolve(root, key);
  const base = path.resolve(root);
  if (resolved !== base && !resolved.startsWith(base + path.sep)) {
    throw new Error('invalid media key');
  }
  return resolved;
}

export function createLocalStore(root: string): ObjectStore {
  return {
    async put(key, bytes, mime) {
      const file = resolveUnderRoot(root, key);
      await mkdir(path.dirname(file), { recursive: true });
      const header = Buffer.from(`${mime}\n`);
      await writeFile(file, Buffer.concat([header, Buffer.from(bytes)]));
    },
    async get(key) {
      const file = resolveUnderRoot(root, key);
      try {
        const raw = await readFile(file);
        const nl = raw.indexOf(0x0a);
        if (nl < 1) {
          return null;
        }
        const mime = raw.subarray(0, nl).toString('utf8').trim();
        return { mime, bytes: raw.subarray(nl + 1) };
      } catch {
        return null;
      }
    },
  };
}
