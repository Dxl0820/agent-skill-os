import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function DocsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("docsPage");

  return (
    <main className="page docs">
      <div className="page-heading">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h1>{t("title")}</h1>
      </div>
      <section>
        <h2>{t("installation")}</h2>
        <pre>pnpm add -g agent-skill-os</pre>
      </section>
      <section>
        <h2>{t("cliUsage")}</h2>
        <pre>{["aso list", "aso search readme", "aso show readme-writer", "aso new-skill my-skill --category coding", "aso install readme-writer --target codex --dir .", "aso install-pack developer-productivity --target generic --dir ."].join("\n")}</pre>
      </section>
      <section>
        <h2>{t("skillFormat")}</h2>
        <p>{t.rich("skillFormatBody", { code: (chunks) => <code>{chunks}</code> })}</p>
      </section>
      <section>
        <h2>{t("targetAdapters")}</h2>
        <p>{t.rich("targetAdaptersBody", { code: (chunks) => <code>{chunks}</code> })}</p>
      </section>
      <section>
        <h2>{t("contributing")}</h2>
        <p>{t.rich("contributingBody", { code: (chunks) => <code>{chunks}</code> })}</p>
      </section>
      <section>
        <h2>{t("roadmap")}</h2>
        <p>{t("roadmapBody")}</p>
      </section>
    </main>
  );
}
