import { execa } from "execa";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "fs-extra";
import { afterEach, describe, expect, it } from "vitest";

const cwd = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const tmpCwd = path.join(path.dirname(cwd), "agent-skill-os-cli-new-skill-test");
const tsxBin = path.join(cwd, "node_modules", ".bin", process.platform === "win32" ? "tsx.CMD" : "tsx");

afterEach(async () => {
  await fs.remove(tmpCwd);
});

describe("cli smoke", () => {
  it("runs list, search, and validate", async () => {
    const cli = path.join(cwd, "packages/cli/src/index.ts");
    await expect(execa(tsxBin, [cli, "list"], { cwd })).resolves.toMatchObject({ exitCode: 0 });
    await expect(execa(tsxBin, [cli, "search", "readme"], { cwd })).resolves.toMatchObject({ exitCode: 0 });
    const useResult = await execa(tsxBin, [cli, "use", "readme-writer", "--target", "codex"], { cwd });
    expect(useResult.stdout).toContain(".codex/skills/readme-writer/SKILL.md");
    const recommendResult = await execa(tsxBin, [cli, "recommend", "review this pull request"], { cwd });
    expect(recommendResult.stdout).toContain("code-reviewer");
    const qualityResult = await execa(tsxBin, [cli, "quality", "--json"], { cwd });
    expect(qualityResult.stdout).toContain('"grade": "A"');
    await expect(execa(tsxBin, [cli, "validate"], { cwd })).resolves.toMatchObject({ exitCode: 0 });
  }, 60000);

  it("creates a new skill template", async () => {
    await fs.ensureDir(tmpCwd);
    await expect(execa(tsxBin, [path.join(cwd, "packages/cli/src/index.ts"), "new-skill", "demo-cli-skill", "--category", "coding", "--target", "codex"], { cwd: tmpCwd })).resolves.toMatchObject({ exitCode: 0 });
    const content = await fs.readFile(path.join(tmpCwd, "skills", "demo-cli-skill", "SKILL.md"), "utf8");
    expect(content).toContain("id: demo-cli-skill");
    expect(content).toContain("category: coding");
    expect(content).toContain("  - codex");
  }, 30000);

  it("manages installed skill state", async () => {
    await fs.ensureDir(tmpCwd);
    const cli = path.join(cwd, "packages/cli/src/index.ts");
    const demoDir = path.join(tmpCwd, "demo");
    await expect(execa(tsxBin, [cli, "install", "readme-writer", "--target", "codex", "--dir", demoDir], { cwd })).resolves.toMatchObject({ exitCode: 0 });
    expect(await fs.pathExists(path.join(demoDir, ".agent-skill-os", "skill-lock.json"))).toBe(true);
    await expect(execa(tsxBin, [cli, "lock", "--dir", demoDir], { cwd })).resolves.toMatchObject({ exitCode: 0 });
    const outdated = await execa(tsxBin, [cli, "outdated", "--target", "codex", "--dir", demoDir], { cwd });
    expect(outdated.stdout).toContain("up to date");
    await expect(execa(tsxBin, [cli, "update", "readme-writer", "--target", "codex", "--dir", demoDir], { cwd })).resolves.toMatchObject({ exitCode: 0 });
    await expect(execa(tsxBin, [cli, "uninstall", "readme-writer", "--target", "codex", "--dir", demoDir], { cwd })).resolves.toMatchObject({ exitCode: 0 });
    expect(await fs.pathExists(path.join(demoDir, ".codex", "skills", "readme-writer", "SKILL.md"))).toBe(false);
  }, 45000);

  it("manages remote registries and installs remote skills", async () => {
    await fs.ensureDir(tmpCwd);
    const remoteRoot = path.join(tmpCwd, "remote");
    const remoteSkill = path.join(remoteRoot, "skills", "readme-writer", "SKILL.md");
    const remoteRegistry = path.join(remoteRoot, "registry.json");
    await fs.ensureDir(path.dirname(remoteSkill));
    await fs.copyFile(path.join(cwd, "skills", "readme-writer", "SKILL.md"), remoteSkill);
    await fs.writeJson(
      remoteRegistry,
      {
        version: "0.3.0",
        name: "official",
        description: "CLI smoke registry",
        skills: [
          {
            id: "readme-writer",
            version: "0.2.0",
            summary: "Create README files",
            tags: ["readme"],
            source: {
              type: "file",
              url: "file:///" + remoteSkill.replace(/\\/g, "/")
            }
          }
        ],
        packs: [
          {
            id: "frontend-team",
            name: "Frontend Team",
            summary: "Frontend team skill pack",
            skills: ["readme-writer"]
          }
        ]
      },
      { spaces: 2 }
    );
    const cli = path.join(cwd, "packages/cli/src/index.ts");
    const env = { ...process.env, AGENT_SKILL_OS_HOME: tmpCwd, NO_COLOR: "1" };
    await expect(execa(tsxBin, [cli, "registry", "add", "official", remoteRegistry], { cwd, env })).resolves.toMatchObject({ exitCode: 0 });
    await expect(execa(tsxBin, [cli, "registry", "refresh"], { cwd, env })).resolves.toMatchObject({ exitCode: 0 });
    const remoteSearch = await execa(tsxBin, [cli, "search", "readme", "--remote"], { cwd, env });
    expect(remoteSearch.stdout).toContain("official/readme-writer");
    const installUrl = await execa(tsxBin, [cli, "install-url", remoteSkill, "--target", "codex", "--dir", path.join(tmpCwd, "install-url-demo")], { cwd, env });
    expect(installUrl.stdout).toContain("Source:");
    expect(await fs.pathExists(path.join(tmpCwd, "install-url-demo", ".agent-skill-os", "router.json"))).toBe(true);
    const installUrlLock = await fs.readJson(path.join(tmpCwd, "install-url-demo", ".agent-skill-os", "skill-lock.json"));
    expect(installUrlLock.skills[0].source.type).toBe("file");
    await expect(execa(tsxBin, [cli, "install", "official/readme-writer", "--target", "codex", "--dir", path.join(tmpCwd, "registry-demo")], { cwd, env })).resolves.toMatchObject({ exitCode: 0 });
    expect(await fs.pathExists(path.join(tmpCwd, "registry-demo", ".codex", "skills", "readme-writer", "SKILL.md"))).toBe(true);
    const registryLock = await fs.readJson(path.join(tmpCwd, "registry-demo", ".agent-skill-os", "skill-lock.json"));
    expect(registryLock.skills[0].source.registry).toBe("official");
    await expect(execa(tsxBin, [cli, "install-pack", "official/frontend-team", "--target", "codex", "--dir", path.join(tmpCwd, "registry-pack-demo")], { cwd, env })).resolves.toMatchObject({ exitCode: 0 });
    expect(await fs.pathExists(path.join(tmpCwd, "registry-pack-demo", ".agent-skill-os", "router.json"))).toBe(true);
    const registryPackLock = await fs.readJson(path.join(tmpCwd, "registry-pack-demo", ".agent-skill-os", "skill-lock.json"));
    expect(registryPackLock.skills[0].source.registry).toBe("official");
  }, 45000);
});
