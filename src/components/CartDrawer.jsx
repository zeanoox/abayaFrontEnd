import AbayaArt from './AbayaArt.jsx';
import { CloseIcon } from './Icons.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { formatPrice } from '../data/products.js';

export default function CartDrawer() {
  const { items, open, setOpen, setQty, total } = useCart();
  const { t, tr } = useI18n();

  return (
    <>
      <div className={`overlay ${open ? 'is-open' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`drawer ${open ? 'is-open' : ''}`} aria-label={t('cart.title')} aria-hidden={!open}>
        <div className="drawer__head">
          <h3>{t('cart.title')}</h3>
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label={t('cart.close')}><CloseIcon /></button>
        </div>

        {items.length === 0 ? (
          <p className="drawer__empty">{t('cart.empty')}</p>
        ) : (
          <ul className="drawer__list">
            {items.map((i) => (
              <li key={i.id} className="line">
                <div className="line__thumb" style={{ background: i.accent }}>
                  <AbayaArt color={i.color} accent={i.accent} type={i.type} />
                </div>
                <div className="line__info">
                  <strong>{tr(i.name)}</strong>
                  <span className="price">{formatPrice(i.price)}</span>
                  <div className="qty">
                    <button onClick={() => setQty(i.id, i.qty - 1)} aria-label={t('cart.dec')}>−</button>
                    <span>{i.qty}</span>
                    <button onClick={() => setQty(i.id, i.qty + 1)} aria-label={t('cart.inc')}>+</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="drawer__foot">
          <div className="drawer__total"><span>{t('cart.total')}</span><strong className="price">{formatPrice(total)}</strong></div>
          <button className="btn btn--solid" disabled={!items.length}>{t('cart.checkout')}</button>
        </div>
      </aside>
    </>
  );
}
