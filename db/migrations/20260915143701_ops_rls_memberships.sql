-- Ops writes (add membership to another person) are not the member's own row.
-- FORCE RLS + WITH CHECK user_id = app.user_id blocked those inserts.
-- Never DROP DATABASE.

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
