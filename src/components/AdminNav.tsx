"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const linkCls = (href: string) =>
    `px-3 py-2 rounded-lg text-sm font-medium ${
      pathname === href
        ? "bg-blue-600 text-white"
        : "text-slate-600 hover:bg-slate-100"
    }`;

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-slate-900 mr-3 text-sm sm:text-base">
            ผู้ดูแลระบบรับสมัคร
          </span>
          <Link href="/admin" className={linkCls("/admin")}>
            รายการใบสมัคร
          </Link>
          <Link href="/admin/users" className={linkCls("/admin/users")}>
            จัดการแอดมิน
          </Link>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-slate-500 hover:text-red-600"
        >
          ออกจากระบบ
        </button>
      </div>
    </header>
  );
}
