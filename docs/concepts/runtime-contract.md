# Runtime Contract

The Runtime Contract is the execution standard inside every stable Skill.

Required subsections:

```txt
### Required Inputs
### Optional Inputs
### Execution Steps
### Output Contract
### Quality Checks
### Failure Mode
```

The contract tells an agent:

- what context it needs
- what steps to follow
- what to output
- how to validate the result
- when to ask for missing context
- when to stop or refuse unsafe assumptions

This is the main difference between a prompt snippet and an Agent Skill OS skill.
