// Parses course.csv (ระดับ,คณะ,สาขา,จำนวนปี,ช่วงเวลา,ประเภทหลักสูตร,แผนการเรียน)
// into a flat array of row objects used to drive the 7-level cascading
// ระดับ -> คณะ -> สาขา -> จำนวนปี -> ช่วงเวลา -> ประเภทหลักสูตร -> แผนการเรียน dropdowns.
// Usage: node scripts/generate-courses.mjs
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const csvPath = path.join(rootDir, "course.csv");
const outPath = path.join(rootDir, "src", "lib", "courses.json");

const raw = readFileSync(csvPath, "utf8").replace(/^﻿/, "");
const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
const [, ...rows] = lines; // drop header

const seen = new Set();
const data = [];
for (const row of rows) {
  const [level, faculty, major, years, section, curriculumType, plan] = row
    .split(",")
    .map((v) => v.trim());
  if (!level || !faculty || !major || !years || !section || !curriculumType || !plan) continue;
  const key = JSON.stringify([level, faculty, major, years, section, curriculumType, plan]);
  if (seen.has(key)) continue;
  seen.add(key);
  data.push({ level, faculty, major, years, section, curriculumType, plan });
}

writeFileSync(outPath, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`Wrote ${outPath} with ${data.length} rows.`);
