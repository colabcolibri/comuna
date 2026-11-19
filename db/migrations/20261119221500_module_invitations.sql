-- Register invitations module (opt-in per community) and allow active members to manage their own invitations when enabled.

INSERT INTO plugin_core.modules (slug, version)
VALUES ('invitations', '1.0.0')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO network_core.community_modules (community_id, module_id, enabled)
SELECT c.id, m.id, false
FROM network_core.communities c
JOIN plugin_core.modules m ON m.slug = 'invitations'
ON CONFLICT (community_id, module_id) DO NOTHING;

DROP POLICY IF EXISTS invitations_member_own ON network_core.invitations;
CREATE POLICY invitations_member_own ON network_core.invitations
  FOR ALL
  USING (
    NULLIF(current_setting('app.community_id', true), '') IS NOT NULL
    AND community_id = NULLIF(current_setting('app.community_id', true), '')::uuid
    AND invited_by = NULLIF(current_setting('app.user_id', true), '')::uuid
    AND EXISTS (
      SELECT 1
      FROM network_core.community_modules cm
      JOIN plugin_core.modules pm ON pm.id = cm.module_id
      WHERE cm.community_id = network_core.invitations.community_id
        AND pm.slug = 'invitations'
        AND cm.enabled = true
    )
    AND EXISTS (
      SELECT 1
      FROM network_core.memberships m
      WHERE m.community_id = network_core.invitations.community_id
        AND m.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
        AND m.network_status = 'active'
    )
  )
  WITH CHECK (
    NULLIF(current_setting('app.community_id', true), '') IS NOT NULL
    AND community_id = NULLIF(current_setting('app.community_id', true), '')::uuid
    AND invited_by = NULLIF(current_setting('app.user_id', true), '')::uuid
    AND EXISTS (
      SELECT 1
      FROM network_core.community_modules cm
      JOIN plugin_core.modules pm ON pm.id = cm.module_id
      WHERE cm.community_id = network_core.invitations.community_id
        AND pm.slug = 'invitations'
        AND cm.enabled = true
    )
    AND EXISTS (
      SELECT 1
      FROM network_core.memberships m
      WHERE m.community_id = network_core.invitations.community_id
        AND m.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
        AND m.network_status = 'active'
    )
  );
