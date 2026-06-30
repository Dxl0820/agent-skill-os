import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadPacks, loadSkills, validateAllSkills, validatePacks } from "@agent-skill-os/core";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skills = await loadSkills({ rootDir });
const packs = await loadPacks({ rootDir });
const results = [...validateAllSkills(skills), ...validatePacks(packs, skills)];
const failed = results.filter((result) => !result.ok);
if (failed.length > 0) {
  for (const result of failed) {
    console.error("Invalid " + (result.id || result.filePath || "unknown"));
    for (const error of result.errors) {
      console.error("  - " + error);
    }
  }
  process.exit(1);
}
console.log("Validated " + skills.length + " skills and " + packs.length + " packs.");
