#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import pc from "picocolors";
import { Command } from "commander";
import { runMcpServer } from "./mcp.js";
import {
  buildRegistry,
  createNewSkill,
  getSkillById,
  getSkillUsePrompt,
  initializeAgentSkillOS,
  installPack,
  installSkill,
  installTargets,
  uninstallSkill,
  listOutdatedSkills,
  rebuildSkillLock,
  addRegistry,
  loadConfiguredRemoteRegistries,
  loadPacks,
  loadRegistryConfig,
  loadRemotePackFromRegistry,
  loadRemoteSkillFromRegistry,
  loadRemoteSkillUrl,
  loadSkills,
  refreshRemoteRegistries,
  removeRegistry,
  assessAllSkillsQuality,
  searchRemoteRegistrySkills,
  recommendSkills,
  searchSkills,
  skillCategories,
  toSourceUrl,
  validateAllSkills,
  validatePacks,
  type InstallSource,
  type InstallTarget,
  type Skill,
  type UninstallResult
} from "@agent-skill-os/core";

const program = new Command();
const cliVersion = "1.0.0";
const cliPackageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

program
  .name("aso")
  .description("Install battle-tested skills into your AI coding agent in 30 seconds.")
  .version(cliVersion);

program
  .command("list")
  .description("List available skills")
  .option("--category <category>", "filter by category")
  .option("--tag <tag>", "filter by tag")
  .option("--json", "print JSON")
  .action(async (options) => {
    const skills = await loadCliSkills();
    const filtered = skills.filter((skill) => {
      const categoryOk = !options.category || skill.metadata.category === options.category;
      const tagOk = !options.tag || skill.metadata.tags.includes(options.tag);
      return categoryOk && tagOk;
    });
    if (options.json) {
      printJson(filtered.map((skill) => skill.metadata));
      return;
    }
    console.log(pc.bold("Agent Skill OS"));
    console.log("");
    console.log(filtered.length + " skills found");
    console.log("");
    const byCategory = new Map<string, typeof filtered>();
    for (const skill of filtered) {
      const list = byCategory.get(skill.metadata.category) || [];
      list.push(skill);
      byCategory.set(skill.metadata.category, list);
    }
    for (const [category, categorySkills] of byCategory) {
      console.log(pc.cyan(category));
      for (const skill of categorySkills) {
        console.log("  " + skill.metadata.id.padEnd(32) + skill.metadata.summary);
      }
    }
  });

program
  .command("search")
  .description("Search skills")
  .argument("<query>")
  .option("--remote", "search configured remote registries")
  .option("--json", "print JSON")
  .action(async (query, options) => {
    if (options.remote) {
      const results = searchRemoteRegistrySkills(await loadConfiguredRemoteRegistries(), query);
      if (options.json) {
        printJson(results);
        return;
      }
      console.log(results.length + " remote skills found");
      for (const result of results) {
        console.log(pc.green(result.registry + "/" + result.skill.id) + " - " + (result.skill.summary || result.skill.source.url));
      }
      return;
    }
    const results = searchSkills(await loadCliSkills(), query);
    if (options.json) {
      printJson(results.map((skill) => skill.metadata));
      return;
    }
    console.log(results.length + " skills found");
    for (const skill of results) {
      console.log(pc.green(skill.metadata.id) + " - " + skill.metadata.summary);
    }
  });

program
  .command("show")
  .description("Show skill details")
  .argument("<skill-id>")
  .option("--raw", "print raw SKILL.md")
  .option("--json", "print JSON")
  .action(async (skillId, options) => {
    const skill = getSkillById(await loadCliSkills(), skillId);
    if (!skill) {
      fail("Skill not found: " + skillId);
    }
    if (options.raw) {
      console.log(skill.raw.trimEnd());
      return;
    }
    if (options.json) {
      printJson(skill);
      return;
    }
    console.log(pc.bold(skill.metadata.name));
    console.log(skill.metadata.summary);
    console.log("");
    console.log("Category: " + skill.metadata.category);
    console.log("Tags: " + skill.metadata.tags.join(", "));
    console.log("Targets: " + skill.metadata.targets.join(", "));
    console.log("");
    console.log(skill.body);
  });

program
  .command("install")
  .description("Install a skill")
  .argument("<skill-id>")
  .requiredOption("--target <target>", "target: generic, claude, codex, cursor")
  .option("--dir <dir>", "target project directory", ".")
  .option("--force", "overwrite existing files")
  .option("--dry-run", "show files without writing")
  .action(async (skillId, options) => {
    const target = parseTarget(options.target);
    if (isRemoteSpecifier(skillId)) {
      const [registryName, remoteSkillId] = parseRemoteSpecifier(skillId);
      const remote = await loadRemoteSkillFromRegistry(registryName, remoteSkillId);
      printRemoteInstallWarning(remote.skillEntry.source.url);
      const result = await installSkill({
        skill: remote.skill,
        target,
        dir: options.dir,
        force: options.force,
        dryRun: options.dryRun,
        source: registrySource(registryName, remote.skillEntry.source.url, remote.skillEntry.source.checksum)
      });
      printInstallResult(result);
      return;
    }
    const skills = await loadCliSkills();
    const skill = getSkillById(skills, skillId);
    if (!skill) {
      fail("Skill not found: " + skillId);
    }
    const installPlan = resolveSkillDependencyClosure(skill, skills);
    for (const plannedSkill of installPlan) {
      const result = await installSkill({ skill: plannedSkill, target, dir: options.dir, force: options.force, dryRun: options.dryRun, source: builtinSource() });
      printInstallResult(result);
    }
  });

program
  .command("install-url")
  .description("Install a skill directly from a raw SKILL.md URL or local file")
  .argument("<url>")
  .requiredOption("--target <target>", "target: generic, claude, codex, cursor")
  .option("--dir <dir>", "target project directory", ".")
  .option("--force", "overwrite existing files")
  .option("--dry-run", "show files without writing")
  .action(async (url, options) => {
    const target = parseTarget(options.target);
    const sourceUrl = toSourceUrl(url);
    printRemoteInstallWarning(sourceUrl);
    const skill = await loadRemoteSkillUrl(sourceUrl);
    const result = await installSkill({ skill, target, dir: options.dir, force: options.force, dryRun: options.dryRun, source: directSource(sourceUrl) });
    printInstallResult(result);
  });

program
  .command("install-pack")
  .description("Install a skill pack")
  .argument("<pack-id>")
  .requiredOption("--target <target>", "target: generic, claude, codex, cursor")
  .option("--dir <dir>", "target project directory", ".")
  .option("--force", "overwrite existing files")
  .option("--dry-run", "show files without writing")
  .action(async (packId, options) => {
    const target = parseTarget(options.target);
    if (isRemoteSpecifier(packId)) {
      const [registryName, remotePackId] = parseRemoteSpecifier(packId);
      const remotePack = await loadRemotePackFromRegistry(registryName, remotePackId);
      console.log(pc.yellow("! Installing remote skill pack instructions"));
      console.log("Registry: " + registryName);
      console.log("Pack: " + remotePack.pack.id);
      console.log("Review untrusted skills before use. Agent Skill OS treats remote skills as text instructions and does not execute remote code.");
      console.log("");
      const results = await installPack({ skills: remotePack.skills, pack: remotePack.pack, target, dir: options.dir, force: options.force, dryRun: options.dryRun, sources: remotePack.sources });
      for (const result of results) {
        printInstallResult(result);
      }
      return;
    }
    const [skills, packs] = await Promise.all([loadCliSkills(), loadCliPacks()]);
    const pack = packs.find((candidate) => candidate.id === packId);
    if (!pack) {
      fail("Pack not found: " + packId);
    }
    const results = await installPack({ skills, pack, target, dir: options.dir, force: options.force, dryRun: options.dryRun });
    for (const result of results) {
      printInstallResult(result);
    }
  });

program
  .command("uninstall")
  .description("Uninstall an installed skill")
  .argument("<skill-id>")
  .requiredOption("--target <target>", "target: generic, claude, codex, cursor")
  .option("--dir <dir>", "target project directory", ".")
  .option("--force", "remove even if another installed skill depends on it")
  .action(async (skillId, options) => {
    const target = parseTarget(options.target);
    const result = await uninstallSkill({ skillId, target, dir: options.dir, force: options.force });
    printUninstallResult(result);
  });

program
  .command("outdated")
  .description("List installed built-in skills that have newer bundled versions")
  .option("--target <target>", "target filter")
  .option("--dir <dir>", "target project directory", ".")
  .option("--json", "print JSON")
  .action(async (options) => {
    const target = options.target ? parseTarget(options.target) : undefined;
    const outdated = await listOutdatedSkills({ dir: options.dir, target, skills: await loadCliSkills() });
    if (options.json) {
      printJson(outdated);
      return;
    }
    if (outdated.length === 0) {
      console.log(pc.green("✓ Installed built-in skills are up to date"));
      return;
    }
    console.log(pc.bold("Outdated skills"));
    console.log("");
    for (const skill of outdated) {
      console.log(skill.id + " " + skill.currentVersion + " -> " + skill.latestVersion + " (" + skill.target + ")");
    }
  });

program
  .command("update")
  .description("Update an installed built-in skill")
  .argument("<skill-id>")
  .requiredOption("--target <target>", "target: generic, claude, codex, cursor")
  .option("--dir <dir>", "target project directory", ".")
  .action(async (skillId, options) => {
    const target = parseTarget(options.target);
    const skills = await loadCliSkills();
    const skill = getSkillById(skills, skillId);
    if (!skill) {
      fail("Built-in skill not found: " + skillId);
    }
    for (const plannedSkill of resolveSkillDependencyClosure(skill, skills)) {
      printInstallResult(await installSkill({ skill: plannedSkill, target, dir: options.dir, force: true, source: builtinSource() }));
    }
  });

program
  .command("update-pack")
  .description("Update an installed built-in or remote registry skill pack")
  .argument("<pack-id>")
  .requiredOption("--target <target>", "target: generic, claude, codex, cursor")
  .option("--dir <dir>", "target project directory", ".")
  .action(async (packId, options) => {
    const target = parseTarget(options.target);
    if (isRemoteSpecifier(packId)) {
      const [registryName, remotePackId] = parseRemoteSpecifier(packId);
      const remotePack = await loadRemotePackFromRegistry(registryName, remotePackId);
      const results = await installPack({ skills: remotePack.skills, pack: remotePack.pack, target, dir: options.dir, force: true, sources: remotePack.sources });
      for (const result of results) {
        printInstallResult(result);
      }
      return;
    }
    const [skills, packs] = await Promise.all([loadCliSkills(), loadCliPacks()]);
    const pack = packs.find((candidate) => candidate.id === packId);
    if (!pack) {
      fail("Pack not found: " + packId);
    }
    const results = await installPack({ skills, pack, target, dir: options.dir, force: true });
    for (const result of results) {
      printInstallResult(result);
    }
  });

program
  .command("lock")
  .description("Rebuild .agent-skill-os/skill-lock.json from the installed manifest")
  .option("--dir <dir>", "target project directory", ".")
  .action(async (options) => {
    const lockPath = await rebuildSkillLock(options.dir);
    console.log(pc.green("✓ Rebuilt " + lockPath));
  });

program
  .command("use")
  .description("Print instructions for loading an installed skill")
  .argument("<skill-id>")
  .requiredOption("--target <target>", "target: generic, claude, codex, cursor")
  .action(async (skillId, options) => {
    const target = parseTarget(options.target);
    const skill = getSkillById(await loadCliSkills(), skillId);
    if (!skill) {
      fail("Skill not found: " + skillId);
    }
    console.log(getSkillUsePrompt(skill, target).trimEnd());
  });

program
  .command("use-pack")
  .description("Print instructions for using an installed skill pack through the runtime router")
  .argument("<pack-id>")
  .requiredOption("--target <target>", "target: generic, claude, codex, cursor")
  .action(async (packId, options) => {
    const target = parseTarget(options.target);
    const [skills, packs] = await Promise.all([loadCliSkills(), loadCliPacks()]);
    const pack = packs.find((candidate) => candidate.id === packId);
    if (!pack) {
      fail("Pack not found: " + packId);
    }
    console.log("Use the installed " + pack.id + " skill pack.");
    console.log("");
    console.log("Target: " + target);
    console.log("");
    console.log("Ask your agent:");
    console.log("");
    console.log("Read .agent-skill-os/router.json.");
    console.log("Select one primary skill for the current task.");
    console.log("Load only the selected skill's SKILL.md and at most two supporting skills.");
    console.log("State the selected skill before executing.");
    console.log("");
    console.log("Pack skills:");
    for (const skillId of pack.skills) {
      const skill = getSkillById(skills, skillId);
      console.log("- " + skillId + (skill ? ": " + skill.metadata.summary : ""));
    }
  });

program
  .command("recommend")
  .description("Recommend skills for a natural-language task")
  .argument("<task>")
  .option("--target <target>", "target: generic, claude, codex, cursor", "codex")
  .option("--limit <count>", "number of recommendations", "3")
  .option("--json", "print JSON")
  .action(async (task, options) => {
    const target = parseTarget(options.target);
    const limit = Number.parseInt(options.limit, 10);
    if (!Number.isFinite(limit) || limit < 1) {
      fail("Invalid limit: " + options.limit);
    }
    const recommendations = recommendSkills(await loadCliSkills(), task, { limit });
    if (options.json) {
      printJson(
        recommendations.map((recommendation) => ({
          id: recommendation.skill.metadata.id,
          score: recommendation.score,
          reason: recommendation.reason,
          use: "aso use " + recommendation.skill.metadata.id + " --target " + target
        }))
      );
      return;
    }
    console.log(pc.bold("Recommended skills"));
    console.log("");
    recommendations.forEach((recommendation, index) => {
      console.log(index + 1 + ". " + pc.green(recommendation.skill.metadata.id));
      console.log("   Reason: " + recommendation.reason);
      console.log("   Use:");
      console.log("   aso use " + recommendation.skill.metadata.id + " --target " + target);
      console.log("");
      });
    });

program
  .command("mcp")
  .description("Run the Agent Skill OS MCP server over stdio")
  .action(async () => {
    await runMcpServer(getRegistryOptions());
  });

program
  .command("validate")
  .description("Validate skills and packs")
  .option("--json", "print JSON")
  .action(async (options) => {
    const [skills, packs] = await Promise.all([loadCliSkills(), loadCliPacks()]);
    const results = [...validateAllSkills(skills), ...validatePacks(packs, skills)];
    if (options.json) {
      printJson(results);
      return;
    }
    const failed = results.filter((result) => !result.ok);
    if (failed.length > 0) {
      for (const result of failed) {
        console.log(pc.red("✕ " + (result.id || result.filePath || "unknown")));
        for (const error of result.errors) {
          console.log("  - " + error);
        }
      }
      process.exitCode = 1;
      return;
    }
    console.log(pc.green("✓ All skills and packs are valid"));
  });

program
  .command("quality")
  .description("Run static skill quality and trust checks")
  .option("--json", "print JSON")
  .option("--min-grade <grade>", "minimum acceptable grade: A, B, C, D, F", "B")
  .action(async (options) => {
    const reports = assessAllSkillsQuality(await loadCliSkills());
    if (options.json) {
      printJson(reports);
      return;
    }
    const minimum = gradeRank(String(options.minGrade || "B"));
    let failed = false;
    console.log(pc.bold("Agent Skill OS Quality"));
    console.log("");
    for (const report of reports) {
      const ok = gradeRank(report.grade) <= minimum && report.safety === "pass" && report.runtimeContract === "complete";
      failed ||= !ok;
      console.log((ok ? pc.green("✓") : pc.red("✕")) + " " + report.id + " grade=" + report.grade + " score=" + report.score + " safety=" + report.safety + " routing=" + report.routing + " runtime=" + report.runtimeContract);
      for (const issue of report.issues) {
        console.log("  - " + issue);
      }
    }
    if (failed) {
      process.exitCode = 1;
    }
  });

const registryCommand = program
  .command("registry")
  .description("Manage remote skill registries");

registryCommand
  .command("list")
  .description("List configured remote registries")
  .option("--json", "print JSON")
  .action(async (options) => {
    const config = await loadRegistryConfig();
    if (options.json) {
      printJson(config);
      return;
    }
    console.log(config.registries.length + " registries configured");
    for (const registry of config.registries) {
      console.log("- " + registry.name + " -> " + registry.url + (registry.refreshedAt ? " (refreshed " + registry.refreshedAt + ")" : ""));
    }
  });

registryCommand
  .command("add")
  .description("Add or update a remote registry")
  .argument("<name>")
  .argument("<url>")
  .action(async (name, url) => {
    const sourceUrl = toSourceUrl(url);
    await addRegistry(name, sourceUrl);
    console.log(pc.green("✓ Added registry " + name));
    console.log("Source: " + sourceUrl);
  });

registryCommand
  .command("remove")
  .description("Remove a remote registry")
  .argument("<name>")
  .action(async (name) => {
    const removed = await removeRegistry(name);
    if (!removed) {
      fail("Registry not found: " + name);
    }
    console.log(pc.green("✓ Removed registry " + name));
  });

registryCommand
  .command("refresh")
  .description("Fetch and cache configured remote registries")
  .action(async () => {
    const refreshed = await refreshRemoteRegistries();
    console.log(pc.green("✓ Refreshed " + refreshed.length + " registries"));
  });

program
  .command("init")
  .description("Initialize Agent Skill OS metadata in a project")
  .requiredOption("--target <target>", "target: generic, claude, codex, cursor")
  .option("--dir <dir>", "target project directory", ".")
  .action(async (options) => {
    const target = parseTarget(options.target);
    await initializeAgentSkillOS(target, options.dir);
    console.log(pc.green("✓ Initialized Agent Skill OS for " + target));
  });

program
  .command("new-skill")
  .description("Create a new skill template")
  .argument("<skill-id>")
  .option("--category <category>", "category: documentation, coding, github, product, content, research", "documentation")
  .option("--target <target>", "target: generic, claude, codex, cursor", "generic")
  .option("--force", "overwrite an existing skill directory")
  .action(async (skillId, options) => {
    const category = parseCategory(options.category);
    const target = parseTarget(options.target);
    const result = await createNewSkill({ id: skillId, category, target, force: options.force });
    console.log(pc.green("✓ Created " + result.skillId + " at " + path.relative(process.cwd(), result.filePath).split(path.sep).join("/")));
  });

program
  .command("export")
  .description("Export registry")
  .option("--format <format>", "json or markdown", "json")
  .action(async (options) => {
    const registry = await buildRegistry(getRegistryOptions());
    if (options.format === "json") {
      printJson(registry);
      return;
    }
    if (options.format !== "markdown") {
      fail("Unsupported export format: " + options.format);
    }
    console.log("# Agent Skill OS Registry");
    console.log("");
    for (const skill of registry.skills) {
      console.log("- **" + skill.id + "**: " + skill.summary);
    }
  });

program
  .command("doctor")
  .description("Inspect installed skills in a project")
  .option("--target <target>", "target filter")
  .option("--dir <dir>", "target project directory", ".")
  .action(async (options) => {
    const dir = path.resolve(options.dir);
    const manifestPath = path.join(dir, ".agent-skill-os", "manifest.json");
    if (!(await fs.pathExists(manifestPath))) {
      fail("Manifest not found: " + manifestPath);
    }
    const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    const rows = (manifest.skills || []).filter((skill: { target: string }) => !options.target || skill.target === options.target);
    console.log(pc.bold("Agent Skill OS Doctor"));
    console.log("");
    console.log("Manifest: " + manifestPath);
    console.log("Installed skills: " + rows.length);
    for (const skill of rows) {
      const exists = await fs.pathExists(path.join(dir, skill.path));
      console.log((exists ? pc.green("✓") : pc.red("✕")) + " " + skill.id + " -> " + skill.path);
    }
  });

program.parseAsync(process.argv).catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});

function getRegistryOptions(): { rootDir: string } | undefined {
  if (fs.existsSync(path.join(cliPackageRoot, "skills")) && fs.existsSync(path.join(cliPackageRoot, "packs"))) {
    return { rootDir: cliPackageRoot };
  }
  return undefined;
}

function loadCliSkills() {
  return loadSkills(getRegistryOptions());
}

function loadCliPacks() {
  return loadPacks(getRegistryOptions());
}

function resolveSkillDependencyClosure(skill: Skill, availableSkills: Skill[]): Skill[] {
  const byId = new Map(availableSkills.map((candidate) => [candidate.metadata.id, candidate]));
  const resolved: Skill[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(current: Skill): void {
    if (visited.has(current.metadata.id)) {
      return;
    }
    if (visiting.has(current.metadata.id)) {
      fail("Circular skill dependency detected: " + [...visiting, current.metadata.id].join(" -> "));
    }
    visiting.add(current.metadata.id);
    for (const dependencyId of current.metadata.dependencies) {
      const dependency = byId.get(dependencyId);
      if (!dependency) {
        fail("Missing dependency for " + current.metadata.id + ": " + dependencyId);
      }
      visit(dependency);
    }
    visiting.delete(current.metadata.id);
    visited.add(current.metadata.id);
    resolved.push(current);
  }

  visit(skill);
  return resolved;
}

function builtinSource(): InstallSource {
  return { type: "builtin" };
}

function registrySource(registry: string, url: string, checksum?: string): InstallSource {
  return { type: "registry", registry, url, checksum };
}

function directSource(sourceUrl: string): InstallSource {
  if (/^file:\/\//i.test(sourceUrl)) {
    return { type: "file", url: sourceUrl };
  }
  if (/githubusercontent\.com|github\.com/i.test(sourceUrl)) {
    return { type: "github", url: sourceUrl };
  }
  return { type: "url", url: sourceUrl };
}

function parseTarget(value: string): InstallTarget {
  if ((installTargets as readonly string[]).includes(value)) {
    return value as InstallTarget;
  }
  fail("Invalid target: " + value + ". Expected one of " + installTargets.join(", "));
}

function parseCategory(value: string): (typeof skillCategories)[number] {
  if ((skillCategories as readonly string[]).includes(value)) {
    return value as (typeof skillCategories)[number];
  }
  fail("Invalid category: " + value + ". Expected one of " + skillCategories.join(", "));
}

function gradeRank(value: string): number {
  const normalized = value.toUpperCase();
  if (normalized === "A") return 1;
  if (normalized === "B") return 2;
  if (normalized === "C") return 3;
  if (normalized === "D") return 4;
  if (normalized === "F") return 5;
  fail("Invalid grade: " + value);
}

function isRemoteSpecifier(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function parseRemoteSpecifier(value: string): [string, string] {
  const [registryName, skillId] = value.split("/");
  if (!registryName || !skillId) {
    fail("Invalid remote skill specifier: " + value + ". Expected <registry>/<skill-id>");
  }
  return [registryName, skillId];
}

function printRemoteInstallWarning(sourceUrl: string): void {
  console.log(pc.yellow("! Installing remote skill instructions"));
  console.log("Source: " + sourceUrl);
  console.log("Review untrusted skills before use. Agent Skill OS treats remote skills as text instructions and does not execute remote code.");
  console.log("");
}

function printInstallResult(result: InstallResultLike): void {
  if (result.skipped) {
    console.log(pc.yellow("- Skipped " + result.skillId + " because it is " + result.reason));
    return;
  }
  for (const file of result.writtenFiles) {
    console.log(pc.green("✓") + " " + (file.endsWith("manifest.json") ? "Updated " : "Installed " + result.skillId + " to ") + file);
  }
}

function printUninstallResult(result: UninstallResult): void {
  if (result.skipped) {
    console.log(pc.yellow("- Skipped " + result.skillId + " because it is " + result.reason));
    return;
  }
  for (const file of result.removedFiles) {
    console.log(pc.green("✓") + " Removed " + file);
  }
}

interface InstallResultLike {
  skillId: string;
  writtenFiles: string[];
  skipped: boolean;
  reason?: string;
}

function printJson(value: unknown): void {
  console.log(JSON.stringify(value, null, 2));
}

function fail(message: string): never {
  console.error(pc.red("✕ " + message));
  process.exit(1);
}
