import { assessSkillQuality, type SkillQualityReport } from "./quality.js";
import type { Skill } from "./schema.js";

export type TrustSourceLevel = "official" | "community" | "private";

export interface SkillTrustProfile {
  id: string;
  publisher: string;
  license: string;
  sourceLevel: TrustSourceLevel;
  sourceLabel: string;
  quality: SkillQualityReport;
  reportUrl: string;
}

const repositoryUrl = "https://github.com/Dxl0820/agent-skill-os";

export function getSkillTrustProfile(skill: Skill): SkillTrustProfile {
  const quality = assessSkillQuality(skill);
  const sourceLevel = getSourceLevel(skill);
  return {
    id: skill.metadata.id,
    publisher: skill.metadata.author,
    license: skill.metadata.license,
    sourceLevel,
    sourceLabel: sourceLevel === "official" ? "Agent Skill OS official registry" : "Community registry",
    quality,
    reportUrl: `${repositoryUrl}/issues/new?template=unsafe_skill.yml&title=${encodeURIComponent("[Skill Safety] " + skill.metadata.id)}`
  };
}

export function getSkillTrustProfiles(skills: Skill[]): SkillTrustProfile[] {
  return skills.map(getSkillTrustProfile).sort((a, b) => a.id.localeCompare(b.id));
}

function getSourceLevel(skill: Skill): TrustSourceLevel {
  if (skill.metadata.author === "Agent Skill OS") {
    return "official";
  }
  if (/private|internal/i.test(skill.metadata.tags.join(" ") + " " + skill.metadata.summary)) {
    return "private";
  }
  return "community";
}
