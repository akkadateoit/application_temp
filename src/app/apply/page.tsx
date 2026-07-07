"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isValidThaiNationalId } from "@/lib/thaiId";
import {
  PROGRAM_OPTIONS,
  SECTION_OPTIONS,
  CAMPUS_OPTIONS,
  ENTRY_TYPE_OPTIONS,
  STUDENT_TYPE_OPTIONS,
  LOAN_TYPE_OPTIONS,
  REGISTRATION_TYPE_OPTIONS,
  PREFIX_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
} from "@/lib/formOptions";
import { getLevels, getFaculties, getMajors, isValidCourseSelection } from "@/lib/courses";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
      <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  full,
  required,
  children,
}: {
  label: string;
  full?: boolean;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${full ? "sm:col-span-2" : ""}`}>
      <span className="font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

function RadioGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 py-1">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={(e) => onChange(e.target.value)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
          />
          {opt}
        </label>
      ))}
    </div>
  );
}

export default function ApplyPage() {
  const router = useRouter();
  const [checkedPdpa, setCheckedPdpa] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idCardInputRef = useRef<HTMLInputElement>(null);
  const slipInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    semester: "",
    program: "",
    section: "",
    campus: "",
    programLevel: "",
    faculty: "",
    major: "",
    entryType: "",
    studentType: "",
    nationalId: "",
    hasDisability: false,
    disabilityDetail: "",
    nationality: "ไทย",
    scholarshipType: "",
    scholarshipDetail: "",
    scholarshipAmount: "",
    loanType: "",
    registrationType: "",
    registrationDetail: "",
    paymentAmount: "",
    prefix: "",
    fullName: "",
    fullNameEn: "",
    birthDate: "",
    phone: "",
    educationLevel: "",
    schoolName: "",
    schoolProvince: "",
    dormNeeded: false,
    confirmAccurate: false,
  });

  useEffect(() => {
    const hasPdpa = document.cookie
      .split("; ")
      .some((c) => c.startsWith("pdpa_accepted=1"));
    if (!hasPdpa) {
      router.replace("/pdpa");
      return;
    }
    setCheckedPdpa(true);
  }, [router]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function selectLevel(level: string) {
    setForm((f) => ({ ...f, programLevel: level, faculty: "", major: "" }));
  }

  function selectFaculty(faculty: string) {
    setForm((f) => ({ ...f, faculty, major: "" }));
  }

  function validateFile(file: File | undefined, label: string): string | null {
    if (!file) return `กรุณาแนบ${label}`;
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return `${label}ต้องเป็นไฟล์รูปภาพ JPG, PNG หรือ WEBP เท่านั้น`;
    }
    if (file.size > MAX_FILE_BYTES) {
      return `${label}มีขนาดเกิน 5MB`;
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isValidThaiNationalId(form.nationalId)) {
      setError("หมายเลขบัตรประจำตัวประชาชนไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง");
      return;
    }
    if (!/^0\d{8,9}$/.test(form.phone)) {
      setError("หมายเลขโทรศัพท์มือถือไม่ถูกต้อง");
      return;
    }
    if (!form.program || !form.section || !form.campus || !form.entryType || !form.studentType) {
      setError("กรุณากรอกข้อมูลหลักสูตรและการเข้าเรียนให้ครบถ้วน");
      return;
    }
    if (!isValidCourseSelection(form.programLevel, form.faculty, form.major)) {
      setError("กรุณาเลือกระดับ คณะ และสาขาวิชาให้ครบถ้วนและถูกต้อง");
      return;
    }
    if (!form.prefix || !form.fullName || !form.birthDate) {
      setError("กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วน");
      return;
    }
    if (!form.educationLevel) {
      setError("กรุณาเลือกวุฒิการศึกษาสูงสุด");
      return;
    }
    if (!form.paymentAmount || Number(form.paymentAmount) <= 0) {
      setError("กรุณาระบุจำนวนเงินที่โอน");
      return;
    }
    if (!form.confirmAccurate) {
      setError("กรุณายืนยันว่าข้อมูลที่กรอกถูกต้อง");
      return;
    }

    const idCardFile = idCardInputRef.current?.files?.[0];
    const slipFile = slipInputRef.current?.files?.[0];
    const idCardError = validateFile(idCardFile, "รูปบัตรประจำตัวประชาชน");
    if (idCardError) {
      setError(idCardError);
      return;
    }
    const slipError = validateFile(slipFile, "สลิปโอนเงิน");
    if (slipError) {
      setError(slipError);
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("semester", form.semester);
      fd.append("program", form.program);
      fd.append("section", form.section);
      fd.append("campus", form.campus);
      fd.append("programLevel", form.programLevel);
      fd.append("major", form.major);
      fd.append("faculty", form.faculty);
      fd.append("entryType", form.entryType);
      fd.append("studentType", form.studentType);
      fd.append("nationalId", form.nationalId);
      fd.append("hasDisability", String(form.hasDisability));
      fd.append("disabilityDetail", form.disabilityDetail);
      fd.append("nationality", form.nationality);
      fd.append("scholarshipType", form.scholarshipType);
      fd.append("scholarshipDetail", form.scholarshipDetail);
      fd.append("scholarshipAmount", form.scholarshipAmount);
      fd.append("loanType", form.loanType);
      fd.append("registrationType", form.registrationType);
      fd.append("registrationDetail", form.registrationDetail);
      fd.append("paymentAmount", form.paymentAmount);
      fd.append("prefix", form.prefix);
      fd.append("fullName", form.fullName);
      fd.append("fullNameEn", form.fullNameEn);
      fd.append("birthDate", form.birthDate);
      fd.append("phone", form.phone);
      fd.append("educationLevel", form.educationLevel);
      fd.append("schoolName", form.schoolName);
      fd.append("schoolProvince", form.schoolProvince);
      fd.append("dormNeeded", String(form.dormNeeded));
      fd.append("idCardFile", idCardFile as File);
      fd.append("paymentSlipFile", slipFile as File);

      const res = await fetch("/api/applications", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        setSubmitting(false);
        return;
      }
      router.push(`/apply/success?nationalId=${encodeURIComponent(form.nationalId)}`);
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
      setSubmitting(false);
    }
  }

  if (!checkedPdpa) return null;

  return (
    <main className="flex-1 px-4 py-8 sm:py-10">
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-5">
        <div className="text-center mb-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            ใบสมัครเรียนระดับปริญญาตรี (ฉบับย่อ)
          </h1>
          <p className="text-slate-500 mt-1">มหาวิทยาลัยนอร์ทกรุงเทพ</p>
        </div>

        <Section title="ข้อมูลการสมัคร">
          <Field label="ภาคเรียนที่เข้าศึกษา" full>
            <input
              className={inputCls}
              placeholder="เช่น 1/2569"
              value={form.semester}
              onChange={(e) => update("semester", e.target.value)}
            />
          </Field>
          <Field label="หลักสูตรปริญญาตรี" full required>
            <RadioGroup name="program" options={PROGRAM_OPTIONS} value={form.program} onChange={(v) => update("program", v)} />
          </Field>
          <Field label="ภาค" full required>
            <RadioGroup name="section" options={SECTION_OPTIONS} value={form.section} onChange={(v) => update("section", v)} />
          </Field>
          <Field label="วิทยาเขต" full required>
            <RadioGroup name="campus" options={CAMPUS_OPTIONS} value={form.campus} onChange={(v) => update("campus", v)} />
          </Field>
          <Field label="ระดับ" required>
            <select aria-label="ระดับ" className={inputCls} value={form.programLevel} onChange={(e) => selectLevel(e.target.value)}>
              <option value="">-- เลือกระดับ --</option>
              {getLevels().map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </Field>
          <Field label="คณะ" required>
            <select
              aria-label="คณะ"
              className={inputCls}
              value={form.faculty}
              disabled={!form.programLevel}
              onChange={(e) => selectFaculty(e.target.value)}
            >
              <option value="">-- เลือกคณะ --</option>
              {getFaculties(form.programLevel).map((faculty) => (
                <option key={faculty} value={faculty}>{faculty}</option>
              ))}
            </select>
          </Field>
          <Field label="สาขาวิชา" full required>
            <select
              aria-label="สาขาวิชา"
              className={inputCls}
              value={form.major}
              disabled={!form.faculty}
              onChange={(e) => update("major", e.target.value)}
            >
              <option value="">-- เลือกสาขาวิชา --</option>
              {getMajors(form.programLevel, form.faculty).map((major) => (
                <option key={major} value={major}>{major}</option>
              ))}
            </select>
          </Field>
          <Field label="ประเภทการเข้าเรียน" full required>
            <RadioGroup name="entryType" options={ENTRY_TYPE_OPTIONS} value={form.entryType} onChange={(v) => update("entryType", v)} />
          </Field>
          <Field label="ประเภทนักศึกษา" full required>
            <RadioGroup name="studentType" options={STUDENT_TYPE_OPTIONS} value={form.studentType} onChange={(v) => update("studentType", v)} />
          </Field>
        </Section>

        <Section title="ข้อมูลส่วนตัว">
          <Field label="คำนำหน้า" required>
            <RadioGroup name="prefix" options={PREFIX_OPTIONS} value={form.prefix} onChange={(v) => update("prefix", v)} />
          </Field>
          <Field label="ชื่อ-นามสกุล" required>
            <input className={inputCls} value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
          </Field>
          <Field label="ชื่อ-นามสกุล (ภาษาอังกฤษ)">
            <input className={inputCls} value={form.fullNameEn} onChange={(e) => update("fullNameEn", e.target.value)} />
          </Field>
          <Field label="วันเดือนปีเกิด" required>
            <input type="date" className={inputCls} value={form.birthDate} onChange={(e) => update("birthDate", e.target.value)} />
          </Field>
          <Field label="เบอร์มือถือ" required>
            <input className={inputCls} placeholder="0812345678" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </Field>
        </Section>

        <Section title="ข้อมูลบัตรประจำตัวประชาชน">
          <Field label="หมายเลขบัตรประจำตัวประชาชน" full required>
            <input
              className={inputCls}
              inputMode="numeric"
              maxLength={13}
              placeholder="13 หลัก"
              value={form.nationalId}
              onChange={(e) => update("nationalId", e.target.value.replace(/\D/g, ""))}
            />
          </Field>
          <Field label="สัญชาติ">
            <input className={inputCls} value={form.nationality} onChange={(e) => update("nationality", e.target.value)} />
          </Field>
          <Field label="เป็นผู้พิการ" full>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={!form.hasDisability} onChange={() => update("hasDisability", false)} /> ไม่เป็น
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={form.hasDisability} onChange={() => update("hasDisability", true)} /> เป็น
              </label>
              {form.hasDisability && (
                <input
                  className={inputCls + " flex-1"}
                  placeholder="ระบุรายละเอียด"
                  value={form.disabilityDetail}
                  onChange={(e) => update("disabilityDetail", e.target.value)}
                />
              )}
            </div>
          </Field>
        </Section>

        <Section title="ทุนการศึกษา / ทุนกู้ยืม">
          <Field label="ประเภททุนการศึกษา">
            <input className={inputCls} placeholder="ไม่มีให้เว้นว่าง" value={form.scholarshipType} onChange={(e) => update("scholarshipType", e.target.value)} />
          </Field>
          <Field label="มูลค่าทุน (บาท)">
            <input type="number" min="0" className={inputCls} value={form.scholarshipAmount} onChange={(e) => update("scholarshipAmount", e.target.value)} />
          </Field>
          <Field label="ทุนกู้ยืมเพื่อการศึกษา" full>
            <RadioGroup name="loanType" options={LOAN_TYPE_OPTIONS} value={form.loanType} onChange={(v) => update("loanType", v)} />
          </Field>
        </Section>

        <Section title="การขึ้นทะเบียน / การชำระเงิน">
          <Field label="การขึ้นทะเบียน" full>
            <RadioGroup name="registrationType" options={REGISTRATION_TYPE_OPTIONS} value={form.registrationType} onChange={(v) => update("registrationType", v)} />
          </Field>
          {form.registrationType === "ชำระเพิ่ม" && (
            <Field label="รายการค่าใช้จ่ายที่ออกใบเสร็จ" full>
              <input className={inputCls} value={form.registrationDetail} onChange={(e) => update("registrationDetail", e.target.value)} />
            </Field>
          )}
          <Field label="จำนวนเงินที่โอน (บาท)" required>
            <input
              type="number"
              min="0"
              step="0.01"
              className={inputCls}
              value={form.paymentAmount}
              onChange={(e) => update("paymentAmount", e.target.value)}
            />
          </Field>
        </Section>

        <Section title="วุฒิการศึกษา / ที่พัก">
          <Field label="วุฒิการศึกษาสูงสุด" full required>
            <RadioGroup name="educationLevel" options={EDUCATION_LEVEL_OPTIONS} value={form.educationLevel} onChange={(v) => update("educationLevel", v)} />
          </Field>
          <Field label="โรงเรียน/วิทยาลัย">
            <input className={inputCls} value={form.schoolName} onChange={(e) => update("schoolName", e.target.value)} />
          </Field>
          <Field label="จังหวัด">
            <input className={inputCls} value={form.schoolProvince} onChange={(e) => update("schoolProvince", e.target.value)} />
          </Field>
          <Field label="ที่พักระหว่างการศึกษา" full>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={form.dormNeeded} onChange={() => update("dormNeeded", true)} /> ต้องการอยู่หอพักมหาวิทยาลัย
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={!form.dormNeeded} onChange={() => update("dormNeeded", false)} /> ไม่ต้องการอยู่หอพักมหาวิทยาลัย
              </label>
            </div>
          </Field>
        </Section>

        <Section title="เอกสารแนบ">
          <Field label="รูปถ่ายบัตรประจำตัวประชาชน" full required>
            <input
              ref={idCardInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-blue-700 file:font-medium"
            />
          </Field>
          <Field label="รูปสลิปโอนเงินค่าสมัคร" full required>
            <input
              ref={slipInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-blue-700 file:font-medium"
            />
          </Field>
          <p className="text-xs text-slate-500 sm:col-span-2">
            รองรับไฟล์ JPG, PNG, WEBP ขนาดไม่เกิน 5MB ต่อไฟล์
          </p>
        </Section>

        <label className="flex items-start gap-3 bg-white rounded-xl border border-slate-200 p-4 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.confirmAccurate}
            onChange={(e) => update("confirmAccurate", e.target.checked)}
            className="mt-0.5 h-5 w-5 text-blue-600"
          />
          ข้าพเจ้าขอรับรองว่าข้อมูลที่กรอกข้างต้นถูกต้องและเป็นความจริงทุกประการ
        </label>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-blue-600 py-3 text-white font-medium hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
        >
          {submitting ? "กำลังส่งใบสมัคร..." : "ส่งใบสมัคร"}
        </button>
      </form>
    </main>
  );
}
