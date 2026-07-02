# Packs

A Pack is a curated group of related Skills.

Correct model:

```txt
Pack = install together
Skill = execute selectively
Router = choose relevant skill
```

Agents should not run every skill in a pack at once.

Install a pack:

```bash
aso install-pack developer-productivity --target codex --dir .
```

Then the runtime router decides which installed skill is relevant for each task.
