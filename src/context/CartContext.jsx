import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api.js';

// The cart lives in Shopify; the browser only keeps the Shopify cart id so it survives refreshes and return visits.
const CartContext = createContext(null);
const KEY = 'lorim-shopify-cart';

const readToken = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const writeToken = (v) => { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch { /* ignore */ } };

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [opts, setOpts] = useState({ country: 'NL', shipping: undefined });
  const tokenRef = useRef(readToken());
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const query = () => {
    const o = optsRef.current;
    return `?country=${o.country}${o.shipping ? `&shipping=${encodeURIComponent(o.shipping)}` : ''}`;
  };

  const ensureToken = useCallback(async () => {
    if (tokenRef.current) return tokenRef.current;
    const c = await api(`/cart${query()}`, { method: 'POST' });
    tokenRef.current = c.token;
    writeToken(c.token);
    setCart(c);
    return c.token;
  }, []);

  /** Runs a cart request; recreates the cart once if the stored token is unknown (e.g. expired). */
  const call = useCallback(async (path, init = {}) => {
    const run = async () => api(`${path}${query()}`, { ...init, cartToken: await ensureToken() });
    try {
      const c = await run();
      setCart(c);
      setError(null);
      return c;
    } catch (err) {
      if (err.status === 404 && err.body?.message === 'Cart not found') {
        tokenRef.current = null;
        writeToken(null);
        const c = await run();
        setCart(c);
        return c;
      }
      throw err;
    }
  }, [ensureToken]);

  const refresh = useCallback(async () => {
    if (!tokenRef.current) { setCart(null); return null; }
    try { return await call('/cart'); } catch (err) { setError(err); return null; }
  }, [call]);

  useEffect(() => { refresh(); }, [refresh, opts]);

  const value = useMemo(() => ({
    cart,
    error,
    open,
    setOpen,
    count: cart?.itemCount || 0,
    token: () => tokenRef.current,
    country: opts.country,
    setShippingOptions: (o) => setOpts((p) => ({ ...p, ...o })),
    refresh,
    add: async (variantId, quantity = 1) => {
      const c = await call('/cart/items', { method: 'POST', body: { variantId, quantity } });
      setOpen(true);
      return c;
    },
    setQty: (itemId, quantity) => call(`/cart/items/${encodeURIComponent(itemId)}`, { method: 'PATCH', body: { quantity } }),
    remove: (itemId) => call(`/cart/items/${encodeURIComponent(itemId)}`, { method: 'DELETE' }),
    applyCoupon: (code) => call('/cart/coupon', { method: 'POST', body: { code } }),
    removeCoupon: () => call('/cart/coupon', { method: 'DELETE' }),
  }), [cart, error, open, opts.country, refresh, call]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
