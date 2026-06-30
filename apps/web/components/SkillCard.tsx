import { ArrowRight, Sparkles } from "lucide-react";
import type { SkillMetadata } from "../lib/registry";

export function SkillCard({ skill }: { skill: SkillMetadata }) {
  return (
    <a className="skill-card" href={"/skills/" + skill.id}>
      <div className="skill-card-top">
        <span className="category">{skill.category}</span>
        <span className="difficulty">{skill.difficulty}</span>
      </div>
      <h3>{skill.name}</h3>
      <p>{skill.summary}</p>
      <div className="tags">
        {skill.tags.slice(0, 3).map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div className="card-action">
        <Sparkles size={16} />
        View skill
        <ArrowRight size={16} />
      </div>
    </a>
  );
}
