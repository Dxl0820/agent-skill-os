import { describe, expect, it } from "vitest";
import { SkillMetadataSchema } from "../schema.js";

const validMetadata = {
  id: "readme-writer",
  name: "README Writer",
  summary: "Create high-converting GitHub README files.",
  description: "A reusable skill.",
  category: "documentation",
  tags: ["readme"],
  targets: ["generic", "codex"],
  difficulty: "beginner",
  version: "0.2.0",
  author: "Agent Skill OS",
  license: "MIT",
  inputs: ["repo name"],
  outputs: ["README"],
  use_cases: ["Launch a repo"],
  capabilities: ["readme", "documentation"],
  triggers: ["write readme", "improve readme"],
  routing: {
    primaryFor: ["README generation"],
    supportingFor: ["launch planning"]
  },
  runtime: {
    maxContextFiles: 8,
    requiresProjectFiles: true,
    outputContract: ["README draft", "assumptions", "validation checklist"],
    failureMode: "Ask for missing context."
  }
};

describe("SkillMetadataSchema", () => {
  it("accepts valid metadata", () => {
    expect(SkillMetadataSchema.safeParse(validMetadata).success).toBe(true);
  });

  it("adds runtime defaults for older metadata", () => {
    const olderMetadata = { ...validMetadata };
    delete (olderMetadata as Partial<typeof validMetadata>).capabilities;
    delete (olderMetadata as Partial<typeof validMetadata>).triggers;
    delete (olderMetadata as Partial<typeof validMetadata>).routing;
    delete (olderMetadata as Partial<typeof validMetadata>).runtime;
    const result = SkillMetadataSchema.parse(olderMetadata);
    expect(result.capabilities).toContain("readme");
    expect(result.triggers).toContain("Launch a repo");
    expect(result.routing.primaryFor).toContain("Launch a repo");
    expect(result.runtime.outputContract).toContain("validation checklist");
  });

  it("rejects missing required fields", () => {
    const invalid = { ...validMetadata };
    delete (invalid as Partial<typeof validMetadata>).summary;
    expect(SkillMetadataSchema.safeParse(invalid).success).toBe(false);
  });
});
