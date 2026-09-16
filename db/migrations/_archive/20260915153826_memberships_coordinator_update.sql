-- Coordinator may update another person's membership in the same community.
-- Self-join INSERT already matches memberships_self_or_community WITH CHECK.
-- Never DROP DATABASE.

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
