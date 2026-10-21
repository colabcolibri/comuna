'use strict';

const DEFAULTS = require('../../packages/modules/talent/category-seed.json');

async function seedTalentCategories(client, communityId) {
  for (const item of DEFAULTS) {
    await client.query(
      `INSERT INTO plugin_talent.categories (community_id, id, sort_order, label, allows_other_text, enabled)
       VALUES ($1, $2, $3, $4::jsonb, $5, true)
       ON CONFLICT (community_id, id) DO NOTHING`,
      [communityId, item.id, item.sortOrder, JSON.stringify(item.label), item.allowsOtherText]
    );
  }
}

module.exports = { seedTalentCategories, DEFAULTS };
