# Team and Private Registries

Agent Skill OS supports team and private registries without requiring accounts, billing, or a database.

Use a private Git repository, internal raw file host, or local file path that exposes a registry JSON file.

## Add a Private Registry

```bash
aso registry add company https://github.com/company/private-agent-skills/raw/main/registry.json
aso registry refresh
```

## Install a Team Skill

```bash
aso install company/security-reviewer --target codex --dir .
```

## Install a Team Pack

```bash
aso install-pack company/frontend-team --target codex --dir .
```

Packs remain installation units. Agents should still route and load individual skills through `.agent-skill-os/router.json`.

## Example Registry

```json
{
  "version": "0.3.0",
  "name": "company",
  "description": "Company private Agent Skill OS registry",
  "skills": [
    {
      "id": "security-reviewer",
      "version": "0.1.0",
      "summary": "Review code and workflows against internal security standards.",
      "source": {
        "type": "github",
        "url": "https://github.com/company/private-agent-skills/raw/main/skills/security-reviewer/SKILL.md"
      }
    }
  ],
  "packs": [
    {
      "id": "frontend-team",
      "name": "Frontend Team",
      "summary": "Frontend engineering standards and review workflows.",
      "skills": [
        "security-reviewer"
      ]
    }
  ]
}
```

## Security Notes

- Remote skills are text instructions, not executable code.
- Review every private skill before installing it.
- Do not put secrets in registry URLs, skill files, or examples.
- Prefer private Git repositories with normal team access controls.
- Installed private registry skills are recorded in `.agent-skill-os/skill-lock.json`; registry checksums are recorded when present.
