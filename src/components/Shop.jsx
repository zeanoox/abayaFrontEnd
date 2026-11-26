import { useEffect, useState } from 'react';
import ProductCard from './ProductCard.jsx';
import { fetchProducts } from '../api.js';

function Collection({ id, title, items, viewAll, cols = 4 }) {
  if (!items.length) return null;
  return (
    <section className="collection" id={id}>
      <div className="container">
        <div className="collection__head">
          <h2>{title}</h2>
          {viewAll && <a href={`#${id}`} className="view-all">عرض الكل</a>}
        </div>
        <div className={`grid grid--${cols}`}>
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}

export default function Shop() {
  const [products, setProducts] = useState([]);
  useEffect(() => { fetchProducts().then(setProducts); }, []);
  const by = (c) => products.filter((p) => p.category === c);

  return (
    <>
      <section className="intro" id="new">
        <div className="container intro__inner">
          <h2>وصل حديثاً</h2>
          <p>
            في لوريم نصمم كل قطعة بخطوط نقية وتفاصيل مدروسة، لامرأة تبحث عن أناقة هادئة تدوم.
          </p>
          <p>تشكيلات يومية وملوّنة بأقمشة مريحة، تجمع بين الحشمة واللمسة العصرية.</p>
        </div>
      </section>
      <Collection id="colored" title="عبايات ملوّنة" items={by('colored')} cols={5} />
      <Collection id="daily" title="عبايات يومية" items={by('daily')} cols={4} />
      <Collection id="hijab" title="الطرح" items={by('hijab')} cols={6} viewAll />
    </>
  );
}
