# LORIM – Shop Frontend

React + Vite storefront for LORIM abayas, in **Dutch, English and Arabic** (RTL).
All products, stock, cart, prices and orders come from the backend: [abayaBackEnd](https://github.com/zeanoox/abayaBackEnd).

## Run locally

```bash
npm install
echo "VITE_API_URL=http://localhost:4000/api" > .env.local
npm run dev        # http://localhost:5173 (start the backend first)
```

## Deploy (Cloudflare Workers)

`wrangler.jsonc` serves `dist/` with single-page-app routing.
In Cloudflare → your project → **Settings → Variables**, add a *build* variable:

```
VITE_API_URL=https://<your-backend-host>/api
```

then redeploy. Without it the site loads but shows "the shop is temporarily unavailable".
Also add the Cloudflare URL to the backend's `CORS_ORIGIN` and set it as `FRONTEND_URL`.

## Pages

| Route | |
| --- | --- |
| `/` | hero, featured, categories, new arrivals, promotions, best sellers, about, reviews, newsletter |
| `/shop`, `/collections/:slug` | search (`?q=`), filters (category, size, colour, price, in stock), sorting, load more |
| `/products/:slug` | gallery (zoom, full screen, per-colour images), colour/size/length selection, stock, size guide, structured data |
| `/cart` | quantities, discount code, shipping estimate per country |
| `/checkout` | guest checkout → Mollie payment page |
| `/order/:number?token=` | verified order status after payment |
| `/track` | order lookup with order number + e-mail |
| `/wishlist` | saved on this device (moves to accounts in phase 4) |

## Structure

```
src/
  api.js                 API client (cart token in X-Cart-Token header)
  context/               CartContext (server cart), WishlistContext
  i18n/                  NL / EN / AR strings, language + direction switching
  components/            Header, Footer, ProductCard, QuickView, VariantPicker, Gallery, SizeGuide, CartDrawer, …
  pages/                 Home, Shop, Product, Cart, Checkout, Order, Track, Wishlist, NotFound
  styles.css             olive / sand / cream theme, logical CSS for LTR + RTL
```
