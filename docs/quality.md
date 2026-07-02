# Skill Quality and Trust

Agent Skill OS uses deterministic static checks before adding social ratings or marketplace trust signals.

Run:

```bash
aso quality
aso quality --json
aso quality --min-grade A
```

## Checks

The quality checker verifies:

- Required body sections exist.
- Runtime Contract subsections exist.
- Routing triggers are specific enough.
- Capabilities are present.
- Output contract has enough concrete outputs.
- Failure mode explains when to ask for missing context.
- Basic unsafe or unsupported claims are flagged.

## Output

Each skill receives:

- `score`
- `grade`
- `safety`
- `routing`
- `runtimeContract`
- `issues`

Example:

```txt
✓ readme-writer grade=A score=100 safety=pass routing=good runtime=complete
```

## Trust Model

Quality checks are static and deterministic. They do not prove that a skill is safe, correct, or complete for every project.

Remote and private skills should still be reviewed before installation.
