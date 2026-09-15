import path from 'node:path';
import { createLocalStore, type ObjectStore } from './local-store';

export function mediaRoot() {
  const configured = process.env.MEDIA_ROOT;
  if (configured && path.isAbsolute(configured)) {
    return configured;
  }
  const cwd = process.cwd();
  const fromAppsWeb =
    path.basename(cwd) === 'web' && path.basename(path.dirname(cwd)) === 'apps'
      ? path.join(cwd, '..', '..', 'storage')
      : path.join(cwd, 'storage');
  return path.resolve(configured || fromAppsWeb);
}

export function createObjectStore(): ObjectStore {
  const driver = process.env.MEDIA_DRIVER || 'local';
  if (driver !== 'local') {
    throw new Error(`MEDIA_DRIVER ${driver} is not implemented`);
  }
  return createLocalStore(mediaRoot());
}
