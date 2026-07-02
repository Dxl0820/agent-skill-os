import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SkillCard } from "../../../../components/SkillCard";
import { routing, type Locale } from "../../../../i18n/routing";
import { targetAdapters } from "../../../../lib/discovery";
import { skills } from "../../../../lib/registry";
import { localeAlternates } from "../../../../lib/seo";
import { localizeSkills } from "../../../../lib/skill-i18n";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => targetAdapters.map((target) => ({ locale, target: target.id })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; target: string }> }): Promise<Metadata> {
  const { locale, target } = await params;
  const activeLocale = locale as Locale;
  const t = await getTranslations({ locale: activeLocale, namespace: "targetDetail" });
  const targets = await getTranslations({ locale: activeLocale, namespace: "targetsPage.targets" });
  const adapter = targetAdapters.find((item) => item.id === target);
  if (!adapter) {
    return {};
  }
  return {
    title: t("metadataTitle", { target: targets(`${adapter.id}.name`) }),
    description: targets(`${adapter.id}.summary`),
    alternates: localeAlternates(activeLocale, `/targets/${adapter.id}`)
  };
}

export default async function TargetDetailPage({ params }: { params: Promise<{ locale: string; target: string }> }) {
  const { locale, target } = await params;
  setRequestLocale(locale);
  const adapter = targetAdapters.find((item) => item.id === target);
  if (!adapter) notFound();

  const activeLocale = locale as Locale;
  const t = await getTranslations("targetDetail");
  const targetLabels = await getTranslations("targetsPage.targets");
  const compatibleSkills = localizeSkills(skills.filter((skill) => skill.targets.includes(adapter.id)), activeLocale);

  return (
    <main className="page">
      <div className="detail-hero">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h1>{targetLabels(`${adapter.id}.name`)}</h1>
        <p>{targetLabels(`${adapter.id}.summary`)}</p>
        <pre>{adapter.command}</pre>
      </div>
      <section className="meta-grid">
        <div><strong>{t("skillPath")}</strong><span>{adapter.path}</span></div>
        <div><strong>{t("loader")}</strong><span>{adapter.loader}</span></div>
        <div><strong>{t("compatibleSkills")}</strong><span>{compatibleSkills.length}</span></div>
      </section>
      <section className="section flush-section">
        <div className="section-heading">
          <h2>{t("howItWorks")}</h2>
        </div>
        <div className="feature-band compact-band">
          <div><CheckCircle2 size={22} /><h3>{t("steps.install.title")}</h3><p>{t("steps.install.body")}</p></div>
          <div><CheckCircle2 size={22} /><h3>{t("steps.route.title")}</h3><p>{t("steps.route.body")}</p></div>
          <div><CheckCircle2 size={22} /><h3>{t("steps.load.title")}</h3><p>{t("steps.load.body")}</p></div>
        </div>
      </section>
      <section className="section flush-section">
        <div className="section-heading">
          <h2>{t("skillsTitle")}</h2>
        </div>
        <div className="grid">
          {compatibleSkills.map((skill) => <SkillCard key={skill.id} skill={skill} />)}
        </div>
      </section>
    </main>
  );
}
