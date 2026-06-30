import path from "node:path";
import matter from "gray-matter";
import fs from "fs-extra";
import { Skill, SkillMetadataSchema, ValidationResult, requiredSections } from "./schema.js";

export async function parseSkillFile(filePath: string): Promise<Skill> {
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = matter(raw);
  const metadata = SkillMetadataSchema.parse(parsed.data);
  return {
    metadata,
    body: parsed.content.trim(),
    raw,
    filePath
  };
}

export function validateSkill(skill: Skill): ValidationResult {
  const errors: string[] = [];
  const metadata = SkillMetadataSchema.safeParse(skill.metadata);
  if (!metadata.success) {
    for (const issue of metadata.error.issues) {
      errors.push(issue.path.join(".") + ": " + issue.message);
    }
  }
  const dirId = path.basename(path.dirname(skill.filePath));
  if (dirId !== skill.metadata.id) {
    errors.push("id must match directory name: expected " + dirId + ", got " + skill.metadata.id);
  }
  for (const section of requiredSections) {
    if (!new RegExp("^##\\s+" + escapeRegExp(section) + "\\s*$", "m").test(skill.body)) {
      errors.push("missing required section: " + section);
    }
  }
  return {
    ok: errors.length === 0,
    id: skill.metadata.id,
    filePath: skill.filePath,
    errors
  };
}

export function validateRawSkill(filePath: string, raw: string): ValidationResult {
  const parsed = matter(raw);
  const metadata = SkillMetadataSchema.safeParse(parsed.data);
  const errors: string[] = [];
  let id: string | undefined;
  if (!metadata.success) {
    for (const issue of metadata.error.issues) {
      errors.push(issue.path.join(".") + ": " + issue.message);
    }
  } else {
    id = metadata.data.id;
    const dirId = path.basename(path.dirname(filePath));
    if (dirId !== id) {
      errors.push("id must match directory name: expected " + dirId + ", got " + id);
    }
  }
  for (const section of requiredSections) {
    if (!new RegExp("^##\\s+" + escapeRegExp(section) + "\\s*$", "m").test(parsed.content)) {
      errors.push("missing required section: " + section);
    }
  }
  return {
    ok: errors.length === 0,
    id,
    filePath,
    errors
  };
}

export function validateAllSkills(skills: Skill[]): ValidationResult[] {
  return skills.map(validateSkill);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^{}()|[\]\\]/g, "\\$&");
}
