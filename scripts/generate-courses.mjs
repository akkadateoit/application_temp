// Parses course.csv (ระดับ,คณะ,สาขา,จำนวนปี,ช่วงเวลา,ประเภทหลักสูตร,แผนการเรียน)
// into a nested { [level]: { [faculty]: string[] majors } } structure used by
// the cascading ระดับ -> คณะ -> สาขา dropdowns.
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

const data = {};
for (const row of rows) {
  const [level, faculty, major] = row.split(",").map((v) => v.trim());
  if (!level || !faculty || !major) continue;
  data[level] ??= {};
  data[level][faculty] ??= [];
  if (!data[level][faculty].includes(major)) {
    data[level][faculty].push(major);
  }
}

writeFileSync(outPath, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`Wrote ${outPath} with ${Object.keys(data).length} levels.`);
