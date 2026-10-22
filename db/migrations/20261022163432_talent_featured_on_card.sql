ALTER TABLE plugin_talent.offerings
  ADD COLUMN IF NOT EXISTS featured_on_card boolean NOT NULL DEFAULT false;

WITH ranked AS (
  SELECT id,
         row_number() OVER (PARTITION BY membership_id ORDER BY created_at ASC, id ASC) AS rn
  FROM plugin_talent.offerings
)
UPDATE plugin_talent.offerings o
SET featured_on_card = true
FROM ranked r
WHERE o.id = r.id
  AND r.rn = 1
  AND NOT EXISTS (
    SELECT 1
    FROM plugin_talent.offerings x
    WHERE x.membership_id = o.membership_id
      AND x.featured_on_card
  );

CREATE UNIQUE INDEX IF NOT EXISTS offerings_one_featured_per_membership_idx
  ON plugin_talent.offerings (membership_id)
  WHERE featured_on_card;
