import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { buildRegistry, getSkillById, loadPacks, loadSkills } from "../index.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("registry", () => {
  it("loads skills and packs", async () => {
    const skills = await loadSkills({ rootDir });
    const packs = await loadPacks({ rootDir });
    expect(skills).toHaveLength(24);
    expect(packs).toHaveLength(4);
    expect(getSkillById(skills, "readme-writer")?.metadata.name).toBe("README Writer");
  });

  it("builds registry metadata", async () => {
    const registry = await buildRegistry({ rootDir });
    expect(registry.skills).toHaveLength(24);
    expect(registry.packs.map((pack) => pack.id)).toContain("developer-productivity");
  });
});
