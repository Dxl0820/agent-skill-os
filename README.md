# Agent Skill OS

Install battle-tested skills into your AI coding agent in 30 seconds.

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

## Quick Start

### Use the CLI

Install Agent Skill OS and add a reusable skill to a Codex project:

~~~bash
pnpm add -g agent-skill-os
aso install readme-writer --target codex --dir ./demo
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
- claude: writes to `.claude/skills/<skill-id>/SKILL.md`
- codex: writes to `.codex/skills/<skill-id>/SKILL.md` and updates `.codex/AGENTS.md`
- cursor: writes `.cursor/rules/<skill-id>.mdc`

## Skills

The MVP ships with 24 built-in skills across documentation, coding, GitHub maintenance, product launch, AI video/content, and research.

## Skill Format

Every skill lives at `skills/<skill-id>/SKILL.md` and includes frontmatter plus these sections:

- Role
- When to Use
- Inputs
- Workflow
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
pnpm aso validate
pnpm aso doctor --target generic --dir ./tmp/demo
~~~

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

- Community skill submission workflow
- Skill rating metadata
- More target adapters
- Better Codex/Cursor/Claude templates
- Skill dependency support

### v0.3

- MCP server
- Local desktop app
- Skill execution preview
- Team skill registry

## Growth Scenarios

1. Developer productivity: install `developer-productivity` so an agent can review code, write tests, reproduce bugs, and summarize PRs.
2. Open-source launch: install `launch-kit` so an agent can write a PRD, README, landing page copy, launch posts, and demo video plan.
3. AI video creator: install `ai-video-creator` so an agent can write short video scripts, demo scripts, titles, thumbnails, and source summaries.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/contributing-skill.md](docs/contributing-skill.md).

## License

MIT
