-- Schema for North Bangkok University online application system
-- Run with: psql "$DATABASE_URL" -f scripts/schema.sql

CREATE TABLE IF NOT EXISTS admin_users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS applications (
  id                     SERIAL PRIMARY KEY,

  -- office-use fields (filled by admin later)
  application_no         VARCHAR(20),
  team_no                VARCHAR(20),
  student_code           VARCHAR(20),

  -- form: top section
  application_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  semester               VARCHAR(50),
  program                VARCHAR(50),   -- จำนวนปี จาก course.csv (เดิม 4 ปี / 2 ปี เทียบโอน)
  section                VARCHAR(50),   -- ช่วงเวลา จาก course.csv (ปกติ / สมทบ)
  campus                 VARCHAR(50),   -- สะพานใหม่ / รังสิต / นนทบุรี
  program_level          VARCHAR(100),  -- ระดับ จาก course.csv (ปริญญาตรี, ปริญญาโท, ...)
  major                  VARCHAR(200),
  faculty                VARCHAR(200),
  curriculum_type        VARCHAR(100),  -- ประเภทหลักสูตร จาก course.csv (หลักสูตรไทย/หลักสูตรนานาชาติ)
  study_plan             VARCHAR(100),  -- แผนการเรียน จาก course.csv (ปกติ/สหกิจ/แผน 2.1/...)
  entry_type             VARCHAR(100),  -- ไม่มี/มีรายวิชาเทียบโอนต่างสถาบัน
  student_type           VARCHAR(50),   -- ปกติ / ศักยภาพ

  -- national id / id card
  national_id            VARCHAR(13) NOT NULL UNIQUE,
  has_disability          BOOLEAN NOT NULL DEFAULT false,
  disability_detail       TEXT,
  id_card_issue_date      DATE,
  id_card_expiry_date     DATE,
  ethnicity               VARCHAR(100),
  nationality              VARCHAR(100),
  religion                 VARCHAR(100),

  -- scholarship / loan
  scholarship_type         VARCHAR(200),
  scholarship_detail       TEXT,
  scholarship_amount       NUMERIC(12,2),
  loan_type                VARCHAR(50),  -- ไม่กู้ / กยศ / กรอ

  -- registration / payment
  registration_type        VARCHAR(50),  -- ครั้งแรก / ชำระเพิ่ม
  registration_detail      TEXT,
  payment_method           VARCHAR(50),  -- เงินสด / โอนเงิน
  payment_amount           NUMERIC(12,2),

  -- personal info
  prefix                   VARCHAR(20),  -- นาย/นาง/นางสาว
  full_name                VARCHAR(200) NOT NULL,
  full_name_en             VARCHAR(200),
  birth_date               DATE,
  phone                    VARCHAR(20),

  -- education
  education_level          VARCHAR(50),  -- ม.6 / ปวช. / ปวส.
  school_name              VARCHAR(200),
  school_province          VARCHAR(100),

  -- dorm
  dorm_needed              BOOLEAN NOT NULL DEFAULT false,

  -- attachments (disk paths, relative to UPLOAD_DIR)
  id_card_file_path        VARCHAR(500) NOT NULL,
  payment_slip_file_path   VARCHAR(500) NOT NULL,

  -- workflow
  status                   VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending/approved/rejected
  admin_note               TEXT,

  pdpa_accepted_at         TIMESTAMPTZ NOT NULL,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_applications_national_id ON applications(national_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);
