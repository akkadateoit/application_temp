import schoolsData from "./schools.json";

type SchoolRow = { province: string; school: string };

// ~16k rows — kept out of the client bundle. Only import this from API routes.
const rows = schoolsData as SchoolRow[];

const provinces = Array.from(new Set(rows.map((r) => r.province)));

export function getProvinces(query?: string): string[] {
  if (!query) return provinces;
  const q = query.trim();
  return provinces.filter((p) => p.includes(q));
}

export function getSchools(province: string, query?: string, limit = 50): string[] {
  const q = query?.trim() ?? "";
  const matches: string[] = [];
  for (const row of rows) {
    if (row.province !== province) continue;
    if (q && !row.school.includes(q)) continue;
    matches.push(row.school);
    if (matches.length >= limit) break;
  }
  return matches;
}
