# Stable Platform

Agent Skill OS v1.0 is the stable baseline for using skills as an operating layer inside AI coding agents.

## Stable Surfaces

- Skill schema
- Pack schema
- Remote registry schema
- CLI commands
- Runtime files
- Target adapters
- MCP stdio tools
- Quality checks

## Stable CLI Commands

```bash
aso list
aso search <query>
aso show <skill-id>
aso install <skill-id>
aso install-pack <pack-id>
aso uninstall <skill-id>
aso outdated
aso update <skill-id>
aso update-pack <pack-id>
aso lock
aso use <skill-id>
aso use-pack <pack-id>
aso recommend "<task>"
aso registry list
aso registry add <name> <url>
aso registry remove <name>
aso registry refresh
aso install-url <url>
aso quality
aso mcp
aso validate
aso doctor
aso new-skill <skill-id>
```

## Stable Runtime Files

```txt
.agent-skill-os/
  manifest.json
  skill-lock.json
  router.json
  skill-index.json
  usage.md
```

Target loaders:

- `.codex/AGENTS.md`
- `.claude/CLAUDE.md`
- `.cursor/rules/agent-skill-os.mdc`

## Agent Contract

Agents should:

1. Read the runtime router.
2. Select one primary skill.
3. Select at most two supporting skills.
4. Load only relevant skill files.
5. Follow the selected skill Runtime Contract.
6. Validate output against the skill Quality Bar.
7. Avoid loading every installed skill by default.
