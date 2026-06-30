import path from "node:path";
import fs from "fs-extra";
import { getSkillRelativePath, renderSkillForTarget } from "./targets.js";
import { toPosixPath } from "./fs-utils.js";
import { InstallPackOptions, InstallResult, InstallSkillOptions, InstallTarget } from "./schema.js";

interface ManifestSkill {
  id: string;
  version: string;
  target: InstallTarget;
  path: string;
  installedAt: string;
}

interface Manifest {
  version: string;
  target: InstallTarget;
  installedAt: string;
  skills: ManifestSkill[];
}

const manifestVersion = "0.1.0";

export async function installSkill(options: InstallSkillOptions): Promise<InstallResult> {
  const targetDir = path.resolve(options.dir);
  const relativePath = getSkillRelativePath(options.skill.metadata.id, options.target);
  const outputPath = path.join(targetDir, relativePath);
  const manifestPath = path.join(targetDir, ".agent-skill-os", "manifest.json");
  const plannedFiles = [toPosixPath(relativePath), ".agent-skill-os/manifest.json"];
  if (options.target === "codex") {
    plannedFiles.push(".codex/AGENTS.md");
  }

  const manifest = await readManifest(manifestPath, options.target);
  const alreadyInManifest = manifest.skills.some((item) => item.id === options.skill.metadata.id && item.target === options.target);
  const outputExists = await fs.pathExists(outputPath);
  if ((alreadyInManifest || outputExists) && !options.force) {
    return {
      skillId: options.skill.metadata.id,
      target: options.target,
      writtenFiles: [],
      skipped: true,
      reason: "already installed. Use --force to overwrite"
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
  manifest.target = options.target;
  manifest.skills = manifest.skills.filter((item) => !(item.id === options.skill.metadata.id && item.target === options.target));
  manifest.skills.push({
    id: options.skill.metadata.id,
    version: options.skill.metadata.version,
    target: options.target,
    path: toPosixPath(relativePath),
    installedAt
  });
  manifest.skills.sort((a, b) => a.id.localeCompare(b.id));
  await writeManifest(manifestPath, manifest);
  if (options.target === "codex") {
    await writeCodexAgents(targetDir, manifest.skills.filter((item) => item.target === "codex"));
  }

  return {
    skillId: options.skill.metadata.id,
    target: options.target,
    writtenFiles: plannedFiles,
    skipped: false
  };
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

async function writeCodexAgents(targetDir: string, skills: ManifestSkill[]): Promise<void> {
  const agentsPath = path.join(targetDir, ".codex", "AGENTS.md");
  const lines = [
    "# Codex Agent Skills",
    "",
    "This project uses Agent Skill OS.",
    "",
    "## Installed Skills",
    "",
    ...skills.sort((a, b) => a.id.localeCompare(b.id)).map((skill) => "- [" + skill.id + "](./skills/" + skill.id + "/SKILL.md)"),
    "",
    "## Usage",
    "",
    "When working in this repository, load the relevant skill before starting the task.",
    ""
  ];
  await fs.ensureDir(path.dirname(agentsPath));
  await fs.writeFile(agentsPath, lines.join("\n"), "utf8");
}
