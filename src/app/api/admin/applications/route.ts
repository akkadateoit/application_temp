import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search")?.trim() ?? "";
  const status = searchParams.get("status")?.trim() ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = 20;

  const conditions: string[] = [];
  const values: unknown[] = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`(full_name ILIKE $${values.length} OR national_id ILIKE $${values.length})`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS count FROM applications ${where}`,
    values
  );
  const total = countResult.rows[0]?.count ?? 0;

  values.push(pageSize);
  values.push((page - 1) * pageSize);
  const listResult = await pool.query(
    `SELECT id, application_no, student_code, national_id, prefix, full_name,
            program, campus, status, created_at
     FROM applications
     ${where}
     ORDER BY created_at DESC
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );

  return NextResponse.json({
    applications: listResult.rows,
    total,
    page,
    pageSize,
  });
}
