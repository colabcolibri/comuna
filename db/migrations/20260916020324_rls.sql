-- App role, grants, and row-level security.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'community_app') THEN
    CREATE ROLE community_app NOLOGIN NOSUPERUSER NOBYPASSRLS;
  END IF;
END $$;

GRANT USAGE ON SCHEMA auth_core, person_core, network_core, plugin_core, plugin_directory, plugin_contact, ops_core TO community_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth_core TO community_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA person_core TO community_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA network_core TO community_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA plugin_core TO community_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA plugin_directory TO community_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA plugin_contact TO community_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA ops_core TO community_app;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA auth_core TO community_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA person_core TO community_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA network_core TO community_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA plugin_core TO community_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA plugin_directory TO community_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA plugin_contact TO community_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA ops_core TO community_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA person_core GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO community_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA network_core GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO community_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA ops_core GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO community_app;

GRANT community_app TO CURRENT_USER;

ALTER TABLE person_core.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE person_core.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE network_core.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_core.memberships FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_self_or_community ON person_core.profiles;
CREATE POLICY profiles_self_or_community ON person_core.profiles
  FOR ALL
  USING (
    user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
    OR (
      NULLIF(current_setting('app.community_id', true), '') IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM network_core.memberships m
        WHERE m.user_id = person_core.profiles.user_id
          AND m.community_id = NULLIF(current_setting('app.community_id', true), '')::uuid
      )
    )
  )
  WITH CHECK (
    user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
  );

DROP POLICY IF EXISTS memberships_self_or_community ON network_core.memberships;
CREATE POLICY memberships_self_or_community ON network_core.memberships
  FOR ALL
  USING (
    user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
    OR (
      NULLIF(current_setting('app.community_id', true), '') IS NOT NULL
      AND community_id = NULLIF(current_setting('app.community_id', true), '')::uuid
    )
  )
  WITH CHECK (
    user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
  );

DROP POLICY IF EXISTS memberships_ops ON network_core.memberships;
CREATE POLICY memberships_ops ON network_core.memberships
  FOR ALL
  USING (current_setting('app.ops', true) = '1')
  WITH CHECK (current_setting('app.ops', true) = '1');

DROP POLICY IF EXISTS profiles_ops ON person_core.profiles;
CREATE POLICY profiles_ops ON person_core.profiles
  FOR ALL
  USING (current_setting('app.ops', true) = '1')
  WITH CHECK (current_setting('app.ops', true) = '1');

DROP POLICY IF EXISTS memberships_coordinator_update ON network_core.memberships;
CREATE POLICY memberships_coordinator_update ON network_core.memberships
  FOR UPDATE
  USING (
    community_id = NULLIF(current_setting('app.community_id', true), '')::uuid
    AND EXISTS (
      SELECT 1
      FROM network_core.memberships mine
      WHERE mine.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
        AND mine.community_id = network_core.memberships.community_id
        AND mine.network_role = 'coordinator'
        AND mine.network_status = 'active'
    )
  )
  WITH CHECK (
    community_id = NULLIF(current_setting('app.community_id', true), '')::uuid
  );
