import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "../../../../i18n/routing";
import { docsPages } from "../../../../lib/docs";
import { localeAlternates } from "../../../../lib/seo";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => docsPages.map((page) => ({ locale, slug: page.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const activeLocale = locale as Locale;
  const page = docsPages.find((item) => item.slug === slug);
  if (!page) return {};
  const docs = await getTranslations({ locale: activeLocale, namespace: "docsDetail.pages" });
  return {
    title: docs(`${page.slug}.title`),
    description: docs(`${page.slug}.summary`),
    alternates: localeAlternates(activeLocale, `/docs/${page.slug}`)
  };
}

export default async function DocsDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const page = docsPages.find((item) => item.slug === slug);
  if (!page) notFound();

  const t = await getTranslations("docsDetail");

  return (
    <main className="page docs">
      <div className="page-heading">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h1>{t(`pages.${page.slug}.title`)}</h1>
        <p>{t(`pages.${page.slug}.summary`)}</p>
      </div>
      <section>
        <h2>{t("concept")}</h2>
        <p>{t(`pages.${page.slug}.concept`)}</p>
      </section>
      <section>
        <h2>{t("commands")}</h2>
        <pre>{page.commands.join("\n")}</pre>
      </section>
      <section>
        <h2>{t("stableContract")}</h2>
        <p>{t(`pages.${page.slug}.contract`)}</p>
      </section>
      <section>
        <h2>{t("repoDocs")}</h2>
        <div className="tags">
          {page.links.map((link) => <span key={link}><BookOpen size={14} /> {link}</span>)}
        </div>
      </section>
    </main>
  );
}
