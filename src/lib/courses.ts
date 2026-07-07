import coursesData from "./courses.json";

export type CourseData = Record<string, Record<string, string[]>>;

const courses = coursesData as CourseData;

export function getLevels(): string[] {
  return Object.keys(courses);
}

export function getFaculties(level: string): string[] {
  return Object.keys(courses[level] ?? {});
}

export function getMajors(level: string, faculty: string): string[] {
  return courses[level]?.[faculty] ?? [];
}

export function isValidCourseSelection(
  level: string,
  faculty: string,
  major: string
): boolean {
  return getMajors(level, faculty).includes(major);
}
