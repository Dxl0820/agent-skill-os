import { z } from "zod";

export const installTargets = ["generic", "claude", "codex", "cursor"] as const;
export const skillCategories = ["documentation", "coding", "github", "product", "content", "research"] as const;
export const skillDifficulties = ["beginner", "intermediate", "advanced"] as const;
export const remoteSourceTypes = ["github", "url", "file"] as const;

export type InstallTarget = (typeof installTargets)[number];

const RuntimeRoutingSchema = z.object({
  primaryFor: z.array(z.string().min(1)).default([]),
  supportingFor: z.array(z.string().min(1)).default([])
});

const RuntimeContractSchema = z.object({
  maxContextFiles: z.number().int().positive().default(8),
  requiresProjectFiles: z.boolean().default(true),
  outputContract: z.array(z.string().min(1)).default(["final artifact", "assumptions", "validation checklist"]),
  failureMode: z.string().min(1).default("Ask for missing required context before generating output.")
});

const SkillSupportsSchema = z.object({
  targets: z.array(z.enum(installTargets)).optional()
});

const SkillCompatibilitySchema = z.object({
  aso: z.string().min(1).optional()
});

const SkillMetadataInputSchema = z.object({
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
  use_cases: z.array(z.string().min(1)).min(1),
  capabilities: z.array(z.string().min(1)).optional(),
  triggers: z.array(z.string().min(1)).optional(),
  conflicts: z.array(z.string().min(1)).default([]),
  compatibleWith: SkillCompatibilitySchema.optional(),
  dependencies: z.array(z.string().min(1)).default([]),
  optionalDependencies: z.array(z.string().min(1)).default([]),
  supports: SkillSupportsSchema.optional(),
  routing: RuntimeRoutingSchema.optional(),
  runtime: RuntimeContractSchema.optional()
});

export const SkillMetadataSchema = SkillMetadataInputSchema.transform((metadata) => {
  const capabilities = uniqueNonEmpty(metadata.capabilities && metadata.capabilities.length > 0 ? metadata.capabilities : [metadata.category, ...metadata.tags]);
  const triggers = uniqueNonEmpty(metadata.triggers && metadata.triggers.length > 0 ? metadata.triggers : [metadata.name, metadata.summary, ...metadata.use_cases]);
  const routing = {
    primaryFor: uniqueNonEmpty(metadata.routing?.primaryFor.length ? metadata.routing.primaryFor : metadata.use_cases),
    supportingFor: uniqueNonEmpty(metadata.routing?.supportingFor.length ? metadata.routing.supportingFor : metadata.tags)
  };
  const runtime = RuntimeContractSchema.parse(metadata.runtime || {});
  return {
    ...metadata,
    capabilities,
    triggers,
    conflicts: metadata.conflicts || [],
    compatibleWith: metadata.compatibleWith || { aso: ">=0.2.0" },
    dependencies: metadata.dependencies || [],
    optionalDependencies: metadata.optionalDependencies || [],
    supports: {
      targets: metadata.supports?.targets && metadata.supports.targets.length > 0 ? metadata.supports.targets : metadata.targets
    },
    routing,
    runtime
  };
});

export const SkillPackSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1),
  summary: z.string().min(1),
  skills: z.array(z.string().min(1)).min(1)
});

export const RemoteSkillSourceSchema = z.object({
  type: z.enum(remoteSourceTypes),
  url: z.string().min(1),
  checksum: z.string().min(1).optional()
});

export const RemoteRegistrySkillSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  version: z.string().min(1),
  name: z.string().min(1).optional(),
  summary: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  tags: z.array(z.string().min(1)).default([]),
  capabilities: z.array(z.string().min(1)).default([]),
  triggers: z.array(z.string().min(1)).default([]),
  source: RemoteSkillSourceSchema
});

export const RemoteRegistrySchema = z.object({
  version: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1).default("Agent Skill OS remote registry"),
  skills: z.array(RemoteRegistrySkillSchema).default([]),
  packs: z.array(SkillPackSchema).default([])
});

export const RegistryConfigSchema = z.object({
  version: z.string().min(1).default("0.3.0"),
  registries: z.array(
    z.object({
      name: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      url: z.string().min(1),
      refreshedAt: z.string().min(1).optional()
    })
  ).default([])
});

export const requiredSections = [
  "Role",
  "When to Use",
  "Inputs",
  "Workflow",
  "Output Format",
  "Quality Bar",
  "Runtime Contract",
  "Example Prompt",
  "Example Output",
  "Safety Notes"
] as const;

export type SkillMetadata = z.infer<typeof SkillMetadataSchema>;
export type SkillPack = z.infer<typeof SkillPackSchema>;
export type RemoteRegistry = z.infer<typeof RemoteRegistrySchema>;
export type RemoteRegistrySkill = z.infer<typeof RemoteRegistrySkillSchema>;
export type RegistryConfig = z.infer<typeof RegistryConfigSchema>;
export type RegistryConfigEntry = RegistryConfig["registries"][number];
export type RemoteSkillSource = z.infer<typeof RemoteSkillSourceSchema>;

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
  source?: InstallSource;
}

export interface InstallPackOptions {
  skills: Skill[];
  pack: SkillPack;
  target: InstallTarget;
  dir: string;
  force?: boolean;
  dryRun?: boolean;
  sources?: Record<string, InstallSource>;
}

export interface InstallResult {
  skillId: string;
  target: InstallTarget;
  writtenFiles: string[];
  skipped: boolean;
  reason?: string;
}

export interface InstallSource {
  type: "builtin" | "registry" | "url" | "file" | "github";
  registry?: string;
  url?: string;
  checksum?: string;
}

export interface UninstallSkillOptions {
  skillId: string;
  target: InstallTarget;
  dir: string;
  force?: boolean;
}

export interface UninstallResult {
  skillId: string;
  target: InstallTarget;
  removedFiles: string[];
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

function uniqueNonEmpty(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
