"use client";

import { useEffect, useState, useCallback } from "react";
import AdminNav from "@/components/AdminNav";

type AdminUser = {
  id: number;
  username: string;
  created_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "เพิ่มแอดมินไม่สำเร็จ");
        return;
      }
      setUsername("");
      setPassword("");
      await load();
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("ยืนยันการลบบัญชีแอดมินนี้?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "ลบไม่สำเร็จ");
      return;
    }
    await load();
  }

  return (
    <>
      <AdminNav />
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-6 space-y-5">
        <h1 className="text-lg font-semibold text-slate-900">จัดการบัญชีแอดมิน</h1>

        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl border border-slate-200 p-5 space-y-3"
        >
          <h2 className="font-semibold text-slate-900 text-sm">เพิ่มแอดมินใหม่</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="ชื่อผู้ใช้"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white font-medium hover:bg-blue-700 disabled:bg-slate-300"
          >
            {creating ? "กำลังเพิ่ม..." : "เพิ่มแอดมิน"}
          </button>
        </form>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="px-4 py-3 font-medium">ชื่อผู้ใช้</th>
                <th className="px-4 py-3 font-medium">สร้างเมื่อ</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                    กำลังโหลด...
                  </td>
                </tr>
              )}
              {!loading &&
                users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3">{u.username}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(u.created_at).toLocaleDateString("th-TH")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="text-red-600 hover:underline"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
