const LOCALES = { nl: 'nl-NL', en: 'en-IE', ar: 'ar-u-nu-latn' };
const cache = {};

export function money(cents, lang = 'nl', currency = 'EUR') {
  const key = `${lang}-${currency}`;
  cache[key] ||= new Intl.NumberFormat(LOCALES[lang] || 'nl-NL', { style: 'currency', currency });
  return cache[key].format((cents || 0) / 100);
}

export function date(value, lang = 'nl') {
  return new Intl.DateTimeFormat(LOCALES[lang] || 'nl-NL', { dateStyle: 'long' }).format(new Date(value));
}
