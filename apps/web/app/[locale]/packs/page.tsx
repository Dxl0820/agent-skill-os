import { Package } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { packs } from "../../../lib/registry";

export default async function PacksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("packsPage");

  return (
    <main className="page">
      <div className="page-heading">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h1>{t("title")}</h1>
        <p>{t("description")}</p>
      </div>
      <div className="pack-grid">
        {packs.map((pack) => (
          <article className="pack-card" key={pack.id}>
            <Package size={22} />
            <h2>{t(`packs.${pack.id}.name`)}</h2>
            <p>{t(`packs.${pack.id}.summary`)}</p>
            <pre>aso install-pack {pack.id} --target codex --dir .</pre>
            <div className="tags">
              {pack.skills.map((skill) => <span key={skill}>{skill}</span>)}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
