import { Bot, Boxes, Code2, Terminal } from "lucide-react";
import { SkillCard } from "../components/SkillCard";
import { skills } from "../lib/registry";

const featuredIds = ["readme-writer", "code-reviewer", "prd-writer", "short-video-script-writer", "issue-triage", "release-notes-writer"];
const featured = featuredIds.map((id) => skills.find((skill) => skill.id === id)).filter(Boolean);

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Open-source skill registry for AI coding agents</span>
          <h1>Agent Skill OS</h1>
          <p>Install battle-tested skills into your AI coding agent in 30 seconds.</p>
          <div className="hero-actions">
            <a className="button primary" href="/skills">View Skills</a>
            <a className="button secondary" href="/docs">Quick Start</a>
          </div>
        </div>
        <div className="terminal-preview" aria-label="CLI preview">
          <div className="terminal-bar"><span /><span /><span /></div>
          <pre>{["pnpm add -g agent-skill-os", "aso install readme-writer --target codex --dir .", "aso install-pack developer-productivity --target codex --dir ."].join("\n")}</pre>
        </div>
      </section>

      <section className="quick-band" id="quick-start">
        <div>
          <Terminal size={22} />
          <h2>Quick Start</h2>
        </div>
        <pre>pnpm add -g agent-skill-os{"\n"}aso install-pack developer-productivity --target codex --dir .</pre>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Featured Skills</h2>
          <a href="/skills">Browse all 24</a>
        </div>
        <div className="grid">
          {featured.map((skill) => skill ? <SkillCard key={skill.id} skill={skill} /> : null)}
        </div>
      </section>

      <section className="feature-band">
        <div><Bot size={24} /><h3>Works With</h3><p>Generic folders, Claude, Codex, and Cursor target adapters.</p></div>
        <div><Boxes size={24} /><h3>Why Skill OS</h3><p>Prompt snippets become installable, versioned, reusable skills.</p></div>
        <div><Code2 size={24} /><h3>Local-first</h3><p>No account, database, marketplace, or model call is required for the MVP.</p></div>
      </section>
    </main>
  );
}
