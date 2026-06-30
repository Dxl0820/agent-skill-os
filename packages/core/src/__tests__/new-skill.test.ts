import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createNewSkill, parseSkillFile, renderNewSkillTemplate, validateSkill } from "../index.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const tmpRoot = path.join(rootDir, "tmp", "new-skill-tests");

describe("new skill generator", () => {
  beforeEach(async () => {
    await fs.remove(tmpRoot);
  });

  afterEach(async () => {
    await fs.remove(tmpRoot);
  });

  it("renders a template with required sections", async () => {
    const template = renderNewSkillTemplate({ id: "my-skill", category: "coding", target: "codex" });
    expect(template).toContain("id: my-skill");
    expect(template).toContain("category: coding");
    expect(template).toContain("  - codex");
    expect(template).toContain("## Safety Notes");
  });

  it("creates a valid skill file", async () => {
    const result = await createNewSkill({ id: "my-skill", rootDir: tmpRoot, category: "coding", target: "codex" });
    const skill = await parseSkillFile(result.filePath);
    const validation = validateSkill(skill);
    expect(validation.ok).toBe(true);
    expect(skill.metadata.id).toBe("my-skill");
    expect(skill.metadata.category).toBe("coding");
    expect(skill.metadata.targets).toEqual(["codex"]);
  });

  it("does not overwrite existing skill directories without force", async () => {
    await createNewSkill({ id: "my-skill", rootDir: tmpRoot });
    await expect(createNewSkill({ id: "my-skill", rootDir: tmpRoot })).rejects.toThrow("Skill already exists");
  });

  it("overwrites when force is enabled", async () => {
    await createNewSkill({ id: "my-skill", rootDir: tmpRoot, category: "documentation" });
    await createNewSkill({ id: "my-skill", rootDir: tmpRoot, category: "coding", force: true });
    const skill = await parseSkillFile(path.join(tmpRoot, "skills", "my-skill", "SKILL.md"));
    expect(skill.metadata.category).toBe("coding");
  });
});
