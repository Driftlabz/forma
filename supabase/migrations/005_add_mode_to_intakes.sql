-- Add design mode column to intakes table
-- Defaults to CINEMATIC (the only selectable mode in MVP)
ALTER TABLE intakes
  ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT 'CINEMATIC'
  CHECK (mode IN ('CINEMATIC', 'EDITORIAL', 'BRUTALIST'));
