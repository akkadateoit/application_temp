"use client";

import { useEffect, useState, use as usePromise } from "react";
import AdminNav from "@/components/AdminNav";
import {
  CAMPUS_OPTIONS,
  ENTRY_TYPE_OPTIONS,
  STUDENT_TYPE_OPTIONS,
  LOAN_TYPE_OPTIONS,
  REGISTRATION_TYPE_OPTIONS,
  PREFIX_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  STATUS_OPTIONS,
} from "@/lib/formOptions";
import {
  getLevels,
  getFaculties,
  getMajors,
  getYears,
  getSections,
  getCurriculumTypes,
  getPlans,
} from "@/lib/courses";
import SearchSelect from "@/components/SearchSelect";
import { SEMESTER_TERM_OPTIONS, getAcademicYearOptions } from "@/lib/academicYear";

type Application = Record<string, unknown> & {
  id: number;
  national_id: string;
  full_name: string;
  status: string;
};

const inputCls =
  "rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full";
const labelCls = "flex flex-col gap-1 text-sm";
const captionCls = "font-medium text-slate-700";

function toDateInput(value: unknown): string {
  if (!value) return "";
  const d = new Date(value as string);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = usePromise(params);
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [schoolNameManual, setSchoolNameManual] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/applications/${id}`)
      .then((r) => r.json())
      .then((data) => setApp(data.application))
      .finally(() => setLoading(false));
  }, [id]);

  function set(key: string, value: unknown) {
    setApp((a) => (a ? { ...a, [key]: value } : a));
  }

  async function fetchProvinceOptions(query: string): Promise<string[]> {
    const res = await fetch(`/api/schools/provinces?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.provinces ?? [];
  }

  async function fetchSchoolOptions(query: string): Promise<string[]> {
    const province = (app?.school_province as string) ?? "";
    if (!province) return [];
    const res = await fetch(`/api/schools?province=${encodeURIComponent(province)}&q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.schools ?? [];
  }

  async function handleSave() {
    if (!app) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(app),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "บันทึกไม่สำเร็จ");
        return;
      }
      setApp(data.application);
      setSavedAt(Date.now());
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <AdminNav />
        <main className="flex-1 flex items-center justify-center text-slate-400">
          กำลังโหลด...
        </main>
      </>
    );
  }

  if (!app) {
    return (
      <>
        <AdminNav />
        <main className="flex-1 flex items-center justify-center text-slate-400">
          ไม่พบใบสมัคร
        </main>
      </>
    );
  }

  const str = (key: string) => (app[key] as string) ?? "";

  return (
    <>
      <AdminNav />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">
            ใบสมัคร #{app.id} — {app.full_name}
          </h1>
          <a
            href={`/status`}
            className="text-sm text-blue-600 hover:underline"
          >
            เลขบัตรประชาชน: {app.national_id}
          </a>
        </div>

        <section className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className={labelCls}>
            <span className={captionCls}>สถานะ</span>
            <select className={inputCls} value={str("status")} onChange={(e) => set("status", e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelCls}>
            <span className={captionCls}>เลขที่ใบสมัคร</span>
            <input className={inputCls} value={str("application_no")} onChange={(e) => set("application_no", e.target.value)} />
          </label>
          <label className={labelCls}>
            <span className={captionCls}>ทีม</span>
            <input className={inputCls} value={str("team_no")} onChange={(e) => set("team_no", e.target.value)} />
          </label>
          <label className={labelCls}>
            <span className={captionCls}>รหัสนักศึกษา</span>
            <input className={inputCls} value={str("student_code")} onChange={(e) => set("student_code", e.target.value)} />
          </label>
          <label className={labelCls + " sm:col-span-2"}>
            <span className={captionCls}>หมายเหตุจากเจ้าหน้าที่ (ผู้สมัครจะเห็นข้อความนี้)</span>
            <textarea
              className={inputCls}
              rows={2}
              value={str("admin_note")}
              onChange={(e) => set("admin_note", e.target.value)}
            />
          </label>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <h2 className="font-semibold text-slate-900">เอกสารแนบ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">รูปบัตรประจำตัวประชาชน</p>
              <img
                src={`/api/admin/files/${id}/id-card`}
                alt="บัตรประจำตัวประชาชน"
                className="rounded-lg border border-slate-200 max-h-64 object-contain"
              />
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">สลิปโอนเงิน</p>
              <img
                src={`/api/admin/files/${id}/slip`}
                alt="สลิปโอนเงิน"
                className="rounded-lg border border-slate-200 max-h-64 object-contain"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <h2 className="font-semibold text-slate-900 sm:col-span-2">ข้อมูลการสมัคร</h2>
          <label className={labelCls}>
            <span className={captionCls}>เทอมที่เข้าศึกษา</span>
            <select
              className={inputCls}
              value={str("semester").split("/")[0] ?? ""}
              onChange={(e) => set("semester", `${e.target.value}/${str("semester").split("/")[1] ?? ""}`)}
            >
              <option value="">-</option>
              {SEMESTER_TERM_OPTIONS.map((term) => (
                <option key={term} value={term}>เทอม {term}</option>
              ))}
            </select>
          </label>
          <label className={labelCls}>
            <span className={captionCls}>ปีการศึกษา</span>
            <select
              className={inputCls}
              value={str("semester").split("/")[1] ?? ""}
              onChange={(e) => set("semester", `${str("semester").split("/")[0] ?? ""}/${e.target.value}`)}
            >
              <option value="">-</option>
              {Array.from(
                new Set([...getAcademicYearOptions().map(String), str("semester").split("/")[1]].filter(Boolean))
              ).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </label>
          <label className={labelCls}>
            <span className={captionCls}>วิทยาเขต</span>
            <select className={inputCls} value={str("campus")} onChange={(e) => set("campus", e.target.value)}>
              <option value="">-</option>
              {CAMPUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className={labelCls}>
            <span className={captionCls}>ระดับ</span>
            <select
              className={inputCls}
              value={str("program_level")}
              onChange={(e) => setApp((a) => (a ? { ...a, program_level: e.target.value, faculty: "", major: "" } : a))}
            >
              <option value="">-</option>
              {getLevels().map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className={labelCls}>
            <span className={captionCls}>คณะ</span>
            <select
              className={inputCls}
              value={str("faculty")}
              disabled={!str("program_level")}
              onChange={(e) => setApp((a) => (a ? { ...a, faculty: e.target.value, major: "" } : a))}
            >
              <option value="">-</option>
              {getFaculties(str("program_level")).map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className={labelCls + " sm:col-span-2"}>
            <span className={captionCls}>สาขาวิชา</span>
            <select
              className={inputCls}
              value={str("major")}
              disabled={!str("faculty")}
              onChange={(e) =>
                setApp((a) =>
                  a
                    ? { ...a, major: e.target.value, program: "", section: "", curriculum_type: "", study_plan: "" }
                    : a
                )
              }
            >
              <option value="">-</option>
              {getMajors(str("program_level"), str("faculty")).map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className={labelCls}>
            <span className={captionCls}>จำนวนปี</span>
            <select
              className={inputCls}
              value={str("program")}
              disabled={!str("major")}
              onChange={(e) =>
                setApp((a) =>
                  a ? { ...a, program: e.target.value, section: "", curriculum_type: "", study_plan: "" } : a
                )
              }
            >
              <option value="">-</option>
              {getYears(str("program_level"), str("faculty"), str("major")).map((o) => (
                <option key={o} value={o}>{o} ปี</option>
              ))}
            </select>
          </label>
          <label className={labelCls}>
            <span className={captionCls}>ช่วงเวลา</span>
            <select
              className={inputCls}
              value={str("section")}
              disabled={!str("program")}
              onChange={(e) =>
                setApp((a) => (a ? { ...a, section: e.target.value, curriculum_type: "", study_plan: "" } : a))
              }
            >
              <option value="">-</option>
              {getSections(str("program_level"), str("faculty"), str("major"), str("program")).map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </label>
          <label className={labelCls}>
            <span className={captionCls}>ประเภทหลักสูตร</span>
            <select
              className={inputCls}
              value={str("curriculum_type")}
              disabled={!str("section")}
              onChange={(e) => setApp((a) => (a ? { ...a, curriculum_type: e.target.value, study_plan: "" } : a))}
            >
              <option value="">-</option>
              {getCurriculumTypes(str("program_level"), str("faculty"), str("major"), str("program"), str("section")).map(
                (o) => (
                  <option key={o} value={o}>{o}</option>
                )
              )}
            </select>
          </label>
          <label className={labelCls}>
            <span className={captionCls}>แผนการเรียน</span>
            <select
              className={inputCls}
              value={str("study_plan")}
              disabled={!str("curriculum_type")}
              onChange={(e) => set("study_plan", e.target.value)}
            >
              <option value="">-</option>
              {getPlans(
                str("program_level"),
                str("faculty"),
                str("major"),
                str("program"),
                str("section"),
                str("curriculum_type")
              ).map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </label>
          <label className={labelCls}>
            <span className={captionCls}>ประเภทการเข้าเรียน</span>
            <select className={inputCls} value={str("entry_type")} onChange={(e) => set("entry_type", e.target.value)}>
              <option value="">-</option>
              {ENTRY_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className={labelCls}>
            <span className={captionCls}>ประเภทนักศึกษา</span>
            <select className={inputCls} value={str("student_type")} onChange={(e) => set("student_type", e.target.value)}>
              <option value="">-</option>
              {STUDENT_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <h2 className="font-semibold text-slate-900 sm:col-span-2">ข้อมูลส่วนตัว</h2>
          <label className={labelCls}>
            <span className={captionCls}>คำนำหน้า</span>
            <select className={inputCls} value={str("prefix")} onChange={(e) => set("prefix", e.target.value)}>
              <option value="">-</option>
              {PREFIX_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className={labelCls}>
            <span className={captionCls}>ชื่อ (ภาษาไทย)</span>
            <input className={inputCls} value={str("first_name")} onChange={(e) => set("first_name", e.target.value)} />
          </label>
          <label className={labelCls}>
            <span className={captionCls}>นามสกุล (ภาษาไทย)</span>
            <input className={inputCls} value={str("last_name")} onChange={(e) => set("last_name", e.target.value)} />
          </label>
          <label className={labelCls}>
            <span className={captionCls}>First Name (English)</span>
            <input className={inputCls} value={str("first_name_en")} onChange={(e) => set("first_name_en", e.target.value)} />
          </label>
          <label className={labelCls}>
            <span className={captionCls}>Last Name (English)</span>
            <input className={inputCls} value={str("last_name_en")} onChange={(e) => set("last_name_en", e.target.value)} />
          </label>
          <label className={labelCls}>
            <span className={captionCls}>วันเดือนปีเกิด</span>
            <input type="date" className={inputCls} value={toDateInput(app.birth_date)} onChange={(e) => set("birth_date", e.target.value)} />
          </label>
          <label className={labelCls}>
            <span className={captionCls}>เบอร์มือถือ</span>
            <input className={inputCls} value={str("phone")} onChange={(e) => set("phone", e.target.value)} />
          </label>
          <label className={labelCls}>
            <span className={captionCls}>อีเมล</span>
            <input type="email" className={inputCls} value={str("email")} onChange={(e) => set("email", e.target.value)} />
          </label>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <h2 className="font-semibold text-slate-900 sm:col-span-2">บัตรประจำตัวประชาชน</h2>
          <label className={labelCls}>
            <span className={captionCls}>วันที่ออกบัตร</span>
            <input type="date" className={inputCls} value={toDateInput(app.id_card_issue_date)} onChange={(e) => set("id_card_issue_date", e.target.value)} />
          </label>
          <label className={labelCls}>
            <span className={captionCls}>วันที่บัตรหมดอายุ</span>
            <input type="date" className={inputCls} value={toDateInput(app.id_card_expiry_date)} onChange={(e) => set("id_card_expiry_date", e.target.value)} />
          </label>
          <label className={labelCls}>
            <span className={captionCls}>เชื้อชาติ</span>
            <input className={inputCls} value={str("ethnicity")} onChange={(e) => set("ethnicity", e.target.value)} />
          </label>
          <label className={labelCls}>
            <span className={captionCls}>สัญชาติ</span>
            <input className={inputCls} value={str("nationality")} onChange={(e) => set("nationality", e.target.value)} />
          </label>
          <label className={labelCls}>
            <span className={captionCls}>ศาสนา</span>
            <input className={inputCls} value={str("religion")} onChange={(e) => set("religion", e.target.value)} />
          </label>
          <label className={labelCls}>
            <span className={captionCls}>ผู้พิการ</span>
            <input className={inputCls} placeholder="รายละเอียด (ถ้ามี)" value={str("disability_detail")} onChange={(e) => set("disability_detail", e.target.value)} />
          </label>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <h2 className="font-semibold text-slate-900 sm:col-span-2">ทุน / การชำระเงิน</h2>
          <label className={labelCls}>
            <span className={captionCls}>ประเภททุนการศึกษา</span>
            <input className={inputCls} value={str("scholarship_type")} onChange={(e) => set("scholarship_type", e.target.value)} />
          </label>
          <label className={labelCls}>
            <span className={captionCls}>มูลค่าทุน</span>
            <input type="number" className={inputCls} value={str("scholarship_amount")} onChange={(e) => set("scholarship_amount", e.target.value)} />
          </label>
          <label className={labelCls}>
            <span className={captionCls}>ทุนกู้ยืม</span>
            <select className={inputCls} value={str("loan_type")} onChange={(e) => set("loan_type", e.target.value)}>
              <option value="">-</option>
              {LOAN_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className={labelCls}>
            <span className={captionCls}>การขึ้นทะเบียน</span>
            <select className={inputCls} value={str("registration_type")} onChange={(e) => set("registration_type", e.target.value)}>
              <option value="">-</option>
              {REGISTRATION_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className={labelCls}>
            <span className={captionCls}>จำนวนเงินที่โอน (บาท)</span>
            <input type="number" className={inputCls} value={str("payment_amount")} onChange={(e) => set("payment_amount", e.target.value)} />
          </label>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <h2 className="font-semibold text-slate-900 sm:col-span-2">วุฒิการศึกษา / ที่พัก</h2>
          <label className={labelCls}>
            <span className={captionCls}>วุฒิการศึกษาสูงสุด</span>
            <select className={inputCls} value={str("education_level")} onChange={(e) => set("education_level", e.target.value)}>
              <option value="">-</option>
              {EDUCATION_LEVEL_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className={labelCls}>
            <span className={captionCls}>จังหวัดที่ตั้งโรงเรียน/วิทยาลัย</span>
            <SearchSelect
              ariaLabel="จังหวัดที่ตั้งโรงเรียน/วิทยาลัย"
              className={inputCls}
              placeholder="พิมพ์เพื่อค้นหาจังหวัด"
              value={str("school_province")}
              onChange={(v) => setApp((a) => (a ? { ...a, school_province: v, school_name: "" } : a))}
              fetchOptions={fetchProvinceOptions}
            />
          </label>
          <label className={labelCls}>
            <span className={captionCls}>โรงเรียน/วิทยาลัย</span>
            {schoolNameManual ? (
              <input
                className={inputCls}
                placeholder="พิมพ์ชื่อโรงเรียน/วิทยาลัย"
                value={str("school_name")}
                onChange={(e) => set("school_name", e.target.value)}
              />
            ) : (
              <SearchSelect
                ariaLabel="โรงเรียน/วิทยาลัย"
                className={inputCls}
                placeholder={str("school_province") ? "พิมพ์เพื่อค้นหาโรงเรียน/วิทยาลัย" : "กรุณาเลือกจังหวัดก่อน"}
                value={str("school_name")}
                disabled={!str("school_province")}
                onChange={(v) => set("school_name", v)}
                fetchOptions={fetchSchoolOptions}
              />
            )}
            <button
              type="button"
              className="text-xs text-blue-600 hover:underline text-left mt-1"
              onClick={() => {
                setSchoolNameManual((m) => !m);
                set("school_name", "");
              }}
            >
              {schoolNameManual ? "เลือกจากรายการแทน" : "ไม่พบโรงเรียนในรายการ / พิมพ์ชื่อเอง"}
            </button>
          </label>
          <label className="flex items-center gap-2 text-sm mt-6">
            <input
              type="checkbox"
              checked={Boolean(app.dorm_needed)}
              onChange={(e) => set("dorm_needed", e.target.checked)}
            />
            ต้องการอยู่หอพักมหาวิทยาลัย
          </label>
        </section>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 sticky bottom-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 disabled:bg-slate-300 shadow-lg"
          >
            {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
          </button>
          {savedAt && <span className="text-sm text-green-600">บันทึกแล้ว</span>}
        </div>
      </main>
    </>
  );
}
