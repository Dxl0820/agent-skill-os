import { toPosixPath } from "./fs-utils.js";
import { getSkillRelativePath } from "./targets.js";
import { InstallTarget, Skill, SkillMetadata } from "./schema.js";

export const runtimeVersion = "0.2.0";

export const runtimePolicy = {
  loadAllSkillsByDefault: false,
  maxPrimarySkills: 1,
  maxSupportingSkills: 2,
  maxSkillsPerTask: 3,
  stateSkillBeforeExecution: true,
  stateSelectedSkillBeforeWork: true
} as const;

export interface RuntimeSkillEntry {
  id: string;
  name: string;
  summary: string;
  category: string;
  tags: string[];
  path: string;
  capabilities: string[];
  triggers: string[];
  conflicts: string[];
  supports: SkillMetadata["supports"];
  routing: SkillMetadata["routing"];
  runtime: SkillMetadata["runtime"];
}

export interface RuntimeRouter {
  version: string;
  target: InstallTarget;
  generatedAt: string;
  policy: typeof runtimePolicy;
  rules: RuntimeRouterRule[];
  skills: RuntimeSkillEntry[];
}

export interface RuntimeRouterRule {
  match: string[];
  primarySkill: string;
  supportingSkills: string[];
  maxSupportingSkills: number;
}

export interface SkillIndex {
  version: string;
  target: InstallTarget;
  generatedAt: string;
  skills: RuntimeSkillEntry[];
}

export interface SkillRecommendation {
  skill: Skill;
  score: number;
  reason: string;
  matched: string[];
}

export interface RecommendSkillsOptions {
  limit?: number;
}

export function getSkillUsePrompt(skill: Skill, target: InstallTarget): string {
  const skillPath = toPosixPath(getSkillRelativePath(skill.metadata.id, target));
  return [
    "Use the installed " + skill.metadata.id + " skill.",
    "",
    "Target: " + titleCase(target),
    "Skill path:",
    skillPath,
    "",
    "Ask your agent:",
    "",
    "Load " + skillPath + ".",
    "Use it for: " + skill.metadata.routing.primaryFor.join(", ") + ".",
    "Follow the skill workflow and runtime contract.",
    "Return the final artifact plus assumptions and validation notes.",
    ""
  ].join("\n");
}

export function recommendSkills(skills: Skill[], task: string, options: RecommendSkillsOptions = {}): SkillRecommendation[] {
  const limit = options.limit ?? 3;
  const normalizedTask = normalize(task);
  const taskTokens = tokenize(task);
  const recommendations = skills
    .map((skill) => scoreSkill(skill, normalizedTask, taskTokens))
    .filter((recommendation) => recommendation.score > 0)
    .sort((a, b) => b.score - a.score || a.skill.metadata.id.localeCompare(b.skill.metadata.id));

  if (recommendations.length > 0) {
    return recommendations.slice(0, limit);
  }

  return skills
    .map((skill) => ({
      skill,
      score: 0,
      reason: "Closest available skill based on registry metadata.",
      matched: []
    }))
    .sort((a, b) => a.skill.metadata.id.localeCompare(b.skill.metadata.id))
    .slice(0, limit);
}

export function buildRuntimeRouter(target: InstallTarget, skills: RuntimeSkillEntry[], generatedAt = new Date().toISOString()): RuntimeRouter {
  const sortedSkills = [...skills].sort((a, b) => a.id.localeCompare(b.id));
  return {
    version: runtimeVersion,
    target,
    generatedAt,
    policy: runtimePolicy,
    rules: sortedSkills.map((skill) => {
      const supportingSkills = defaultSupportingSkillIds(skill.id).filter((skillId) => sortedSkills.some((candidate) => candidate.id === skillId));
      return {
        match: uniqueNonEmpty([...skill.triggers, ...skill.capabilities, ...skill.routing.primaryFor]),
        primarySkill: skill.id,
        supportingSkills,
        maxSupportingSkills: Math.min(runtimePolicy.maxSupportingSkills, supportingSkills.length)
      };
    }),
    skills: sortedSkills
  };
}

export function buildSkillIndex(target: InstallTarget, skills: RuntimeSkillEntry[], generatedAt = new Date().toISOString()): SkillIndex {
  return {
    version: runtimeVersion,
    target,
    generatedAt,
    skills: [...skills].sort((a, b) => a.id.localeCompare(b.id))
  };
}

export function renderUsageMarkdown(target: InstallTarget, skills: RuntimeSkillEntry[]): string {
  const sortedSkills = [...skills].sort((a, b) => a.id.localeCompare(b.id));
  return [
    "# Agent Skill OS Runtime",
    "",
    "This project uses Agent Skill OS.",
    "",
    "## Principle",
    "",
    "Install many. Load few.",
    "",
    "Skill Pack is the installation unit. Skill is the execution unit. Router is the selection mechanism. Runtime Contract is the execution standard.",
    "",
    "## How to Use Skills",
    "",
    "Before starting a task:",
    "",
    "1. Read `.agent-skill-os/router.json`.",
    "2. Classify the user task.",
    "3. Select one primary skill.",
    "4. Load only the selected skill's `SKILL.md`.",
    "5. Load at most two supporting skills if required.",
    "6. Do not load all skills by default.",
    "7. State which skill you selected and why.",
    "8. Execute the task according to the selected skill's workflow.",
    "9. Verify the output against the skill's quality bar and runtime contract.",
    "",
    "## Installed Skills",
    "",
    "| Skill | When to use | Path |",
    "| --- | --- | --- |",
    ...sortedSkills.map((skill) => "| `" + skill.id + "` | " + tableCell(skill.routing.primaryFor[0] || skill.summary) + " | `" + skill.path + "` |"),
    "",
    "## Policy",
    "",
    "- Use one primary skill per task.",
    "- Use supporting skills only when needed.",
    "- Never combine unrelated skills.",
    "- If no skill matches, proceed normally and suggest installing a relevant skill.",
    "- Target: `" + target + "`",
    ""
  ].join("\n");
}

export function skillToRuntimeEntry(skill: Skill, target: InstallTarget): RuntimeSkillEntry {
  return metadataToRuntimeEntry(skill.metadata, toPosixPath(getSkillRelativePath(skill.metadata.id, target)));
}

export function metadataToRuntimeEntry(metadata: SkillMetadata, skillPath: string): RuntimeSkillEntry {
  return {
    id: metadata.id,
    name: metadata.name,
    summary: metadata.summary,
    category: metadata.category,
    tags: metadata.tags,
    path: skillPath,
    capabilities: metadata.capabilities,
    triggers: metadata.triggers,
    conflicts: metadata.conflicts,
    supports: metadata.supports,
    routing: metadata.routing,
    runtime: metadata.runtime
  };
}

function scoreSkill(skill: Skill, normalizedTask: string, taskTokens: Set<string>): SkillRecommendation {
  const weightedFields: Array<{ weight: number; values: string[]; label: string }> = [
    { weight: 8, values: skill.metadata.triggers, label: "trigger" },
    { weight: 7, values: skill.metadata.routing.primaryFor, label: "routing" },
    { weight: 6, values: skill.metadata.capabilities, label: "capability" },
    { weight: 4, values: skill.metadata.tags, label: "tag" },
    { weight: 3, values: [skill.metadata.name, skill.metadata.id], label: "name" },
    { weight: 2, values: [skill.metadata.summary, skill.metadata.description, ...skill.metadata.use_cases], label: "description" }
  ];
  let score = 0;
  const matched: string[] = [];
  for (const field of weightedFields) {
    for (const value of field.values) {
      const normalizedValue = normalize(value);
      if (!normalizedValue) {
        continue;
      }
      if (normalizedTask.includes(normalizedValue) || normalizedValue.includes(normalizedTask)) {
        score += field.weight * 3;
        matched.push(value);
        continue;
      }
      const valueTokens = tokenize(value);
      const overlap = [...valueTokens].filter((token) => taskTokens.has(token));
      if (overlap.length > 0) {
        score += field.weight * overlap.length;
        matched.push(value);
      }
    }
  }
  const uniqueMatches = uniqueNonEmpty(matched).slice(0, 4);
  return {
    skill,
    score,
    reason:
      uniqueMatches.length > 0
        ? "Matches task terms in " + skill.metadata.id + " metadata: " + uniqueMatches.join(", ") + "."
        : "Closest available skill based on registry metadata.",
    matched: uniqueMatches
  };
}

function defaultSupportingSkillIds(skillId: string): string[] {
  const map: Record<string, string[]> = {
    "readme-writer": ["launch-post-writer", "demo-video-planner"],
    "api-docs-writer": ["technical-decision-record", "readme-writer"],
    "changelog-writer": ["release-notes-writer", "pr-summarizer"],
    "contributing-guide-writer": ["issue-triage", "readme-writer"],
    "code-reviewer": ["test-writer", "pr-summarizer"],
    "refactor-planner": ["code-reviewer", "test-writer"],
    "test-writer": ["bug-reproducer", "code-reviewer"],
    "bug-reproducer": ["test-writer", "code-reviewer"],
    "dependency-upgrade-planner": ["test-writer", "code-reviewer"],
    "performance-reviewer": ["test-writer", "technical-decision-record"],
    "issue-triage": ["roadmap-planner", "pr-summarizer"],
    "pr-summarizer": ["code-reviewer", "release-notes-writer"],
    "release-notes-writer": ["changelog-writer", "pr-summarizer"],
    "roadmap-planner": ["user-story-mapper", "prd-writer"],
    "prd-writer": ["user-story-mapper", "roadmap-planner"],
    "landing-page-copywriter": ["launch-post-writer", "readme-writer"],
    "launch-post-writer": ["landing-page-copywriter", "readme-writer"],
    "user-story-mapper": ["prd-writer", "roadmap-planner"],
    "short-video-script-writer": ["demo-video-planner", "youtube-title-thumbnail-ideas"],
    "youtube-title-thumbnail-ideas": ["short-video-script-writer", "demo-video-planner"],
    "demo-video-planner": ["short-video-script-writer", "readme-writer"],
    "competitor-researcher": ["source-summarizer", "technical-decision-record"],
    "source-summarizer": ["competitor-researcher", "technical-decision-record"],
    "technical-decision-record": ["source-summarizer", "code-reviewer"]
  };
  return map[skillId] || [];
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function tokenize(value: string): Set<string> {
  return new Set(normalize(value).split(/\s+/).filter((token) => token.length > 1));
}

function uniqueNonEmpty(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function tableCell(value: string): string {
  return value.replace(/\|/g, "\\|");
}

function titleCase(value: string): string {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}
