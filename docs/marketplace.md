# Marketplace Foundation

Agent Skill OS v0.9 adds marketplace trust foundations without adding accounts, payments, ratings, or a hosted marketplace.

The goal is to make skill discovery safer before adding community scale.

## Trust Signals

Each skill can be represented with:

- `sourceLevel`: official, community, or private
- `publisher`: skill author
- `license`: declared skill license
- `quality`: deterministic `aso quality` report
- `reportUrl`: GitHub issue link for unsafe or misleading skills

Built-in skills are marked as official because they ship with the Agent Skill OS package.

## Quality

Marketplace quality signals reuse the existing static checker:

```bash
aso quality
aso quality --json
```

The grade is not a user rating. It means the skill has the required sections, runtime contract, routing metadata, and no obvious unsupported safety claims.

## Reporting Unsafe Skills

Use the unsafe skill issue template when a skill:

- asks an agent to access secrets without approval
- claims unsupported automation or guaranteed safety
- contains misleading instructions
- encourages harmful or destructive behavior
- hides risky network, file, credential, or permission assumptions

Report link:

```txt
https://github.com/Dxl0820/agent-skill-os/issues/new?template=unsafe_skill.yml
```

## Out of Scope for v0.9

- Accounts
- Payments
- Reviews
- Star ratings
- Hosted marketplace submissions
- Automatic remote trust verification

Those require stronger moderation, provenance, and abuse handling than this local-first foundation.
