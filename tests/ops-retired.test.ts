import { existsSync } from 'node:fs';
import path from 'node:path';

describe('ops surface on member web', () => {
  const webSrc = path.join(process.cwd(), 'apps/web/src');

  it('does not keep /ops pages or /api/ops handlers', () => {
    expect(existsSync(path.join(webSrc, 'app/ops'))).toBe(false);
    expect(existsSync(path.join(webSrc, 'app/api/ops'))).toBe(false);
  });
});
