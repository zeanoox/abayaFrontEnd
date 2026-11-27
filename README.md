# LORIM – Shop Frontend

React + Vite storefront for LORIM abayas, in **Dutch, English and Arabic** (RTL).
All products, stock, cart, prices and orders come from Shopify.

## Backend: Shopify

Products, variants, prices, stock, collections, discount codes, cart, checkout, payments and orders
all live in **Shopify** (store `sbheku-am.myshopify.com`). The site talks to Shopify's Storefront API
straight from the browser — there is no separate server any more (the old `abayaBackEnd` is no longer used).

| What | Where in Shopify |
| --- | --- |
| Products | Colour / Size / Length options; sale = *compare-at price* |
| NL / EN / AR texts | product & collection metafield `custom.lorim` (JSON: `name`, `description`, `fabric`, `care`, `fit`, `lengthInfo`) — falls back to the Shopify title/description |
| Categories | collections (`abayas`, `open-abayas`, …); sub-category = `"parent"` in the collection's `custom.lorim` |
| New / featured | product tags `new` and `featured` |
| Discount codes | Shopify discounts (`WELKOM10`, `EID15`, `GRATISVERZENDING`) |
| Shipping | estimate in `src/shopify/config.js`; real rates in Settings → Shipping and delivery |
| Payment & orders | Shopify checkout (iDEAL, cards via Shopify Payments) |

### One-time Shopify setup

1. Install the **Headless** sales channel → *Create storefront* → copy the **public access token**.
   Give it the `unauthenticated_read_product_inventory` permission to show live stock.
2. Make products and collections available to that Headless storefront (Products → select all → *Include in sales channels*).
3. Settings → Domains → connect `shop.lorim.nl` (DNS record already in Cloudflare) so checkout runs on your domain.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in VITE_SHOPIFY_STOREFRONT_TOKEN
npm run dev                  # http://localhost:5173
```

## Deploy (Cloudflare Workers)

Cloudflare Workers Builds deploys `main` automatically. Build variables (Worker → Settings → Build):

```
VITE_SHOPIFY_STORE_DOMAIN=sbheku-am.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=<public Storefront token>
```

Custom domains `lorim.nl` and `www.lorim.nl` are attached to the Worker; `shop.lorim.nl` is a DNS-only CNAME to `shops.myshopify.com`.

## Loading the catalogue again

`shopify/import.mjs` (with `shopify/seed-data.js` and `shopify/images/`) recreates the starter catalogue in any
store: `SHOPIFY_STORE=… SHOPIFY_ADMIN_TOKEN=… node shopify/import.mjs` (or `--dry` to print the inputs).

## Pages

| Route | |
| --- | --- |
| `/` | hero, featured, categories, new arrivals, promotions, best sellers, about, reviews, newsletter |
| `/shop`, `/collections/:slug` | search (`?q=`), filters (category, size, colour, price, in stock), sorting, load more |
| `/products/:slug` | gallery (zoom, full screen, per-colour images), colour/size/length selection, stock, size guide, structured data |
| `/cart` | quantities, discount code, shipping estimate per country |
| `/checkout` | contact + address → Shopify checkout (payment) |
| `/order/:number` | thank-you landing page (Shopify sends the order confirmation) |
| `/track` | link to Shopify customer accounts / order status |
| `/wishlist` | saved on this device (moves to accounts in phase 4) |

## Structure

```
src/
  api.js                 routes the shop's data calls to Shopify
  shopify/               Storefront API client, catalogue, cart, settings
  context/               CartContext (Shopify cart), WishlistContext
  i18n/                  NL / EN / AR strings, language + direction switching
  components/            Header, Footer, ProductCard, QuickView, VariantPicker, Gallery, SizeGuide, CartDrawer, …
  pages/                 Home, Shop, Product, Cart, Checkout, Order, Track, Wishlist, NotFound
  styles.css             olive / sand / cream theme, logical CSS for LTR + RTL
```
