#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import pc from "picocolors";
import { Command } from "commander";
import {
  buildRegistry,
  createNewSkill,
  getSkillById,
  getSkillUsePrompt,
  initializeAgentSkillOS,
  installPack,
  installSkill,
  installTargets,
  loadPacks,
  loadSkills,
  recommendSkills,
  searchSkills,
  skillCategories,
  validateAllSkills,
  validatePacks,
  type InstallTarget
} from "@agent-skill-os/core";

const program = new Command();
const cliVersion = "0.2.0";
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
  .option("--json", "print JSON")
  .action(async (query, options) => {
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
    const skill = getSkillById(await loadCliSkills(), skillId);
    if (!skill) {
      fail("Skill not found: " + skillId);
    }
    const result = await installSkill({ skill, target, dir: options.dir, force: options.force, dryRun: options.dryRun });
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

function printInstallResult(result: InstallResultLike): void {
  if (result.skipped) {
    console.log(pc.yellow("- Skipped " + result.skillId + " because it is " + result.reason));
    return;
  }
  for (const file of result.writtenFiles) {
    console.log(pc.green("✓") + " " + (file.endsWith("manifest.json") ? "Updated " : "Installed " + result.skillId + " to ") + file);
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
