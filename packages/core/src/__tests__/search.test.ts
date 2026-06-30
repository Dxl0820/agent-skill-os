import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadSkills, searchSkills } from "../index.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("searchSkills", () => {
  it("searches by name, summary, and tag", async () => {
    const skills = await loadSkills({ rootDir });
    expect(searchSkills(skills, "README").map((skill) => skill.metadata.id)).toContain("readme-writer");
    expect(searchSkills(skills, "bottlenecks").map((skill) => skill.metadata.id)).toContain("performance-reviewer");
    expect(searchSkills(skills, "youtube").map((skill) => skill.metadata.id)).toContain("youtube-title-thumbnail-ideas");
  });
});
