import { ArrowRight, Film, Rocket, Wrench } from "lucide-react";

const scenarios = [
  {
    name: "Developer Productivity",
    icon: Wrench,
    command: "aso install-pack developer-productivity --target codex --dir .",
    skills: ["code-reviewer", "test-writer", "bug-reproducer", "refactor-planner", "readme-writer", "pr-summarizer"],
    output: "Review findings, regression tests, repro steps, refactor plans, README drafts, and PR summaries.",
    useful: "Gives a coding agent a complete daily development workflow without copy-pasting old prompts."
  },
  {
    name: "Launch Kit",
    icon: Rocket,
    command: "aso install-pack launch-kit --target codex --dir .",
    skills: ["prd-writer", "landing-page-copywriter", "launch-post-writer", "readme-writer", "demo-video-planner"],
    output: "PRDs, README polish, landing copy, launch posts, and demo video plans.",
    useful: "Turns a rough project idea into launch-ready GitHub and social assets."
  },
  {
    name: "AI Video Creator",
    icon: Film,
    command: "aso install-pack ai-video-creator --target codex --dir .",
    skills: ["short-video-script-writer", "youtube-title-thumbnail-ideas", "demo-video-planner", "source-summarizer"],
    output: "Short scripts, demo outlines, YouTube titles, thumbnail text, and source summaries.",
    useful: "Helps creators package technical projects into watchable demos and reusable content."
  }
];

export default function ShowcasePage() {
  return (
    <main className="page">
      <div className="page-heading">
        <span className="eyebrow">Showcase</span>
        <h1>Three installable workflows for the first 30 seconds.</h1>
        <p>Each scenario shows the command, installed skills, expected output, and why it matters for an AI coding agent.</p>
      </div>
      <div className="showcase-grid">
        {scenarios.map((scenario) => {
          const Icon = scenario.icon;
          return (
            <article className="showcase-card" key={scenario.name}>
              <div className="showcase-title">
                <Icon size={24} />
                <h2>{scenario.name}</h2>
              </div>
              <div className="showcase-block">
                <strong>Install command</strong>
                <pre>{scenario.command}</pre>
              </div>
              <div className="showcase-block">
                <strong>Installed skills</strong>
                <div className="tags">
                  {scenario.skills.map((skill) => <span key={skill}>{skill}</span>)}
                </div>
              </div>
              <div className="showcase-block">
                <strong>Expected output</strong>
                <p>{scenario.output}</p>
              </div>
              <div className="showcase-block">
                <strong>Why it is useful</strong>
                <p>{scenario.useful}</p>
              </div>
              <a className="card-action" href="/packs">
                View packs
                <ArrowRight size={16} />
              </a>
            </article>
          );
        })}
      </div>
    </main>
  );
}
