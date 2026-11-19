-- Allow community_invite email template kind in ops_core.email_templates.

ALTER TABLE ops_core.email_templates
  DROP CONSTRAINT IF EXISTS email_templates_kind_check;

ALTER TABLE ops_core.email_templates
  ADD CONSTRAINT email_templates_kind_check
  CHECK (kind IN ('member_otp', 'ops_otp', 'person_invite', 'community_invite', 'contact_notice'));
