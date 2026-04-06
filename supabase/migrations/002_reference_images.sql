ALTER TABLE intakes ADD COLUMN IF NOT EXISTS reference_images text[] DEFAULT '{}';
