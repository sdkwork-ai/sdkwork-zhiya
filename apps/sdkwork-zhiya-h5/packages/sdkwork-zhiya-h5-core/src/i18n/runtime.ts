/**
 * i18n bootstrap (I18N_SPEC.md §6/§7). The app root creates the single i18next
 * instance from merged per-package resources; packages never create their own
 * providers. Locale fragments live at `src/i18n/<locale>/zhiya/<capability>/`
 * inside each package.
 */

import i18next, { type i18n as I18nInstance, type Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';

export const ZHIYA_LOCALES = ['zh-CN', 'en-US'] as const;
export type ZhiyaLocale = (typeof ZHIYA_LOCALES)[number];
export const DEFAULT_LOCALE: ZhiyaLocale = 'zh-CN';

/** Resources namespace: everything lives under the `zhiya` domain key prefix. */
export type ZhiyaNamespaceResources = Record<string, unknown>;
export type ZhiyaLocaleResources = Partial<Record<ZhiyaLocale, { zhiya: ZhiyaNamespaceResources }>>;

export const LOCALE_STORAGE_KEY = 'zhiya.locale';

export function readStoredLocale(): ZhiyaLocale {
  try {
    const stored = globalThis.localStorage?.getItem(LOCALE_STORAGE_KEY);
    return stored === 'en-US' ? 'en-US' : 'zh-CN';
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function persistLocale(locale: ZhiyaLocale): void {
  try {
    globalThis.localStorage?.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* storage unavailable */
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...target };
  for (const [key, value] of Object.entries(source)) {
    const existing = merged[key];
    merged[key] =
      isPlainObject(existing) && isPlainObject(value) ? deepMerge(existing, value) : value;
  }
  return merged;
}

/** Merge per-package `ZhiyaLocaleResources` into one resource bundle. */
export function mergeZhiyaResources(...parts: readonly ZhiyaLocaleResources[]): ZhiyaLocaleResources {
  const merged: ZhiyaLocaleResources = {};
  for (const locale of ZHIYA_LOCALES) {
    const namespaces = parts
      .map((part) => part[locale]?.zhiya)
      .filter((entry): entry is ZhiyaNamespaceResources => entry !== undefined);
    if (namespaces.length === 0) {
      continue;
    }
    let combined: Record<string, unknown> = {};
    for (const namespace of namespaces) {
      combined = deepMerge(combined, namespace);
    }
    merged[locale] = { zhiya: combined };
  }
  return merged;
}

let configured = false;

/**
 * Resources use the `translation` namespace with `zhiya.*` key prefixes
 * (e.g. `t('zhiya.home.root.title')`), so capability-prefixed keys stay
 * greppable and the i18n key convention matches route titleKey patterns.
 */
function toI18nextResource(resources: ZhiyaLocaleResources): Resource {
  const bundle: Record<string, Record<string, unknown>> = {};
  for (const [locale, entry] of Object.entries(resources)) {
    if (isPlainObject(entry) && isPlainObject(entry.zhiya)) {
      // Keep the `zhiya` domain level so keys like `zhiya.home.root.title`
      // resolve inside the translation namespace.
      bundle[locale] = { translation: { zhiya: entry.zhiya } };
    }
  }
  return bundle as unknown as Resource;
}

export function createZhiyaI18n(
  resources: ZhiyaLocaleResources,
  initialLocale: ZhiyaLocale = readStoredLocale(),
): I18nInstance {
  if (!configured) {
    void i18next.use(initReactI18next).init({
      resources: toI18nextResource(resources),
      lng: initialLocale,
      fallbackLng: DEFAULT_LOCALE,
      supportedLngs: [...ZHIYA_LOCALES],
      defaultNS: 'translation',
      ns: ['translation'],
      interpolation: { escapeValue: false },
      returnNull: false,
      react: { useSuspense: false },
    });
    configured = true;
    return i18next;
  }
  // Already configured (e.g. HMR or repeated bootstrap): refresh resources.
  for (const [locale, entry] of Object.entries(resources)) {
    if (isPlainObject(entry) && isPlainObject(entry.zhiya)) {
      i18next.addResourceBundle(locale, 'translation', { zhiya: entry.zhiya }, true, true);
    }
  }
  void i18next.changeLanguage(initialLocale);
  return i18next;
}

export function getZhiyaI18n(): I18nInstance {
  return i18next;
}

export async function changeZhiyaLocale(locale: ZhiyaLocale): Promise<void> {
  await i18next.changeLanguage(locale);
  persistLocale(locale);
}
