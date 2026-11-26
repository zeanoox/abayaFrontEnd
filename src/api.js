import { products as demoProducts, categories as demoCategories } from './data/products.js';

const API_URL = import.meta.env.VITE_API_URL;

async function get(path, fallback) {
  if (!API_URL) return fallback;
  try {
    const res = await fetch(`${API_URL}${path}`);
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch (err) {
    console.warn(`[api] ${path} failed, using demo data:`, err.message);
    return fallback;
  }
}

export const fetchProducts = () => get('/products', demoProducts);
export const fetchCategories = () => get('/categories', demoCategories);
