import en from "./en.json";
import ja from "./ja.json";

export type Locale = "ja" | "en";
export type LocKey = keyof typeof ja;

const dictionaries: Record<Locale, Record<LocKey, string>> = {
  ja,
  en: en as Record<LocKey, string>,
};

let current: Locale = "ja";

export function setLocale(locale: Locale): void {
  current = locale;
}

export function getLocale(): Locale {
  return current;
}

export function t(key: LocKey, vars?: Record<string, string | number>): string {
  const template = dictionaries[current][key] ?? ja[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? ""));
}

export function keys(): LocKey[] {
  return Object.keys(ja) as LocKey[];
}
