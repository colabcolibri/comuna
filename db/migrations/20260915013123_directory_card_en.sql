-- Bilingual directory copy. headline/bio remain pt-BR. Never DROP.

ALTER TABLE plugin_directory.cards
  ADD COLUMN IF NOT EXISTS headline_en text,
  ADD COLUMN IF NOT EXISTS bio_en text;
