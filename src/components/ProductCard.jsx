import { useState } from 'react';
import AbayaArt from './AbayaArt.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { formatPrice } from '../data/products.js';

export default function ProductCard({ product }) {
  const { add } = useCart();
  const { t, tr } = useI18n();
  const [imgOk, setImgOk] = useState(Boolean(product.image));
  const name = tr(product.name);

  return (
    <article className={`card ${product.soldOut ? 'is-soldout' : ''}`}>
      <div className="card__frame">
        <a href="#" className="card__media" style={{ background: product.accent }} onClick={(e) => e.preventDefault()}>
          {product.soldOut && <span className="badge-soldout">{t('card.soldOut')}</span>}
          {imgOk ? (
            <img src={product.image} alt={name} onError={() => setImgOk(false)} />
          ) : (
            <AbayaArt color={product.color} accent={product.accent} type={product.type} embroidery={product.embroidery} />
          )}
        </a>
        {!product.soldOut && (
          <button className="card__add" onClick={() => add(product)} aria-label={`${t('card.add')}: ${name}`}>
            {t('card.add')}
          </button>
        )}
      </div>
      <div className="card__body">
        <h3>{name}</h3>
        <p className="price">{formatPrice(product.price)}</p>
      </div>
    </article>
  );
}
