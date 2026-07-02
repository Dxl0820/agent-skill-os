# Generic Target

Install portable skills for any agent:

```bash
aso install-pack developer-productivity --target generic --dir .
```

Generated files:

```txt
agent-skills/
  <skill-id>/SKILL.md
.agent-skill-os/
  router.json
  skill-index.json
  usage.md
  manifest.json
  skill-lock.json
```

Use the generic target when an agent does not have a dedicated adapter yet.
