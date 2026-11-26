import { useState } from 'react';
import AbayaArt from './AbayaArt.jsx';
import { HeartIcon } from './Icons.jsx';
import { useCart } from '../context/CartContext.jsx';
import { CURRENCY } from '../data/products.js';

export default function ProductCard({ product }) {
  const { add, wishlist, toggleWish } = useCart();
  const [imgOk, setImgOk] = useState(Boolean(product.image));
  const liked = wishlist.includes(product.id);

  return (
    <article className="card">
      <div className="card__media" style={{ background: product.accent }}>
        {product.isNew && <span className="tag">جديد</span>}
        <button
          className={`card__wish ${liked ? 'is-liked' : ''}`}
          onClick={() => toggleWish(product.id)}
          aria-label={liked ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
        >
          <HeartIcon filled={liked} width={18} height={18} />
        </button>
        {imgOk ? (
          <img src={product.image} alt={product.name} onError={() => setImgOk(false)} />
        ) : (
          <AbayaArt color={product.color} accent={product.accent} type={product.type} embroidery={product.id % 3 === 1} />
        )}
        <button className="card__add" onClick={() => add(product)}>أضيفي للسلة</button>
      </div>
      <div className="card__body">
        <h3>{product.name}</h3>
        <p className="price">
          {product.price} {CURRENCY}
          {product.oldPrice && <del>{product.oldPrice} {CURRENCY}</del>}
        </p>
      </div>
    </article>
  );
}
