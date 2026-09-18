-- availability_status is not a platform field; clear stored values on every card.

UPDATE plugin_directory.cards
SET availability_status = NULL
WHERE availability_status IS NOT NULL;
