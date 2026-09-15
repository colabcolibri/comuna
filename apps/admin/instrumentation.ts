export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }
  const { loadRootEnv } = await import('../../packages/core/db/src/load-root-env');
  loadRootEnv();
}
