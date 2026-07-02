import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { getSkillTrustProfiles, loadSkills } from "../index.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("trust profiles", () => {
  it("builds marketplace trust profiles for built-in skills", async () => {
    const profiles = getSkillTrustProfiles(await loadSkills({ rootDir }));
    expect(profiles).toHaveLength(24);
    expect(profiles.every((profile) => profile.sourceLevel === "official")).toBe(true);
    expect(profiles.every((profile) => profile.quality.grade === "A")).toBe(true);
    expect(profiles.every((profile) => profile.reportUrl.includes("unsafe_skill.yml"))).toBe(true);
  });
});
