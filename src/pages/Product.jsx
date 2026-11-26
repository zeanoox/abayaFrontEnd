import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { img } from '../api.js';
import { useApi, useSeo } from '../lib/hooks.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import Gallery from '../components/Gallery.jsx';
import VariantPicker from '../components/VariantPicker.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { ErrorState, Loading } from '../components/ui.jsx';
import NotFound from './NotFound.jsx';

function StructuredData({ p, tr }) {
  // schema.org Product markup so search engines can show price and availability.
  const json = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: tr(p.name),
    sku: p.sku,
    image: p.images.slice(0, 4).map((i) => img(i.url)),
    description: tr(p.description),
    brand: { '@type': 'Brand', name: 'LORIM' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: ((p.salePrice ?? p.price) / 100).toFixed(2),
      availability: p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: window.location.href,
    },
  };
  return <script type="application/ld+json">{JSON.stringify(json)}</script>;
}

export default function Product() {
  const { slug } = useParams();
  const { t, tr } = useI18n();
  const { data: p, error, loading, reload } = useApi(`/products/${slug}`);
  const [color, setColor] = useState(null);

  useEffect(() => {
    if (p) setColor((p.colors.find((c) => c.inStock) || p.colors[0])?.code ?? null);
  }, [p]);

  // Show this colour's photos first, then the rest.
  const images = useMemo(() => {
    if (!p) return [];
    const mine = p.images.filter((i) => i.color === color);
    return mine.length ? [...mine, ...p.images.filter((i) => i.color !== color && !i.color)] : p.images;
  }, [p, color]);

  useSeo({
    title: p ? tr(p.seoTitle) || tr(p.name) : undefined,
    description: p ? tr(p.seoDesc) || tr(p.description) : undefined,
    image: p?.image ? img(p.image.url) : undefined,
  });

  if (error?.status === 404) return <NotFound />;
  if (error) return <div className="container"><ErrorState error={error} onRetry={reload} /></div>;
  if (loading || !p) return <div className="container"><Loading /></div>;

  const main = p.categories.find((c) => !['new-arrivals', 'sale'].includes(c.slug));
  const sections = [
    ['pdp.description', tr(p.description)],
    ['pdp.fabricCare', [tr(p.fabric), tr(p.care)].filter(Boolean).join('\n\n')],
    ['pdp.fitLength', [tr(p.fit), tr(p.lengthInfo)].filter(Boolean).join('\n\n')],
    ['pdp.shippingReturns', t('pdp.shippingText')],
  ].filter(([, v]) => v);

  return (
    <div className="container pdp">
      <StructuredData p={p} tr={tr} />
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">{t('common.home')}</Link> / {main && <><Link to={`/collections/${main.slug}`}>{tr(main.name)}</Link> / </>}
        <span aria-current="page">{tr(p.name)}</span>
      </nav>

      <div className="pdp__layout">
        <Gallery images={images} name={tr(p.name)} />
        <div className="pdp__info">
          <div className="card__badges card__badges--static">
            {p.onSale && <span className="tag tag--sale">{t('card.sale')}</span>}
            {p.isNew && <span className="tag">{t('card.new')}</span>}
          </div>
          <h1>{tr(p.name)}</h1>
          <VariantPicker product={p} color={color} onColorChange={setColor} />
          <div className="accordion">
            {sections.map(([k, v], i) => (
              <details key={k} open={i === 0}>
                <summary>{t(k)}</summary>
                {v.split('\n\n').map((para) => <p key={para}>{para}</p>)}
              </details>
            ))}
          </div>
        </div>
      </div>

      {p.related.length > 0 && (
        <section className="section">
          <div className="section__head"><h2>{t('pdp.related')}</h2></div>
          <div className="grid grid--4">{p.related.map((r) => <ProductCard key={r.id} product={r} />)}</div>
        </section>
      )}
    </div>
  );
}
