# MCP Server

Agent Skill OS exposes a local MCP server through the CLI:

```bash
aso mcp
```

The server uses MCP stdio transport: clients start `aso mcp` as a subprocess and exchange newline-delimited JSON-RPC messages over stdin/stdout. See the official transport specification: <https://modelcontextprotocol.io/specification/2025-11-25/basic/transports>.

The server is focused only on Agent Skill OS runtime operations.

## Tools

### `agent_skill_search`

Search built-in or configured remote skills.

```json
{
  "query": "readme",
  "remote": false
}
```

### `agent_skill_recommend`

Recommend one primary skill and up to two supporting skills for a task.

```json
{
  "task": "review this pull request",
  "target": "codex",
  "limit": 3
}
```

The response includes the runtime policy:

```json
{
  "policy": {
    "loadAllSkillsByDefault": false,
    "maxPrimarySkills": 1,
    "maxSupportingSkills": 2
  }
}
```

### `agent_skill_load`

Load one selected skill's metadata and `SKILL.md` content.

```json
{
  "skillId": "code-reviewer",
  "target": "codex"
}
```

Do not use this tool to load every installed skill by default.

### `agent_skill_list_installed`

List installed project skills from `.agent-skill-os/manifest.json`.

### `agent_skill_install`

Install a built-in skill, registry skill, or raw URL skill into a project.

### `agent_skill_validate`

Validate built-in skills and runtime contracts.

## Runtime Policy

The MCP server follows the same Agent Skill OS runtime policy:

1. Do not load all installed skills by default.
2. Recommend one primary skill.
3. Return at most two supporting skills.
4. Load only the selected skill content.
5. Preserve the Runtime Contract so agents can validate output.

## Example Client Request

```json
{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}
```

```json
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"agent_skill_recommend","arguments":{"task":"review this pull request","target":"codex"}}}
```
