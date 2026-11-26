// Demo catalogue — mirrors the section layout of the reference shop.
// Used until the backend API is connected (see src/api.js).
export const categories = [
  { id: 'colored', name: 'عبايات ملوّنة' },
  { id: 'daily', name: 'عبايات يومية' },
  { id: 'hijab', name: 'الطرح' },
];

const C = {
  olive: ['#5f6146', '#e9e4d8'],
  sage: ['#8f9a7f', '#efece3'],
  sand: ['#b9a88c', '#f1ece3'],
  mocha: ['#6e5848', '#ede6db'],
  black: ['#1f1e1c', '#e8e2d6'],
  navy: ['#252b3d', '#e8e2d6'],
  wine: ['#5b2430', '#ece3d8'],
  beige: ['#d3c3a6', '#f3eee5'],
  green: ['#3f4a34', '#e9e4d8'],
};
const mk = (id, name, category, price, [color, accent], extra = {}) => ({ id, name, category, price, color, accent, ...extra });

export const products = [
  // عبايات ملوّنة (5)
  mk(1, 'S3 – زيتي مطرّز', 'colored', 49.99, C.olive, { soldOut: true, embroidery: true }),
  mk(2, 'S2 – مريمية', 'colored', 29.99, C.sage),
  mk(3, 'S5 – موكا', 'colored', 44.99, C.mocha),
  mk(4, 'S4 – عنابي', 'colored', 39.99, C.wine),
  mk(5, 'S3 – رملي', 'colored', 49.99, C.sand),
  // عبايات يومية (12)
  mk(6, 'S13', 'daily', 64.99, C.black),
  mk(7, 'S12', 'daily', 59.99, C.navy),
  mk(8, 'S11', 'daily', 54.99, C.olive, { embroidery: true }),
  mk(9, 'S10', 'daily', 49.99, C.beige),
  mk(10, 'S7', 'daily', 59.99, C.black),
  mk(11, 'S6', 'daily', 54.99, C.mocha),
  mk(12, 'S1', 'daily', 49.99, C.green),
  mk(13, 'S25', 'daily', 64.99, C.sand, { embroidery: true }),
  mk(14, 'S8', 'daily', 54.99, C.black),
  mk(15, 'S9', 'daily', 59.99, C.sage),
  mk(16, 'S32', 'daily', 64.99, C.navy, { embroidery: true }),
  mk(17, 'S26', 'daily', 59.99, C.beige),
  // الطرح (6)
  mk(18, 'طرحة – أسود', 'hijab', 4.99, C.black, { type: 'hijab' }),
  mk(19, 'طرحة – كحلي', 'hijab', 4.99, C.navy, { type: 'hijab' }),
  mk(20, 'طرحة – عنابي', 'hijab', 4.99, C.wine, { type: 'hijab' }),
  mk(21, 'طرحة – أخضر داكن', 'hijab', 4.99, C.green, { type: 'hijab' }),
  mk(22, 'طرحة – أخضر مريمي', 'hijab', 4.99, C.sage, { type: 'hijab' }),
  mk(23, 'طرحة – بيج', 'hijab', 4.99, C.beige, { type: 'hijab' }),
];

export const formatPrice = (n) => `€${n.toFixed(2).replace('.', ',')}`;
