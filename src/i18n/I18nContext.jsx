import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { LANGS, translations } from './translations.js';

const I18nContext = createContext(null);

function initialLang() {
  try {
    const saved = localStorage.getItem('lorim-lang');
    if (saved && translations[saved]) return saved;
  } catch {}
  const nav = (navigator.language || '').slice(0, 2).toLowerCase();
  return translations[nav] ? nav : 'nl';
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    const meta = LANGS.find((l) => l.code === lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = meta.dir;
    document.title = translations[lang]['meta.title'];
    try { localStorage.setItem('lorim-lang', lang); } catch {}
  }, [lang]);

  const value = useMemo(() => {
    const t = (key) => translations[lang][key] ?? translations.en[key] ?? key;
    // Pick the right language from a { nl, en, ar } object (or return a plain string as-is).
    const tr = (field) => (field && typeof field === 'object' ? field[lang] ?? field.en : field);
    return { lang, setLang, t, tr, dir: LANGS.find((l) => l.code === lang).dir };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
