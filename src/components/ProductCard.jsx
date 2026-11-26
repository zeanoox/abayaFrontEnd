import { useState } from 'react';
import AbayaArt from './AbayaArt.jsx';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../data/products.js';

export default function ProductCard({ product }) {
  const { add } = useCart();
  const [imgOk, setImgOk] = useState(Boolean(product.image));

  return (
    <article className={`card ${product.soldOut ? 'is-soldout' : ''}`}>
      <div className="card__frame">
      <a href="#" className="card__media" style={{ background: product.accent }} onClick={(e) => e.preventDefault()}>
        {product.soldOut && <span className="badge-soldout">نفدت الكمية</span>}
        {imgOk ? (
          <img src={product.image} alt={product.name} onError={() => setImgOk(false)} />
        ) : (
          <AbayaArt color={product.color} accent={product.accent} type={product.type} embroidery={product.embroidery} />
        )}
      </a>
      {!product.soldOut && (
        <button className="card__add" onClick={() => add(product)} aria-label={`أضيفي ${product.name} للسلة`}>
          + أضيفي للسلة
        </button>
      )}
      </div>
      <div className="card__body">
        <h3>{product.name}</h3>
        <p className="price">{formatPrice(product.price)}</p>
      </div>
    </article>
  );
}
