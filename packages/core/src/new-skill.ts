import path from "node:path";
import fs from "fs-extra";
import { installTargets, NewSkillOptions, NewSkillResult, skillCategories } from "./schema.js";

const skillIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function renderNewSkillTemplate(options: Pick<NewSkillOptions, "id" | "category" | "target">): string {
  const id = normalizeSkillId(options.id);
  const category = options.category || "documentation";
  const target = options.target || "generic";
  validateCategory(category);
  validateTarget(target);
  const name = toTitleCase(id);
  return `---
id: ${id}
name: ${name}
summary: Describe what ${name} helps an AI coding agent do.
description: A reusable skill for guiding an AI coding agent through a focused ${category} workflow.
category: ${category}
tags:
  - custom
  - ${category}
targets:
  - ${target}
difficulty: beginner
version: 0.2.0
author: Agent Skill OS contributor
license: MIT
inputs:
  - user goal
  - relevant project context
outputs:
  - completed ${category} artifact
  - validation notes
use_cases:
  - Use ${name} in an AI coding workflow
capabilities:
  - ${category}
  - custom-workflow
triggers:
  - use ${id}
  - ${name.toLowerCase()} task
routing:
  primaryFor:
    - Use ${name} in an AI coding workflow
  supportingFor:
    - custom workflow support
runtime:
  maxContextFiles: 8
  requiresProjectFiles: true
  outputContract:
    - final artifact
    - assumptions
    - validation checklist
  failureMode: Ask for missing required context before generating output.
---

# ${name}

## Role

You are an expert assistant for this focused workflow. Help the user turn rough context into a concrete, reviewable result.

## When to Use

Use this skill when the user asks for work that matches this workflow and needs a repeatable process.

## Inputs

Ask for or infer:

- user goal
- relevant project context
- constraints
- expected output

## Workflow

1. Confirm the user's goal and constraints.
2. Identify the minimum context needed.
3. Produce the smallest useful result first.
4. Check the result against the quality bar.
5. List assumptions, risks, and validation steps.

## Output Format

Return Markdown with clear headings, concise bullets, and commands or examples in fenced code blocks when useful.

## Quality Bar

A good result is specific, grounded in the supplied context, easy to verify, and honest about unknowns.

## Runtime Contract

### Required Inputs

- user goal
- relevant project context
- constraints

### Execution Steps

1. Inspect the available context.
2. Select the smallest useful output structure.
3. Draft the result.
4. Check it against the quality bar.
5. Return the final artifact with assumptions and validation notes.

### Output Contract

Return:

- final artifact
- assumptions
- validation checklist

### Failure Mode

If required context is missing, ask for it before generating. Do not invent unsupported project details.

## Example Prompt

Use ${id} to help with this project task: <describe the task>.

## Example Output

Return the completed artifact, followed by validation notes and any assumptions.

## Safety Notes

Do not invent unsupported facts, citations, test results, security claims, or product capabilities. Mark unknowns clearly.
`;
}

export async function createNewSkill(options: NewSkillOptions): Promise<NewSkillResult> {
  const id = normalizeSkillId(options.id);
  const rootDir = options.rootDir ? path.resolve(options.rootDir) : process.cwd();
  const skillDir = path.join(rootDir, "skills", id);
  const filePath = path.join(skillDir, "SKILL.md");
  if ((await fs.pathExists(skillDir)) && !options.force) {
    throw new Error("Skill already exists: " + id + ". Use --force to overwrite.");
  }
  await fs.ensureDir(skillDir);
  await fs.writeFile(filePath, renderNewSkillTemplate({ id, category: options.category, target: options.target }), "utf8");
  return {
    skillId: id,
    filePath,
    created: true
  };
}

function normalizeSkillId(id: string): string {
  const normalized = id.trim();
  if (!skillIdPattern.test(normalized)) {
    throw new Error("Invalid skill id: " + id + ". Use lowercase kebab-case, for example my-skill.");
  }
  return normalized;
}

function validateCategory(category: string): void {
  if (!(skillCategories as readonly string[]).includes(category)) {
    throw new Error("Invalid category: " + category + ". Expected one of " + skillCategories.join(", "));
  }
}

function validateTarget(target: string): void {
  if (!(installTargets as readonly string[]).includes(target)) {
    throw new Error("Invalid target: " + target + ". Expected one of " + installTargets.join(", "));
  }
}

function toTitleCase(id: string): string {
  return id.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
