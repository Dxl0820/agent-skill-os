# Skill Versioning and Lockfiles

Agent Skill OS tracks installed skill state in `.agent-skill-os/skill-lock.json`.

The lockfile records the skill id, version, target, installed path, install source, compatibility range, and declared dependencies. It is generated during `aso install`, `aso install-pack`, `aso init`, `aso update`, and `aso uninstall`.

## Commands

```bash
aso outdated --dir .
aso update readme-writer --target codex --dir .
aso update-pack developer-productivity --target codex --dir .
aso uninstall readme-writer --target codex --dir .
aso lock --dir .
```

## Metadata

Skills can declare compatibility and dependencies in their frontmatter:

```yaml
compatibleWith:
  aso: ">=0.2.0"
dependencies:
  - readme-writer
optionalDependencies:
  - launch-post-writer
```

Required dependencies are installed first for built-in skills. Optional dependencies are recorded for routing and review, but are not installed automatically.

## Lockfile

Example:

```json
{
  "version": "0.7.0",
  "generatedAt": "2026-07-02T00:00:00.000Z",
  "skills": [
    {
      "id": "readme-writer",
      "version": "0.2.0",
      "target": "codex",
      "path": ".codex/skills/readme-writer/SKILL.md",
      "installedAt": "2026-07-02T00:00:00.000Z",
      "source": {
        "type": "builtin"
      },
      "compatibleWith": {
        "aso": ">=0.2.0"
      },
      "dependencies": [],
      "optionalDependencies": []
    }
  ]
}
```

## Remote Skills

Remote registry and direct URL installs record their source in the lockfile:

- `registry`: installed through `aso install <registry>/<skill-id>`
- `github`: installed directly from a GitHub URL
- `url`: installed directly from another HTTP URL
- `file`: installed from a local file path

`aso outdated` currently compares built-in skills only. Remote registry version updates should be handled by refreshing the registry and reinstalling or updating the remote pack.
