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
    await expect(execa(tsxBin, [cli, "validate"], { cwd })).resolves.toMatchObject({ exitCode: 0 });
  }, 30000);

  it("creates a new skill template", async () => {
    await fs.ensureDir(tmpCwd);
    await expect(execa(tsxBin, [path.join(cwd, "packages/cli/src/index.ts"), "new-skill", "demo-cli-skill", "--category", "coding", "--target", "codex"], { cwd: tmpCwd })).resolves.toMatchObject({ exitCode: 0 });
    const content = await fs.readFile(path.join(tmpCwd, "skills", "demo-cli-skill", "SKILL.md"), "utf8");
    expect(content).toContain("id: demo-cli-skill");
    expect(content).toContain("category: coding");
    expect(content).toContain("  - codex");
  }, 30000);
});
