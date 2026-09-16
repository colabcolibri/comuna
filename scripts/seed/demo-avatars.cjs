'use strict';

/** Estilo ilustrado da demo — https://www.dicebear.com/styles/sprouts/ */
const DICEBEAR_STYLE = 'sprouts';

function seedDemoAvatarsEnabled() {
  return process.env.SEED_DEMO_AVATARS !== '0';
}

/** Avatar ilustrado estável (um estilo, seed único por membro). */
function dicebearAvatarUrl(personN) {
  return `https://api.dicebear.com/10.x/${DICEBEAR_STYLE}/png?seed=demo-member-${personN}&size=512`;
}

/** URL pública direta para a demo (hotlink DiceBear). Sem ObjectStore. */
function demoAvatarUrl(personN) {
  return dicebearAvatarUrl(personN);
}

async function seedDemoAvatarsForPeople(client, people, idForPerson) {
  if (!seedDemoAvatarsEnabled()) {
    return 0;
  }
  let written = 0;
  for (const person of people) {
    const userId = await idForPerson(person);
    if (!userId) {
      continue;
    }
    const avatarUrl = demoAvatarUrl(person.n);
    await client.query(
      `UPDATE person_core.profiles SET avatar_url = $2, updated_at = now() WHERE user_id = $1`,
      [userId, avatarUrl]
    );
    written += 1;
  }
  return written;
}

module.exports = {
  DICEBEAR_STYLE,
  demoAvatarUrl,
  dicebearAvatarUrl,
  seedDemoAvatarsEnabled,
  seedDemoAvatarsForPeople,
};
