# Cursor Target

Install to Cursor:

```bash
aso install-pack developer-productivity --target cursor --dir .
```

Generated files:

```txt
.cursor/
  rules/
    <skill-id>.mdc
    agent-skill-os.mdc
.agent-skill-os/
  router.json
  skill-index.json
  usage.md
  manifest.json
  skill-lock.json
```

Cursor rules include the skill instructions and the Agent Skill OS runtime loader.
