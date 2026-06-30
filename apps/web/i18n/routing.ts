import { defineRouting } from "next-intl/routing";

export const locales = ["en", "zh-CN"] as const;
export const defaultLocale = "en" as const;

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always"
});

export type Locale = (typeof locales)[number];
