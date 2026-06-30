#!/usr/bin/env node
import path from "node:path";
import fs from "fs-extra";
import pc from "picocolors";
import { Command } from "commander";
import {
  buildRegistry,
  createNewSkill,
  getSkillById,
  installPack,
  installSkill,
  installTargets,
  loadPacks,
  loadSkills,
  searchSkills,
  skillCategories,
  validateAllSkills,
  validatePacks,
  type InstallTarget
} from "@agent-skill-os/core";

const program = new Command();

program
  .name("aso")
  .description("Install battle-tested skills into your AI coding agent in 30 seconds.")
  .version("0.1.1");

program
  .command("list")
  .description("List available skills")
  .option("--category <category>", "filter by category")
  .option("--tag <tag>", "filter by tag")
  .option("--json", "print JSON")
  .action(async (options) => {
    const skills = await loadSkills();
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
    const results = searchSkills(await loadSkills(), query);
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
    const skill = getSkillById(await loadSkills(), skillId);
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
    const skill = getSkillById(await loadSkills(), skillId);
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
    const [skills, packs] = await Promise.all([loadSkills(), loadPacks()]);
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
  .command("validate")
  .description("Validate skills and packs")
  .option("--json", "print JSON")
  .action(async (options) => {
    const [skills, packs] = await Promise.all([loadSkills(), loadPacks()]);
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
    const dir = path.resolve(options.dir);
    await fs.ensureDir(path.join(dir, ".agent-skill-os"));
    await fs.writeFile(path.join(dir, ".agent-skill-os", "manifest.json"), JSON.stringify({ version: "0.1.0", target, installedAt: new Date().toISOString(), skills: [] }, null, 2) + "\n", "utf8");
    await fs.writeFile(path.join(dir, ".agent-skill-os", "README.md"), "# Agent Skill OS\n\nThis project is ready for Agent Skill OS skills.\n", "utf8");
    if (target === "generic") await fs.ensureDir(path.join(dir, "agent-skills"));
    if (target === "claude") await fs.ensureDir(path.join(dir, ".claude", "skills"));
    if (target === "codex") await fs.ensureDir(path.join(dir, ".codex", "skills"));
    if (target === "cursor") await fs.ensureDir(path.join(dir, ".cursor", "rules"));
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
    const registry = await buildRegistry();
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
