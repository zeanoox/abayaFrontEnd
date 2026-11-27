#!/usr/bin/env node
// Loads the LORIM starter catalogue into a Shopify store (Admin GraphQL API).
//
//   SHOPIFY_STORE=your-store.myshopify.com SHOPIFY_ADMIN_TOKEN=shpat_... node shopify/import.mjs
//   node shopify/import.mjs --dry      # print the inputs instead of sending them
//
// Needs a custom app token with: write_products, write_publications, write_discounts,
// write_inventory, read_locations. Safe to re-run: products are upserted by handle (productSet),
// collections by handle; existing discount codes are skipped.
import * as D from './seed-data.js';

const STORE = process.env.SHOPIFY_STORE;
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const VERSION = process.env.SHOPIFY_API_VERSION || '2026-10';
const IMAGE_BASE = process.env.IMAGE_BASE
  || 'https://raw.githubusercontent.com/zeanoox/abayaFrontEnd/shopify-backend/shopify/images';
const DRY = process.argv.includes('--dry');

const money = (c) => (c / 100).toFixed(2);
const colorOf = (code) => D.colors.find((c) => c.code === code);

// Same deterministic stock levels as the old backend seed.
let s = 42;
const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);

export function collectionInputs() {
  return D.categories.map((c) => ({
    handle: c.slug,
    title: c.name.en,
    descriptionHtml: `<p>${c.description.en}</p>`,
    metafields: [{ namespace: 'custom', key: 'lorim', type: 'json',
      value: JSON.stringify({ name: c.name, description: c.description, parent: c.parent || null, position: c.pos }) }],
    ...(c.slug === 'new-arrivals' ? { ruleSet: { appliedDisjunctively: false, rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'new' }] } } : {}),
    ...(c.slug === 'sale' ? { ruleSet: { appliedDisjunctively: false, rules: [{ column: 'IS_PRICE_REDUCED', relation: 'IS_SET', condition: '' }] } } : {}),
    ...(c.smart ? {} : { sortOrder: 'BEST_SELLING' }),
  }));
}

/** productSet input for one seed product. `collectionIds` maps handle → gid, `locationId` is where stock lives. */
export function productInput(p, { collectionIds, locationId }) {
  const sizes = p.kind === 'abaya' ? ['S', 'M', 'L', 'XL', 'XXL'] : ['OS'];
  const lengths = p.lengths ? D.LENGTHS : [null];
  const options = [{ name: 'Color', values: p.colors.map((c) => ({ name: colorOf(c).name.en })) }];
  if (sizes.length > 1) options.push({ name: 'Size', values: sizes.map((x) => ({ name: x })) });
  if (p.lengths) options.push({ name: 'Length', values: D.LENGTHS.map((l) => ({ name: `${l}"` })) });

  const files = [];
  for (const code of p.colors) {
    for (const n of [1, 2]) {
      files.push({ originalSource: `${IMAGE_BASE}/${p.slug}-${code}-${n}.jpg`, filename: `${p.slug}-${code}-${n}.jpg`,
        alt: `${p.name.en} – ${colorOf(code).name.en}`, contentType: 'IMAGE' });
    }
  }

  const variants = [];
  for (const code of p.colors) {
    for (const size of sizes) {
      for (const len of lengths) {
        const sku = [p.sku, size, code.toUpperCase().slice(0, 3), len].filter(Boolean).join('-');
        const r = rand();
        let stock = r < 0.12 ? 0 : r < 0.25 ? 1 + Math.floor(rand() * 2) : 3 + Math.floor(rand() * 12);
        if (p.slug === 'rania-jersey-abaya' && code === 'black') stock = 0; // a sold-out colour to see the UI state
        const optionValues = [{ optionName: 'Color', name: colorOf(code).name.en }];
        if (sizes.length > 1) optionValues.push({ optionName: 'Size', name: size });
        if (len) optionValues.push({ optionName: 'Length', name: `${len}"` });
        variants.push({
          sku,
          optionValues,
          price: money(p.sale ?? p.price),
          compareAtPrice: p.sale ? money(p.price) : null,
          inventoryPolicy: 'DENY',
          inventoryItem: { tracked: true, sku, requiresShipping: true },
          inventoryQuantities: [{ locationId, name: 'available', quantity: stock }],
          file: { originalSource: `${IMAGE_BASE}/${p.slug}-${code}-1.jpg`, filename: `${p.slug}-${code}-1.jpg`,
            alt: `${p.name.en} – ${colorOf(code).name.en}`, contentType: 'IMAGE' },
        });
      }
    }
  }

  const tags = [p.kind];
  if (p.featured) tags.push('featured');
  if (p.daysAgo <= 30) tags.push('new');

  return {
    handle: p.slug,
    title: p.name.en,
    descriptionHtml: `<p>${p.description.en}</p>`,
    vendor: 'LORIM',
    productType: { abaya: 'Abaya', hijab: p.cats.includes('khimars') ? 'Khimar' : 'Hijab', accessory: 'Accessory' }[p.kind],
    status: 'ACTIVE',
    tags,
    collections: p.cats.map((h) => collectionIds[h]).filter(Boolean),
    metafields: [{ namespace: 'custom', key: 'lorim', type: 'json', value: JSON.stringify({
      name: p.name, description: p.description, fabric: p.fabric ?? null, care: p.care ?? null, fit: p.fit ?? null,
      lengthInfo: p.lengths ? D.lengthInfo : null,
    }) }],
    productOptions: options,
    files,
    variants,
  };
}

export const discountInputs = () => ({
  basic: [
    { title: 'WELKOM10', code: 'WELKOM10', startsAt: new Date().toISOString(),
      customerGets: { value: { percentage: 0.1 }, items: { all: true } },
      minimumRequirement: { subtotal: { greaterThanOrEqualToSubtotal: '50.00' } }, context: { all: 'ALL' } },
    { title: 'EID15', code: 'EID15', startsAt: new Date().toISOString(),
      customerGets: { value: { discountAmount: { amount: '15.00', appliesOnEachItem: false } }, items: { all: true } },
      minimumRequirement: { subtotal: { greaterThanOrEqualToSubtotal: '100.00' } }, context: { all: 'ALL' } },
  ],
  freeShipping: [
    { title: 'GRATISVERZENDING', code: 'GRATISVERZENDING', startsAt: new Date().toISOString(),
      destination: { all: true }, context: { all: 'ALL' } },
  ],
});

// ---------- runner ----------

async function gql(query, variables) {
  const res = await fetch(`https://${STORE}/admin/api/${VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

const firstError = (payload) => payload.userErrors?.[0] && new Error(JSON.stringify(payload.userErrors));

async function main() {
  if (DRY) {
    const collectionIds = Object.fromEntries(D.categories.map((c) => [c.slug, `gid://shopify/Collection/<${c.slug}>`]));
    console.log(JSON.stringify({
      collections: collectionInputs(),
      products: D.products.map((p) => productInput(p, { collectionIds, locationId: 'gid://shopify/Location/<id>' })),
      discounts: discountInputs(),
    }, null, 2));
    return;
  }
  if (!STORE || !TOKEN) throw new Error('Set SHOPIFY_STORE and SHOPIFY_ADMIN_TOKEN (or use --dry).');

  const base = await gql(`{ locations(first: 1) { nodes { id } }
    publications(first: 20) { nodes { id catalog { title } } }
    collections(first: 100) { nodes { id handle } } }`);
  const locationId = base.locations.nodes[0].id;
  const collectionIds = Object.fromEntries(base.collections.nodes.map((c) => [c.handle, c.id]));

  for (const input of collectionInputs()) {
    if (collectionIds[input.handle]) {
      const { collectionUpdate: r } = await gql(`mutation($i: CollectionInput!) { collectionUpdate(input: $i) { collection { id } userErrors { field message } } }`,
        { i: { id: collectionIds[input.handle], title: input.title, descriptionHtml: input.descriptionHtml, metafields: input.metafields } });
      if (firstError(r)) throw firstError(r);
    } else {
      const { collectionCreate: r } = await gql(`mutation($i: CollectionInput!) { collectionCreate(input: $i) { collection { id } userErrors { field message } } }`, { i: input });
      if (firstError(r)) throw firstError(r);
      collectionIds[input.handle] = r.collection.id;
    }
    console.log('collection', input.handle);
  }

  const productIds = [];
  for (const p of D.products) {
    const { productSet: r } = await gql(`mutation($i: ProductSetInput!, $id: ProductSetIdentifiers) {
      productSet(input: $i, identifier: $id, synchronous: true) { product { id } userErrors { field message } } }`,
    { i: productInput(p, { collectionIds, locationId }), id: { handle: p.slug } });
    if (firstError(r)) throw firstError(r);
    productIds.push(r.product.id);
    console.log('product', p.slug);
  }

  // Make everything visible to every sales channel (incl. the Headless storefront).
  const input = base.publications.nodes.map((x) => ({ publicationId: x.id }));
  for (const id of [...productIds, ...Object.values(collectionIds)]) {
    const { publishablePublish: r } = await gql(`mutation($id: ID!, $i: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $i) { userErrors { field message } } }`, { id, i: input });
    if (firstError(r)) console.warn('publish', id, r.userErrors);
  }

  const d = discountInputs();
  for (const b of d.basic) {
    const { discountCodeBasicCreate: r } = await gql(`mutation($b: DiscountCodeBasicInput!) {
      discountCodeBasicCreate(basicCodeDiscount: $b) { userErrors { field message } } }`, { b });
    console.log('discount', b.code, r.userErrors.length ? r.userErrors[0].message : 'ok');
  }
  for (const f of d.freeShipping) {
    const { discountCodeFreeShippingCreate: r } = await gql(`mutation($f: DiscountCodeFreeShippingInput!) {
      discountCodeFreeShippingCreate(freeShippingCodeDiscount: $f) { userErrors { field message } } }`, { f });
    console.log('discount', f.code, r.userErrors.length ? r.userErrors[0].message : 'ok');
  }
  console.log('done');
}

main().catch((err) => { console.error(err); process.exit(1); });
