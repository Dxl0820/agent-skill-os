export const docsPages = [
  {
    slug: "runtime",
    commands: ["aso recommend \"review this pull request\"", "aso use code-reviewer --target codex"],
    links: ["docs/versioning.md", "docs/quality.md"]
  },
  {
    slug: "registry",
    commands: ["aso registry add official https://example.com/registry.json", "aso search readme --remote", "aso install official/readme-writer --target codex --dir ."],
    links: ["docs/registry.md", "docs/private-registry.md"]
  },
  {
    slug: "mcp",
    commands: ["aso mcp"],
    links: ["docs/mcp.md"]
  }
] as const;

export type DocsPage = (typeof docsPages)[number];
