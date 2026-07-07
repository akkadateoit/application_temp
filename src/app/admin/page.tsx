"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import AdminNav from "@/components/AdminNav";
import { STATUS_OPTIONS, statusLabel } from "@/lib/formOptions";

type Row = {
  id: number;
  application_no: string | null;
  student_code: string | null;
  national_id: string;
  prefix: string | null;
  full_name: string;
  program: string | null;
  campus: string | null;
  status: string;
  created_at: string;
};

const statusColor: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminApplicationsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/applications?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setRows(data.applications);
      setTotal(data.total);
    }
    setLoading(false);
  }, [page, search, status]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <AdminNav />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">
        <h1 className="text-lg font-semibold text-slate-900 mb-4">รายการใบสมัคร</h1>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="ค้นหาชื่อ หรือเลขบัตรประชาชน"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="">ทุกสถานะ</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="px-4 py-3 font-medium">ชื่อ-นามสกุล</th>
                <th className="px-4 py-3 font-medium">เลขบัตรประชาชน</th>
                <th className="px-4 py-3 font-medium">หลักสูตร</th>
                <th className="px-4 py-3 font-medium">วิทยาเขต</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 font-medium">วันที่สมัคร</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                    กำลังโหลด...
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3">
                    {r.prefix} {r.full_name}
                  </td>
                  <td className="px-4 py-3 font-mono">{r.national_id}</td>
                  <td className="px-4 py-3">{r.program ?? "-"}</td>
                  <td className="px-4 py-3">{r.campus ?? "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        statusColor[r.status] ?? ""
                      }`}
                    >
                      {statusLabel(r.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(r.created_at).toLocaleDateString("th-TH")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/${r.id}`} className="text-blue-600 hover:underline">
                      ดู/แก้ไข
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
          <span>ทั้งหมด {total} รายการ</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
            >
              ก่อนหน้า
            </button>
            <span className="px-2 py-1.5">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
