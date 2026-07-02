# Remote Registry

Agent Skill OS remote registries are local-first JSON indexes that point to raw `SKILL.md` files.

They let teams and communities publish skills without requiring an account system, database, or hosted marketplace.

## Commands

```bash
aso registry list
aso registry add official https://example.com/registry.json
aso registry remove official
aso registry refresh
aso search readme --remote
aso install official/readme-writer --target codex --dir .
aso install-url https://example.com/skills/readme-writer/SKILL.md --target codex --dir .
```

## Registry Config

Agent Skill OS stores configured registries in:

```txt
~/.agent-skill-os/config.json
```

The config contains registry names and source URLs:

```json
{
  "version": "0.3.0",
  "registries": [
    {
      "name": "official",
      "url": "https://example.com/registry.json"
    }
  ]
}
```

## Registry Format

```json
{
  "version": "0.3.0",
  "name": "official",
  "description": "Official Agent Skill OS registry",
  "skills": [
    {
      "id": "readme-writer",
      "version": "0.2.0",
      "summary": "Create high-converting GitHub README files.",
      "source": {
        "type": "github",
        "url": "https://raw.githubusercontent.com/Dxl0820/agent-skill-os/main/skills/readme-writer/SKILL.md"
      }
    }
  ],
  "packs": []
}
```

Supported source types:

- `github`
- `url`
- `file`

Agent Skill OS fetches the source URL as text and parses it as `SKILL.md`.

## Security Model

Remote skills are text instructions, not executable code.

The CLI prints the source URL before installing remote skills. Review untrusted skills before use, especially skills that ask agents to access secrets, credentials, private code, or external services.

Do not silently install skills from unknown registries.

Checksums are reserved for a future release.
