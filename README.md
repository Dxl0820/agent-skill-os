# Agent Skill OS

Install battle-tested skills into your AI coding agent in 30 seconds.

Install many. Load few.

[![npm version](https://img.shields.io/npm/v/agent-skill-os?color=2563eb)](https://www.npmjs.com/package/agent-skill-os)
[![CI](https://github.com/Dxl0820/agent-skill-os/actions/workflows/ci.yml/badge.svg)](https://github.com/Dxl0820/agent-skill-os/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-059669.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Dxl0820/agent-skill-os?style=social)](https://github.com/Dxl0820/agent-skill-os/stargazers)

Before:

~~~txt
Copy-paste random prompts from old chats.
~~~

After:

~~~txt
aso install-pack developer-productivity --target codex --dir .
~~~

<p align="center">
  <img src="assets/demo.gif" alt="Agent Skill OS demo" width="900" />
</p>

~~~bash
pnpm add -g agent-skill-os
aso install readme-writer --target codex --dir .
aso install-pack developer-productivity --target codex --dir .
~~~

<p>
  <a href="#quick-start">Quick Start</a> •
  <a href="#demo">Demo</a> •
  <a href="#skills">Skills</a> •
  <a href="#cli">CLI</a> •
  <a href="#contributing">Contributing</a>
</p>

## Why

Agent Skill OS turns reusable prompts and workflows into installable Markdown skills with typed metadata, validation, packs, and target adapters.

Agent Skill OS is built around a runtime principle: install as many skills as a project needs, but ask the agent to load only the few skills relevant to the current task.

## Quick Start

### Use the CLI

Install Agent Skill OS and add a reusable skill to a Codex project:

~~~bash
pnpm add -g agent-skill-os
aso install readme-writer --target codex --dir ./demo
aso use readme-writer --target codex
aso recommend "review this pull request"
~~~

### Run this repository locally

~~~bash
pnpm install
pnpm validate
pnpm test
pnpm build
pnpm aso install-pack developer-productivity --target codex --dir .
~~~

## Demo

Install a reusable skill into Codex in seconds:

```bash
aso install readme-writer --target codex --dir ./demo
```

Generated structure:

```txt
demo/
  .agent-skill-os/
    manifest.json
  .codex/
    AGENTS.md
    skills/
      readme-writer/
        SKILL.md
```

Runtime files are generated alongside the installed skill:

```txt
demo/
  .agent-skill-os/
    manifest.json
    router.json
    skill-index.json
    usage.md
```

## Install a Skill

~~~bash
pnpm aso install readme-writer --target generic --dir ./tmp/demo
pnpm aso install readme-writer --target codex --dir ./tmp/demo-codex
~~~

## Install a Pack

~~~bash
pnpm aso install-pack developer-productivity --target generic --dir ./tmp/demo-pack
~~~

## Works With

- generic: writes to `agent-skills/<skill-id>/SKILL.md`
- claude: writes to `.claude/skills/<skill-id>/SKILL.md` and `.claude/CLAUDE.md`
- codex: writes to `.codex/skills/<skill-id>/SKILL.md` and updates `.codex/AGENTS.md`
- cursor: writes `.cursor/rules/<skill-id>.mdc` and `.cursor/rules/agent-skill-os.mdc`

## Skills

The MVP ships with 24 built-in skills across documentation, coding, GitHub maintenance, product launch, AI video/content, and research.

## Skill Format

Every skill lives at `skills/<skill-id>/SKILL.md` and includes frontmatter plus these sections:

- Role
- When to Use
- Inputs
- Workflow
- Runtime Contract
- Output Format
- Quality Bar
- Example Prompt
- Example Output
- Safety Notes

## CLI Reference

~~~bash
pnpm aso list
pnpm aso search readme
pnpm aso show readme-writer
pnpm aso install readme-writer --target generic --dir ./tmp/demo
pnpm aso install-pack developer-productivity --target generic --dir ./tmp/demo-pack
pnpm aso use readme-writer --target codex
pnpm aso use-pack developer-productivity --target codex
pnpm aso recommend "write a README for this repo"
pnpm aso registry add official https://example.com/registry.json
pnpm aso registry refresh
pnpm aso search readme --remote
pnpm aso install official/readme-writer --target codex --dir ./tmp/demo
pnpm aso install-url https://example.com/skills/readme-writer/SKILL.md --target codex --dir ./tmp/demo
pnpm aso outdated --dir ./tmp/demo
pnpm aso update readme-writer --target codex --dir ./tmp/demo
pnpm aso update-pack developer-productivity --target codex --dir ./tmp/demo-pack
pnpm aso uninstall readme-writer --target codex --dir ./tmp/demo
pnpm aso lock --dir ./tmp/demo
pnpm aso mcp
pnpm aso quality
pnpm aso validate
pnpm aso doctor --target generic --dir ./tmp/demo
~~~

## Runtime

Agent Skill OS v0.2 adds the runtime layer that helps an agent decide which installed skill to use.

- Registry: skill metadata includes capabilities, triggers, routing, and runtime contracts.
- Router: `.agent-skill-os/router.json` maps tasks to installed skills.
- Loader: target files such as `.codex/AGENTS.md` tell the agent how to load only the selected skill.
- Runtime Contract: each `SKILL.md` defines required inputs, execution steps, output contract, and failure mode.
- Developer Interface: `aso use` prints loading instructions, and `aso recommend` maps a task to recommended skills.

## Remote Registry

Agent Skill OS v0.3 adds local-first remote registry support. A registry is a JSON index that points to raw `SKILL.md` files.

~~~bash
aso registry add official https://example.com/registry.json
aso registry refresh
aso search readme --remote
aso install official/readme-writer --target codex --dir .
aso install-url https://example.com/skills/readme-writer/SKILL.md --target codex --dir .
~~~

Remote skills are treated as text instructions, not executable code. The CLI prints the source URL before installing remote skills so you can review untrusted content.

## MCP Server

Agent Skill OS v0.4 exposes the runtime through MCP:

~~~bash
aso mcp
~~~

MCP tools include `agent_skill_search`, `agent_skill_recommend`, `agent_skill_load`, `agent_skill_list_installed`, `agent_skill_install`, and `agent_skill_validate`.

The MCP server follows the same policy: do not load all skills by default; recommend one primary skill and at most two supporting skills.

See [docs/mcp.md](docs/mcp.md).

## Team Registries

Agent Skill OS v0.5 supports team/private registry packs:

~~~bash
aso registry add company https://github.com/company/private-agent-skills/raw/main/registry.json
aso registry refresh
aso install company/security-reviewer --target codex --dir .
aso install-pack company/frontend-team --target codex --dir .
~~~

See [docs/private-registry.md](docs/private-registry.md).

## Quality Checks

Agent Skill OS v0.6 adds deterministic skill quality and trust checks:

~~~bash
aso quality
aso quality --json
aso quality --min-grade A
~~~

The checker reports grade, safety, routing quality, runtime contract completeness, and issues. See [docs/quality.md](docs/quality.md).

## Versioning and Lockfiles

Agent Skill OS v0.7 records installed skill versions and sources in `.agent-skill-os/skill-lock.json`.

~~~bash
aso outdated --dir .
aso update readme-writer --target codex --dir .
aso update-pack developer-productivity --target codex --dir .
aso uninstall readme-writer --target codex --dir .
aso lock --dir .
~~~

Skill metadata can declare `compatibleWith`, `dependencies`, and `optionalDependencies`. Built-in skill dependencies are installed first; optional dependencies are recorded but not installed automatically.

See [docs/versioning.md](docs/versioning.md).

## Repository Structure

~~~txt
apps/web          Next.js static gallery and docs
packages/core     Schema, registry, validation, installer, packs
packages/cli      Commander-based aso CLI
skills/           24 built-in skills
packs/            4 skill packs
scripts/          Registry generation and validation scripts
generated/        Generated registry JSON
~~~

## Development

~~~bash
pnpm install
pnpm dev
pnpm build
~~~

## Roadmap

### v0.1

- Local CLI installer
- 24 built-in skills
- 4 skill packs
- Static skill gallery
- Validation and registry generation

### v0.2

- Agent Skill Runtime
- Runtime router and skill index
- Stronger target loaders
- Runtime Contract in every built-in skill
- `aso use`, `aso use-pack`, and `aso recommend`

### v0.3

- Remote registry config
- Registry add/list/remove/refresh
- Remote search
- Install from registry skill IDs
- Install from raw SKILL.md URLs

### v0.4

- MCP server runtime interface
- Dynamic skill search, recommend, load, install, and validate tools
- Stdio JSON-RPC transport through `aso mcp`

### v0.5

- Team/private registries
- Remote team pack install

### v0.6

- Quality and trust checks

### v0.7

- Skill dependencies and versioning
- `skill-lock.json`
- Update, uninstall, outdated, and lock commands

### v0.8+

- Web registry discovery
- Marketplace foundation

## Growth Scenarios

1. Developer productivity: install `developer-productivity` so an agent can review code, write tests, reproduce bugs, and summarize PRs.
2. Open-source launch: install `launch-kit` so an agent can write a PRD, README, landing page copy, launch posts, and demo video plan.
3. AI video creator: install `ai-video-creator` so an agent can write short video scripts, demo scripts, titles, thumbnails, and source summaries.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md), [docs/contributing-skill.md](docs/contributing-skill.md), [docs/registry.md](docs/registry.md), [docs/mcp.md](docs/mcp.md), [docs/private-registry.md](docs/private-registry.md), [docs/quality.md](docs/quality.md), and [docs/versioning.md](docs/versioning.md).

## License

MIT
