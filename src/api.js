// The shop's data layer. It used to call the LORIM Express backend; now Shopify is the backend.
// The pages still call api('/products?...'), api('/cart/items', ...) etc.; this file routes those
// paths to Shopify's Storefront API (src/shopify/*) and returns the same shapes as before.
import { ApiError } from './shopify/client.js';
import { SHIPPING, SHOPIFY } from './shopify/config.js';
import { getProduct, homepage, listCategories, listProducts } from './shopify/catalog.js';
import * as cart from './shopify/cart.js';

export { ApiError };
export const API_URL = SHOPIFY.domain ? `https://${SHOPIFY.domain}` : '';

const routes = [
  ['GET', /^\/home$/, () => homepage()],
  ['GET', /^\/categories$/, () => listCategories()],
  ['GET', /^\/products$/, ({ query }) => listProducts(query)],
  ['GET', /^\/products\/([a-z0-9-]+)$/, ({ m, signal }) => getProduct(m[1], { signal })],
  ['GET', /^\/shipping-methods$/, async () => SHIPPING],

  ['POST', /^\/cart$/, ({ opts }) => cart.createCart(opts)],
  ['GET', /^\/cart$/, ({ token, opts }) => cart.readCart(token, opts)],
  ['POST', /^\/cart\/items$/, ({ token, body, opts }) => cart.addItem(token, body, opts)],
  ['PATCH', /^\/cart\/items\/(.+)$/, ({ token, m, body, opts }) => cart.setItemQty(token, decodeURIComponent(m[1]), body, opts)],
  ['DELETE', /^\/cart\/items\/(.+)$/, ({ token, m, opts }) => cart.removeItem(token, decodeURIComponent(m[1]), opts)],
  ['POST', /^\/cart\/coupon$/, ({ token, body, opts }) => cart.setCoupon(token, body?.code, opts)],
  ['DELETE', /^\/cart\/coupon$/, ({ token, opts }) => cart.setCoupon(token, null, opts)],
  ['POST', /^\/checkout$/, ({ body }) => cart.checkout(body)],

  ['POST', /^\/newsletter$/, ({ body }) => newsletter(body)],
];

export async function api(path, { method = 'GET', body, cartToken, signal } = {}) {
  const [pathname, search = ''] = path.split('?');
  const query = new URLSearchParams(search);
  const route = routes.find(([mth, re]) => mth === method && re.test(pathname));
  if (!route) throw new ApiError(404, { error: 'NOT_FOUND', message: 'Not found' });
  const opts = { country: (query.get('country') || 'NL').toUpperCase(), shipping: query.get('shipping') || undefined };
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  const result = await route[2]({ m: pathname.match(route[1]), query, body, token: cartToken, opts, signal });
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  return result;
}

/**
 * Newsletter sign-up through Shopify's customer form: creates/updates a customer with
 * email-marketing consent. The response is opaque (no-cors), so this is best effort.
 */
async function newsletter({ email, locale } = {}) {
  if (!SHOPIFY.domain || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email || '')) throw new ApiError(400, { error: 'VALIDATION' });
  const form = new URLSearchParams({
    form_type: 'customer', utf8: '✓', 'contact[email]': email, 'contact[tags]': `newsletter,lang-${locale || 'nl'}`,
  });
  await fetch(`https://${SHOPIFY.domain}/contact#contact_form`, { method: 'POST', mode: 'no-cors', body: form })
    .catch(() => { throw new ApiError(0, { error: 'NETWORK' }); });
  return { ok: true };
}

/** Image URLs from Shopify are absolute (CDN). */
export const img = (url) => url || '';

export const qs = (params) => {
  const s = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) return;
    s.set(k, Array.isArray(v) ? v.join(',') : String(v));
  });
  const out = s.toString();
  return out ? `?${out}` : '';
};
