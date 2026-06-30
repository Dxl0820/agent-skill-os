import { getTranslations, setRequestLocale } from "next-intl/server";
import { SkillGallery } from "../../../components/SkillGallery";
import { skills } from "../../../lib/registry";

export default async function SkillsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("skillsPage");

  return (
    <main className="page">
      <div className="page-heading">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h1>{t("title")}</h1>
        <p>{t("description")}</p>
      </div>
      <SkillGallery skills={skills} />
    </main>
  );
}
