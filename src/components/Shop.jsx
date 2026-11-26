import { useEffect, useState } from 'react';
import ProductCard from './ProductCard.jsx';
import { fetchProducts } from '../api.js';
import { useI18n } from '../i18n/I18nContext.jsx';

function Collection({ id, title, items, viewAll, cols = 4 }) {
  const { t } = useI18n();
  if (!items.length) return null;
  return (
    <section className="collection" id={id}>
      <div className="container">
        <div className="collection__head">
          <h2>{title}</h2>
          {viewAll && <a href={`#${id}`} className="view-all">{t('col.viewAll')}</a>}
        </div>
        <div className={`grid grid--${cols}`}>
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}

export default function Shop() {
  const { t } = useI18n();
  const [products, setProducts] = useState([]);
  useEffect(() => { fetchProducts().then(setProducts); }, []);
  const by = (c) => products.filter((p) => p.category === c);

  return (
    <>
      <section className="intro" id="new">
        <div className="container intro__inner">
          <h2>{t('intro.title')}</h2>
          <p>{t('intro.p1')}</p>
          <p>{t('intro.p2')}</p>
        </div>
      </section>
      <Collection id="colored" title={t('col.colored')} items={by('colored')} cols={5} />
      <Collection id="daily" title={t('col.daily')} items={by('daily')} cols={4} />
      <Collection id="hijab" title={t('col.hijab')} items={by('hijab')} cols={6} viewAll />
    </>
  );
}
