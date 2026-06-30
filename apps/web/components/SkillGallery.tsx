"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { SkillCard } from "./SkillCard";
import type { SkillMetadata } from "../lib/registry";

export function SkillGallery({ skills }: { skills: SkillMetadata[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [tag, setTag] = useState("all");
  const categories = ["all", ...Array.from(new Set(skills.map((skill) => skill.category)))];
  const tags = ["all", ...Array.from(new Set(skills.flatMap((skill) => skill.tags))).sort()];
  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return skills.filter((skill) => {
      const categoryOk = category === "all" || skill.category === category;
      const tagOk = tag === "all" || skill.tags.includes(tag);
      const text = [skill.id, skill.name, skill.summary, skill.category, skill.tags.join(" ")].join(" ").toLowerCase();
      return categoryOk && tagOk && (!normalized || text.includes(normalized));
    });
  }, [category, query, skills, tag]);

  return (
    <section className="gallery-shell">
      <div className="filters">
        <label className="search-box">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search skills" />
        </label>
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Category">
          {categories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <select value={tag} onChange={(event) => setTag(event.target.value)} aria-label="Tag">
          {tags.map((item) => (
            <option key={item} value={item}>{item}</option>
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
