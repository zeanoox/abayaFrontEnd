// Shop settings that Shopify's Storefront API does not provide in the shape this site needs.
// Everything sellable (products, variants, prices, stock, collections, discount codes, checkout)
// lives in Shopify; these are display helpers and fallbacks.

const env = import.meta.env || globalThis.process?.env || {};

export const SHOPIFY = {
  domain: (env.VITE_SHOPIFY_STORE_DOMAIN || '').replace(/^https?:\/\//, '').replace(/\/$/, ''),
  token: env.VITE_SHOPIFY_STOREFRONT_TOKEN || '',
  version: env.VITE_SHOPIFY_API_VERSION || '2026-10',
  /** Where customers see their orders (Shopify customer accounts). */
  accountUrl: env.VITE_SHOPIFY_ACCOUNT_URL || '',
};

/** Metafield (namespace.key, JSON) holding NL/EN/AR texts for products and collections. */
export const I18N_METAFIELD = { namespace: 'custom', key: 'lorim' };

/** Product tags with a meaning on this site. */
export const TAGS = { featured: 'featured', new: 'new' };

export const MAX_LINE_QTY = 20;
export const LOW_STOCK_AT = 2;

// Option names as they may be called in Shopify admin (any language).
export const OPTION_NAMES = {
  color: ['color', 'colour', 'kleur', 'اللون'],
  size: ['size', 'maat', 'المقاس'],
  length: ['length', 'lengte', 'الطول'],
};

// Colour swatches: the Shopify option value (e.g. "Black") is matched on any of these names or the code.
export const COLORS = [
  { code: 'black', hex: '#1f1e1c', name: { nl: 'Zwart', en: 'Black', ar: 'أسود' } },
  { code: 'beige', hex: '#d3c3a6', name: { nl: 'Beige', en: 'Beige', ar: 'بيج' } },
  { code: 'sand', hex: '#b9a88c', name: { nl: 'Zand', en: 'Sand', ar: 'رملي' } },
  { code: 'mocha', hex: '#6e5848', name: { nl: 'Mokka', en: 'Mocha', ar: 'موكا' } },
  { code: 'olive', hex: '#5f6146', name: { nl: 'Olijfgroen', en: 'Olive', ar: 'زيتي' } },
  { code: 'sage', hex: '#8f9a7f', name: { nl: 'Saliegroen', en: 'Sage', ar: 'أخضر مريمي' } },
  { code: 'darkgreen', hex: '#3f4a34', name: { nl: 'Donkergroen', en: 'Dark green', ar: 'أخضر داكن' } },
  { code: 'navy', hex: '#252b3d', name: { nl: 'Marineblauw', en: 'Navy', ar: 'كحلي' } },
  { code: 'burgundy', hex: '#5b2430', name: { nl: 'Bordeaux', en: 'Burgundy', ar: 'عنابي' } },
  { code: 'gold', hex: '#b59b6a', name: { nl: 'Goud', en: 'Gold', ar: 'ذهبي' } },
];

export const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'OS'];

// Used when a collection has no `custom.lorim` metafield yet (and for the two smart collections).
export const CATEGORIES = [
  { slug: 'abayas', position: 1, name: { nl: 'Abaya’s', en: 'Abayas', ar: 'عبايات' } },
  { slug: 'open-abayas', parent: 'abayas', position: 2 },
  { slug: 'closed-abayas', parent: 'abayas', position: 3 },
  { slug: 'everyday-abayas', parent: 'abayas', position: 4 },
  { slug: 'occasion-abayas', parent: 'abayas', position: 5 },
  { slug: 'luxury-abayas', parent: 'abayas', position: 6 },
  { slug: 'hijabs', position: 7 },
  { slug: 'khimars', position: 8 },
  { slug: 'accessories', position: 9 },
  { slug: 'new-arrivals', position: 10, smart: true, name: { nl: 'Nieuw binnen', en: 'New Arrivals', ar: 'وصل حديثاً' },
    description: { nl: 'De nieuwste ontwerpen.', en: 'Our latest designs.', ar: 'أحدث تصاميمنا.' } },
  { slug: 'sale', position: 11, smart: true, name: { nl: 'Sale', en: 'Sale', ar: 'تخفيضات' },
    description: { nl: 'Favorieten met korting.', en: 'Favourites, reduced.', ar: 'قطع مختارة بأسعار مخفّضة.' } },
];

// Collections Shopify creates itself that should not appear as categories.
export const HIDDEN_COLLECTIONS = ['frontpage', 'all', 'featured'];

// Shipping *estimate* in the cart. The real rates are set in Shopify → Settings → Shipping and
// chosen at Shopify checkout — keep these in sync with that page.
export const SHIPPING = [
  { code: 'nl-standard', carrier: 'PostNL', price: 495, freeOver: 7500, minDays: 1, maxDays: 2, countries: ['NL'],
    name: { nl: 'PostNL standaard', en: 'PostNL standard', ar: 'PostNL عادي' } },
  { code: 'be-standard', carrier: 'PostNL', price: 795, freeOver: 10000, minDays: 2, maxDays: 3, countries: ['BE'],
    name: { nl: 'Verzending België', en: 'Shipping to Belgium', ar: 'الشحن إلى بلجيكا' } },
  { code: 'eu-standard', carrier: 'PostNL', price: 1295, freeOver: 15000, minDays: 3, maxDays: 7,
    countries: ['DE', 'FR', 'LU', 'AT', 'ES', 'IT', 'DK', 'SE', 'IE', 'PL'],
    name: { nl: 'Verzending EU', en: 'EU shipping', ar: 'الشحن داخل الاتحاد الأوروبي' } },
];
