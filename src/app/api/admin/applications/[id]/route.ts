import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

// Column names an admin is allowed to overwrite via PUT. Matches the snake_case
// keys already returned by GET, so the client can round-trip the same shape.
const EDITABLE_COLUMNS = new Set([
  "application_no",
  "team_no",
  "student_code",
  "semester",
  "program",
  "section",
  "campus",
  "major",
  "faculty",
  "entry_type",
  "student_type",
  "has_disability",
  "disability_detail",
  "id_card_issue_date",
  "id_card_expiry_date",
  "ethnicity",
  "nationality",
  "religion",
  "scholarship_type",
  "scholarship_detail",
  "scholarship_amount",
  "loan_type",
  "registration_type",
  "registration_detail",
  "payment_method",
  "payment_amount",
  "prefix",
  "full_name",
  "birth_date",
  "phone",
  "education_level",
  "school_name",
  "school_province",
  "dorm_needed",
  "status",
  "admin_note",
]);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await pool.query("SELECT * FROM applications WHERE id = $1", [id]);
  if (result.rowCount === 0) {
    return NextResponse.json({ error: "ไม่พบใบสมัคร" }, { status: 404 });
  }
  return NextResponse.json({ application: result.rows[0] });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const setClauses: string[] = [];
  const values: unknown[] = [];

  for (const column of EDITABLE_COLUMNS) {
    if (!(column in body)) continue;
    values.push(body[column] === "" ? null : body[column]);
    setClauses.push(`${column} = $${values.length}`);
  }

  if (setClauses.length === 0) {
    return NextResponse.json({ error: "ไม่มีข้อมูลที่จะแก้ไข" }, { status: 400 });
  }

  setClauses.push("updated_at = now()");
  values.push(id);

  const result = await pool.query(
    `UPDATE applications SET ${setClauses.join(", ")} WHERE id = $${values.length} RETURNING *`,
    values
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "ไม่พบใบสมัคร" }, { status: 404 });
  }

  return NextResponse.json({ application: result.rows[0] });
}
