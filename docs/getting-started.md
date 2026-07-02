# Getting Started

Agent Skill OS installs reusable expert skills into AI coding agents and generates a local runtime that helps agents choose what to load.

Core principle:

```txt
Install many. Load few.
```

## Install

```bash
npm install -g agent-skill-os
```

## Install a Pack

```bash
aso install-pack developer-productivity --target codex --dir .
```

This writes:

```txt
.agent-skill-os/
  manifest.json
  skill-lock.json
  router.json
  skill-index.json
  usage.md
.codex/
  AGENTS.md
  skills/
```

## Ask Your Agent

```txt
Review this pull request.
```

The agent should read `.agent-skill-os/router.json`, select one primary skill, load only the selected `SKILL.md`, follow its Runtime Contract, and validate the answer against the skill Quality Bar.

## Useful Commands

```bash
aso list
aso search readme
aso recommend "review this pull request"
aso use code-reviewer --target codex
aso quality
aso doctor --target codex --dir .
```
