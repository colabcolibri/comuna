ALTER TABLE plugin_talent.offerings
  DROP CONSTRAINT IF EXISTS offerings_category_id_fkey;

CREATE TABLE plugin_talent.categories_per_community (
  community_id uuid NOT NULL REFERENCES network_core.communities (id) ON DELETE CASCADE,
  id text NOT NULL,
  sort_order integer NOT NULL,
  label jsonb NOT NULL,
  allows_other_text boolean NOT NULL DEFAULT false,
  enabled boolean NOT NULL DEFAULT true,
  PRIMARY KEY (community_id, id)
);

INSERT INTO plugin_talent.categories_per_community (community_id, id, sort_order, label, allows_other_text)
SELECT c.id, cat.id, cat.sort_order, cat.label, cat.id = 'other'
FROM network_core.communities c
CROSS JOIN plugin_talent.categories cat;

DROP TABLE plugin_talent.categories;

ALTER TABLE plugin_talent.categories_per_community RENAME TO categories;

ALTER TABLE plugin_talent.offerings
  ADD COLUMN IF NOT EXISTS community_id uuid;

UPDATE plugin_talent.offerings o
SET community_id = m.community_id
FROM network_core.memberships m
WHERE m.id = o.membership_id
  AND o.community_id IS NULL;

ALTER TABLE plugin_talent.offerings
  ALTER COLUMN community_id SET NOT NULL;

ALTER TABLE plugin_talent.offerings
  ADD CONSTRAINT offerings_category_fk
  FOREIGN KEY (community_id, category_id)
  REFERENCES plugin_talent.categories (community_id, id);

CREATE INDEX IF NOT EXISTS offerings_community_category_idx
  ON plugin_talent.offerings (community_id, category_id);
