"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { SkillCard } from "./SkillCard";
import type { LocalizedSkillMetadata } from "../lib/skill-i18n";

export function SkillGallery({ skills }: { skills: LocalizedSkillMetadata[] }) {
  const t = useTranslations("skills.filters");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [tag, setTag] = useState("all");
  const categories = ["all", ...Array.from(new Set(skills.map((skill) => skill.category)))];
  const tagOptions = useMemo(() => {
    const options = new Map<string, string>();
    for (const skill of skills) {
      skill.tags.forEach((item, index) => {
        if (!options.has(item)) {
          options.set(item, skill.tagLabels[index] ?? item);
        }
      });
    }

    return [
      { value: "all", label: t("all") },
      ...Array.from(options, ([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label))
    ];
  }, [skills, t]);
  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return skills.filter((skill) => {
      const categoryOk = category === "all" || skill.category === category;
      const tagOk = tag === "all" || skill.tags.includes(tag);
      return categoryOk && tagOk && (!normalized || skill.searchText.includes(normalized));
    });
  }, [category, query, skills, tag]);
  const categoryLabel = (item: string) => {
    if (item === "all") return t("all");
    return skills.find((skill) => skill.category === item)?.categoryLabel ?? item;
  };

  return (
    <section className="gallery-shell">
      <div className="filters">
        <label className="search-box">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("search")} />
        </label>
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label={t("category")}>
          {categories.map((item) => (
            <option key={item} value={item}>{categoryLabel(item)}</option>
          ))}
        </select>
        <select value={tag} onChange={(event) => setTag(event.target.value)} aria-label={t("tag")}>
          {tagOptions.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </div>
      <div className="grid">
        {filtered.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>
    </section>
  );
}
