# Changelog

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
