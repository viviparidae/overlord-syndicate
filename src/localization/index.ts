export type Language = "ja" | "en";

export interface LocalizationMap {
  [key: string]: string;
}

const translations: Record<Language, LocalizationMap> = {
  ja: {},
  en: {},
};

export function loadTranslations(_language: Language): void {
  // Translations are loaded from static JSON imports in main.ts
  // This function initializes the translations map; actual loading
  // occurs via the GameEngine or UI setup before gameplay starts.
}

export function t(
  key: string,
  vars: Record<string, string> = {},
  language: Language = "ja",
): string {
  let text = translations[language]?.[key] ?? translations.ja?.[key] ?? key;

  for (const varKey in vars) {
    text = text.replace(new RegExp(`{{${varKey}}}`, "g"), vars[varKey]);
    text = text.replace(new RegExp(`{${varKey}}`, "g"), vars[varKey]);
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
  const eraYear = date.getFullYear() - 2019;
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (language === "ja") {
    return `平成${eraYear}年${month}月${day}日`;
  } else {
    return date.toLocaleDateString(language === "en" ? "en-US" : "en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}
