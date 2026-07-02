import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "../../../i18n/navigation";
import type { Locale } from "../../../i18n/routing";
import { skills } from "../../../lib/registry";
import { localeAlternates } from "../../../lib/seo";
import { localizeSkills } from "../../../lib/skill-i18n";
import { loadTrustProfiles } from "../../../lib/trust";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const activeLocale = locale as Locale;
  const t = await getTranslations({ locale: activeLocale, namespace: "marketplacePage" });
  return {
    title: t("metadataTitle"),
    description: t("description"),
    alternates: localeAlternates(activeLocale, "/marketplace")
  };
}

export default async function MarketplacePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("marketplacePage");
  const activeLocale = locale as Locale;
  const localizedSkills = localizeSkills(skills, activeLocale);
  const trustProfiles = await loadTrustProfiles();
  const trustById = new Map(trustProfiles.map((profile) => [profile.id, profile]));

  return (
    <main className="page">
      <div className="page-heading">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h1>{t("title")}</h1>
        <p>{t("description")}</p>
      </div>
      <section className="trust-strip">
        <div><ShieldCheck size={22} /><strong>{t("signals.official.title")}</strong><span>{t("signals.official.body")}</span></div>
        <div><ShieldCheck size={22} /><strong>{t("signals.quality.title")}</strong><span>{t("signals.quality.body")}</span></div>
        <div><ShieldCheck size={22} /><strong>{t("signals.report.title")}</strong><span>{t("signals.report.body")}</span></div>
      </section>
      <div className="marketplace-list">
        {localizedSkills.map((skill) => {
          const trust = trustById.get(skill.id);
          return (
            <article className="marketplace-row" key={skill.id}>
              <div>
                <span className="category">{trust ? t(`sourceLevels.${trust.sourceLevel}`) : t("unknown")}</span>
                <h2>{skill.name}</h2>
                <p>{skill.summary}</p>
              </div>
              <div className="marketplace-meta">
                <span>{t("grade")}: <strong>{trust?.quality.grade || "n/a"}</strong></span>
                <span>{t("safetyLabel")}: <strong>{trust ? t(`safety.${trust.quality.safety}`) : "n/a"}</strong></span>
                <span>{t("license")}: <strong>{trust?.license || "n/a"}</strong></span>
              </div>
              <div className="marketplace-actions">
                <Link className="button secondary" href={`/skills/${skill.id}`}>{t("viewSkill")}</Link>
                {trust ? <a className="button secondary" href={trust.reportUrl}>{t("report")}</a> : null}
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
