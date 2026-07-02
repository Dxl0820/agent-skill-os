# Migration Guide

This guide covers migration from the v0.1 package-manager release to the v1.0 stable platform.

## From v0.1.x

Reinstall or refresh skills so runtime files are generated:

```bash
aso install readme-writer --target codex --dir .
aso install-pack developer-productivity --target codex --dir . --force
```

New runtime files:

- `.agent-skill-os/router.json`
- `.agent-skill-os/skill-index.json`
- `.agent-skill-os/usage.md`
- `.agent-skill-os/skill-lock.json`
- target loaders such as `.codex/AGENTS.md`

## From v0.2-v0.6

Run:

```bash
aso lock --dir .
aso quality
```

`skill-lock.json` records installed skill versions, sources, targets, and paths.

## From v0.7-v0.9

No project file migration is required for built-in skills.

Recommended checks:

```bash
aso outdated --dir .
aso update-pack developer-productivity --target codex --dir .
aso doctor --target codex --dir .
```

## Compatibility

The stable v1.0 platform preserves:

- existing skill ids
- existing pack ids
- target adapters: generic, codex, claude, cursor
- runtime policy: install many, load few
- remote registry format from v0.3
- MCP stdio tools from v0.4

Breaking schema changes should wait for a future major version.
