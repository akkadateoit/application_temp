import Link from "next/link";
import { DocumentEditIcon, SearchIcon, ShieldCheckIcon, ArrowRightIcon } from "@/components/icons";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute top-24 -right-32 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
      </div>

      <div className="flex justify-end p-4 sm:p-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-full px-4 py-2 border border-slate-200 bg-white/80 backdrop-blur hover:bg-white shadow-sm transition-colors"
        >
          <ShieldCheckIcon className="h-4 w-4" />
          สำหรับเจ้าหน้าที่
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-3xl text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xl font-bold shadow-lg shadow-blue-600/25">
            NBU
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            มหาวิทยาลัยนอร์ทกรุงเทพ
          </h1>
          <p className="text-slate-500 mt-2 text-base sm:text-lg">
            ใบรับสมัครนักศึกษาออนไลน์
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-10">
            <Link
              href="/pdpa"
              className="group relative rounded-3xl bg-white p-8 flex flex-col items-center gap-3 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <DocumentEditIcon className="h-7 w-7" />
              </span>
              <span className="text-lg font-semibold text-slate-900">กรอกใบสมัคร</span>
              <span className="text-sm text-slate-500">เริ่มกรอกใบสมัครเรียนออนไลน์</span>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                เริ่มเลย <ArrowRightIcon className="h-4 w-4" />
              </span>
            </Link>

            <Link
              href="/status"
              className="group relative rounded-3xl bg-white p-8 flex flex-col items-center gap-3 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                <SearchIcon className="h-7 w-7" />
              </span>
              <span className="text-lg font-semibold text-slate-900">ตรวจสอบใบสมัคร</span>
              <span className="text-sm text-slate-500">เช็คสถานะด้วยเลขบัตรประชาชน</span>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                ตรวจสอบ <ArrowRightIcon className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-slate-400 pb-6">
        © {new Date().getFullYear()} มหาวิทยาลัยนอร์ทกรุงเทพ
      </footer>
    </main>
  );
}
