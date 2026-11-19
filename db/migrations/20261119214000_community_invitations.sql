-- Community email/token invitations created by coordinators (US-0150).

CREATE TABLE IF NOT EXISTS network_core.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES network_core.communities (id) ON DELETE CASCADE,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  invited_by uuid NOT NULL REFERENCES auth_core.users (id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS invitations_community_created_idx
  ON network_core.invitations (community_id, created_at DESC);

CREATE INDEX IF NOT EXISTS invitations_email_community_idx
  ON network_core.invitations (lower(email), community_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON network_core.invitations TO community_app;

ALTER TABLE network_core.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_core.invitations FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS invitations_coord ON network_core.invitations;
CREATE POLICY invitations_coord ON network_core.invitations
  FOR ALL
  USING (
    NULLIF(current_setting('app.community_id', true), '') IS NOT NULL
    AND community_id = NULLIF(current_setting('app.community_id', true), '')::uuid
    AND EXISTS (
      SELECT 1
      FROM network_core.memberships m
      WHERE m.community_id = network_core.invitations.community_id
        AND m.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
        AND m.network_role = 'coordinator'
        AND m.network_status = 'active'
    )
  )
  WITH CHECK (
    NULLIF(current_setting('app.community_id', true), '') IS NOT NULL
    AND community_id = NULLIF(current_setting('app.community_id', true), '')::uuid
    AND EXISTS (
      SELECT 1
      FROM network_core.memberships m
      WHERE m.community_id = network_core.invitations.community_id
        AND m.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
        AND m.network_role = 'coordinator'
        AND m.network_status = 'active'
    )
  );

DROP POLICY IF EXISTS invitations_ops ON network_core.invitations;
CREATE POLICY invitations_ops ON network_core.invitations
  FOR ALL
  USING (current_setting('app.ops', true) = '1')
  WITH CHECK (current_setting('app.ops', true) = '1');
