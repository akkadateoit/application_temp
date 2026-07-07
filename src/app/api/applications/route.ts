import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { isValidThaiNationalId } from "@/lib/thaiId";
import { saveUploadedFile, UploadValidationError } from "@/lib/upload";

export const runtime = "nodejs";

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function numOrNull(v: string): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function dateOrNull(v: string): string | null {
  return v ? v : null;
}

export async function POST(request: NextRequest) {
  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return NextResponse.json({ error: "ข้อมูลฟอร์มไม่ถูกต้อง" }, { status: 400 });
  }

  const nationalId = str(fd, "nationalId");
  const fullName = str(fd, "fullName");
  const phone = str(fd, "phone");
  const paymentAmount = str(fd, "paymentAmount");

  if (!isValidThaiNationalId(nationalId)) {
    return NextResponse.json(
      { error: "หมายเลขบัตรประจำตัวประชาชนไม่ถูกต้อง" },
      { status: 400 }
    );
  }
  if (!fullName) {
    return NextResponse.json({ error: "กรุณากรอกชื่อ-นามสกุล" }, { status: 400 });
  }
  if (!/^0\d{8,9}$/.test(phone)) {
    return NextResponse.json({ error: "หมายเลขโทรศัพท์ไม่ถูกต้อง" }, { status: 400 });
  }
  if (!paymentAmount || Number(paymentAmount) <= 0) {
    return NextResponse.json({ error: "กรุณาระบุจำนวนเงินที่โอน" }, { status: 400 });
  }

  const idCardFile = fd.get("idCardFile");
  const paymentSlipFile = fd.get("paymentSlipFile");
  if (!(idCardFile instanceof File) || !(paymentSlipFile instanceof File)) {
    return NextResponse.json(
      { error: "กรุณาแนบไฟล์บัตรประชาชนและสลิปโอนเงิน" },
      { status: 400 }
    );
  }

  const existing = await pool.query(
    "SELECT id FROM applications WHERE national_id = $1",
    [nationalId]
  );
  if (existing.rowCount && existing.rowCount > 0) {
    return NextResponse.json(
      { error: "หมายเลขบัตรประจำตัวประชาชนนี้เคยสมัครไว้แล้ว" },
      { status: 409 }
    );
  }

  let idCardPath: string;
  let paymentSlipPath: string;
  try {
    idCardPath = await saveUploadedFile(idCardFile, "id-cards");
    paymentSlipPath = await saveUploadedFile(paymentSlipFile, "slips");
  } catch (e) {
    if (e instanceof UploadValidationError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    throw e;
  }

  await pool.query(
    `INSERT INTO applications (
      semester, program, section, campus, major, faculty, entry_type, student_type,
      national_id, has_disability, disability_detail, id_card_issue_date, id_card_expiry_date,
      ethnicity, nationality, religion,
      scholarship_type, scholarship_detail, scholarship_amount, loan_type,
      registration_type, registration_detail, payment_method, payment_amount,
      prefix, full_name, birth_date, phone,
      education_level, school_name, school_province, dorm_needed,
      id_card_file_path, payment_slip_file_path, pdpa_accepted_at
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,
      $9,$10,$11,$12,$13,
      $14,$15,$16,
      $17,$18,$19,$20,
      $21,$22,$23,$24,
      $25,$26,$27,$28,
      $29,$30,$31,$32,
      $33,$34, now()
    )`,
    [
      str(fd, "semester") || null,
      str(fd, "program") || null,
      str(fd, "section") || null,
      str(fd, "campus") || null,
      str(fd, "major") || null,
      str(fd, "faculty") || null,
      str(fd, "entryType") || null,
      str(fd, "studentType") || null,
      nationalId,
      str(fd, "hasDisability") === "true",
      str(fd, "disabilityDetail") || null,
      dateOrNull(str(fd, "idCardIssueDate")),
      dateOrNull(str(fd, "idCardExpiryDate")),
      str(fd, "ethnicity") || null,
      str(fd, "nationality") || null,
      str(fd, "religion") || null,
      str(fd, "scholarshipType") || null,
      str(fd, "scholarshipDetail") || null,
      numOrNull(str(fd, "scholarshipAmount")),
      str(fd, "loanType") || null,
      str(fd, "registrationType") || null,
      str(fd, "registrationDetail") || null,
      "โอนเงิน",
      numOrNull(paymentAmount),
      str(fd, "prefix") || null,
      fullName,
      dateOrNull(str(fd, "birthDate")),
      phone,
      str(fd, "educationLevel") || null,
      str(fd, "schoolName") || null,
      str(fd, "schoolProvince") || null,
      str(fd, "dormNeeded") === "true",
      idCardPath,
      paymentSlipPath,
    ]
  );

  return NextResponse.json({ ok: true, nationalId });
}
