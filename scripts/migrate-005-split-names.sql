-- Splits full_name / full_name_en into separate first/last name columns.
-- full_name and full_name_en are kept and now derived (first + last) by the
-- application layer on every write, for backward compatibility with existing
-- queries (admin list search, status lookup, etc).
ALTER TABLE applications ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS first_name_en VARCHAR(100);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS last_name_en VARCHAR(100);
