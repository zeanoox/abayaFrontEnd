// Demo catalogue — used until the backend API is connected (see src/api.js).
// Text fields are { nl, en, ar } objects; the UI picks the active language.
export const categories = [
  { id: 'colored', name: { nl: 'Gekleurde abaya’s', en: 'Coloured Abayas', ar: 'عبايات ملوّنة' } },
  { id: 'daily', name: { nl: 'Dagelijkse abaya’s', en: 'Daily Abayas', ar: 'عبايات يومية' } },
  { id: 'hijab', name: { nl: 'Hijab', en: 'Hijab', ar: 'الطرح' } },
];

const COLORS = {
  olive: { hex: ['#5f6146', '#e9e4d8'], name: { nl: 'olijfgroen', en: 'olive', ar: 'زيتي' } },
  sage: { hex: ['#8f9a7f', '#efece3'], name: { nl: 'saliegroen', en: 'sage green', ar: 'أخضر مريمي' } },
  sand: { hex: ['#b9a88c', '#f1ece3'], name: { nl: 'zand', en: 'sand', ar: 'رملي' } },
  mocha: { hex: ['#6e5848', '#ede6db'], name: { nl: 'mokka', en: 'mocha', ar: 'موكا' } },
  black: { hex: ['#1f1e1c', '#e8e2d6'], name: { nl: 'zwart', en: 'black', ar: 'أسود' } },
  navy: { hex: ['#252b3d', '#e8e2d6'], name: { nl: 'marineblauw', en: 'navy', ar: 'كحلي' } },
  wine: { hex: ['#5b2430', '#ece3d8'], name: { nl: 'bordeaux', en: 'burgundy', ar: 'عنابي' } },
  beige: { hex: ['#d3c3a6', '#f3eee5'], name: { nl: 'beige', en: 'beige', ar: 'بيج' } },
  green: { hex: ['#3f4a34', '#e9e4d8'], name: { nl: 'donkergroen', en: 'dark green', ar: 'أخضر داكن' } },
};

const HIJAB = { nl: 'Hijab', en: 'Hijab', ar: 'طرحة' };

function mk(id, code, category, price, colorKey, extra = {}) {
  const c = COLORS[colorKey];
  const prefix = category === 'hijab' ? HIJAB : { nl: code, en: code, ar: code };
  const name = Object.fromEntries(['nl', 'en', 'ar'].map((l) => [l, `${prefix[l]} – ${c.name[l]}`]));
  return { id, code, name, category, price, color: c.hex[0], accent: c.hex[1], ...extra };
}

export const products = [
  // Coloured abayas (5)
  mk(1, 'S3', 'colored', 49.99, 'olive', { soldOut: true, embroidery: true }),
  mk(2, 'S2', 'colored', 29.99, 'sage'),
  mk(3, 'S5', 'colored', 44.99, 'mocha'),
  mk(4, 'S4', 'colored', 39.99, 'wine'),
  mk(5, 'S3', 'colored', 49.99, 'sand'),
  // Daily abayas (12)
  mk(6, 'S13', 'daily', 64.99, 'black'),
  mk(7, 'S12', 'daily', 59.99, 'navy'),
  mk(8, 'S11', 'daily', 54.99, 'olive', { embroidery: true }),
  mk(9, 'S10', 'daily', 49.99, 'beige'),
  mk(10, 'S7', 'daily', 59.99, 'black'),
  mk(11, 'S6', 'daily', 54.99, 'mocha'),
  mk(12, 'S1', 'daily', 49.99, 'green'),
  mk(13, 'S25', 'daily', 64.99, 'sand', { embroidery: true }),
  mk(14, 'S8', 'daily', 54.99, 'black'),
  mk(15, 'S9', 'daily', 59.99, 'sage'),
  mk(16, 'S32', 'daily', 64.99, 'navy', { embroidery: true }),
  mk(17, 'S26', 'daily', 59.99, 'beige'),
  // Hijabs (6)
  mk(18, 'H1', 'hijab', 4.99, 'black', { type: 'hijab' }),
  mk(19, 'H2', 'hijab', 4.99, 'navy', { type: 'hijab' }),
  mk(20, 'H3', 'hijab', 4.99, 'wine', { type: 'hijab' }),
  mk(21, 'H4', 'hijab', 4.99, 'green', { type: 'hijab' }),
  mk(22, 'H5', 'hijab', 4.99, 'sage', { type: 'hijab' }),
  mk(23, 'H6', 'hijab', 4.99, 'beige', { type: 'hijab' }),
];

export const formatPrice = (n) => `€${Number(n).toFixed(2).replace('.', ',')}`;
