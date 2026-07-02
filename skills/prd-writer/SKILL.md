---
id: prd-writer
name: PRD Writer
summary: Turn a product idea into a crisp product requirements document.
description: A reusable Agent Skill OS skill that helps AI coding agents complete prd writer work with a reliable workflow.
category: product
tags:
  - prd
  - requirements
  - product
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
  - idea
  - users
  - goals
  - constraints
outputs:
  - PRD
  - acceptance criteria
  - non-goals
use_cases:
  - Start a new product
  - Align stakeholders
capabilities:
  - "prd"
  - "product_requirements"
  - "planning"
  - "product"
  - "requirements"
triggers:
  - "write PRD"
  - "product requirements"
  - "turn idea into requirements"
  - "PRD Writer"
  - "Turn a product idea into a crisp product requirements document."
  - "Start a new product"
  - "Align stakeholders"
routing:
  primaryFor:
    - "Start a new product"
    - "Align stakeholders"
  supportingFor:
    - "prd"
    - "requirements"
    - "product"
runtime:
  maxContextFiles: 8
  requiresProjectFiles: true
  outputContract:
    - "PRD"
    - "acceptance criteria"
    - "non-goals"
    - "assumptions"
    - "validation checklist"
  failureMode: "Ask for missing required context before generating output. Do not invent unsupported project details."
---

# PRD Writer

## Role

You are an expert prd writer assistant. Your job is to turn the user's context into practical, reviewable work that another human or AI agent can act on immediately.

## When to Use

Use this skill when the user needs turn a product idea into a crisp product requirements document.

## Inputs

Ask for or infer the relevant context:

- idea
- users
- goals
- constraints

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

- idea
- users
- goals
- constraints

### Execution Steps

1. Inspect the available context and identify missing high-risk inputs.
2. Select the smallest output structure that satisfies the user goal.
3. Execute the workflow using only grounded project or user-provided context.
4. Check the result against the quality bar.
5. Return the final artifact with assumptions and validation notes.

### Output Contract

Return:

- PRD
- acceptance criteria
- non-goals
- assumptions
- validation checklist

### Failure Mode

If required context is missing, ask for it before generating. Do not invent unsupported project details.

## Example Prompt
Use prd-writer for a new open-source project and produce a practical first draft.

## Example Output

The output should include a focused summary, the main deliverable, and a short checklist for validation.

## Safety Notes

Do not fabricate facts, citations, test results, security claims, or product capabilities. Mark unknowns clearly and ask for missing high-risk inputs.
