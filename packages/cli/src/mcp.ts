import path from "node:path";
import { createInterface } from "node:readline";
import fs from "fs-extra";
import {
  getSkillById,
  getSkillRelativePath,
  installSkill,
  loadConfiguredRemoteRegistries,
  loadRemoteSkillFromRegistry,
  loadRemoteSkillUrl,
  loadSkills,
  recommendSkills,
  searchRemoteRegistrySkills,
  searchSkills,
  toSourceUrl,
  validateAllSkills,
  type InstallTarget
} from "@agent-skill-os/core";

export const mcpServerVersion = "0.4.0";

export interface McpServerOptions {
  rootDir?: string;
}

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: unknown;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
}

const tools = [
  {
    name: "agent_skill_search",
    description: "Search built-in or configured remote Agent Skill OS skills.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        remote: { type: "boolean" }
      },
      required: ["query"]
    }
  },
  {
    name: "agent_skill_recommend",
    description: "Recommend one primary skill and optional supporting skills for a task.",
    inputSchema: {
      type: "object",
      properties: {
        task: { type: "string" },
        target: { type: "string" },
        limit: { type: "number" }
      },
      required: ["task"]
    }
  },
  {
    name: "agent_skill_load",
    description: "Load one skill's metadata and SKILL.md content. Do not use this to load every skill by default.",
    inputSchema: {
      type: "object",
      properties: {
        skillId: { type: "string" },
        target: { type: "string" }
      },
      required: ["skillId"]
    }
  },
  {
    name: "agent_skill_list_installed",
    description: "List skills installed in a project manifest.",
    inputSchema: {
      type: "object",
      properties: {
        dir: { type: "string" },
        target: { type: "string" }
      }
    }
  },
  {
    name: "agent_skill_install",
    description: "Install a built-in, registry, or URL skill into a project.",
    inputSchema: {
      type: "object",
      properties: {
        skillId: { type: "string" },
        sourceUrl: { type: "string" },
        target: { type: "string" },
        dir: { type: "string" },
        force: { type: "boolean" }
      },
      required: ["target"]
    }
  },
  {
    name: "agent_skill_validate",
    description: "Validate built-in skills and runtime contracts.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  }
] as const;

export async function handleMcpRequest(request: JsonRpcRequest, options: McpServerOptions = {}): Promise<JsonRpcResponse | undefined> {
  if (request.id === undefined || request.id === null) {
    return undefined;
  }
  try {
    if (request.method === "initialize") {
      return response(request.id, {
        protocolVersion: protocolVersion(request.params),
        capabilities: { tools: {} },
        serverInfo: {
          name: "agent-skill-os",
          version: mcpServerVersion
        }
      });
    }
    if (request.method === "ping") {
      return response(request.id, {});
    }
    if (request.method === "tools/list") {
      return response(request.id, { tools });
    }
    if (request.method === "tools/call") {
      const params = objectParams(request.params);
      const name = stringValue(params.name, "name");
      const args = objectParams(params.arguments || {});
      return response(request.id, {
        content: [
          {
            type: "text",
            text: JSON.stringify(await callTool(name, args, options), null, 2)
          }
        ]
      });
    }
    return errorResponse(request.id, -32601, "Method not found: " + request.method);
  } catch (error) {
    return errorResponse(request.id, -32000, error instanceof Error ? error.message : String(error));
  }
}

export async function runMcpServer(options: McpServerOptions = {}): Promise<void> {
  const reader = createInterface({ input: process.stdin, crlfDelay: Infinity });
  for await (const line of reader) {
    if (!line.trim()) {
      continue;
    }
    const responseMessage = await handleMcpRequest(JSON.parse(line) as JsonRpcRequest, options);
    if (responseMessage) {
      process.stdout.write(JSON.stringify(responseMessage) + "\n");
    }
  }
}

async function callTool(name: string, args: Record<string, unknown>, options: McpServerOptions): Promise<unknown> {
  if (name === "agent_skill_search") {
    const query = stringValue(args.query, "query");
    if (args.remote === true) {
      return searchRemoteRegistrySkills(await loadConfiguredRemoteRegistries(), query).map((result) => ({
        registry: result.registry,
        id: result.skill.id,
        version: result.skill.version,
        summary: result.skill.summary,
        source: result.skill.source.url
      }));
    }
    return searchSkills(await loadMcpSkills(options), query).map((skill) => skill.metadata);
  }
  if (name === "agent_skill_recommend") {
    const target = targetValue(args.target || "codex");
    const recommendations = recommendSkills(await loadMcpSkills(options), stringValue(args.task, "task"), {
      limit: numberValue(args.limit, 3)
    });
    const [primary, ...supporting] = recommendations;
    return {
      policy: {
        loadAllSkillsByDefault: false,
        maxPrimarySkills: 1,
        maxSupportingSkills: 2
      },
      primary: primary
        ? {
            id: primary.skill.metadata.id,
            reason: primary.reason,
            path: toMcpPath(getSkillRelativePath(primary.skill.metadata.id, target))
          }
        : null,
      supporting: supporting.slice(0, 2).map((recommendation) => ({
        id: recommendation.skill.metadata.id,
        reason: recommendation.reason,
        path: toMcpPath(getSkillRelativePath(recommendation.skill.metadata.id, target))
      }))
    };
  }
  if (name === "agent_skill_load") {
    const target = targetValue(args.target || "codex");
    const skillId = stringValue(args.skillId, "skillId");
    const skill = getSkillById(await loadMcpSkills(options), skillId);
    if (!skill) {
      throw new Error("Skill not found: " + skillId);
    }
    return {
      id: skill.metadata.id,
      metadata: skill.metadata,
      path: toMcpPath(getSkillRelativePath(skill.metadata.id, target)),
      content: skill.raw
    };
  }
  if (name === "agent_skill_list_installed") {
    const dir = path.resolve(stringValue(args.dir || ".", "dir"));
    const manifestPath = path.join(dir, ".agent-skill-os", "manifest.json");
    if (!(await fs.pathExists(manifestPath))) {
      return { manifestPath, skills: [] };
    }
    const manifest = JSON.parse((await fs.readFile(manifestPath, "utf8")).replace(/^\uFEFF/, ""));
    const target = args.target ? targetValue(args.target) : undefined;
    return {
      manifestPath,
      skills: (manifest.skills || []).filter((skill: { target: string }) => !target || skill.target === target)
    };
  }
  if (name === "agent_skill_install") {
    const target = targetValue(args.target);
    const dir = stringValue(args.dir || ".", "dir");
    const force = args.force === true;
    const sourceUrl = args.sourceUrl ? toSourceUrl(stringValue(args.sourceUrl, "sourceUrl")) : undefined;
    if (sourceUrl) {
      return installSkill({ skill: await loadRemoteSkillUrl(sourceUrl), target, dir, force });
    }
    const skillId = stringValue(args.skillId, "skillId");
    const skill = skillId.includes("/")
      ? (await loadRemoteSkillFromRegistry(skillId.split("/")[0], skillId.split("/")[1])).skill
      : getSkillById(await loadMcpSkills(options), skillId);
    if (!skill) {
      throw new Error("Skill not found: " + skillId);
    }
    return installSkill({ skill, target, dir, force });
  }
  if (name === "agent_skill_validate") {
    return validateAllSkills(await loadMcpSkills(options));
  }
  throw new Error("Unknown tool: " + name);
}

async function loadMcpSkills(options: McpServerOptions) {
  return loadSkills(options.rootDir ? { rootDir: options.rootDir } : undefined);
}

function response(id: string | number | null, result: unknown): JsonRpcResponse {
  return { jsonrpc: "2.0", id, result };
}

function errorResponse(id: string | number | null, code: number, message: string): JsonRpcResponse {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

function objectParams(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function stringValue(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Missing required string field: " + field);
  }
  return value;
}

function numberValue(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}

function targetValue(value: unknown): InstallTarget {
  const target = stringValue(value, "target");
  if (target === "generic" || target === "claude" || target === "codex" || target === "cursor") {
    return target;
  }
  throw new Error("Invalid target: " + target);
}

function protocolVersion(params: unknown): string {
  const value = objectParams(params).protocolVersion;
  return typeof value === "string" ? value : "2025-11-25";
}

function toMcpPath(value: string): string {
  return value.replace(/\\/g, "/");
}
