import path from "node:path";
import fg from "fast-glob";
import fs from "fs-extra";
import { findWorkspaceRoot } from "./fs-utils.js";
import { parseSkillFile } from "./parser.js";
import { BuildRegistryOptions, LoadPacksOptions, LoadSkillsOptions, Registry, Skill, SkillPack, SkillPackSchema } from "./schema.js";

export async function loadSkills(options: LoadSkillsOptions = {}): Promise<Skill[]> {
  const rootDir = options.rootDir ? path.resolve(options.rootDir) : findWorkspaceRoot();
  const entries = await fg("skills/*/SKILL.md", { cwd: rootDir, absolute: true });
  const skills = await Promise.all(entries.sort().map((entry) => parseSkillFile(entry)));
  return skills.sort((a, b) => a.metadata.id.localeCompare(b.metadata.id));
}

export async function loadPacks(options: LoadPacksOptions = {}): Promise<SkillPack[]> {
  const rootDir = options.rootDir ? path.resolve(options.rootDir) : findWorkspaceRoot();
  const entries = await fg("packs/*.json", { cwd: rootDir, absolute: true });
  const packs: SkillPack[] = [];
  for (const entry of entries.sort()) {
    const raw = await fs.readFile(entry, "utf8");
    packs.push(SkillPackSchema.parse(JSON.parse(raw)));
  }
  return packs.sort((a, b) => a.id.localeCompare(b.id));
}

export function searchSkills(skills: Skill[], query: string): Skill[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return skills;
  }
  return skills.filter((skill) => {
    const haystack = [
      skill.metadata.id,
      skill.metadata.name,
      skill.metadata.summary,
      skill.metadata.description,
      skill.metadata.category,
      skill.metadata.difficulty,
      ...skill.metadata.tags
    ].join(" ").toLowerCase();
    return haystack.includes(normalized);
  });
}

export function getSkillById(skills: Skill[], id: string): Skill | undefined {
  return skills.find((skill) => skill.metadata.id === id);
}

export async function buildRegistry(options: BuildRegistryOptions = {}): Promise<Registry> {
  const [skills, packs] = await Promise.all([loadSkills(options), loadPacks(options)]);
  return {
    generatedAt: new Date().toISOString(),
    skills: skills.map((skill) => skill.metadata),
    packs
  };
}
