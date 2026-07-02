---
id: pr-summarizer
name: PR Summarizer
summary: Summarize pull request changes, risks, and review focus areas.
description: A reusable Agent Skill OS skill that helps AI coding agents complete pr summarizer work with a reliable workflow.
category: github
tags:
  - pull-request
  - summary
  - review
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
  - diff
  - PR description
  - tests
outputs:
  - summary
  - risk notes
  - test evidence
use_cases:
  - Write PR descriptions
  - Prepare release notes
capabilities:
  - "pull_request_summary"
  - "change_summary"
  - "risk_summary"
  - "github"
  - "pull-request"
  - "summary"
  - "review"
triggers:
  - "summarize PR"
  - "pull request summary"
  - "explain changes"
  - "PR Summarizer"
  - "Summarize pull request changes, risks, and review focus areas."
  - "Write PR descriptions"
  - "Prepare release notes"
routing:
  primaryFor:
    - "Write PR descriptions"
    - "Prepare release notes"
  supportingFor:
    - "pull-request"
    - "summary"
    - "review"
runtime:
  maxContextFiles: 8
  requiresProjectFiles: true
  outputContract:
    - "summary"
    - "risk notes"
    - "test evidence"
    - "assumptions"
    - "validation checklist"
  failureMode: "Ask for missing required context before generating output. Do not invent unsupported project details."
---

# PR Summarizer

## Role

You are an expert pr summarizer assistant. Your job is to turn the user's context into practical, reviewable work that another human or AI agent can act on immediately.

## When to Use

Use this skill when the user needs summarize pull request changes, risks, and review focus areas.

## Inputs

Ask for or infer the relevant context:

- diff
- PR description
- tests

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

- diff
- PR description
- tests

### Execution Steps

1. Inspect the available context and identify missing high-risk inputs.
2. Select the smallest output structure that satisfies the user goal.
3. Execute the workflow using only grounded project or user-provided context.
4. Check the result against the quality bar.
5. Return the final artifact with assumptions and validation notes.

### Output Contract

Return:

- summary
- risk notes
- test evidence
- assumptions
- validation checklist

### Failure Mode

If required context is missing, ask for it before generating. Do not invent unsupported project details.

## Example Prompt
Use pr-summarizer for a new open-source project and produce a practical first draft.

## Example Output

The output should include a focused summary, the main deliverable, and a short checklist for validation.

## Safety Notes

Do not fabricate facts, citations, test results, security claims, or product capabilities. Mark unknowns clearly and ask for missing high-risk inputs.
