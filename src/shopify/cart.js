// Cart on Shopify's Cart API, returned in the shape the cart/checkout pages use.
// Prices, discounts and stock come from Shopify; payment happens on Shopify's own checkout.
import { ApiError, cents, storefront } from './client.js';
import { MAX_LINE_QTY, SHIPPING } from './config.js';
import { parseJson, variantOptions } from './catalog.js';

const CART_FIELDS = `
  id checkoutUrl totalQuantity
  buyerIdentity { countryCode email }
  discountCodes { code applicable }
  discountAllocations { discountedAmount { amount } }
  lines(first: 100) { nodes {
    id quantity
    cost { amountPerQuantity { amount } compareAtAmountPerQuantity { amount } }
    discountAllocations { discountedAmount { amount } }
    merchandise { ... on ProductVariant {
      id sku availableForSale {{QTY}}
      selectedOptions { name value }
      image { url }
      product { handle title featuredImage { url } lorim: metafield(namespace: "custom", key: "lorim") { value } }
    } }
  } }`;

const ERRORS = 'userErrors { field message code }';

const Q = {
  get: `query Cart($id: ID!) { cart(id: $id) { ${CART_FIELDS} } }`,
  create: `mutation Create($input: CartInput) { cartCreate(input: $input) { cart { ${CART_FIELDS} } ${ERRORS} } }`,
  add: `mutation Add($id: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $id, lines: $lines) { cart { ${CART_FIELDS} } ${ERRORS} } }`,
  update: `mutation Upd($id: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $id, lines: $lines) { cart { ${CART_FIELDS} } ${ERRORS} } }`,
  remove: `mutation Rem($id: ID!, $ids: [ID!]!) { cartLinesRemove(cartId: $id, lineIds: $ids) { cart { ${CART_FIELDS} } ${ERRORS} } }`,
  codes: `mutation Codes($id: ID!, $codes: [String!]) { cartDiscountCodesUpdate(cartId: $id, discountCodes: $codes) { cart { ${CART_FIELDS} } ${ERRORS} } }`,
  buyer: `mutation Buyer($id: ID!, $b: CartBuyerIdentityInput!) { cartBuyerIdentityUpdate(cartId: $id, buyerIdentity: $b) { cart { ${CART_FIELDS} } ${ERRORS} } }`,
  address: `mutation Addr($id: ID!, $a: [CartSelectableAddressInput!]!) { cartDeliveryAddressesReplace(cartId: $id, addresses: $a) { cart { id } ${ERRORS} } }`,
  variant: `query V($id: ID!) { node(id: $id) { ... on ProductVariant { id availableForSale {{QTY}} } } }`,
};

const notFound = () => new ApiError(404, { error: 'NOT_FOUND', message: 'Cart not found' });

async function mutate(name, vars) {
  const data = await storefront(Q[name], vars);
  const payload = Object.values(data)[0];
  const errs = payload?.userErrors || [];
  if (errs.length) {
    if (errs.some((e) => /not.?found|does not exist/i.test(e.message) || e.code === 'INVALID' && /cart/i.test(e.field?.join('.') || ''))) throw notFound();
    const stock = errs.find((e) => /stock|inventory|available/i.test(e.message));
    if (stock) throw new ApiError(409, { error: 'OUT_OF_STOCK', message: stock.message });
    throw new ApiError(400, { error: 'VALIDATION', message: errs.map((e) => e.message).join('; '), fields: errs });
  }
  if (!payload?.cart) throw notFound();
  return payload.cart;
}

async function getCart(id) {
  if (!id || typeof id !== 'string' || !id.startsWith('gid://shopify/Cart/')) throw notFound();
  const { cart } = await storefront(Q.get, { id });
  if (!cart) throw notFound(); // expired, or already checked out
  return cart;
}

/** Keeps the cart's country (used by Shopify for prices/taxes) in line with the chosen country. */
async function withCountry(cart, country) {
  if (!country || cart.buyerIdentity?.countryCode === country) return cart;
  try { return await mutate('buyer', { id: cart.id, b: { countryCode: country } }); } catch { return cart; }
}

// ---------- shape ----------

function shape(cart, { country = 'NL', shipping } = {}) {
  const lines = cart.lines.nodes.filter((l) => l.merchandise?.id).map((l) => {
    const m = l.merchandise;
    const o = variantOptions(m.selectedOptions);
    const unitPrice = cents(l.cost.amountPerQuantity);
    const compare = cents(l.cost.compareAtAmountPerQuantity);
    const qty = m.quantityAvailable;
    const available = !m.availableForSale ? 0 : Math.max(0, Math.min(qty ?? MAX_LINE_QTY, MAX_LINE_QTY));
    let issue = null;
    if (!m.availableForSale) issue = 'OUT_OF_STOCK';
    else if (qty != null && qty < l.quantity) issue = 'INSUFFICIENT_STOCK';
    const t = parseJson(m.product.lorim);
    return {
      id: l.id,
      variantId: m.id,
      quantity: l.quantity,
      product: { slug: m.product.handle, name: t.name && Object.keys(t.name).length ? t.name : m.product.title },
      variant: { sku: m.sku, size: o.size, length: o.length, color: o.color ? { code: o.color.code, name: o.color.name, hex: o.color.hex } : null },
      image: m.image?.url || m.product.featuredImage?.url || null,
      unitPrice,
      compareAt: compare && compare > unitPrice ? compare : null,
      lineTotal: unitPrice * l.quantity,
      available,
      issue,
    };
  });

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const sum = (allocs) => (allocs || []).reduce((s, a) => s + (cents(a.discountedAmount) || 0), 0);
  const discount = Math.min(subtotal, sum(cart.discountAllocations) + cart.lines.nodes.reduce((s, l) => s + sum(l.discountAllocations), 0));

  // Shopify accepts one code here; it tells us whether it applies, not why not.
  const code = cart.discountCodes?.[0];
  const coupon = code ? { code: code.code.toUpperCase(), valid: code.applicable, error: code.applicable ? undefined : 'INVALID' } : null;
  // A valid code that takes nothing off the items is (almost always) a free-shipping code.
  const freeShipping = Boolean(code?.applicable) && discount === 0;

  const options = SHIPPING.filter((m) => !m.countries?.length || m.countries.includes(country)).map((m) => {
    const free = freeShipping || (m.freeOver != null && subtotal - discount >= m.freeOver);
    return { id: m.code, code: m.code, name: m.name, carrier: m.carrier, price: free ? 0 : m.price, regularPrice: m.price,
      freeOver: m.freeOver ?? null, minDays: m.minDays, maxDays: m.maxDays };
  });
  const selected = options.find((o) => o.code === shipping) || options[0] || null;
  const shippingCost = selected ? selected.price : 0;

  return {
    token: cart.id,
    lines,
    itemCount: lines.reduce((s, l) => s + l.quantity, 0),
    subtotal,
    coupon,
    discount,
    country,
    shippingOptions: options,
    shipping: selected,
    shippingCost,
    total: Math.max(0, subtotal - discount + shippingCost),
    currency: 'EUR',
    canCheckout: lines.length > 0 && !lines.some((l) => l.issue) && Boolean(selected),
    checkoutUrl: cart.checkoutUrl,
  };
}

// ---------- endpoints ----------

export async function createCart(opts) {
  const cart = await mutate('create', { input: { buyerIdentity: { countryCode: opts.country || 'NL' } } });
  return shape(cart, opts);
}

export async function readCart(token, opts) {
  return shape(await withCountry(await getCart(token), opts.country), opts);
}

export async function addItem(token, { variantId, quantity = 1 }, opts) {
  const qty = Math.max(1, Math.min(Number(quantity) || 1, MAX_LINE_QTY));
  const cart = await getCart(token);
  const { node: v } = await storefront(Q.variant, { id: variantId });
  if (!v) throw new ApiError(404, { error: 'VARIANT_UNAVAILABLE', message: 'This option is not available' });
  if (!v.availableForSale) throw new ApiError(409, { error: 'OUT_OF_STOCK', message: 'This option is sold out', available: 0 });
  const existing = cart.lines.nodes.find((l) => l.merchandise?.id === variantId);
  const limit = Math.min(v.quantityAvailable ?? MAX_LINE_QTY, MAX_LINE_QTY);
  if ((existing?.quantity || 0) + qty > limit) {
    throw new ApiError(409, { error: 'INSUFFICIENT_STOCK', message: 'Not enough stock', available: limit });
  }
  const updated = await mutate('add', { id: cart.id, lines: [{ merchandiseId: variantId, quantity: qty }] });
  return shape(await withCountry(updated, opts.country), opts);
}

export async function setItemQty(token, lineId, { quantity }, opts) {
  const q = Math.max(0, Math.min(Number(quantity) || 0, MAX_LINE_QTY));
  const cart = await getCart(token);
  const line = cart.lines.nodes.find((l) => l.id === lineId);
  if (!line) throw new ApiError(404, { error: 'NOT_FOUND', message: 'Cart item not found' });
  if (q === 0) return removeItem(token, lineId, opts);
  const avail = line.merchandise?.quantityAvailable;
  if (q > line.quantity && avail != null && q > Math.min(avail, MAX_LINE_QTY)) {
    throw new ApiError(409, { error: 'INSUFFICIENT_STOCK', message: 'Not enough stock', available: Math.min(avail, MAX_LINE_QTY) });
  }
  return shape(await mutate('update', { id: cart.id, lines: [{ id: lineId, quantity: q }] }), opts);
}

export async function removeItem(token, lineId, opts) {
  return shape(await mutate('remove', { id: token, ids: [lineId] }), opts);
}

export async function setCoupon(token, code, opts) {
  const clean = code ? String(code).trim().toUpperCase() : null;
  if (clean && !/^[A-Z0-9_-]{2,40}$/.test(clean)) throw new ApiError(400, { error: 'VALIDATION', message: 'Invalid code' });
  return shape(await mutate('codes', { id: token, codes: clean ? [clean] : [] }), opts);
}

/**
 * Passes the customer's details to the Shopify cart and returns Shopify's checkout URL.
 * Shopify checkout takes the payment and creates the order; it shows the final shipping price.
 */
export async function checkout(body) {
  const cart = await getCart(body.cartToken);
  if (!cart.lines.nodes.length) throw new ApiError(409, { error: 'CART_CHANGED', message: 'Cart is empty' });
  const shaped = shape(cart, { country: body.address?.country });
  if (shaped.lines.some((l) => l.issue)) throw new ApiError(409, { error: 'OUT_OF_STOCK', message: 'An item is no longer available' });

  const c = body.customer || {};
  const a = body.address || {};
  const [firstName, ...rest] = String(c.fullName || '').trim().split(/\s+/);
  const lastName = rest.join(' ') || firstName;
  const phone = String(c.phone || '').replace(/[^\d+]/g, '');

  const identity = { email: c.email, countryCode: a.country };
  try {
    await mutate('buyer', { id: cart.id, b: { ...identity, phone } });
  } catch (err) {
    if (err.code === 'NOT_FOUND') throw err;
    await mutate('buyer', { id: cart.id, b: identity }); // phone not in a format Shopify accepts; checkout will ask
  }

  // Prefill the address on Shopify checkout. Not fatal if Shopify rejects it — checkout asks again.
  try {
    await mutate('address', {
      id: cart.id,
      a: [{
        selected: true,
        oneTimeUse: true,
        address: { deliveryAddress: {
          firstName, lastName, address1: a.line1, address2: a.line2 || null, city: a.city, zip: a.postalCode, countryCode: a.country,
          phone: phone || null,
        } },
      }],
    });
  } catch (err) {
    if (err.code === 'NOT_FOUND') throw err;
  }

  const url = new URL(cart.checkoutUrl);
  if (body.locale) url.searchParams.set('locale', body.locale);
  return { checkoutUrl: url.toString() };
}
