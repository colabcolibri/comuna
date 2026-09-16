-- US-0105: map plugin exists and stays off until ops turns it on.
INSERT INTO plugin_core.modules (slug, version)
VALUES ('map', '1.0.0')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO network_core.community_modules (community_id, module_id, enabled)
SELECT c.id, m.id, false
FROM network_core.communities c
CROSS JOIN plugin_core.modules m
WHERE m.slug = 'map'
ON CONFLICT (community_id, module_id) DO NOTHING;
