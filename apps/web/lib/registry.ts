import registry from "../../../generated/registry.generated.json";

export type SkillMetadata = (typeof registry.skills)[number];
export type SkillPack = (typeof registry.packs)[number];

export const skills = registry.skills;
export const packs = registry.packs;

export function findSkill(id: string) {
  return skills.find((skill) => skill.id === id);
}

export function relatedSkills(skill: SkillMetadata) {
  return skills.filter((candidate) => candidate.id !== skill.id && candidate.category === skill.category).slice(0, 3);
}
