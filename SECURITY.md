# Security Policy

## Supported Versions

Agent Skill OS is pre-1.0. Security fixes are provided for the latest released version.

| Version | Supported |
| --- | --- |
| 0.3.x | Yes |
| 0.2.x | Yes |
| 0.1.x | No |

## Reporting a Vulnerability

Please report security issues privately instead of opening a public issue.

Use GitHub Security Advisories for this repository if available, or contact the maintainer through the GitHub profile linked from the repository owner.

Include:

- Affected version or commit.
- Impact and affected command or target adapter.
- Reproduction steps.
- Relevant logs or generated files, with secrets removed.
- Whether the issue involves file writes, path traversal, command execution, credential exposure, or dependency supply chain risk.

## Scope

Security-sensitive areas include:

- CLI install paths and target adapters.
- Remote registry source URLs and remote skill installation.
- Skill and pack validation.
- Generated manifest files.
- npm package contents and install-time behavior.
- GitHub Actions release and validation workflows.

Do not include private tokens, API keys, real customer data, or unredacted personal information in reports.
