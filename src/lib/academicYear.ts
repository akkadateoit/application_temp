export const SEMESTER_TERM_OPTIONS = ["1", "2", "3"] as const;

export function getCurrentBuddhistYear(): number {
  return new Date().getFullYear() + 543;
}

/** Current Thai academic year plus the next two. */
export function getAcademicYearOptions(): number[] {
  const start = getCurrentBuddhistYear();
  return [start, start + 1, start + 2];
}
