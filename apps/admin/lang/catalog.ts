import { createUiCatalog } from '@community/identity';
import { coreAdminPack } from './core_admin';

export const uiCatalog = createUiCatalog({
  core_admin: coreAdminPack,
});
