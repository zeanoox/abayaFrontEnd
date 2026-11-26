import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { LANGS, translations } from './translations.js';
import { money } from '../lib/format.js';

const I18nContext = createContext(null);

function initialLang() {
  try {
    const saved = localStorage.getItem('lorim-lang');
    if (saved && translations[saved]) return saved;
  } catch { /* storage unavailable */ }
  const nav = (navigator.language || '').slice(0, 2).toLowerCase();
  return translations[nav] ? nav : 'nl';
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    const meta = LANGS.find((l) => l.code === lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = meta.dir;
    try { localStorage.setItem('lorim-lang', lang); } catch { /* ignore */ }
  }, [lang]);

  const value = useMemo(() => {
    /** t('key', { n: 3 }) — looks up a string and fills {placeholders}. */
    const t = (key, vars) => {
      let s = translations[lang][key] ?? translations.en[key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
      return s;
    };
    /** Picks the active language from a { nl, en, ar } object coming from the API. */
    const tr = (field) => (field && typeof field === 'object' ? field[lang] ?? field.en ?? '' : field ?? '');
    const price = (cents) => money(cents, lang);
    return { lang, setLang, t, tr, price, dir: LANGS.find((l) => l.code === lang).dir };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
