import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col">
      <div className="flex justify-end p-4">
        <Link
          href="/admin"
          className="text-sm font-medium text-slate-500 hover:text-slate-800 rounded-lg px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50"
        >
          สำหรับเจ้าหน้าที่
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-2xl text-center space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              มหาวิทยาลัยนอร์ทกรุงเทพ
            </h1>
            <p className="text-slate-500 mt-2">
              ระบบรับสมัครนักศึกษาระดับปริญญาตรีออนไลน์
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/pdpa"
              className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white p-8 flex flex-col items-center gap-3 shadow-sm transition-colors"
            >
              <span className="text-3xl">📝</span>
              <span className="text-lg font-semibold">กรอกใบสมัคร</span>
            </Link>
            <Link
              href="/status"
              className="rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 p-8 flex flex-col items-center gap-3 shadow-sm transition-colors"
            >
              <span className="text-3xl">🔍</span>
              <span className="text-lg font-semibold">ตรวจสอบใบสมัคร</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
