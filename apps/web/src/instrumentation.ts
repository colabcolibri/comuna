export async function register() {
  const { loadRootEnv } = await import('../../../packages/core/db/src/load-root-env');
  loadRootEnv();
}
