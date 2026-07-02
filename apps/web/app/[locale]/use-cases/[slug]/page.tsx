import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Package, Sparkles } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SkillCard } from "../../../../components/SkillCard";
import { routing, type Locale } from "../../../../i18n/routing";
import { useCases } from "../../../../lib/discovery";
import { findSkill, packs } from "../../../../lib/registry";
import { localeAlternates } from "../../../../lib/seo";
import { localizeSkills } from "../../../../lib/skill-i18n";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => useCases.map((useCase) => ({ locale, slug: useCase.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const activeLocale = locale as Locale;
  const t = await getTranslations({ locale: activeLocale, namespace: "useCaseDetail" });
  const useCaseLabels = await getTranslations({ locale: activeLocale, namespace: "useCasesPage.items" });
  const useCase = useCases.find((item) => item.slug === slug);
  if (!useCase) {
    return {};
  }
  return {
    title: t("metadataTitle", { useCase: useCaseLabels(`${useCase.slug}.name`) }),
    description: useCaseLabels(`${useCase.slug}.summary`),
    alternates: localeAlternates(activeLocale, `/use-cases/${useCase.slug}`)
  };
}

export default async function UseCaseDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const useCase = useCases.find((item) => item.slug === slug);
  if (!useCase) notFound();

  const activeLocale = locale as Locale;
  const t = await getTranslations("useCaseDetail");
  const useCaseLabels = await getTranslations("useCasesPage.items");
  const packLabels = await getTranslations("packsPage.packs");
  const pack = packs.find((item) => item.id === useCase.packId);
  const localizedSkills = localizeSkills(useCase.skillIds.flatMap((skillId) => {
    const skill = findSkill(skillId);
    return skill ? [skill] : [];
  }), activeLocale);

  return (
    <main className="page">
      <div className="detail-hero">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h1>{useCaseLabels(`${useCase.slug}.name`)}</h1>
        <p>{useCaseLabels(`${useCase.slug}.summary`)}</p>
        <pre>{useCase.command}</pre>
      </div>
      <section className="meta-grid">
        <div><strong>{t("pack")}</strong><span>{pack ? packLabels(`${pack.id}.name`) : useCase.packId}</span></div>
        <div><strong>{t("skills")}</strong><span>{localizedSkills.length}</span></div>
        <div><strong>{t("target")}</strong><span>Codex</span></div>
      </section>
      <section className="section flush-section">
        <div className="feature-band compact-band">
          <div><Package size={22} /><h3>{t("install.title")}</h3><p>{t("install.body")}</p></div>
          <div><Sparkles size={22} /><h3>{t("output.title")}</h3><p>{t(`outputs.${useCase.slug}`)}</p></div>
          <div><Sparkles size={22} /><h3>{t("routing.title")}</h3><p>{t("routing.body")}</p></div>
        </div>
      </section>
      <section className="section flush-section">
        <div className="section-heading">
          <h2>{t("includedSkills")}</h2>
        </div>
        <div className="grid">
          {localizedSkills.map((skill) => <SkillCard key={skill.id} skill={skill} />)}
        </div>
      </section>
    </main>
  );
}
