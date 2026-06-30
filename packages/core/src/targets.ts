import path from "node:path";
import { InstallTarget, Skill } from "./schema.js";

export function getSkillRelativePath(skillId: string, target: InstallTarget): string {
  if (target === "generic") {
    return path.join("agent-skills", skillId, "SKILL.md");
  }
  if (target === "claude") {
    return path.join(".claude", "skills", skillId, "SKILL.md");
  }
  if (target === "codex") {
    return path.join(".codex", "skills", skillId, "SKILL.md");
  }
  return path.join(".cursor", "rules", skillId + ".mdc");
}

export function renderSkillForTarget(skill: Skill, target: InstallTarget): string {
  if (target !== "cursor") {
    return skill.raw.endsWith("\n") ? skill.raw : skill.raw + "\n";
  }
  return [
    "---",
    "description: " + yamlQuote(skill.metadata.summary),
    "globs:",
    "  - \"**/*\"",
    "alwaysApply: false",
    "---",
    "",
    skill.body,
    ""
  ].join("\n");
}

function yamlQuote(value: string): string {
  return JSON.stringify(value);
}
