export const CAMPUS_OPTIONS = ["สะพานใหม่", "รังสิต", "นนทบุรี"] as const;
export const ENTRY_TYPE_OPTIONS = [
  "ไม่มีรายวิชาเทียบโอนต่างสถาบัน",
  "มีรายวิชาเทียบโอนต่างสถาบัน",
] as const;
export const STUDENT_TYPE_OPTIONS = ["ปกติ", "ศักยภาพ"] as const;
export const LOAN_TYPE_OPTIONS = ["ไม่กู้", "กู้ลักษณะที่ 1 (กยศ.)", "กู้ลักษณะที่ 2 (กรอ.)"] as const;
export const REGISTRATION_TYPE_OPTIONS = ["ครั้งแรก", "ชำระเพิ่ม"] as const;
export const PREFIX_OPTIONS = ["นาย", "นาง", "นางสาว"] as const;
export const EDUCATION_LEVEL_OPTIONS = ["ม.6", "ปวช.", "ปวส.", "อื่นๆ"] as const;
export const STATUS_OPTIONS = [
  { value: "pending", label: "รอตรวจสอบ" },
  { value: "approved", label: "อนุมัติ" },
  { value: "rejected", label: "ไม่อนุมัติ" },
] as const;

export function statusLabel(status: string): string {
  return STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
}
