export default function DocsPage() {
  return (
    <main className="page docs">
      <div className="page-heading">
        <span className="eyebrow">Docs</span>
        <h1>Install skills, create new ones, and validate your registry.</h1>
      </div>
      <section>
        <h2>Installation</h2>
        <pre>pnpm add -g agent-skill-os</pre>
      </section>
      <section>
        <h2>CLI Usage</h2>
        <pre>{["aso list", "aso search readme", "aso show readme-writer", "aso new-skill my-skill --category coding", "aso install readme-writer --target codex --dir .", "aso install-pack developer-productivity --target generic --dir ."].join("\n")}</pre>
      </section>
      <section>
        <h2>Skill Format</h2>
        <p>Skills live at <code>skills/&lt;skill-id&gt;/SKILL.md</code> with frontmatter metadata and required Markdown sections.</p>
      </section>
      <section>
        <h2>Target Adapters</h2>
        <p>Generic writes to <code>agent-skills/</code>, Claude writes to <code>.claude/skills/</code>, Codex writes to <code>.codex/skills/</code>, and Cursor writes <code>.mdc</code> rules.</p>
      </section>
      <section>
        <h2>Contributing</h2>
        <p>Run <code>pnpm validate</code> and <code>pnpm test</code> before opening a pull request. Use <code>docs/contributing-skill.md</code> for the full skill contribution guide.</p>
      </section>
      <section>
        <h2>Roadmap</h2>
        <p>v0.2 adds community submission workflow, rating metadata, more adapters, better templates, and skill dependency support.</p>
      </section>
    </main>
  );
}
