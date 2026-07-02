# Contributing a Skill

Agent Skill OS skills are portable Markdown workflows. A good skill should make an AI coding agent more reliable in a narrow, repeatable job.

## Add a Skill

Create a new skill with the CLI:

~~~bash
pnpm aso new-skill my-skill --category coding
~~~

Or create the file manually:

~~~txt
skills/my-skill/SKILL.md
~~~

The directory name and frontmatter `id` must match.

## Naming Rules

- Use lowercase kebab-case.
- Prefer action-oriented names: `api-docs-writer`, `bug-reproducer`, `release-notes-writer`.
- Avoid broad names such as `helper`, `assistant`, or `agent`.
- Keep the skill focused on one repeatable workflow.

## Frontmatter Fields

Required fields:

- `id`: kebab-case identifier that matches the directory.
- `name`: human-readable title.
- `summary`: one-line value proposition.
- `description`: what the skill does and when it helps.
- `category`: one of `documentation`, `coding`, `github`, `product`, `content`, `research`.
- `tags`: searchable tags.
- `targets`: one or more of `generic`, `claude`, `codex`, `cursor`.
- `difficulty`: `beginner`, `intermediate`, or `advanced`.
- `version`: skill version.
- `author`: skill author.
- `license`: content license.
- `inputs`: context the skill needs.
- `outputs`: artifacts the skill returns.
- `use_cases`: common jobs for the skill.
- `capabilities`: routable capabilities the skill provides.
- `triggers`: task phrases that should select the skill.
- `routing`: `primaryFor` and `supportingFor` task contexts.
- `runtime`: execution limits and output contract.

The runtime principle is: install many, load few. Metadata should help the router choose one primary skill and at most a small number of supporting skills.

## Required Sections

Every `SKILL.md` must include:

- `## Role`
- `## When to Use`
- `## Inputs`
- `## Workflow`
- `## Output Format`
- `## Quality Bar`
- `## Runtime Contract`
- `## Example Prompt`
- `## Example Output`
- `## Safety Notes`

`## Runtime Contract` should include:

- required inputs
- execution steps
- output contract
- failure mode

## Good vs Bad Skills

Good:

- Has a clear job and stopping point.
- States the inputs it needs.
- Includes routing metadata and a runtime contract.
- Produces a reusable artifact.
- Includes safety notes for unsupported claims.
- Can be validated by another maintainer.

Bad:

- Tries to do every product, code, and marketing task at once.
- Depends on hidden context or private tools.
- Produces vague advice instead of a concrete output.
- Invents test results, citations, security claims, or product features.
- Uses a name so broad that users cannot predict when to install it.

## Validate

Run:

~~~bash
pnpm validate
~~~

Before opening a pull request, also run:

~~~bash
pnpm test
pnpm build
~~~
