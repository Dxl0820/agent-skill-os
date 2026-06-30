import { SkillGallery } from "../../components/SkillGallery";
import { skills } from "../../lib/registry";

export default function SkillsPage() {
  return (
    <main className="page">
      <div className="page-heading">
        <span className="eyebrow">Skill Gallery</span>
        <h1>Browse, search, and install reusable AI agent skills.</h1>
        <p>Every skill is Markdown with typed metadata, target compatibility, and a repeatable workflow.</p>
      </div>
      <SkillGallery skills={skills} />
    </main>
  );
}
