import fs from "node:fs";
import path from "node:path";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { MarkdownBlock } from "../../../../components/MarkdownBlock";
import { SkillCard } from "../../../../components/SkillCard";
import { routing, type Locale } from "../../../../i18n/routing";
import { findSkill, relatedSkills, skills } from "../../../../lib/registry";
import { localizeSkill, localizeSkills } from "../../../../lib/skill-i18n";
import { findTrustProfile } from "../../../../lib/trust";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => skills.map((skill) => ({ locale, id: skill.id })));
}

export default async function SkillDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("skillDetail");
  const skill = findSkill(id);
  if (!skill) notFound();
  const activeLocale = locale as Locale;
  const localizedSkill = localizeSkill(skill, activeLocale);
  const localizedRelated = localizeSkills(relatedSkills(skill), activeLocale);
  const trust = await findTrustProfile(skill.id);

  const filePath = path.join(process.cwd(), "..", "..", "skills", skill.id, "SKILL.md");
  const raw = fs.readFileSync(filePath, "utf8");
  const body = raw.split("---").slice(2).join("---").trim();

  return (
    <main className="page detail-page">
      <div className="detail-hero">
        <span className="category">{localizedSkill.categoryLabel}</span>
        <h1>{localizedSkill.name}</h1>
        <p>{localizedSkill.summary}</p>
        <pre>aso install {skill.id} --target codex --dir .</pre>
      </div>
      <section className="meta-grid">
        <div><strong>{t("difficulty")}</strong><span>{localizedSkill.difficultyLabel}</span></div>
        <div><strong>{t("targets")}</strong><span>{skill.targets.join(", ")}</span></div>
        <div><strong>{t("tags")}</strong><span>{localizedSkill.tagLabels.join(", ")}</span></div>
      </section>
      {trust ? (
        <section className="trust-summary">
          <div><strong>{t("trust.source")}</strong><span>{t(`trust.sourceLevels.${trust.sourceLevel}`)}</span></div>
          <div><strong>{t("trust.quality")}</strong><span>{trust.quality.grade} / {t(`trust.safety.${trust.quality.safety}`)}</span></div>
          <div><strong>{t("trust.license")}</strong><span>{trust.license}</span></div>
          <a href={trust.reportUrl}>{t("trust.report")}</a>
        </section>
      ) : null}
      <p className="language-note">{t("originalLanguageNotice")}</p>
      <MarkdownBlock body={body} />
      <section className="section">
        <h2>{t("related")}</h2>
        <div className="grid">
          {localizedRelated.map((item) => <SkillCard key={item.id} skill={item} />)}
        </div>
      </section>
    </main>
  );
}
