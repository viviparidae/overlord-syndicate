import enTranslations from "./en.json";
import jaTranslations from "./ja.json";

export type Language = "ja" | "en";

export interface LocalizationMap {
  [key: string]: string;
}

const translations: Record<Language, LocalizationMap> = {
  ja: jaTranslations,
  en: enTranslations,
};

export function loadTranslations(_language: Language): void {
  // Translations are loaded via static JSON imports above
}

export function t(
  key: string,
  vars: Record<string, string | number> = {},
  language: Language = "ja",
): string {
  let text = translations[language]?.[key] ?? translations.ja?.[key] ?? key;

  for (const varKey in vars) {
    if (Object.hasOwn(vars, varKey)) {
      text = text.replace(new RegExp(`{${varKey}}`, "g"), String(vars[varKey]));
    }
  }

  return text;
}

export function formatCurrency(amount: number, language: Language = "ja"): string {
  const locale = language === "ja" ? "ja-JP" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "JPY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date, language: Language = "ja"): string {
  const eraYear = date.getFullYear() - 1988;
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (language === "ja") {
    return `平成${eraYear}年${month}月${day}日`;
  } else {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}

export function getLanguage(language: string): Language {
  return (language === "en" ? "en" : "ja") as Language;
}

export default { translations, t, formatCurrency, formatDate, getLanguage };
