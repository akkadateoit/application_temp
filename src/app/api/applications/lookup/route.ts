import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { isValidThaiNationalId } from "@/lib/thaiId";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const nationalId = typeof body?.nationalId === "string" ? body.nationalId.trim() : "";

  if (!isValidThaiNationalId(nationalId)) {
    return NextResponse.json(
      { error: "หมายเลขบัตรประจำตัวประชาชนไม่ถูกต้อง" },
      { status: 400 }
    );
  }

  const result = await pool.query(
    `SELECT application_no, student_code, semester, program, section, campus,
            program_level, major, faculty, curriculum_type, study_plan,
            prefix, full_name, full_name_en, status, admin_note, created_at
     FROM applications WHERE national_id = $1`,
    [nationalId]
  );

  if (result.rowCount === 0) {
    return NextResponse.json(
      { error: "ไม่พบใบสมัครที่ใช้หมายเลขบัตรประจำตัวประชาชนนี้" },
      { status: 404 }
    );
  }

  return NextResponse.json({ application: result.rows[0] });
}
