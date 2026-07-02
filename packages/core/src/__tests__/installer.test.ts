import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getSkillById, installPack, installSkill, listOutdatedSkills, loadPacks, loadSkills, rebuildSkillLock, uninstallSkill } from "../index.js";

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
    const router = await fs.readJson(path.join(tmpDir, ".agent-skill-os", "router.json"));
    expect(router.version).toBe("0.2.0");
    expect(router.policy.loadAllSkillsByDefault).toBe(false);
    expect(router.skills[0].capabilities).toContain("readme");
    expect(router.skills[0].supports.targets).toContain("generic");
    expect(router.skills[0].conflicts).toEqual([]);
    const skillIndex = await fs.readJson(path.join(tmpDir, ".agent-skill-os", "skill-index.json"));
    expect(skillIndex.skills[0].path).toBe("agent-skills/readme-writer/SKILL.md");
    expect(skillIndex.skills[0].compatibleWith.aso).toBe(">=0.2.0");
    expect(skillIndex.skills[0].dependencies).toEqual([]);
    const lock = await fs.readJson(path.join(tmpDir, ".agent-skill-os", "skill-lock.json"));
    expect(lock.version).toBe("0.7.0");
    expect(lock.skills[0].source.type).toBe("builtin");
    expect(lock.skills[0].path).toBe("agent-skills/readme-writer/SKILL.md");
    expect(await fs.readFile(path.join(tmpDir, ".agent-skill-os", "usage.md"), "utf8")).toContain("Install many. Load few.");
  });

  it("does not overwrite existing files without force", async () => {
    const skill = await getReadmeSkill();
    await installSkill({ skill, target: "generic", dir: tmpDir });
    const second = await installSkill({ skill, target: "generic", dir: tmpDir });
    expect(second.skipped).toBe(true);
  });

  it("refreshes runtime files for existing skills without overwriting the skill file", async () => {
    const skill = await getReadmeSkill();
    await installSkill({ skill, target: "generic", dir: tmpDir });
    const skillPath = path.join(tmpDir, "agent-skills", "readme-writer", "SKILL.md");
    await fs.writeFile(skillPath, "local edits", "utf8");
    await fs.remove(path.join(tmpDir, ".agent-skill-os", "router.json"));
    await fs.remove(path.join(tmpDir, ".agent-skill-os", "skill-index.json"));
    await fs.remove(path.join(tmpDir, ".agent-skill-os", "usage.md"));
    await fs.writeJson(
      path.join(tmpDir, ".agent-skill-os", "manifest.json"),
      {
        version: "0.1.2",
        target: "generic",
        installedAt: "2026-01-01T00:00:00.000Z",
        skills: [
          {
            id: "readme-writer",
            version: "0.1.2",
            target: "generic",
            path: "agent-skills/readme-writer/SKILL.md",
            installedAt: "2026-01-01T00:00:00.000Z"
          }
        ]
      },
      { spaces: 2 }
    );

    const second = await installSkill({ skill, target: "generic", dir: tmpDir });

    expect(second.skipped).toBe(true);
    expect(await fs.readFile(skillPath, "utf8")).toBe("local edits");
    const manifest = await fs.readJson(path.join(tmpDir, ".agent-skill-os", "manifest.json"));
    expect(manifest.version).toBe("0.2.0");
    expect(manifest.skills[0].capabilities).toContain("readme");
    expect(manifest.skills[0].source.type).toBe("builtin");
    const router = await fs.readJson(path.join(tmpDir, ".agent-skill-os", "router.json"));
    expect(router.version).toBe("0.2.0");
    expect(router.skills[0].runtime.outputContract).toContain("README.md draft");
    const lock = await fs.readJson(path.join(tmpDir, ".agent-skill-os", "skill-lock.json"));
    expect(lock.skills[0].version).toBe(skill.metadata.version);
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
    const lock = await fs.readJson(path.join(tmpDir, ".agent-skill-os", "skill-lock.json"));
    expect(lock.skills).toHaveLength(6);
  });

  it("installs required pack dependencies first", async () => {
    const readme = await getReadmeSkill();
    const dependent = {
      ...readme,
      metadata: {
        ...readme.metadata,
        id: "dependent-skill",
        name: "Dependent Skill",
        dependencies: ["readme-writer"]
      },
      filePath: path.join(rootDir, "skills", "dependent-skill", "SKILL.md")
    };
    const results = await installPack({
      skills: [dependent, readme],
      pack: {
        id: "dependency-pack",
        name: "Dependency Pack",
        summary: "Tests dependency-first pack installation.",
        skills: ["dependent-skill"]
      },
      target: "generic",
      dir: tmpDir
    });
    expect(results.map((result) => result.skillId)).toEqual(["readme-writer", "dependent-skill"]);
    const manifest = await fs.readJson(path.join(tmpDir, ".agent-skill-os", "manifest.json"));
    expect(manifest.skills.map((skill: { id: string }) => skill.id).sort()).toEqual(["dependent-skill", "readme-writer"]);
  });

  it("uninstalls a skill and refreshes lock and runtime files", async () => {
    const skill = await getReadmeSkill();
    await installSkill({ skill, target: "generic", dir: tmpDir });
    const result = await uninstallSkill({ skillId: "readme-writer", target: "generic", dir: tmpDir });
    expect(result.skipped).toBe(false);
    expect(await fs.pathExists(path.join(tmpDir, "agent-skills", "readme-writer", "SKILL.md"))).toBe(false);
    const manifest = await fs.readJson(path.join(tmpDir, ".agent-skill-os", "manifest.json"));
    expect(manifest.skills).toEqual([]);
    const lock = await fs.readJson(path.join(tmpDir, ".agent-skill-os", "skill-lock.json"));
    expect(lock.skills).toEqual([]);
    const router = await fs.readJson(path.join(tmpDir, ".agent-skill-os", "router.json"));
    expect(router.skills).toEqual([]);
  });

  it("detects outdated built-in skills and rebuilds the lockfile", async () => {
    const skill = await getReadmeSkill();
    await installSkill({ skill, target: "generic", dir: tmpDir });
    const manifestPath = path.join(tmpDir, ".agent-skill-os", "manifest.json");
    const manifest = await fs.readJson(manifestPath);
    manifest.skills[0].version = "0.0.1";
    await fs.writeJson(manifestPath, manifest, { spaces: 2 });

    const outdated = await listOutdatedSkills({ dir: tmpDir, target: "generic", skills: await loadSkills({ rootDir }) });
    expect(outdated).toEqual([
      expect.objectContaining({
        id: "readme-writer",
        currentVersion: "0.0.1",
        latestVersion: skill.metadata.version
      })
    ]);

    await rebuildSkillLock(tmpDir);
    const lock = await fs.readJson(path.join(tmpDir, ".agent-skill-os", "skill-lock.json"));
    expect(lock.skills[0].version).toBe("0.0.1");
  });

  it("writes codex AGENTS.md", async () => {
    const skill = await getReadmeSkill();
    await installSkill({ skill, target: "codex", dir: tmpDir });
    expect(await fs.pathExists(path.join(tmpDir, ".codex", "skills", "readme-writer", "SKILL.md"))).toBe(true);
    const agents = await fs.readFile(path.join(tmpDir, ".codex", "AGENTS.md"), "utf8");
    expect(agents).toContain("Read `.agent-skill-os/router.json`.");
    expect(agents).toContain("Do not load every installed skill by default.");
    expect(agents).toContain("readme-writer");
  });

  it("writes target loader instructions for claude and cursor", async () => {
    const skill = await getReadmeSkill();
    await installSkill({ skill, target: "claude", dir: path.join(tmpDir, "claude") });
    await installSkill({ skill, target: "cursor", dir: path.join(tmpDir, "cursor") });
    const claude = await fs.readFile(path.join(tmpDir, "claude", ".claude", "CLAUDE.md"), "utf8");
    const cursor = await fs.readFile(path.join(tmpDir, "cursor", ".cursor", "rules", "agent-skill-os.mdc"), "utf8");
    expect(claude).toContain("Read `.agent-skill-os/router.json`.");
    expect(cursor).toContain("alwaysApply: true");
    expect(cursor).toContain("Install many. Load few.");
  });
});

async function getReadmeSkill() {
  const skill = getSkillById(await loadSkills({ rootDir }), "readme-writer");
  if (!skill) {
    throw new Error("missing readme-writer");
  }
  return skill;
}
