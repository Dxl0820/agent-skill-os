import type { Locale } from "../i18n/routing";
import { routing } from "../i18n/routing";

export function localeAlternates(locale: Locale, pathname: string) {
  const suffix = pathname === "/" ? "" : pathname;
  return {
    canonical: `/${locale}${suffix}`,
    languages: Object.fromEntries(routing.locales.map((item) => [item, `/${item}${suffix}`]))
  };
}
