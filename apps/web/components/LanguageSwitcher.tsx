"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "../i18n/navigation";
import { locales, type Locale } from "../i18n/routing";

export function LanguageSwitcher() {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("language");

  return (
    <label className="language-switcher">
      <Languages size={16} aria-hidden="true" />
      <span className="sr-only">{t("label")}</span>
      <select
        aria-label={t("label")}
        value={currentLocale}
        onChange={(event) => router.replace(pathname, { locale: event.target.value as Locale })}
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {locale === "zh-CN" ? t("zhCN") : t("en")}
          </option>
        ))}
      </select>
    </label>
  );
}
