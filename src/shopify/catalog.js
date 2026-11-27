// Catalogue from Shopify, mapped to the shapes the pages use ({ nl, en, ar } texts, prices in cents).
// The whole catalogue is small, so it is loaded once (and refreshed every minute) and filtered,
// sorted and paged in the browser — no dependency on Shopify search/filter app settings.
import { ApiError, cents, storefront } from './client.js';
import { CATEGORIES, COLORS, HIDDEN_COLLECTIONS, I18N_METAFIELD, LOW_STOCK_AT, OPTION_NAMES, SIZE_ORDER, TAGS } from './config.js';

const MF = `lorim: metafield(namespace: "${I18N_METAFIELD.namespace}", key: "${I18N_METAFIELD.key}") { value }`;

export const PRODUCT_FIELDS = `
  id handle title description tags publishedAt
  seo { title description }
  ${MF}
  images(first: 40) { nodes { url altText } }
  collections(first: 30) { nodes { handle } }
  variants(first: 250) { nodes {
    id sku availableForSale {{QTY}}
    price { amount } compareAtPrice { amount }
    selectedOptions { name value }
    image { url }
  } }`;

const CATALOG = `query Catalog($after: String) {
  products(first: 25, after: $after, sortKey: BEST_SELLING) {
    pageInfo { hasNextPage endCursor }
    nodes { ${PRODUCT_FIELDS} }
  }
}`;

const COLLECTIONS = `query Collections {
  collections(first: 100) { nodes { handle title description image { url } ${MF} } }
}`;

const PRODUCT = `query Product($handle: String!) { product(handle: $handle) { ${PRODUCT_FIELDS} } }`;

// ---------- helpers ----------

export const parseJson = (mf) => { try { return mf?.value ? JSON.parse(mf.value) : {}; } catch { return {}; } };
const norm = (s) => String(s || '').trim().toLowerCase();
const kindOf = (optName) => Object.keys(OPTION_NAMES).find((k) => OPTION_NAMES[k].includes(norm(optName)));

export function colorFor(value) {
  const v = norm(value);
  const known = COLORS.find((c) => c.code === v || Object.values(c.name).some((n) => norm(n) === v));
  if (known) return known;
  return { code: v.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || v, hex: '#9a9488', name: value };
}

/** Variant → { size, color, length } from its selected options. */
export function variantOptions(selectedOptions = []) {
  const o = { size: null, color: null, length: null };
  for (const { name, value } of selectedOptions) {
    const k = kindOf(name);
    if (k === 'color') o.color = colorFor(value);
    else if (k === 'size') o.size = value;
    else if (k === 'length') o.length = Number(String(value).replace(/[^\d.]/g, '')) || null;
  }
  return o;
}

const text = (i18n, fallback) => (i18n && typeof i18n === 'object' && Object.keys(i18n).length ? i18n : fallback || null);

function mapProduct(n, rank = 0) {
  const t = parseJson(n.lorim);
  const tags = (n.tags || []).map(norm);
  const variants = n.variants.nodes.map((v) => {
    const o = variantOptions(v.selectedOptions);
    const price = cents(v.price);
    const compare = cents(v.compareAtPrice);
    const qty = v.quantityAvailable;
    const avail = !v.availableForSale ? 0 : qty == null ? 10 : Math.max(0, Math.min(qty, 10));
    return {
      id: v.id,
      sku: v.sku,
      size: o.size,
      color: o.color?.code ?? null,
      colorObj: o.color,
      length: o.length,
      price,
      compareAt: compare && compare > price ? compare : null,
      available: avail,
      lowStock: avail > 0 && qty != null && qty <= LOW_STOCK_AT,
      image: v.image?.url || null,
    };
  });

  // Colours in the order they first appear, with stock per colour.
  const colorMap = new Map();
  for (const v of variants) {
    if (!v.colorObj) continue;
    const c = colorMap.get(v.color) || { code: v.color, hex: v.colorObj.hex, name: v.colorObj.name, inStock: false };
    c.inStock ||= v.available > 0;
    colorMap.set(v.color, c);
  }
  const colors = [...colorMap.values()];

  // Which image belongs to which colour: the variant image, or the colour name in the alt text.
  const variantImg = new Map(variants.filter((v) => v.image && v.color).map((v) => [v.image.split('?')[0], v.color]));
  const images = n.images.nodes.map((im) => {
    const alt = norm(im.altText);
    const byAlt = colors.find((c) => [c.code, ...(typeof c.name === 'object' ? Object.values(c.name) : [c.name])]
      .some((x) => x && alt.endsWith(norm(x))));
    return { url: im.url, alt: im.altText || '', color: variantImg.get(im.url.split('?')[0]) || byAlt?.code || null };
  });

  const cheapest = variants.reduce((m, v) => (m == null || v.price < m.price ? v : m), null);
  const price = cheapest ? cheapest.compareAt ?? cheapest.price : 0;
  const salePrice = cheapest?.compareAt != null ? cheapest.price : null;
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))]
    .sort((a, b) => (SIZE_ORDER.indexOf(a) + 1 || 99) - (SIZE_ORDER.indexOf(b) + 1 || 99));

  return {
    id: n.id,
    slug: n.handle,
    sku: (variants[0]?.sku || '').split('-').slice(0, 2).join('-') || n.handle,
    name: text(t.name, n.title),
    price,
    salePrice,
    image: images[0] || null,
    hoverImage: images[1] || null,
    images,
    colors,
    inStock: variants.some((v) => v.available > 0),
    isNew: tags.includes(TAGS.new),
    onSale: salePrice != null,
    featured: tags.includes(TAGS.featured),
    // detail fields
    description: text(t.description, n.description),
    fabric: text(t.fabric), care: text(t.care), fit: text(t.fit), lengthInfo: text(t.lengthInfo),
    seoTitle: text(t.seoTitle, n.seo?.title), seoDesc: text(t.seoDesc, n.seo?.description),
    sizes,
    lengths: [...new Set(variants.map((v) => v.length).filter(Boolean))].sort((a, b) => a - b),
    variants: variants.map(({ colorObj, image, ...v }) => v),
    collections: n.collections.nodes.map((c) => c.handle),
    search: [n.handle, n.title, ...Object.values(t.name || {}), ...variants.map((v) => v.sku), ...tags].join(' ').toLowerCase(),
    publishedAt: n.publishedAt,
    rank,
  };
}

/** The fields a product card needs (same as the old API's list items). */
export function toCard(p) {
  const { description, fabric, care, fit, lengthInfo, seoTitle, seoDesc, sizes, lengths, variants, collections, search, publishedAt, rank, ...card } = p;
  return card;
}

// ---------- loading + cache ----------

let cache = null;
const TTL = 60_000;

async function fetchAll() {
  const products = [];
  let after = null;
  do {
    const d = await storefront(CATALOG, { after });
    products.push(...d.products.nodes.map((n) => mapProduct(n, products.length + d.products.nodes.indexOf(n))));
    after = d.products.pageInfo.hasNextPage ? d.products.pageInfo.endCursor : null;
  } while (after);
  const { collections } = await storefront(COLLECTIONS);
  return { products, categories: buildCategories(collections.nodes, products) };
}

export function loadCatalog() {
  if (!cache || Date.now() - cache.at > TTL) {
    const at = Date.now();
    const promise = fetchAll().catch((err) => { if (cache?.promise === promise) cache = null; throw err; });
    cache = { at, promise };
  }
  return cache.promise;
}

export const invalidateCatalog = () => { cache = null; };

// ---------- categories ----------

function buildCategories(collections, products) {
  const fallback = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));
  const list = collections
    .filter((c) => !HIDDEN_COLLECTIONS.includes(c.handle))
    .map((c) => {
      const t = parseJson(c.lorim);
      const f = fallback[c.handle] || {};
      return {
        slug: c.handle,
        name: text(t.name, f.name || c.title),
        description: text(t.description, f.description || c.description),
        image: c.image?.url || null,
        parent: t.parent ?? f.parent ?? null,
        position: t.position ?? f.position ?? 100,
        smart: Boolean(f.smart),
      };
    });
  // The two smart collections work even when they don't exist in Shopify.
  for (const slug of ['new-arrivals', 'sale']) {
    if (!list.some((c) => c.slug === slug)) {
      const f = fallback[slug];
      list.push({ slug, name: f.name, description: f.description, image: null, parent: null, position: f.position, smart: true });
    }
  }
  list.sort((a, b) => a.position - b.position);
  return list.map(({ position, ...c }) => ({ ...c, productCount: products.filter((p) => inCategory(p, c.slug, list)).length }));
}

function inCategory(p, slug, categories) {
  if (slug === 'new-arrivals') return p.isNew || p.collections.includes(slug);
  if (slug === 'sale') return p.onSale || p.collections.includes(slug);
  const children = categories.filter((c) => c.parent === slug).map((c) => c.slug);
  return p.collections.includes(slug) || children.some((s) => p.collections.includes(s));
}

// ---------- endpoints ----------

const SORTS = {
  newest: (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt) || a.rank - b.rank,
  popular: (a, b) => a.rank - b.rank,
  price_asc: (a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price) || a.rank - b.rank,
  price_desc: (a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price) || a.rank - b.rank,
};

const list = (v) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : []);
const euro = (v) => (v === undefined || v === null || v === '' || Number.isNaN(Number(v)) ? null : Math.round(Number(v) * 100));

function matcher(f, categories, skip = {}) {
  return (p) => {
    if (f.category && !skip.category && !inCategory(p, f.category, categories)) return false;
    if (f.q && !f.q.toLowerCase().split(/\s+/).every((w) => p.search.includes(w))) return false;
    const eff = p.salePrice ?? p.price;
    if (!skip.price && f.minPrice != null && eff < f.minPrice) return false;
    if (!skip.price && f.maxPrice != null && eff > f.maxPrice) return false;
    if (f.featured && !p.featured) return false;
    // Size / colour / stock must all be met by the same variant.
    const sizes = skip.size ? [] : f.sizes;
    const colors = skip.color ? [] : f.colors;
    if (sizes.length || colors.length || f.inStock) {
      return p.variants.some((v) => (!sizes.length || sizes.includes(v.size))
        && (!colors.length || colors.includes(v.color)) && (!f.inStock || v.available > 0));
    }
    return true;
  };
}

export async function listProducts(params) {
  const { products, categories } = await loadCatalog();
  const f = {
    q: params.get('q')?.trim() || '',
    category: params.get('category') || null,
    sizes: list(params.get('size')),
    colors: list(params.get('color')),
    minPrice: euro(params.get('minPrice')),
    maxPrice: euro(params.get('maxPrice')),
    inStock: params.get('inStock') === 'true',
    featured: params.get('featured') === 'true',
  };
  const limit = Math.min(Math.max(Number(params.get('limit')) || 12, 1), 48);
  const page = Math.max(Number(params.get('page')) || 1, 1);
  const all = products.filter(matcher(f, categories)).sort(SORTS[params.get('sort')] || SORTS.newest);

  // Facets: each one ignores its own filter, like before.
  const sizeSet = products.filter(matcher(f, categories, { size: true }));
  const colorSet = products.filter(matcher(f, categories, { color: true }));
  const priceSet = products.filter(matcher(f, categories, { price: true }));
  const sizeCounts = new Map();
  for (const p of sizeSet) for (const s of new Set(p.variants.map((v) => v.size).filter(Boolean))) sizeCounts.set(s, (sizeCounts.get(s) || 0) + 1);
  const colorCounts = new Map();
  for (const p of colorSet) for (const c of p.colors) {
    const cur = colorCounts.get(c.code) || { code: c.code, hex: c.hex, name: c.name, count: 0 };
    cur.count += 1;
    colorCounts.set(c.code, cur);
  }
  const prices = priceSet.map((p) => p.salePrice ?? p.price);
  const colorOrder = (code) => { const i = COLORS.findIndex((c) => c.code === code); return i < 0 ? 99 : i; };

  return {
    items: all.slice((page - 1) * limit, page * limit).map(toCard),
    page,
    limit,
    total: all.length,
    pages: Math.max(1, Math.ceil(all.length / limit)),
    facets: {
      sizes: [...sizeCounts].map(([code, count]) => ({ code, count }))
        .sort((a, b) => (SIZE_ORDER.indexOf(a.code) + 1 || 99) - (SIZE_ORDER.indexOf(b.code) + 1 || 99)),
      colors: [...colorCounts.values()].sort((a, b) => colorOrder(a.code) - colorOrder(b.code)),
      price: { min: prices.length ? Math.min(...prices) : null, max: prices.length ? Math.max(...prices) : null },
    },
  };
}

export async function getProduct(slug, { signal } = {}) {
  // Fresh from Shopify so stock is current; related products come from the cached catalogue.
  const [{ product }, { products, categories }] = await Promise.all([storefront(PRODUCT, { handle: slug }, { signal }), loadCatalog()]);
  if (!product) throw new ApiError(404, { error: 'NOT_FOUND', message: 'Product not found' });
  const p = mapProduct(product, products.find((x) => x.slug === slug)?.rank ?? 0);
  const own = categories.filter((c) => !c.smart && p.collections.includes(c.slug));
  const related = products
    .filter((x) => x.slug !== slug && own.some((c) => x.collections.includes(c.slug)))
    .sort(SORTS.popular).slice(0, 4).map(toCard);
  return {
    ...toCard(p),
    description: p.description, fabric: p.fabric, care: p.care, fit: p.fit, lengthInfo: p.lengthInfo,
    seoTitle: p.seoTitle, seoDesc: p.seoDesc,
    categories: own.map((c) => ({ slug: c.slug, name: c.name })),
    sizes: p.sizes,
    lengths: p.lengths,
    variants: p.variants,
    related,
  };
}

export async function listCategories() {
  return (await loadCatalog()).categories;
}

export async function homepage() {
  const { products, categories } = await loadCatalog();
  const newest = [...products].sort(SORTS.newest);
  const featured = newest.filter((p) => p.featured);
  return {
    featured: (featured.length ? featured : newest).slice(0, 8).map(toCard),
    newArrivals: newest.slice(0, 8).map(toCard),
    bestSellers: [...products].sort(SORTS.popular).slice(0, 8).map(toCard),
    categories,
  };
}
