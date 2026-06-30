import { execa } from "execa";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { describe, expect, it } from "vitest";

const cwd = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

describe("cli smoke", () => {
  it("runs list, search, and validate", async () => {
    await expect(execa("pnpm", ["--filter", "agent-skill-os", "dev", "list"], { cwd })).resolves.toMatchObject({ exitCode: 0 });
    await expect(execa("pnpm", ["--filter", "agent-skill-os", "dev", "search", "readme"], { cwd })).resolves.toMatchObject({ exitCode: 0 });
    await expect(execa("pnpm", ["--filter", "agent-skill-os", "dev", "validate"], { cwd })).resolves.toMatchObject({ exitCode: 0 });
  }, 30000);
});
