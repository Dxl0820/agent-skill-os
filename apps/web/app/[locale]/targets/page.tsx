import type { Metadata } from "next";
import { ArrowRight, Bot } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "../../../i18n/navigation";
import type { Locale } from "../../../i18n/routing";
import { targetAdapters } from "../../../lib/discovery";
import { skills } from "../../../lib/registry";
import { localeAlternates } from "../../../lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const activeLocale = locale as Locale;
  const t = await getTranslations({ locale: activeLocale, namespace: "targetsPage" });
  return {
    title: t("metadataTitle"),
    description: t("description"),
    alternates: localeAlternates(activeLocale, "/targets")
  };
}

export default async function TargetsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("targetsPage");

  return (
    <main className="page">
      <div className="page-heading">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h1>{t("title")}</h1>
        <p>{t("description")}</p>
      </div>
      <div className="discovery-grid">
        {targetAdapters.map((target) => {
          const compatibleCount = skills.filter((skill) => skill.targets.includes(target.id)).length;
          return (
            <Link className="discovery-card" href={`/targets/${target.id}`} key={target.id}>
              <Bot size={22} />
              <h2>{t(`targets.${target.id}.name`)}</h2>
              <p>{t(`targets.${target.id}.summary`)}</p>
              <div className="stat-row">
                <span>{t("compatibleSkills")}</span>
                <strong>{compatibleCount}</strong>
              </div>
              <pre>{target.command}</pre>
              <div className="card-action">
                {t("viewTarget")}
                <ArrowRight size={16} />
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
