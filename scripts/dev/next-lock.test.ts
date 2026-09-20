import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { isProcessAlive, liveNextDevLock } = require('./next-lock.cjs');

const tmpDirs: string[] = [];

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function appDirWithLock(pid: number | null) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'next-lock-'));
  tmpDirs.push(dir);
  const lockDir = path.join(dir, '.next', 'dev');
  fs.mkdirSync(lockDir, { recursive: true });
  const lockPath = path.join(lockDir, 'lock');
  const payload =
    pid == null ? '' : JSON.stringify({ pid, port: 3014, hostname: 'localhost' });
  fs.writeFileSync(lockPath, payload);
  return dir;
}

describe('next-lock', () => {
  it('treats the current process as alive', () => {
    expect(isProcessAlive(process.pid)).toBe(true);
  });

  it('treats a missing pid as dead', () => {
    expect(isProcessAlive(999_999_999)).toBe(false);
  });

  it('treats eperm as alive so a live lock is not deleted', () => {
    const original = process.kill;
    process.kill = () => {
      const err = new Error('EPERM') as NodeJS.ErrnoException;
      err.code = 'EPERM';
      throw err;
    };
    try {
      expect(isProcessAlive(1)).toBe(true);
    } finally {
      process.kill = original;
    }
  });

  it('keeps a lock when the recorded pid is still running', () => {
    const dir = appDirWithLock(process.pid);
    const lock = liveNextDevLock(dir);
    expect(lock?.pid).toBe(process.pid);
    expect(fs.existsSync(path.join(dir, '.next/dev/lock'))).toBe(true);
  });

  it('removes a stale lock when the recorded pid is gone', () => {
    const dir = appDirWithLock(999_999_999);
    expect(liveNextDevLock(dir)).toBeNull();
    expect(fs.existsSync(path.join(dir, '.next/dev/lock'))).toBe(false);
  });

  it('removes an empty lock file', () => {
    const dir = appDirWithLock(null);
    expect(liveNextDevLock(dir)).toBeNull();
    expect(fs.existsSync(path.join(dir, '.next/dev/lock'))).toBe(false);
  });
});
