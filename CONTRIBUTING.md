# Contributing

Thanks for improving Agent Skill OS.

## Add a Skill

Create:

~~~txt
skills/<skill-id>/SKILL.md
~~~

The directory name and frontmatter `id` must match.

## Frontmatter Fields

Required fields:

- id
- name
- summary
- description
- category
- tags
- targets
- difficulty
- version
- author
- license
- inputs
- outputs
- use_cases
- capabilities
- triggers
- routing
- runtime

Categories must be one of `documentation`, `coding`, `github`, `product`, `content`, or `research`.

Targets must be one of `generic`, `claude`, `codex`, or `cursor`.

Difficulty must be `beginner`, `intermediate`, or `advanced`.

## Required Body Sections

- Role
- When to Use
- Inputs
- Workflow
- Output Format
- Quality Bar
- Runtime Contract
- Example Prompt
- Example Output
- Safety Notes

Runtime metadata and `Runtime Contract` let Agent Skill OS route, load, execute, and validate skills. Follow the principle: install many, load few.

## Validate

~~~bash
pnpm validate
pnpm test
~~~

## Add a Skill Pack

Create `packs/<pack-id>.json`:

~~~json
{
  "id": "example-pack",
  "name": "Example Pack",
  "summary": "Useful related skills.",
  "skills": ["readme-writer"]
}
~~~

Pack skill IDs must reference existing skills.

## Pull Requests

Open a PR with:

- what changed
- why it changed
- validation commands and results
- screenshots for web UI changes

## Content Quality

Good skills are specific, reusable, safe, and honest about missing context. Do not invent unsupported product behavior, security claims, or test results.
