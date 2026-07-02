# Skills

A Skill is a structured, reusable, versioned capability unit for AI agents.

It is more than a prompt. A Skill defines:

- identity and metadata
- capabilities and triggers
- compatible targets
- required inputs
- workflow
- output contract
- quality bar
- runtime contract
- failure mode
- safety notes
- examples

Every built-in skill lives at:

```txt
skills/<skill-id>/SKILL.md
```

## Runtime Contract

Every stable skill must include:

- Required Inputs
- Optional Inputs
- Execution Steps
- Output Contract
- Quality Checks
- Failure Mode

This contract lets agents execute and validate the skill instead of merely copying a prompt.
