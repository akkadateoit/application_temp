"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const nationalId = params.get("nationalId") ?? "";

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 text-2xl">
          ✓
        </div>
        <h1 className="text-lg font-semibold text-slate-900">ส่งใบสมัครสำเร็จ</h1>
        <p className="mt-2 text-sm text-slate-600">
          เจ้าหน้าที่จะตรวจสอบใบสมัครของท่าน กรุณาจดจำหมายเลขบัตรประจำตัวประชาชน
          ที่ใช้สมัครไว้ เพื่อใช้ตรวจสอบสถานะภายหลัง
        </p>
        {nationalId && (
          <p className="mt-4 rounded-lg bg-slate-50 border border-slate-200 py-2 font-mono text-lg tracking-widest text-slate-800">
            {nationalId}
          </p>
        )}
        <Link
          href="/status"
          className="mt-6 inline-flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700"
        >
          ตรวจสอบสถานะใบสมัคร
        </Link>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
