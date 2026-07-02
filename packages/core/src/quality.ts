import { Skill, requiredSections } from "./schema.js";

export type QualityGrade = "A" | "B" | "C" | "D" | "F";

export interface SkillQualityReport {
  id: string;
  score: number;
  grade: QualityGrade;
  safety: "pass" | "warn";
  routing: "good" | "needs-work";
  runtimeContract: "complete" | "needs-work";
  issues: string[];
}

export function assessSkillQuality(skill: Skill): SkillQualityReport {
  const issues: string[] = [];
  const metadata = skill.metadata;
  for (const section of requiredSections) {
    if (!new RegExp("^##\\s+" + escapeRegExp(section) + "\\s*$", "m").test(skill.body)) {
      issues.push("missing required section: " + section);
    }
  }
  for (const section of ["### Required Inputs", "### Execution Steps", "### Output Contract", "### Failure Mode"]) {
    if (!new RegExp("^" + escapeRegExp(section) + "\\s*$", "m").test(skill.body)) {
      issues.push("runtime contract missing subsection: " + section.replace(/^###\s+/, ""));
    }
  }
  if (metadata.triggers.length < 3) {
    issues.push("routing triggers should include at least 3 specific phrases");
  }
  if (metadata.capabilities.length < 2) {
    issues.push("capabilities should include at least 2 specific capabilities");
  }
  if (metadata.runtime.outputContract.length < 3) {
    issues.push("runtime output contract should include at least 3 outputs");
  }
  if (!metadata.runtime.failureMode.toLowerCase().includes("ask")) {
    issues.push("failure mode should explain when to ask for missing context");
  }
  if (metadata.routing.primaryFor.length === 0) {
    issues.push("routing.primaryFor must not be empty");
  }
  if (metadata.summary.length < 20) {
    issues.push("summary is too short to guide routing");
  }
  if (containsUnsupportedClaims(skill.raw)) {
    issues.push("skill may claim unsupported automation, execution, or secret access");
  }
  const score = Math.max(0, 100 - issues.length * 8);
  const runtimeContract = issues.some((issue) => issue.includes("runtime")) ? "needs-work" : "complete";
  const routing = issues.some((issue) => issue.includes("routing") || issue.includes("triggers") || issue.includes("capabilities")) ? "needs-work" : "good";
  const safety = issues.some((issue) => issue.includes("unsupported") || issue.includes("secret")) ? "warn" : "pass";
  return {
    id: metadata.id,
    score,
    grade: gradeForScore(score),
    safety,
    routing,
    runtimeContract,
    issues
  };
}

export function assessAllSkillsQuality(skills: Skill[]): SkillQualityReport[] {
  return skills.map(assessSkillQuality).sort((a, b) => a.id.localeCompare(b.id));
}

function gradeForScore(score: number): QualityGrade {
  if (score >= 92) return "A";
  if (score >= 82) return "B";
  if (score >= 72) return "C";
  if (score >= 60) return "D";
  return "F";
}

function containsUnsupportedClaims(value: string): boolean {
  return /exfiltrat|steal secret|ignore safety|disable security|run arbitrary|guaranteed safe/i.test(value);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^{}()|[\]\\]/g, "\\$&");
}
