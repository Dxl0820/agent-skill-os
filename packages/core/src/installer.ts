import path from "node:path";
import fs from "fs-extra";
import { getSkillRelativePath, renderSkillForTarget } from "./targets.js";
import { toPosixPath } from "./fs-utils.js";
import { buildRuntimeRouter, buildSkillIndex, metadataToRuntimeEntry, renderUsageMarkdown, runtimeVersion, type RuntimeSkillEntry } from "./runtime.js";
import { InstallPackOptions, InstallResult, InstallSkillOptions, InstallTarget, SkillMetadata } from "./schema.js";

interface ManifestSkill {
  id: string;
  version: string;
  target: InstallTarget;
  path: string;
  installedAt: string;
  name?: string;
  summary?: string;
  category?: string;
  tags?: string[];
  capabilities?: string[];
  triggers?: string[];
  conflicts?: string[];
  supports?: SkillMetadata["supports"];
  routing?: SkillMetadata["routing"];
  runtime?: SkillMetadata["runtime"];
}

interface Manifest {
  version: string;
  target: InstallTarget;
  installedAt: string;
  skills: ManifestSkill[];
}

const manifestVersion = runtimeVersion;

export async function installSkill(options: InstallSkillOptions): Promise<InstallResult> {
  const targetDir = path.resolve(options.dir);
  const relativePath = getSkillRelativePath(options.skill.metadata.id, options.target);
  const outputPath = path.join(targetDir, relativePath);
  const manifestPath = path.join(targetDir, ".agent-skill-os", "manifest.json");
  const runtimeFiles = getRuntimeWrittenFiles(options.target);
  const plannedFiles = [toPosixPath(relativePath), ...runtimeFiles];

  const manifest = await readManifest(manifestPath, options.target);
  const alreadyInManifest = manifest.skills.some((item) => item.id === options.skill.metadata.id && item.target === options.target);
  const outputExists = await fs.pathExists(outputPath);
  if ((alreadyInManifest || outputExists) && !options.force) {
    if (!options.dryRun) {
      refreshManifestSkill(manifest, options.skill.metadata, options.target, relativePath);
      await writeManifest(manifestPath, manifest);
      const targetSkills = manifest.skills.filter((item) => item.target === options.target);
      await writeRuntimeFiles(targetDir, options.target, targetSkills);
      await writeTargetLoader(targetDir, options.target, targetSkills);
    }
    return {
      skillId: options.skill.metadata.id,
      target: options.target,
      writtenFiles: options.dryRun ? [] : runtimeFiles,
      skipped: true,
      reason: "already installed. Refreshed runtime files; use --force to overwrite the skill file"
    };
  }

  if (options.dryRun) {
    return {
      skillId: options.skill.metadata.id,
      target: options.target,
      writtenFiles: plannedFiles,
      skipped: false
    };
  }

  await fs.ensureDir(path.dirname(outputPath));
  await fs.writeFile(outputPath, renderSkillForTarget(options.skill, options.target), "utf8");
  const installedAt = new Date().toISOString();
  manifest.version = manifestVersion;
  manifest.target = options.target;
  manifest.skills = manifest.skills.filter((item) => !(item.id === options.skill.metadata.id && item.target === options.target));
  manifest.skills.push(createManifestSkill(options.skill.metadata, options.target, relativePath, installedAt));
  manifest.skills.sort((a, b) => a.id.localeCompare(b.id));
  await writeManifest(manifestPath, manifest);
  await writeRuntimeFiles(targetDir, options.target, manifest.skills.filter((item) => item.target === options.target));
  await writeTargetLoader(targetDir, options.target, manifest.skills.filter((item) => item.target === options.target));

  return {
    skillId: options.skill.metadata.id,
    target: options.target,
    writtenFiles: plannedFiles,
    skipped: false
  };
}

export async function initializeAgentSkillOS(target: InstallTarget, dir: string): Promise<void> {
  const targetDir = path.resolve(dir);
  const manifestPath = path.join(targetDir, ".agent-skill-os", "manifest.json");
  await writeManifest(manifestPath, {
    version: manifestVersion,
    target,
    installedAt: new Date().toISOString(),
    skills: []
  });
  await writeRuntimeFiles(targetDir, target, []);
  if (target === "generic") await fs.ensureDir(path.join(targetDir, "agent-skills"));
  if (target === "claude") await fs.ensureDir(path.join(targetDir, ".claude", "skills"));
  if (target === "codex") {
    await fs.ensureDir(path.join(targetDir, ".codex", "skills"));
  }
  if (target === "cursor") await fs.ensureDir(path.join(targetDir, ".cursor", "rules"));
  await writeTargetLoader(targetDir, target, []);
}

export async function installPack(options: InstallPackOptions): Promise<InstallResult[]> {
  const results: InstallResult[] = [];
  for (const skillId of options.pack.skills) {
    const skill = options.skills.find((candidate) => candidate.metadata.id === skillId);
    if (!skill) {
      throw new Error("Pack " + options.pack.id + " references missing skill: " + skillId);
    }
    results.push(await installSkill({
      skill,
      target: options.target,
      dir: options.dir,
      force: options.force,
      dryRun: options.dryRun
    }));
  }
  return results;
}

async function readManifest(manifestPath: string, target: InstallTarget): Promise<Manifest> {
  if (!(await fs.pathExists(manifestPath))) {
    return {
      version: manifestVersion,
      target,
      installedAt: new Date().toISOString(),
      skills: []
    };
  }
  const raw = await fs.readFile(manifestPath, "utf8");
  const manifest = JSON.parse(raw) as Manifest;
  return {
    version: manifest.version || manifestVersion,
    target: manifest.target || target,
    installedAt: manifest.installedAt || new Date().toISOString(),
    skills: Array.isArray(manifest.skills) ? manifest.skills : []
  };
}

async function writeManifest(manifestPath: string, manifest: Manifest): Promise<void> {
  await fs.ensureDir(path.dirname(manifestPath));
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
}

function refreshManifestSkill(manifest: Manifest, metadata: SkillMetadata, target: InstallTarget, relativePath: string): void {
  manifest.version = manifestVersion;
  manifest.target = target;
  manifest.skills = manifest.skills.filter((item) => !(item.id === metadata.id && item.target === target));
  manifest.skills.push(createManifestSkill(metadata, target, relativePath, new Date().toISOString()));
  manifest.skills.sort((a, b) => a.id.localeCompare(b.id));
}

function createManifestSkill(metadata: SkillMetadata, target: InstallTarget, relativePath: string, installedAt: string): ManifestSkill {
  return {
    id: metadata.id,
    version: metadata.version,
    target,
    path: toPosixPath(relativePath),
    installedAt,
    name: metadata.name,
    summary: metadata.summary,
    category: metadata.category,
    tags: metadata.tags,
    capabilities: metadata.capabilities,
    triggers: metadata.triggers,
    conflicts: metadata.conflicts,
    supports: metadata.supports,
    routing: metadata.routing,
    runtime: metadata.runtime
  };
}

function getRuntimeWrittenFiles(target: InstallTarget): string[] {
  const files = [
    ".agent-skill-os/manifest.json",
    ".agent-skill-os/router.json",
    ".agent-skill-os/skill-index.json",
    ".agent-skill-os/usage.md"
  ];
  if (target === "codex") {
    files.push(".codex/AGENTS.md");
  }
  if (target === "claude") {
    files.push(".claude/CLAUDE.md");
  }
  if (target === "cursor") {
    files.push(".cursor/rules/agent-skill-os.mdc");
  }
  return files;
}

async function writeRuntimeFiles(targetDir: string, target: InstallTarget, skills: ManifestSkill[]): Promise<void> {
  const runtimeDir = path.join(targetDir, ".agent-skill-os");
  const generatedAt = new Date().toISOString();
  const entries = skills.map((skill) => manifestSkillToRuntimeEntry(skill, target));
  await fs.ensureDir(runtimeDir);
  await fs.writeFile(path.join(runtimeDir, "router.json"), JSON.stringify(buildRuntimeRouter(target, entries, generatedAt), null, 2) + "\n", "utf8");
  await fs.writeFile(path.join(runtimeDir, "skill-index.json"), JSON.stringify(buildSkillIndex(target, entries, generatedAt), null, 2) + "\n", "utf8");
  await fs.writeFile(path.join(runtimeDir, "usage.md"), renderUsageMarkdown(target, entries), "utf8");
}

async function writeTargetLoader(targetDir: string, target: InstallTarget, skills: ManifestSkill[]): Promise<void> {
  if (target === "codex") {
    await writeCodexAgents(targetDir, skills);
  }
  if (target === "claude") {
    await writeClaudeLoader(targetDir, skills);
  }
  if (target === "cursor") {
    await writeCursorLoader(targetDir, skills);
  }
}

async function writeCodexAgents(targetDir: string, skills: ManifestSkill[]): Promise<void> {
  const agentsPath = path.join(targetDir, ".codex", "AGENTS.md");
  const entries = skills.map((skill) => manifestSkillToRuntimeEntry(skill, "codex")).sort((a, b) => a.id.localeCompare(b.id));
  const lines = [
    "# Agent Skill OS",
    "",
    "This project uses Agent Skill OS.",
    "",
    "## How to Use Skills",
    "",
    "Before starting a task:",
    "",
    "1. Read `.agent-skill-os/router.json`.",
    "2. Select the most relevant installed skill.",
    "3. Load only that skill's `SKILL.md`.",
    "4. If needed, load at most two supporting skills.",
    "5. Do not load every installed skill by default.",
    "6. State the selected skill before executing.",
    "7. Follow the selected skill's workflow and quality bar.",
    "8. Verify the output against the skill's runtime contract.",
    "",
    "## Installed Skills",
    "",
    "| Skill | When to use | Path |",
    "| --- | --- | --- |",
    ...entries.map((skill) => "| `" + skill.id + "` | " + tableCell(skill.routing.primaryFor[0] || skill.summary) + " | `" + skill.path + "` |"),
    "",
    "## Policy",
    "",
    "- Use one primary skill per task.",
    "- Use supporting skills only when needed.",
    "- Never combine unrelated skills.",
    "- If no skill matches, proceed normally and suggest installing a relevant skill.",
    "- Install many. Load few.",
    ""
  ];
  await fs.ensureDir(path.dirname(agentsPath));
  await fs.writeFile(agentsPath, lines.join("\n"), "utf8");
}

async function writeClaudeLoader(targetDir: string, skills: ManifestSkill[]): Promise<void> {
  const loaderPath = path.join(targetDir, ".claude", "CLAUDE.md");
  const entries = skills.map((skill) => manifestSkillToRuntimeEntry(skill, "claude"));
  await fs.ensureDir(path.dirname(loaderPath));
  await fs.writeFile(loaderPath, renderUsageMarkdown("claude", entries), "utf8");
}

async function writeCursorLoader(targetDir: string, skills: ManifestSkill[]): Promise<void> {
  const loaderPath = path.join(targetDir, ".cursor", "rules", "agent-skill-os.mdc");
  const entries = skills.map((skill) => manifestSkillToRuntimeEntry(skill, "cursor"));
  const content = [
    "---",
    "description: Agent Skill OS runtime router",
    "globs:",
    "  - \"**/*\"",
    "alwaysApply: true",
    "---",
    "",
    renderUsageMarkdown("cursor", entries)
  ].join("\n");
  await fs.ensureDir(path.dirname(loaderPath));
  await fs.writeFile(loaderPath, content, "utf8");
}

function manifestSkillToRuntimeEntry(skill: ManifestSkill, target: InstallTarget): RuntimeSkillEntry {
  if (skill.name && skill.summary && skill.category && skill.tags && skill.capabilities && skill.triggers && skill.routing && skill.runtime) {
    return {
      id: skill.id,
      name: skill.name,
      summary: skill.summary,
      category: skill.category,
      tags: skill.tags,
      path: skill.path,
      capabilities: skill.capabilities,
      triggers: skill.triggers,
      conflicts: skill.conflicts || [],
      supports: skill.supports || { targets: [target] },
      routing: skill.routing,
      runtime: skill.runtime
    };
  }
  return metadataToRuntimeEntry(
    {
      id: skill.id,
      name: skill.name || skill.id,
      summary: skill.summary || "Installed Agent Skill OS skill.",
      description: skill.summary || "Installed Agent Skill OS skill.",
      category: "coding",
      tags: skill.tags || [skill.id],
      targets: [target],
      difficulty: "beginner",
      version: skill.version,
      author: "Agent Skill OS",
      license: "MIT",
      inputs: ["user task"],
      outputs: ["task result"],
      use_cases: [skill.summary || skill.id],
      capabilities: skill.capabilities || [skill.id],
      triggers: skill.triggers || [skill.id],
      conflicts: skill.conflicts || [],
      supports: skill.supports || { targets: [target] },
      routing: skill.routing || { primaryFor: [skill.id], supportingFor: [] },
      runtime: skill.runtime || {
        maxContextFiles: 8,
        requiresProjectFiles: true,
        outputContract: ["final artifact", "assumptions", "validation checklist"],
        failureMode: "Ask for missing required context before generating output."
      }
    },
    skill.path || toPosixPath(getSkillRelativePath(skill.id, target))
  );
}

function tableCell(value: string): string {
  return value.replace(/\|/g, "\\|");
}
