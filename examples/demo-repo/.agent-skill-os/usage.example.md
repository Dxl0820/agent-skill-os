# Agent Skill OS Runtime

This project uses Agent Skill OS.

## Principle

Install many. Load few.

## How to Use Skills

Before starting a task:

1. Read `.agent-skill-os/router.json`.
2. Classify the user task.
3. Select one primary skill.
4. Load only the selected skill's `SKILL.md`.
5. Load at most two supporting skills if required.
6. Do not load all skills by default.
7. State which skill you selected and why.
8. Execute the task according to the selected skill's workflow.
9. Verify the output against the skill's quality bar and runtime contract.

## Policy

- Use one primary skill per task.
- Use supporting skills only when needed.
- Never combine unrelated skills.
- If no skill matches, proceed normally and suggest installing a relevant skill.
