'use strict';

const fs = require('fs');
const net = require('net');
const path = require('path');
const { spawn } = require('child_process');

const ADMIN_PORT = 3015;
const WEB_PORT = 3014;
const ADMIN_DIR = path.join(__dirname, '../../apps/admin');

function portFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '0.0.0.0');
  });
}

function readNextDevLock(adminDir = ADMIN_DIR) {
  const lockPath = path.join(adminDir, '.next/dev/lock');
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

function runningDevMessage(lock, port) {
  const demo = process.env.DATABASE_READ_ONLY === '1';
  const lines = [
    demo
      ? 'Não dá para subir o modo demo com outro `next dev` deste app a correr.'
      : 'Já há um `next dev` deste app (`apps/admin`).',
    '',
    'O Next 16 permite só uma instância por pasta — mudar para a porta 3016 não funciona.',
  ];
  if (lock?.port || port) {
    lines.push(`Servidor atual: http://localhost:${lock?.port || port}`);
  }
  if (lock?.pid) {
    lines.push(`PID: ${lock.pid} (pare com Ctrl+C no terminal ou \`kill ${lock.pid}\`)`);
  }
  if (demo) {
    lines.push('', 'Depois de parar:', '  pnpm dev:admin:demo');
  }
  return lines.join('\n');
}

async function main() {
  const port = Number(process.env.PORT || ADMIN_PORT);
  if (port === WEB_PORT) {
    throw new Error(`porta ${WEB_PORT} é da web; use ${ADMIN_PORT} ou outra exceto ${WEB_PORT}`);
  }

  const lock = readNextDevLock();
  if (lock) {
    console.error(runningDevMessage(lock, port));
    process.exit(1);
  }

  if (!(await portFree(port))) {
    console.error(
      runningDevMessage(null, port) +
        '\n\nA porta ' +
          port +
          ' está ocupada por outro processo. Se for um next dev antigo, apague apps/admin/.next/dev/lock depois de o matar.'
    );
    process.exit(1);
  }

  const child = spawn('pnpm', ['exec', 'next', 'dev', '-p', String(port), '--turbo'], {
    cwd: ADMIN_DIR,
    stdio: 'inherit',
    env: process.env,
  });
  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 1);
  });
}

module.exports = { readNextDevLock, portFree, ADMIN_PORT, WEB_PORT, runningDevMessage };

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
