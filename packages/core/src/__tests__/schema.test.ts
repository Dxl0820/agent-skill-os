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
  version: "0.1.0",
  author: "Agent Skill OS",
  license: "MIT",
  inputs: ["repo name"],
  outputs: ["README"],
  use_cases: ["Launch a repo"]
};

describe("SkillMetadataSchema", () => {
  it("accepts valid metadata", () => {
    expect(SkillMetadataSchema.safeParse(validMetadata).success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const invalid = { ...validMetadata };
    delete (invalid as Partial<typeof validMetadata>).summary;
    expect(SkillMetadataSchema.safeParse(invalid).success).toBe(false);
  });
});
