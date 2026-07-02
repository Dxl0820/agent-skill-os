# Security

Agent Skill OS distributes text instructions to AI agents. Skills are not executable code, but they can influence what an agent chooses to do.

## Security Model

- Skills are Markdown instructions.
- Remote skills are fetched as text.
- The CLI does not execute remote skill code.
- Remote installs print the source URL.
- Installed state is recorded in `.agent-skill-os/manifest.json` and `.agent-skill-os/skill-lock.json`.

## Review Before Installing

Before installing a remote or private skill, check:

- source URL
- author and license
- Runtime Contract
- Safety Notes
- requested inputs
- network, credential, filesystem, or permission assumptions
- unsupported claims such as guaranteed safety or hidden automation

## Report Unsafe Skills

Use:

```txt
https://github.com/Dxl0820/agent-skill-os/issues/new?template=unsafe_skill.yml
```

Report skills that ask agents to exfiltrate secrets, hide risky behavior, bypass review, or perform destructive actions without explicit user approval.

## Private Registries

Use normal Git or file-host permissions for private registries. Do not put credentials, tokens, or private keys in registry URLs, skill files, examples, or generated loaders.

## Future Work

Remote checksum verification, stronger provenance, and signed registry metadata are future hardening work.
