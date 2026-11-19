-- Referential integrity (ON DELETE CASCADE / SET NULL), RLS on cards and offerings, and performance indexes.

ALTER TABLE plugin_directory.cards
  DROP CONSTRAINT IF EXISTS cards_membership_id_fkey;

ALTER TABLE plugin_directory.cards
  ADD CONSTRAINT cards_membership_id_fkey
  FOREIGN KEY (membership_id)
  REFERENCES network_core.memberships (id)
  ON DELETE CASCADE;

ALTER TABLE plugin_contact.messages
  DROP CONSTRAINT IF EXISTS messages_membership_id_fkey;

ALTER TABLE plugin_contact.messages
  ADD CONSTRAINT messages_membership_id_fkey
  FOREIGN KEY (membership_id)
  REFERENCES network_core.memberships (id)
  ON DELETE CASCADE;

ALTER TABLE network_core.community_modules
  DROP CONSTRAINT IF EXISTS community_modules_community_id_fkey;

ALTER TABLE network_core.community_modules
  ADD CONSTRAINT community_modules_community_id_fkey
  FOREIGN KEY (community_id)
  REFERENCES network_core.communities (id)
  ON DELETE CASCADE;

ALTER TABLE network_core.cohorts
  DROP CONSTRAINT IF EXISTS cohorts_community_id_fkey;

ALTER TABLE network_core.cohorts
  ADD CONSTRAINT cohorts_community_id_fkey
  FOREIGN KEY (community_id)
  REFERENCES network_core.communities (id)
  ON DELETE CASCADE;

ALTER TABLE network_core.memberships
  DROP CONSTRAINT IF EXISTS memberships_cohort_id_fkey;

ALTER TABLE network_core.memberships
  ADD CONSTRAINT memberships_cohort_id_fkey
  FOREIGN KEY (cohort_id)
  REFERENCES network_core.cohorts (id)
  ON DELETE SET NULL;

ALTER TABLE person_core.profiles
  DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

ALTER TABLE person_core.profiles
  ADD CONSTRAINT profiles_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth_core.users (id)
  ON DELETE CASCADE;

-- Row-Level Security on plugin_directory.cards and plugin_talent.offerings
ALTER TABLE plugin_directory.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_directory.cards FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cards_self_or_community ON plugin_directory.cards;
CREATE POLICY cards_self_or_community ON plugin_directory.cards
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM network_core.memberships m
      WHERE m.id = plugin_directory.cards.membership_id
        AND (
          m.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
          OR (
            NULLIF(current_setting('app.community_id', true), '') IS NOT NULL
            AND m.community_id = NULLIF(current_setting('app.community_id', true), '')::uuid
          )
        )
    )
  );

DROP POLICY IF EXISTS cards_self_write ON plugin_directory.cards;
CREATE POLICY cards_self_write ON plugin_directory.cards
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM network_core.memberships m
      WHERE m.id = plugin_directory.cards.membership_id
        AND m.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM network_core.memberships m
      WHERE m.id = plugin_directory.cards.membership_id
        AND m.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
    )
  );

DROP POLICY IF EXISTS cards_ops ON plugin_directory.cards;
CREATE POLICY cards_ops ON plugin_directory.cards
  FOR ALL
  USING (current_setting('app.ops', true) = '1')
  WITH CHECK (current_setting('app.ops', true) = '1');

ALTER TABLE plugin_talent.offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_talent.offerings FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS offerings_self_or_community ON plugin_talent.offerings;
CREATE POLICY offerings_self_or_community ON plugin_talent.offerings
  FOR SELECT
  USING (
    (
      NULLIF(current_setting('app.community_id', true), '') IS NOT NULL
      AND community_id = NULLIF(current_setting('app.community_id', true), '')::uuid
    )
    OR EXISTS (
      SELECT 1
      FROM network_core.memberships m
      WHERE m.id = plugin_talent.offerings.membership_id
        AND m.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
    )
  );

DROP POLICY IF EXISTS offerings_self_write ON plugin_talent.offerings;
CREATE POLICY offerings_self_write ON plugin_talent.offerings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM network_core.memberships m
      WHERE m.id = plugin_talent.offerings.membership_id
        AND m.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM network_core.memberships m
      WHERE m.id = plugin_talent.offerings.membership_id
        AND m.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
    )
  );

DROP POLICY IF EXISTS offerings_ops ON plugin_talent.offerings;
CREATE POLICY offerings_ops ON plugin_talent.offerings
  FOR ALL
  USING (current_setting('app.ops', true) = '1')
  WITH CHECK (current_setting('app.ops', true) = '1');

-- Hot path indexes
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx
  ON auth_core.users (lower(email));

CREATE INDEX IF NOT EXISTS memberships_user_status_idx
  ON network_core.memberships (user_id, network_status);

CREATE INDEX IF NOT EXISTS profiles_languages_gin
  ON person_core.profiles USING gin (languages jsonb_path_ops);
