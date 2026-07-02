import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { handleMcpRequest } from "./mcp.js";

const cwd = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

describe("mcp server", () => {
  it("initializes and lists tools", async () => {
    const initialized = await handleMcpRequest(
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: { protocolVersion: "2025-11-25" }
      },
      { rootDir: cwd }
    );
    expect(initialized?.result).toMatchObject({
      capabilities: { tools: {} },
      serverInfo: { name: "agent-skill-os", version: "0.4.0" }
    });

    const listed = await handleMcpRequest({ jsonrpc: "2.0", id: 2, method: "tools/list" }, { rootDir: cwd });
    expect(JSON.stringify(listed?.result)).toContain("agent_skill_recommend");
    expect(JSON.stringify(listed?.result)).toContain("agent_skill_load");
  });

  it("recommends and loads one skill through tools/call", async () => {
    const recommended = await handleMcpRequest(
      {
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: {
          name: "agent_skill_recommend",
          arguments: {
            task: "review this pull request",
            target: "codex"
          }
        }
      },
      { rootDir: cwd }
    );
    const recommendText = String((recommended?.result as { content: Array<{ text: string }> }).content[0].text);
    const recommendJson = JSON.parse(recommendText);
    expect(recommendJson.policy.loadAllSkillsByDefault).toBe(false);
    expect(recommendJson.primary.id).toBe("code-reviewer");
    expect(recommendJson.supporting.length).toBeLessThanOrEqual(2);

    const loaded = await handleMcpRequest(
      {
        jsonrpc: "2.0",
        id: 4,
        method: "tools/call",
        params: {
          name: "agent_skill_load",
          arguments: {
            skillId: "code-reviewer",
            target: "codex"
          }
        }
      },
      { rootDir: cwd }
    );
    const loadText = String((loaded?.result as { content: Array<{ text: string }> }).content[0].text);
    const loadJson = JSON.parse(loadText);
    expect(loadJson.id).toBe("code-reviewer");
    expect(loadJson.path).toBe(".codex/skills/code-reviewer/SKILL.md");
    expect(loadJson.content).toContain("## Runtime Contract");
  });
});
