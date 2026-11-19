-- Calendar plugin schema, module registration, grants, indexes, and RLS policies.

INSERT INTO plugin_core.modules (slug, version)
VALUES ('calendar', '1.0.0')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO network_core.community_modules (community_id, module_id, enabled)
SELECT c.id, m.id, true
FROM network_core.communities c
JOIN plugin_core.modules m ON m.slug = 'calendar'
ON CONFLICT (community_id, module_id) DO NOTHING;

CREATE SCHEMA IF NOT EXISTS plugin_calendar;

CREATE TABLE IF NOT EXISTS plugin_calendar.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES network_core.communities (id) ON DELETE CASCADE,
  creator_membership_id uuid NOT NULL REFERENCES network_core.memberships (id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  location text NOT NULL DEFAULT '',
  meeting_url text,
  format text NOT NULL DEFAULT 'online',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT calendar_events_format_check CHECK (format IN ('online', 'in_person', 'hybrid')),
  CONSTRAINT calendar_events_end_after_start CHECK (ends_at IS NULL OR ends_at >= starts_at)
);

CREATE INDEX IF NOT EXISTS calendar_events_community_starts_idx
  ON plugin_calendar.events (community_id, starts_at);

CREATE TABLE IF NOT EXISTS plugin_calendar.rsvps (
  event_id uuid NOT NULL REFERENCES plugin_calendar.events (id) ON DELETE CASCADE,
  membership_id uuid NOT NULL REFERENCES network_core.memberships (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'going',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, membership_id),
  CONSTRAINT calendar_rsvps_status_check CHECK (status IN ('going', 'interested'))
);

CREATE INDEX IF NOT EXISTS calendar_rsvps_membership_idx
  ON plugin_calendar.rsvps (membership_id);

GRANT USAGE ON SCHEMA plugin_calendar TO community_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA plugin_calendar TO community_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA plugin_calendar TO community_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA plugin_calendar GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO community_app;

ALTER TABLE plugin_calendar.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_calendar.events FORCE ROW LEVEL SECURITY;

ALTER TABLE plugin_calendar.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_calendar.rsvps FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS calendar_events_select ON plugin_calendar.events;
CREATE POLICY calendar_events_select ON plugin_calendar.events
  FOR SELECT
  USING (
    NULLIF(current_setting('app.community_id', true), '') IS NOT NULL
    AND community_id = NULLIF(current_setting('app.community_id', true), '')::uuid
  );

DROP POLICY IF EXISTS calendar_events_insert ON plugin_calendar.events;
CREATE POLICY calendar_events_insert ON plugin_calendar.events
  FOR INSERT
  WITH CHECK (
    NULLIF(current_setting('app.community_id', true), '') IS NOT NULL
    AND community_id = NULLIF(current_setting('app.community_id', true), '')::uuid
    AND EXISTS (
      SELECT 1
      FROM network_core.memberships m
      WHERE m.id = plugin_calendar.events.creator_membership_id
        AND m.community_id = plugin_calendar.events.community_id
        AND m.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
        AND m.network_status = 'active'
    )
  );

DROP POLICY IF EXISTS calendar_events_modify ON plugin_calendar.events;
CREATE POLICY calendar_events_modify ON plugin_calendar.events
  FOR UPDATE
  USING (
    NULLIF(current_setting('app.community_id', true), '') IS NOT NULL
    AND community_id = NULLIF(current_setting('app.community_id', true), '')::uuid
    AND (
      EXISTS (
        SELECT 1
        FROM network_core.memberships m
        WHERE m.id = plugin_calendar.events.creator_membership_id
          AND m.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
      )
      OR EXISTS (
        SELECT 1
        FROM network_core.memberships m
        WHERE m.community_id = plugin_calendar.events.community_id
          AND m.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
          AND m.network_role = 'coordinator'
          AND m.network_status = 'active'
      )
    )
  )
  WITH CHECK (
    NULLIF(current_setting('app.community_id', true), '') IS NOT NULL
    AND community_id = NULLIF(current_setting('app.community_id', true), '')::uuid
  );

DROP POLICY IF EXISTS calendar_events_delete ON plugin_calendar.events;
CREATE POLICY calendar_events_delete ON plugin_calendar.events
  FOR DELETE
  USING (
    NULLIF(current_setting('app.community_id', true), '') IS NOT NULL
    AND community_id = NULLIF(current_setting('app.community_id', true), '')::uuid
    AND (
      EXISTS (
        SELECT 1
        FROM network_core.memberships m
        WHERE m.id = plugin_calendar.events.creator_membership_id
          AND m.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
      )
      OR EXISTS (
        SELECT 1
        FROM network_core.memberships m
        WHERE m.community_id = plugin_calendar.events.community_id
          AND m.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
          AND m.network_role = 'coordinator'
          AND m.network_status = 'active'
      )
    )
  );

DROP POLICY IF EXISTS calendar_events_ops ON plugin_calendar.events;
CREATE POLICY calendar_events_ops ON plugin_calendar.events
  FOR ALL
  USING (current_setting('app.ops', true) = '1')
  WITH CHECK (current_setting('app.ops', true) = '1');

DROP POLICY IF EXISTS calendar_rsvps_select ON plugin_calendar.rsvps;
CREATE POLICY calendar_rsvps_select ON plugin_calendar.rsvps
  FOR SELECT
  USING (
    NULLIF(current_setting('app.community_id', true), '') IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM plugin_calendar.events e
      WHERE e.id = plugin_calendar.rsvps.event_id
        AND e.community_id = NULLIF(current_setting('app.community_id', true), '')::uuid
    )
  );

DROP POLICY IF EXISTS calendar_rsvps_write ON plugin_calendar.rsvps;
CREATE POLICY calendar_rsvps_write ON plugin_calendar.rsvps
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM network_core.memberships m
      WHERE m.id = plugin_calendar.rsvps.membership_id
        AND m.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
        AND m.network_status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM network_core.memberships m
      JOIN plugin_calendar.events e ON e.id = plugin_calendar.rsvps.event_id
      WHERE m.id = plugin_calendar.rsvps.membership_id
        AND m.community_id = e.community_id
        AND m.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
        AND m.network_status = 'active'
    )
  );

DROP POLICY IF EXISTS calendar_rsvps_ops ON plugin_calendar.rsvps;
CREATE POLICY calendar_rsvps_ops ON plugin_calendar.rsvps
  FOR ALL
  USING (current_setting('app.ops', true) = '1')
  WITH CHECK (current_setting('app.ops', true) = '1');
