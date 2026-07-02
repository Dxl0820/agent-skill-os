# Claude Target

Install to Claude:

```bash
aso install-pack developer-productivity --target claude --dir .
```

Generated files:

```txt
.claude/
  CLAUDE.md
  skills/
    <skill-id>/SKILL.md
.agent-skill-os/
  router.json
  skill-index.json
  usage.md
  manifest.json
  skill-lock.json
```

`CLAUDE.md` contains Agent Skill OS runtime usage guidance for selecting and loading skills.
