import coursesData from "./courses.json";

export type CourseRow = {
  level: string;
  faculty: string;
  major: string;
  years: string;
  section: string;
  curriculumType: string;
  plan: string;
};

export type CourseSelection = Partial<CourseRow>;

const rows = coursesData as CourseRow[];

function matches(row: CourseRow, selection: CourseSelection): boolean {
  return (Object.entries(selection) as [keyof CourseRow, string | undefined][]).every(
    ([key, value]) => !value || row[key] === value
  );
}

function uniqueValuesInOrder(key: keyof CourseRow, selection: CourseSelection): string[] {
  const values: string[] = [];
  for (const row of rows) {
    if (!matches(row, selection)) continue;
    if (!values.includes(row[key])) values.push(row[key]);
  }
  return values;
}

export function getLevels(): string[] {
  return uniqueValuesInOrder("level", {});
}

export function getFaculties(level: string): string[] {
  return uniqueValuesInOrder("faculty", { level });
}

export function getMajors(level: string, faculty: string): string[] {
  return uniqueValuesInOrder("major", { level, faculty });
}

export function getYears(level: string, faculty: string, major: string): string[] {
  return uniqueValuesInOrder("years", { level, faculty, major });
}

export function getSections(
  level: string,
  faculty: string,
  major: string,
  years: string
): string[] {
  return uniqueValuesInOrder("section", { level, faculty, major, years });
}

export function getCurriculumTypes(
  level: string,
  faculty: string,
  major: string,
  years: string,
  section: string
): string[] {
  return uniqueValuesInOrder("curriculumType", { level, faculty, major, years, section });
}

export function getPlans(
  level: string,
  faculty: string,
  major: string,
  years: string,
  section: string,
  curriculumType: string
): string[] {
  return uniqueValuesInOrder("plan", { level, faculty, major, years, section, curriculumType });
}

/** Validates that a full ระดับ->คณะ->สาขา->จำนวนปี->ช่วงเวลา->ประเภทหลักสูตร->แผนการเรียน chain matches a real course.csv row. */
export function isValidFullCourseSelection(selection: CourseRow): boolean {
  return rows.some((row) => matches(row, selection));
}
