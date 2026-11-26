# LORIM – Shop Frontend

Arabic (RTL) storefront for **LORIM / لوريم** abayas — React + Vite.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
```

## Connect the backend

Copy `.env.example` to `.env` and set `VITE_API_URL` (default `http://localhost:4000/api`).
Without it, the site uses the demo products in `src/data/products.js`.

## Images

- Hero photo: put it at `public/images/hero.jpg` — it replaces the illustration automatically.
- Products: add an `image` field (e.g. `/images/p1.jpg`) to a product; otherwise an illustration is shown.

## Structure

```
src/
  components/  Header, Hero (image banner), Shop (collections), ProductCard, CartDrawer, Footer, Logo, Icons, AbayaArt
  context/     CartContext (cart + wishlist, saved in localStorage)
  data/        demo catalogue
  api.js       fetches from the backend, falls back to demo data
  styles.css   theme (olive / sand / cream)
```
