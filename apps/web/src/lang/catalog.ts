import { createUiCatalog } from '@community/identity';
import { contactMediatedPack } from '@community/contact-mediated';
import { directoryPack } from '@community/directory';
import { showcasePack } from '@community/showcase';
import { coreAdminPack } from './core_admin';
import { coreIdentityPack } from './core_identity';
import { coreMembershipPack } from './core_membership';
import { coreWebPack } from './core_web';

export const uiCatalog = createUiCatalog({
  core_web: coreWebPack,
  core_identity: coreIdentityPack,
  core_membership: coreMembershipPack,
  core_admin: coreAdminPack,
  plugin_directory: directoryPack,
  plugin_showcase: showcasePack,
  plugin_contact_mediated: contactMediatedPack,
});
