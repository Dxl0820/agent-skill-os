import fs from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import { MarkdownBlock } from "../../../components/MarkdownBlock";
import { SkillCard } from "../../../components/SkillCard";
import { findSkill, relatedSkills, skills } from "../../../lib/registry";

export function generateStaticParams() {
  return skills.map((skill) => ({ id: skill.id }));
}

export default async function SkillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const skill = findSkill(id);
  if (!skill) notFound();
  const filePath = path.join(process.cwd(), "..", "..", "skills", skill.id, "SKILL.md");
  const raw = fs.readFileSync(filePath, "utf8");
  const body = raw.split("---").slice(2).join("---").trim();
  return (
    <main className="page detail-page">
      <div className="detail-hero">
        <span className="category">{skill.category}</span>
        <h1>{skill.name}</h1>
        <p>{skill.summary}</p>
        <pre>aso install {skill.id} --target codex --dir .</pre>
      </div>
      <section className="meta-grid">
        <div><strong>Difficulty</strong><span>{skill.difficulty}</span></div>
        <div><strong>Targets</strong><span>{skill.targets.join(", ")}</span></div>
        <div><strong>Tags</strong><span>{skill.tags.join(", ")}</span></div>
      </section>
      <MarkdownBlock body={body} />
      <section className="section">
        <h2>Related Skills</h2>
        <div className="grid">
          {relatedSkills(skill).map((item) => <SkillCard key={item.id} skill={item} />)}
        </div>
      </section>
    </main>
  );
}
