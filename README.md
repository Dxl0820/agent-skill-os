# Agent Skill OS

Install reusable expert skills into AI coding agents like Codex, Claude Code, and Cursor.

**Agent Skill OS is the package manager and runtime contract layer for AI agent skills.**

[![npm version](https://img.shields.io/npm/v/agent-skill-os?color=2563eb)](https://www.npmjs.com/package/agent-skill-os)
[![CI](https://github.com/Dxl0820/agent-skill-os/actions/workflows/ci.yml/badge.svg)](https://github.com/Dxl0820/agent-skill-os/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-059669.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Dxl0820/agent-skill-os?style=social)](https://github.com/Dxl0820/agent-skill-os/stargazers)

```txt
Install many. Load few.
```

Agent Skill OS lets you install a library of reusable skills into a project while the runtime router helps the agent load only the skills relevant to the current task.

<p align="center">
  <img src="assets/demo.gif" alt="Agent Skill OS demo" width="900" />
</p>

<p>
  <a href="#quick-start">Quick Start</a> |
  <a href="#what-you-get">What You Get</a> |
  <a href="#how-it-works">How It Works</a> |
  <a href="#commands">Commands</a> |
  <a href="#docs">Docs</a>
</p>

## Quick Start

Install the CLI:

```bash
npm install -g agent-skill-os
aso --version
```

Install a skill pack into a Codex project:

```bash
aso install-pack developer-productivity --target codex --dir .
```

Ask your agent:

```txt
Review this pull request.
```

The generated loader tells the agent to read `.agent-skill-os/router.json`, choose one primary skill, load only the selected `SKILL.md`, follow its Runtime Contract, and validate the answer against the skill Quality Bar.

## Demo

Install one reusable skill into Codex:

```bash
aso install readme-writer --target codex --dir ./demo
```

Generated structure:

```txt
demo/
  .agent-skill-os/
    manifest.json
    skill-lock.json
    router.json
    skill-index.json
    usage.md
  .codex/
    AGENTS.md
    skills/
      readme-writer/
        SKILL.md
```

Load instructions for the agent:

```bash
aso use readme-writer --target codex
```

## What You Get

| Layer | What it does |
| --- | --- |
| Skills | Versioned Markdown workflows with metadata, triggers, inputs, output contracts, quality bars, and safety notes. |
| Packs | Curated groups of related skills that install together. |
| Runtime files | `manifest.json`, `skill-lock.json`, `router.json`, `skill-index.json`, and `usage.md`. |
| Target loaders | Codex, Claude, Cursor, and generic loader files that tell the agent how to use installed skills. |
| Router policy | One primary skill and up to two supporting skills for each task. |
| Quality checks | Deterministic validation for skill structure, runtime contracts, routing, examples, and safety notes. |
| MCP server | Runtime tools for dynamic skill search, recommendation, loading, installation, and validation. |

## Why It Exists

Before Agent Skill OS:

```txt
Copy-paste old prompts.
Rewrite the same workflow in every project.
Ask the agent to read too much context.
Lose track of which prompt, version, or target was used.
```

After Agent Skill OS:

```txt
Install reusable skills.
Generate target-specific loader files.
Route each task to the right skill.
Load only the relevant skill files.
Validate output against a Runtime Contract.
```

## How It Works

1. Install skills or packs into a project.
2. Agent Skill OS writes target-specific loader files and shared runtime metadata.
3. The agent reads the router, selects the relevant skill, and loads only that skill file.
4. The agent follows the skill Runtime Contract.
5. The result is checked against the skill Quality Bar.

Default runtime policy:

```json
{
  "loadAllSkillsByDefault": false,
  "maxPrimarySkills": 1,
  "maxSupportingSkills": 2,
  "stateSelectedSkillBeforeExecution": true
}
```

## Built-In Packs

| Pack | Use it for | Install |
| --- | --- | --- |
| `developer-productivity` | code review, tests, bug reproduction, refactors, PR summaries | `aso install-pack developer-productivity --target codex --dir .` |
| `repo-maintainer` | issues, changelogs, release notes, roadmaps | `aso install-pack repo-maintainer --target codex --dir .` |
| `launch-kit` | PRDs, README files, landing copy, launch posts | `aso install-pack launch-kit --target codex --dir .` |
| `ai-video-creator` | demo videos, short scripts, titles, thumbnails | `aso install-pack ai-video-creator --target codex --dir .` |

Agent Skill OS ships with 24 built-in skills across documentation, coding, GitHub maintenance, product launch, content, and research.

## Targets

| Target | Generated files |
| --- | --- |
| `codex` | `.codex/AGENTS.md`, `.codex/skills/<skill-id>/SKILL.md` |
| `claude` | `.claude/CLAUDE.md`, `.claude/skills/<skill-id>/SKILL.md` |
| `cursor` | `.cursor/rules/agent-skill-os.mdc`, `.cursor/rules/<skill-id>.mdc` |
| `generic` | `agent-skills/<skill-id>/SKILL.md` |

Every target also receives shared runtime files in `.agent-skill-os/`.

## Commands

| Job | Command |
| --- | --- |
| List built-in skills | `aso list` |
| Search skills | `aso search readme` |
| Show a skill | `aso show readme-writer` |
| Install one skill | `aso install readme-writer --target codex --dir .` |
| Install a pack | `aso install-pack developer-productivity --target codex --dir .` |
| Print agent load instructions | `aso use readme-writer --target codex` |
| Recommend skills for a task | `aso recommend "review this pull request"` |
| Check installed project | `aso doctor --target codex --dir .` |
| Run skill quality checks | `aso quality` |
| Start MCP server | `aso mcp` |

Registry and versioning commands:

```bash
aso registry list
aso registry add company https://github.com/company/private-agent-skills/raw/main/registry.json
aso registry refresh
aso search readme --remote
aso install company/security-reviewer --target codex --dir .
aso outdated --dir .
aso update readme-writer --target codex --dir .
aso uninstall readme-writer --target codex --dir .
aso lock --dir .
```

## Skill Format

Every built-in skill lives at `skills/<skill-id>/SKILL.md` and includes:

- frontmatter metadata
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

The Runtime Contract is the difference between a prompt and an agent skill. It defines required inputs, execution steps, output shape, quality checks, and failure mode.

## Remote and Private Registries

A registry is a JSON index that points to raw `SKILL.md` files and pack definitions.

```bash
aso registry add company https://github.com/company/private-agent-skills/raw/main/registry.json
aso registry refresh
aso install company/security-reviewer --target codex --dir .
aso install-pack company/frontend-team --target codex --dir .
```

Remote skills are text instructions, not executable code. Review untrusted registry sources before installing them.

## MCP

Run the MCP server:

```bash
aso mcp
```

MCP tools include `agent_skill_search`, `agent_skill_recommend`, `agent_skill_load`, `agent_skill_list_installed`, `agent_skill_install`, and `agent_skill_validate`.

## Development

Run the repository locally:

```bash
pnpm install
pnpm validate
pnpm test
pnpm build
```

Repository layout:

```txt
apps/web          Next.js discovery site and docs
packages/core     Schema, registry, validation, installer, runtime, quality
packages/cli      Commander-based aso CLI and MCP server
skills/           24 built-in skills
packs/            4 built-in skill packs
scripts/          Registry generation, validation, demo checks, CLI wrapper
generated/        Generated registry JSON
```

## Docs

Start here:

- [Getting started](docs/getting-started.md)
- [Stable platform](docs/stable-platform.md)
- [Migration guide](docs/migration.md)
- [Security](docs/security.md)

Concepts:

- [Skills](docs/concepts/skills.md)
- [Packs](docs/concepts/packs.md)
- [Router](docs/concepts/router.md)
- [Runtime Contract](docs/concepts/runtime-contract.md)

Deep dives:

- [Registry](docs/registry.md)
- [MCP](docs/mcp.md)
- [Private registries](docs/private-registry.md)
- [Quality](docs/quality.md)
- [Versioning](docs/versioning.md)
- [Marketplace foundation](docs/marketplace.md)
- [Contributing a skill](docs/contributing-skill.md)

## Contributing

Contributions are welcome, but new skills should be narrow, repeatable, safe, and testable.

See [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/contributing-skill.md](docs/contributing-skill.md).

## Security

Agent Skill OS distributes instructions to agents. Skills can influence agent behavior, so review remote skills before installing them and do not install untrusted private registries blindly.

See [SECURITY.md](SECURITY.md) and [docs/security.md](docs/security.md).

## License

MIT
