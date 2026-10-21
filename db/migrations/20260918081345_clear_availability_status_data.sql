-- availability_status is not a platform field; clear stored values on every card.
-- Fresh databases never created the column (the CREATE lived in an archived migration).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'plugin_directory'
      AND table_name = 'cards'
      AND column_name = 'availability_status'
  ) THEN
    UPDATE plugin_directory.cards
    SET availability_status = NULL
    WHERE availability_status IS NOT NULL;
  END IF;
END $$;
