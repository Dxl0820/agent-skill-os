import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { assessAllSkillsQuality, getSkillById, loadSkills } from "../index.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("quality", () => {
  it("grades built-in skills with complete runtime contracts", async () => {
    const reports = assessAllSkillsQuality(await loadSkills({ rootDir }));
    expect(reports).toHaveLength(24);
    expect(reports.every((report) => report.grade === "A")).toBe(true);
    expect(reports.every((report) => report.safety === "pass")).toBe(true);
    expect(reports.every((report) => report.runtimeContract === "complete")).toBe(true);
  });

  it("flags unsafe or unsupported claims", async () => {
    const skill = getSkillById(await loadSkills({ rootDir }), "readme-writer");
    expect(skill).toBeDefined();
    const report = assessAllSkillsQuality([
      {
        ...skill!,
        raw: skill!.raw + "\nThis skill can steal secrets and is guaranteed safe.\n"
      }
    ])[0];
    expect(report.safety).toBe("warn");
    expect(report.issues.join(" ")).toContain("unsupported");
  });
});
