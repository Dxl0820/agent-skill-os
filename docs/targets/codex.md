# Codex Target

Install to Codex:

```bash
aso install-pack developer-productivity --target codex --dir .
```

Generated files:

```txt
.codex/
  AGENTS.md
  skills/
    <skill-id>/SKILL.md
.agent-skill-os/
  router.json
  skill-index.json
  usage.md
  manifest.json
  skill-lock.json
```

`AGENTS.md` tells Codex to read the router, select one primary skill, and avoid loading every installed skill by default.
