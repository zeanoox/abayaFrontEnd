import { useState } from 'react';
import { Link } from 'react-router-dom';
import { img } from '../api.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { EyeIcon, HeartIcon } from './Icons.jsx';
import { Price } from './ui.jsx';
import QuickView from './QuickView.jsx';

export default function ProductCard({ product, eager = false }) {
  const { t, tr } = useI18n();
  const wish = useWishlist();
  const [quick, setQuick] = useState(false);
  const [color, setColor] = useState(null);
  const liked = wish.has(product.slug);
  const name = tr(product.name);

  // Hovering a swatch previews that colour's image.
  const colorImg = color && product.images?.find((i) => i.color === color);
  const main = colorImg || product.image;
  const hover = !colorImg && product.hoverImage;

  return (
    <article className={`card ${product.inStock ? '' : 'is-soldout'}`}>
      <div className="card__frame">
        <Link to={`/products/${product.slug}`} className="card__media" aria-label={name}>
          {main && (
            <img src={img(main.url)} alt={tr(main.alt) || name} width="600" height="800"
              loading={eager ? 'eager' : 'lazy'} decoding="async" />
          )}
          {hover && <img className="card__hover" src={img(hover.url)} alt="" width="600" height="800" loading="lazy" decoding="async" aria-hidden="true" />}
        </Link>
        <div className="card__badges">
          {!product.inStock && <span className="tag tag--dark">{t('card.soldOut')}</span>}
          {product.inStock && product.onSale && <span className="tag tag--sale">{t('card.sale')}</span>}
          {product.inStock && product.isNew && <span className="tag">{t('card.new')}</span>}
        </div>
        <button className={`card__wish ${liked ? 'is-liked' : ''}`} onClick={() => wish.toggle(product)}
          aria-pressed={liked} aria-label={`${liked ? t('card.removeWish') : t('card.addWish')}: ${name}`}>
          <HeartIcon filled={liked} width={18} height={18} />
        </button>
        <button className="card__quick" onClick={() => setQuick(true)} aria-label={`${t('card.quickView')}: ${name}`}>
          <EyeIcon /> {t('card.quickView')}
        </button>
      </div>
      <div className="card__body">
        <h3><Link to={`/products/${product.slug}`}>{name}</Link></h3>
        <Price price={product.price} salePrice={product.salePrice} />
        {product.colors?.length > 1 && (
          <ul className="swatches swatches--sm" aria-label={t('card.colors', { n: product.colors.length })}>
            {product.colors.map((c) => (
              <li key={c.code}>
                <span className={`swatch ${c.inStock ? '' : 'is-out'}`} style={{ '--c': c.hex }} title={tr(c.name)}
                  onMouseEnter={() => setColor(c.code)} onMouseLeave={() => setColor(null)} />
              </li>
            ))}
          </ul>
        )}
      </div>
      {quick && <QuickView slug={product.slug} onClose={() => setQuick(false)} />}
    </article>
  );
}
