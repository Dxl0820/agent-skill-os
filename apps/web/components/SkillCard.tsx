"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "../i18n/navigation";
import type { LocalizedSkillMetadata } from "../lib/skill-i18n";

export function SkillCard({ skill }: { skill: LocalizedSkillMetadata }) {
  const t = useTranslations("skills.card");

  return (
    <Link className="skill-card" href={"/skills/" + skill.id}>
      <div className="skill-card-top">
        <span className="category">{skill.categoryLabel}</span>
        <span className="difficulty">{skill.difficultyLabel}</span>
      </div>
      <h3>{skill.name}</h3>
      <p>{skill.summary}</p>
      <div className="tags">
        {skill.tags.slice(0, 3).map((tag, index) => (
          <span key={tag}>{skill.tagLabels[index] ?? tag}</span>
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
