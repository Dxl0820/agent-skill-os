import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getSkillById, installPack, installSkill, loadPacks, loadSkills } from "../index.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const tmpDir = path.join(rootDir, "tmp", "core-tests");

describe("installer", () => {
  beforeEach(async () => {
    await fs.remove(tmpDir);
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("dry-run does not write files", async () => {
    const skill = await getReadmeSkill();
    const result = await installSkill({ skill, target: "generic", dir: tmpDir, dryRun: true });
    expect(result.writtenFiles).toContain("agent-skills/readme-writer/SKILL.md");
    expect(await fs.pathExists(path.join(tmpDir, "agent-skills"))).toBe(false);
  });

  it("writes generic target files and manifest", async () => {
    const skill = await getReadmeSkill();
    await installSkill({ skill, target: "generic", dir: tmpDir });
    expect(await fs.pathExists(path.join(tmpDir, "agent-skills", "readme-writer", "SKILL.md"))).toBe(true);
    const manifest = await fs.readJson(path.join(tmpDir, ".agent-skill-os", "manifest.json"));
    expect(manifest.skills).toHaveLength(1);
    expect(manifest.skills[0].id).toBe("readme-writer");
  });

  it("does not overwrite existing files without force", async () => {
    const skill = await getReadmeSkill();
    await installSkill({ skill, target: "generic", dir: tmpDir });
    const second = await installSkill({ skill, target: "generic", dir: tmpDir });
    expect(second.skipped).toBe(true);
  });

  it("overwrites with force and keeps one manifest entry", async () => {
    const skill = await getReadmeSkill();
    await installSkill({ skill, target: "generic", dir: tmpDir });
    await installSkill({ skill, target: "generic", dir: tmpDir, force: true });
    const manifest = await fs.readJson(path.join(tmpDir, ".agent-skill-os", "manifest.json"));
    expect(manifest.skills.filter((item: { id: string }) => item.id === "readme-writer")).toHaveLength(1);
  });

  it("installs a pack", async () => {
    const skills = await loadSkills({ rootDir });
    const packs = await loadPacks({ rootDir });
    const pack = packs.find((candidate) => candidate.id === "developer-productivity");
    expect(pack).toBeDefined();
    const results = await installPack({ skills, pack: pack!, target: "generic", dir: tmpDir });
    expect(results).toHaveLength(6);
    const manifest = await fs.readJson(path.join(tmpDir, ".agent-skill-os", "manifest.json"));
    expect(manifest.skills).toHaveLength(6);
  });

  it("writes codex AGENTS.md", async () => {
    const skill = await getReadmeSkill();
    await installSkill({ skill, target: "codex", dir: tmpDir });
    expect(await fs.pathExists(path.join(tmpDir, ".codex", "skills", "readme-writer", "SKILL.md"))).toBe(true);
    expect(await fs.readFile(path.join(tmpDir, ".codex", "AGENTS.md"), "utf8")).toContain("readme-writer");
  });
});

async function getReadmeSkill() {
  const skill = getSkillById(await loadSkills({ rootDir }), "readme-writer");
  if (!skill) {
    throw new Error("missing readme-writer");
  }
  return skill;
}
