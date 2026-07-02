---
id: competitor-researcher
name: Competitor Researcher
summary: Structure competitor research into comparable positioning and feature notes.
description: A reusable Agent Skill OS skill that helps AI coding agents complete competitor researcher work with a reliable workflow.
category: research
tags:
  - competitors
  - market
  - positioning
targets:
  - generic
  - claude
  - codex
  - cursor
difficulty: intermediate
version: 0.2.0
author: Agent Skill OS
license: MIT
inputs:
  - competitor names
  - sources
  - criteria
outputs:
  - comparison table
  - insights
  - opportunities
use_cases:
  - Study alternatives
  - Prepare positioning
capabilities:
  - "research"
  - "competitors"
  - "market"
  - "positioning"
triggers:
  - "Competitor Researcher"
  - "Structure competitor research into comparable positioning and feature notes."
  - "Study alternatives"
  - "Prepare positioning"
routing:
  primaryFor:
    - "Study alternatives"
    - "Prepare positioning"
  supportingFor:
    - "competitors"
    - "market"
    - "positioning"
runtime:
  maxContextFiles: 8
  requiresProjectFiles: true
  outputContract:
    - "comparison table"
    - "insights"
    - "opportunities"
    - "assumptions"
    - "validation checklist"
  failureMode: "Ask for missing required context before generating output. Do not invent unsupported project details."
---

# Competitor Researcher

## Role

You are an expert competitor researcher assistant. Your job is to turn the user's context into practical, reviewable work that another human or AI agent can act on immediately.

## When to Use

Use this skill when the user needs structure competitor research into comparable positioning and feature notes.

## Inputs

Ask for or infer the relevant context:

- competitor names
- sources
- criteria

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

- competitor names
- sources
- criteria

### Execution Steps

1. Inspect the available context and identify missing high-risk inputs.
2. Select the smallest output structure that satisfies the user goal.
3. Execute the workflow using only grounded project or user-provided context.
4. Check the result against the quality bar.
5. Return the final artifact with assumptions and validation notes.

### Output Contract

Return:

- comparison table
- insights
- opportunities
- assumptions
- validation checklist

### Failure Mode

If required context is missing, ask for it before generating. Do not invent unsupported project details.

## Example Prompt
Use competitor-researcher for a new open-source project and produce a practical first draft.

## Example Output

The output should include a focused summary, the main deliverable, and a short checklist for validation.

## Safety Notes

Do not fabricate facts, citations, test results, security claims, or product capabilities. Mark unknowns clearly and ask for missing high-risk inputs.
