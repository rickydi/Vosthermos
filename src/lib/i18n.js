import { cookies } from "next/headers";

const dictionaries = {
  fr: () => import("./dictionaries/fr").then((m) => m.default),
  en: () => import("./dictionaries/en").then((m) => m.default),
};

export const LOCALES = ["fr", "en"];
export const DEFAULT_LOCALE = "fr";

export async function getLocale() {
  try {
    const cookieStore = await cookies();
    const locale = cookieStore.get("locale")?.value;
    return LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

export async function getDictionary(locale) {
  const load = dictionaries[locale] || dictionaries[DEFAULT_LOCALE];
  return load();
}

export async function t(key) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  return key.split(".").reduce((obj, k) => obj?.[k], dict) || key;
}
