import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_BYTES ?? 5 * 1024 * 1024);

export type UploadKind = "id-cards" | "slips";

export class UploadValidationError extends Error {}

function uploadRoot() {
  return path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? "./uploads");
}

/** Validates an incoming file (type/size) and writes it to disk under a random name. Returns the path relative to UPLOAD_DIR. */
export async function saveUploadedFile(file: File, kind: UploadKind): Promise<string> {
  const ext = ALLOWED_MIME_TO_EXT[file.type];
  if (!ext) {
    throw new UploadValidationError(
      "รองรับเฉพาะไฟล์รูปภาพ JPG, PNG หรือ WEBP เท่านั้น"
    );
  }
  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
    throw new UploadValidationError(
      `ขนาดไฟล์ต้องไม่เกิน ${(MAX_UPLOAD_BYTES / 1024 / 1024).toFixed(1)} MB`
    );
  }

  const dir = path.join(uploadRoot(), kind);
  await mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return path.join(kind, filename);
}

/** Resolves a stored relative path back to an absolute path, guarding against path traversal. */
export function resolveUploadPath(relativePath: string): string {
  const root = uploadRoot();
  const resolved = path.resolve(root, relativePath);
  if (!resolved.startsWith(root + path.sep)) {
    throw new Error("Invalid upload path");
  }
  return resolved;
}
