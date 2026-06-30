import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { Link } from "../../i18n/navigation";
import { routing } from "../../i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const activeLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: activeLocale, namespace: "metadata" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${activeLocale}`,
      languages: {
        en: "/en",
        "zh-CN": "/zh-CN"
      }
    }
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const nav = await getTranslations("nav");
  const footer = await getTranslations("footer");

  return (
    <NextIntlClientProvider messages={messages}>
      <header className="site-header">
        <Link className="brand" href="/">
          Agent Skill OS
        </Link>
        <div className="header-actions">
          <nav aria-label={nav("label")}>
            <Link href="/skills">{nav("skills")}</Link>
            <Link href="/packs">{nav("packs")}</Link>
            <Link href="/showcase">{nav("showcase")}</Link>
            <Link href="/docs">{nav("docs")}</Link>
          </nav>
          <LanguageSwitcher />
        </div>
      </header>
      {children}
      <footer className="site-footer">
        <p>{footer("tagline")}</p>
        <nav aria-label={footer("label")}>
          <Link href="/skills">{footer("skills")}</Link>
          <Link href="/packs">{footer("packs")}</Link>
          <Link href="/docs">{footer("docs")}</Link>
        </nav>
      </footer>
    </NextIntlClientProvider>
  );
}
