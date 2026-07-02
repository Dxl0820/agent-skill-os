# Changelog

## Agent Skill OS v0.5.0

This release adds team/private registry pack support.

### Highlights

- Added remote pack loading from configured registries.
- Added `aso install-pack <registry>/<pack-id>` for team skill packs.
- Added private registry documentation.
- Preserved the runtime rule that packs install together but skills execute selectively.

### Verified

```bash
pnpm --filter @agent-skill-os/core build
pnpm --filter agent-skill-os test
```

## Agent Skill OS v0.4.0

This release adds the Agent Skill OS MCP server.

### Highlights

- Added `aso mcp`, a local MCP stdio server for Agent Skill OS runtime operations.
- Added MCP tools: `agent_skill_search`, `agent_skill_recommend`, `agent_skill_load`, `agent_skill_list_installed`, `agent_skill_install`, and `agent_skill_validate`.
- Kept MCP aligned with the runtime policy: one primary skill, at most two supporting skills, never load all skills by default.
- Added `docs/mcp.md`.
- Added MCP tests for initialization, tool discovery, recommendation, and skill loading.

### Verified

```bash
pnpm --filter agent-skill-os test
pnpm --filter agent-skill-os build
```

## Agent Skill OS v0.3.0

This release adds local-first remote registry support.

### Highlights

- Added remote registry config support at `~/.agent-skill-os/config.json`.
- Added `aso registry list`, `aso registry add`, `aso registry remove`, and `aso registry refresh`.
- Added `aso search <query> --remote` for configured remote registries.
- Added `aso install <registry>/<skill-id>` for installing from a registry JSON index.
- Added `aso install-url <url>` for installing a raw remote or local `SKILL.md`.
- Added source URL warnings before installing remote skills.
- Added remote registry core tests and CLI smoke coverage.

### Verified

```bash
pnpm --filter @agent-skill-os/core test
pnpm --filter agent-skill-os test
pnpm validate
pnpm test
pnpm build
pnpm --filter agent-skill-os pack --dry-run
```

## Agent Skill OS v0.2.0

This release adds the Agent Skill Runtime layer.

### Highlights

- Added runtime metadata to built-in skills: capabilities, triggers, routing, and runtime contracts.
- Added `## Runtime Contract` to every built-in `SKILL.md`.
- Added `.agent-skill-os/router.json`, `.agent-skill-os/skill-index.json`, and `.agent-skill-os/usage.md` generation during install.
- Strengthened Codex `.codex/AGENTS.md` so agents read the router, select one primary skill, and avoid loading every skill by default.
- Added `aso use` for target-specific skill loading instructions.
- Added `aso use-pack` for pack-level runtime usage guidance.
- Added `aso recommend` for deterministic task-to-skill recommendations.
- Updated README and contribution docs around the principle: Install many. Load few.

### Verified

```bash
pnpm validate
pnpm test
pnpm build
pnpm aso recommend "review this pull request"
pnpm aso use code-reviewer --target codex
pnpm aso install-pack developer-productivity --target codex --dir ./tmp/runtime-demo
```

## Agent Skill OS v0.1.2

This release focuses on launch readiness, npm package correctness, README clarity, and demo quality.

### Highlights

- Bumped project, package, CLI, manifest, generated skill, and built-in skill versions to `0.1.2`.
- Regenerated `generated/registry.generated.json` for the `0.1.2` built-in skills.
- Fixed npm package contents so the CLI package includes built-in `skills/`, `packs/`, and `generated/` assets.
- Updated README Quick Start to separate user installation from local development.
- Kept one README first-screen demo GIF and added generated structure in the Demo section.
- Added `pnpm check:demo` and wired it into `pnpm validate`.
- Added security policy and richer GitHub issue templates.

### Verified

```bash
pnpm validate
pnpm test
pnpm build
pnpm --filter agent-skill-os publish --dry-run
```

## Agent Skill OS v0.1.1

This release focuses on launch readiness, contributor experience, and GitHub presentation.

### Highlights

- Improved README first screen with badges, Before / After section, Demo GIF placement, and faster Quick Start.
- Added `aso new-skill` for creating new skill templates from the CLI.
- Added `/showcase` page with Developer Productivity, Launch Kit, and AI Video Creator scenarios.
- Added demo repository examples for Codex skill installation.
- Added a dedicated skill contribution guide.
- Added assets directory for demo GIFs and screenshots.
- Bumped version from `0.1.0` to `0.1.1`.

### New Command

```bash
aso new-skill my-skill --category coding --target codex
```

### Verified

```bash
pnpm install
pnpm validate
pnpm test
pnpm build
pnpm aso new-skill demo-skill --category coding
pnpm aso install-pack developer-productivity --target codex --dir ./tmp/demo
```

### Goal

Agent Skill OS helps developers install reusable expert skills into AI coding agents in 30 seconds.
