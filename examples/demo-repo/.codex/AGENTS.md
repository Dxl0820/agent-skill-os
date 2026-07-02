# Agent Skill OS

This project uses Agent Skill OS.

## How to Use Skills

Before starting a task:

1. Read `.agent-skill-os/router.json`.
2. Select the most relevant installed skill.
3. Load only that skill's `SKILL.md`.
4. If needed, load at most two supporting skills.
5. Do not load every installed skill by default.
6. State the selected skill before executing.
7. Follow the selected skill's workflow and quality bar.
8. Verify the output against the skill's runtime contract.

## Installed Skills

| Skill | When to use | Path |
| --- | --- | --- |
| `bug-reproducer` | Confirm a reported bug | `.codex/skills/bug-reproducer/SKILL.md` |
| `code-reviewer` | Review a pull request | `.codex/skills/code-reviewer/SKILL.md` |
| `pr-summarizer` | Summarize a pull request | `.codex/skills/pr-summarizer/SKILL.md` |
| `readme-writer` | Improve open-source project presentation | `.codex/skills/readme-writer/SKILL.md` |
| `refactor-planner` | Plan a safe refactor | `.codex/skills/refactor-planner/SKILL.md` |
| `test-writer` | Add regression tests | `.codex/skills/test-writer/SKILL.md` |

## Policy

- Use one primary skill per task.
- Use supporting skills only when needed.
- Never combine unrelated skills.
- If no skill matches, proceed normally and suggest installing a relevant skill.
- Install many. Load few.
