-- First-party plugins: every community gets enabled=true rows.
-- Column default stays false so a missing row is still off.

INSERT INTO plugin_core.modules (slug, version)
VALUES
  ('directory', '1.0.0'),
  ('showcase', '1.0.0'),
  ('contact-mediated', '1.0.0')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO network_core.community_modules (community_id, module_id, enabled)
SELECT c.id, m.id, true
FROM network_core.communities c
CROSS JOIN plugin_core.modules m
WHERE m.slug IN ('directory', 'showcase', 'contact-mediated')
ON CONFLICT (community_id, module_id) DO UPDATE SET enabled = true;
