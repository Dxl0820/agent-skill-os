import type { Metadata } from "next";
import { ArrowRight, Workflow } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "../../../i18n/navigation";
import type { Locale } from "../../../i18n/routing";
import { useCases } from "../../../lib/discovery";
import { findSkill } from "../../../lib/registry";
import { localeAlternates } from "../../../lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const activeLocale = locale as Locale;
  const t = await getTranslations({ locale: activeLocale, namespace: "useCasesPage" });
  return {
    title: t("metadataTitle"),
    description: t("description"),
    alternates: localeAlternates(activeLocale, "/use-cases")
  };
}

export default async function UseCasesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("useCasesPage");

  return (
    <main className="page">
      <div className="page-heading">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h1>{t("title")}</h1>
        <p>{t("description")}</p>
      </div>
      <div className="discovery-grid">
        {useCases.map((useCase) => (
          <Link className="discovery-card" href={`/use-cases/${useCase.slug}`} key={useCase.slug}>
            <Workflow size={22} />
            <h2>{t(`items.${useCase.slug}.name`)}</h2>
            <p>{t(`items.${useCase.slug}.summary`)}</p>
            <div className="stat-row">
              <span>{t("includedSkills")}</span>
              <strong>{useCase.skillIds.filter((skillId) => findSkill(skillId)).length}</strong>
            </div>
            <pre>{useCase.command}</pre>
            <div className="card-action">
              {t("viewUseCase")}
              <ArrowRight size={16} />
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
