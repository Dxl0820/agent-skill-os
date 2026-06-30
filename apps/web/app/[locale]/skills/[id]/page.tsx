import fs from "node:fs";
import path from "node:path";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { MarkdownBlock } from "../../../../components/MarkdownBlock";
import { SkillCard } from "../../../../components/SkillCard";
import { routing } from "../../../../i18n/routing";
import { findSkill, relatedSkills, skills } from "../../../../lib/registry";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => skills.map((skill) => ({ locale, id: skill.id })));
}

export default async function SkillDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("skillDetail");
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
        <div><strong>{t("difficulty")}</strong><span>{skill.difficulty}</span></div>
        <div><strong>{t("targets")}</strong><span>{skill.targets.join(", ")}</span></div>
        <div><strong>{t("tags")}</strong><span>{skill.tags.join(", ")}</span></div>
      </section>
      <MarkdownBlock body={body} />
      <section className="section">
        <h2>{t("related")}</h2>
        <div className="grid">
          {relatedSkills(skill).map((item) => <SkillCard key={item.id} skill={item} />)}
        </div>
      </section>
    </main>
  );
}
