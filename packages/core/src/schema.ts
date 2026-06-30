import { z } from "zod";

export const installTargets = ["generic", "claude", "codex", "cursor"] as const;
export const skillCategories = ["documentation", "coding", "github", "product", "content", "research"] as const;
export const skillDifficulties = ["beginner", "intermediate", "advanced"] as const;

export type InstallTarget = (typeof installTargets)[number];

export const SkillMetadataSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1),
  summary: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(skillCategories),
  tags: z.array(z.string().min(1)).min(1),
  targets: z.array(z.enum(installTargets)).min(1),
  difficulty: z.enum(skillDifficulties),
  version: z.string().min(1),
  author: z.string().min(1),
  license: z.string().min(1),
  inputs: z.array(z.string().min(1)).min(1),
  outputs: z.array(z.string().min(1)).min(1),
  use_cases: z.array(z.string().min(1)).min(1)
});

export const SkillPackSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1),
  summary: z.string().min(1),
  skills: z.array(z.string().min(1)).min(1)
});

export const requiredSections = [
  "Role",
  "When to Use",
  "Inputs",
  "Workflow",
  "Output Format",
  "Quality Bar",
  "Example Prompt",
  "Example Output",
  "Safety Notes"
] as const;

export type SkillMetadata = z.infer<typeof SkillMetadataSchema>;
export type SkillPack = z.infer<typeof SkillPackSchema>;

export interface Skill {
  metadata: SkillMetadata;
  body: string;
  raw: string;
  filePath: string;
}

export interface ValidationResult {
  ok: boolean;
  id?: string;
  filePath?: string;
  errors: string[];
}

export interface Registry {
  generatedAt: string;
  skills: SkillMetadata[];
  packs: SkillPack[];
}

export interface LoadSkillsOptions {
  rootDir?: string;
}

export interface LoadPacksOptions {
  rootDir?: string;
}

export interface BuildRegistryOptions {
  rootDir?: string;
}

export interface InstallSkillOptions {
  skill: Skill;
  target: InstallTarget;
  dir: string;
  force?: boolean;
  dryRun?: boolean;
}

export interface InstallPackOptions {
  skills: Skill[];
  pack: SkillPack;
  target: InstallTarget;
  dir: string;
  force?: boolean;
  dryRun?: boolean;
}

export interface InstallResult {
  skillId: string;
  target: InstallTarget;
  writtenFiles: string[];
  skipped: boolean;
  reason?: string;
}

export interface NewSkillOptions {
  id: string;
  rootDir?: string;
  category?: (typeof skillCategories)[number];
  target?: InstallTarget;
  force?: boolean;
}

export interface NewSkillResult {
  skillId: string;
  filePath: string;
  created: boolean;
}
