import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import fs from "fs-extra";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  addRegistry,
  loadConfiguredRemoteRegistries,
  loadRegistryConfig,
  loadRemotePackFromRegistry,
  loadRemoteSkillFromRegistry,
  loadRemoteSkillUrl,
  refreshRemoteRegistries,
  removeRegistry,
  searchRemoteRegistrySkills,
  toSourceUrl
} from "../index.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const tmpDir = path.join(rootDir, "tmp", "remote-registry-tests");

describe("remote registry", () => {
  beforeEach(async () => {
    await fs.remove(tmpDir);
    await fs.ensureDir(tmpDir);
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("loads, searches, refreshes, and installs remote skill text", async () => {
    const configPath = path.join(tmpDir, "config.json");
    const skillPath = path.join(tmpDir, "remote", "skills", "readme-writer", "SKILL.md");
    const registryPath = path.join(tmpDir, "registry.json");
    await fs.ensureDir(path.dirname(skillPath));
    await fs.copyFile(path.join(rootDir, "skills", "readme-writer", "SKILL.md"), skillPath);
    await fs.writeFile(
      registryPath,
      "\uFEFF" +
        JSON.stringify(
          {
            version: "0.3.0",
            name: "official",
            description: "Test registry",
            skills: [
              {
                id: "readme-writer",
                version: "0.2.0",
                summary: "Create README files",
                tags: ["readme"],
                source: {
                  type: "file",
                  url: pathToFileURL(skillPath).toString()
                }
            }
            ],
            packs: [
              {
                id: "frontend-team",
                name: "Frontend Team",
                summary: "Frontend team skill pack",
                skills: ["readme-writer"]
              }
            ]
          },
          null,
          2
        ) +
        "\n",
      "utf8"
    );

    await addRegistry("official", toSourceUrl(registryPath), { configPath, homeDir: tmpDir });
    expect((await loadRegistryConfig({ configPath, homeDir: tmpDir })).registries).toHaveLength(1);

    const refreshed = await refreshRemoteRegistries({ configPath, homeDir: tmpDir });
    expect(refreshed[0].refreshedAt).toBeDefined();

    const registries = await loadConfiguredRemoteRegistries({ configPath, homeDir: tmpDir });
    const matches = searchRemoteRegistrySkills(registries, "readme");
    expect(matches[0].registry).toBe("official");
    expect(matches[0].skill.id).toBe("readme-writer");

    const remote = await loadRemoteSkillFromRegistry("official", "readme-writer", { configPath, homeDir: tmpDir });
    expect(remote.skill.metadata.id).toBe("readme-writer");

    const pack = await loadRemotePackFromRegistry("official", "frontend-team", { configPath, homeDir: tmpDir });
    expect(pack.pack.id).toBe("frontend-team");
    expect(pack.skills[0].metadata.id).toBe("readme-writer");

    const direct = await loadRemoteSkillUrl(toSourceUrl(skillPath));
    expect(direct.metadata.id).toBe("readme-writer");

    expect(await removeRegistry("official", { configPath, homeDir: tmpDir })).toBe(true);
    expect((await loadRegistryConfig({ configPath, homeDir: tmpDir })).registries).toHaveLength(0);
  });
});
