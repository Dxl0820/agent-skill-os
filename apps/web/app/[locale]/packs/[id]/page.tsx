import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Package } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SkillCard } from "../../../../components/SkillCard";
import { routing, type Locale } from "../../../../i18n/routing";
import { findSkill, packs } from "../../../../lib/registry";
import { localeAlternates } from "../../../../lib/seo";
import { localizeSkills } from "../../../../lib/skill-i18n";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => packs.map((pack) => ({ locale, id: pack.id })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params;
  const activeLocale = locale as Locale;
  const pack = packs.find((item) => item.id === id);
  if (!pack) return {};
  const packLabels = await getTranslations({ locale: activeLocale, namespace: "packsPage.packs" });
  const t = await getTranslations({ locale: activeLocale, namespace: "packDetail" });
  return {
    title: t("metadataTitle", { pack: packLabels(`${pack.id}.name`) }),
    description: packLabels(`${pack.id}.summary`),
    alternates: localeAlternates(activeLocale, `/packs/${pack.id}`)
  };
}

export default async function PackDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const pack = packs.find((item) => item.id === id);
  if (!pack) notFound();

  const activeLocale = locale as Locale;
  const t = await getTranslations("packDetail");
  const packLabels = await getTranslations("packsPage.packs");
  const localizedSkills = localizeSkills(pack.skills.flatMap((skillId) => {
    const skill = findSkill(skillId);
    return skill ? [skill] : [];
  }), activeLocale);

  return (
    <main className="page">
      <div className="detail-hero">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h1>{packLabels(`${pack.id}.name`)}</h1>
        <p>{packLabels(`${pack.id}.summary`)}</p>
        <pre>aso install-pack {pack.id} --target codex --dir .</pre>
      </div>
      <section className="meta-grid">
        <div><strong>{t("installUnit")}</strong><span>{t("pack")}</span></div>
        <div><strong>{t("executionUnit")}</strong><span>{t("skill")}</span></div>
        <div><strong>{t("includedSkills")}</strong><span>{localizedSkills.length}</span></div>
      </section>
      <section className="section flush-section">
        <div className="feature-band compact-band">
          <div><Package size={22} /><h3>{t("principle.install.title")}</h3><p>{t("principle.install.body")}</p></div>
          <div><Package size={22} /><h3>{t("principle.route.title")}</h3><p>{t("principle.route.body")}</p></div>
          <div><Package size={22} /><h3>{t("principle.load.title")}</h3><p>{t("principle.load.body")}</p></div>
        </div>
      </section>
      <section className="section flush-section">
        <div className="section-heading">
          <h2>{t("skillsTitle")}</h2>
        </div>
        <div className="grid">
          {localizedSkills.map((skill) => <SkillCard key={skill.id} skill={skill} />)}
        </div>
      </section>
    </main>
  );
}
