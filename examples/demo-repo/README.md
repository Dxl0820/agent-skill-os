# Demo Repo

This folder simulates a user project after installing Agent Skill OS skills into Codex.

## Scenario

A maintainer wants their coding agent to review changes, write tests, reproduce bugs, plan refactors, improve the README, and summarize pull requests with a shared workflow.

Install the pack:

~~~bash
pnpm aso install-pack developer-productivity --target codex --dir .
~~~

## Example Installed Structure

~~~txt
examples/demo-repo/
  .agent-skill-os/
    manifest.example.json
    router.json
    skill-index.json
    usage.md
  .codex/
    AGENTS.md
    skills/
      code-reviewer/
        SKILL.md
      test-writer/
        SKILL.md
      bug-reproducer/
        SKILL.md
      refactor-planner/
        SKILL.md
      readme-writer/
        SKILL.md
      pr-summarizer/
        SKILL.md
~~~

## How an Agent Uses It

The generated `.codex/AGENTS.md` points the coding agent to `.agent-skill-os/router.json`. When a task starts, the agent selects one primary skill, loads only that skill's `SKILL.md`, and optionally loads at most two supporting skills.

Install many. Load few. This keeps repo-specific agent behavior visible, versioned, and easy to review without loading every skill by default.
