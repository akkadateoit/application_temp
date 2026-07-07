import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const countResult = await pool.query("SELECT COUNT(*)::int AS count FROM admin_users");
  if (countResult.rows[0].count <= 1) {
    return NextResponse.json(
      { error: "ไม่สามารถลบแอดมินคนสุดท้ายได้" },
      { status: 400 }
    );
  }

  const result = await pool.query("DELETE FROM admin_users WHERE id = $1 RETURNING id", [id]);
  if (result.rowCount === 0) {
    return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
