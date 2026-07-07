import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { pool } from "@/lib/db";
import { resolveUploadPath } from "@/lib/upload";

export const runtime = "nodejs";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; type: string }> }
) {
  const { id, type } = await params;
  if (type !== "id-card" && type !== "slip") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const column = type === "id-card" ? "id_card_file_path" : "payment_slip_file_path";
  const result = await pool.query(
    `SELECT ${column} AS path FROM applications WHERE id = $1`,
    [id]
  );
  const relativePath: string | undefined = result.rows[0]?.path;
  if (!relativePath) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  let absolutePath: string;
  try {
    absolutePath = resolveUploadPath(relativePath);
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  try {
    const buffer = await readFile(absolutePath);
    const ext = path.extname(absolutePath).toLowerCase();
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": MIME_BY_EXT[ext] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
