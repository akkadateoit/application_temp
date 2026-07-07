-- Adds the remaining course.csv columns (ประเภทหลักสูตร, แผนการเรียน) now that the
-- apply form drives the full 7-level cascade. `program` and `section` are reused
-- to hold จำนวนปี / ช่วงเวลา respectively (same columns as before, new meaning).
ALTER TABLE applications ADD COLUMN IF NOT EXISTS curriculum_type VARCHAR(100);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS study_plan VARCHAR(100);
