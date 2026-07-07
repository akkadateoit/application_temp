import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const result = await pool.query(
    "SELECT id, username, created_at FROM admin_users ORDER BY created_at ASC"
  );
  return NextResponse.json({ users: result.rows });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!username || username.length < 3) {
    return NextResponse.json({ error: "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร" }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" }, { status: 400 });
  }

  const existing = await pool.query("SELECT id FROM admin_users WHERE username = $1", [username]);
  if (existing.rowCount && existing.rowCount > 0) {
    return NextResponse.json({ error: "มีชื่อผู้ใช้นี้อยู่แล้ว" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await pool.query(
    "INSERT INTO admin_users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at",
    [username, passwordHash]
  );

  return NextResponse.json({ user: result.rows[0] }, { status: 201 });
}
