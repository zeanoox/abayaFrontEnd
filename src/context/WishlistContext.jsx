import { createContext, useContext, useEffect, useMemo, useState } from 'react';

// Saved on this device for now; moves to the customer account when accounts arrive (phase 4).
const WishlistContext = createContext(null);
const KEY = 'lorim-wishlist-v2';

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ } }, [items]);

  const value = useMemo(() => ({
    items,
    count: items.length,
    has: (slug) => items.some((i) => i.slug === slug),
    toggle: (product) => setItems((prev) => (prev.some((i) => i.slug === product.slug)
      ? prev.filter((i) => i.slug !== product.slug)
      // Keep only what a card needs to render.
      : [...prev, {
        slug: product.slug, name: product.name, price: product.price, salePrice: product.salePrice,
        image: product.image, hoverImage: product.hoverImage, colors: product.colors, inStock: product.inStock,
        isNew: product.isNew, onSale: product.onSale,
      }])),
  }), [items]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => useContext(WishlistContext);
