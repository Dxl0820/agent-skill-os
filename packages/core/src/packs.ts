import { Skill, SkillPack, ValidationResult } from "./schema.js";

export function validatePacks(packs: SkillPack[], skills: Skill[]): ValidationResult[] {
  const ids = new Set(skills.map((skill) => skill.metadata.id));
  return packs.map((pack) => {
    const errors = pack.skills.filter((skillId) => !ids.has(skillId)).map((skillId) => "missing skill: " + skillId);
    return {
      ok: errors.length === 0,
      id: pack.id,
      errors
    };
  });
}
