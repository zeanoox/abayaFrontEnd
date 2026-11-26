import { Link } from 'react-router-dom';
import { img } from '../api.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { TrashIcon } from './Icons.jsx';
import { Price } from './ui.jsx';

export function variantText(line, tr) {
  const v = line.variant;
  return [v.size && v.size !== 'OS' ? v.size : null, v.color ? tr(v.color.name) : null, v.length ? `${v.length}″` : null]
    .filter(Boolean).join(' · ');
}

export default function CartLines({ lines, onError, readOnly = false }) {
  const { t, tr } = useI18n();
  const cart = useCart();
  const act = (p) => p.catch((err) => onError?.(err));

  return (
    <ul className="lines">
      {lines.map((l) => (
        <li key={l.id} className={`line ${l.issue ? 'has-issue' : ''}`}>
          <Link to={`/products/${l.product.slug}`} className="line__thumb">
            {l.image && <img src={img(l.image)} alt="" width="90" height="120" loading="lazy" />}
          </Link>
          <div className="line__info">
            <Link to={`/products/${l.product.slug}`} className="line__name">{tr(l.product.name)}</Link>
            <span className="muted">{variantText(l, tr)}</span>
            <Price price={l.compareAt ?? l.unitPrice} salePrice={l.compareAt != null ? l.unitPrice : null} />
            {l.issue && <span className="line__issue" role="alert">{t(`cart.issue.${l.issue}`, { n: l.available })}</span>}
            {!readOnly && (
              <div className="line__actions">
                <div className="qty qty--sm" role="group" aria-label={t('pdp.qty')}>
                  <button onClick={() => act(cart.setQty(l.id, l.quantity - 1))} aria-label={t('cart.dec')}>−</button>
                  <span>{l.quantity}</span>
                  <button onClick={() => act(cart.setQty(l.id, l.quantity + 1))} aria-label={t('cart.inc')}
                    disabled={l.quantity >= l.available}>+</button>
                </div>
                <button className="link-btn" onClick={() => act(cart.remove(l.id))} aria-label={`${t('cart.remove')}: ${tr(l.product.name)}`}>
                  <TrashIcon /> <span className="hide-sm">{t('cart.remove')}</span>
                </button>
              </div>
            )}
            {readOnly && <span className="muted">× {l.quantity}</span>}
          </div>
          <strong className="line__total">{/* line total */}<Price price={l.lineTotal} /></strong>
        </li>
      ))}
    </ul>
  );
}
