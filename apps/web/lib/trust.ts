import path from "node:path";
import { loadSkills } from "@agent-skill-os/core/dist/registry.js";
import { getSkillTrustProfiles, type SkillTrustProfile } from "@agent-skill-os/core/dist/trust.js";

export async function loadTrustProfiles(): Promise<SkillTrustProfile[]> {
  return getSkillTrustProfiles(await loadSkills({ rootDir: path.join(process.cwd(), "..", "..") }));
}

export async function findTrustProfile(skillId: string): Promise<SkillTrustProfile | undefined> {
  return (await loadTrustProfiles()).find((profile) => profile.id === skillId);
}
