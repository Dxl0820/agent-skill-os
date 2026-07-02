# Router

The Router maps task intent to installed Skills.

Generated file:

```txt
.agent-skill-os/router.json
```

Default policy:

```json
{
  "loadAllSkillsByDefault": false,
  "maxPrimarySkills": 1,
  "maxSupportingSkills": 2,
  "stateSelectedSkillBeforeExecution": true
}
```

Agents should:

1. Classify the task.
2. Select one primary skill.
3. Select zero to two supporting skills only when useful.
4. Load only relevant skill files.
5. Follow the selected Runtime Contract.
6. Validate the final output.
