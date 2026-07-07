"use client";

import { useState } from "react";
import { statusLabel } from "@/lib/formOptions";

type ApplicationSummary = {
  application_no: string | null;
  student_code: string | null;
  semester: string | null;
  program: string | null;
  section: string | null;
  campus: string | null;
  program_level: string | null;
  major: string | null;
  faculty: string | null;
  curriculum_type: string | null;
  study_plan: string | null;
  prefix: string | null;
  full_name: string;
  full_name_en: string | null;
  status: string;
  admin_note: string | null;
  created_at: string;
};

const statusColor: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  registered: "bg-blue-50 text-blue-700 border-blue-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-slate-100 text-slate-600 border-slate-300",
};

export default function StatusPage() {
  const [nationalId, setNationalId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApplicationSummary | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/applications/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nationalId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "เกิดข้อผิดพลาด");
        return;
      }
      setResult(data.application);
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-start sm:items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h1 className="text-lg font-semibold text-slate-900 mb-1">
          ตรวจสอบสถานะใบสมัคร
        </h1>
        <p className="text-sm text-slate-500 mb-5">
          กรอกหมายเลขบัตรประจำตัวประชาชนที่ใช้สมัครเรียน
        </p>

        <form onSubmit={handleSearch} className="space-y-3">
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            inputMode="numeric"
            maxLength={13}
            placeholder="เลขบัตรประชาชน 13 หลัก"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ""))}
          />
          <button
            type="submit"
            disabled={loading || nationalId.length !== 13}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-white font-medium hover:bg-blue-700 disabled:bg-slate-300"
          >
            {loading ? "กำลังค้นหา..." : "ตรวจสอบสถานะ"}
          </button>
        </form>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
            {error}
          </p>
        )}

        {result && (
          <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
            <div
              className={`inline-block rounded-full border px-3 py-1 font-medium ${
                statusColor[result.status] ?? "bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              {statusLabel(result.status)}
            </div>
            <dl className="grid grid-cols-3 gap-y-1.5 gap-x-2">
              <dt className="text-slate-500 col-span-1">ชื่อ-นามสกุล</dt>
              <dd className="col-span-2 text-slate-900">
                {result.prefix} {result.full_name}
                {result.full_name_en && (
                  <span className="block text-slate-500 text-xs">{result.full_name_en}</span>
                )}
              </dd>
              <dt className="text-slate-500 col-span-1">เลขที่ใบสมัคร</dt>
              <dd className="col-span-2 text-slate-900">{result.application_no ?? "-"}</dd>
              <dt className="text-slate-500 col-span-1">รหัสนักศึกษา</dt>
              <dd className="col-span-2 text-slate-900">{result.student_code ?? "-"}</dd>
              <dt className="text-slate-500 col-span-1">ระดับ</dt>
              <dd className="col-span-2 text-slate-900">{result.program_level ?? "-"}</dd>
              <dt className="text-slate-500 col-span-1">สาขา/คณะ</dt>
              <dd className="col-span-2 text-slate-900">
                {result.major || "-"} / {result.faculty || "-"}
              </dd>
              <dt className="text-slate-500 col-span-1">หลักสูตร</dt>
              <dd className="col-span-2 text-slate-900">
                {result.program ? `${result.program} ปี` : "-"} {result.section ? `(${result.section})` : ""}
                {result.curriculum_type ? ` / ${result.curriculum_type}` : ""}
                {result.study_plan ? ` / ${result.study_plan}` : ""}
              </dd>
              <dt className="text-slate-500 col-span-1">วิทยาเขต</dt>
              <dd className="col-span-2 text-slate-900">{result.campus ?? "-"}</dd>
            </dl>
            {result.admin_note && (
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                <p className="text-slate-500 text-xs mb-1">หมายเหตุจากเจ้าหน้าที่</p>
                <p className="text-slate-800">{result.admin_note}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
