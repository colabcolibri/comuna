-- Hospitality (host_at_home) is demo flavor, not the platform seed.
-- Keep the group only on the demo tenant. Never DROP DATABASE.

DELETE FROM plugin_directory.field_groups g
USING network_core.communities c
WHERE g.community_id = c.id
  AND g.slug = 'hospitality'
  AND c.slug <> 'demo';
