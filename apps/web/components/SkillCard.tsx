"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "../i18n/navigation";
import type { SkillMetadata } from "../lib/registry";

export function SkillCard({ skill }: { skill: SkillMetadata }) {
  const t = useTranslations("skills.card");

  return (
    <Link className="skill-card" href={"/skills/" + skill.id}>
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
        {t("view")}
        <ArrowRight size={16} />
      </div>
    </Link>
  );
}
