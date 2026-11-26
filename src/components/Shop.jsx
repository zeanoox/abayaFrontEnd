import { useEffect, useState } from 'react';
import ProductCard from './ProductCard.jsx';
import { fetchCategories, fetchProducts } from '../api.js';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchProducts().then(setProducts);
    fetchCategories().then(setCategories);
  }, []);

  const latest = products.filter((p) => p.isNew);
  const shown = filter === 'all' ? products : products.filter((p) => p.category === filter);

  return (
    <>
      <section className="section">
        <div className="container">
          <div className="section__head">
            <h2>أحدث التصاميم</h2>
            <a href="#shop" className="link">عرض الكل</a>
          </div>
          <div className="grid grid--5">
            {latest.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      <section className="section section--tint" id="categories">
        <div className="container">
          <div className="section__head section__head--center">
            <h2>تسوقي حسب الفئة</h2>
          </div>
          <div className="cats">
            {categories.map((c) => (
              <a href="#shop" key={c.id} className="cat" onClick={() => setFilter(c.id)}>
                <span className="cat__arch" />
                <strong>{c.name}</strong>
                <small>{c.desc}</small>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="shop">
        <div className="container">
          <div className="section__head">
            <h2>المتجر</h2>
            <div className="chips" role="tablist">
              <button className={`chip ${filter === 'all' ? 'is-active' : ''}`} onClick={() => setFilter('all')}>الكل</button>
              {categories.map((c) => (
                <button key={c.id} className={`chip ${filter === c.id ? 'is-active' : ''}`} onClick={() => setFilter(c.id)}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid--4">
            {shown.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>
    </>
  );
}
