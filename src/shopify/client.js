import { SHOPIFY } from './config.js';

/** Error shape the pages already understand (status, code, body). */
export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || `Request failed (${status})`);
    this.status = status;
    this.code = body?.error || 'NETWORK';
    this.body = body || {};
  }
}

let inventoryAccess = true; // flips to false if the token lacks unauthenticated_read_product_inventory

/**
 * Runs a Storefront API query. `{{QTY}}` in the query is replaced by `quantityAvailable`
 * when the token may read inventory, so the shop still works with a token that can't.
 */
export async function storefront(query, variables = {}, { signal } = {}) {
  if (!SHOPIFY.domain || !SHOPIFY.token) {
    throw new ApiError(503, { error: 'NETWORK', message: 'Shopify is not configured (VITE_SHOPIFY_STORE_DOMAIN / VITE_SHOPIFY_STOREFRONT_TOKEN)' });
  }
  const send = async () => {
    let res;
    try {
      res = await fetch(`https://${SHOPIFY.domain}/api/${SHOPIFY.version}/graphql.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': SHOPIFY.token },
        body: JSON.stringify({ query: query.replaceAll('{{QTY}}', inventoryAccess ? 'quantityAvailable' : ''), variables }),
        signal,
      });
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      throw new ApiError(0, { error: 'NETWORK', message: 'Cannot reach the shop server' });
    }
    if (res.status === 429) throw new ApiError(429, { error: 'RATE_LIMITED' });
    const json = await res.json().catch(() => null);
    if (!res.ok && !json?.errors) throw new ApiError(res.status, { error: 'NETWORK', message: `Shopify returned ${res.status}` });
    return json;
  };

  let json = await send();
  if (inventoryAccess && json?.errors?.some((e) => /quantityAvailable/.test(e.message) || e.extensions?.code === 'ACCESS_DENIED')) {
    inventoryAccess = false;
    json = await send();
  }
  if (json?.errors?.length) {
    throw new ApiError(500, { error: 'NETWORK', message: json.errors.map((e) => e.message).join('; ') });
  }
  return json.data;
}

export const cents = (money) => (money?.amount == null ? null : Math.round(Number(money.amount) * 100));
