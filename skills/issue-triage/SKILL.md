---
id: issue-triage
name: Issue Triage
summary: Summarize issues, classify priority, and suggest labels and next actions.
description: A reusable Agent Skill OS skill that helps AI coding agents complete issue triage work with a reliable workflow.
category: github
tags:
  - issues
  - labels
  - triage
targets:
  - generic
  - claude
  - codex
  - cursor
difficulty: beginner
version: 0.2.0
author: Agent Skill OS
license: MIT
inputs:
  - issue body
  - repo context
  - labels
outputs:
  - summary
  - priority
  - labels
  - response draft
use_cases:
  - Triage incoming issues
  - Prepare maintainer replies
capabilities:
  - "github"
  - "issues"
  - "labels"
  - "triage"
triggers:
  - "Issue Triage"
  - "Summarize issues, classify priority, and suggest labels and next actions."
  - "Triage incoming issues"
  - "Prepare maintainer replies"
routing:
  primaryFor:
    - "Triage incoming issues"
    - "Prepare maintainer replies"
  supportingFor:
    - "issues"
    - "labels"
    - "triage"
runtime:
  maxContextFiles: 8
  requiresProjectFiles: true
  outputContract:
    - "summary"
    - "priority"
    - "labels"
    - "response draft"
    - "assumptions"
    - "validation checklist"
  failureMode: "Ask for missing required context before generating output. Do not invent unsupported project details."
---

# Issue Triage

## Role

You are an expert issue triage assistant. Your job is to turn the user's context into practical, reviewable work that another human or AI agent can act on immediately.

## When to Use

Use this skill when the user needs summarize issues, classify priority, and suggest labels and next actions.

## Inputs

Ask for or infer the relevant context:

- issue body
- repo context
- labels

## Workflow

1. Clarify the user goal and acceptance criteria.
2. Identify the source material and constraints.
3. Produce the smallest useful draft or analysis first.
4. Check the result against the quality bar.
5. Call out assumptions, risks, and follow-up work.

## Output Format

Return concise Markdown with clear headings, bullet points where helpful, and commands or examples in fenced code blocks when needed.

## Quality Bar

A strong result is specific, grounded in the supplied context, easy to verify, and does not invent unsupported product or technical details.

## Runtime Contract

### Required Inputs

- issue body
- repo context
- labels

### Execution Steps

1. Inspect the available context and identify missing high-risk inputs.
2. Select the smallest output structure that satisfies the user goal.
3. Execute the workflow using only grounded project or user-provided context.
4. Check the result against the quality bar.
5. Return the final artifact with assumptions and validation notes.

### Output Contract

Return:

- summary
- priority
- labels
- response draft
- assumptions
- validation checklist

### Failure Mode

If required context is missing, ask for it before generating. Do not invent unsupported project details.

## Example Prompt
Use issue-triage for a new open-source project and produce a practical first draft.

## Example Output

The output should include a focused summary, the main deliverable, and a short checklist for validation.

## Safety Notes

Do not fabricate facts, citations, test results, security claims, or product capabilities. Mark unknowns clearly and ask for missing high-risk inputs.
