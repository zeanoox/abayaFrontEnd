import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => load('lorim-cart', []));
  const [wishlist, setWishlist] = useState(() => load('lorim-wishlist', []));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem('lorim-cart', JSON.stringify(items)); } catch {}
  }, [items]);
  useEffect(() => {
    try { localStorage.setItem('lorim-wishlist', JSON.stringify(wishlist)); } catch {}
  }, [wishlist]);

  const value = useMemo(() => {
    const add = (product) => {
      setItems((prev) => {
        const found = prev.find((i) => i.id === product.id);
        if (found) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
        return [...prev, { ...product, qty: 1 }];
      });
      setOpen(true);
    };
    const setQty = (id, qty) =>
      setItems((prev) => (qty <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, qty } : i))));
    const toggleWish = (id) =>
      setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    const count = items.reduce((s, i) => s + i.qty, 0);
    const total = items.reduce((s, i) => s + i.qty * i.price, 0);
    return { items, add, setQty, count, total, open, setOpen, wishlist, toggleWish };
  }, [items, wishlist, open]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
