import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { getSkillById, getSkillUsePrompt, loadSkills, recommendSkills } from "../index.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("runtime routing", () => {
  it("recommends skills for task text", async () => {
    const skills = await loadSkills({ rootDir });
    expect(recommendSkills(skills, "review this pull request").map((item) => item.skill.metadata.id)[0]).toBe("code-reviewer");
    expect(recommendSkills(skills, "write a README for this repo").map((item) => item.skill.metadata.id)[0]).toBe("readme-writer");
    expect(recommendSkills(skills, "prepare launch post").map((item) => item.skill.metadata.id)[0]).toBe("launch-post-writer");
  });

  it("prints target-specific use instructions", async () => {
    const skill = getSkillById(await loadSkills({ rootDir }), "readme-writer");
    expect(skill).toBeDefined();
    const prompt = getSkillUsePrompt(skill!, "codex");
    expect(prompt).toContain("Use the installed readme-writer skill.");
    expect(prompt).toContain(".codex/skills/readme-writer/SKILL.md");
    expect(prompt).toContain("runtime contract");
  });
});
