-- Adds an optional email field to applications.
ALTER TABLE applications ADD COLUMN IF NOT EXISTS email VARCHAR(200);
