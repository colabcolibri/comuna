'use strict';

const fs = require('fs');
const path = require('path');

function isProcessAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    // processo existe, mas este user não pode sinalizar — não apagar o lock
    return err && err.code === 'EPERM';
  }
}

function readNextDevLock(appDir) {
  const lockPath = path.join(appDir, '.next/dev/lock');
  if (!fs.existsSync(lockPath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(lockPath, 'utf8').trim();
    if (!raw) {
      return { lockPath };
    }
    const parsed = JSON.parse(raw);
    return { lockPath, pid: parsed.pid, port: parsed.port };
  } catch {
    return { lockPath };
  }
}

function liveNextDevLock(appDir) {
  const lock = readNextDevLock(appDir);
  if (!lock) {
    return null;
  }
  if (isProcessAlive(lock.pid)) {
    return lock;
  }
  try {
    fs.unlinkSync(lock.lockPath);
  } catch {
    // lock already gone
  }
  return null;
}

module.exports = { isProcessAlive, readNextDevLock, liveNextDevLock };
