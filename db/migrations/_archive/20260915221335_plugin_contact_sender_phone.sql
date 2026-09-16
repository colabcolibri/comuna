ALTER TABLE plugin_contact.messages
  ADD COLUMN IF NOT EXISTS sender_phone text;
