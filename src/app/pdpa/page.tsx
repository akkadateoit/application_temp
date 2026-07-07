"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export const PDPA_COOKIE = "pdpa_accepted";

export default function PdpaPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);

  function handleAccept() {
    document.cookie = `${PDPA_COOKIE}=1; path=/; max-age=${60 * 60 * 24}; samesite=lax`;
    router.push("/apply");
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10">
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            มหาวิทยาลัยนอร์ทกรุงเทพ
          </h1>
          <p className="text-slate-500 mt-1">
            ระบบรับสมัครนักศึกษาระดับปริญญาตรีออนไลน์
          </p>
        </div>

        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          ประกาศเกี่ยวกับความเป็นส่วนตัว (PDPA)
        </h2>

        <div className="prose prose-sm max-w-none text-slate-700 space-y-3 max-h-80 overflow-y-auto border border-slate-200 rounded-lg p-4 bg-slate-50 text-sm leading-relaxed">
          <p>
            มหาวิทยาลัยนอร์ทกรุงเทพ (&quot;มหาวิทยาลัย&quot;) มีความจำเป็นต้องเก็บรวบรวม
            ใช้ และเปิดเผยข้อมูลส่วนบุคคลของท่าน ได้แก่ ชื่อ-นามสกุล วันเดือนปีเกิด
            เบอร์โทรศัพท์ หมายเลขบัตรประจำตัวประชาชน ข้อมูลบนบัตรประจำตัวประชาชน
            ข้อมูลการศึกษา และหลักฐานการชำระเงิน เพื่อวัตถุประสงค์ในการพิจารณา
            รับสมัครเข้าศึกษาต่อในระดับปริญญาตรี การติดต่อประสานงาน
            และการดำเนินการด้านทะเบียนนักศึกษา
          </p>
          <p>
            มหาวิทยาลัยจะเก็บรักษาข้อมูลของท่านไว้อย่างปลอดภัย
            และใช้ข้อมูลดังกล่าวเท่าที่จำเป็นตามวัตถุประสงค์ข้างต้นเท่านั้น
            โดยจะไม่เปิดเผยข้อมูลส่วนบุคคลของท่านแก่บุคคลภายนอก
            เว้นแต่เป็นไปตามที่กฎหมายกำหนด หรือได้รับความยินยอมจากท่าน
          </p>
          <p>
            ท่านมีสิทธิ์ในการเข้าถึง ขอแก้ไข หรือขอให้ลบข้อมูลส่วนบุคคลของท่าน
            ได้ตามที่กฎหมายว่าด้วยการคุ้มครองข้อมูลส่วนบุคคลกำหนด
            โดยติดต่อมายังมหาวิทยาลัยนอร์ทกรุงเทพ
          </p>
          <p>
            การกดปุ่ม &quot;ยอมรับและดำเนินการต่อ&quot; ด้านล่าง
            ถือว่าท่านได้อ่านและยินยอมให้มหาวิทยาลัยเก็บรวบรวม ใช้
            และเปิดเผยข้อมูลส่วนบุคคลของท่านตามที่ระบุไว้ข้างต้น
          </p>
        </div>

        <label className="flex items-start gap-3 mt-5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-800">
            ข้าพเจ้าได้อ่านและยอมรับเงื่อนไขการเก็บรวบรวม ใช้
            และเปิดเผยข้อมูลส่วนบุคคลตามประกาศข้างต้น
          </span>
        </label>

        <button
          type="button"
          disabled={!agreed}
          onClick={handleAccept}
          className="mt-6 w-full sm:w-auto inline-flex justify-center items-center rounded-lg bg-blue-600 px-6 py-3 text-white font-medium disabled:bg-slate-300 disabled:cursor-not-allowed enabled:hover:bg-blue-700 transition-colors"
        >
          ยอมรับและดำเนินการต่อ
        </button>
      </div>
    </main>
  );
}
