-- Adds program level (ระดับ, from course.csv cascading dropdown) and the
-- applicant's English name. Safe to re-run.
ALTER TABLE applications ADD COLUMN IF NOT EXISTS program_level VARCHAR(100);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS full_name_en VARCHAR(200);
